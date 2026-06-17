import { Inngest } from 'inngest'
import { scrapeAllEngines } from '@/lib/scraper'
import { createServerClient } from '@supabase/ssr'

export const inngest = new Inngest({ id: 'clouts' })

// ─── JOB: Scrape all engines for a brand ─────────────────────
export const scrapeBrand = inngest.createFunction(
  { id: 'scrape-brand', retries: 2, concurrency: { limit: 5 } },
  { event: 'brand/scrape' },
  async ({ event, step }) => {
    const { brandId, userId, brandName, domain, keywords, engines } = event.data

    const results = await step.run('scrape-engines', async () => {
      return scrapeAllEngines(keywords, brandName, domain, engines)
    })

    await step.run('save-to-db', async () => {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { getAll: () => [], setAll: () => {} } }
      )
      if (results.length > 0) {
        await supabase.from('mentions').insert(
          results.map(r => ({
            brand_id: brandId,
            engine: r.engine,
            prompt: r.prompt,
            response_text: r.responseText,
            mentioned: r.mentioned,
            sentiment: r.sentiment,
            position: r.position,
            cited_url: r.citedUrl,
            score: r.score,
          }))
        )
      }
      return { saved: results.length }
    })

    return { brandId, scraped: results.length, mentioned: results.filter(r => r.mentioned).length }
  }
)

// ─── CRON: Hourly scrape for all brands ──────────────────────
export const hourlyScrape = inngest.createFunction(
  { id: 'hourly-scrape' },
  { cron: '0 * * * *' },
  async ({ step }) => {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { data: brands } = await supabase
      .from('brands')
      .select('id, name, domain, keywords, user_id, users(plan)')

    if (!brands?.length) return { message: 'No brands to scrape' }

    // Send scrape event for each brand
    await inngest.send(
      brands.map((b: any) => ({
        name: 'brand/scrape',
        data: {
          brandId: b.id,
          userId: b.user_id,
          brandName: b.name,
          domain: b.domain,
          keywords: b.keywords || [],
          // Pro/Team get all engines, free gets perplexity only
          engines: b.users?.plan === 'free' ? ['perplexity'] : ['perplexity', 'chatgpt', 'gemini'],
        },
      }))
    )

    return { triggered: brands.length }
  }
)

export const functions = [scrapeBrand, hourlyScrape]
