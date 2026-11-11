import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { exchangeCode, myChannel } from '@/lib/social/youtube'

export async function GET(req: NextRequest) {
  const back = (q: string) => {
    const res = NextResponse.redirect(new URL(`/dashboard/clips/publish?${q}`, req.url))
    res.cookies.delete({ name: 'yt_oauth_state', path: '/api/social/youtube' })
    return res
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const state = req.nextUrl.searchParams.get('state')
  const code = req.nextUrl.searchParams.get('code')
  if (!state || state !== req.cookies.get('yt_oauth_state')?.value) return back('error=youtube_state')
  if (!code) return back('error=youtube_denied')

  try {
    const tok = await exchangeCode(code, req.nextUrl.origin)
    if (!tok.refresh_token) return back('error=youtube_no_refresh')
    const ch = await myChannel(tok.access_token)
    const { error } = await createAdminClient().from('social_accounts').upsert({
      user_id: user.id, provider: 'youtube', account_id: ch.id, account_name: ch.title,
      refresh_token: tok.refresh_token, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,provider' })
    if (error) throw error
    return back('connected=youtube')
  } catch (e) {
    console.error('YouTube connect failed:', e)
    return back('error=youtube_connect')
  }
}
