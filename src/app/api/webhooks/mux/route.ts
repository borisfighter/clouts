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

    // Try primary lookup: by asset ID (set when created from source URL)
    let { error, count } = await supabase.from('clips')
      .update(updates).eq('mux_asset_id', assetId)
      .select('id', { count: 'exact', head: true })

    // Fallback: by upload ID (set when created via direct upload URL)
    if (!error && (!count || count === 0) && uploadId) {
      const { error: e2 } = await supabase.from('clips')
        .update(updates).eq('mux_upload_id', uploadId)
      error = e2
    }

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
