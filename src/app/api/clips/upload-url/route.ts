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

  const { data: clip, error: clipErr } = await supabase.from('clips').insert({
    brand_id: brandId, title, status: 'awaiting_upload', mux_upload_id: upload.id,
  }).select().single()

  if (clipErr || !clip) {
    // A Mux upload URL was already created above at this point - if the
    // clip row fails to save, returning 200 with clipId: undefined would
    // leave the caller with a working upload URL but no clip to attach it
    // to once the video finishes processing. Failing the request here is
    // safer than letting a caller silently miss the missing clipId.
    return NextResponse.json({ error: 'Failed to create clip record' }, { status: 500 })
  }

  return NextResponse.json({ uploadUrl: upload.url, uploadId: upload.id, clipId: clip.id })
}
