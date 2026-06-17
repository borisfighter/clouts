const mentions = [
  { engine: 'ChatGPT',    text: '"Clouts is the leading platform for AI brand visibility..."', score: 96 },
  { engine: 'Perplexity', text: '"For AEO tracking, Clouts offers real-time engine insights..."', score: 91 },
  { engine: 'Gemini',     text: '"Brands use Clouts to monitor and optimize AI search..."',   score: 88 },
]

const bars = [40, 55, 50, 70, 65, 90, 80, 75, 95, 100]

export function DashboardPreview() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1011]">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#161718] px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="mx-4 flex-1 rounded-md border border-white/[0.06] bg-[#08090A] px-3 py-1 text-center text-xs text-white/30">
            app.clouts.com — AI Visibility Dashboard
          </div>
        </div>

        {/* Dashboard body */}
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_220px]">
          {/* Sidebar */}
          <div className="hidden border-r border-white/[0.06] p-4 md:block">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/20">Platform</p>
            {['AI Visibility', 'Prompt Volumes', 'Brand Mentions', 'Agent Analytics', 'AEO Optimizer'].map((item, i) => (
              <div
                key={item}
                className={`mb-0.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium cursor-default ${
                  i === 0
                    ? 'bg-violet-500/15 text-violet-300'
                    : 'text-white/30 hover:bg-white/[0.04] hover:text-white/60'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-violet-400' : 'bg-current'}`} />
                {item}
              </div>
            ))}
            <div className="my-3 h-px bg-white/[0.06]" />
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">✂ Clips</p>
            {['Auto Clips', 'My Library', 'Publish Queue'].map((item) => (
              <div key={item} className="mb-0.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-white/30 hover:text-white/60 cursor-default">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/50" />
                {item}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="p-5">
            <p className="mb-4 text-xs font-semibold text-white/60">AI Visibility — clouts.com — Last 30 days</p>

            {/* Stats */}
            <div className="mb-4 grid grid-cols-3 gap-2">
              {[
                { val: '84%', lbl: 'Mention Rate', up: true },
                { val: '2.4M', lbl: 'AI Impressions', up: false },
                { val: '+31%', lbl: 'vs Last Month', up: true },
              ].map(({ val, lbl, up }) => (
                <div key={lbl} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                  <div className={`text-lg font-bold ${up ? 'text-emerald-400' : 'text-white'}`}>{val}</div>
                  <div className="mt-0.5 text-[10px] text-white/30">{lbl}</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="mb-4 flex h-20 items-end gap-1.5">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm transition-colors ${
                    h >= 90 ? 'bg-violet-500' : 'bg-violet-500/25 hover:bg-violet-500/50'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>

            {/* Mentions feed */}
            <div className="space-y-2">
              {mentions.map(({ engine, text, score }) => (
                <div key={engine} className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs">
                  <span className="min-w-[64px] font-semibold text-violet-300">{engine}</span>
                  <span className="flex-1 truncate text-white/30">{text}</span>
                  <span className="font-semibold text-emerald-400">{score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clip panel */}
          <div className="hidden border-l border-white/[0.06] bg-emerald-400/[0.02] p-4 md:block">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-sm bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Auto Clips</span>
            </div>
            <p className="mb-3 text-[10px] text-white/30">3 clips ready from today</p>

            {[
              { label: 'ChatGPT Brand Mention', meta: ':28s · 9:16 · Today' },
              { label: 'Perplexity Citation Clip', meta: ':45s · 16:9 · Today' },
            ].map(({ label, meta }) => (
              <div key={label} className="mb-4">
                <div className="group mb-2 flex aspect-video cursor-pointer items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] transition-colors hover:border-emerald-400/40">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400/10">
                    <div className="ml-0.5 h-0 w-0 border-b-[5px] border-l-[8px] border-t-[5px] border-b-transparent border-l-emerald-400 border-t-transparent" />
                  </div>
                </div>
                <p className="text-[10px] font-medium text-white/70">{label}</p>
                <p className="mb-2 text-[10px] text-white/30">{meta}</p>
                <div className="flex gap-1.5">
                  {['✂ Trim', '↗ Export', '⊕ Share'].map((action) => (
                    <button key={action} className="flex-1 rounded border border-white/[0.08] py-1 text-[9px] font-medium text-white/30 transition-colors hover:border-emerald-400/40 hover:text-emerald-400">
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
