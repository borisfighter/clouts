import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createServerClient } from '@supabase/ssr'

function supa() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const sp     = new URL(req.url).searchParams
  const q      = sp.get('q') || ''
  const plan   = sp.get('plan') || ''
  const page   = parseInt(sp.get('page') || '1')
  const limit  = 25
  const offset = (page - 1) * limit

  let query = supa().from('users').select('id, email, plan, created_at, stripe_customer_id, brands(id, name, domain)', { count: 'exact' })
  if (q)    query = query.ilike('email', `%${q}%`)
  if (plan) query = query.eq('plan', plan)

  const { data, count, error: dbErr } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json({ users: data, total: count, page, limit })
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { userId, plan } = await req.json()
  if (!userId || !plan) return NextResponse.json({ error: 'userId and plan required' }, { status: 400 })

  const { error: dbErr } = await supa().from('users').update({ plan }).eq('id', userId)
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const db = supa()
  await db.from('users').delete().eq('id', userId)
  try { await db.auth.admin.deleteUser(userId) } catch {}
  return NextResponse.json({ ok: true })
}
