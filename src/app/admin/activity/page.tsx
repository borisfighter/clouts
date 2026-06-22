'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2, RefreshCw, Radio, Scissors, Bot, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const EVENT_ICONS: Record<string, any> = {
  scan: Radio, clip: Scissors, agent: Bot, signup: User,
}
const EVENT_COLORS: Record<string, string> = {
  scan:   'text-violet-400 bg-violet-400/10 border-violet-400/15',
  clip:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/15',
  agent:  'text-blue-400 bg-blue-400/10 border-blue-400/15',
  signup: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/15',
}

export default function AdminActivityPage() {
  const supabase = createClient()
  const [feed, setFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'scan'|'clip'|'agent'|'signup'>('all')
  const [counts, setCounts] = useState({ all: 0, scan: 0, clip: 0, agent: 0, signup: 0 })

  const load = useCallback(async () => {
    setLoading(true)
    const since = new Date(Date.now() - 7 * 86400000).toISOString()

    const [{ data: m }, { data: c }, { data: a }, { data: u }] = await Promise.all([
      supabase.from('mentions')
        .select('id, engine, mentioned, scraped_at, brands(name, users(email))')
        .gte('scraped_at', since).order('scraped_at', { ascending: false }).limit(150),
      supabase.from('clips')
        .select('id, title, status, created_at, brands(name, users(email))')
        .gte('created_at', since).order('created_at', { ascending: false }).limit(50),
      supabase.from('agent_runs')
        .select('id, status, started_at, agents(type, brands(name, users(email)))')
        .gte('started_at', since).order('started_at', { ascending: false }).limit(50),
      supabase.from('users')
        .select('id, email, created_at, plan')
        .gte('created_at', since).order('created_at', { ascending: false }).limit(30),
    ])

    const scans = (m || []).map((x: any) => ({
      type: 'scan', at: x.scraped_at,
      email: x.brands?.users?.email || 'unknown',
      brand: x.brands?.name || '—',
      desc: `${x.engine} — ${x.mentioned ? '✓ mentioned' : '✗ not mentioned'}`,
    }))
    const clipItems = (c || []).map((x: any) => ({
      type: 'clip', at: x.created_at,
      email: x.brands?.users?.email || 'unknown',
      brand: x.brands?.name || '—',
      desc: `Clip: "${x.title || 'untitled'}" (${x.status})`,
    }))
    const agentItems = (a || []).map((x: any) => ({
      type: 'agent', at: x.started_at,
      email: x.agents?.brands?.users?.email || 'unknown',
      brand: x.agents?.brands?.name || '—',
      desc: `${x.agents?.type || 'unknown'} agent — ${x.status}`,
    }))
    const signupItems = (u || []).map((x: any) => ({
      type: 'signup', at: x.created_at,
      email: x.email, brand: '—',
      desc: `New signup · ${x.plan || 'free'} plan`,
    }))

    const all = [...scans, ...clipItems, ...agentItems, ...signupItems].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    setFeed(all)
    setCounts({ all: all.length, scan: scans.length, clip: clipItems.length, agent: agentItems.length, signup: signupItems.length })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filter === 'all' ? feed : feed.filter(e => e.type === filter)

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Activity Feed</h1>
          <p className="text-sm text-white/40 mt-1">Last 7 days — scans, clips, agents, signups</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/50 hover:text-white transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'scan', 'clip', 'agent', 'signup'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${filter === f ? 'border-violet-500/40 bg-violet-500/10 text-violet-300' : 'border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white'}`}>
            {f} <span className="text-white/30 font-normal ml-1">{counts[f]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={18} className="animate-spin text-white/20" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.07] p-12 text-center">
          <p className="text-sm text-white/30">No activity in the last 7 days</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3 grid grid-cols-12 gap-4">
            <p className="col-span-1 text-[10px] font-bold text-white/30 uppercase tracking-widest">Type</p>
            <p className="col-span-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">User</p>
            <p className="col-span-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Brand</p>
            <p className="col-span-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">Action</p>
            <p className="col-span-2 text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">When</p>
          </div>
          <div className="divide-y divide-white/[0.03] max-h-[600px] overflow-y-auto">
            {filtered.map((item, i) => {
              const Icon = EVENT_ICONS[item.type] || Radio
              const clr = EVENT_COLORS[item.type] || EVENT_COLORS.scan
              const mins = Math.round((Date.now() - new Date(item.at).getTime()) / 60000)
              const rel = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.round(mins/60)}h ago` : `${Math.round(mins/1440)}d ago`
              return (
                <div key={i} className="grid grid-cols-12 gap-4 items-center px-5 py-2.5 hover:bg-white/[0.01]">
                  <div className="col-span-1">
                    <span className={`inline-flex items-center justify-center h-6 w-6 rounded-lg border ${clr}`}>
                      <Icon size={10} />
                    </span>
                  </div>
                  <p className="col-span-3 text-xs text-white/60 truncate">{item.email}</p>
                  <p className="col-span-2 text-xs text-white/40 truncate">{item.brand}</p>
                  <p className="col-span-4 text-xs text-white/50 truncate">{item.desc}</p>
                  <p className="col-span-2 text-[10px] text-white/25 text-right whitespace-nowrap">{rel}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
