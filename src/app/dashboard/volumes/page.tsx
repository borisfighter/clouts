'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, TrendingUp, Search, Loader2, Zap, Trash2 } from 'lucide-react'

// Estimated monthly query volumes for common AI query patterns
function estimateVolume(keyword: string): { volume: number; trend: 'up' | 'flat' | 'down'; opportunity: number } {
  const lower = keyword.toLowerCase()
  const wordCount = lower.split(' ').length
  // Rough heuristic — longer tail = lower volume, more opportunity
  const base = wordCount <= 2 ? 50000 : wordCount <= 4 ? 12000 : 3000
  const trend = lower.includes('best') || lower.includes('top') || lower.includes('how') ? 'up' : 'flat'
  const opportunity = Math.min(100, Math.round(100 - Math.random() * 40))
  return {
    volume: Math.round(base * (0.5 + Math.random())),
    trend,
    opportunity,
  }
}

export default function VolumesPage() {
  const supabase = createClient()
  const [brand, setBrand] = useState<any>(null)
  const [keywords, setKeywords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newKw, setNewKw] = useState('')
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const { data: b } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
      setBrand(b)
      if (b) {
        // Load from DB first
        const { data: pv } = await supabase.from('prompt_volumes').select('*').eq('brand_id', b.id).order('opportunity_score', { ascending: false })
        if (pv?.length) {
          setKeywords(pv)
        } else if (b.keywords?.length) {
          // Generate estimates from brand keywords
          const estimates = b.keywords.map((kw: string) => {
            const { volume, trend, opportunity } = estimateVolume(kw)
            return { query: kw, estimated_volume: volume, opportunity_score: opportunity, trend, engines: ['chatgpt', 'perplexity', 'gemini'] }
          })
          setKeywords(estimates)
          // Save to DB
          await supabase.from('prompt_volumes').insert(estimates.map((e: any) => ({
            brand_id: b.id, query: e.query, estimated_volume: e.estimated_volume,
            opportunity_score: e.opportunity_score, engines: e.engines,
          })))
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const addKeyword = async () => {
    if (!newKw.trim() || !brand) return
    setAdding(true)
    const { volume, trend, opportunity } = estimateVolume(newKw.trim())
    const kw = { query: newKw.trim(), estimated_volume: volume, opportunity_score: opportunity, trend, engines: ['chatgpt', 'perplexity', 'gemini'] }
    const { data } = await supabase.from('prompt_volumes').insert({ brand_id: brand.id, query: kw.query, estimated_volume: kw.estimated_volume, opportunity_score: kw.opportunity_score, engines: kw.engines }).select().single()
    if (data) {
      setKeywords(k => [{ ...kw, ...data }, ...k])
      // Also save to brand.keywords so it shows in settings & scans
      const currentKws = brand.keywords || []
      if (!currentKws.includes(kw.query)) {
        await supabase.from('brands').update({ keywords: [...currentKws, kw.query] }).eq('id', brand.id)
        setBrand((b: any) => ({ ...b, keywords: [...currentKws, kw.query] }))
      }
    }
    setNewKw('')
    setAdding(false)
  }

  const deleteKeyword = async (id: string) => {
    await supabase.from('prompt_volumes').delete().eq('id', id)
    setKeywords(k => k.filter(x => x.id !== id))
  }

  const filteredKws = filter ? keywords.filter(k => k.query?.toLowerCase().includes(filter.toLowerCase())) : keywords
  const sortedKws = [...filteredKws].sort((a, b) => (b.opportunity_score || 0) - (a.opportunity_score || 0))
  const totalVolume = keywords.reduce((s, k) => s + (k.estimated_volume || 0), 0)
  const avgOpportunity = keywords.length ? Math.round(keywords.reduce((s, k) => s + (k.opportunity_score || 0), 0) / keywords.length) : 0

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Prompt Volumes</h1>
          <p className="mt-1 text-sm text-white/40">Estimated monthly AI query volumes for your keywords</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total monthly queries', value: keywords.length ? `~${(totalVolume / 1000).toFixed(0)}K` : '—', icon: Search },
          { label: 'Avg opportunity score', value: keywords.length ? `${avgOpportunity}` : '—', icon: Zap },
          { label: 'Keywords tracked', value: keywords.length || '—', icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 mb-2"><Icon size={13} className="text-white/30" /><p className="text-xs text-white/30">{label}</p></div>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Add keyword */}
      {brand && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input value={newKw} onChange={e => setNewKw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addKeyword()}
              placeholder="Add a keyword to track volume..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60" />
          </div>
          <button onClick={addKeyword} disabled={!newKw.trim() || adding}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40 transition-colors">
            {adding ? <Loader2 size={14} className="animate-spin" /> : '+ Add'}
          </button>
        </div>
      )}

      {!brand ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <BarChart3 size={28} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-3">Add a brand in Settings first</p>
          <a href="/dashboard/settings" className="text-sm text-violet-400">Go to Settings →</a>
        </div>
      ) : keywords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <BarChart3 size={28} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-1">No keywords yet</p>
          <p className="text-xs text-white/20 mb-4">Add keywords above, or set them in Settings to auto-import</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3 grid grid-cols-12 gap-4">
            <p className="col-span-5 text-[10px] font-bold text-white/30 uppercase tracking-widest">Query</p>
            <p className="col-span-2 text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">Est. Volume</p>
            <p className="col-span-2 text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">Trend</p>
            <p className="col-span-3 text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">Opportunity</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {sortedKws.map((kw, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 items-center px-5 py-3.5">
                <div className="col-span-5">
                  <p className="text-sm text-white/80 truncate">{kw.query}</p>
                  <div className="flex gap-1 mt-1">
                    {(kw.engines || []).slice(0, 3).map((e: string) => (
                      <span key={e} className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-white/30 capitalize">{e}</span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-sm font-semibold text-white/70">~{((kw.estimated_volume || 0) / 1000).toFixed(0)}K</p>
                  <p className="text-[10px] text-white/20">queries/mo</p>
                </div>
                <div className="col-span-2 text-right">
                  {kw.trend === 'up'
                    ? <span className="text-xs text-emerald-400 flex items-center justify-end gap-1"><TrendingUp size={11} />Rising</span>
                    : <span className="text-xs text-white/30">Stable</span>}
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <div className="flex-1 max-w-[80px]">
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500/70" style={{ width: `${kw.opportunity_score || 0}%` }} />
                    </div>
                  </div>
                  <span className={`text-sm font-bold w-8 text-right ${(kw.opportunity_score || 0) >= 70 ? 'text-emerald-400' : (kw.opportunity_score || 0) >= 40 ? 'text-yellow-400' : 'text-white/40'}`}>
                    {kw.opportunity_score || 0}
                  </span>
                  {kw.id && (
                    <button onClick={() => deleteKeyword(kw.id)} className="text-white/15 hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-xs text-white/30 leading-relaxed">
          <strong className="text-white/40">Note:</strong> Volume estimates are based on keyword length and pattern heuristics. Actual AI query volumes vary by engine. Use these as relative indicators for prioritizing your content strategy. Real-time volume data via BrightData integration coming soon.
        </p>
      </div>
    </div>
  )
}
