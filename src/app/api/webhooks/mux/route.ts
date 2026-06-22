import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, data } = body

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey || serviceKey.includes('REPLACE')) {
    console.error('[mux webhook] SUPABASE_SERVICE_ROLE_KEY not configured — cannot update clip status')
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  if (type === 'video.asset.ready') {
    const { id: assetId, playback_ids, duration } = data
    const playbackId = playback_ids?.[0]?.id

    const { error } = await supabase.from('clips')
      .update({
        status: 'ready',
        mux_playback_id: playbackId,
        duration_sec: duration ? Math.round(duration) : null,
      })
      .eq('mux_asset_id', assetId)

    if (error) {
      // Same gap as the Stripe webhook: discarding this error meant a clip
      // could finish processing successfully on Mux's end while staying
      // stuck on "processing" in our own database forever, with Mux
      // believing the webhook was delivered fine (200) and never retrying.
      console.error('[mux webhook] failed to mark clip ready', { assetId, error: error.message })
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
  }

  if (type === 'video.asset.errored') {
    const { error } = await supabase.from('clips').update({ status: 'failed' }).eq('mux_asset_id', data.id)
    if (error) {
      console.error('[mux webhook] failed to mark clip failed', { assetId: data.id, error: error.message })
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
