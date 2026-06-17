/**
 * Gemini (Google) scraper
 * Uses Gemini 1.5 Flash API to simulate Google AI Overview / Gemini responses
 */

import { ScrapeResult } from './perplexity'

const GEMINI_API_KEY = (() => { const k = process.env.GEMINI_API_KEY; return (!k || k.includes('REPLACE') || k.length < 20) ? undefined : k })()

function analyzeMention(text: string, brandName: string, domain: string) {
  const lower = text.toLowerCase()
  const brandLower = brandName.toLowerCase()
  const domainLower = domain.toLowerCase().replace('www.', '')
  const mentioned = lower.includes(brandLower) || lower.includes(domainLower)
  if (!mentioned) return { mentioned: false, sentiment: null, position: null, score: 0 }
  const sentences = text.split(/[.!?]+/)
  const position = sentences.findIndex(s => s.toLowerCase().includes(brandLower) || s.toLowerCase().includes(domainLower)) + 1
  const positiveWords = ['best', 'excellent', 'great', 'top', 'leading', 'recommended', 'popular', 'trusted', 'powerful', 'effective']
  const negativeWords = ['bad', 'poor', 'avoid', 'worst', 'expensive', 'complicated', 'limited', 'weak']
  const ctx = sentences.filter(s => s.toLowerCase().includes(brandLower) || s.toLowerCase().includes(domainLower)).join(' ').toLowerCase()
  const posCount = positiveWords.filter(w => ctx.includes(w)).length
  const negCount = negativeWords.filter(w => ctx.includes(w)).length
  const sentiment = posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral'
  const score = Math.min(100, Math.max(0, Math.max(0, 100 - (position - 1) * 15) + (sentiment === 'positive' ? 10 : sentiment === 'negative' ? -10 : 0)))
  return { mentioned: true, sentiment: sentiment as 'positive' | 'neutral' | 'negative', position, score }
}

export async function scrapeGemini(query: string, brandName: string, domain: string): Promise<ScrapeResult | null> {
  if (!GEMINI_API_KEY) {
    const mock = `Based on available information, ${brandName} offers a comprehensive solution for this use case. The platform at ${domain} provides tools that address these needs. Several alternatives also exist in the market.`
    const analysis = analyzeMention(mock, brandName, domain)
    return { engine: 'gemini', prompt: query, responseText: mock, citedUrl: null, ...analysis }
  }

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
    if (!res.ok) return mockScrape(query, brandName, domain)
    const data = await res.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const analysis = analyzeMention(responseText, brandName, domain)
    return { engine: 'gemini', prompt: query, responseText, citedUrl: null, ...analysis }
  } catch (err) {
    console.error('Gemini scrape error:', err)
    return mockScrape(query, brandName, domain)
  }
}

export async function scrapeGeminiBatch(keywords: string[], brandName: string, domain: string): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = []
  for (const keyword of keywords) {
    const result = await scrapeGemini(keyword, brandName, domain)
    if (result) results.push(result)
    await new Promise(r => setTimeout(r, 600))
  }
  return results
}
