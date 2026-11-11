import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { muxConfigured, muxClient, clipQuota, AUTO_SUBTITLES } from '@/lib/clips'

/** Starts processing a video from a public URL. Direct file uploads use /api/clips/upload-url. */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, title, sourceUrl } = await req.json()
  if (!brandId || !title || !sourceUrl) return NextResponse.json({ error: 'brandId, title and sourceUrl required' }, { status: 400 })
  if (!/^https:\/\//i.test(sourceUrl)) return NextResponse.json({ error: 'Video URL must be a direct https link to a video file' }, { status: 400 })

  const { data: brand } = await supabase.from('brands').select('id').eq('id', brandId).eq('user_id', user.id).single()
  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const quota = await clipQuota(supabase, user.id)
  if (quota.error) return NextResponse.json({ error: quota.error }, { status: 403 })
  if (!muxConfigured()) return NextResponse.json({ error: 'Video processing is not connected yet (Mux keys missing).' }, { status: 503 })

  const { data: clip, error } = await supabase.from('clips').insert({
    brand_id: brandId, title, source_url: sourceUrl, status: 'processing', kind: 'source',
  }).select().single()
  if (error || !clip) return NextResponse.json({ error: 'Failed to create clip' }, { status: 500 })

  try {
    const asset = await muxClient().video.assets.create({
      input: [{ url: sourceUrl, generated_subtitles: AUTO_SUBTITLES }],
      playback_policy: ['public'],
      mp4_support: 'capped-1080p',
      passthrough: clip.id,
    })
    await supabase.from('clips').update({ mux_asset_id: asset.id, mux_playback_id: asset.playback_ids?.[0]?.id }).eq('id', clip.id)
    return NextResponse.json({ clipId: clip.id, status: 'processing' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Mux error'
    await supabase.from('clips').update({ status: 'failed', error: message }).eq('id', clip.id)
    return NextResponse.json({ error: `Video processing failed: ${message}` }, { status: 502 })
  }
}
