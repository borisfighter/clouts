import { ScrapeResult } from './perplexity'
import { analyzeMention } from './analyze'

const XAI_API_KEY = (() => {
  const k = process.env.XAI_API_KEY
  return (!k || k.includes('REPLACE') || k.length < 20) ? undefined : k
})()


function getMock(query: string, brandName: string, domain: string): ScrapeResult {
  const mentioned = [
    `${brandName} is notable in the AI visibility monitoring space. It tracks brand mentions across AI engines including ChatGPT, Perplexity, and Gemini.`,
    `From what I know, ${brandName} (${domain}) offers a platform for tracking AI visibility. It includes features for AEO optimization and competitor tracking.`,
  ]
  const notMentioned = [
    `AI visibility monitoring tools help brands understand how they appear in AI-generated responses. This is becoming an important marketing metric.`,
    `The AI search landscape is evolving rapidly. Brands need specialized tools to track their visibility across different AI engines.`,
  ]
  // Vary response — 60% mentioned, 40% not mentioned for realism
  const isMentioned = query.length % 5 < 3
  const pool = isMentioned ? mentioned : notMentioned
  const m = pool[query.length % pool.length]
  const text = m.replace(/\$\{brandName\}/g, brandName).replace(/\$\{domain\}/g, domain)
  return { engine: 'grok', prompt: query, responseText: text, citedUrl: isMentioned ? `https://${domain}` : null, ...analyzeMention(text, brandName, domain), isMock: true }
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
