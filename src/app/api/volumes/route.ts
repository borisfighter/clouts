import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchSearchVolumes, opportunityScore, volumesConfigured, VolumesNotConfiguredError, type KeywordVolume } from '@/lib/volumes'

export const maxDuration = 90

async function ownedBrand(brandId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: brand } = await supabase.from('brands').select('id, keywords').eq('id', brandId).eq('user_id', user.id).single()
  if (!brand) return { supabase, error: NextResponse.json({ error: 'Brand not found' }, { status: 404 }) }
  return { supabase, brand }
}

export async function GET(req: NextRequest) {
  const { supabase, brand, error } = await ownedBrand(req.nextUrl.searchParams.get('brandId') || '')
  if (error) return error
  const { data } = await supabase.from('prompt_volumes').select('*').eq('brand_id', brand!.id)
    .order('opportunity_score', { ascending: false, nullsFirst: false })
  return NextResponse.json({ volumes: data || [], configured: volumesConfigured() })
}

/** Refreshes volumes for the brand's prompts plus any extra `queries`. */
export async function POST(req: NextRequest) {
  const { brandId, queries = [] } = await req.json()
  const { supabase, brand, error } = await ownedBrand(brandId)
  if (error) return error

  const { data: existing } = await supabase.from('prompt_volumes').select('query').eq('brand_id', brand!.id)
  const all = Array.from(new Set([...(brand!.keywords || []), ...(existing || []).map(e => e.query), ...queries]
    .map((q: string) => q.trim()).filter(Boolean))).slice(0, 300)

  let volumes: KeywordVolume[]
  try {
    volumes = await fetchSearchVolumes(all)
  } catch (e) {
    if (e instanceof VolumesNotConfiguredError) {
      return NextResponse.json({ error: 'Search-volume data is not connected yet (DataForSEO credentials missing).' }, { status: 503 })
    }
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Volume lookup failed' }, { status: 502 })
  }

  const since = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: mentions } = await supabase.from('mentions').select('prompt, mentioned, engine')
    .eq('brand_id', brand!.id).gte('scraped_at', since)
  const byKey = new Map(volumes.map(v => [v.keyword.toLowerCase(), v]))

  const rows = all.map(query => {
    const v = byKey.get(query.toLowerCase())
    const pm = (mentions || []).filter(m => m.prompt.toLowerCase() === query.toLowerCase())
    const visibility = pm.length ? pm.filter(m => m.mentioned).length / pm.length : null
    return {
      brand_id: brand!.id,
      query,
      estimated_volume: v?.searchVolume ?? null,
      cpc: v?.cpc ?? null,
      competition: v?.competition ?? null,
      trend: v?.trend ?? null,
      monthly: v?.monthly ?? [],
      engines: Array.from(new Set(pm.map(m => m.engine))),
      opportunity_score: opportunityScore(v?.searchVolume ?? null, visibility),
      source: 'google_ads',
      date: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    }
  })
  const { error: upErr } = await supabase.from('prompt_volumes').upsert(rows, { onConflict: 'brand_id,query' })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
  return NextResponse.json({ updated: rows.length })
}

export async function DELETE(req: NextRequest) {
  const { brandId, id } = await req.json()
  const { supabase, brand, error } = await ownedBrand(brandId)
  if (error) return error
  await supabase.from('prompt_volumes').delete().eq('id', id).eq('brand_id', brand!.id)
  return NextResponse.json({ ok: true })
}
