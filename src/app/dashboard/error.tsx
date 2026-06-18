'use client'

import { useEffect } from 'react'

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error('Dashboard error:', error) }, [error])
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <p className="text-white/40 text-sm">Something went wrong loading this page.</p>
      <button onClick={reset} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">
        Try again
      </button>
    </div>
  )
}
