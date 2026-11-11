import Mux from '@mux/mux-node'
import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getUserPlan, isUnlimited } from '@/lib/plan-limits'

export function muxConfigured() {
  const id = process.env.MUX_TOKEN_ID, secret = process.env.MUX_TOKEN_SECRET
  return !!(id && secret && !id.includes('REPLACE') && !secret.includes('REPLACE') && id.length > 5)
}

export function muxClient() {
  return new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET, webhookSecret: process.env.MUX_WEBHOOK_SECRET })
}

/** Mux auto-generates English captions; the transcript drives moment selection. */
export const AUTO_SUBTITLES = [{ language_code: 'en' as const, name: 'English (auto)' }]

/** Remaining AI clips this month for the user (counts generated clips across all brands). */
export async function clipQuota(db: SupabaseClient, userId: string): Promise<{ remaining: number; error?: string }> {
  const { plan } = await getUserPlan(userId)
  if (isUnlimited(plan.limits.clips)) return { remaining: Infinity }
  if (plan.limits.clips === 0) return { remaining: 0, error: `Clips are not available on the ${plan.name} plan. Upgrade to Growth to create clips.` }
  const since = new Date(); since.setDate(1); since.setHours(0, 0, 0, 0)
  const { data: brands } = await db.from('brands').select('id').eq('user_id', userId)
  const { count } = await db.from('clips').select('*', { count: 'exact', head: true })
    .in('brand_id', (brands || []).map(b => b.id)).eq('kind', 'clip').gte('created_at', since.toISOString())
  const remaining = plan.limits.clips - (count || 0)
  return remaining > 0 ? { remaining } : { remaining: 0, error: `Monthly clip limit reached (${plan.limits.clips}/mo on the ${plan.name} plan).` }
}

export interface Cue { start: number; end: number; text: string }

function ts(t: string) {
  const p = t.trim().split(':').map(Number)
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]
}

export function parseVtt(vtt: string): Cue[] {
  const cues: Cue[] = []
  for (const block of vtt.replace(/\r/g, '').split(/\n\n+/)) {
    const lines = block.split('\n')
    const i = lines.findIndex(l => l.includes('-->'))
    if (i < 0) continue
    const [a, b] = lines[i].split('-->')
    const text = lines.slice(i + 1).join(' ').replace(/<[^>]+>/g, '').trim()
    if (text) cues.push({ start: ts(a), end: ts(b.trim().split(/\s+/)[0]), text })
  }
  return cues
}

function fmt(t: number, sep: '.' | ',') {
  const ms = Math.max(0, Math.round(t * 1000))
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${sep}${String(ms % 1000).padStart(3, '0')}`
}

/** Captions for [start, end] of the source, re-timed to start at 0. */
export function sliceVtt(cues: Cue[], start: number, end: number) {
  const body = cues.filter(c => c.end > start && c.start < end)
    .map(c => `${fmt(Math.max(c.start, start) - start, '.')} --> ${fmt(Math.min(c.end, end) - start, '.')}\n${c.text}`)
  return `WEBVTT\n\n${body.join('\n\n')}\n`
}

export function vttToSrt(vtt: string) {
  return parseVtt(vtt).map((c, i) => `${i + 1}\n${fmt(c.start, ',')} --> ${fmt(c.end, ',')}\n${c.text}`).join('\n\n') + '\n'
}

export interface Moment { start: number; end: number; title: string; hook: string }

/** Claude picks self-contained, high-engagement moments; result is validated and snapped to cue boundaries. */
export async function pickMoments(cues: Cue[], videoTitle: string, brandName: string, count: number, duration: number): Promise<Moment[]> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key || key.includes('REPLACE') || key.length < 20) throw new Error('AI moment selection is not connected (Anthropic API key missing)')
  const transcript = cues.map(c => `[${c.start.toFixed(1)}-${c.end.toFixed(1)}] ${c.text}`).join('\n').slice(0, 120_000)
  const client = new Anthropic({ apiKey: key })
  const msg = await client.messages.create({
    model: process.env.ANTHROPIC_AGENT_MODEL || 'claude-sonnet-4-5',
    max_tokens: 2000,
    messages: [{ role: 'user', content: `You are a short-form video editor. From this timestamped transcript of "${videoTitle}" (${brandName}), choose up to ${count} non-overlapping moments that work as standalone short clips (TikTok/Reels/Shorts): a strong opening line, one clear idea, a satisfying end. Each must be 15-90 seconds and start/end on the transcript timestamps.

${transcript}

Return ONLY a JSON array: [{"start": <seconds>, "end": <seconds>, "title": "<clip title, max 70 chars>", "hook": "<one-line social caption>"}]` }],
  })
  const text = msg.content.filter(b => b.type === 'text').map(b => (b as any).text).join('')
  const raw = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1)) as Moment[]
  const snapStart = (t: number) => cues.reduce((best, c) => Math.abs(c.start - t) < Math.abs(best - t) ? c.start : best, t)
  const snapEnd = (t: number) => cues.reduce((best, c) => Math.abs(c.end - t) < Math.abs(best - t) ? c.end : best, t)
  const out: Moment[] = []
  for (const m of raw) {
    const start = Math.max(0, snapStart(Number(m.start)))
    const end = Math.min(duration || Infinity, snapEnd(Number(m.end)))
    if (!(end - start >= 10 && end - start <= 120)) continue
    if (out.some(o => start < o.end && end > o.start)) continue
    out.push({ start, end, title: String(m.title || 'Clip').slice(0, 120), hook: String(m.hook || '').slice(0, 300) })
    if (out.length >= count) break
  }
  return out
}
