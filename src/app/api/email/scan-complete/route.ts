import { NextRequest, NextResponse } from 'next/server'
import { sendScanCompleteEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { email, brandName, mentionRate, totalScans } = await req.json()
  if (!email || !brandName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  await sendScanCompleteEmail(email, brandName, mentionRate, totalScans)
  return NextResponse.json({ sent: true })
}
