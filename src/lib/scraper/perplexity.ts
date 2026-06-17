/**
 * Perplexity AI scraper
 * Queries Perplexity's API to check if a brand is mentioned in AI answers
 * Uses the Sonar model which is Perplexity's search-grounded LLM
 */

export interface ScrapeResult {
  engine: string
  prompt: string
  responseText: string
  mentioned: boolean
  sentiment: 'positive' | 'neutral' | 'negative' | null
  position: number | null
  citedUrl: string | null
  score: number
}

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

/**
 * Detect if a brand domain/name is mentioned in text and estimate sentiment
 */
function analyzeMention(text: string, brandName: string, domain: string): {
  mentioned: boolean
  sentiment: 'positive' | 'neutral' | 'negative' | null
  position: number | null
  score: number
} {
  const lower = text.toLowerCase()
  const brandLower = brandName.toLowerCase()
  const domainLower = domain.toLowerCase().replace('www.', '')

  const mentioned = lower.includes(brandLower) || lower.includes(domainLower)
  if (!mentioned) return { mentioned: false, sentiment: null, position: null, score: 0 }

  // Find position (which sentence mentions the brand)
  const sentences = text.split(/[.!?]+/)
  const position = sentences.findIndex(s =>
    s.toLowerCase().includes(brandLower) || s.toLowerCase().includes(domainLower)
  ) + 1

  // Sentiment analysis (simple keyword-based)
  const positiveWords = ['best', 'excellent', 'great', 'top', 'leading', 'recommended', 'popular', 'trusted', 'powerful', 'effective']
  const negativeWords = ['bad', 'poor', 'avoid', 'worst', 'expensive', 'complicated', 'limited', 'weak', 'unreliable']

  const mentionContext = sentences
    .filter(s => s.toLowerCase().includes(brandLower) || s.toLowerCase().includes(domainLower))
    .join(' ')
    .toLowerCase()

  const posCount = positiveWords.filter(w => mentionContext.includes(w)).length
  const negCount = negativeWords.filter(w => mentionContext.includes(w)).length

  const sentiment = posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral'

  // Score: 0-100 based on position (earlier = better) and sentiment
  const positionScore = Math.max(0, 100 - (position - 1) * 15)
  const sentimentBonus = sentiment === 'positive' ? 10 : sentiment === 'negative' ? -10 : 0
  const score = Math.min(100, Math.max(0, positionScore + sentimentBonus))

  return { mentioned: true, sentiment, position, score }
}

/**
 * Scrape Perplexity for a single query
 */
export async function scrapePerplexity(
  query: string,
  brandName: string,
  domain: string
): Promise<ScrapeResult | null> {
  if (!PERPLEXITY_API_KEY) {
    console.warn('PERPLEXITY_API_KEY not set — using mock data')
    return mockScrape(query, brandName, domain)
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Answer the user\'s question accurately and concisely.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        max_tokens: 1024,
        temperature: 0.2,
        return_citations: true,
      }),
    })

    if (!response.ok) {
      console.error(`Perplexity API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    const responseText = data.choices?.[0]?.message?.content || ''
    const citations = data.citations || []

    const { mentioned, sentiment, position, score } = analyzeMention(responseText, brandName, domain)

    // Find if brand's domain is in citations
    const citedUrl = citations.find((url: string) =>
      url.toLowerCase().includes(domain.toLowerCase().replace('www.', ''))
    ) || null

    return {
      engine: 'perplexity',
      prompt: query,
      responseText,
      mentioned,
      sentiment,
      position,
      citedUrl,
      score,
    }
  } catch (err) {
    console.error('Perplexity scrape error:', err)
    return null
  }
}

/**
 * Mock response for when no API key is set (dev/testing)
 */
function mockScrape(query: string, brandName: string, domain: string): ScrapeResult {
  const mockResponse = `Based on my research, there are several tools available for this. ${brandName} (${domain}) is one option that offers comprehensive features. Other alternatives include various platforms in this space. For the best results, consider evaluating multiple options based on your specific needs.`

  const { mentioned, sentiment, position, score } = analyzeMention(mockResponse, brandName, domain)
  return {
    engine: 'perplexity',
    prompt: query,
    responseText: mockResponse,
    mentioned,
    sentiment,
    position,
    citedUrl: null,
    score,
  }
}

/**
 * Run multiple queries for a brand across Perplexity
 */
export async function scrapePerplexityBatch(
  keywords: string[],
  brandName: string,
  domain: string
): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = []

  for (const keyword of keywords) {
    const result = await scrapePerplexity(keyword, brandName, domain)
    if (result) results.push(result)
    // Rate limiting — 1 req/sec
    await new Promise(r => setTimeout(r, 1100))
  }

  return results
}
