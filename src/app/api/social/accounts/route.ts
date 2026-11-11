import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { youtubeConfigured } from '@/lib/social/youtube'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await createAdminClient().from('social_accounts').select('provider, account_name').eq('user_id', user.id)
  const yt = data?.find(a => a.provider === 'youtube')
  return NextResponse.json({ youtube: { configured: youtubeConfigured(), connected: !!yt, name: yt?.account_name ?? null } })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const provider = new URL(req.url).searchParams.get('provider')
  if (provider !== 'youtube') return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
  await createAdminClient().from('social_accounts').delete().eq('user_id', user.id).eq('provider', provider)
  return NextResponse.json({ ok: true })
}
