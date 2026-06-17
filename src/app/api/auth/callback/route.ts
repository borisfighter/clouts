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
      // Upsert user row (create on first login)
      const { data: existing } = await supabase.from('users').select('id').eq('id', user.id).single()
      if (!existing) {
        await supabase.from('users').insert({ id: user.id, email: user.email! })
        // Send welcome email to new users only
        try { await sendWelcomeEmail(user.email!, user.user_metadata?.full_name) } catch {}
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
