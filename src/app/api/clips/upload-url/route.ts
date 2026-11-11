import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { muxConfigured, muxClient, clipQuota, AUTO_SUBTITLES } from '@/lib/clips'

/** Returns a Mux direct-upload URL the browser PUTs the video file to. */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, title } = await req.json()
  if (!brandId || !title) return NextResponse.json({ error: 'brandId and title required' }, { status: 400 })
  const { data: brand } = await supabase.from('brands').select('id').eq('id', brandId).eq('user_id', user.id).single()
  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const quota = await clipQuota(supabase, user.id)
  if (quota.error) return NextResponse.json({ error: quota.error }, { status: 403 })
  if (!muxConfigured()) return NextResponse.json({ error: 'Video processing is not connected yet (Mux keys missing).' }, { status: 503 })

  const { data: clip, error } = await supabase.from('clips').insert({
    brand_id: brandId, title, status: 'awaiting_upload', kind: 'source',
  }).select().single()
  if (error || !clip) return NextResponse.json({ error: 'Failed to create clip record' }, { status: 500 })

  try {
    const upload = await muxClient().video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'], mp4_support: 'capped-1080p', passthrough: clip.id,
        input: [{ generated_subtitles: AUTO_SUBTITLES }],
      },
      cors_origin: process.env.NEXT_PUBLIC_APP_URL || 'https://www.clouts.com',
    })
    await supabase.from('clips').update({ mux_upload_id: upload.id }).eq('id', clip.id)
    return NextResponse.json({ uploadUrl: upload.url, uploadId: upload.id, clipId: clip.id })
  } catch (err) {
    await supabase.from('clips').delete().eq('id', clip.id)
    return NextResponse.json({ error: `Video upload unavailable: ${err instanceof Error ? err.message : 'Mux error'}` }, { status: 502 })
  }
}
