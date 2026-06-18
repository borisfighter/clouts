export default function ShareReportLoading() {
  return (
    <div className="min-h-screen bg-[#08090A] text-white animate-pulse">
      <div className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
        <div className="h-6 w-20 rounded bg-white/[0.06]" />
        <div className="h-4 w-48 rounded bg-white/[0.04]" />
      </div>
      <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="h-3 w-40 rounded bg-white/[0.06] mx-auto" />
          <div className="h-10 w-64 rounded bg-white/[0.08] mx-auto" />
          <div className="h-4 w-28 rounded bg-white/[0.04] mx-auto" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center space-y-2">
              <div className="h-3 w-24 rounded bg-white/[0.05] mx-auto" />
              <div className="h-12 w-20 rounded bg-white/[0.08] mx-auto" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] h-64" />
      </div>
    </div>
  )
}
