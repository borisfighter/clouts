import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey || serviceKey.includes('REPLACE')) {
    // Use public function for aggregate stats (no service role key needed)
    const anonClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    const { data: stats } = await anonClient.rpc('get_platform_stats')
    const s = stats as any || {}
    return NextResponse.json({
      users:    { total: s.user_count || 0,    last30: 0, last7: 0, today: 0 },
      brands:   { total: s.brand_count || 0 },
      mentions: { total: s.mention_count || 0, last7: 0 },
      clips:    { total: s.clip_count || 0 },
      agents:   { total: s.agent_count || 0, runs: s.agent_run_count || 0 },
      plans: { free: s.user_count || 0 },
      recentUsers: [],
      topBrands: [],
      _partial: true,
    })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
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
    { count: totalAgents },
    { count: totalAgentRuns },
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
    supabase.from('agents').select('*', { count: 'exact', head: true }),
    supabase.from('agent_runs').select('*', { count: 'exact', head: true }),
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
    agents: { total: totalAgents, runs: totalAgentRuns },
    plans,
    recentUsers,
    topBrands,
  })
}
