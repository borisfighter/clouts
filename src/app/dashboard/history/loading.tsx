export default function HistoryLoading() {
  return (
    <div className="max-w-4xl space-y-6 animate-pulse">
      <div className="h-7 w-40 rounded-lg bg-white/[0.06]" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-2">
            <div className="h-3 w-24 rounded bg-white/[0.06]" />
            <div className="h-8 w-16 rounded-lg bg-white/[0.08]" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] h-64" />
    </div>
  )
}
