'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Radio, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2 } from 'lucide-react'

const ENGINES = ['chatgpt', 'perplexity', 'gemini', 'claude', 'grok', 'copilot', 'metaai', 'deepseek']
const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT', perplexity: 'Perplexity', gemini: 'Gemini',
  claude: 'Claude', grok: 'Grok', copilot: 'Copilot', metaai: 'Meta AI', deepseek: 'DeepSeek',
}

interface Mention {
  id: string; engine: string; prompt: string; mentioned: boolean
  score: number | null; sentiment: string | null; scraped_at: string
}

export default function VisibilityPage() {
  const supabase = createClient()
  const [mentions, setMentions] = useState<Mention[]>([])
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [scrapeMsg, setScrapeMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data: b } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
      setBrand(b)

      if (b) {
        const { data: m } = await supabase.from('mentions').select('*')
          .eq('brand_id', b.id).order('scraped_at', { ascending: false }).limit(50)
        setMentions(m || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const runScrape = async () => {
    if (!brand) return
    setScraping(true)
    setScrapeMsg('Running Perplexity scan...')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id }),
      })
      const data = await res.json()
      if (data.error) { setScrapeMsg(data.error); return }
      setScrapeMsg(`Done! Scanned ${data.scraped} queries — ${data.mentioned} mentions found`)
      // Reload mentions
      const { data: m } = await supabase.from('mentions').select('*')
        .eq('brand_id', brand.id).order('scraped_at', { ascending: false }).limit(50)
      setMentions(m || [])
    } catch {
      setScrapeMsg('Scrape failed — check console')
    } finally {
      setScraping(false)
      setTimeout(() => setScrapeMsg(''), 5000)
    }
  }

  // Aggregate by engine
  const byEngine = ENGINES.map(engine => {
    const engineMentions = mentions.filter(m => m.engine === engine)
    const mentioned = engineMentions.filter(m => m.mentioned).length
    const total = engineMentions.length
    const avgScore = total > 0 ? Math.round(engineMentions.reduce((s, m) => s + (m.score || 0), 0) / total) : null
    return { engine, label: ENGINE_LABELS[engine], mentioned, total, avgScore }
  })

  const totalMentioned = mentions.filter(m => m.mentioned).length
  const mentionRate = mentions.length > 0 ? Math.round((totalMentioned / mentions.length) * 100) : null
  const avgScore = mentions.length > 0 ? Math.round(mentions.reduce((s, m) => s + (m.score || 0), 0) / mentions.length) : null

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Visibility</h1>
          <p className="mt-1 text-sm text-white/40">
            {brand ? `Tracking ${brand.domain} across AI engines` : 'Add a brand in Settings to get started'}
          </p>
        </div>
        {brand && (
          <button onClick={runScrape} disabled={scraping}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60 transition-colors">
            {scraping ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {scraping ? 'Scanning...' : 'Run scan'}
          </button>
        )}
      </div>

      {scrapeMsg && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-sm text-violet-300">
          {scrapeMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Overall mention rate', value: mentionRate !== null ? `${mentionRate}%` : '—' },
          { label: 'Total queries scanned', value: mentions.length > 0 ? String(mentions.length) : '—' },
          { label: 'Avg visibility score', value: avgScore !== null ? String(avgScore) : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Engine breakdown */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="border-b border-white/[0.07] px-5 py-3 flex items-center gap-2">
          <Radio size={14} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Engine breakdown</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {byEngine.map(({ engine, label, mentioned, total, avgScore }) => (
            <div key={engine} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-24 text-sm font-medium text-white/70">{label}</div>
              <div className="flex-1">
                <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500/60 transition-all"
                    style={{ width: total > 0 ? `${Math.round((mentioned / total) * 100)}%` : '0%' }} />
                </div>
              </div>
              <div className="w-10 text-right text-sm font-bold text-white">
                {avgScore !== null ? avgScore : '—'}
              </div>
              <div className="w-24 text-right text-xs text-white/30">
                {total > 0 ? `${mentioned}/${total} mentions` : 'Not scanned'}
              </div>
              {total > 0 ? (
                mentioned > 0 ? <TrendingUp size={12} className="text-emerald-400" /> : <Minus size={12} className="text-white/20" />
              ) : <Minus size={12} className="text-white/10" />}
            </div>
          ))}
        </div>
      </div>

      {/* Recent mentions feed */}
      {mentions.length > 0 ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3">
            <span className="text-sm font-semibold text-white">Recent mentions</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {mentions.slice(0, 10).map(m => (
              <div key={m.id} className="flex items-start gap-4 px-5 py-3.5">
                <span className="min-w-[80px] text-xs font-semibold text-violet-300 capitalize">{m.engine}</span>
                <p className="flex-1 text-xs text-white/50 line-clamp-2">{m.prompt}</p>
                <div className="flex items-center gap-2 shrink-0">
                  {m.mentioned ? (
                    <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">mentioned</span>
                  ) : (
                    <span className="rounded-full bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 text-[10px] text-white/30">not found</span>
                  )}
                  {m.score !== null && <span className="text-xs font-bold text-white/60">{m.score}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : brand && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <Radio size={28} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-1">No scans yet</p>
          <p className="text-xs text-white/20 mb-4">Click "Run scan" to check how {brand.name} appears in AI engines</p>
        </div>
      )}

      {!brand && (
        <div className="rounded-2xl border border-dashed border-white/[0.10] p-12 text-center">
          <Radio size={32} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm font-medium text-white/30 mb-1">No brand configured</p>
          <p className="text-xs text-white/20 mb-4">Add your domain in Settings to start tracking</p>
          <a href="/dashboard/settings"
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
            Go to Settings →
          </a>
        </div>
      )}
    </div>
  )
}
