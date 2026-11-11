import { Inngest } from 'inngest'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { runBrandScan } from '@/lib/scan'
import { Engine } from '@/lib/scraper'

export const inngest = new Inngest({ id: 'clouts' })

// Daily scheduled scans run from Vercel Cron (/api/cron/scan); this event
// lets other jobs request an out-of-band scan for one brand.
export const scrapeBrand = inngest.createFunction(
  { id: 'scrape-brand', retries: 2, concurrency: { limit: 3 } },
  { event: 'brand/scrape' },
  async ({ event, step }) => {
    const { brandId, engines } = event.data
    return step.run('scan', async () => {
      const db = createAdminClient()
      const { data: brand } = await db.from('brands').select('id, name, domain, keywords, competitors').eq('id', brandId).single()
      if (!brand) return { error: 'brand not found' }
      const { results, failures } = await runBrandScan(db, brand, engines as Engine[], 'scheduled')
      return { saved: results.length, failures }
    })
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

export const functions = [scrapeBrand, weeklyReport]
