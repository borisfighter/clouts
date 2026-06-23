'use client'

import { useEffect, useState } from 'react'
import { Users, Globe, Radio, Scissors, TrendingUp, Activity, Crown, Zap, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/stats')
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  if (loading || !data) return (
    <div className="flex h-48 items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-red-400" />
    </div>
  )

  const { users, brands, mentions, clips, plans, recentUsers, topBrands } = data

  const statCards = [
    { label: 'Total users',     value: users.total,       sub: `+${users.today} today`,         icon: Users,    color: 'text-blue-400',   link: '/admin/users' },
    { label: 'New (7 days)',    value: users.last7,       sub: `${users.last30} this month`,    icon: TrendingUp, color: 'text-emerald-400', link: '/admin/users' },
    { label: 'Total brands',    value: brands.total,      sub: 'across all users',              icon: Globe,    color: 'text-violet-400', link: '/admin/brands' },
    { label: 'Mentions (7d)',   value: mentions.last7,    sub: `${(mentions.total||0).toLocaleString()} total`,      icon: Radio,    color: 'text-pink-400',   link: '/admin/mentions' },
    { label: 'Total clips',     value: clips.total,       sub: 'all time',                      icon: Scissors, color: 'text-yellow-400', link: '/admin/clips' },
    { label: 'Paid users', value: (plans.starter || 0) + (plans.growth || 0) + (plans.pro || 0) + (plans.team || 0) + (plans.enterprise || 0),
      sub: `${plans.free || 0} free`, icon: Crown, color: 'text-violet-400', link: '/admin/users' },
  ]

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Admin Overview</h1>
          <p className="text-sm text-white/40 mt-1">Real-time platform metrics</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/50 hover:text-white transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {data._partial && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] px-4 py-3 text-xs text-yellow-300 flex items-center gap-2">
          <span>⚠</span>
          <span>Showing aggregate counts only — add <code className="font-mono bg-white/10 px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> in Vercel for per-user data, recent signups, and plan breakdown.</span>
        </div>
      )}

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {statCards.map(({ label, value, sub, icon: Icon, color, link }) => (
          <Link key={label} href={link}
            className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 hover:border-white/[0.14] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs text-white/30">{label}</p>
              <Icon size={15} className={`${color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            </div>
            <p className={`text-3xl font-black ${color}`}>{(value || 0).toLocaleString()}</p>
            <p className="text-xs text-white/20 mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <h2 className="text-sm font-bold text-white mb-4">Plan distribution</h2>
        <div className="flex gap-3">
          {[
            { key: 'free',       label: 'Free',       color: 'bg-white/20',    textColor: 'text-white/60' },
            { key: 'starter',    label: 'Starter',    color: 'bg-blue-500',    textColor: 'text-blue-300' },
            { key: 'growth',     label: 'Growth',     color: 'bg-violet-500',  textColor: 'text-violet-300' },
            { key: 'enterprise', label: 'Enterprise', color: 'bg-emerald-500', textColor: 'text-emerald-300' },
          ].map(({ key, label, color, textColor }) => {
            const count = key === 'free' ? (plans.free || 0) : key === 'growth' ? ((plans.growth || 0) + (plans.pro || 0)) : key === 'enterprise' ? ((plans.enterprise || 0) + (plans.team || 0)) : (plans[key] || 0)
            const total = users.total || 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={key} className="flex-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className={`h-1 w-full rounded-full ${color} opacity-40 mb-3`} />
                <p className={`text-2xl font-black ${textColor}`}>{count}</p>
                <p className="text-xs text-white/30 mt-0.5">{label} · {pct}%</p>
              </div>
            )
          })}
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/[0.05] overflow-hidden flex">
          {[
            { key: 'free',       color: 'bg-white/20' },
            { key: 'starter',    color: 'bg-blue-500/70' },
            { key: 'growth',     color: 'bg-violet-500/70' },
            { key: 'enterprise', color: 'bg-emerald-500/70' },
          ].map(({ key, color }) => {
            const count = key === 'free' ? (plans.free || 0) : key === 'growth' ? ((plans.growth || 0) + (plans.pro || 0)) : key === 'enterprise' ? ((plans.enterprise || 0) + (plans.team || 0)) : (plans[key] || 0)
            const pct = Math.round((count / (users.total || 1)) * 100)
            return <div key={key} className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent signups */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Recent signups</span>
            <Link href="/admin/users" className="text-xs text-white/30 hover:text-white">View all →</Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {(recentUsers || []).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold">
                  {u.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 truncate">{u.email}</p>
                  <p className="text-[10px] text-white/20">{new Date(u.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                  u.plan === 'enterprise' || u.plan === 'team' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                  u.plan === 'growth' || u.plan === 'pro' ? 'text-violet-400 bg-violet-400/10 border-violet-400/20' :
                  u.plan === 'starter' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                  'text-white/30 bg-white/[0.04] border-white/[0.08]'
                }`}>{u.plan || 'free'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top brands */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Latest brands</span>
            <Link href="/admin/brands" className="text-xs text-white/30 hover:text-white">View all →</Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {(topBrands || []).map((b: any) => (
              <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-white/60">
                  {b.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/70 truncate font-medium">{b.name}</p>
                  <p className="text-[10px] text-white/30 truncate">{b.domain} · {(b.keywords || []).length} keywords</p>
                </div>
                <p className="text-[10px] text-white/20 shrink-0">{new Date(b.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
