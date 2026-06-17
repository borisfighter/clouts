import { Radio, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const engines = [
  { name: 'ChatGPT',    score: null, trend: null, mentions: 0 },
  { name: 'Perplexity', score: null, trend: null, mentions: 0 },
  { name: 'Gemini',     score: null, trend: null, mentions: 0 },
  { name: 'Claude',     score: null, trend: null, mentions: 0 },
  { name: 'Grok',       score: null, trend: null, mentions: 0 },
  { name: 'Copilot',    score: null, trend: null, mentions: 0 },
  { name: 'Meta AI',    score: null, trend: null, mentions: 0 },
  { name: 'Google AIO', score: null, trend: null, mentions: 0 },
]

export default function VisibilityPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Visibility</h1>
          <p className="mt-1 text-sm text-white/40">How AI engines talk about your brand</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 focus:outline-none">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Overall mention rate', value: '—' },
          { label: 'Total AI impressions',  value: '—' },
          { label: 'Avg visibility score',  value: '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Engine breakdown */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="border-b border-white/[0.07] px-5 py-3 flex items-center gap-2">
          <Radio size={14} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Engine breakdown</span>
          <span className="ml-auto text-xs text-white/20">Add a brand to see data</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {engines.map(({ name, score, mentions }) => (
            <div key={name} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-28 text-sm font-medium text-white/70">{name}</div>
              <div className="flex-1">
                <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500/30" style={{ width: '0%' }} />
                </div>
              </div>
              <div className="w-10 text-right text-sm font-bold text-white/30">—</div>
              <div className="w-20 text-right text-xs text-white/20">0 mentions</div>
              <Minus size={12} className="text-white/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      <div className="rounded-2xl border border-dashed border-white/[0.10] p-12 text-center">
        <Radio size={32} className="mx-auto mb-3 text-white/10" />
        <p className="text-sm font-medium text-white/30">No brand configured yet</p>
        <p className="text-xs text-white/20 mt-1 mb-4">Add your brand domain in Settings to start tracking AI mentions</p>
        <a href="/dashboard/settings"
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
          Add brand
        </a>
      </div>
    </div>
  )
}
