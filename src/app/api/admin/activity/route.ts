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
  const since = new Date(Date.now() - 7 * 86400000).toISOString()

  if (!db) {
    // Fall back to anon client (only shows admin's own data)
    const { createClient } = await import('@/lib/supabase/server')
    const anon = await createClient()
    const [{ data: m }, { data: c }, { data: u }] = await Promise.all([
      anon.from('mentions').select('id, engine, mentioned, scraped_at, brands(name, users(email))').gte('scraped_at', since).order('scraped_at', { ascending: false }).limit(100),
      anon.from('clips').select('id, title, status, created_at, brands(name, users(email))').gte('created_at', since).order('created_at', { ascending: false }).limit(50),
      anon.from('users').select('id, email, created_at, plan').gte('created_at', since).order('created_at', { ascending: false }).limit(20),
    ])
    return NextResponse.json({ mentions: m || [], clips: c || [], agents: [], users: u || [], _partial: true })
  }

  const [{ data: m }, { data: c }, { data: a }, { data: u }] = await Promise.all([
    db.from('mentions').select('id, engine, mentioned, scraped_at, brands(name, users(email))').gte('scraped_at', since).order('scraped_at', { ascending: false }).limit(200),
    db.from('clips').select('id, title, status, created_at, brands(name, users(email))').gte('created_at', since).order('created_at', { ascending: false }).limit(100),
    db.from('agent_runs').select('id, status, started_at, agents(type, brands(name, users(email)))').gte('started_at', since).order('started_at', { ascending: false }).limit(100),
    db.from('users').select('id, email, created_at, plan').gte('created_at', since).order('created_at', { ascending: false }).limit(50),
  ])

  return NextResponse.json({ mentions: m || [], clips: c || [], agents: a || [], users: u || [] })
}
