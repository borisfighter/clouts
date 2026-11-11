import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { authUrl, youtubeConfigured } from '@/lib/social/youtube'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))
  if (!youtubeConfigured()) return NextResponse.redirect(new URL('/dashboard/clips/publish?error=youtube_not_configured', req.url))
  const state = randomBytes(24).toString('hex')
  const res = NextResponse.redirect(authUrl(req.nextUrl.origin, state))
  res.cookies.set('yt_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/api/social/youtube', maxAge: 600 })
  return res
}
