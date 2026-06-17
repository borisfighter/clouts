import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: existing } = await supabase.from('users').select('id').eq('id', user.id).single()
  if (!existing) {
    await supabase.from('users').insert({ id: user.id, email: user.email!, plan: 'free' })
  }
  return NextResponse.json({ ok: true })
}
