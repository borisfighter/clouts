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
  const rawResults = await scrapeAllEngines(keywords, brand.name, brand.domain, selectedEngines)
  
  // Add competitor mention detection
  const competitors: string[] = brand.competitors || []
  const results = rawResults.map(r => {
    if (!competitors.length) return r
    const text = r.responseText.toLowerCase()
    const competitorMentions: Record<string, boolean> = {}
    competitors.forEach(c => {
      const domain = c.toLowerCase().replace('www.', '').replace('https://', '').split('/')[0]
      competitorMentions[c] = text.includes(domain)
    })
    return { ...r, competitorMentions }
  })

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

  const mentioned = results.filter(r => r.mentioned).length
  const mentionRate = results.length > 0 ? Math.round((mentioned / results.length) * 100) : 0

  // Fire-and-forget: send scan complete email (non-blocking)
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('REPLACE')) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/scan-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, brandName: brand.name, mentionRate, totalScans: results.length }),
    }).catch(() => {}) // non-blocking
  }

  // Aggregate competitor mentions across all results
  const competitorStats: Record<string, number> = {}
  competitors.forEach(comp => {
    competitorStats[comp] = results.filter(r => r.competitorMentions?.[comp]).length
  })

  return NextResponse.json({
    scraped: results.length,
    mentioned,
    mentionRate,
    competitorStats: competitors.length > 0 ? competitorStats : undefined,
    byEngine: selectedEngines.map(e => ({
      engine: e,
      count: results.filter(r => r.engine === e).length,
      mentioned: results.filter(r => r.engine === e && r.mentioned).length,
    })),
  })
}
