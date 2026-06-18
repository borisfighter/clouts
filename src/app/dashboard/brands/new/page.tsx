'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X, ArrowLeft, Wand2 } from 'lucide-react'

export default function NewBrandPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [kwInput, setKwInput] = useState('')
  const [error, setError] = useState('')

  const addKw = (val: string) => {
    const v = val.trim()
    if (v && !keywords.includes(v)) setKeywords(k => [...k, v])
    setKwInput('')
  }

  const suggestKeywords = async () => {
    if (!name) return
    setSuggesting(true)
    try {
      const res = await fetch('/api/suggestions/keywords', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, domain }),
      })
      const data = await res.json()
      if (data.suggestions) setKeywords(prev => [...new Set([...prev, ...data.suggestions])].slice(0, 10))
    } finally { setSuggesting(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/brands', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, domain, keywords }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      router.push('/dashboard')
    } catch { setError('Failed to create brand') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Add brand</h1>
          <p className="mt-0.5 text-sm text-white/40">Start monitoring a new brand across AI engines</p>
        </div>
      </div>
      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">{error}</div>}
      <form onSubmit={handleCreate} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Brand name *</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Acme Inc"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Primary domain *</label>
            <input value={domain} onChange={e => setDomain(e.target.value)} required placeholder="e.g. acme.com"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Keywords to track</label>
          <div className="flex gap-2 mb-2">
            <input value={kwInput} onChange={e => setKwInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKw(kwInput))}
              placeholder="e.g. best project management tool"
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50" />
            <button type="button" onClick={() => addKw(kwInput)} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-white/50 hover:text-white transition-colors"><Plus size={14} /></button>
            {name && <button type="button" onClick={suggestKeywords} disabled={suggesting}
              className="flex items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/[0.08] px-3 py-2 text-xs font-medium text-violet-400 hover:bg-violet-500/[0.15] disabled:opacity-40 transition-colors whitespace-nowrap">
              {suggesting ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />} AI suggest
            </button>}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[28px]">
            {keywords.map(kw => (
              <span key={kw} className="flex items-center gap-1.5 rounded-lg bg-violet-500/15 border border-violet-500/20 px-2.5 py-1 text-xs text-violet-300">
                {kw}<button type="button" onClick={() => setKeywords(k => k.filter(x => x !== kw))}><X size={10} /></button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving || !name || !domain}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-60 transition-colors">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Creating...' : 'Create brand'}
          </button>
          <button type="button" onClick={() => router.back()} className="text-sm text-white/40 hover:text-white transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  )
}
