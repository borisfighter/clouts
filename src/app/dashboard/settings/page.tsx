'use client'
import { useState } from 'react'
import { Save } from 'lucide-react'

export default function SettingsPage() {
  const [domain, setDomain] = useState('')
  const [name, setName] = useState('')

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-white/40">Configure your brand and account</p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
        <h2 className="text-sm font-bold text-white">Brand setup</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Brand name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Acme Inc"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Primary domain</label>
            <input
              value={domain} onChange={e => setDomain(e.target.value)}
              placeholder="e.g. acme.com"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Keywords to track</label>
            <textarea
              rows={3}
              placeholder="Enter keywords separated by commas..."
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-violet-500/50 focus:outline-none resize-none"
            />
            <p className="mt-1 text-[10px] text-white/20">These are the queries we'll test across AI engines</p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
          <Save size={14} /> Save brand
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70 font-medium">Free plan</p>
            <p className="text-xs text-white/30 mt-0.5">1 brand · 100 mentions/mo · No clips</p>
          </div>
          <a href="/pricing" className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-[#08090A] hover:opacity-85 transition-opacity">
            Upgrade
          </a>
        </div>
      </div>
    </div>
  )
}
