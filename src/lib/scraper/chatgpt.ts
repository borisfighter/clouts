/**
 * ChatGPT (OpenAI) scraper
 * Uses GPT-4o with web browsing disabled to simulate how ChatGPT answers brand queries
 * For production, use BrightData to scrape actual ChatGPT responses
 */

import { ScrapeResult } from './perplexity'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

function analyzeMention(text: string, brandName: string, domain: string) {
  const lower = text.toLowerCase()
  const brandLower = brandName.toLowerCase()
  const domainLower = domain.toLowerCase().replace('www.', '')
  const mentioned = lower.includes(brandLower) || lower.includes(domainLower)
  if (!mentioned) return { mentioned: false, sentiment: null, position: null, score: 0 }

  const sentences = text.split(/[.!?]+/)
  const position = sentences.findIndex(s =>
    s.toLowerCase().includes(brandLower) || s.toLowerCase().includes(domainLower)
  ) + 1

  const positiveWords = ['best', 'excellent', 'great', 'top', 'leading', 'recommended', 'popular', 'trusted', 'powerful', 'effective', 'innovative']
  const negativeWords = ['bad', 'poor', 'avoid', 'worst', 'expensive', 'complicated', 'limited', 'weak', 'unreliable', 'overpriced']
  const ctx = sentences.filter(s => s.toLowerCase().includes(brandLower) || s.toLowerCase().includes(domainLower)).join(' ').toLowerCase()
  const posCount = positiveWords.filter(w => ctx.includes(w)).length
  const negCount = negativeWords.filter(w => ctx.includes(w)).length
  const sentiment = posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral'
  const positionScore = Math.max(0, 100 - (position - 1) * 15)
  const sentimentBonus = sentiment === 'positive' ? 10 : sentiment === 'negative' ? -10 : 0
  const score = Math.min(100, Math.max(0, positionScore + sentimentBonus))
  return { mentioned: true, sentiment: sentiment as 'positive' | 'neutral' | 'negative', position, score }
}

export async function scrapeChatGPT(query: string, brandName: string, domain: string): Promise<ScrapeResult | null> {
  if (!OPENAI_API_KEY) {
    // Mock response for dev
    const mock = `When looking for solutions in this space, ${brandName} is frequently mentioned as a comprehensive option. Users particularly appreciate the platform's approach to the problem. Other tools also exist in this category.`
    const analysis = analyzeMention(mock, brandName, domain)
    return { engine: 'chatgpt', prompt: query, responseText: mock, citedUrl: null, ...analysis }
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant with knowledge of software tools, platforms, and services. Answer questions about brands and tools accurately.' },
          { role: 'user', content: query },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const responseText = data.choices?.[0]?.message?.content || ''
    const analysis = analyzeMention(responseText, brandName, domain)
    return { engine: 'chatgpt', prompt: query, responseText, citedUrl: null, ...analysis }
  } catch (err) {
    console.error('ChatGPT scrape error:', err)
    return null
  }
}

export async function scrapeChatGPTBatch(keywords: string[], brandName: string, domain: string): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = []
  for (const keyword of keywords) {
    const result = await scrapeChatGPT(keyword, brandName, domain)
    if (result) results.push(result)
    await new Promise(r => setTimeout(r, 500))
  }
  return results
}
