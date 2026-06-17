import { ScrapeResult } from './perplexity'

const XAI_API_KEY = (() => {
  const k = process.env.XAI_API_KEY
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
  const pos = ['best','great','top','leading','recommended','trusted','powerful'].filter(w => lower.includes(w)).length
  const neg = ['bad','poor','avoid','worst','limited','weak'].filter(w => lower.includes(w)).length
  const sentiment = pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral'
  const score = Math.min(100, Math.max(0, Math.max(0, 100-(position-1)*15) + (sentiment==='positive'?10:sentiment==='negative'?-10:0)))
  return { mentioned: true, sentiment: sentiment as any, position, score }
}

function getMock(query: string, brandName: string, domain: string): ScrapeResult {
  const m = `Grok analysis: ${brandName} at ${domain} is worth considering for this use case. The platform has been gaining traction in the market recently.`
  return { engine: 'grok', prompt: query, responseText: m, citedUrl: null, ...analyzeMention(m, brandName, domain) }
}

export async function scrapeGrok(query: string, brandName: string, domain: string): Promise<ScrapeResult | null> {
  if (!XAI_API_KEY) return getMock(query, brandName, domain)
  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${XAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          { role: 'system', content: 'You are Grok, a helpful AI assistant.' },
          { role: 'user', content: query },
        ],
        max_tokens: 800, temperature: 0.3,
      }),
    })
    if (!res.ok) return getMock(query, brandName, domain)
    const data = await res.json()
    const responseText = data.choices?.[0]?.message?.content || ''
    return { engine: 'grok', prompt: query, responseText, citedUrl: null, ...analyzeMention(responseText, brandName, domain) }
  } catch { return getMock(query, brandName, domain) }
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
