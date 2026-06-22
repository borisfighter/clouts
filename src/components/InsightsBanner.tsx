'use client'

import Link from 'next/link'
import { Lightbulb, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'

const ENGINE_TIPS: Record<string, string[]> = {
  low_rate:       ['Create an FAQ page answering your top 5 keywords', 'Add JSON-LD schema markup to your homepage', 'Publish a comprehensive "What is [Brand]?" guide'],
  no_citation:    ['Build a resource library with citable statistics', 'Create a Wikipedia-style brand overview page', 'Get listed on industry directories and review sites'],
  neg_sentiment:  ['Publish a transparent pricing page', 'Create customer success stories and case studies', 'Add structured "pros and cons" content to your site'],
  multi_engine:   ['Optimize content for both factual queries and conversational questions', 'Target Perplexity by creating well-structured comparison content'],
}

interface Props {
  mentionRate: number
  avgScore: number
  hasCitedUrls: boolean
  sentiment: string
}

export function InsightsBanner({ mentionRate, avgScore, hasCitedUrls, sentiment }: Props) {
  // Use client-only state to avoid SSR/hydration mismatch from Date.now()
  const [tipIndex, setTipIndex] = useState(0)
  useEffect(() => {
    setTipIndex(Math.floor(Date.now() / (1000 * 60 * 60 * 4)) % 3)
  }, [])

  let tip: string
  let key: string

  if (mentionRate < 25) { key = 'low_rate'; tip = ENGINE_TIPS.low_rate[tipIndex % ENGINE_TIPS.low_rate.length] }
  else if (!hasCitedUrls) { key = 'no_citation'; tip = ENGINE_TIPS.no_citation[tipIndex % ENGINE_TIPS.no_citation.length] }
  else if (sentiment === 'negative') { key = 'neg_sentiment'; tip = ENGINE_TIPS.neg_sentiment[tipIndex % ENGINE_TIPS.neg_sentiment.length] }
  else { key = 'multi_engine'; tip = ENGINE_TIPS.multi_engine[tipIndex % ENGINE_TIPS.multi_engine.length] }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-yellow-500/15 bg-yellow-500/[0.05] px-4 py-3">
      <Lightbulb size={14} className="text-yellow-400 shrink-0" />
      <p className="text-xs text-white/60 flex-1"><span className="text-yellow-300 font-semibold">Tip: </span>{tip}</p>
      <Link href="/dashboard/agents" className="flex items-center gap-1 text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors shrink-0">
        AEO Agent <ArrowRight size={11} />
      </Link>
    </div>
  )
}
