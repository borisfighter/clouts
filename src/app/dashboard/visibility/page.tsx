'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Radio, RefreshCw, Loader2, ChevronRight, TrendingUp, Lock } from 'lucide-react'

const ENGINES = [
  { id: 'perplexity', label: 'Perplexity',  plan: 'free', color: '#8b5cf6' },
  { id: 'chatgpt',    label: 'ChatGPT',     plan: 'pro',  color: '#10b981' },
  { id: 'gemini',     label: 'Gemini',      plan: 'pro',  color: '#3b82f6' },
  { id: 'grok',       label: 'Grok',        plan: 'pro',  color: '#f59e0b' },
  { id: 'claude',     label: 'Claude',      plan: 'pro',  color: '#ec4899' },
]

interface Mention {
  id: string; engine: string; prompt: string; mentioned: boolean
  score: number | null; sentiment: string | null; scraped_at: string; response_text: string
}

export default function VisibilityPage() {
  const supabase = createClient()
  const [mentions, setMentions] = useState<Mention[]>([])
  const [brand, setBrand] = useState<any>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [scanStatus, setScanStatus] = useState<{ msg: string; type: 'info' | 'success' | 'error' } | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('30d')

  async function loadData(brandId: string) {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 3650
    const since = new Date(Date.now() - days * 86400000).toISOString()
    const query = supabase.from('mentions').select('*').eq('brand_id', brandId)
      .order('scraped_at', { ascending: false }).limit(500)
    if (range !== 'all') query.gte('scraped_at', since)
    const { data } = await query
    setMentions(data || [])
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const [{ data: b }, { data: u }] = await Promise.all([
        supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single(),
        supabase.from('users').select('plan').eq('id', user.id).single(),
      ])
      setBrand(b); if (u) setUserPlan(u.plan || 'free')
      if (b) await loadData(b.id)
      setLoading(false)
    }
    load()
  }, [range])

  const runScan = async () => {
    if (!brand) return
    setScraping(true)
    setScanStatus({ msg: `Scanning ${userPlan === 'free' ? 'Perplexity' : 'all 5 engines'}...`, type: 'info' })
    try {
      const engines = userPlan === 'free' ? ['perplexity'] : ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude']
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, engines }),
      })
      const data = await res.json()
      if (data.error) { setScanStatus({ msg: `Error: ${data.error}`, type: 'error' }); return }
      let msg = `✓ Scanned ${data.scraped} queries — ${data.mentioned} mentions (${data.mentionRate}% rate)`
      if (data.competitorStats && Object.keys(data.competitorStats).length > 0) {
        const compSummary = Object.entries(data.competitorStats as Record<string,number>)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        msg += ` · Competitors: ${compSummary}`
      }
      setScanStatus({ msg, type: 'success' })
      await loadData(brand.id)
    } catch { setScanStatus({ msg: 'Scan failed — check network', type: 'error' }) }
    finally {
      setScraping(false)
      setTimeout(() => setScanStatus(null), 8000)
    }
  }

  // Per-engine stats
  const engineStats = ENGINES.map(({ id, label, plan, color }) => {
    const em = mentions.filter(m => m.engine === id)
    const mentioned = em.filter(m => m.mentioned).length
    const total = em.length
    const scores = em.filter(m => m.score != null).map(m => m.score!)
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : null
    const rate = total > 0 ? Math.round((mentioned / total) * 100) : null
    const isLocked = plan === 'pro' && userPlan === 'free'
    return { id, label, plan, color, mentioned, total, avgScore, rate, isLocked }
  })

  const totalMentions = mentions.filter(m => m.mentioned).length
  const mentionRate = mentions.length > 0 ? Math.round((totalMentions / mentions.length) * 100) : null
  const allScores = mentions.filter(m => m.score).map(m => m.score!)
  const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b) / allScores.length) : null

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Visibility</h1>
          <p className="mt-1 text-sm text-white/40">
            {brand ? `How AI engines mention ${brand.name}` : 'Add a brand to start tracking'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.04] p-1 gap-1">
            {(['7d', '30d', 'all'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${range === r ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
                {r === 'all' ? 'All time' : r}
              </button>
            ))}
          </div>
          {brand?.share_slug && (
            <div className="flex items-center gap-1">
              <a href={`/r/${brand.share_slug}`} target="_blank" rel="noopener"
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/50 hover:text-white hover:border-white/20 transition-colors">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Share
              </a>
              <button onClick={() => { navigator.clipboard.writeText(`https://www.clouts.com/r/${brand.share_slug}`); }}
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/50 hover:text-white hover:border-white/20 transition-colors">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy link
              </button>
            </div>
          )}
          {brand && (
            <button onClick={runScan} disabled={scraping || !brand?.keywords?.length}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors">
              {scraping ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {scraping ? 'Scanning...' : 'Run scan'}
            </button>
          )}
        </div>
      </div>

      {/* Status messages */}
      {scanStatus && (
        <div className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
          scanStatus.type === 'success' ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300' :
          scanStatus.type === 'error'   ? 'border-red-400/20 bg-red-400/[0.08] text-red-300' :
          'border-violet-500/20 bg-violet-500/[0.08] text-violet-300'
        }`}>{scanStatus.msg}</div>
      )}

      {!brand?.keywords?.length && brand && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-yellow-300">Add keywords in Settings to enable scanning</p>
          <a href="/dashboard/settings" className="text-xs font-bold text-yellow-400 hover:text-yellow-300">Settings →</a>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Mention rate', value: mentionRate !== null ? `${mentionRate}%` : '—',
            color: mentionRate !== null ? (mentionRate >= 50 ? 'text-emerald-400' : mentionRate >= 25 ? 'text-yellow-400' : 'text-red-400') : 'text-white' },
          { label: 'Queries scanned', value: mentions.length > 0 ? mentions.length.toLocaleString() : '—', color: 'text-white' },
          { label: 'Avg visibility score', value: avgScore !== null ? String(avgScore) : '—', color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Engine breakdown */}
      {brand && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3 flex items-center gap-2">
            <Radio size={14} className="text-violet-400" />
            <span className="text-sm font-semibold text-white">Engine breakdown</span>
            {userPlan === 'free' && (
              <a href="/pricing" className="ml-auto text-[11px] font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                <TrendingUp size={11} /> Upgrade for all engines
              </a>
            )}
          </div>
          <div className="divide-y divide-white/[0.04]">
            {engineStats.map(({ id, label, color, mentioned, total, avgScore, rate, isLocked }) => (
              <div key={id}>
                <button
                  onClick={() => !isLocked && total > 0 && setExpanded(expanded === id ? null : id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 transition-colors ${!isLocked && total > 0 ? 'hover:bg-white/[0.02] cursor-pointer' : 'cursor-default'} ${isLocked ? 'opacity-40' : ''}`}
                >
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color, opacity: isLocked ? 0.4 : 0.85 }} />
                  <div className="w-24 text-left">
                    <span className="text-sm font-medium text-white/80">{label}</span>
                    {isLocked && <span className="ml-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">Pro</span>}
                  </div>
                  <div className="flex-1">
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${isLocked ? 0 : rate ?? 0}%`, background: color, opacity: 0.7 }} />
                    </div>
                  </div>
                  <div className="w-14 text-right">
                    <span className={`text-sm font-black ${
                      isLocked ? 'text-white/20' :
                      rate !== null ? (rate >= 50 ? 'text-emerald-400' : rate >= 25 ? 'text-yellow-400' : 'text-white/50') : 'text-white/30'
                    }`}>
                      {isLocked ? '—' : rate !== null ? `${rate}%` : '—'}
                    </span>
                  </div>
                  <div className="w-16 text-right text-xs text-white/25">
                    {isLocked ? <span className="flex items-center justify-end gap-1 text-white/20"><Lock size={10} /> Locked</span>
                     : total > 0 ? `${mentioned}/${total}` : 'No data'}
                  </div>
                  {!isLocked && total > 0 && (
                    <ChevronRight size={13} className={`text-white/20 shrink-0 transition-transform ${expanded === id ? 'rotate-90' : ''}`} />
                  )}
                </button>

                {/* Expanded mention rows */}
                {expanded === id && !isLocked && (
                  <div className="border-t border-white/[0.04] bg-white/[0.01]">
                    {mentions.filter(m => m.engine === id).slice(0, 8).map((m, i) => (
                      <div key={m.id} className="flex items-start gap-4 px-6 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <span className="text-[10px] text-white/20 pt-0.5 w-4 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white/70 mb-0.5">{m.prompt}</p>
                          {m.response_text && (
                            <p className="text-[11px] text-white/25 leading-relaxed line-clamp-2">{m.response_text.slice(0, 180)}…</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {m.mentioned ? (
                            <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">✓ cited</span>
                          ) : (
                            <span className="text-[10px] text-white/20">not found</span>
                          )}
                          {m.sentiment && m.mentioned && (
                            <span className={`text-[10px] capitalize ${m.sentiment === 'positive' ? 'text-emerald-400/70' : m.sentiment === 'negative' ? 'text-red-400/70' : 'text-white/25'}`}>
                              {m.sentiment}
                            </span>
                          )}
                          {m.score != null && (
                            <span className={`text-xs font-black w-6 text-right ${m.score >= 70 ? 'text-emerald-400' : m.score >= 40 ? 'text-yellow-400' : 'text-white/40'}`}>
                              {m.score}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {mentions.filter(m => m.engine === id).length > 8 && (
                      <div className="px-6 py-2.5 text-[11px] text-white/20">
                        + {mentions.filter(m => m.engine === id).length - 8} more — <a href="/dashboard/analytics" className="text-violet-400/70 hover:text-violet-400">View all in Analytics →</a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty states */}
      {!brand && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <Radio size={28} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-4">Add a brand in Settings to start tracking AI mentions</p>
          <a href="/dashboard/settings" className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500">
            Go to Settings →
          </a>
        </div>
      )}
      {brand && mentions.length === 0 && !scraping && (
        <div className="rounded-2xl border border-dashed border-violet-500/15 bg-violet-500/[0.03] p-10 text-center">
          <Radio size={24} className="mx-auto mb-3 text-violet-400/30" />
          <p className="text-sm text-white/40 mb-1">No scans yet</p>
          <p className="text-xs text-white/25 mb-5">Click "Run scan" to check how {brand.name} appears in AI engines</p>
          {brand.keywords?.length > 0 && (
            <button onClick={runScan} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500">
              <Radio size={14} /> Run first scan
            </button>
          )}
        </div>
      )}
    </div>
  )
}
