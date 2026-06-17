import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      // Always upsert user row — works even without service role key
      const { data: existing } = await supabase.from('users').select('id').eq('id', user.id).single()
      if (!existing) {
        await supabase.from('users').insert({ id: user.id, email: user.email!, plan: 'free' })
        try { await sendWelcomeEmail(user.email!, user.user_metadata?.full_name) } catch {}
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
