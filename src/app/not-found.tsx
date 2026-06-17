import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090A] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-8xl font-black text-white/10 mb-4">404</p>
        <h1 className="text-2xl font-black text-white mb-2">Page not found</h1>
        <p className="text-white/40 mb-8">This page doesn't exist or was moved.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard" className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold hover:bg-violet-500 transition-colors">Dashboard</Link>
          <Link href="/" className="text-sm text-white/40 hover:text-white">Homepage →</Link>
        </div>
      </div>
    </div>
  )
}
