import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

export async function requireAdmin(): Promise<{ user: any; error: NextResponse | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const isAdmin = ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')
  if (!isAdmin) return { user: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  return { user, error: null }
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
