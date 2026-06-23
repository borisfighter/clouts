'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, Check, Plus, X, CreditCard, LogOut, Zap, Crown, Sparkles, Wand2, Trash2, AlertTriangle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

const PLAN_BADGES: Record<string, { label: string; color: string }> = {
  free:  { label: 'Free',  color: 'text-white/40 bg-white/[0.06] border-white/[0.08]' },
  pro:   { label: 'Pro',   color: 'text-violet-300 bg-violet-500/15 border-violet-500/20' },
  team:  { label: 'Team',  color: 'text-emerald-300 bg-emerald-400/15 border-emerald-400/20' },
}

function SettingsInner() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === '1'
  const isNew = searchParams.get('new') === '1'

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [brandId, setBrandId] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [portalLoading, setPortalLoading] = useState(false)
  const [billingError, setBillingError] = useState('')
  const [suggesting, setSuggesting] = useState(false)
  const [suggestionError, setSuggestionError] = useState('')
  const [shareSlug, setShareSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [deletingBrand, setDeletingBrand] = useState(false)
  const [brandActionError, setBrandActionError] = useState('')
  const [notifScanComplete, setNotifScanComplete] = useState(true)
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true)
  const [notifSentimentAlerts, setNotifSentimentAlerts] = useState(false)
  const [savingNotif, setSavingNotif] = useState(false)

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
      const { data: u } = await supabase.from('users').select('plan, notif_scan_complete, notif_weekly_report, notif_sentiment_alerts').eq('id', user.id).single()
      if (u) {
        setUserPlan(u.plan || 'free')
        if (u.notif_scan_complete !== null) setNotifScanComplete(u.notif_scan_complete ?? true)
        if (u.notif_weekly_report !== null) setNotifWeeklyReport(u.notif_weekly_report ?? true)
        if (u.notif_sentiment_alerts !== null) setNotifSentimentAlerts(u.notif_sentiment_alerts ?? false)
      }
      // Skip loading existing brand when creating a new one (?new=1)
      if (!isNew) {
        const { data } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
        if (data) {
          setBrandId(data.id); setName(data.name || ''); setDomain(data.domain || '')
          setKeywords(data.keywords || []); setCompetitors(data.competitors || [])
          setShareSlug(data.share_slug || null)
        }
      }
      setFetching(false)
    }
    load()
  }, [])

  const addTag = (val: string, list: string[], setList: (v: string[]) => void, setInput: (v: string) => void) => {
    const v = val.trim(); if (v && !list.includes(v)) setList([...list, v]); setInput('')
  }

  const deleteBrand = async () => {
    if (!brandId) return
    if (!window.confirm(`Delete "${name}"? All scan data, clips, and agents will be permanently removed. This cannot be undone.`)) return
    setDeletingBrand(true)
    setBrandActionError('')
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const db = createClient()

      // Delete in FK-safe order:
      // 1. clip_publishes → clips (FK on clip_id)
      // 2. agent_runs → agents (FK on agent_id)
      // 3. agents → brands
      // 4. mentions, prompt_volumes (direct FK on brand_id)
      // 5. brand last

      const { data: brandClips } = await db.from('clips').select('id').eq('brand_id', brandId)
      const clipIds = (brandClips || []).map((c: any) => c.id)
      if (clipIds.length > 0) {
        await db.from('clip_publishes').delete().in('clip_id', clipIds)
        const { error: clipsErr } = await db.from('clips').delete().eq('brand_id', brandId)
        if (clipsErr) throw clipsErr
      }

      const { data: brandAgents } = await db.from('agents').select('id').eq('brand_id', brandId)
      const agentIds = (brandAgents || []).map((a: any) => a.id)
      if (agentIds.length > 0) {
        await db.from('agent_runs').delete().in('agent_id', agentIds)
        const { error: agentsErr } = await db.from('agents').delete().eq('brand_id', brandId)
        if (agentsErr) throw agentsErr
      }

      const { error: mentionsErr } = await db.from('mentions').delete().eq('brand_id', brandId)
      if (mentionsErr) throw mentionsErr
      const { error: volumesErr } = await db.from('prompt_volumes').delete().eq('brand_id', brandId)
      if (volumesErr) throw volumesErr

      const { error: brandErr } = await db.from('brands').delete().eq('id', brandId)
      if (brandErr) throw brandErr

      window.location.href = '/dashboard'
    } catch {
      setBrandActionError('Failed to delete brand — please try again. Nothing has been removed.')
      setDeletingBrand(false)
    }
  }

  const clearScanData = async () => {
    if (!brandId) return
    if (!window.confirm(`Clear all scan data for "${name}"? This removes all AI mentions, scan history, and analytics. Brand settings are kept.`)) return
    setBrandActionError('')
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error: mentionsErr } = await supabase.from('mentions').delete().eq('brand_id', brandId)
      if (mentionsErr) throw mentionsErr
      const { error: volumesErr } = await supabase.from('prompt_volumes').delete().eq('brand_id', brandId)
      if (volumesErr) throw volumesErr
      window.location.reload()
    } catch {
      setBrandActionError('Failed to clear scan data — please try again.')
    }
  }

  const suggestKeywords = async () => {
    if (!name) return
    setSuggesting(true)
    setSuggestionError('')
    try {
      const res = await fetch('/api/suggestions/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, domain }),
      })
      const data = await res.json()
      if (data.suggestions?.length) {
        const newKws = data.suggestions.filter((s: string) => !keywords.includes(s))
        if (newKws.length === 0) setSuggestionError('All suggestions already added')
        else setKeywords(prev => [...prev, ...newKws].slice(0, 10))
      } else {
        setSuggestionError('No suggestions returned — try adding a domain')
      }
    } catch {
      setSuggestionError('Failed to fetch suggestions')
    } finally {
      setSuggesting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaved(false); setBrandActionError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setSaving(false)

    await supabase.from('users').upsert({ id: user.id, email: user.email! }, { onConflict: 'id' })

    let saveFailed = false
    if (brandId) {
      const updates: any = { name, domain, keywords, competitors }
      // Generate share slug if missing
      if (!shareSlug) {
        const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const newSlug = slugBase + '-' + Math.random().toString(36).slice(2, 10)
        updates.share_slug = newSlug
      }
      const { error } = await supabase.from('brands').update(updates).eq('id', brandId)
      if (error) {
        saveFailed = true
      } else if (updates.share_slug) {
        setShareSlug(updates.share_slug)
      }
    } else {
      // Check plan brand limit before inserting
      const { data: planUser } = await supabase.from('users').select('plan').eq('id', user.id).single()
      const userPlanKey = planUser?.plan || 'free'
      // Mirror PLANS config: free=1, starter=1, pro=5, growth=5, team/enterprise=-1
      const BRAND_LIMITS: Record<string, number> = {
        free: 1, starter: 1, pro: 5, growth: 5, team: -1, enterprise: -1,
      }
      const brandLimit = BRAND_LIMITS[userPlanKey] ?? 1
      if (brandLimit !== -1) {
        const { count } = await supabase.from('brands').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        if ((count || 0) >= brandLimit) {
          setBrandActionError(`Brand limit reached (${brandLimit} on the ${userPlanKey} plan). Upgrade to add more brands.`)
          setSaving(false)
          return
        }
      }

      // Generate share_slug for new brand
      const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const newBrandSlug = slugBase + '-' + Math.random().toString(36).slice(2, 10)

      // Insert new brand first, then unset old default only on success
      const { data, error } = await supabase.from('brands').insert({
        user_id: user.id, name, domain, keywords, competitors, is_default: true, share_slug: newBrandSlug,
      }).select().single()
      if (error || !data) {
        saveFailed = true
      } else {
        // New brand inserted successfully - unset old default (safe to do now)
        await supabase.from('brands').update({ is_default: false })
          .eq('user_id', user.id).neq('id', data.id).eq('is_default', true)
        setBrandId(data.id)
        setShareSlug(newBrandSlug)
      }
    }

    setSaving(false)
    if (saveFailed) {
      // The save button previously showed "Saved!" unconditionally on both
      // the update and insert paths regardless of whether either Supabase
      // call actually succeeded - this is the main brand setup form used by
      // every user on every visit to Settings, so it's the highest-traffic
      // instance of this session's recurring bug class.
      setBrandActionError('Failed to save — please try again.')
      return
    }
    setSaved(true)
    setTimeout(() => { setSaved(false); if (isWelcome) router.push('/dashboard/visibility'); else if (isNew) window.location.href = '/dashboard' }, 2000)
  }

  const saveNotif = async (field: string, value: boolean) => {
    setSavingNotif(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('users').update({ [field]: value }).eq('id', user.id)
    setSavingNotif(false)
  }

  const handleBillingPortal = async () => {
    setPortalLoading(true)
    setBillingError('')
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const { url, error } = await res.json()
      if (error) { setBillingError(error); return }
      window.location.href = url
    } catch {
      setBillingError('Failed to open billing portal — check your connection and try again')
    } finally {
      setPortalLoading(false)
    }
  }

  const planBadge = PLAN_BADGES[userPlan] || PLAN_BADGES.free

  if (fetching) return <div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">{isNew ? 'New Brand' : 'Settings'}</h1>
        <p className="mt-1 text-sm text-white/40">{isNew ? 'Set up a new brand to track' : 'Manage your brand, plan, and account'}</p>
      </div>

      {/* Welcome banner */}
      {isWelcome && (
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.08] p-5">
          <div className="flex items-start gap-3">
            <Sparkles size={18} className="text-violet-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white mb-1">Welcome to Clouts! 🎉</p>
              <p className="text-sm text-white/50">Set up your brand below to start monitoring your AI visibility. After saving, we'll run your first scan automatically.</p>
            </div>
          </div>
        </div>
      )}

      {/* Brand setup */}
      <form onSubmit={handleSave} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-5">
        <h2 className="text-sm font-bold text-white">Brand setup</h2>
        {brandActionError && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-2.5 text-sm text-red-300">
            {brandActionError}
          </div>
        )}
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

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">
            Keywords to track <span className="text-white/20">— queries we test in AI engines</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input value={kwInput} onChange={e => setKwInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(kwInput, keywords, setKeywords, setKwInput))}
              placeholder="e.g. best AI visibility tool"
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50" />
            <button type="button" onClick={() => addTag(kwInput, keywords, setKeywords, setKwInput)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-white/50 hover:text-white transition-colors"><Plus size={14} /></button>
            {name && (
              <button type="button" onClick={suggestKeywords} disabled={suggesting || !name}
                className="flex items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/[0.08] px-3 py-2 text-xs font-medium text-violet-400 hover:bg-violet-500/[0.15] disabled:opacity-40 transition-colors whitespace-nowrap">
                {suggesting ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
                {suggesting ? 'Suggesting...' : 'AI suggest'}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[28px]">
            {keywords.map(kw => (
              <span key={kw} className="flex items-center gap-1.5 rounded-lg bg-violet-500/15 border border-violet-500/20 px-2.5 py-1 text-xs text-violet-300">
                {kw}<button type="button" onClick={() => setKeywords(keywords.filter(k => k !== kw))}><X size={10} /></button>
              </span>
            ))}
            {keywords.length === 0 && <span className="text-xs text-white/20">Add 2-5 queries your customers search in AI engines</span>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">
            Competitors <span className="text-white/20">— track how they rank vs you</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input value={compInput} onChange={e => setCompInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(compInput, competitors, setCompetitors, setCompInput))}
              placeholder="e.g. competitor.com"
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50" />
            <button type="button" onClick={() => addTag(compInput, competitors, setCompetitors, setCompInput)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-white/50 hover:text-white transition-colors"><Plus size={14} /></button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[28px]">
            {competitors.map(c => (
              <span key={c} className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 text-xs text-white/50">
                {c}<button type="button" onClick={() => setCompetitors(competitors.filter(x => x !== c))}><X size={10} /></button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving || !name || !domain}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60 transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saving ? (isNew ? 'Creating…' : 'Saving…') : saved ? (isNew ? 'Created!' : isWelcome ? 'Saved! Redirecting...' : 'Saved!') : isNew ? 'Create brand' : isWelcome ? 'Save & start scanning' : 'Save changes'}
        </button>
      </form>

      {/* Share report */}
      {brandId && shareSlug && !isNew && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-3">
          <h2 className="text-sm font-bold text-white">Share Report</h2>
          <p className="text-xs text-white/40">Share a public AI visibility report for {name} with stakeholders, clients, or investors. No login required.</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/50 truncate font-mono">
              clouts.com/r/{shareSlug}
            </div>
            <button onClick={() => {
              navigator.clipboard.writeText(`https://www.clouts.com/r/${shareSlug}`)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/50 hover:text-white transition-colors whitespace-nowrap">
              {copied ? '✓ Copied!' : 'Copy link'}
            </button>
            <a href={`/r/${shareSlug}`} target="_blank" rel="noopener"
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/50 hover:text-white transition-colors whitespace-nowrap">
              Preview →
            </a>
          </div>
        </div>
      )}

      {/* Plan & Billing */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Plan & Billing</h2>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${planBadge.color}`}>{planBadge.label}</span>
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
            <a href="/pricing" className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-500 transition-colors shrink-0">
              <Crown size={13} /> Upgrade
            </a>
          ) : (
            <button onClick={handleBillingPortal} disabled={portalLoading}
              className="flex items-center gap-2 rounded-xl border border-white/[0.10] px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:border-white/20 disabled:opacity-40 transition-colors shrink-0">
              {portalLoading ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} />}
              Manage billing
            </button>
          )}
        </div>
        {billingError && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-2.5 text-sm text-red-300">
            {billingError}
          </div>
        )}
        {userPlan === 'free' && (
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4">
            <p className="text-xs font-semibold text-violet-300 mb-1">Unlock all 5 AI engines</p>
            <p className="text-xs text-white/40">Upgrade to Starter or above to scan ChatGPT, Gemini, Claude, and Grok — not just Perplexity.</p>
          </div>
        )}
      </div>

      {/* Scan schedule */}
      {brandId && !isNew && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Automated scans</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/60">Hourly background scans</p>
              <p className="text-xs text-white/30 mt-0.5">Clouts scans your brand every hour using Inngest background jobs (Pro/Team)</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {userPlan === 'free' ? (
                <a href="/pricing" className="flex items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/[0.08] px-3 py-2 text-xs font-semibold text-violet-400 hover:bg-violet-500/[0.14] transition-colors">
                  <Zap size={11} /> Upgrade to unlock
                </a>
              ) : (
                <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-400">
                  ✓ Active
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/[0.07]">
            <div>
              <p className="text-sm text-white/60">Weekly email report</p>
              <p className="text-xs text-white/30 mt-0.5">Sent every Monday at 9am — your 7-day visibility summary</p>
            </div>
            <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-400 shrink-0">
              ✓ Active
            </span>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Notifications</h2>
        {[
          { label: 'Scan complete emails', desc: 'Get emailed when an AI scan finishes with results', field: 'notif_scan_complete', value: notifScanComplete, set: setNotifScanComplete },
          { label: 'Weekly visibility report', desc: 'Summary of AI mention rates every Monday', field: 'notif_weekly_report', value: notifWeeklyReport, set: setNotifWeeklyReport },
          { label: 'Sentiment alerts', desc: 'Alert when brand sentiment turns negative', field: 'notif_sentiment_alerts', value: notifSentimentAlerts, set: setNotifSentimentAlerts },
        ].map(({ label, desc, field, value, set }) => (
          <div key={label} className="flex items-start justify-between gap-4">
            <div><p className="text-sm text-white/70">{label}</p><p className="text-xs text-white/30 mt-0.5">{desc}</p></div>
            <button
              onClick={() => { const next = !value; set(next); saveNotif(field, next) }}
              disabled={savingNotif}
              className={`shrink-0 h-5 w-9 rounded-full relative cursor-pointer transition-colors disabled:opacity-60 ${value ? 'bg-violet-500/50 border border-violet-500/60' : 'bg-white/[0.08] border border-white/[0.10]'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full transition-transform ${value ? 'translate-x-4 bg-violet-300' : 'translate-x-0.5 bg-white/30'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      {brandId && (
        <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-400/70" />
            <h2 className="text-sm font-bold text-white">Danger zone</h2>
          </div>
          {brandActionError && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/[0.1] px-4 py-2.5 text-sm text-red-300">
              ⚠ {brandActionError}
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/60">Clear scan data</p>
              <p className="text-xs text-white/30 mt-0.5">Remove all AI mentions, history, and analytics. Brand settings are kept.</p>
            </div>
            <button onClick={clearScanData}
              className="flex items-center gap-1.5 rounded-xl border border-orange-500/20 bg-orange-500/[0.08] px-4 py-2 text-sm font-medium text-orange-400 hover:bg-orange-500/[0.15] transition-colors whitespace-nowrap shrink-0">
              <Trash2 size={13} /> Clear data
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-red-500/10">
            <div>
              <p className="text-sm text-white/60">Delete brand</p>
              <p className="text-xs text-white/30 mt-0.5">Permanently remove {name} and all its scan data, clips, and agents.</p>
            </div>
            <button onClick={deleteBrand} disabled={deletingBrand}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/[0.15] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0">
              {deletingBrand ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Delete brand
            </button>
          </div>
        </div>
      )}

      {/* Account */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-3">
        <h2 className="text-sm font-bold text-white">Account</h2>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/auth/login') }}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
          <LogOut size={14} /> Sign out
        </button>
        <p className="text-xs text-white/20">To delete your account, email <a href="mailto:hello@clouts.com" className="text-white/40 hover:text-white">hello@clouts.com</a></p>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>}>
      <SettingsInner />
    </Suspense>
  )
}
