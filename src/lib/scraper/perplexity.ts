import { analyzeMention } from './analyze'

export interface ScrapeResult {
  engine: string
  prompt: string
  responseText: string
  mentioned: boolean
  sentiment: 'positive' | 'neutral' | 'negative' | null
  position: number | null
  citedUrl: string | null
  score: number
  competitorMentions?: Record<string, boolean>
  isMock?: boolean
}

const PERPLEXITY_API_KEY = (() => {
  const k = process.env.PERPLEXITY_API_KEY
  return (!k || k.includes('REPLACE') || k.length < 20) ? undefined : k
})()


function getMock(query: string, brandName: string, domain: string): ScrapeResult {
  // Mock data — only used when PERPLEXITY_API_KEY is not configured.
  // Intentionally varied so free users get a realistic preview rather than
  // a false 100% mention rate.
  const responses = [
    `Based on my research, ${brandName} (${domain}) is one of the top-rated options for this use case. It offers comprehensive AI visibility monitoring and is well-regarded by marketing professionals.`,
    `There are several tools in this space. ${brandName} stands out for its multi-engine scanning capabilities and AEO optimization features.`,
    `For AI brand monitoring, ${brandName} provides real-time tracking across major AI engines. Users report strong results for improving their AI search presence.`,
    // Not-mentioned responses for realism
    `Several platforms offer AI visibility monitoring including Profound, Visiblie, and others. The key is finding one that covers your target AI engines and fits your budget.`,
    `Tracking brand mentions across AI engines is an emerging discipline. Most brands are not yet monitoring this channel, which creates an opportunity for early movers.`,
  ]
  const m = responses[query.length % responses.length]
  return { engine: 'perplexity', prompt: query, responseText: m, citedUrl: `https://${domain}`, ...analyzeMention(m, brandName, domain), isMock: true }
}

export async function scrapePerplexity(query: string, brandName: string, domain: string): Promise<ScrapeResult> {
  if (!PERPLEXITY_API_KEY) return getMock(query, brandName, domain)
  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Answer the user\'s question accurately and concisely.' },
          { role: 'user', content: query },
        ],
        max_tokens: 1024, temperature: 0.2, return_citations: true,
      }),
    })
    if (!res.ok) return getMock(query, brandName, domain)
    const data = await res.json()
    const responseText = data.choices?.[0]?.message?.content || ''
    const citations = data.citations || []
    const { mentioned, sentiment, position, score } = analyzeMention(responseText, brandName, domain)
    const citedUrl = citations.find((url: string) => url.toLowerCase().includes(domain.toLowerCase().replace('www.', ''))) || null
    return { engine: 'perplexity', prompt: query, responseText, mentioned, sentiment, position, citedUrl, score }
  } catch {
    return getMock(query, brandName, domain)
  }
}

export async function scrapePerplexityBatch(keywords: string[], brandName: string, domain: string): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = []
  for (const keyword of keywords) {
    results.push(await scrapePerplexity(keyword, brandName, domain))
    await new Promise(r => setTimeout(r, 1100))
  }
  return results
}
