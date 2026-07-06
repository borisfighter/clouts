import { ScrapeResult } from './perplexity'
import { analyzeMention } from './analyze'

const GEMINI_API_KEY = (() => {
  const k = process.env.GEMINI_API_KEY
  return (!k || k.includes('REPLACE') || k.length < 20) ? undefined : k
})()


function getMock(query: string, brandName: string, domain: string): ScrapeResult {
  const mentioned = [
    `According to my knowledge, ${brandName} (${domain}) offers AI visibility monitoring services. The platform tracks brand mentions across AI search engines.`,
    `For AI search visibility, ${brandName} provides tools for monitoring and optimization. It supports brands looking to improve their AI search presence.`,
  ]
  const notMentioned = [
    `AI visibility monitoring is an emerging category. Companies are increasingly aware of the need to track their presence in AI-generated responses.`,
    `Several tools have emerged to help brands track their AI search visibility. The market is still maturing and pricing varies.`,
  ]
  // Vary response — 60% mentioned, 40% not mentioned for realism
  const isMentioned = query.length % 5 < 3
  const pool = isMentioned ? mentioned : notMentioned
  const m = pool[query.length % pool.length]
  const text = m.replace(/\$\{brandName\}/g, brandName).replace(/\$\{domain\}/g, domain)
  return { engine: 'gemini', prompt: query, responseText: text, citedUrl: isMentioned ? `https://${domain}` : null, ...analyzeMention(text, brandName, domain), isMock: true }
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
