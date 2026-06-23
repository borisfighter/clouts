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
        const { error } = await supabase.from('mentions').insert(
          results.map(r => ({
            brand_id: brandId, engine: r.engine, prompt: r.prompt,
            response_text: r.responseText, mentioned: r.mentioned,
            sentiment: r.sentiment, position: r.position,
            cited_url: r.citedUrl, score: r.score,
          }))
        )
        if (error) {
          // Supabase resolves with { error } on failure, it does not throw -
          // this function previously discarded that result entirely, so a
          // failed insert here looked identical to a successful one from
          // Inngest's perspective: nothing thrown means the step is marked
          // complete and the configured retries: 2 never engages, even
          // though the scan data was never actually saved. Throwing here is
          // what makes the existing retry config actually do anything.
          throw new Error(`Failed to save mentions for brand ${brandId}: ${error.message}`)
        }
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

    // Enforce per-brand monthly mention quota before triggering background scans.
    // Without this check, a free user with 100 mentions/month could be scanned
    // 24 times/day via cron, exhausting their entire monthly limit in hours.
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const PLAN_LIMITS: Record<string, number> = {
      free: 100, starter: 1000, growth: 10000, pro: 10000, team: -1, enterprise: -1,
    }

    const eligibleBrands = []
    for (const b of brands) {
      const plan = (b.users as any)?.plan || 'free'
      const limit = PLAN_LIMITS[plan] ?? 100
      if (limit === -1) { eligibleBrands.push(b); continue }

      const { count } = await supabase.from('mentions')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', b.id).gte('scraped_at', monthStart)
      if ((count || 0) < limit) eligibleBrands.push(b)
    }

    if (!eligibleBrands.length) return { triggered: 0, reason: 'all brands at monthly limit' }

    await inngest.send(
      eligibleBrands.map((b: any) => ({
        name: 'brand/scrape',
        data: {
          brandId: b.id, brandName: b.name, domain: b.domain, keywords: b.keywords || [],
          engines: b.users?.plan === 'free'
            ? ['perplexity']
            : ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude'],
        },
      }))
    )

    return { triggered: eligibleBrands.length }
  }
)

// Weekly report: every Monday at 9am ET
export const weeklyReport = inngest.createFunction(
  { id: 'weekly-report' },
  { cron: 'TZ=America/New_York 0 9 * * 1' },
  async ({ step }) => {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    const { data: brands } = await supabase
      .from('brands')
      .select('id, name, user_id, users(email, notif_weekly_report)')
      .not('keywords', 'eq', '{}')

    if (!brands?.length) return { sent: 0 }

    let sent = 0
    for (const b of brands) {
      const email = (b.users as any)?.email
      const optedOut = (b.users as any)?.notif_weekly_report === false
      if (!email || optedOut) continue
      await step.run(`send-report-${b.id}`, async () => {
        const appUrl2 = process.env.NEXT_PUBLIC_APP_URL || 'https://www.clouts.com'
        const res = await fetch(`${appUrl2}/api/email/weekly-report`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.INNGEST_EVENT_KEY || ''}`,
          },
          body: JSON.stringify({ brandId: b.id, email, brandName: b.name, userId: b.user_id }),
        })
        if (!res.ok) {
          // fetch() only throws on network failure, not on a non-2xx
          // response - without this check, a failed send (e.g. the email
          // provider rejecting it) would resolve normally and silently
          // count toward `sent` below, with no retry and no record that
          // this brand's weekly report never actually went out.
          throw new Error(`Failed to send weekly report for brand ${b.id}: HTTP ${res.status}`)
        }
        sent++
      })
    }
    return { sent }
  }
)

export const functions = [scrapeBrand, hourlyScrape, weeklyReport]
