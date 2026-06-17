import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, title, sourceUrl } = await req.json()
  if (!brandId || !title) return NextResponse.json({ error: 'brandId and title required' }, { status: 400 })

  const { data: clip, error } = await supabase.from('clips').insert({
    brand_id: brandId, title, source_url: sourceUrl || null, status: 'processing',
  }).select().single()

  if (error || !clip) return NextResponse.json({ error: 'Failed to create clip' }, { status: 500 })

  // Mux upload if configured and source URL provided
  if (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET && sourceUrl) {
    try {
      const { default: Mux } = await import('@mux/mux-node')
      const mux = new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET })
      const asset = await mux.video.assets.create({
        input: [{ url: sourceUrl }],
        playback_policy: ['public'],
        mp4_support: 'capped-1080p',
      })
      await supabase.from('clips').update({
        mux_asset_id: asset.id,
        mux_playback_id: asset.playback_ids?.[0]?.id,
      }).eq('id', clip.id)
      return NextResponse.json({ clipId: clip.id, muxAssetId: asset.id, status: 'processing' })
    } catch (err) {
      console.error('Mux error:', err)
    }
  }

  return NextResponse.json({ clipId: clip.id, status: 'processing' })
}
