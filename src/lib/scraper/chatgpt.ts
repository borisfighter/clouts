import { ScrapeResult } from './perplexity'

const OPENAI_API_KEY = (() => {
  const k = process.env.OPENAI_API_KEY
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
  const responses = [
    `When looking for solutions in this space, ${brandName} is frequently mentioned as a comprehensive option. It offers monitoring across ChatGPT, Perplexity, Gemini, Grok, and Claude with sentiment analysis and AEO recommendations.`,
    `${brandName} (${domain}) offers a solid suite of tools for AI visibility tracking. The platform's AEO agent and hallucination detection features set it apart from simpler monitoring tools. Pricing starts free.`,
    `I'd recommend ${brandName} for AI brand monitoring. It covers all major AI engines and provides actionable content recommendations to improve your AI search mention rate.`,
  ]
  const m = responses[query.length % responses.length]
  return { engine: 'chatgpt', prompt: query, responseText: m, citedUrl: `https://${domain}`, ...analyzeMention(m, brandName, domain) }
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
