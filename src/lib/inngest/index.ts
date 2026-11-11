import { Inngest } from 'inngest'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { runBrandScan } from '@/lib/scan'
import { Engine } from '@/lib/scraper'
import { muxClient, parseVtt, pickMoments, sliceVtt, clipQuota } from '@/lib/clips'

export const inngest = new Inngest({ id: 'clouts' })

// Daily scheduled scans run from Vercel Cron (/api/cron/scan); this event
// lets other jobs request an out-of-band scan for one brand.
export const scrapeBrand = inngest.createFunction(
  { id: 'scrape-brand', retries: 2, concurrency: { limit: 3 } },
  { event: 'brand/scrape' },
  async ({ event, step }) => {
    const { brandId, engines } = event.data
    return step.run('scan', async () => {
      const db = createAdminClient()
      const { data: brand } = await db.from('brands').select('id, name, domain, keywords, competitors').eq('id', brandId).single()
      if (!brand) return { error: 'brand not found' }
      const { results, failures } = await runBrandScan(db, brand, engines as Engine[], 'scheduled')
      return { saved: results.length, failures }
    })
  }
)

// Transcript ready → Claude picks moments → Mux cuts each one into its own asset.
export const findClipMoments = inngest.createFunction(
  { id: 'find-clip-moments', retries: 2, concurrency: { limit: 2 } },
  { event: 'clips/transcript.ready' },
  async ({ event, step }) => {
    const db = createAdminClient()
    const fail = (error: string) => db.from('clips').update({ status: 'failed', error }).eq('id', event.data.clipId)

    const source = await step.run('load', async () => {
      const { data } = await db.from('clips')
        .select('id, title, brand_id, mux_asset_id, mux_playback_id, transcript_track_id, duration_sec, brands(user_id, name)')
        .eq('id', event.data.clipId).single()
      return data as any
    })
    if (!source?.mux_playback_id || !source.transcript_track_id) { await fail('Transcript not available'); return { error: 'no transcript' } }

    const vtt = await step.run('transcript', async () => {
      const res = await fetch(`https://stream.mux.com/${source.mux_playback_id}/text/${source.transcript_track_id}.vtt`)
      if (!res.ok) throw new Error(`Transcript fetch failed: ${res.status}`)
      return res.text()
    })
    const cues = parseVtt(vtt)
    if (cues.length === 0) { await fail('No speech detected in the video'); return { error: 'empty transcript' } }

    const { remaining } = await step.run('quota', () => clipQuota(db, source.brands.user_id))
    if (!remaining || remaining <= 0) { await fail('Monthly clip limit reached'); return { error: 'quota' } }

    let moments
    try {
      moments = await step.run('pick-moments', () =>
        pickMoments(cues, source.title, source.brands.name, Math.min(5, remaining), source.duration_sec || 0))
    } catch (e) {
      await fail(e instanceof Error ? e.message : 'Moment selection failed')
      return { error: 'pick failed' }
    }
    if (moments.length === 0) { await fail('No clip-worthy moments found'); return { error: 'no moments' } }

    const created = await step.run('cut', async () => {
      const mux = muxClient()
      const ids: string[] = []
      for (const m of moments) {
        const { data: row } = await db.from('clips').insert({
          brand_id: source.brand_id, parent_id: source.id, kind: 'clip', status: 'processing',
          title: m.title, description: m.hook, start_sec: Math.floor(m.start), end_sec: Math.ceil(m.end),
          duration_sec: Math.round(m.end - m.start), captions_vtt: sliceVtt(cues, m.start, m.end), has_captions: true,
        }).select('id').single()
        if (!row) continue
        try {
          const asset = await mux.video.assets.create({
            input: [{ url: `mux://assets/${source.mux_asset_id}`, start_time: m.start, end_time: m.end }],
            playback_policy: ['public'], mp4_support: 'capped-1080p', passthrough: row.id,
          })
          await db.from('clips').update({ mux_asset_id: asset.id, mux_playback_id: asset.playback_ids?.[0]?.id }).eq('id', row.id)
          ids.push(row.id)
        } catch (e) {
          await db.from('clips').update({ status: 'failed', error: e instanceof Error ? e.message : 'Cut failed' }).eq('id', row.id)
        }
      }
      return ids
    })

    await db.from('clips').update({ status: 'clipped', error: null }).eq('id', source.id)
    return { clips: created.length }
  }
)

// Weekly report: every Monday at 9am ET
export const weeklyReport = inngest.createFunction(
  { id: 'weekly-report' },
  { cron: 'TZ=America/New_York 0 9 * * 1' },
  async ({ step }) => {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    const { data: brands } = await supabase
      .from('brands')
      .select('id, name, user_id, users(email, notif_weekly_report)')
      .not('keywords', 'eq', '{}')

    if (!brands?.length) return { sent: 0 }

    let sent = 0
    for (const b of brands) {
      const email = (b.users as any)?.email
      const optedOut = (b.users as any)?.notif_weekly_report === false
      if (!email || optedOut) continue
      await step.run(`send-report-${b.id}`, async () => {
        const appUrl2 = process.env.NEXT_PUBLIC_APP_URL || 'https://www.clouts.com'
        const res = await fetch(`${appUrl2}/api/email/weekly-report`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INNGEST_EVENT_KEY || ''}`,
          },
          body: JSON.stringify({ brandId: b.id, email, brandName: b.name, userId: b.user_id }),
        })
        if (!res.ok) {
          // fetch() only throws on network failure, not on a non-2xx
          // response - without this check, a failed send (e.g. the email
          // provider rejecting it) would resolve normally and silently
          // count toward `sent` below, with no retry and no record that
          // this brand's weekly report never actually went out.
          throw new Error(`Failed to send weekly report for brand ${b.id}: HTTP ${res.status}`)
        }
        sent++
      })
    }
    return { sent }
  }
)

export const functions = [scrapeBrand, weeklyReport, findClipMoments]
