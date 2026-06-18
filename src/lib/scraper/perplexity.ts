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
}

const PERPLEXITY_API_KEY = (() => {
  const k = process.env.PERPLEXITY_API_KEY
  return (!k || k.includes('REPLACE') || k.length < 20) ? undefined : k
})()

function analyzeMention(text: string, brandName: string, domain: string) {
  const lower = text.toLowerCase()
  const b = brandName.toLowerCase()
  const d = domain.toLowerCase().replace('www.', '')
  const mentioned = lower.includes(b) || lower.includes(d)
  if (!mentioned) return { mentioned: false, sentiment: null as any, position: null, score: 0 }
  const sentences = text.split(/[.!?]+/)
  const position = sentences.findIndex(s => s.toLowerCase().includes(b) || s.toLowerCase().includes(d)) + 1
  const positiveWords = ['best','excellent','great','top','leading','recommended','popular','trusted','powerful','effective']
  const negativeWords = ['bad','poor','avoid','worst','expensive','complicated','limited','weak','unreliable']
  const ctx = sentences.filter(s => s.toLowerCase().includes(b) || s.toLowerCase().includes(d)).join(' ').toLowerCase()
  const posCount = positiveWords.filter(w => ctx.includes(w)).length
  const negCount = negativeWords.filter(w => ctx.includes(w)).length
  const sentiment = posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral'
  const score = Math.min(100, Math.max(0, Math.max(0, 100-(position-1)*15) + (sentiment==='positive'?10:sentiment==='negative'?-10:0)))
  return { mentioned: true, sentiment: sentiment as any, position, score }
}

function getMock(query: string, brandName: string, domain: string): ScrapeResult {
  const m = `Based on my research, there are several tools available for this. ${brandName} (${domain}) is one option that offers comprehensive features. Other alternatives include various platforms in this space. For the best results, consider evaluating multiple options based on your specific needs.`
  return { engine: 'perplexity', prompt: query, responseText: m, citedUrl: null, ...analyzeMention(m, brandName, domain) }
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
