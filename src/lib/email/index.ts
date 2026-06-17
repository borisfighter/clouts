import { Resend } from 'resend'
import type { Clip } from '@/lib/db/schema'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@clouts.com'

export async function sendClipReadyEmail(clip: Clip) {
  return resend.emails.send({
    from:    FROM,
    to:      [], // populate from user lookup
    subject: `Your clip "${clip.title}" is ready`,
    react:   null, // import ClipReadyEmail from '@/emails/ClipReady'
  })
}

export async function sendWelcomeEmail(email: string, name: string) {
  return resend.emails.send({
    from:    FROM,
    to:      email,
    subject: 'Welcome to Clouts — let\'s get your brand visible',
    react:   null, // import WelcomeEmail from '@/emails/Welcome'
  })
}

export async function sendWeeklyReport(email: string, data: {
  brandName: string
  mentionCount: number
  topEngine: string
  visibilityScore: number
  clipCount: number
}) {
  return resend.emails.send({
    from:    FROM,
    to:      email,
    subject: `Your Clouts weekly report — ${data.brandName}`,
    react:   null, // import WeeklyReportEmail from '@/emails/WeeklyReport'
  })
}
