import { Scissors, Layout, Upload, TrendingUp } from 'lucide-react'

const clipFeatures = [
  { icon: Scissors, title: 'Auto-Clip Engine',   description: 'Detects high-value moments and clips them automatically. No manual scrubbing.' },
  { icon: Layout,   title: 'Format Conversion',  description: 'Export in 9:16, 1:1, 16:9. Captions, b-roll, and branding auto-applied.' },
  { icon: Upload,   title: 'One-Click Publish',  description: 'Push directly to TikTok, Instagram, YouTube Shorts, and LinkedIn.' },
  { icon: TrendingUp, title: 'Clip Analytics',   description: 'Track views, shares, and downstream traffic from every published clip.' },
]

export function ClipsSection() {
  return (
    <section id="clips" className="border-y border-emerald-400/[0.08] bg-emerald-400/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left: copy + feature cards */}
          <div>
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-400">
              ✂ Clips — Content Repurposing
            </div>
            <h2 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white lg:text-5xl">
              Turn AI mentions into{' '}
              <span className="text-emerald-400">viral short clips</span>
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-white/40">
              Every time your brand gets cited in an AI answer, Clouts auto-generates shareable
              video clips optimized for TikTok, Reels, Shorts, and LinkedIn. Like Vyro and
              Plaform — built right into your visibility dashboard.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {clipFeatures.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-all hover:border-emerald-400/20"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10">
                    <Icon size={15} className="text-emerald-400" />
                  </div>
                  <h3 className="mb-1 text-xs font-bold text-white">{title}</h3>
                  <p className="text-xs leading-relaxed text-white/40">{description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: clip studio mockup */}
          <div className="rounded-2xl border border-emerald-400/20 bg-[#0f1011] overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#161718] px-4 py-2.5">
              <div className="h-2 w-2 rounded-sm bg-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">✂ Clouts Clip Studio</span>
              <span className="ml-auto text-[10px] text-white/20">3 moments detected</span>
            </div>

            <div className="p-4">
              {/* Video preview */}
              <div className="relative mb-3 flex aspect-video items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-400/10">
                  <div className="ml-0.5 h-0 w-0 border-b-[7px] border-l-[12px] border-t-[7px] border-b-transparent border-l-emerald-400 border-t-transparent" />
                </div>
                <span className="absolute bottom-2 left-3 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">LIVE PREVIEW</span>
                <span className="absolute bottom-2 right-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white/40">0:28 / 1:45</span>
              </div>

              {/* Timeline */}
              <div className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="mb-2 text-[10px] text-white/30">Timeline — drag to trim</p>
                <div className="relative h-6 overflow-hidden rounded bg-white/[0.04]">
                  <div className="h-full w-[65%] rounded bg-emerald-400/20" />
                  <div className="absolute inset-y-0 left-[20%] w-[45%] rounded border-2 border-emerald-400">
                    <div className="absolute inset-y-1 left-0.5 w-0.5 rounded-sm bg-emerald-400" />
                    <div className="absolute inset-y-1 right-0.5 w-0.5 rounded-sm bg-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Format picker */}
              <p className="mb-2 text-[10px] text-white/30">Export format</p>
              <div className="mb-3 grid grid-cols-3 gap-2">
                {[
                  { label: '9:16', icon: '📱', active: true },
                  { label: '1:1',  icon: '⬜', active: false },
                  { label: '16:9', icon: '🖥️', active: false },
                ].map(({ label, icon, active }) => (
                  <button
                    key={label}
                    className={`rounded-lg border py-2 text-center text-[10px] font-semibold transition-colors ${
                      active
                        ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-400'
                        : 'border-white/[0.06] text-white/30 hover:border-emerald-400/30 hover:text-emerald-300'
                    }`}
                  >
                    <div className="mb-0.5 text-sm">{icon}</div>
                    {label}
                  </button>
                ))}
              </div>

              {/* Options */}
              <div className="mb-3 flex gap-2">
                {['Auto captions', 'Add logo'].map((opt) => (
                  <div key={opt} className="flex flex-1 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
                    <div className="h-3 w-3 rounded-sm bg-emerald-400/80" />
                    <span className="text-[10px] text-white/40">{opt}</span>
                  </div>
                ))}
              </div>

              {/* Export button */}
              <button className="w-full rounded-xl bg-emerald-400 py-2.5 text-sm font-bold text-[#08090A] transition-opacity hover:opacity-85">
                ✂ Export Clip
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
