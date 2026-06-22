'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function SectionError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.06]">
        <AlertTriangle size={18} className="text-red-400/70" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white/60">Something went wrong</p>
        <p className="text-xs text-white/30 mt-1">This section failed to load. Nothing was saved.</p>
      </div>
      <button onClick={reset}
        className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/50 hover:text-white transition-colors">
        <RefreshCw size={12} /> Try again
      </button>
    </div>
  )
}
