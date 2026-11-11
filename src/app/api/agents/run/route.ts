import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runAEOAgent, generateContentDraft, AgentNotConfiguredError } from '@/lib/agents/aeo'
import { getUserPlan, isUnlimited } from '@/lib/plan-limits'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, agentType = 'aeo', idea } = await req.json()
  const { data: brand } = await supabase.from('brands').select('*').eq('id', brandId).eq('user_id', user.id).single()
  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
  if (agentType !== 'aeo' && agentType !== 'draft') return NextResponse.json({ error: 'Unknown agent type' }, { status: 400 })

  const { plan } = await getUserPlan(user.id)
  if (!isUnlimited(plan.limits.agents)) {
    const since = new Date(); since.setDate(1); since.setHours(0, 0, 0, 0)
    const { data: brandIds } = await supabase.from('brands').select('id').eq('user_id', user.id)
    const { data: agentIds } = await supabase.from('agents').select('id').in('brand_id', (brandIds || []).map(b => b.id))
    const { count } = await supabase.from('agent_runs').select('*', { count: 'exact', head: true })
      .in('agent_id', (agentIds || []).map(a => a.id)).gte('started_at', since.toISOString())
    if ((count || 0) >= plan.limits.agents) {
      return NextResponse.json({ error: `Monthly AEO agent limit reached (${plan.limits.agents} runs on the ${plan.name} plan). Upgrade for more.` }, { status: 403 })
    }
  }

  const startedAt = new Date().toISOString()
  let output: unknown
  try {
    if (agentType === 'draft') {
      if (!idea?.title || !idea?.targetQuery) return NextResponse.json({ error: 'idea required' }, { status: 400 })
      output = { idea, markdown: await generateContentDraft(brand.name, brand.domain, { ...idea, outline: idea.outline || [] }) }
    } else {
      const { data: mentions } = await supabase.from('mentions')
        .select('engine, prompt, mentioned, sentiment, score, response_text, cited_url, citations, competitor_mentions')
        .eq('brand_id', brandId).order('scraped_at', { ascending: false }).limit(60)
      output = await runAEOAgent(brand.name, brand.domain, brand.keywords || [], mentions || [], brand.competitors || [])
    }
  } catch (e) {
    if (e instanceof AgentNotConfiguredError) return NextResponse.json({ error: 'The AEO agent is not connected yet (Anthropic API key missing).' }, { status: 503 })
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Agent failed' }, { status: 502 })
  }

  const { data: agent } = await supabase.from('agents').upsert({
    brand_id: brandId, name: agentType === 'draft' ? 'Content Writer' : 'AEO Agent', type: agentType,
    status: 'completed', last_run_at: new Date().toISOString(),
  }, { onConflict: 'brand_id,type' }).select().single()
  if (agent) {
    await supabase.from('agent_runs').insert({
      agent_id: agent.id, status: 'completed', output, started_at: startedAt, completed_at: new Date().toISOString(),
    })
  }

  return NextResponse.json(agentType === 'draft' ? output : { analysis: output })
}
