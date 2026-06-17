import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      // Ensure user row exists
      const { data: existing } = await supabase.from('users').select('id').eq('id', user.id).single()

      if (!existing) {
        // New user — create row + send welcome email + redirect to settings
        await supabase.from('users').insert({ id: user.id, email: user.email! })
        try { await sendWelcomeEmail(user.email!, user.user_metadata?.full_name) } catch {}
        return NextResponse.redirect(`${origin}/dashboard/settings?welcome=1`)
      }

      // Returning user — check if they have a brand
      const { count } = await supabase.from('brands').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (!count || count === 0) {
        return NextResponse.redirect(`${origin}/dashboard/settings?welcome=1`)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
