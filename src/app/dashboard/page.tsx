import { Radio, TrendingUp, Scissors, Bot, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

const stats = [
  { label: 'AI Mention Rate',   value: '—',  sub: 'Add a brand to start', color: 'text-white' },
  { label: 'AI Impressions',    value: '—',  sub: 'Last 30 days',          color: 'text-white' },
  { label: 'Clips Created',     value: '0',  sub: 'This month',            color: 'text-emerald-400' },
  { label: 'Active Agents',     value: '0',  sub: 'Running now',           color: 'text-white' },
]

const quickActions = [
  { href: '/dashboard/visibility', icon: Radio,    label: 'Track AI Visibility',  desc: 'Monitor ChatGPT, Perplexity, Gemini + more', color: 'bg-violet-500/10 border-violet-500/20 hover:border-violet-500/40' },
  { href: '/dashboard/clips',      icon: Scissors, label: 'Create a Clip',        desc: 'Auto-clip your best brand moments',           color: 'bg-emerald-400/[0.06] border-emerald-400/15 hover:border-emerald-400/40' },
  { href: '/dashboard/agents',     icon: Bot,      label: 'Launch an Agent',      desc: 'AEO, content, PR agents at your service',     color: 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]' },
  { href: '/dashboard/analytics',  icon: TrendingUp, label: 'View Analytics',     desc: 'Track crawls, citations, and bot traffic',    color: 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]' },
]

export default function DashboardPage() {
  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Welcome to Clouts</h1>
        <p className="mt-1 text-sm text-white/40">Set up your first brand to start monitoring AI visibility.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-white/20 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Setup CTA */}
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Add your first brand</h2>
            <p className="text-sm text-white/40 max-w-md">
              Tell Clouts which brand to monitor across ChatGPT, Perplexity, Gemini, Grok and 5 other AI engines.
            </p>
          </div>
          <Link href="/dashboard/settings"
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
            Set up brand <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {['1. Add brand domain', '2. Pick keywords', '3. Start monitoring'].map((step, i) => (
            <div key={step} className="rounded-lg border border-violet-500/15 bg-violet-500/[0.04] px-3 py-2">
              <p className="text-[10px] font-semibold text-violet-400">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickActions.map(({ href, icon: Icon, label, desc, color }) => (
            <Link key={href} href={href}
              className={`group flex items-center gap-4 rounded-xl border p-4 transition-all ${color}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                <Icon size={18} className="text-white/60 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
              <ArrowUpRight size={14} className="ml-auto text-white/20 group-hover:text-white/60 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
