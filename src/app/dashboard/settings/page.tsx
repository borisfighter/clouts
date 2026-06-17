'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, Check, Plus, X, CreditCard, ExternalLink, LogOut, Zap, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'

const PLAN_BADGES: Record<string, { label: string; color: string; icon: typeof Zap }> = {
  free:  { label: 'Free', color: 'text-white/40 bg-white/[0.06] border-white/[0.08]', icon: Zap },
  pro:   { label: 'Pro', color: 'text-violet-300 bg-violet-500/15 border-violet-500/20', icon: Crown },
  team:  { label: 'Team', color: 'text-emerald-300 bg-emerald-400/15 border-emerald-400/20', icon: Crown },
}

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [portalLoading, setPortalLoading] = useState(false)

  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [competitors, setCompetitors] = useState<string[]>([])
  const [kwInput, setKwInput] = useState('')
  const [compInput, setCompInput] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setFetching(false)

      // Load user plan
      const { data: userData } = await supabase.from('users').select('plan').eq('id', user.id).single()
      if (userData) setUserPlan(userData.plan || 'free')

      const { data } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
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

  const addTag = (val: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) => {
    const v = val.trim()
    if (v && !list.includes(v)) setList([...list, v])
    setInput('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setSaving(false)

    if (brandId) {
      await supabase.from('brands').update({ name, domain, keywords, competitors }).eq('id', brandId)
    } else {
      await supabase.from('users').upsert({ id: user.id, email: user.email! }, { onConflict: 'id' })
      const { data } = await supabase.from('brands').insert({
        user_id: user.id, name, domain, keywords, competitors, is_default: true,
      }).select().single()
      if (data) setBrandId(data.id)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleBillingPortal = async () => {
    setPortalLoading(true)
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const { url, error } = await res.json()
    if (error) { alert(error); setPortalLoading(false); return }
    window.location.href = url
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const planBadge = PLAN_BADGES[userPlan] || PLAN_BADGES.free

  if (fetching) return <div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-white/40">Manage your brand, plan, and account</p>
      </div>

      {/* Brand setup */}
      <form onSubmit={handleSave} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
        <h2 className="text-sm font-bold text-white">Brand setup</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Brand name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Inc" required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">Primary domain</label>
            <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. acme.com" required
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50" />
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Keywords to track <span className="text-white/20">— queries we test in AI engines</span></label>
          <div className="flex gap-2 mb-2">
            <input value={kwInput} onChange={e => setKwInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(kwInput, keywords, setKeywords, setKwInput))}
              placeholder="e.g. best AI visibility tool"
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50" />
            <button type="button" onClick={() => addTag(kwInput, keywords, setKeywords, setKwInput)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-white/50 hover:text-white transition-colors"><Plus size={14} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map(kw => (
              <span key={kw} className="flex items-center gap-1.5 rounded-lg bg-violet-500/15 border border-violet-500/20 px-2.5 py-1 text-xs text-violet-300">
                {kw}<button type="button" onClick={() => setKeywords(keywords.filter(k => k !== kw))}><X size={10} /></button>
              </span>
            ))}
            {keywords.length === 0 && <span className="text-xs text-white/20">No keywords yet — add some above</span>}
          </div>
        </div>

        {/* Competitors */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Competitors <span className="text-white/20">— track how they rank vs you</span></label>
          <div className="flex gap-2 mb-2">
            <input value={compInput} onChange={e => setCompInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(compInput, competitors, setCompetitors, setCompInput))}
              placeholder="e.g. competitor.com"
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50" />
            <button type="button" onClick={() => addTag(compInput, competitors, setCompetitors, setCompInput)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-white/50 hover:text-white transition-colors"><Plus size={14} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {competitors.map(c => (
              <span key={c} className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 text-xs text-white/50">
                {c}<button type="button" onClick={() => setCompetitors(competitors.filter(x => x !== c))}><X size={10} /></button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60 transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save brand'}
        </button>
      </form>

      {/* Plan & Billing */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Plan & Billing</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${planBadge.color}`}>
              <planBadge.icon size={11} />{planBadge.label}
            </span>
            <div>
              <p className="text-sm text-white/70 font-medium capitalize">{userPlan} plan</p>
              <p className="text-xs text-white/30 mt-0.5">
                {userPlan === 'free' ? '1 brand · 100 mentions/mo · Perplexity only'
                  : userPlan === 'pro' ? '5 brands · 10K mentions/mo · All engines · 50 clips'
                  : 'Unlimited everything'}
              </p>
            </div>
          </div>
          {userPlan === 'free' ? (
            <a href="/pricing"
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
              <Crown size={13} /> Upgrade
            </a>
          ) : (
            <button onClick={handleBillingPortal} disabled={portalLoading}
              className="flex items-center gap-2 rounded-xl border border-white/[0.10] px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:border-white/20 disabled:opacity-40 transition-colors">
              {portalLoading ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} />}
              Manage billing
            </button>
          )}
        </div>

        {userPlan === 'free' && (
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
            <p className="text-xs font-semibold text-violet-300 mb-1">Unlock all 5 AI engines</p>
            <p className="text-xs text-white/40">Upgrade to Pro to scan ChatGPT, Gemini, Claude, and Grok — not just Perplexity.</p>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Notifications</h2>
        {[
          { label: 'Weekly visibility report', desc: 'Summary of AI mention rates every Monday' },
          { label: 'Scan complete emails', desc: 'Email when an AI scan finishes' },
          { label: 'Sentiment alerts', desc: 'Alert when brand sentiment turns negative' },
        ].map(({ label, desc }) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/70">{label}</p>
              <p className="text-xs text-white/30 mt-0.5">{desc}</p>
            </div>
            <button className="shrink-0 h-5 w-9 rounded-full bg-violet-500/30 border border-violet-500/40 relative transition-colors hover:bg-violet-500/50">
              <span className="absolute left-1 top-0.5 h-4 w-4 rounded-full bg-violet-400 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Account */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-3">
        <h2 className="text-sm font-bold text-white">Account</h2>
        <button onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
          <LogOut size={14} /> Sign out
        </button>
        <p className="text-xs text-white/20">To delete your account, email hello@clouts.com</p>
      </div>
    </div>
  )
}
