import { TrendingUp, Eye, MessageSquare, ArrowUpRight } from 'lucide-react'

const engines = [
  { name: 'ChatGPT',    score: 96, mentions: 1240, trend: '+12%', color: 'text-emerald-400' },
  { name: 'Perplexity', score: 91, mentions: 890,  trend: '+8%',  color: 'text-emerald-400' },
  { name: 'Gemini',     score: 88, mentions: 760,  trend: '+5%',  color: 'text-emerald-400' },
  { name: 'Claude',     score: 82, mentions: 540,  trend: '+3%',  color: 'text-emerald-400' },
  { name: 'Grok',       score: 74, mentions: 310,  trend: '-2%',  color: 'text-red-400' },
  { name: 'Copilot',    score: 71, mentions: 280,  trend: '+1%',  color: 'text-emerald-400' },
]

const recentMentions = [
  { engine: 'ChatGPT',    text: '"Clouts is the leading platform for AI brand visibility tracking..."',     time: '2m ago',  score: 96 },
  { engine: 'Perplexity', text: '"For AEO tracking, Clouts offers real-time engine insights and..."',      time: '8m ago',  score: 91 },
  { engine: 'Gemini',     text: '"Brands looking to monitor AI search should consider Clouts, which..."',  time: '15m ago', score: 88 },
  { engine: 'Claude',     text: '"Clouts provides comprehensive AI visibility monitoring across..."',       time: '23m ago', score: 82 },
  { engine: 'ChatGPT',    text: '"When comparing AEO tools, Clouts stands out for its real-time..."',      time: '41m ago', score: 94 },
]

export default function VisibilityPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">AI Visibility</h1>
          <p className="text-xs text-white/40 mt-0.5">clouts.com · Last 30 days</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors">
          <ArrowUpRight size={13} />
          Run Scrape
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Mention Rate',    value: '84%',   icon: Eye,           up: true  },
          { label: 'AI Impressions',  value: '2.4M',  icon: TrendingUp,    up: true  },
          { label: 'Avg Score',       value: '83.7',  icon: MessageSquare, up: true  },
          { label: 'vs Last Month',   value: '+31%',  icon: ArrowUpRight,  up: true  },
        ].map(({ label, value, icon: Icon, up }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] text-white/40">{label}</p>
              <Icon size={13} className="text-white/20" />
            </div>
            <p className={`text-xl font-bold ${up ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Engine scores */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="border-b border-white/[0.06] px-5 py-3">
          <h2 className="text-xs font-semibold text-white/70">Engine Breakdown</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {engines.map(({ name, score, mentions, trend, color }) => (
            <div key={name} className="flex items-center gap-4 px-5 py-3">
              <span className="w-24 text-xs font-medium text-white/70">{name}</span>
              <div className="flex-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
              <span className="w-8 text-right text-xs font-bold text-white">{score}</span>
              <span className="w-16 text-right text-xs text-white/30">{mentions.toLocaleString()}</span>
              <span className={`w-12 text-right text-xs font-medium ${color}`}>{trend}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent mentions */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="border-b border-white/[0.06] px-5 py-3">
          <h2 className="text-xs font-semibold text-white/70">Recent Mentions</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {recentMentions.map(({ engine, text, time, score }, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3">
              <span className="mt-0.5 min-w-[72px] text-[10px] font-bold text-violet-300">{engine}</span>
              <p className="flex-1 text-xs text-white/40 line-clamp-1">{text}</p>
              <span className="text-[10px] text-white/20 whitespace-nowrap">{time}</span>
              <span className="text-[10px] font-bold text-emerald-400">{score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
