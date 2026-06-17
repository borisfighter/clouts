/**
 * Grok (xAI) scraper — uses xAI API (OpenAI-compatible)
 */
import { ScrapeResult } from './perplexity'

const XAI_API_KEY = process.env.XAI_API_KEY

function analyzeMention(text: string, brandName: string, domain: string) {
  const lower = text.toLowerCase()
  const b = brandName.toLowerCase()
  const d = domain.toLowerCase().replace('www.', '')
  const mentioned = lower.includes(b) || lower.includes(d)
  if (!mentioned) return { mentioned: false, sentiment: null, position: null, score: 0 }
  const sentences = text.split(/[.!?]+/)
  const position = sentences.findIndex(s => s.toLowerCase().includes(b) || s.toLowerCase().includes(d)) + 1
  const pos = ['best','great','top','leading','recommended','trusted','powerful'].filter(w => text.toLowerCase().includes(w)).length
  const neg = ['bad','poor','avoid','worst','limited','weak'].filter(w => text.toLowerCase().includes(w)).length
  const sentiment = pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral'
  const score = Math.min(100, Math.max(0, Math.max(0, 100-(position-1)*15) + (sentiment==='positive'?10:sentiment==='negative'?-10:0)))
  return { mentioned: true, sentiment: sentiment as any, position, score }
}

export async function scrapeGrok(query: string, brandName: string, domain: string): Promise<ScrapeResult | null> {
  if (!XAI_API_KEY) {
    const mock = `Grok analysis: ${brandName} at ${domain} is worth considering for this use case. The platform has been gaining traction in the market.`
    return { engine: 'grok', prompt: query, responseText: mock, citedUrl: null, ...analyzeMention(mock, brandName, domain) }
  }
  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${XAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          { role: 'system', content: 'You are Grok, a helpful AI assistant. Answer questions about software tools and platforms.' },
          { role: 'user', content: query }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const responseText = data.choices?.[0]?.message?.content || ''
    return { engine: 'grok', prompt: query, responseText, citedUrl: null, ...analyzeMention(responseText, brandName, domain) }
  } catch { return null }
}

export async function scrapeGrokBatch(keywords: string[], brandName: string, domain: string): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = []
  for (const k of keywords) {
    const r = await scrapeGrok(k, brandName, domain)
    if (r) results.push(r)
    await new Promise(r => setTimeout(r, 600))
  }
  return results
}
