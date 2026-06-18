'use client'

import Link from 'next/link'
import { Radio, Check, TrendingUp, Bot, BarChart3, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const ENGINE_COLORS: Record<string, string> = {
  perplexity: '#8b5cf6', chatgpt: '#10b981', gemini: '#3b82f6',
  grok: '#f59e0b', claude: '#ec4899',
}

const DEMO_BRAND = { name: 'Acme SaaS', domain: 'acmesaas.io' }

const DEMO_ENGINES = [
  { id: 'perplexity', label: 'Perplexity', rate: 82, total: 12, mentioned: 10, score: 88, locked: false },
  { id: 'chatgpt',    label: 'ChatGPT',    rate: 67, total:  8, mentioned:  5, score: 74, locked: true },
  { id: 'gemini',     label: 'Gemini',     rate: 50, total:  8, mentioned:  4, score: 61, locked: true },
  { id: 'grok',       label: 'Grok',       rate: 38, total:  8, mentioned:  3, score: 52, locked: true },
  { id: 'claude',     label: 'Claude',     rate: 75, total:  8, mentioned:  6, score: 79, locked: true },
]

const DEMO_MENTIONS = [
  { engine: 'perplexity', prompt: 'best SaaS tool for small teams', mentioned: true, score: 92, sentiment: 'positive' },
  { engine: 'perplexity', prompt: 'affordable project management software', mentioned: true, score: 88, sentiment: 'positive' },
  { engine: 'perplexity', prompt: 'top SaaS platforms 2026', mentioned: true, score: 85, sentiment: 'neutral' },
  { engine: 'chatgpt',    prompt: 'best SaaS tool for small teams', mentioned: true, score: 78, sentiment: 'positive' },
  { engine: 'perplexity', prompt: 'SaaS tools for remote work', mentioned: false, score: 0, sentiment: null },
]

export default function DemoPage() {
  const [expanded, setExpanded] = useState<string | null>('perplexity')

  const avgScore = Math.round(DEMO_ENGINES.reduce((s, e) => s + e.score, 0) / DEMO_ENGINES.length)
  const overallRate = Math.round(DEMO_ENGINES.reduce((s, e) => s + e.rate, 0) / DEMO_ENGINES.length)

  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      {/* Demo banner */}
      <div className="border-b border-yellow-500/20 bg-yellow-500/[0.06] px-4 py-2 text-center">
        <p className="text-xs text-yellow-300">
          📊 This is a live demo with example data. 
          <Link href="/auth/signup" className="ml-2 font-bold underline hover:text-yellow-200">Sign up free</Link>
          {' '}to see your real AI visibility.
        </p>
      </div>

      <nav className="flex h-14 items-center justify-between border-b border-white/[0.07] px-6">
        <Link href="/" className="text-base font-black">Clouts<span className="text-violet-400">.</span></Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">Viewing: {DEMO_BRAND.name} demo</span>
          <Link href="/auth/signup"
            className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition-colors">
            Get your real data →
          </Link>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Mini sidebar */}
        <aside className="hidden md:flex w-52 flex-col border-r border-white/[0.07] bg-[#0f1011] p-3 gap-0.5">
          <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Platform</div>
          {[
            { label: 'Overview', active: false },
            { label: 'AI Visibility', active: true },
            { label: 'Prompt Volumes', active: false },
            { label: 'Agents', active: false },
            { label: 'Analytics', active: false },
          ].map(({ label, active }) => (
            <div key={label} className={`rounded-lg px-3 py-2 text-xs font-medium ${active ? 'bg-violet-500/15 text-violet-300' : 'text-white/30'}`}>
              {label}
            </div>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">AI Visibility</h1>
              <p className="text-sm text-white/40 mt-0.5">How AI engines mention {DEMO_BRAND.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
                {['7d', '30d', 'All time'].map((r, i) => (
                  <span key={r} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${i === 1 ? 'bg-white text-black' : 'text-white/40'}`}>{r}</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-400">
                <Radio size={12} />
                Demo scan running...
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="text-xs text-white/30 mb-1">Mention rate</p>
              <p className="text-2xl font-black text-emerald-400">{overallRate}%</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="text-xs text-white/30 mb-1">Queries scanned</p>
              <p className="text-2xl font-black text-white">44</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="text-xs text-white/30 mb-1">Avg visibility score</p>
              <p className="text-2xl font-black text-white">{avgScore}</p>
            </div>
          </div>

          {/* Engine breakdown */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="border-b border-white/[0.07] px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio size={13} className="text-violet-400" />
                <span className="text-sm font-semibold text-white">Engine breakdown</span>
              </div>
              <Link href="/pricing" className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1">
                <TrendingUp size={10} /> Unlock all engines
              </Link>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {DEMO_ENGINES.map(({ id, label, rate, total, mentioned, score, locked }) => (
                <div key={id}>
                  <button
                    onClick={() => !locked && setExpanded(expanded === id ? null : id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 transition-colors ${!locked ? 'hover:bg-white/[0.02]' : 'opacity-40'}`}
                  >
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: ENGINE_COLORS[id], opacity: locked ? 0.4 : 0.85 }} />
                    <span className="text-sm font-medium text-white/80 w-24">{label}{locked && <span className="ml-1 text-[9px] text-white/20">PRO</span>}</span>
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${locked ? 0 : rate}%`, background: ENGINE_COLORS[id], opacity: 0.7 }} />
                      </div>
                    </div>
                    <span className={`text-sm font-black w-12 text-right ${locked ? 'text-white/20' : rate >= 50 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {locked ? '—' : `${rate}%`}
                    </span>
                    <span className="text-xs text-white/25 w-14 text-right">{locked ? 'Locked' : `${mentioned}/${total}`}</span>
                    {!locked && <ChevronRight size={13} className={`text-white/20 transition-transform ${expanded === id ? 'rotate-90' : ''}`} />}
                  </button>
                  {expanded === id && !locked && (
                    <div className="border-t border-white/[0.04] bg-white/[0.01]">
                      {DEMO_MENTIONS.filter(m => m.engine === id).map((m, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-3 border-b border-white/[0.03]">
                          <span className="text-[10px] text-white/20 w-4">{i + 1}</span>
                          <p className="flex-1 text-xs text-white/60">{m.prompt}</p>
                          {m.mentioned ? (
                            <span className="text-[10px] text-emerald-400 font-bold">✓ cited</span>
                          ) : (
                            <span className="text-[10px] text-white/20">not found</span>
                          )}
                          {m.score > 0 && <span className="text-xs font-black text-emerald-400 w-6 text-right">{m.score}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-6 text-center">
            <p className="text-base font-black text-white mb-2">See your real AI visibility</p>
            <p className="text-sm text-white/40 mb-4">This is example data. Sign up free to scan your actual brand across ChatGPT, Perplexity, Claude, Gemini, and Grok.</p>
            <Link href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
              Get your real data — free →
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
