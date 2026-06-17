'use client'
import { useEffect, useState } from 'react'
import { Check, X, AlertCircle, ExternalLink, RefreshCw, Loader2 } from 'lucide-react'

export default function AdminIntegrationsPage() {
  const [statuses, setStatuses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/integrations')
    const data = await res.json()
    setStatuses(data.integrations || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const connected = statuses.filter(s => s.status === 'connected').length

  const categories = [
    { label: 'AI Scrapers', prefix: 'scraper' },
    { label: 'Infrastructure', prefix: 'infra' },
    { label: 'Monetisation', prefix: 'billing' },
    { label: 'Media & Email', prefix: 'media' },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Integrations</h1>
          <p className="text-sm text-white/40 mt-1">API key status for all third-party services</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/50 hover:text-white transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {!loading && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium flex items-center gap-2 ${
          connected === statuses.length ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300' :
          connected >= statuses.length / 2 ? 'border-yellow-400/20 bg-yellow-400/[0.06] text-yellow-300' :
          'border-orange-400/20 bg-orange-400/[0.06] text-orange-300'
        }`}>
          <span className="font-black">{connected}/{statuses.length}</span>
          <span className="opacity-70">integrations connected{connected < statuses.length ? ' — add missing keys in Vercel env vars' : ' — all systems go!'}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={18} className="animate-spin text-white/20" /></div>
      ) : (
        <div className="space-y-3">
          {categories.map(({ label, prefix }) => {
            const items = statuses.filter(s => s.key?.startsWith(prefix))
            if (!items.length) return null
            return (
              <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                <div className="border-b border-white/[0.07] px-5 py-3">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</p>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {items.map((s: any) => (
                    <div key={s.name} className="flex items-center gap-4 px-5 py-3.5">
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        s.status === 'connected' ? 'bg-emerald-400/15' :
                        s.status === 'placeholder' ? 'bg-yellow-400/15' : 'bg-red-400/10'
                      }`}>
                        {s.status === 'connected' ? <Check size={12} className="text-emerald-400" /> :
                         s.status === 'placeholder' ? <AlertCircle size={12} className="text-yellow-400" /> :
                         <X size={12} className="text-white/30" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{s.name}</p>
                        <p className="text-xs text-white/30">{s.desc}</p>
                      </div>
                      <span className={`text-xs font-semibold shrink-0 ${
                        s.status === 'connected' ? 'text-emerald-400' :
                        s.status === 'placeholder' ? 'text-yellow-400' : 'text-white/20'
                      }`}>
                        {s.status === 'connected' ? '✓ Live' :
                         s.status === 'placeholder' ? '⚠ Placeholder' : '✗ Not set'}
                      </span>
                      {!s.required && <span className="text-[10px] text-white/20 shrink-0">optional</span>}
                      <a href={s.link} target="_blank" rel="noopener"
                        className="rounded-lg border border-white/[0.07] p-1.5 text-white/30 hover:text-white hover:border-white/20 transition-colors shrink-0">
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
