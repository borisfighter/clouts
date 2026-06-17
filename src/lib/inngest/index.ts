import { Inngest } from 'inngest'
import { scrapeAllEngines, Engine } from '@/lib/scraper'
import { createServerClient } from '@supabase/ssr'

export const inngest = new Inngest({ id: 'clouts' })

export const scrapeBrand = inngest.createFunction(
  { id: 'scrape-brand', retries: 2, concurrency: { limit: 3 } },
  { event: 'brand/scrape' },
  async ({ event, step }) => {
    const { brandId, brandName, domain, keywords, engines } = event.data

    const results = await step.run('scrape-engines', () =>
      scrapeAllEngines(keywords, brandName, domain, engines as Engine[])
    )

    await step.run('save-to-db', async () => {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { getAll: () => [], setAll: () => {} } }
      )
      if (results.length > 0) {
        await supabase.from('mentions').insert(
          results.map(r => ({
            brand_id: brandId, engine: r.engine, prompt: r.prompt,
            response_text: r.responseText, mentioned: r.mentioned,
            sentiment: r.sentiment, position: r.position,
            cited_url: r.citedUrl, score: r.score,
          }))
        )
      }
    })

    return { scraped: results.length, mentioned: results.filter(r => r.mentioned).length }
  }
)

export const hourlyScrape = inngest.createFunction(
  { id: 'hourly-scrape' },
  { cron: 'TZ=America/New_York 0 * * * *' },
  async ({ step }) => {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { data: brands } = await supabase
      .from('brands')
      .select('id, name, domain, keywords, user_id, users(plan)')
      .not('keywords', 'eq', '{}')

    if (!brands?.length) return { triggered: 0 }

    await inngest.send(
      brands.map((b: any) => ({
        name: 'brand/scrape',
        data: {
          brandId: b.id, brandName: b.name, domain: b.domain, keywords: b.keywords || [],
          engines: b.users?.plan === 'free'
            ? ['perplexity']
            : ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude'],
        },
      }))
    )

    return { triggered: brands.length }
  }
)

export const functions = [scrapeBrand, hourlyScrape]
