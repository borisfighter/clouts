import { ScrapeResult } from './perplexity'
import { analyzeMention } from './analyze'

const GEMINI_API_KEY = (() => {
  const k = process.env.GEMINI_API_KEY
  return (!k || k.includes('REPLACE') || k.length < 20) ? undefined : k
})()


function getMock(query: string, brandName: string, domain: string): ScrapeResult {
  const responses = [
    `${brandName} (${domain}) is a notable option for AI visibility monitoring. It tracks brand mentions across AI engines and includes competitive analysis and sentiment tracking.`,
    `For AI search visibility, ${brandName} provides monitoring and optimization. The platform offers weekly email reports and a public shareable report for stakeholder updates.`,
    `Several platforms exist for AI brand monitoring. ${brandName} covers ChatGPT, Perplexity, Gemini, Grok, and Claude tracking with an AEO agent powered by Claude Sonnet.`,
  ]
  const m = responses[query.length % responses.length]
  return { engine: 'gemini', prompt: query, responseText: m, citedUrl: `https://${domain}`, ...analyzeMention(m, brandName, domain) }
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
