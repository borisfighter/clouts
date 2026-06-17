'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, BarChart3, Globe, Bot, TrendingUp, Loader2, Calendar } from 'lucide-react'

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

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const { data: b } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
      setBrand(b)
      if (b) {
        const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
        const since = new Date(Date.now() - days * 86400000).toISOString()
        const { data: m } = await supabase.from('mentions').select('*')
          .eq('brand_id', b.id).gte('scraped_at', since).order('scraped_at', { ascending: true })
        setMentions(m || [])
      }
      setLoading(false)
    }
    load()
  }, [range])

  // Aggregate by engine
  const byEngine = Object.entries(
    mentions.reduce((acc: any, m) => {
      if (!acc[m.engine]) acc[m.engine] = { total: 0, mentioned: 0, scores: [] }
      acc[m.engine].total++
      if (m.mentioned) acc[m.engine].mentioned++
      if (m.score) acc[m.engine].scores.push(m.score)
      return acc
    }, {})
  ).map(([engine, data]: [string, any]) => ({
    engine,
    total: data.total,
    mentioned: data.mentioned,
    rate: Math.round((data.mentioned / data.total) * 100),
    avgScore: data.scores.length ? Math.round(data.scores.reduce((a: number, b: number) => a + b) / data.scores.length) : 0,
  })).sort((a, b) => b.rate - a.rate)

  // Daily breakdown
  const byDay = mentions.reduce((acc: any, m) => {
    const day = m.scraped_at.slice(0, 10)
    if (!acc[day]) acc[day] = { total: 0, mentioned: 0 }
    acc[day].total++
    if (m.mentioned) acc[day].mentioned++
    return acc
  }, {})

  const days = Object.entries(byDay).slice(-14)
  const maxTotal = Math.max(...days.map(([, d]: any) => d.total), 1)

  const totalMentioned = mentions.filter(m => m.mentioned).length
  const mentionRate = mentions.length ? Math.round((totalMentioned / mentions.length) * 100) : 0
  const avgScore = mentions.length
    ? Math.round(mentions.filter(m => m.score).reduce((s, m) => s + m.score, 0) / (mentions.filter(m => m.score).length || 1))
    : 0

  // Sentiment breakdown
  const sentiments = mentions.reduce((acc: any, m) => {
    if (m.mentioned && m.sentiment) { acc[m.sentiment] = (acc[m.sentiment] || 0) + 1 }
    return acc
  }, {})

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-white/40">
            {brand ? `AI visibility trends for ${brand.domain}` : 'Add a brand to see analytics'}
          </p>
        </div>
        <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.04] p-1 gap-1">
          {(['7d', '30d', '90d'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${range === r ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total queries', value: mentions.length || '—', icon: Globe },
          { label: 'Mention rate', value: mentions.length ? `${mentionRate}%` : '—', icon: TrendingUp, color: mentionRate >= 50 ? 'text-emerald-400' : mentionRate >= 25 ? 'text-yellow-400' : 'text-red-400' },
          { label: 'Avg score', value: avgScore || '—', icon: BarChart3 },
          { label: 'Engines scanned', value: byEngine.length || '—', icon: Bot },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={13} className="text-white/30" />
              <p className="text-xs text-white/30">{label}</p>
            </div>
            <p className={`text-2xl font-black ${color || 'text-white'}`}>{value}</p>
          </div>
        ))}
      </div>

      {mentions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
          <LineChart size={32} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-1">No data yet for this period</p>
          <p className="text-xs text-white/20 mb-4">Run a scan from the AI Visibility page to start collecting data</p>
          <a href="/dashboard/visibility" className="text-sm text-violet-400 hover:text-violet-300">Go to AI Visibility →</a>
        </div>
      ) : (
        <>
          {/* Daily activity chart */}
          {days.length > 0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="text-sm font-semibold text-white mb-4">Daily scan activity</p>
              <div className="flex items-end gap-1.5 h-24">
                {days.map(([day, data]: any) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex flex-col justify-end" style={{ height: '80px' }}>
                      {/* Total bar */}
                      <div className="w-full rounded-t bg-white/[0.08]" style={{ height: `${(data.total / maxTotal) * 100}%` }} />
                      {/* Mentioned overlay */}
                      <div className="absolute bottom-0 w-full rounded-t bg-violet-500/60" style={{ height: `${(data.mentioned / maxTotal) * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-white/20 hidden group-hover:block">{day.slice(5)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5"><div className="h-2 w-3 rounded bg-violet-500/60" /><span className="text-[10px] text-white/30">Mentioned</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-3 rounded bg-white/[0.08]" /><span className="text-[10px] text-white/30">Total queries</span></div>
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
                  <div className="w-5 h-5 rounded-full shrink-0" style={{ background: ENGINE_COLORS[engine] || '#666', opacity: 0.7 }} />
                  <div className="w-24 text-sm font-medium text-white/70 capitalize">{engine}</div>
                  <div className="flex-1">
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: ENGINE_COLORS[engine] || '#8b5cf6', opacity: 0.7 }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${rate >= 50 ? 'text-emerald-400' : rate >= 25 ? 'text-yellow-400' : 'text-white/50'}`}>{rate}%</span>
                    <span className="text-[10px] text-white/20 ml-1">({mentioned}/{total})</span>
                  </div>
                  <div className="w-10 text-right text-xs text-white/30">{avgScore}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment */}
          {Object.keys(sentiments).length > 0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="text-sm font-semibold text-white mb-4">Sentiment when mentioned</p>
              <div className="flex gap-4">
                {[
                  { key: 'positive', label: 'Positive', color: 'bg-emerald-400' },
                  { key: 'neutral',  label: 'Neutral',  color: 'bg-white/30' },
                  { key: 'negative', label: 'Negative', color: 'bg-red-400' },
                ].map(({ key, label, color }) => {
                  const count = sentiments[key] || 0
                  const total = Object.values(sentiments).reduce((a: any, b: any) => a + b, 0) as number
                  const pct = total ? Math.round((count / total) * 100) : 0
                  return (
                    <div key={key} className="flex-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
                      <div className={`h-1 w-8 rounded-full mx-auto mb-3 ${color}`} />
                      <p className="text-2xl font-black text-white">{pct}%</p>
                      <p className="text-xs text-white/30 mt-1">{label}</p>
                      <p className="text-[10px] text-white/20">{count} mentions</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top performing queries */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="border-b border-white/[0.07] px-5 py-3">
              <p className="text-sm font-semibold text-white">Top performing queries</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {mentions.filter(m => m.mentioned && m.score)
                .sort((a, b) => b.score - a.score)
                .slice(0, 8)
                .map((m, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <span className="text-xs text-white/20 w-4">{i + 1}</span>
                    <span className="min-w-[80px] text-xs font-medium capitalize" style={{ color: ENGINE_COLORS[m.engine] || '#fff' }}>{m.engine}</span>
                    <p className="flex-1 text-xs text-white/50 truncate">{m.prompt}</p>
                    <span className={`text-sm font-black ${m.score >= 70 ? 'text-emerald-400' : m.score >= 40 ? 'text-yellow-400' : 'text-white/40'}`}>{m.score}</span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
