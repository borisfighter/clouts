import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { muxClient } from '@/lib/clips'
import { inngest } from '@/lib/inngest'

export async function POST(req: NextRequest) {
  const secret = process.env.MUX_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'MUX_WEBHOOK_SECRET not configured' }, { status: 503 })

  const raw = await req.text()
  let event: any
  try {
    event = muxClient().webhooks.unwrap(raw, Object.fromEntries(req.headers.entries()), secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = createAdminClient()
  const { type, data } = event

  const findClip = async () => {
    if (data?.passthrough) {
      const { data: c } = await db.from('clips').select('id, kind').eq('id', data.passthrough).maybeSingle()
      if (c) return c
    }
    if (data?.upload_id) {
      const { data: c } = await db.from('clips').select('id, kind').eq('mux_upload_id', data.upload_id).maybeSingle()
      if (c) return c
    }
    const { data: c } = await db.from('clips').select('id, kind').eq('mux_asset_id', data?.id).maybeSingle()
    return c
  }

  if (type === 'video.upload.asset_created') {
    await db.from('clips').update({ mux_asset_id: data.asset_id, status: 'processing' }).eq('mux_upload_id', data.id)
  }

  if (type === 'video.asset.ready') {
    const clip = await findClip()
    if (!clip) return NextResponse.json({ received: true, matched: false })
    const { error } = await db.from('clips').update({
      status: clip.kind === 'clip' ? 'ready' : 'transcribing',
      mux_asset_id: data.id,
      mux_playback_id: data.playback_ids?.[0]?.id,
      duration_sec: data.duration ? Math.round(data.duration) : null,
      thumbnail_url: data.playback_ids?.[0]?.id ? `https://image.mux.com/${data.playback_ids[0].id}/thumbnail.jpg?time=1` : null,
    }).eq('id', clip.id)
    if (error) return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
  }

  if (type === 'video.asset.track.ready' && data.type === 'text' && data.text_source === 'generated_vod') {
    const { data: clip } = await db.from('clips').select('id').eq('mux_asset_id', data.asset_id).eq('kind', 'source').maybeSingle()
    if (clip) {
      await db.from('clips').update({ transcript_track_id: data.id, status: 'finding_moments' }).eq('id', clip.id)
      await inngest.send({ name: 'clips/transcript.ready', data: { clipId: clip.id } })
    }
  }

  if (type === 'video.asset.track.errored' && data.text_source === 'generated_vod') {
    await db.from('clips').update({ status: 'failed', error: 'Transcription failed (no detectable speech?)' })
      .eq('mux_asset_id', data.asset_id).eq('kind', 'source')
  }

  if (type === 'video.asset.errored') {
    const clip = await findClip()
    if (clip) {
      await db.from('clips').update({ status: 'failed', error: (data.errors?.messages || []).join('; ') || 'Video processing failed' }).eq('id', clip.id)
    }
  }

  return NextResponse.json({ received: true })
}
