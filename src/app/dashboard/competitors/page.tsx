'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, TrendingUp, Globe, Plus, X, Check } from 'lucide-react'

export default function CompetitorsPage() {
  const supabase = createClient()
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)
  const [compInput, setCompInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [scanError, setScanError] = useState('')
  const [mentions, setMentions] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState('free')

  async function loadMentions(brandId: string) {
    const since = new Date(Date.now() - 30 * 86400000).toISOString()
    const { data: m } = await supabase.from('mentions').select('engine, prompt, response_text, mentioned').eq('brand_id', brandId).gte('scraped_at', since).limit(200)
    setMentions(m || [])
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const [{ data: b }, { data: u }] = await Promise.all([
        supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single(),
        supabase.from('users').select('plan').eq('id', user.id).single(),
      ])
      setBrand(b)
      if (u) setUserPlan(u.plan || 'free')
      if (b) await loadMentions(b.id)
      setLoading(false)
    }
    load()
  }, [])

  const addComp = (val: string) => {
    const v = val.trim().replace('https://','').replace('www.','').split('/')[0]
    if (v && !brand?.competitors?.includes(v)) setBrand((b: any) => ({ ...b, competitors: [...(b.competitors || []), v] }))
    setCompInput('')
  }

  const removeComp = (c: string) => setBrand((b: any) => ({ ...b, competitors: b.competitors.filter((x: string) => x !== c) }))

  const saveCompetitors = async () => {
    if (!brand) return
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch('/api/brands', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, competitors: brand.competitors }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        setSaveError(data.error || 'Failed to save competitors — please try again')
        return
      }
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch {
      setSaveError('Failed to save competitors — check your connection and try again')
    } finally {
      setSaving(false)
    }
  }

  const runScan = async () => {
    if (!brand || !brand.keywords?.length) return
    setScanning(true); setScanResult(null); setScanError('')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, engines: userPlan === 'free' ? ['perplexity'] : ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude'] }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setScanError(data.error || 'Scan failed — please try again')
        return
      }
      setScanResult(data)
      await loadMentions(brand.id)
    } catch {
      setScanError('Scan failed — check your connection and try again')
    } finally {
      setScanning(false)
    }
  }

  const competitors: string[] = brand?.competitors || []
  const myMentioned = mentions.filter(m => m.mentioned).length
  const myRate = mentions.length > 0 ? Math.round((myMentioned / mentions.length) * 100) : 0

  const compStats = competitors.map(comp => {
    const matched = mentions.filter(m => m.response_text?.toLowerCase().includes(comp.toLowerCase())).length
    return { comp, matched, total: mentions.length, rate: mentions.length > 0 ? Math.round((matched / mentions.length) * 100) : 0 }
  }).sort((a, b) => b.rate - a.rate)

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Competitor Tracking</h1>
          <p className="mt-1 text-sm text-white/40">See how you rank vs competitors in AI engines</p>
        </div>
        {brand?.keywords?.length > 0 && competitors.length > 0 && (
          <button onClick={runScan} disabled={scanning}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60 transition-colors">
            {scanning ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
            {scanning ? 'Scanning...' : 'Run comparison'}
          </button>
        )}
      </div>

      {scanResult && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-2.5 text-sm text-emerald-300">
          ✓ Scanned {scanResult.scraped} queries — {brand?.name} mentioned in {scanResult.mentionRate}% of results
        </div>
      )}

      {scanError && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-2.5 text-sm text-red-300 flex items-center justify-between gap-3">
          <span>{scanError}</span>
          {scanError.toLowerCase().includes('upgrade') && (
            <a href="/pricing" className="shrink-0 rounded-lg bg-red-400/15 px-3 py-1 text-xs font-bold text-red-200 hover:bg-red-400/25 transition-colors">
              Upgrade →
            </a>
          )}
        </div>
      )}

      {/* Add competitors */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-bold text-white">Competitors to track</h2>
        <div className="flex gap-2">
          <input value={compInput} onChange={e => setCompInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addComp(compInput))}
            placeholder="e.g. competitor.com"
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50" />
          <button type="button" onClick={() => addComp(compInput)}
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-white/50 hover:text-white transition-colors">
            <Plus size={14} />
          </button>
        </div>
        {competitors.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {competitors.map(c => (
                <span key={c} className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 text-xs text-white/50">
                  <Globe size={10} />{c}
                  <button onClick={() => removeComp(c)} className="text-white/30 hover:text-red-400 transition-colors"><X size={10} /></button>
                </span>
              ))}
            </div>
            <button onClick={saveCompetitors} disabled={saving}
              className="flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 disabled:opacity-40">
              {saving ? <Loader2 size={11} className="animate-spin" /> : saved ? <Check size={11} /> : null}
              {saved ? 'Saved!' : 'Save competitors'}
            </button>
            {saveError && <p className="text-xs text-red-400">{saveError}</p>}
          </>
        ) : (
          <p className="text-xs text-white/20">Enter competitor domains to track how they appear vs you in AI search</p>
        )}
      </div>

      {/* Comparison */}
      {mentions.length > 0 ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3">
            <p className="text-sm font-semibold text-white">AI Mention Rate — Last 30 days</p>
            <p className="text-xs text-white/30 mt-0.5">Based on {mentions.length} queries across tracked keywords</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            <div className="flex items-center gap-4 px-5 py-4 bg-violet-500/[0.04]">
              <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
              <span className="text-sm font-bold text-white flex-1">{brand?.name} <span className="text-[10px] font-normal text-violet-400 ml-1">you</span></span>
              <div className="w-48">
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500/70" style={{ width: `${myRate}%` }} />
                </div>
              </div>
              <span className={`text-sm font-black w-10 text-right ${myRate >= 50 ? 'text-emerald-400' : myRate >= 25 ? 'text-yellow-400' : 'text-white/50'}`}>{myRate}%</span>
              <span className="text-xs text-white/25 w-14 text-right">{myMentioned}/{mentions.length}</span>
            </div>
            {compStats.map(({ comp, matched, total, rate }) => (
              <div key={comp} className="flex items-center gap-4 px-5 py-4">
                <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="text-sm text-white/60 flex-1">{comp}</span>
                <div className="w-48">
                  <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full bg-white/25" style={{ width: `${rate}%` }} />
                  </div>
                </div>
                <span className={`text-sm font-bold w-10 text-right ${rate > myRate ? 'text-red-400' : rate === myRate ? 'text-yellow-400' : 'text-white/40'}`}>{rate}%</span>
                <span className="text-xs text-white/25 w-14 text-right">{matched}/{total}</span>
              </div>
            ))}
            {competitors.length === 0 && (
              <div className="px-5 py-4 text-xs text-white/30 text-center">Add competitors above to see the comparison</div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-violet-500/15 p-10 text-center">
          <TrendingUp size={24} className="mx-auto mb-3 text-violet-400/30" />
          <p className="text-sm text-white/40 mb-1">No scan data yet</p>
          <p className="text-xs text-white/25 mb-4">Run a scan to see how you compare against competitors</p>
          {brand?.keywords?.length > 0 && competitors.length > 0 && (
            <button onClick={runScan} disabled={scanning}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500">
              <TrendingUp size={14} /> Run comparison scan
            </button>
          )}
        </div>
      )}
    </div>
  )
}
