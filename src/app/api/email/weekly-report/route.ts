import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Only callable internally (Inngest or cron)
  const authHeader = req.headers.get('authorization')
  const expectedKey = process.env.INNGEST_EVENT_KEY
  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { brandId, email, brandName, userId } = await req.json()

  // Respect notification preferences — skip if user opted out of weekly reports
  if (userId) {
    const { data: user } = await supabase
      .from('users').select('notif_weekly_report').eq('id', userId).single()
    if (user && user.notif_weekly_report === false) {
      return NextResponse.json({ sent: false, reason: 'User opted out of weekly reports' })
    }
  }

  // Get last 7 days stats
  const since = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data: mentions } = await supabase.from('mentions')
    .select('engine, mentioned, score, scraped_at')
    .eq('brand_id', brandId).gte('scraped_at', since)

  const total = mentions?.length || 0
  const mentioned = mentions?.filter(m => m.mentioned).length || 0
  const mentionRate = total > 0 ? Math.round((mentioned / total) * 100) : 0
  const scores = mentions?.filter(m => m.score).map(m => m.score!) || []
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0

  // Engine breakdown for email
  const byEngine: Record<string, { mentioned: number; total: number }> = {}
  for (const m of mentions || []) {
    if (!byEngine[m.engine]) byEngine[m.engine] = { mentioned: 0, total: 0 }
    byEngine[m.engine].total++
    if (m.mentioned) byEngine[m.engine].mentioned++
  }
  const engineRows = Object.entries(byEngine)
    .map(([e, d]) => ({ engine: e, rate: d.total > 0 ? Math.round((d.mentioned / d.total) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate)

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey.includes('REPLACE')) {
    return NextResponse.json({ sent: false, reason: 'No Resend key' })
  }

  const ENGINE_LABELS: Record<string,string> = { chatgpt:'ChatGPT', perplexity:'Perplexity', gemini:'Gemini', grok:'Grok', claude:'Claude' }
  const engineTableRows = engineRows.map(({ engine, rate }) =>
    `<tr><td style="padding:8px 16px;color:rgba(255,255,255,0.5);font-size:12px">${ENGINE_LABELS[engine] || engine}</td><td style="padding:8px 16px;text-align:right;font-weight:700;font-size:13px;color:${rate >= 50 ? '#34d399' : rate >= 25 ? '#fbbf24' : '#f87171'}">${rate}%</td></tr>`
  ).join('')

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#08090A;color:#fff;padding:40px;max-width:600px;margin:0 auto">
    <h1 style="font-size:20px;font-weight:900;margin-bottom:4px">Weekly AI Visibility Report</h1>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin-bottom:32px">${brandName} · Last 7 days</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
      <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:16px;text-align:center">
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 4px">Mention Rate</p>
        <p style="font-size:36px;font-weight:900;margin:0;color:${mentionRate >= 50 ? '#34d399' : mentionRate >= 25 ? '#fbbf24' : '#f87171'}">${mentionRate}%</p>
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:4px 0 0">${mentioned}/${total} queries</p>
      </div>
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;text-align:center">
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0 0 4px">Avg Score</p>
        <p style="font-size:36px;font-weight:900;margin:0">${avgScore || '—'}</p>
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:4px 0 0">out of 100</p>
      </div>
    </div>
    ${engineRows.length > 0 ? `
    <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:12px;margin-bottom:24px;overflow:hidden">
      <thead><tr><th style="padding:10px 16px;text-align:left;font-size:10px;color:rgba(255,255,255,0.3);font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Engine</th><th style="padding:10px 16px;text-align:right;font-size:10px;color:rgba(255,255,255,0.3);font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Rate</th></tr></thead>
      <tbody>${engineTableRows}</tbody>
    </table>` : ''}
    <a href="https://www.clouts.com/dashboard" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;font-size:14px">View full report →</a>
    <p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:32px">Clouts · <a href="https://www.clouts.com" style="color:rgba(255,255,255,0.3)">clouts.com</a> · <a href="https://www.clouts.com/dashboard/settings" style="color:rgba(255,255,255,0.3)">Manage notifications</a></p>
  </body></html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Clouts <hello@clouts.com>', to: email, subject: `${brandName}: ${mentionRate}% AI mention rate this week`, html }),
  })

  return NextResponse.json({ sent: res.ok, mentionRate, total })
}
