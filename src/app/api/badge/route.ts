import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return new NextResponse('Missing slug parameter', { status: 400 })
  }

  const supabase = await createClient()
  const { data: brand } = await supabase
    .from('brands').select('id, name').eq('share_slug', slug).single()

  if (!brand) {
    return new NextResponse('Brand not found', { status: 404 })
  }

  const since = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: mentions } = await supabase
    .from('mentions').select('mentioned')
    .eq('brand_id', brand.id).gte('scraped_at', since)

  const total = mentions?.length || 0
  const mentioned = mentions?.filter(m => m.mentioned).length || 0
  const rate = total > 0 ? Math.round((mentioned / total) * 100) : 0

  const color = rate >= 50 ? '#10b981' : rate >= 25 ? '#f59e0b' : '#ef4444'
  const label = 'AI Visibility'
  const value = `${rate}%`

  // Shields.io-style SVG badge
  const labelWidth = label.length * 6 + 10
  const valueWidth = value.length * 7 + 10
  const totalWidth = labelWidth + valueWidth

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="110">
    <text x="${(labelWidth / 2 + 1) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}" lengthAdjust="spacing">${label}</text>
    <text x="${(labelWidth / 2) * 10}" y="140" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}" lengthAdjust="spacing">${label}</text>
    <text x="${(labelWidth + valueWidth / 2 + 1) * 10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(valueWidth - 10) * 10}" lengthAdjust="spacing">${value}</text>
    <text x="${(labelWidth + valueWidth / 2) * 10}" y="140" transform="scale(.1)" textLength="${(valueWidth - 10) * 10}" lengthAdjust="spacing">${value}</text>
  </g>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'max-age=3600',
    },
  })
}
