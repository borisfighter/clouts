'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Radio, Calendar } from 'lucide-react'

const ENGINE_DISPLAY: Record<string, string> = {
  perplexity: 'Perplexity', chatgpt: 'ChatGPT', gemini: 'Gemini', grok: 'Grok', claude: 'Claude',
}

const ENGINE_COLORS: Record<string, string> = {
  perplexity: '#8b5cf6', chatgpt: '#10b981', gemini: '#3b82f6', grok: '#f59e0b', claude: '#ec4899',
}

export default function HistoryPage() {
  const supabase = createClient()
  const [brand, setBrand] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(30)

  // Load brand once
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

  // Reload groups when brand or range changes
  useEffect(() => {
    if (!brand) return
    async function loadGroups() {
      const since = new Date(Date.now() - range * 86400000).toISOString()
      const { data: m } = await supabase.from('mentions').select('engine, mentioned, scraped_at')
        .eq('brand_id', brand.id).gte('scraped_at', since).order('scraped_at', { ascending: false })

      const byDay: Record<string, { total: number; mentioned: number; engines: Set<string> }> = {}
      for (const mention of m || []) {
        const day = mention.scraped_at.slice(0, 10)
        if (!byDay[day]) byDay[day] = { total: 0, mentioned: 0, engines: new Set() }
        byDay[day].total++
        if (mention.mentioned) byDay[day].mentioned++
        byDay[day].engines.add(mention.engine)
      }
      const sorted = Object.entries(byDay).map(([date, d]) => ({
        date, total: d.total, mentioned: d.mentioned,
        engines: Array.from(d.engines),
        rate: Math.round((d.mentioned / d.total) * 100),
      })).sort((a, b) => b.date.localeCompare(a.date))
      setGroups(sorted)
    }
    loadGroups()
  }, [brand, range])

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Scan History</h1>
          <p className="mt-1 text-sm text-white/40">All AI visibility scans for {brand?.name || 'your brand'}</p>
        </div>
        <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.04] p-1 gap-1">
          {[30, 60, 90].map(d => (
            <button key={d} onClick={() => setRange(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${range === d ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {groups.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total queries', value: groups.reduce((s, g) => s + g.total, 0).toLocaleString() },
            { label: 'Avg mention rate', value: `${Math.round(groups.reduce((s, g) => s + g.rate, 0) / groups.length)}%` },
            { label: 'Days with scans', value: String(groups.length) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="text-xs text-white/30 mb-1">{label}</p>
              <p className="text-2xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
          <Radio size={28} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-4">No scan history yet</p>
          <a href="/dashboard/visibility" className="text-sm text-violet-400 hover:text-violet-300">Run your first scan →</a>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3 grid grid-cols-12 text-[10px] font-bold text-white/25 uppercase tracking-widest">
            <span className="col-span-3">Date</span>
            <span className="col-span-2 text-right">Queries</span>
            <span className="col-span-2 text-right">Mentioned</span>
            <span className="col-span-2 text-right">Rate</span>
            <span className="col-span-3 text-right">Engines</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {groups.map(({ date, total, mentioned, rate, engines }) => (
              <div key={date} className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div className="col-span-3 flex items-center gap-2">
                  <Calendar size={13} className="text-white/20 shrink-0" />
                  <span className="text-sm text-white/70">
                    {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span className="col-span-2 text-right text-sm text-white/40">{total}</span>
                <span className="col-span-2 text-right text-sm text-white/50">{mentioned}</span>
                <span className={`col-span-2 text-right text-sm font-bold ${rate >= 50 ? 'text-emerald-400' : rate >= 25 ? 'text-yellow-400' : 'text-red-400'}`}>{rate}%</span>
                <div className="col-span-3 flex items-center justify-end gap-1">
                  {engines.map((e: string) => (
                    <div key={e} title={e} className="h-2 w-2 rounded-full" style={{ background: ENGINE_COLORS[e] || '#666', opacity: 0.7 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
