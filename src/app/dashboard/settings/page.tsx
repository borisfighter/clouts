'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, Check, Plus, X } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [brandId, setBrandId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [competitors, setCompetitors] = useState<string[]>([])
  const [kwInput, setKwInput] = useState('')
  const [compInput, setCompInput] = useState('')

  // Load existing brand on mount
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setFetching(false)

      const { data } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single()

      if (data) {
        setBrandId(data.id)
        setName(data.name || '')
        setDomain(data.domain || '')
        setKeywords(data.keywords || [])
        setCompetitors(data.competitors || [])
      }
      setFetching(false)
    }
    load()
  }, [])

  const addKeyword = () => {
    const kw = kwInput.trim()
    if (kw && !keywords.includes(kw)) setKeywords([...keywords, kw])
    setKwInput('')
  }

  const addCompetitor = () => {
    const c = compInput.trim()
    if (c && !competitors.includes(c)) setCompetitors([...competitors, c])
    setCompInput('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setLoading(false)

    if (brandId) {
      await supabase.from('brands').update({ name, domain, keywords, competitors }).eq('id', brandId)
    } else {
      // Also upsert user row
      await supabase.from('users').upsert({ id: user.id, email: user.email! }, { onConflict: 'id' })
      const { data } = await supabase.from('brands').insert({
        user_id: user.id, name, domain, keywords, competitors, is_default: true,
      }).select().single()
      if (data) setBrandId(data.id)
    }

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (fetching) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 size={20} className="animate-spin text-white/20" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-white/40">Configure your brand and account preferences</p>
      </div>

      {/* Brand Setup */}
      <form onSubmit={handleSave} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
        <h2 className="text-sm font-bold text-white">Brand setup</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Brand name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Clouts" required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Primary domain</label>
            <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. clouts.com" required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60" />
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">
            Keywords to track <span className="text-white/20">(queries we test in AI engines)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input value={kwInput} onChange={e => setKwInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              placeholder="e.g. best AI visibility tool"
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60" />
            <button type="button" onClick={addKeyword}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-white/50 hover:text-white transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map(kw => (
              <span key={kw} className="flex items-center gap-1.5 rounded-lg bg-violet-500/15 border border-violet-500/20 px-2.5 py-1 text-xs text-violet-300">
                {kw}
                <button type="button" onClick={() => setKeywords(keywords.filter(k => k !== kw))}><X size={10} /></button>
              </span>
            ))}
            {keywords.length === 0 && <span className="text-xs text-white/20">No keywords yet</span>}
          </div>
        </div>

        {/* Competitors */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">
            Competitor domains <span className="text-white/20">(optional — track how they rank vs you)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input value={compInput} onChange={e => setCompInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCompetitor())}
              placeholder="e.g. tryprofound.com"
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60" />
            <button type="button" onClick={addCompetitor}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-white/50 hover:text-white transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {competitors.map(c => (
              <span key={c} className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 text-xs text-white/50">
                {c}
                <button type="button" onClick={() => setCompetitors(competitors.filter(x => x !== c))}><X size={10} /></button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60 transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save brand'}
        </button>
      </form>

      {/* Account */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70 font-medium">Free plan</p>
            <p className="text-xs text-white/30 mt-0.5">1 brand · 100 mentions/mo · No clips</p>
          </div>
          <a href="/pricing" className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-[#08090A] hover:opacity-85 transition-opacity">
            Upgrade →
          </a>
        </div>
      </div>

      {/* Sign out */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <h2 className="text-sm font-bold text-white mb-3">Account</h2>
        <button onClick={async () => { await createClient().auth.signOut(); window.location.href = '/auth/login' }}
          className="text-sm text-red-400 hover:text-red-300 transition-colors">
          Sign out
        </button>
      </div>
    </div>
  )
}
