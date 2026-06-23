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
    const { id: assetId, playback_ids, duration, upload_id: uploadId } = data
    const playbackId = playback_ids?.[0]?.id
    const updates = {
      status: 'ready',
      mux_playback_id: playbackId,
      mux_asset_id: assetId,
      duration_sec: duration ? Math.round(duration) : null,
    }

    // Update by asset ID (works for source-URL uploads)
    const { error: e1 } = await supabase.from('clips')
      .update(updates).eq('mux_asset_id', assetId)

    // Also update by upload ID as fallback (works for direct browser uploads)
    const { error: e2 } = uploadId
      ? await supabase.from('clips').update(updates).eq('mux_upload_id', uploadId)
      : { error: null }

    const error = e1 && e2 ? e1 : null // only fail if BOTH lookups errored

    if (error) {
      console.error('[mux webhook] failed to mark clip ready', { assetId, uploadId, error: error.message })
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
