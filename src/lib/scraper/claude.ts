/**
 * Claude (Anthropic) scraper — uses Claude claude-haiku-4-5 for fast responses
 */
import { ScrapeResult } from './perplexity'
import Anthropic from '@anthropic-ai/sdk'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

function analyzeMention(text: string, brandName: string, domain: string) {
  const lower = text.toLowerCase()
  const b = brandName.toLowerCase()
  const d = domain.toLowerCase().replace('www.', '')
  const mentioned = lower.includes(b) || lower.includes(d)
  if (!mentioned) return { mentioned: false, sentiment: null, position: null, score: 0 }
  const sentences = text.split(/[.!?]+/)
  const position = sentences.findIndex(s => s.toLowerCase().includes(b) || s.toLowerCase().includes(d)) + 1
  const pos = ['best','excellent','great','top','leading','recommended','trusted'].filter(w => text.toLowerCase().includes(w)).length
  const neg = ['bad','poor','avoid','worst','limited','expensive'].filter(w => text.toLowerCase().includes(w)).length
  const sentiment = pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral'
  const score = Math.min(100, Math.max(0, Math.max(0, 100-(position-1)*15) + (sentiment==='positive'?10:sentiment==='negative'?-10:0)))
  return { mentioned: true, sentiment: sentiment as any, position, score }
}

export async function scrapeClaude(query: string, brandName: string, domain: string): Promise<ScrapeResult | null> {
  if (!ANTHROPIC_API_KEY) {
    const mock = `Based on available information, ${brandName} (${domain}) provides a solution in this space. The platform offers relevant features for users seeking this capability.`
    return { engine: 'claude', prompt: query, responseText: mock, citedUrl: null, ...analyzeMention(mock, brandName, domain) }
  }
  try {
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: query }],
    })
    const responseText = (msg.content[0] as any).text || ''
    return { engine: 'claude', prompt: query, responseText, citedUrl: null, ...analyzeMention(responseText, brandName, domain) }
  } catch { return null }
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
