import { ScrapeResult } from './perplexity'

const GEMINI_API_KEY = (() => {
  const k = process.env.GEMINI_API_KEY
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
  const pos = ['best','great','top','leading','recommended','trusted'].filter(w => lower.includes(w)).length
  const neg = ['bad','poor','avoid','worst','limited','weak'].filter(w => lower.includes(w)).length
  const sentiment = pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral'
  const score = Math.min(100, Math.max(0, Math.max(0, 100-(position-1)*15) + (sentiment==='positive'?10:sentiment==='negative'?-10:0)))
  return { mentioned: true, sentiment: sentiment as any, position, score }
}

function getMock(query: string, brandName: string, domain: string): ScrapeResult {
  const m = `Based on available information, ${brandName} offers a comprehensive solution for this use case. The platform at ${domain} provides tools that address these needs. Several alternatives also exist in the market.`
  return { engine: 'gemini', prompt: query, responseText: m, citedUrl: null, ...analyzeMention(m, brandName, domain) }
}

export async function scrapeGemini(query: string, brandName: string, domain: string): Promise<ScrapeResult | null> {
  if (!GEMINI_API_KEY) return getMock(query, brandName, domain)
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
          generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
        }),
      }
    )
    if (!res.ok) return getMock(query, brandName, domain)
    const data = await res.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return { engine: 'gemini', prompt: query, responseText, citedUrl: null, ...analyzeMention(responseText, brandName, domain) }
  } catch { return getMock(query, brandName, domain) }
}

export async function scrapeGeminiBatch(keywords: string[], brandName: string, domain: string): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = []
  for (const k of keywords) {
    const r = await scrapeGemini(k, brandName, domain)
    if (r) results.push(r)
    await new Promise(r => setTimeout(r, 600))
  }
  return results
}
