'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Globe, Bot, TrendingUp, Loader2, BarChart3, Download } from 'lucide-react'

const ENGINE_DISPLAY: Record<string, string> = {
  perplexity: 'Perplexity', chatgpt: 'ChatGPT', gemini: 'Gemini', grok: 'Grok', claude: 'Claude',
}

const ENGINE_COLORS: Record<string, string> = {
  perplexity: '#8b5cf6', chatgpt: '#10b981', gemini: '#3b82f6',
  grok: '#f59e0b', claude: '#ec4899',
}

export default function AnalyticsPage() {
  const supabase = createClient()
  const [brand, setBrand] = useState<any>(null)
  const [mentions, setMentions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Load brand once on mount
  useEffect(() => {
    async function loadBrand() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data: b } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
      setBrand(b)
      setLoading(false)
    }
    loadBrand()
  }, [])

  // Reload mentions when brand or range changes
  useEffect(() => {
    if (!brand) return
    async function loadMentions() {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
      const since = new Date(Date.now() - days * 86400000).toISOString()
      const { data: m } = await supabase.from('mentions').select('*')
        .eq('brand_id', brand.id).gte('scraped_at', since).order('scraped_at', { ascending: true })
      setMentions(m || [])
    }
    loadMentions()
  }, [brand, range])

  // Engine breakdown
  const byEngine = Object.entries(
    mentions.reduce((acc: any, m) => {
      if (!acc[m.engine]) acc[m.engine] = { total: 0, mentioned: 0, scores: [] }
      acc[m.engine].total++
      if (m.mentioned) acc[m.engine].mentioned++
      if (m.score != null) acc[m.engine].scores.push(m.score)
      return acc
    }, {})
  ).map(([engine, d]: any) => ({
    engine, total: d.total, mentioned: d.mentioned,
    rate: Math.round((d.mentioned / d.total) * 100),
    avgScore: d.scores.length ? Math.round(d.scores.reduce((a: number, b: number) => a + b) / d.scores.length) : 0,
  })).sort((a, b) => b.rate - a.rate)

  // Daily chart data
  const byDay = mentions.reduce((acc: any, m) => {
    const day = m.scraped_at.slice(0, 10)
    if (!acc[day]) acc[day] = { total: 0, mentioned: 0 }
    acc[day].total++
    if (m.mentioned) acc[day].mentioned++
    return acc
  }, {})
  const days = Object.entries(byDay).slice(-14) as [string, { total: number; mentioned: number }][]
  const maxTotal = Math.max(...days.map(([, d]) => d.total), 1)

  // Overall stats
  const totalMentioned = mentions.filter(m => m.mentioned).length
  const mentionRate = mentions.length ? Math.round((totalMentioned / mentions.length) * 100) : 0
  const allScores = mentions.filter(m => m.score != null).map(m => m.score)
  const avgScore = allScores.length ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length) : 0

  // Sentiment
  const sentiments = mentions.filter(m => m.mentioned && m.sentiment).reduce((acc: any, m) => {
    acc[m.sentiment] = (acc[m.sentiment] || 0) + 1; return acc
  }, {})
  const sentTotal = Object.values(sentiments).reduce((a: any, b: any) => a + b, 0) as number

  // Week-over-week trend (last 7d vs previous 7d)
  const nowMs = Date.now()
  const last7dMentions = mentions.filter(m => new Date(m.scraped_at).getTime() > nowMs - 7 * 86400000)
  const prev7dMentions = mentions.filter(m => {
    const t = new Date(m.scraped_at).getTime()
    return t > nowMs - 14 * 86400000 && t <= nowMs - 7 * 86400000
  })
  const last7Rate = last7dMentions.length > 0 ? Math.round((last7dMentions.filter(m => m.mentioned).length / last7dMentions.length) * 100) : null
  const prev7Rate = prev7dMentions.length > 0 ? Math.round((prev7dMentions.filter(m => m.mentioned).length / prev7dMentions.length) * 100) : null
  const trend = last7Rate !== null && prev7Rate !== null ? last7Rate - prev7Rate : null

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-white/40">{brand ? `AI visibility trends for ${brand.domain}` : 'Add a brand to see analytics'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.04] p-1 gap-1">
            {(['7d', '30d', '90d'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${range === r ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
                {r}
              </button>
            ))}
          </div>
          {brand && mentions.length > 0 && (
            <a
              href={`/api/export/mentions?brandId=${brand.id}&days=${range === '7d' ? 7 : range === '30d' ? 30 : 90}`}
              download
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/50 hover:text-white hover:border-white/20 transition-colors"
            >
              <Download size={12} /> Export CSV
            </a>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total queries', value: mentions.length || '—', icon: Globe },
          { label: 'Mention rate', value: mentions.length ? `${mentionRate}%` : '—', icon: TrendingUp,
            color: mentionRate >= 50 ? 'text-emerald-400' : mentionRate >= 25 ? 'text-yellow-400' : mentions.length ? 'text-red-400' : 'text-white',
            sub: trend !== null ? `${trend >= 0 ? '+' : ''}${trend}% vs prev week` : undefined },
          { label: 'Avg score', value: avgScore || '—', icon: BarChart3 },
          { label: 'Engines', value: byEngine.length || '—', icon: Bot },
        ].map(({ label, value, icon: Icon, color, sub }: any) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 mb-2"><Icon size={13} className="text-white/30" /><p className="text-xs text-white/30">{label}</p></div>
            <p className={`text-2xl font-black ${color || 'text-white'}`}>{value}</p>
            {sub && <p className={`text-[10px] mt-0.5 ${(sub as string).startsWith('+') ? 'text-emerald-400' : (sub as string).startsWith('-') ? 'text-red-400' : 'text-white/30'}`}>{sub as string}</p>}
          </div>
        ))}
      </div>

      {mentions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
          <BarChart3 size={32} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-1">No data yet for this period</p>
          <p className="text-xs text-white/20 mb-4">Run a scan from the AI Visibility page to start collecting data</p>
          <a href="/dashboard/visibility" className="text-sm text-violet-400 hover:text-violet-300">Go to AI Visibility →</a>
        </div>
      ) : (
        <>
          {/* Daily chart */}
          {days.length > 0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="text-sm font-semibold text-white mb-4">Daily activity</p>
              <div className="flex items-end gap-1 h-24">
                {days.map(([day, data]) => (
                  <div key={day} title={`${day}: ${data.mentioned}/${data.total}`} className="flex-1 flex flex-col justify-end group relative">
                    <div className="w-full rounded-t bg-white/[0.07]" style={{ height: `${(data.total / maxTotal) * 88}px` }}>
                      <div className="w-full rounded-t bg-violet-500/60 absolute bottom-0 left-0" style={{ height: `${(data.mentioned / maxTotal) * 88}px` }} />
                    </div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1a1a1b] border border-white/[0.10] rounded px-2 py-1 text-[10px] text-white/70 whitespace-nowrap z-10">
                      {day.slice(5)}: {data.mentioned}/{data.total}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5"><div className="h-2 w-3 rounded bg-violet-500/60" /><span className="text-[10px] text-white/30">Mentioned</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-3 rounded bg-white/[0.07]" /><span className="text-[10px] text-white/30">Total queries</span></div>
              </div>
            </div>
          )}

          {/* Engine breakdown */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="border-b border-white/[0.07] px-5 py-3">
              <p className="text-sm font-semibold text-white">Performance by engine</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {byEngine.map(({ engine, total, mentioned, rate, avgScore }) => (
                <div key={engine} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: ENGINE_COLORS[engine] || '#666', opacity: 0.8 }} />
                  <div className="w-24 text-sm font-medium text-white/70 capitalize">{engine}</div>
                  <div className="flex-1">
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${rate}%`, background: ENGINE_COLORS[engine] || '#8b5cf6', opacity: 0.7 }} />
                    </div>
                  </div>
                  <span className={`text-sm font-black w-10 text-right ${rate >= 50 ? 'text-emerald-400' : rate >= 25 ? 'text-yellow-400' : 'text-white/40'}`}>{rate}%</span>
                  <span className="text-[10px] text-white/20 w-12 text-right">{mentioned}/{total}</span>
                  <span className="text-xs text-white/30 w-8 text-right">{avgScore}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment */}
          {sentTotal > 0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="text-sm font-semibold text-white mb-4">Sentiment when mentioned</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'positive', label: 'Positive', bar: 'bg-emerald-400', text: 'text-emerald-400' },
                  { key: 'neutral',  label: 'Neutral',  bar: 'bg-white/30',    text: 'text-white/50' },
                  { key: 'negative', label: 'Negative', bar: 'bg-red-400',     text: 'text-red-400' },
                ].map(({ key, label, bar, text }) => {
                  const count = sentiments[key] || 0
                  const pct = sentTotal ? Math.round((count / sentTotal) * 100) : 0
                  return (
                    <div key={key} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
                      <div className={`h-1 w-8 rounded-full mx-auto mb-3 ${bar}`} />
                      <p className={`text-2xl font-black ${text}`}>{pct}%</p>
                      <p className="text-xs text-white/30 mt-1">{label}</p>
                      <p className="text-[10px] text-white/20">{count} mentions</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top queries */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="border-b border-white/[0.07] px-5 py-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Top performing queries</p>
              <span className="text-xs text-white/30">{mentions.filter(m => m.mentioned && m.score).length} with scores</span>
            </div>
            {mentions.filter(m => m.mentioned && m.score).length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-white/20">
                No scored mentions yet — run a scan to populate this
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {mentions.filter(m => m.mentioned && m.score)
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 10)
                  .map((m, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3">
                      <span className="text-xs text-white/20 w-5 shrink-0">{i + 1}</span>
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ background: ENGINE_COLORS[m.engine] || '#666' }} />
                      <p className="flex-1 text-xs text-white/60 truncate">{m.prompt}</p>
                      <span className="text-[10px] capitalize text-white/30 shrink-0 w-16 text-right">{m.engine}</span>
                      <span className={`text-sm font-black shrink-0 w-8 text-right ${m.score >= 70 ? 'text-emerald-400' : m.score >= 40 ? 'text-yellow-400' : 'text-white/40'}`}>{m.score}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
