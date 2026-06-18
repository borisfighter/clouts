import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  // Upsert user row
  await supabase.from('users').upsert({ id: user.id, email: user.email! }, { onConflict: 'id' })

  const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const share_slug = slugBase + '-' + Math.random().toString(36).slice(2, 10)

  const { data, error } = await supabase.from('brands').insert({
    user_id: user.id, name, domain, keywords, competitors, is_default: false, share_slug,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ brand: data })
}

// PATCH /api/brands — set default brand
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId } = await req.json()

  // Clear all defaults, then set the new one
  await supabase.from('brands').update({ is_default: false }).eq('user_id', user.id)
  await supabase.from('brands').update({ is_default: true }).eq('id', brandId).eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
