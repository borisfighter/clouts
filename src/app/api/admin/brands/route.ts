import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createServerClient } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const sp    = new URL(req.url).searchParams
  const q     = sp.get('q') || ''
  const page  = parseInt(sp.get('page') || '1')
  const limit = 25

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  let query = supabase.from('brands').select('id, name, domain, keywords, is_default, created_at, user_id, users(email, plan)', { count: 'exact' })
  if (q) query = query.or(`name.ilike.%${q}%,domain.ilike.%${q}%`)

  const { data, count } = await query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1)
  return NextResponse.json({ brands: data, total: count, page, limit })
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { brandId } = await req.json()
  if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
  await supabase.from('brands').delete().eq('id', brandId)
  return NextResponse.json({ ok: true })
}
