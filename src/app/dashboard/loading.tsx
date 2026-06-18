export default function DashboardLoading() {
  return (
    <div className="max-w-6xl space-y-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-64 rounded-lg bg-white/[0.04]" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-2">
            <div className="h-3 w-24 rounded bg-white/[0.06]" />
            <div className="h-8 w-16 rounded-lg bg-white/[0.08]" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] h-52" />
        ))}
      </div>
    </div>
  )
}
