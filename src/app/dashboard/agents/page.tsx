import { Bot, Plus, Zap } from 'lucide-react'

const agentTypes = [
  { type: 'aeo',     label: 'AEO Agent',     desc: 'Rewrites content to rank in AI answers',         color: 'border-violet-500/20 bg-violet-500/[0.04]' },
  { type: 'content', label: 'Content Agent',  desc: 'Generates AEO-optimized FAQs and articles',     color: 'border-blue-500/20 bg-blue-500/[0.04]' },
  { type: 'pr',      label: 'PR Agent',       desc: 'Monitors sentiment, drafts press responses',    color: 'border-pink-500/20 bg-pink-500/[0.04]' },
]

export default function AgentsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Marketing Agents</h1>
          <p className="mt-1 text-sm text-white/40">Autonomous workers for every marketing function</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
          <Plus size={14} /> New agent
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {agentTypes.map(({ label, desc, color }) => (
          <div key={label} className={`rounded-2xl border p-5 cursor-pointer hover:scale-[1.01] transition-transform ${color}`}>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]">
              <Bot size={16} className="text-white/60" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{label}</h3>
            <p className="text-xs text-white/40">{desc}</p>
            <button className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300">
              <Zap size={11} /> Launch
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
        <Bot size={28} className="mx-auto mb-3 text-white/10" />
        <p className="text-sm font-medium text-white/30 mb-1">No agents running</p>
        <p className="text-xs text-white/20">Launch an agent above to start automating your marketing</p>
      </div>
    </div>
  )
}
