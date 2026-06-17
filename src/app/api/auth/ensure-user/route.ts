import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Upsert user row in public.users
  const { error } = await supabase.from('users').upsert(
    { id: user.id, email: user.email! },
    { onConflict: 'id', ignoreDuplicates: true }
  )
  
  return NextResponse.json({ ok: true, userId: user.id })
}
