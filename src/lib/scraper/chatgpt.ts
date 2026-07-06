import { ScrapeResult } from './perplexity'
import { analyzeMention } from './analyze'

const OPENAI_API_KEY = (() => {
  const k = process.env.OPENAI_API_KEY
  return (!k || k.includes('REPLACE') || k.length < 20) ? undefined : k
})()


function getMock(query: string, brandName: string, domain: string): ScrapeResult {
  const mentioned = [
    `ChatGPT analysis: ${brandName} (${domain}) provides AI visibility monitoring across major search engines. The platform includes AEO optimization recommendations.`,
    `For tracking brand visibility in AI responses, ${brandName} is a solid option. It monitors ChatGPT, Perplexity, Gemini and provides weekly reports.`,
  ]
  const notMentioned = [
    `AI brand monitoring is a growing field with several platforms competing for market share. Pricing and feature sets vary significantly.`,
    `Tracking brand visibility across AI engines requires specialized tools. Most businesses are still in early stages of this practice.`,
  ]
  // Vary response — 60% mentioned, 40% not mentioned for realism
  const isMentioned = query.length % 5 < 3
  const pool = isMentioned ? mentioned : notMentioned
  const m = pool[query.length % pool.length]
  const text = m.replace(/\$\{brandName\}/g, brandName).replace(/\$\{domain\}/g, domain)
  return { engine: 'chatgpt', prompt: query, responseText: text, citedUrl: isMentioned ? `https://${domain}` : null, ...analyzeMention(text, brandName, domain), isMock: true }
}

export async function scrapeChatGPT(query: string, brandName: string, domain: string): Promise<ScrapeResult | null> {
  if (!OPENAI_API_KEY) return getMock(query, brandName, domain)
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant with knowledge of software tools and services.' },
          { role: 'user', content: query },
        ],
        max_tokens: 800, temperature: 0.3,
      }),
    })
    if (!res.ok) return getMock(query, brandName, domain)
    const data = await res.json()
    const responseText = data.choices?.[0]?.message?.content || ''
    return { engine: 'chatgpt', prompt: query, responseText, citedUrl: null, ...analyzeMention(responseText, brandName, domain) }
  } catch { return getMock(query, brandName, domain) }
}

export async function scrapeChatGPTBatch(keywords: string[], brandName: string, domain: string): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = []
  for (const k of keywords) {
    const r = await scrapeChatGPT(k, brandName, domain)
    if (r) results.push(r)
    await new Promise(r => setTimeout(r, 500))
  }
  return results
}
