import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brandId')
  const days = parseInt(searchParams.get('days') || '30')
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const { data: brand } = await supabase.from('brands')
    .select('name').eq('id', brandId!).eq('user_id', user.id).single()
  if (!brand) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: mentions } = await supabase.from('mentions')
    .select('engine, prompt, mentioned, sentiment, score, position, cited_url, scraped_at')
    .eq('brand_id', brandId!).gte('scraped_at', since)
    .order('scraped_at', { ascending: false }).limit(10000)

  const header = ['Date', 'Engine', 'Query', 'Mentioned', 'Sentiment', 'Score', 'Position', 'Cited URL']
  const rows = (mentions || []).map(m => [
    new Date(m.scraped_at).toISOString().slice(0, 10),
    m.engine,
    `"${(m.prompt || '').replace(/"/g, '""')}"`,
    m.mentioned ? 'Yes' : 'No',
    m.sentiment || '',
    m.score ?? '',
    m.position ?? '',
    m.cited_url || '',
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const filename = `${brand.name.replace(/\s+/g, '_')}_mentions_${days}d.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
