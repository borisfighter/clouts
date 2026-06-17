import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapeAllEngines, Engine } from '@/lib/scraper'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, engines } = await req.json()

  const { data: brand } = await supabase
    .from('brands').select('*').eq('id', brandId).eq('user_id', user.id).single()

  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const keywords = brand.keywords || []
  if (keywords.length === 0) {
    return NextResponse.json({ error: 'No keywords configured. Add keywords in Settings first.' }, { status: 400 })
  }

  const selectedEngines = (engines as Engine[]) || ['perplexity']
  const results = await scrapeAllEngines(keywords, brand.name, brand.domain, selectedEngines)

  if (results.length > 0) {
    await supabase.from('mentions').insert(
      results.map(r => ({
        brand_id: brandId,
        engine: r.engine,
        prompt: r.prompt,
        response_text: r.responseText,
        mentioned: r.mentioned,
        sentiment: r.sentiment,
        position: r.position,
        cited_url: r.citedUrl,
        score: r.score,
      }))
    )
  }

  return NextResponse.json({
    scraped: results.length,
    mentioned: results.filter(r => r.mentioned).length,
    byEngine: selectedEngines.map(e => ({
      engine: e,
      count: results.filter(r => r.engine === e).length,
      mentioned: results.filter(r => r.engine === e && r.mentioned).length,
    })),
  })
}
