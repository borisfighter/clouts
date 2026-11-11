import { askEngine, Engine, EngineError, isEngineConfigured } from './engines'
import { analyzeMention, entityMatcher, findCitation } from './analyze'

export type { Engine }
export { isEngineConfigured }
export const ALL_ENGINES: Engine[] = ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude']

export const ENGINE_LABELS: Record<Engine, string> = {
  perplexity: 'Perplexity',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  grok: 'Grok',
  claude: 'Claude',
}

export interface ScrapeResult {
  engine: Engine
  prompt: string
  responseText: string
  mentioned: boolean
  sentiment: 'positive' | 'neutral' | 'negative' | null
  position: number | null
  citedUrl: string | null
  citations: string[]
  score: number
  competitorMentions: Record<string, boolean>
}

export interface EngineFailure {
  engine: Engine
  prompt: string
  error: string
  notConfigured: boolean
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let i = 0
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]) }
  }))
  return out
}

export async function scrapeAllEngines(
  keywords: string[],
  brandName: string,
  domain: string,
  engines: Engine[],
  competitors: string[] = [],
): Promise<{ results: ScrapeResult[]; failures: EngineFailure[] }> {
  const results: ScrapeResult[] = []
  const failures: EngineFailure[] = []
  const competitorMatchers = competitors.map(c => [c, entityMatcher(c)] as const)

  await Promise.all(engines.map(async engine => {
    if (!isEngineConfigured(engine)) {
      failures.push({ engine, prompt: '*', error: 'API key not configured', notConfigured: true })
      return
    }
    await mapLimit(keywords, 3, async prompt => {
      try {
        const answer = await askEngine(engine, prompt)
        const competitorMentions: Record<string, boolean> = {}
        competitorMatchers.forEach(([c, m]) => { competitorMentions[c] = m(answer.text) })
        results.push({
          engine,
          prompt,
          responseText: answer.text,
          citations: answer.citations,
          citedUrl: findCitation(answer.citations, domain),
          competitorMentions,
          ...analyzeMention(answer.text, brandName, domain),
        })
      } catch (e) {
        const err = e instanceof EngineError ? e : new EngineError(engine, String(e))
        failures.push({ engine, prompt, error: err.message, notConfigured: err.notConfigured })
      }
    })
  }))

  return { results, failures }
}
