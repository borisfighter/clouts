import { Scissors, Upload, Play } from 'lucide-react'

export default function ClipsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Auto Clips</h1>
          <p className="mt-1 text-sm text-white/40">AI-detected moments clipped and ready to publish</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-[#08090A] hover:opacity-85 transition-opacity">
          <Upload size={14} /> Upload video
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Clips this month', value: '0', color: 'text-emerald-400' },
          { label: 'Published',        value: '0', color: 'text-white' },
          { label: 'Total views',      value: '0', color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="rounded-2xl border border-dashed border-emerald-400/15 bg-emerald-400/[0.02] p-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
          <Scissors size={24} className="text-emerald-400" />
        </div>
        <p className="text-base font-bold text-white/60 mb-1">No clips yet</p>
        <p className="text-sm text-white/30 mb-6 max-w-sm mx-auto">
          Upload a video or connect a brand to auto-detect and clip your best AI mention moments
        </p>
        <div className="flex items-center justify-center gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#08090A] hover:opacity-85 transition-opacity">
            <Upload size={14} /> Upload video
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white/60 hover:border-white/20 hover:text-white transition-colors">
            <Play size={14} /> Watch demo
          </button>
        </div>
      </div>
    </div>
  )
}
