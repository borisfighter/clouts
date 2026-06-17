import { Scissors, Upload, Play, Clock, CheckCircle } from 'lucide-react'

const clips = [
  { id: 1, title: 'ChatGPT Brand Mention',     status: 'ready',      format: '9:16',  duration: '0:28', engine: 'ChatGPT',    date: 'Today' },
  { id: 2, title: 'Perplexity Citation Clip',  status: 'ready',      format: '16:9',  duration: '0:45', engine: 'Perplexity', date: 'Today' },
  { id: 3, title: 'Gemini Recommendation',     status: 'processing', format: '1:1',   duration: '0:32', engine: 'Gemini',     date: 'Today' },
  { id: 4, title: 'Claude AI Visibility',      status: 'published',  format: '9:16',  duration: '0:52', engine: 'Claude',     date: 'Yesterday' },
  { id: 5, title: 'Grok Brand Analysis',       status: 'published',  format: '16:9',  duration: '1:05', engine: 'Grok',       date: 'Yesterday' },
]

const statusConfig = {
  ready:      { label: 'Ready',      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle },
  processing: { label: 'Processing', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',       icon: Clock },
  published:  { label: 'Published',  color: 'text-violet-300 bg-violet-500/10 border-violet-500/20',    icon: CheckCircle },
}

export default function ClipsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Auto Clips</h1>
          <p className="text-xs text-white/40 mt-0.5">AI mention clips ready to publish</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 hover:border-white/20 hover:text-white transition-colors">
          <Upload size={13} />
          Upload Video
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Ready to Export', value: '2', color: 'text-emerald-400' },
          { label: 'Processing',      value: '1', color: 'text-amber-400' },
          { label: 'Published',       value: '2', color: 'text-violet-300' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-[11px] text-white/30">{label}</p>
          </div>
        ))}
      </div>

      {/* Clips grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clips.map((clip) => {
          const { label, color, icon: StatusIcon } = statusConfig[clip.status as keyof typeof statusConfig]
          return (
            <div key={clip.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/10 transition-colors group">
              {/* Thumbnail */}
              <div className="relative flex aspect-video items-center justify-center bg-white/[0.03] cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 group-hover:border-emerald-400/70 transition-colors">
                  <Play size={16} className="text-emerald-400 ml-0.5" />
                </div>
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/70">{clip.format}</span>
                <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/50">{clip.duration}</span>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs font-medium text-white/80 leading-snug">{clip.title}</p>
                  <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${color}`}>
                    <StatusIcon size={9} />
                    {label}
                  </span>
                </div>
                <p className="text-[11px] text-white/30">{clip.engine} · {clip.date}</p>

                {clip.status === 'ready' && (
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-lg border border-white/10 py-1.5 text-[11px] font-medium text-white/50 hover:border-emerald-400/40 hover:text-emerald-400 transition-colors">
                      ✂ Trim
                    </button>
                    <button className="flex-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 py-1.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-400/20 transition-colors">
                      ↗ Export
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Upload new */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-8 text-center hover:border-white/20 transition-colors cursor-pointer group">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] group-hover:border-white/20 transition-colors">
            <Scissors size={16} className="text-white/30" />
          </div>
          <p className="text-xs font-medium text-white/40">Add new clip</p>
          <p className="mt-1 text-[11px] text-white/20">Upload or auto-detect</p>
        </div>
      </div>
    </div>
  )
}
