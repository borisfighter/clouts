import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, serviceKeyConfigured } from '@/lib/supabase/admin'
import { allowedEngines } from '@/lib/plan-limits'
import { PLANS, type PlanKey } from '@/lib/stripe'
import { runBrandScan } from '@/lib/scan'
import { Engine, isEngineConfigured } from '@/lib/scraper'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const BUDGET_MS = 240_000
const RESCAN_AFTER_MS = 20 * 3600_000

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!serviceKeyConfigured()) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 })

  const started = Date.now()
  const db = createAdminClient()
  const cutoff = new Date(Date.now() - RESCAN_AFTER_MS).toISOString()
  const { data: brands, error } = await db.from('brands')
    .select('id, name, domain, keywords, competitors, last_scanned_at, users!inner(plan)')
    .not('keywords', 'eq', '{}')
    .or(`last_scanned_at.is.null,last_scanned_at.lt.${cutoff}`)
    .order('last_scanned_at', { ascending: true, nullsFirst: true })
    .limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0)
  const summary = { scanned: 0, skippedQuota: 0, skippedNoEngines: 0, answers: 0, remaining: 0 }

  for (const b of brands || []) {
    if (Date.now() - started > BUDGET_MS) { summary.remaining++; continue }
    const planKey = (((b as any).users?.plan as PlanKey) in PLANS ? (b as any).users.plan : 'free') as PlanKey
    const engines = (allowedEngines(planKey) as Engine[]).filter(isEngineConfigured)
    if (engines.length === 0) { summary.skippedNoEngines++; continue }

    const limit = PLANS[planKey].limits.mentionsPerMonth
    if (limit !== -1) {
      const { count } = await db.from('mentions').select('*', { count: 'exact', head: true })
        .eq('brand_id', b.id).gte('scraped_at', monthStart.toISOString())
      if ((count || 0) + (b.keywords || []).length * engines.length > limit) { summary.skippedQuota++; continue }
    }

    const { results } = await runBrandScan(db, b, engines, 'scheduled')
    summary.scanned++
    summary.answers += results.length
  }

  return NextResponse.json(summary)
}
