import Link from 'next/link'

export default function ShareReportNotFound() {
  return (
    <div className="min-h-screen bg-[#08090A] flex items-center justify-center text-white">
      <div className="text-center max-w-sm px-6">
        <p className="text-6xl mb-4">📊</p>
        <h1 className="text-xl font-black text-white mb-2">Report not found</h1>
        <p className="text-white/40 text-sm mb-8">This share link may have expired or the brand has been removed.</p>
        <Link href="/auth/signup"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
          Create your own report →
        </Link>
      </div>
    </div>
  )
}
