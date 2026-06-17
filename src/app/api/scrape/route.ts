import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapePerplexityBatch } from '@/lib/scraper/perplexity'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId } = await req.json()

  // Fetch the brand
  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .eq('user_id', user.id)
    .single()

  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const keywords = brand.keywords || []
  if (keywords.length === 0) {
    return NextResponse.json({ error: 'No keywords configured. Add keywords in Settings first.' }, { status: 400 })
  }

  // Run Perplexity scrape
  const results = await scrapePerplexityBatch(keywords, brand.name, brand.domain)

  // Save to DB
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
    results: results.map(r => ({
      prompt: r.prompt,
      mentioned: r.mentioned,
      score: r.score,
      sentiment: r.sentiment,
    })),
  })
}
