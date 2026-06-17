import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const sevenAgo  = new Date(Date.now() -  7 * 86400000).toISOString()
  const today     = new Date(new Date().setHours(0,0,0,0)).toISOString()

  const [
    { count: totalUsers },
    { count: newLast30 },
    { count: newLast7 },
    { count: newToday },
    { count: totalBrands },
    { count: totalMentions },
    { count: mentionsLast7 },
    { count: totalClips },
    { data: planData },
    { data: recentUsers },
    { data: topBrands },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', thirtyAgo),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', sevenAgo),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('brands').select('*', { count: 'exact', head: true }),
    supabase.from('mentions').select('*', { count: 'exact', head: true }),
    supabase.from('mentions').select('*', { count: 'exact', head: true }).gte('scraped_at', sevenAgo),
    supabase.from('clips').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('plan'),
    supabase.from('users').select('id, email, plan, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('brands').select('id, name, domain, created_at, keywords, users(email, plan)').order('created_at', { ascending: false }).limit(10),
  ])

  const plans: Record<string, number> = {}
  for (const u of planData || []) {
    const p = (u as any).plan || 'free'
    plans[p] = (plans[p] || 0) + 1
  }

  return NextResponse.json({
    users: { total: totalUsers, last30: newLast30, last7: newLast7, today: newToday },
    brands: { total: totalBrands },
    mentions: { total: totalMentions, last7: mentionsLast7 },
    clips: { total: totalClips },
    plans,
    recentUsers,
    topBrands,
  })
}
