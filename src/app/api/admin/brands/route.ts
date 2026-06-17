import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createServerClient } from '@supabase/ssr'

function supa() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key || key.includes('REPLACE')) return null
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const db = supa()
  if (!db) return NextResponse.json({ brands: [], total: 0, page: 1, limit: 25, _note: 'Add SUPABASE_SERVICE_ROLE_KEY' })

  const sp    = new URL(req.url).searchParams
  const q     = sp.get('q') || ''
  const page  = parseInt(sp.get('page') || '1')
  const limit = 25

  let query = db.from('brands').select('id, name, domain, keywords, is_default, created_at, user_id, users(email, plan)', { count: 'exact' })
  if (q) query = query.or(`name.ilike.%${q}%,domain.ilike.%${q}%`)

  const { data, count } = await query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1)
  return NextResponse.json({ brands: data, total: count, page, limit })
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const db = supa()
  if (!db) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 })

  const { brandId } = await req.json()
  if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 })
  await db.from('brands').delete().eq('id', brandId)
  return NextResponse.json({ ok: true })
}
