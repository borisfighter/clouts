import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, data } = body

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  if (type === 'video.asset.ready') {
    const { id: assetId, playback_ids, duration } = data
    const playbackId = playback_ids?.[0]?.id

    await supabase.from('clips')
      .update({
        status: 'ready',
        mux_playback_id: playbackId,
        duration_sec: duration ? Math.round(duration) : null,
      })
      .eq('mux_asset_id', assetId)
  }

  if (type === 'video.asset.errored') {
    await supabase.from('clips').update({ status: 'failed' }).eq('mux_asset_id', data.id)
  }

  return NextResponse.json({ received: true })
}
