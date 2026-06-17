'use client'
import { useEffect, useState } from 'react'
import { Loader2, Scissors } from 'lucide-react'

export default function AdminClipsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={18} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-4xl space-y-6">
      <div><h1 className="text-2xl font-black text-white">Clips</h1><p className="text-sm text-white/40 mt-1">Video clips across all users</p></div>
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
        <p className="text-xs text-white/30 mb-1">Total clips</p>
        <p className="text-3xl font-black text-white">{(data?.clips?.total || 0).toLocaleString()}</p>
      </div>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div className="flex items-center gap-2 mb-3"><Scissors size={14} className="text-emerald-400" /><p className="text-sm font-semibold text-white">Clip management</p></div>
        <p className="text-sm text-white/40 mb-4">Individual clip management is available through the Supabase dashboard. Mux assets can be managed at dashboard.mux.com.</p>
        <div className="flex gap-3">
          <a href="https://supabase.com/dashboard/project/nwemjtwojubvfwngqkzv/editor" target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors">Open Supabase →</a>
          <a href="https://dashboard.mux.com" target="_blank" rel="noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors">Open Mux →</a>
        </div>
      </div>
    </div>
  )
}
