'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bot, Zap, Loader2, ChevronDown, ChevronUp, TrendingUp, FileText, Search, Clock, RefreshCw } from 'lucide-react'

const AGENT_TYPES = [
  { type: 'aeo',     label: 'AEO Agent',     desc: 'Analyzes your AI mentions and generates content recommendations to improve visibility', icon: Search,     color: 'border-violet-500/20 bg-violet-500/[0.04] hover:border-violet-500/40', soon: false },
  { type: 'content', label: 'Content Agent', desc: 'Generates AEO-optimized FAQ pages, articles, and guides targeting your keywords',       icon: FileText,   color: 'border-blue-500/20 bg-blue-500/[0.04] hover:border-blue-500/40', soon: true },
  { type: 'pr',      label: 'PR Agent',      desc: 'Monitors sentiment shifts and drafts press responses to negative AI mentions',           icon: TrendingUp, color: 'border-pink-500/20 bg-pink-500/[0.04] hover:border-pink-500/40', soon: true },
]

export default function AgentsPage() {
  const supabase = createClient()
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<string | null>(null)
  const [rerunning, setRerunning] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [lastRun, setLastRun] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])
  const [agentError, setAgentError] = useState('')
  const [mentionCount, setMentionCount] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const { data: b } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
      setBrand(b)
      if (b) {
        // Load mention count to warn if running with no data
        const { count } = await supabase.from('mentions').select('*', { count: 'exact', head: true }).eq('brand_id', b.id)
        setMentionCount(count || 0)
        // Load last AEO run from DB
        const { data: agent } = await supabase.from('agents').select('id, last_run_at').eq('brand_id', b.id).eq('type', 'aeo').single()
        if (agent) {
          setLastRun(agent.last_run_at)
          const { data: runs } = await supabase.from('agent_runs')
            .select('output, started_at').eq('agent_id', agent.id)
            .eq('status', 'completed').order('started_at', { ascending: false }).limit(1)
          if (runs?.[0]?.output) setAnalysis(runs[0].output)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const runAgent = async (type: string) => {
    if (!brand) return
    setRunning(type)
    setRerunning(!!analysis)  // track if re-running over existing results
    if (!analysis) setAnalysis(null)  // only blank if no previous results
    setAgentError('')
    try {
      const res = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, agentType: type }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setAgentError(data.error || 'Failed to run agent — please try again')
        return
      }
      if (data.analysis) {
        setAnalysis(data.analysis)
        setLastRun(new Date().toISOString())
      }
    } catch {
      setAgentError('Failed to run agent — check your connection and try again')
    } finally {
      setRunning(null)
      setRerunning(false)
    }
  }

  const toggle = (key: string) => setExpanded(e => e.includes(key) ? e.filter(k => k !== key) : [...e, key])

  const scoreColor = (s: number) => s >= 70 ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/20' : s >= 40 ? 'bg-yellow-400/15 text-yellow-400 border-yellow-400/20' : 'bg-red-400/15 text-red-400 border-red-400/20'

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Marketing Agents</h1>
          <p className="mt-1 text-sm text-white/40">AI agents that work autonomously to improve your brand's AI visibility</p>
        </div>
        {analysis && lastRun && (
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Clock size={11} />
            Last run {new Date(lastRun).toLocaleDateString()} {new Date(lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* Agent cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {AGENT_TYPES.map(({ type, label, desc, icon: Icon, color, soon }) => (
          <div key={type} className={`rounded-2xl border p-5 transition-all ${color}`}>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06]">
              <Icon size={16} className="text-white/60" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{label}</h3>
            <p className="text-xs text-white/40 mb-4 leading-relaxed">{desc}</p>
            {soon ? (
              <span className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">Coming soon</span>
            ) : (
              <button onClick={() => runAgent(type)} disabled={!brand || running === type}
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 disabled:opacity-40 transition-colors">
                {running === type ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                {running === type ? 'Analyzing...' : analysis ? 'Re-run agent' : 'Run agent'}
              </button>
            )}
          </div>
        ))}
      </div>

      {brand && mentionCount === 0 && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.06] px-4 py-3 flex items-start gap-3">
          <span className="text-yellow-400 shrink-0 mt-0.5">⚠</span>
          <div>
            <p className="text-sm text-yellow-300 font-medium">No scan data yet</p>
            <p className="text-xs text-yellow-300/60 mt-0.5">The AEO agent works best with real scan data. <a href="/dashboard/visibility" className="underline hover:text-yellow-200">Run a scan first</a> — the agent still works now but will use generic recommendations.</p>
          </div>
        </div>
      )}

      {agentError && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-2.5 text-sm text-red-300 flex items-center justify-between gap-3">
          <span>{agentError}</span>
          {agentError.toLowerCase().includes('upgrade') && (
            <a href="/pricing" className="shrink-0 rounded-lg bg-red-400/15 px-3 py-1 text-xs font-bold text-red-200 hover:bg-red-400/25 transition-colors">
              Upgrade →
            </a>
          )}
        </div>
      )}

      {!brand && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 text-center">
          <Bot size={28} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-3">Add a brand in Settings to run agents</p>
          <a href="/dashboard/settings" className="text-sm text-violet-400 hover:text-violet-300">Go to Settings →</a>
        </div>
      )}

      {/* AEO Analysis results */}
      {analysis && (
        <div className="space-y-4">
          {rerunning && (
            <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-2.5">
              <Loader2 size={13} className="animate-spin text-violet-400 shrink-0" />
              <p className="text-xs text-violet-300">Re-running agent — results will update when complete…</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-white">AEO Analysis Results</h2>
            <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${scoreColor(analysis.overallScore)}`}>
              Score: {analysis.overallScore}/100
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-sm text-white/60 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Strengths + Gaps */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4">
              <p className="text-xs font-bold text-emerald-400 mb-2.5 uppercase tracking-widest">Strengths</p>
              <ul className="space-y-2">
                {analysis.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-xs text-white/60 flex gap-2 leading-relaxed"><span className="text-emerald-400 shrink-0 mt-0.5">✓</span>{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-red-400/15 bg-red-400/[0.04] p-4">
              <p className="text-xs font-bold text-red-400 mb-2.5 uppercase tracking-widest">Gaps</p>
              <ul className="space-y-2">
                {analysis.gaps?.map((g: string, i: number) => (
                  <li key={i} className="text-xs text-white/60 flex gap-2 leading-relaxed"><span className="text-red-400 shrink-0 mt-0.5">✗</span>{g}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <button onClick={() => toggle('recs')} className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-white hover:bg-white/[0.02] transition-colors">
              <span>Recommendations <span className="text-white/30 font-normal">({analysis.recommendations?.length || 0})</span></span>
              {expanded.includes('recs') ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
            </button>
            {expanded.includes('recs') && (
              <div className="divide-y divide-white/[0.04] border-t border-white/[0.07]">
                {analysis.recommendations?.map((r: any, i: number) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.priority === 'high' ? 'bg-red-400/15 text-red-400' : r.priority === 'medium' ? 'bg-yellow-400/15 text-yellow-400' : 'bg-white/[0.08] text-white/40'}`}>
                        {r.priority}
                      </span>
                      <span className="text-sm font-semibold text-white">{r.title}</span>
                    </div>
                    <p className="text-xs text-white/50 mb-1 leading-relaxed">{r.action}</p>
                    <p className="text-xs text-emerald-400/70">→ {r.expectedImpact}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content ideas */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <button onClick={() => toggle('content')} className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-white hover:bg-white/[0.02] transition-colors">
              <span>Content Ideas <span className="text-white/30 font-normal">({analysis.contentIdeas?.length || 0})</span></span>
              {expanded.includes('content') ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
            </button>
            {expanded.includes('content') && (
              <div className="divide-y divide-white/[0.04] border-t border-white/[0.07]">
                {analysis.contentIdeas?.map((c: any, i: number) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-bold text-violet-400 uppercase">{c.format}</span>
                      <span className="text-sm font-semibold text-white">{c.title}</span>
                    </div>
                    <p className="text-xs text-white/30 mb-2">Targets: "{c.targetQuery}"</p>
                    <ul className="space-y-1">
                      {c.outline?.map((o: string, j: number) => (
                        <li key={j} className="text-xs text-white/50 flex gap-2"><span className="text-white/20 shrink-0">{j+1}.</span>{o}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Hallucination alerts */}
          {analysis.hallucinations && analysis.hallucinations.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] overflow-hidden">
              <div className="border-b border-red-500/15 px-5 py-3.5 flex items-center gap-2">
                <span className="text-sm font-semibold text-white">⚠ Accuracy Alerts</span>
                <span className="text-xs text-red-400">AI engines may be misrepresenting your brand</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {analysis.hallucinations.map((h: any, i: number) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${h.severity === 'high' ? 'bg-red-400/15 text-red-400' : h.severity === 'medium' ? 'bg-yellow-400/15 text-yellow-400' : 'bg-white/[0.08] text-white/40'}`}>
                        {h.severity}
                      </span>
                      <span className="text-xs font-semibold text-white capitalize">{h.engine}</span>
                      <span className="text-xs text-white/40">— "{h.query}"</span>
                    </div>
                    <p className="text-xs text-white/60">{h.issue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
