/**
 * Unified scraper — runs all configured AI engines for a brand
 */

import { ScrapeResult } from './perplexity'
import { scrapePerplexityBatch } from './perplexity'
import { scrapeChatGPTBatch } from './chatgpt'
import { scrapeGeminiBatch } from './gemini'

export type { ScrapeResult }

export type Engine = 'perplexity' | 'chatgpt' | 'gemini'

export const ALL_ENGINES: Engine[] = ['perplexity', 'chatgpt', 'gemini']

export async function scrapeAllEngines(
  keywords: string[],
  brandName: string,
  domain: string,
  engines: Engine[] = ALL_ENGINES
): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = []

  // Run engines in parallel
  const tasks = engines.map(async (engine) => {
    switch (engine) {
      case 'perplexity': return scrapePerplexityBatch(keywords, brandName, domain)
      case 'chatgpt':    return scrapeChatGPTBatch(keywords, brandName, domain)
      case 'gemini':     return scrapeGeminiBatch(keywords, brandName, domain)
      default:           return []
    }
  })

  const batches = await Promise.allSettled(tasks)
  for (const batch of batches) {
    if (batch.status === 'fulfilled') results.push(...batch.value)
  }

  return results
}
