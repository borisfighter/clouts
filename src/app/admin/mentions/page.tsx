'use client'
import { useEffect, useState } from 'react'
import { Loader2, Radio } from 'lucide-react'

const ENGINE_COLORS: Record<string,string> = { perplexity:'text-violet-400', chatgpt:'text-emerald-400', gemini:'text-blue-400', grok:'text-yellow-400', claude:'text-pink-400' }

export default function AdminMentionsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={18} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-4xl space-y-6">
      <div><h1 className="text-2xl font-black text-white">Mentions</h1><p className="text-sm text-white/40 mt-1">AI scan activity across all users</p></div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total mentions', value: (data?.mentions?.total || 0).toLocaleString() },
          { label: 'Last 7 days', value: (data?.mentions?.last7 || 0).toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className="text-3xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div className="flex items-center gap-2 mb-4"><Radio size={14} className="text-violet-400" /><p className="text-sm font-semibold text-white">Mention data is stored per brand in the mentions table.</p></div>
        <p className="text-sm text-white/40">Use Supabase dashboard for deeper mention queries across all users.</p>
        <a href={`https://supabase.com/dashboard/project/nwemjtwojubvfwngqkzv/editor`} target="_blank" rel="noopener"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors">
          Open Supabase SQL editor →
        </a>
      </div>
    </div>
  )
}
