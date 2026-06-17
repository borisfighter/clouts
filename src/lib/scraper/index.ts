import { ScrapeResult } from './perplexity'
import { scrapePerplexityBatch } from './perplexity'
import { scrapeChatGPTBatch } from './chatgpt'
import { scrapeGeminiBatch } from './gemini'
import { scrapeGrokBatch } from './grok'
import { scrapeClaudeBatch } from './claude'

export type { ScrapeResult }
export type Engine = 'perplexity' | 'chatgpt' | 'gemini' | 'grok' | 'claude'
export const ALL_ENGINES: Engine[] = ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude']
export const FREE_ENGINES: Engine[] = ['perplexity']
export const PRO_ENGINES: Engine[] = ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude']

export const ENGINE_LABELS: Record<Engine, string> = {
  perplexity: 'Perplexity',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  grok: 'Grok',
  claude: 'Claude',
}

export async function scrapeAllEngines(
  keywords: string[],
  brandName: string,
  domain: string,
  engines: Engine[] = ALL_ENGINES
): Promise<ScrapeResult[]> {
  const tasks = engines.map(async (engine) => {
    switch (engine) {
      case 'perplexity': return scrapePerplexityBatch(keywords, brandName, domain)
      case 'chatgpt':    return scrapeChatGPTBatch(keywords, brandName, domain)
      case 'gemini':     return scrapeGeminiBatch(keywords, brandName, domain)
      case 'grok':       return scrapeGrokBatch(keywords, brandName, domain)
      case 'claude':     return scrapeClaudeBatch(keywords, brandName, domain)
      default:           return []
    }
  })

  const batches = await Promise.allSettled(tasks)
  return batches
    .filter((b): b is PromiseFulfilledResult<ScrapeResult[]> => b.status === 'fulfilled')
    .flatMap(b => b.value)
}
