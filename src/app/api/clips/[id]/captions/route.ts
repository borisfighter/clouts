import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { vttToSrt } from '@/lib/clips'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: clip } = await supabase.from('clips').select('title, captions_vtt').eq('id', params.id).single()
  if (!clip?.captions_vtt) return NextResponse.json({ error: 'No captions' }, { status: 404 })
  const srt = req.nextUrl.searchParams.get('format') === 'srt'
  const name = (clip.title || 'clip').replace(/[^\w-]+/g, '_').slice(0, 60)
  return new NextResponse(srt ? vttToSrt(clip.captions_vtt) : clip.captions_vtt, {
    headers: {
      'Content-Type': srt ? 'application/x-subrip' : 'text/vtt',
      'Content-Disposition': `attachment; filename="${name}.${srt ? 'srt' : 'vtt'}"`,
    },
  })
}
