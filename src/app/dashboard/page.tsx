'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Radio, TrendingUp, Scissors, Bot, ArrowUpRight, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const supabase = createClient()
  const [brand, setBrand] = useState<any>(null)
  const [stats, setStats] = useState({ mentionRate: null as number | null, totalScans: 0, clips: 0, agents: 0 })
  const [recentMentions, setRecentMentions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)

      const { data: b } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
      setBrand(b)

      if (b) {
        const [{ data: mentions }, { count: clipCount }, { count: agentCount }] = await Promise.all([
          supabase.from('mentions').select('mentioned, score, engine, prompt, scraped_at').eq('brand_id', b.id).order('scraped_at', { ascending: false }).limit(100),
          supabase.from('clips').select('*', { count: 'exact', head: true }).eq('brand_id', b.id),
          supabase.from('agents').select('*', { count: 'exact', head: true }).eq('brand_id', b.id).eq('status', 'running'),
        ])
        const total = mentions?.length || 0
        const mentioned = mentions?.filter(m => m.mentioned).length || 0
        setStats({
          mentionRate: total > 0 ? Math.round((mentioned / total) * 100) : null,
          totalScans: total,
          clips: clipCount || 0,
          agents: agentCount || 0,
        })
        setRecentMentions(mentions?.slice(0, 5) || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const runQuickScan = async () => {
    if (!brand) return
    setScanning(true)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id }),
      })
      const data = await res.json()
      if (!data.error) {
        // Reload stats
        const { data: mentions } = await supabase.from('mentions').select('mentioned').eq('brand_id', brand.id).limit(100)
        const total = mentions?.length || 0
        const mentioned = mentions?.filter(m => m.mentioned).length || 0
        setStats(s => ({ ...s, mentionRate: total > 0 ? Math.round((mentioned / total) * 100) : null, totalScans: total }))
      }
    } finally {
      setScanning(false)
    }
  }

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  const displayStats = [
    { label: 'AI Mention Rate',  value: stats.mentionRate !== null ? `${stats.mentionRate}%` : '—',  color: stats.mentionRate !== null ? 'text-emerald-400' : 'text-white' },
    { label: 'Queries scanned',  value: stats.totalScans > 0 ? String(stats.totalScans) : '—',       color: 'text-white' },
    { label: 'Clips created',    value: stats.clips > 0 ? String(stats.clips) : '0',                color: 'text-emerald-400' },
    { label: 'Active agents',    value: stats.agents > 0 ? String(stats.agents) : '0',              color: 'text-white' },
  ]

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {displayStats.map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {!brand ? (
        /* Setup CTA */
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white mb-1">Add your first brand</h2>
              <p className="text-sm text-white/40 max-w-md">Tell Clouts which brand to monitor across ChatGPT, Perplexity, Gemini, and 5 other AI engines.</p>
            </div>
            <Link href="/dashboard/settings"
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
              Set up brand <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {['1. Add brand domain', '2. Pick keywords', '3. Start monitoring'].map(s => (
              <div key={s} className="rounded-lg border border-violet-500/15 bg-violet-500/[0.04] px-3 py-2">
                <p className="text-[10px] font-semibold text-violet-400">{s}</p>
              </div>
            ))}
          </div>
        </div>
      ) : stats.totalScans === 0 ? (
        /* No scans yet */
        <div className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.04] p-8 text-center">
          <Radio size={28} className="mx-auto mb-3 text-violet-400/40" />
          <p className="text-sm font-semibold text-white mb-1">No scans yet for {brand.name}</p>
          <p className="text-xs text-white/30 mb-5">
            {brand.keywords?.length > 0 ? 'Run your first scan to see how AI engines talk about your brand.' : 'Add keywords in Settings first, then run a scan.'}
          </p>
          {brand.keywords?.length > 0 ? (
            <button onClick={runQuickScan} disabled={scanning}
              className="flex items-center gap-2 mx-auto rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60 transition-colors">
              {scanning ? <Loader2 size={14} className="animate-spin" /> : <Radio size={14} />}
              Run first scan
            </button>
          ) : (
            <Link href="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
              Add keywords →
            </Link>
          )}
        </div>
      ) : (
        /* Recent activity */
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Recent mentions</span>
            <Link href="/dashboard/visibility" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentMentions.map((m, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className="min-w-[80px] text-xs font-semibold text-violet-300 capitalize">{m.engine}</span>
                <p className="flex-1 text-xs text-white/40 truncate">{m.prompt}</p>
                {m.mentioned ? (
                  <span className="rounded-full bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">✓</span>
                ) : (
                  <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/20">—</span>
                )}
                {m.score !== null && <span className="text-xs font-bold text-white/40 w-6 text-right">{m.score}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: '/dashboard/visibility', icon: Radio,       label: 'AI Visibility',   color: 'hover:border-violet-500/30' },
          { href: '/dashboard/clips',      icon: Scissors,    label: 'Create Clip',     color: 'hover:border-emerald-400/30' },
          { href: '/dashboard/agents',     icon: Bot,         label: 'Launch Agent',    color: 'hover:border-white/[0.15]' },
          { href: '/pricing',              icon: TrendingUp,  label: 'Upgrade Plan',    color: 'hover:border-white/[0.15]' },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-sm font-medium text-white/60 hover:text-white transition-all ${color}`}>
            <Icon size={14} />{label}
          </Link>
        ))}
      </div>
    </div>
  )
}
