'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error('App error:', error) }, [error])
  return (
    <div className="min-h-screen bg-[#08090A] flex items-center justify-center text-white">
      <div className="text-center max-w-md px-6">
        <p className="text-6xl mb-4">⚠️</p>
        <h1 className="text-2xl font-black mb-2">Something went wrong</h1>
        <p className="text-white/40 text-sm mb-8">An unexpected error occurred. Our team has been notified.</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold hover:bg-violet-500 transition-colors">Try again</button>
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white">Go to dashboard</Link>
        </div>
      </div>
    </div>
  )
}
