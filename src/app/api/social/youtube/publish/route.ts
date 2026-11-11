import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { refreshAccess, uploadVideo, youtubeConfigured } from '@/lib/social/youtube'

export const maxDuration = 300

const MAX_BYTES = 256 * 1024 * 1024

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!youtubeConfigured()) return NextResponse.json({ error: 'YouTube publishing is not set up on this server' }, { status: 503 })

  const { clipId, title, description, privacy } = await req.json().catch(() => ({}))
  if (typeof clipId !== 'string') return NextResponse.json({ error: 'clipId required' }, { status: 400 })
  const vis = (['public', 'unlisted', 'private'] as const).includes(privacy) ? privacy : 'private'

  // RLS: the user client only returns clips from the user's own brands.
  const { data: clip } = await supabase.from('clips').select('id, title, description, kind, status, mux_playback_id').eq('id', clipId).single()
  if (!clip) return NextResponse.json({ error: 'Clip not found' }, { status: 404 })
  if (clip.kind !== 'clip' || clip.status !== 'ready' || !clip.mux_playback_id) return NextResponse.json({ error: 'Clip is not ready' }, { status: 409 })

  const admin = createAdminClient()
  const { data: account } = await admin.from('social_accounts').select('refresh_token').eq('user_id', user.id).eq('provider', 'youtube').single()
  if (!account) return NextResponse.json({ error: 'Connect your YouTube channel first' }, { status: 409 })

  const { data: row } = await admin.from('clip_publishes').insert({ clip_id: clip.id, platform: 'youtube', status: 'publishing' }).select('id').single()
  const fail = async (message: string, status = 502) => {
    if (row) await admin.from('clip_publishes').update({ status: 'failed', error: message.slice(0, 500) }).eq('id', row.id)
    return NextResponse.json({ error: message }, { status })
  }

  try {
    const video = await fetch(`https://stream.mux.com/${clip.mux_playback_id}/capped-1080p.mp4`)
    if (!video.ok) return fail(`Could not fetch clip video (${video.status})`)
    const bytes = await video.arrayBuffer()
    if (bytes.byteLength > MAX_BYTES) return fail('Clip is too large to publish', 413)

    const access = await refreshAccess(account.refresh_token)
    const t = String(title || clip.title || 'Clip').trim()
    const result = await uploadVideo(access, bytes, {
      title: /#shorts/i.test(t) ? t : `${t.slice(0, 91)} #Shorts`,
      description: String(description ?? clip.description ?? ''),
      privacy: vis,
    })
    if (row) await admin.from('clip_publishes').update({
      status: 'published', platform_post_id: result.id, external_url: result.url, published_at: new Date().toISOString(),
    }).eq('id', row.id)
    return NextResponse.json({ ok: true, url: result.url })
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'YouTube upload failed')
  }
}
