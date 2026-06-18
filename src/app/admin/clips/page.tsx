'use client'
import { useEffect, useState } from 'react'
import { Loader2, Scissors, ExternalLink, RefreshCw } from 'lucide-react'

export default function AdminClipsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/stats')
    const d = await res.json()
    setData(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={18} className="animate-spin text-white/20" /></div>

  const total    = data?.clips?.total || 0
  const hasKey   = !data?._note

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Clips</h1>
          <p className="text-sm text-white/40 mt-1">Video clips across all users</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/50 hover:text-white transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {!hasKey && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] px-4 py-3 text-sm text-yellow-300">
          Add <code className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to see real clip counts.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total clips',   value: total.toLocaleString(), color: 'text-yellow-400' },
          { label: 'With Mux',      value: '—', color: 'text-white' },
          { label: 'Published',     value: '—', color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Scissors size={14} className="text-emerald-400" />
          <p className="text-sm font-semibold text-white">Clip management</p>
        </div>
        <p className="text-sm text-white/40">Manage individual clips through Supabase (database) or Mux (video assets). Use the SQL editor to query clips by user, status, or brand.</p>

        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
          <p className="text-[10px] text-white/30 mb-2 font-mono uppercase tracking-widest">Quick SQL queries</p>
          <pre className="text-xs text-emerald-300/70 font-mono leading-relaxed overflow-x-auto">{`-- All clips with brand + user info
SELECT c.id, c.title, c.status, c.created_at,
  b.name as brand, b.domain,
  u.email as owner
FROM clips c
JOIN brands b ON b.id = c.brand_id
JOIN users u ON u.id = b.user_id
ORDER BY c.created_at DESC
LIMIT 50;

-- Clips ready for publishing
SELECT c.title, c.mux_playback_id, b.name
FROM clips c JOIN brands b ON b.id = c.brand_id
WHERE c.status = 'ready'
ORDER BY c.created_at DESC;`}</pre>
        </div>

        <div className="flex gap-3 flex-wrap">
          <a href="https://supabase.com/dashboard/project/nwemjtwojubvfwngqkzv/editor" target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors">
            <ExternalLink size={13} /> Open SQL Editor
          </a>
          <a href="https://dashboard.mux.com" target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors">
            <ExternalLink size={13} /> Open Mux Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
