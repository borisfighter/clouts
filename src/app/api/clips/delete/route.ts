import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clipId } = await req.json()
  if (!clipId) return NextResponse.json({ error: 'clipId required' }, { status: 400 })

  // Fetch clip to verify ownership and get Mux asset ID
  const { data: clip, error: fetchErr } = await supabase
    .from('clips').select('id, mux_asset_id, brands(user_id)').eq('id', clipId).single()

  if (fetchErr || !clip) return NextResponse.json({ error: 'Clip not found' }, { status: 404 })
  if ((clip.brands as any)?.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Delete from Mux first (don't block on failure)
  const muxId = process.env.MUX_TOKEN_ID
  const muxSecret = process.env.MUX_TOKEN_SECRET
  if (clip.mux_asset_id && muxId && muxSecret && !muxId.includes('REPLACE')) {
    try {
      await fetch(`https://api.mux.com/video/v1/assets/${clip.mux_asset_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Basic ' + Buffer.from(`${muxId}:${muxSecret}`).toString('base64') },
      })
    } catch { console.error('Mux asset delete failed:', clip.mux_asset_id) }
  }

  // Clean up publish records (FK)
  await supabase.from('clip_publishes').delete().eq('clip_id', clipId)
  // Delete clip
  const { error: delErr } = await supabase.from('clips').delete().eq('id', clipId)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
