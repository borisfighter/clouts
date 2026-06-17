import { Bot, Play, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const agents = [
  { name: 'AEO Optimizer',    type: 'aeo',     status: 'idle',     lastRun: '2h ago',  nextRun: 'In 4h',  description: 'Rewrites content to rank in AI answers' },
  { name: 'Content Agent',    type: 'content', status: 'running',  lastRun: 'Now',     nextRun: '—',      description: 'Generates AEO-optimized FAQs and articles' },
  { name: 'PR Agent',         type: 'pr',      status: 'idle',     lastRun: '6h ago',  nextRun: 'In 2h',  description: 'Monitors sentiment and drafts responses' },
  { name: 'Shopping Agent',   type: 'shopping',status: 'completed',lastRun: '1h ago',  nextRun: 'In 23h', description: 'Tracks product recommendations in AI' },
]

const statusConfig = {
  idle:      { label: 'Idle',      color: 'text-white/40',   icon: Clock },
  running:   { label: 'Running',   color: 'text-amber-400',  icon: Clock },
  completed: { label: 'Done',      color: 'text-emerald-400',icon: CheckCircle },
  failed:    { label: 'Failed',    color: 'text-red-400',    icon: AlertCircle },
}

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Marketing Agents</h1>
        <p className="text-xs text-white/40 mt-0.5">Autonomous workers for every marketing function</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {agents.map((agent) => {
          const { label, color, icon: StatusIcon } = statusConfig[agent.status as keyof typeof statusConfig]
          return (
            <div key={agent.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                    <Bot size={16} className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{agent.name}</p>
                    <div className={`flex items-center gap-1 text-[11px] font-medium ${color}`}>
                      <StatusIcon size={10} />
                      {label}
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white/50 hover:border-violet-400/40 hover:text-violet-300 transition-colors">
                  <Play size={10} />
                  Run
                </button>
              </div>
              <p className="text-xs text-white/30 mb-3">{agent.description}</p>
              <div className="flex gap-4 text-[11px] text-white/20">
                <span>Last: {agent.lastRun}</span>
                <span>Next: {agent.nextRun}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
