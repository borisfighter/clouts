export default function VisibilityLoading() {
  return (
    <div className="max-w-5xl space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-56 rounded bg-white/[0.04]" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-36 rounded-xl bg-white/[0.05]" />
          <div className="h-9 w-28 rounded-xl bg-violet-500/20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-2">
            <div className="h-3 w-20 rounded bg-white/[0.06]" />
            <div className="h-8 w-14 rounded-lg bg-white/[0.08]" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04]">
            <div className="h-2.5 w-2.5 rounded-full bg-white/[0.08]" />
            <div className="w-24 h-4 rounded bg-white/[0.06]" />
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.05]" />
            <div className="w-10 h-4 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  )
}
