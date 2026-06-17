'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Radio, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2, ChevronRight } from 'lucide-react'

const ENGINES = [
  { id: 'perplexity', label: 'Perplexity', plan: 'free' },
  { id: 'chatgpt',    label: 'ChatGPT',    plan: 'pro' },
  { id: 'gemini',     label: 'Gemini',     plan: 'pro' },
  { id: 'grok',       label: 'Grok',       plan: 'pro' },
  { id: 'claude',     label: 'Claude',     plan: 'pro' },
]

const ENGINE_COLORS: Record<string, string> = {
  perplexity: 'bg-violet-500', chatgpt: 'bg-emerald-500',
  gemini: 'bg-blue-500', grok: 'bg-yellow-500', claude: 'bg-pink-500',
}

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
  const [scrapeProgress, setScrapeProgress] = useState<string>('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('30d')

  async function loadData(brandId: string) {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 3650
    const since = new Date(Date.now() - days * 86400000).toISOString()
    const query = supabase.from('mentions').select('*').eq('brand_id', brandId).order('scraped_at', { ascending: false }).limit(200)
    if (range !== 'all') query.gte('scraped_at', since)
    const { data: m } = await query
    setMentions(m || [])
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const [{ data: b }, { data: u }] = await Promise.all([
        supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single(),
        supabase.from('users').select('plan').eq('id', user.id).single(),
      ])
      setBrand(b)
      if (u) setUserPlan(u.plan || 'free')
      if (b) await loadData(b.id)
      setLoading(false)
    }
    load()
  }, [range])

  const runScan = async () => {
    if (!brand) return
    setScraping(true)
    setScrapeProgress('Starting scan...')
    try {
      const engines = userPlan === 'free' ? ['perplexity'] : ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude']
      setScrapeProgress(`Scanning ${engines.join(', ')}...`)
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, engines }),
      })
      const data = await res.json()
      if (data.error) { setScrapeProgress(`Error: ${data.error}`); return }
      setScrapeProgress(`✓ Done — ${data.mentioned}/${data.scraped} queries mentioned your brand`)
      await loadData(brand.id)
    } catch { setScrapeProgress('Scan failed — check API keys') }
    finally {
      setScraping(false)
      setTimeout(() => setScrapeProgress(''), 6000)
    }
  }

  // Per-engine stats
  const engineStats = ENGINES.map(({ id, label, plan }) => {
    const em = mentions.filter(m => m.engine === id)
    const mentioned = em.filter(m => m.mentioned).length
    const total = em.length
    const avgScore = total > 0 ? Math.round(em.reduce((s, m) => s + (m.score || 0), 0) / total) : null
    const rate = total > 0 ? Math.round((mentioned / total) * 100) : null
    const isLocked = plan === 'pro' && userPlan === 'free'
    return { id, label, mentioned, total, avgScore, rate, isLocked }
  })

  const totalMentions = mentions.filter(m => m.mentioned).length
  const mentionRate = mentions.length > 0 ? Math.round((totalMentions / mentions.length) * 100) : null
  const avgScore = mentions.filter(m => m.score).length > 0
    ? Math.round(mentions.filter(m => m.score).reduce((s, m) => s + m.score!, 0) / mentions.filter(m => m.score).length)
    : null

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Visibility</h1>
          <p className="mt-1 text-sm text-white/40">
            {brand ? `How AI engines talk about ${brand.name}` : 'Add a brand to start tracking'}
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
          {brand && (
            <button onClick={runScan} disabled={scraping || !brand?.keywords?.length}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors">
              {scraping ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {scraping ? 'Scanning...' : 'Run scan'}
            </button>
          )}
        </div>
      </div>

      {scrapeProgress && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.08] px-4 py-3 text-sm text-violet-300">
          {scrapeProgress}
        </div>
      )}

      {!brand?.keywords?.length && brand && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-yellow-300">Add keywords in Settings to run scans</p>
          <a href="/dashboard/settings" className="text-xs font-bold text-yellow-400 hover:text-yellow-300">Settings →</a>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Mention rate', value: mentionRate !== null ? `${mentionRate}%` : '—', color: mentionRate !== null ? (mentionRate >= 50 ? 'text-emerald-400' : mentionRate >= 25 ? 'text-yellow-400' : 'text-red-400') : 'text-white' },
          { label: 'Queries scanned', value: mentions.length > 0 ? String(mentions.length) : '—', color: 'text-white' },
          { label: 'Avg visibility score', value: avgScore !== null ? String(avgScore) : '—', color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Engine breakdown */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="border-b border-white/[0.07] px-5 py-3 flex items-center gap-2">
          <Radio size={14} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Engine breakdown</span>
          {userPlan === 'free' && (
            <a href="/pricing" className="ml-auto text-[10px] font-bold text-violet-400 hover:text-violet-300">Upgrade for all engines →</a>
          )}
        </div>
        <div className="divide-y divide-white/[0.04]">
          {engineStats.map(({ id, label, mentioned, total, avgScore, rate, isLocked }) => (
            <div key={id}>
              <button
                onClick={() => setExpanded(expanded === id ? null : id)}
                disabled={isLocked}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors disabled:opacity-50"
              >
                <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${ENGINE_COLORS[id]} opacity-80`} />
                <div className="w-24 text-sm font-medium text-white/70 text-left">
                  {label}
                  {isLocked && <span className="ml-2 text-[9px] text-white/20 uppercase">Pro</span>}
                </div>
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${ENGINE_COLORS[id]} opacity-60`}
                      style={{ width: isLocked ? '0%' : `${rate ?? 0}%` }} />
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-black text-white">
                  {isLocked ? '—' : rate !== null ? `${rate}%` : '—'}
                </div>
                <div className="w-16 text-right text-xs text-white/30">
                  {isLocked ? 'Locked' : total > 0 ? `${mentioned}/${total}` : 'No data'}
                </div>
                {!isLocked && total > 0 && (
                  <ChevronRight size={13} className={`text-white/20 transition-transform ${expanded === id ? 'rotate-90' : ''}`} />
                )}
              </button>

              {/* Expanded: recent mentions for this engine */}
              {expanded === id && mentions.filter(m => m.engine === id).length > 0 && (
                <div className="bg-white/[0.01] border-t border-white/[0.04]">
                  {mentions.filter(m => m.engine === id).slice(0, 5).map(m => (
                    <div key={m.id} className="flex items-start gap-4 px-6 py-3 border-b border-white/[0.03] last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/60 truncate">{m.prompt}</p>
                        {m.mentioned && m.response_text && (
                          <p className="text-xs text-white/25 mt-0.5 line-clamp-2">{m.response_text.slice(0, 120)}...</p>
                        )}
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {m.mentioned ? (
                          <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">✓ mentioned</span>
                        ) : (
                          <span className="text-[10px] text-white/20">not found</span>
                        )}
                        {m.score !== null && (
                          <span className={`text-xs font-black ${m.score >= 70 ? 'text-emerald-400' : m.score >= 40 ? 'text-yellow-400' : 'text-white/40'}`}>{m.score}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* No data / no brand states */}
      {!brand && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <Radio size={28} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-4">Add a brand in Settings to start tracking</p>
          <a href="/dashboard/settings" className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500">Go to Settings →</a>
        </div>
      )}

      {brand && mentions.length === 0 && !scraping && (
        <div className="rounded-2xl border border-dashed border-violet-500/15 bg-violet-500/[0.03] p-10 text-center">
          <Radio size={24} className="mx-auto mb-3 text-violet-400/30" />
          <p className="text-sm text-white/40 mb-1">No scans yet</p>
          <p className="text-xs text-white/20 mb-4">Click "Run scan" to check how {brand.name} appears in AI engines</p>
        </div>
      )}
    </div>
  )
}
