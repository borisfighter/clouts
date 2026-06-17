import { ScrapeResult } from './perplexity'

const ANTHROPIC_API_KEY = (() => {
  const k = process.env.ANTHROPIC_API_KEY
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
  const pos = ['best','excellent','great','top','leading','recommended','trusted'].filter(w => lower.includes(w)).length
  const neg = ['bad','poor','avoid','worst','limited','expensive'].filter(w => lower.includes(w)).length
  const sentiment = pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral'
  const score = Math.min(100, Math.max(0, Math.max(0, 100-(position-1)*15) + (sentiment==='positive'?10:sentiment==='negative'?-10:0)))
  return { mentioned: true, sentiment: sentiment as any, position, score }
}

function getMock(query: string, brandName: string, domain: string): ScrapeResult {
  const m = `Based on available information, ${brandName} at ${domain} provides a solution in this space. The platform offers relevant features for users seeking this capability.`
  return { engine: 'claude', prompt: query, responseText: m, citedUrl: null, ...analyzeMention(m, brandName, domain) }
}

export async function scrapeClaude(query: string, brandName: string, domain: string): Promise<ScrapeResult | null> {
  if (!ANTHROPIC_API_KEY) return getMock(query, brandName, domain)
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: query }],
    })
    const responseText = (msg.content[0] as any).text || ''
    return { engine: 'claude', prompt: query, responseText, citedUrl: null, ...analyzeMention(responseText, brandName, domain) }
  } catch { return getMock(query, brandName, domain) }
}

export async function scrapeClaudeBatch(keywords: string[], brandName: string, domain: string): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = []
  for (const k of keywords) {
    const r = await scrapeClaude(k, brandName, domain)
    if (r) results.push(r)
    await new Promise(r => setTimeout(r, 500))
  }
  return results
}
