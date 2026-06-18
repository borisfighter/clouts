'use client'

import { Check, ChevronRight } from 'lucide-react'

interface Step {
  id: string
  label: string
  done: boolean
  href: string
}

export function OnboardingChecklist({ steps }: { steps: Step[] }) {
  const done = steps.filter(s => s.done).length
  const pct = Math.round((done / steps.length) * 100)
  
  if (done === steps.length) return null // Hide when complete
  
  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">Getting started</p>
        <span className="text-xs text-violet-400">{done}/{steps.length} complete</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full bg-violet-500/60 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="space-y-1.5">
        {steps.map(({ id, label, done, href }) => (
          <a key={id} href={done ? '#' : href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${done ? 'text-white/30 cursor-default' : 'text-white/70 hover:bg-white/[0.04]'}`}>
            <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border ${done ? 'border-emerald-400/30 bg-emerald-400/15' : 'border-white/[0.12] bg-white/[0.04]'}`}>
              {done ? <Check size={11} className="text-emerald-400" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
            </div>
            <span className={done ? 'line-through' : ''}>{label}</span>
            {!done && <ChevronRight size={13} className="ml-auto text-white/20" />}
          </a>
        ))}
      </div>
    </div>
  )
}
