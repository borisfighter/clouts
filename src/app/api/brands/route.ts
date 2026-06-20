import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan, isUnlimited } from '@/lib/plan-limits'

// GET /api/brands — list all brands for the user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase.from('brands').select('*').eq('user_id', user.id).order('created_at')
  return NextResponse.json({ brands: data || [] })
}

// POST /api/brands — create a new brand
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, domain, keywords = [], competitors = [] } = body
  if (!name || !domain) return NextResponse.json({ error: 'name and domain required' }, { status: 400 })

  const { plan } = await getUserPlan(user.id)

  if (!isUnlimited(plan.limits.brands)) {
    const { count } = await supabase
      .from('brands').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if ((count || 0) >= plan.limits.brands) {
      return NextResponse.json({
        error: `Brand limit reached (${plan.limits.brands} on the ${plan.name} plan). Upgrade to add more brands.`,
      }, { status: 403 })
    }
  }

  await supabase.from('users').upsert({ id: user.id, email: user.email! }, { onConflict: 'id' })

  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const share_slug = slugBase + '-' + Math.random().toString(36).slice(2, 10)

  const { data, error } = await supabase.from('brands').insert({
    user_id: user.id, name, domain, keywords, competitors, is_default: false, share_slug,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ brand: data })
}

// PATCH /api/brands — update brand fields or switch default
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { brandId, name, domain, keywords, competitors, is_default } = body

  if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 })

  // If switching default brand
  if (is_default === true) {
    await supabase.from('brands').update({ is_default: false }).eq('user_id', user.id)
    await supabase.from('brands').update({ is_default: true }).eq('id', brandId).eq('user_id', user.id)
    return NextResponse.json({ ok: true })
  }

  // General field update
  const updates: any = {}
  if (name        !== undefined) updates.name        = name
  if (domain      !== undefined) updates.domain      = domain
  if (keywords    !== undefined) updates.keywords    = keywords
  if (competitors !== undefined) updates.competitors = competitors

  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true })

  const { error } = await supabase.from('brands').update(updates).eq('id', brandId).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
