import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendScanCompleteEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { email, brandName, mentionRate, totalScans, userId } = await req.json()
  if (!email || !brandName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Respect notification preference
  if (userId) {
    const supabase = await createClient()
    const { data: user } = await supabase.from('users')
      .select('notif_scan_complete').eq('id', userId).single()
    if (user && user.notif_scan_complete === false) {
      return NextResponse.json({ sent: false, reason: 'User opted out of scan emails' })
    }
  }

  await sendScanCompleteEmail(email, brandName, mentionRate, totalScans)
  return NextResponse.json({ sent: true })
}
