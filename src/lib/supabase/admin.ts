import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

export function serviceKeyConfigured() {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY
  return !!k && !k.includes('REPLACE')
}

export function createAdminClient(): SupabaseClient {
  if (!serviceKeyConfigured()) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
