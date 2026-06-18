export default function CompetitorsLoading() {
  return (
    <div className="max-w-4xl space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-64 rounded bg-white/[0.04]" />
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] h-32" />
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] h-64" />
    </div>
  )
}
