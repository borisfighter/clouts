'use client'
import { useEffect, useState } from 'react'
import { Loader2, Radio, ExternalLink, RefreshCw } from 'lucide-react'

export default function AdminMentionsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/stats')
    const data = await res.json()
    setStats(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={18} className="animate-spin text-white/20" /></div>

  const total   = stats?.mentions?.total  || 0
  const last7   = stats?.mentions?.last7  || 0
  const hasKey  = !stats?._note

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Mentions</h1>
          <p className="text-sm text-white/40 mt-1">AI scan activity across all users</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/50 hover:text-white transition-colors">
          <RefreshCw size={12} />Refresh
        </button>
      </div>

      {!hasKey && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] px-4 py-3 text-sm text-yellow-300">
          Add <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to Vercel env vars to see real mention data across all users.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total mentions (all time)', value: total.toLocaleString(), color: 'text-pink-400' },
          { label: 'Mentions (last 7 days)',    value: last7.toLocaleString(), color: 'text-white' },
          { label: 'Avg per day (7d)',          value: total > 0 ? Math.round(last7 / 7).toLocaleString() : '0', color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-violet-400" />
          <p className="text-sm font-semibold text-white">Deep dive into mention data</p>
        </div>
        <p className="text-sm text-white/40">Use Supabase SQL editor to query mentions across all brands with full filtering, sorting, and export capabilities.</p>
        <div className="flex gap-3 flex-wrap">
          <a href="https://supabase.com/dashboard/project/nwemjtwojubvfwngqkzv/editor" target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors">
            <ExternalLink size={13} /> Open SQL Editor
          </a>
          <a href="https://supabase.com/dashboard/project/nwemjtwojubvfwngqkzv/database/tables" target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors">
            <ExternalLink size={13} /> Browse Tables
          </a>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <p className="text-[10px] text-white/30 mb-2 font-mono uppercase tracking-widest">Quick SQL queries</p>
          <pre className="text-xs text-emerald-300/70 font-mono leading-relaxed overflow-x-auto">{`-- Top mentioned brands
SELECT b.name, b.domain, COUNT(*) as mentions,
  SUM(CASE WHEN m.mentioned THEN 1 ELSE 0 END) as mentioned_count
FROM mentions m
JOIN brands b ON b.id = m.brand_id
GROUP BY b.id ORDER BY mentions DESC LIMIT 10;

-- Mention rate by engine (last 7 days)
SELECT engine,
  COUNT(*) as total,
  AVG(score) as avg_score,
  SUM(CASE WHEN mentioned THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as mention_rate
FROM mentions
WHERE scraped_at > now() - interval '7 days'
GROUP BY engine ORDER BY mention_rate DESC;`}</pre>
        </div>
      </div>
    </div>
  )
}
