import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    return NextResponse.json({ error: 'Mux not configured. Add MUX_TOKEN_ID and MUX_TOKEN_SECRET to env vars.' }, { status: 503 })
  }

  const { brandId, title } = await req.json()
  const { default: Mux } = await import('@mux/mux-node')
  const mux = new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET })

  const upload = await mux.video.uploads.create({
    new_asset_settings: { playback_policy: ['public'], mp4_support: 'capped-1080p' },
    cors_origin: process.env.NEXT_PUBLIC_APP_URL || 'https://clouts.com',
  })

  const { data: clip } = await supabase.from('clips').insert({
    brand_id: brandId, title, status: 'awaiting_upload',
  }).select().single()

  return NextResponse.json({ uploadUrl: upload.url, uploadId: upload.id, clipId: clip?.id })
}
