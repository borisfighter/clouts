import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Engine, isEngineConfigured, ENGINE_LABELS } from '@/lib/scraper'
import { getUserPlan, clampEngines, isUnlimited } from '@/lib/plan-limits'
import { runBrandScan } from '@/lib/scan'

export const maxDuration = 300

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, engines } = await req.json()

  const { data: brand } = await supabase
    .from('brands').select('id, name, domain, keywords, competitors').eq('id', brandId).eq('user_id', user.id).single()
  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const keywords: string[] = (brand.keywords || []).filter((k: string) => k.trim())
  if (keywords.length === 0) {
    return NextResponse.json({ error: 'No prompts configured. Add prompts in Settings first.' }, { status: 400 })
  }

  const { planKey, plan } = await getUserPlan(user.id)
  const selectedEngines = clampEngines(engines as Engine[] | undefined, planKey) as Engine[]

  if (!isUnlimited(plan.limits.mentionsPerMonth)) {
    const since = new Date()
    since.setDate(1); since.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('mentions').select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId).gte('scraped_at', since.toISOString())
    const needed = keywords.length * selectedEngines.length
    if ((count || 0) + needed > plan.limits.mentionsPerMonth) {
      return NextResponse.json({
        error: `Monthly answer limit reached (${count || 0}/${plan.limits.mentionsPerMonth} on the ${plan.name} plan; this scan needs ${needed}). Upgrade for more.`,
      }, { status: 403 })
    }
  }

  const configured = selectedEngines.filter(isEngineConfigured)
  if (configured.length === 0) {
    return NextResponse.json({
      error: `AI engines are not connected yet (${selectedEngines.map(e => ENGINE_LABELS[e]).join(', ')}). No results were recorded.`,
      failures: selectedEngines.map(e => ({ engine: e, label: ENGINE_LABELS[e], failed: 0, notConfigured: true, error: 'API key not configured' })),
    }, { status: 503 })
  }

  const { results, failures, mentioned, insertError } = await runBrandScan(supabase, brand, selectedEngines, 'manual')
  if (insertError) return NextResponse.json({ error: `Scan ran but results could not be saved: ${insertError}` }, { status: 500 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const mentionRate = results.length > 0 ? Math.round((mentioned / results.length) * 100) : 0
  if (results.length > 0 && appUrl && process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('REPLACE')) {
    await fetch(`${appUrl}/api/email/scan-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, brandName: brand.name, mentionRate, totalScans: results.length, userId: user.id }),
    }).catch(() => {})
  }

  const competitors: string[] = brand.competitors || []
  const competitorStats: Record<string, number> = {}
  competitors.forEach(c => { competitorStats[c] = results.filter(r => r.competitorMentions[c]).length })

  return NextResponse.json({
    scraped: results.length,
    mentioned,
    mentionRate,
    competitorStats: competitors.length > 0 ? competitorStats : undefined,
    failures,
    byEngine: selectedEngines.map(e => ({
      engine: e,
      count: results.filter(r => r.engine === e).length,
      mentioned: results.filter(r => r.engine === e && r.mentioned).length,
    })),
  }, { status: results.length === 0 ? 502 : 200 })
}
