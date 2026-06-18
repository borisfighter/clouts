'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OnboardingChecklist } from '@/components/OnboardingChecklist'
import { Radio, TrendingUp, Scissors, Bot, ArrowUpRight, Loader2, RefreshCw, Zap, Crown, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const ENGINE_COLORS: Record<string, string> = {
  perplexity: '#8b5cf6', chatgpt: '#10b981', gemini: '#3b82f6', grok: '#f59e0b', claude: '#ec4899',
}

export default function DashboardPage() {
  const supabase = createClient()
  const [brand, setBrand] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ mentionRate: null as number | null, totalScans: 0, clips: 0, avgScore: null as number | null })
  const [recentMentions, setRecentMentions] = useState<any[]>([])
  const [engineStats, setEngineStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [userPlan, setUserPlan] = useState<string>('free')
  const [agentRan, setAgentRan] = useState(false)
  const [shareSlug, setShareSlug] = useState<string | null>(null)
  const [scanMsg, setScanMsg] = useState('')

  async function loadData(brandId: string) {
    const [{ data: mentions }, { count: clipCount }] = await Promise.all([
      supabase.from('mentions').select('mentioned, score, engine, prompt, scraped_at, sentiment')
        .eq('brand_id', brandId).order('scraped_at', { ascending: false }).limit(200),
      supabase.from('clips').select('*', { count: 'exact', head: true }).eq('brand_id', brandId),
    ])

    const total = mentions?.length || 0
    const mentioned = mentions?.filter(m => m.mentioned).length || 0
    const scores = mentions?.filter(m => m.score != null).map(m => m.score) || []
    const avgScore = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b) / scores.length) : null

    // Engine breakdown
    const byEngine: Record<string, { total: number; mentioned: number }> = {}
    for (const m of mentions || []) {
      if (!byEngine[m.engine]) byEngine[m.engine] = { total: 0, mentioned: 0 }
      byEngine[m.engine].total++
      if (m.mentioned) byEngine[m.engine].mentioned++
    }
    const engineList = Object.entries(byEngine).map(([engine, d]) => ({
      engine, ...d, rate: d.total > 0 ? Math.round((d.mentioned / d.total) * 100) : 0
    })).sort((a, b) => b.rate - a.rate)

    setStats({ mentionRate: total > 0 ? Math.round((mentioned / total) * 100) : null, totalScans: total, clips: clipCount || 0, avgScore })
    setRecentMentions(mentions?.slice(0, 8) || [])
    setEngineStats(engineList)
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      setUser(user)
      const { data: planData } = await supabase.from('users').select('plan').eq('id', user.id).single()
      if (planData) setUserPlan(planData.plan || 'free')
      const { data: b } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
      if (b) {
        setShareSlug(b.share_slug || null)
        const { count: agentCount } = await supabase.from('agents').select('*', { count: 'exact', head: true }).eq('brand_id', b.id).gt('last_run_at', '2000-01-01')
        setAgentRan((agentCount || 0) > 0)
      }
      setBrand(b)
      if (b) await loadData(b.id)
      setLoading(false)
    }
    load()
  }, [])

  const runQuickScan = async () => {
    if (!brand) return
    setScanning(true)
    setScanMsg('Scanning...')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, engines: userPlan === 'free' ? ['perplexity'] : ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude'] }),
      })
      const data = await res.json()
      if (data.error) { setScanMsg(`Error: ${data.error}`); return }
      setScanMsg(`✓ ${data.mentioned}/${data.scraped} mentions detected`)
      await loadData(brand.id)
    } catch { setScanMsg('Scan failed') }
    finally {
      setScanning(false)
      setTimeout(() => setScanMsg(''), 5000)
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 size={20} className="animate-spin text-white/20" />
    </div>
  )

  const hasScanData = stats.totalScans > 0

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {brand ? `${brand.name} overview` : 'Welcome to Clouts'}
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {brand ? `Tracking ${brand.domain} across AI engines` : 'Set up your first brand to start monitoring'}
          </p>
        </div>
        {brand && brand.keywords?.length > 0 && (
          <button onClick={runQuickScan} disabled={scanning}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/[0.07] disabled:opacity-50 transition-colors">
            {scanning ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {scanning ? 'Scanning...' : 'Quick scan'}
          </button>
        )}
      </div>

      {/* Onboarding checklist */}
      {brand && (
        <OnboardingChecklist steps={[
          { id: 'brand',    label: 'Set up your brand',          done: !!brand,                        href: '/dashboard/settings' },
          { id: 'keywords', label: 'Add tracking keywords',      done: (brand?.keywords?.length || 0) > 0, href: '/dashboard/settings' },
          { id: 'scan',     label: 'Run your first AI scan',     done: stats.totalScans > 0,           href: '/dashboard/visibility' },
          { id: 'agent',    label: 'Run the AEO agent',          done: agentRan,                       href: '/dashboard/agents' },
          { id: 'share',    label: 'Share your visibility report', done: !!shareSlug,                  href: '/dashboard/settings' },
        ]} />
      )}

      {scanMsg && (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.08] px-4 py-2.5 text-sm text-violet-300">
          {scanMsg}
        </div>
      )}

      {!brand ? (
        /* No brand yet */
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-8">
          <div className="max-w-lg">
            <h2 className="text-lg font-bold text-white mb-2">Add your first brand</h2>
            <p className="text-sm text-white/40 mb-6">Tell Clouts which brand to monitor across ChatGPT, Perplexity, Gemini, and 4 other AI engines.</p>
            <div className="flex gap-3 mb-6">
              {['1. Add brand domain', '2. Pick keywords', '3. Run first scan'].map((s, i) => (
                <div key={s} className="flex-1 rounded-lg border border-violet-500/15 bg-violet-500/[0.04] px-3 py-2">
                  <p className="text-[10px] font-bold text-violet-400/70 uppercase tracking-widest">{s}</p>
                </div>
              ))}
            </div>
            <Link href="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
              Set up brand <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      ) : !hasScanData ? (
        /* Brand exists but no scans */
        <div className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-10 text-center">
          <Radio size={28} className="mx-auto mb-3 text-violet-400/40" />
          <p className="text-sm font-semibold text-white mb-1">No scans yet for {brand.name}</p>
          <p className="text-xs text-white/30 mb-5">
            {brand.keywords?.length > 0
              ? 'Run your first scan to see how AI engines talk about your brand.'
              : 'Add keywords in Settings first, then run a scan.'}
          </p>
          {brand.keywords?.length > 0 ? (
            <button onClick={runQuickScan} disabled={scanning}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-60 transition-colors">
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Radio size={14} />}
              Run first scan
            </button>
          ) : (
            <Link href="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
              Add keywords →
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'AI Mention Rate', value: stats.mentionRate !== null ? `${stats.mentionRate}%` : '—', color: stats.mentionRate !== null ? (stats.mentionRate >= 50 ? 'text-emerald-400' : stats.mentionRate >= 25 ? 'text-yellow-400' : 'text-red-400') : 'text-white' },
              { label: 'Queries scanned', value: stats.totalScans.toLocaleString(), color: 'text-white' },
              { label: 'Avg visibility score', value: stats.avgScore !== null ? String(stats.avgScore) : '—', color: 'text-white' },
              { label: 'Clips created', value: String(stats.clips), color: 'text-emerald-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-xs text-white/30 mb-1">{label}</p>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Engine breakdown */}
            {engineStats.length > 0 && (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
                  <span className="text-sm font-semibold text-white">By engine</span>
                  <Link href="/dashboard/visibility" className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1">
                    Full report <ChevronRight size={11} />
                  </Link>
                </div>
                <div className="divide-y divide-white/[0.04] p-4 space-y-3">
                  {engineStats.map(({ engine, total, mentioned, rate }) => (
                    <div key={engine} className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: ENGINE_COLORS[engine] || '#666', opacity: 0.8 }} />
                      <span className="text-xs text-white/60 capitalize w-20">{engine}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: ENGINE_COLORS[engine] || '#8b5cf6', opacity: 0.7 }} />
                      </div>
                      <span className={`text-xs font-bold w-10 text-right ${rate >= 50 ? 'text-emerald-400' : rate >= 25 ? 'text-yellow-400' : 'text-white/40'}`}>{rate}%</span>
                      <span className="text-[10px] text-white/20 w-10 text-right">{mentioned}/{total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent mentions */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
                <span className="text-sm font-semibold text-white">Recent mentions</span>
                <Link href="/dashboard/analytics" className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1">
                  Analytics <ChevronRight size={11} />
                </Link>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {recentMentions.slice(0, 6).map((m, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-2.5">
                    <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: ENGINE_COLORS[m.engine] || '#666' }} />
                    <span className="text-[10px] font-semibold capitalize shrink-0" style={{ color: ENGINE_COLORS[m.engine] || '#fff', opacity: 0.8, minWidth: 60 }}>{m.engine}</span>
                    <p className="flex-1 text-xs text-white/40 truncate">{m.prompt}</p>
                    {m.mentioned
                      ? <span className="text-[10px] text-emerald-400 shrink-0">✓</span>
                      : <span className="text-[10px] text-white/20 shrink-0">—</span>}
                    {m.score != null && <span className="text-[10px] font-bold text-white/30 w-5 text-right shrink-0">{m.score}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: '/dashboard/visibility', icon: Radio,    label: 'AI Visibility',  color: 'hover:border-violet-500/30 hover:text-violet-300' },
          { href: '/dashboard/clips',      icon: Scissors, label: 'Create Clip',    color: 'hover:border-emerald-400/30 hover:text-emerald-300' },
          { href: '/dashboard/agents',     icon: Bot,      label: 'Run Agent',      color: 'hover:border-pink-400/30 hover:text-pink-300' },
          { href: '/pricing',              icon: Zap,      label: 'Upgrade Plan',   color: 'hover:border-violet-500/30 hover:text-violet-300' },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-sm font-medium text-white/40 transition-all ${color}`}>
            <Icon size={14} />{label}
          </Link>
        ))}
      </div>
    </div>
  )
}
