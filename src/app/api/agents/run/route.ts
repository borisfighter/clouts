import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runAEOAgent } from '@/lib/agents/aeo'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, agentType = 'aeo' } = await req.json()

  const { data: brand } = await supabase.from('brands').select('*').eq('id', brandId).eq('user_id', user.id).single()
  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  // NOTE: PLANS.free.limits.agents is 0 in src/lib/stripe/index.ts, but the
  // AEO Agent is intentionally left ungated here — it's a free-tier hook
  // feature (works via mock fallback with no Anthropic key) and the
  // FAQ/onboarding checklist on /dashboard/settings explicitly walks free
  // users through running it. If agent limits should be enforced, update
  // PLANS.free.limits.agents intent and re-add gating using getUserPlan().

  const { data: mentions } = await supabase.from('mentions').select('engine, prompt, mentioned, sentiment, score, response_text')
    .eq('brand_id', brandId).order('scraped_at', { ascending: false }).limit(50)

  if (agentType === 'aeo') {
    const analysis = await runAEOAgent(brand.name, brand.domain, brand.keywords || [], mentions || [])

    // Save agent run
    const { data: agent } = await supabase.from('agents').upsert({
      brand_id: brandId, name: 'AEO Agent', type: 'aeo', status: 'completed', last_run_at: new Date().toISOString(),
    }, { onConflict: 'brand_id,type' }).select().single()

    if (agent) {
      await supabase.from('agent_runs').insert({
        agent_id: agent.id, status: 'completed', output: analysis,
        completed_at: new Date().toISOString(), started_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ analysis })
  }

  return NextResponse.json({ error: 'Unknown agent type' }, { status: 400 })
}
