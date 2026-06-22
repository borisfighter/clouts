import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ShareReportActions } from '@/components/ShareReportActions'

const ENGINE_COLORS: Record<string, string> = {
  perplexity: '#8b5cf6', chatgpt: '#10b981', gemini: '#3b82f6',
  grok: '#f59e0b', claude: '#ec4899',
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { data } = await supabase.from('brands').select('name, domain').eq('share_slug', params.slug).single()
  if (!data) return { title: 'Report not found | Clouts' }
  
  const title = `${data.name} AI Visibility Report`
  const description = `See how ${data.name} (${data.domain}) appears across ChatGPT, Perplexity, Claude, Gemini, and Grok. Powered by Clouts AI Visibility.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.clouts.com/r/${params.slug}`,
      siteName: 'Clouts',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function ShareReportPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  const { data: brand } = await supabase
    .from('brands').select('id, name, domain, keywords, competitors').eq('share_slug', params.slug).single()
  if (!brand) notFound()

  const since = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: mentions } = await supabase.from('mentions')
    .select('engine, prompt, mentioned, sentiment, score, scraped_at, response_text')
    .eq('brand_id', brand.id).gte('scraped_at', since).order('scraped_at', { ascending: false }).limit(500)

  const total = mentions?.length || 0
  const mentioned = mentions?.filter(m => m.mentioned).length || 0
  const mentionRate = total > 0 ? Math.round((mentioned / total) * 100) : 0
  const allScores = mentions?.filter(m => m.score != null).map(m => m.score!) || []
  const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b) / allScores.length) : 0

  const byEngine = ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude'].map(engine => {
    const em = mentions?.filter(m => m.engine === engine) || []
    const eMentioned = em.filter(m => m.mentioned).length
    const rate = em.length > 0 ? Math.round((eMentioned / em.length) * 100) : null
    const scores = em.filter(m => m.score).map(m => m.score!)
    const avgS = scores.length ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : null
    return { engine, total: em.length, mentioned: eMentioned, rate, avgScore: avgS }
  }).filter(e => e.total > 0)

  const sentiments = mentions?.filter(m => m.mentioned && m.sentiment).reduce((acc: any, m) => {
    acc[m.sentiment] = (acc[m.sentiment] || 0) + 1; return acc
  }, {}) || {}

  const generatedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          nav { border-bottom: 1px solid #eee !important; background: white !important; }
          nav a, nav button { color: #333 !important; }
          * { color-adjust: exact; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      {/* Header */}
      <div className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">AI Visibility Report · {generatedDate}</span>
          <ShareReportActions brandName={brand.name} slug={params.slug} />
          <Link href="/auth/signup"
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold hover:bg-violet-500 transition-colors no-print">
            Get your report →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-4 py-1.5 text-xs font-semibold text-violet-300 mb-4">
            ✦ AI Visibility Report — Last 30 days
          </div>
          <h1 className="text-4xl font-black">{brand.name}</h1>
          <p className="text-white/40">{brand.domain}</p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'AI Mention Rate',   value: total > 0 ? `${mentionRate}%` : '—', sub: `${mentioned}/${total} queries`, color: mentionRate >= 50 ? 'text-emerald-400' : mentionRate >= 25 ? 'text-yellow-400' : total > 0 ? 'text-red-400' : 'text-white' },
            { label: 'Avg Visibility Score', value: avgScore > 0 ? String(avgScore) : '—', sub: 'out of 100', color: avgScore >= 70 ? 'text-emerald-400' : avgScore >= 40 ? 'text-yellow-400' : 'text-white' },
            { label: 'Engines Tracked',    value: byEngine.length > 0 ? String(byEngine.length) : '—', sub: 'AI search engines', color: 'text-violet-400' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center">
              <p className="text-xs text-white/30 mb-2">{label}</p>
              <p className={`text-5xl font-black mb-1 ${color}`}>{value}</p>
              <p className="text-xs text-white/30">{sub}</p>
            </div>
          ))}
        </div>

        {/* Engine breakdown */}
        {byEngine.length > 0 && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="border-b border-white/[0.07] px-6 py-4">
              <h2 className="text-sm font-bold text-white">Performance by AI Engine</h2>
              <p className="text-xs text-white/30 mt-0.5">Mention rate across each AI search engine</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {byEngine.sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0)).map(({ engine, total, mentioned, rate, avgScore: es }) => (
                <div key={engine} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ background: ENGINE_COLORS[engine] || '#666', opacity: 0.8 }} />
                  <span className="text-sm font-medium text-white/70 capitalize w-24">{engine}</span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${rate ?? 0}%`, background: ENGINE_COLORS[engine] || '#8b5cf6', opacity: 0.7 }} />
                    </div>
                  </div>
                  <span className={`text-sm font-black w-12 text-right ${
                    rate !== null ? (rate >= 50 ? 'text-emerald-400' : rate >= 25 ? 'text-yellow-400' : 'text-white/40') : 'text-white/20'
                  }`}>{rate !== null ? `${rate}%` : '—'}</span>
                  <span className="text-xs text-white/25 w-16 text-right">{mentioned}/{total} queries</span>
                  {es !== null && <span className="text-xs font-bold text-white/30 w-10 text-right">Score: {es}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sentiment */}
        {Object.keys(sentiments).length > 0 && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <h2 className="text-sm font-bold text-white mb-4">Sentiment Analysis</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'positive', label: 'Positive', color: 'text-emerald-400', bar: 'bg-emerald-400' },
                { key: 'neutral',  label: 'Neutral',  color: 'text-white/50',    bar: 'bg-white/30' },
                { key: 'negative', label: 'Negative', color: 'text-red-400',     bar: 'bg-red-400' },
              ].map(({ key, label, color, bar }) => {
                const count = sentiments[key] || 0
                const pct = mentioned > 0 ? Math.round((count / mentioned) * 100) : 0
                return (
                  <div key={key} className="text-center">
                    <div className={`h-1 w-10 rounded mx-auto mb-3 ${bar} opacity-60`} />
                    <p className={`text-3xl font-black ${color}`}>{pct}%</p>
                    <p className="text-xs text-white/30 mt-1">{label}</p>
                    <p className="text-[10px] text-white/20">{count} mentions</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Competitor insights */}
        {mentions && brand.competitors?.length > 0 && (() => {
          const competitors: string[] = brand.competitors || []
          const compRates = competitors.map((comp: string) => {
            const matched = mentions?.filter((m: any) => m.response_text?.toLowerCase().includes(comp.toLowerCase())).length || 0
            return { comp, rate: total > 0 ? Math.round((matched / total) * 100) : 0, matched }
          }).sort((a: any, b: any) => b.rate - a.rate)
          
          return (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
              <h2 className="text-sm font-bold text-white mb-4">Competitive Landscape</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                  <span className="text-sm font-bold text-white flex-1">{brand.name} (you)</span>
                  <div className="w-32"><div className="h-1.5 rounded-full bg-white/[0.05]"><div className="h-full rounded-full bg-violet-500/70" style={{ width: `${mentionRate}%` }} /></div></div>
                  <span className={`text-sm font-black w-10 text-right ${mentionRate >= 50 ? 'text-emerald-400' : 'text-yellow-400'}`}>{mentionRate}%</span>
                </div>
                {compRates.map(({ comp, rate, matched }: any) => (
                  <div key={comp} className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${rate > mentionRate ? 'bg-red-400' : 'bg-white/20'}`} />
                    <span className="text-sm text-white/60 flex-1">{comp}</span>
                    <div className="w-32"><div className="h-1.5 rounded-full bg-white/[0.05]"><div className="h-full rounded-full bg-white/25" style={{ width: `${rate}%` }} /></div></div>
                    <span className={`text-sm font-bold w-10 text-right ${rate > mentionRate ? 'text-red-400' : 'text-white/40'}`}>{rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

        {/* Keywords tracked */}
        {brand.keywords?.length > 0 && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <h2 className="text-sm font-bold text-white mb-3">Keywords Tracked</h2>
            <div className="flex flex-wrap gap-2">
              {brand.keywords.map((kw: string) => (
                <span key={kw} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {total === 0 && (
          <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
            <p className="text-white/30 text-sm">No scan data available for this brand yet.</p>
          </div>
        )}

        {/* Embed badge */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-3 no-print">
          <h2 className="text-sm font-bold text-white">Embed this report</h2>
          <p className="text-xs text-white/40">Add an AI visibility badge to your website, README, or marketing materials.</p>
          <div className="rounded-xl border border-white/[0.07] bg-black/40 p-3 font-mono text-[11px] text-white/50 overflow-x-auto">
            {`<a href="https://www.clouts.com/r/${params.slug}"><img src="https://www.clouts.com/api/badge?slug=${params.slug}" alt="AI Visibility" /></a>`}
          </div>
          <div className="flex items-center gap-3">
            {/* Badge preview */}
            <img src={`/api/badge?slug=${params.slug}`} alt="AI Visibility badge" />
            <span className="text-xs text-white/30">Preview</span>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-8 text-center no-print">
          <p className="text-lg font-black text-white mb-2">Monitor your own brand in AI search</p>
          <p className="text-sm text-white/40 mb-6">
            Clouts tracks ChatGPT, Perplexity, Claude, Gemini, and Grok — and tells you exactly how to rank higher.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
              Start free — no credit card →
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-white/20">
          Report generated by <Link href="/" className="text-white/40 hover:text-white">Clouts.com</Link> · 
          Data from last 30 days · {generatedDate}
        </p>
      </div>
    </div>
  )
}
