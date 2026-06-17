/**
 * Resend email client
 * Add RESEND_API_KEY to env vars to enable emails
 */

interface EmailPayload {
  to: string
  subject: string
  html: string
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log('[Email mock]', payload.subject, '→', payload.to)
    return true
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Clouts <hello@clouts.com>', ...payload }),
    })
    return res.ok
  } catch { return false }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Clouts — your AI visibility starts now',
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#08090A;color:#fff;padding:40px;max-width:600px;margin:0 auto">
  <h1 style="font-size:28px;font-weight:900;margin-bottom:8px">Welcome to Clouts<span style="color:#8b5cf6">.</span></h1>
  <p style="color:rgba(255,255,255,0.5);margin-bottom:32px">Your AI visibility platform is ready.</p>
  <p style="color:rgba(255,255,255,0.7)">Hi ${name || 'there'},</p>
  <p style="color:rgba(255,255,255,0.7)">You're now set up to monitor how AI engines like ChatGPT, Perplexity, and Gemini talk about your brand.</p>
  <div style="margin:32px 0">
    <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:16px">Get started in 3 steps:</p>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:12px">
      <p style="margin:0;font-size:13px"><strong>1.</strong> Add your brand domain in <a href="https://www.clouts.com/dashboard/settings" style="color:#8b5cf6">Settings</a></p>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:12px">
      <p style="margin:0;font-size:13px"><strong>2.</strong> Add keywords your customers would search for</p>
    </div>
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px">
      <p style="margin:0;font-size:13px"><strong>3.</strong> Run your first AI visibility scan</p>
    </div>
  </div>
  <a href="https://www.clouts.com/dashboard" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;font-size:14px">Open your dashboard →</a>
  <p style="color:rgba(255,255,255,0.2);font-size:12px;margin-top:40px">Clouts · AI Visibility + Content Clipping · <a href="https://www.clouts.com" style="color:rgba(255,255,255,0.3)">clouts.com</a></p>
</body>
</html>`,
  })
}

export async function sendScanCompleteEmail(email: string, brandName: string, mentionRate: number, totalScans: number) {
  return sendEmail({
    to: email,
    subject: `${brandName} AI scan complete — ${mentionRate}% mention rate`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#08090A;color:#fff;padding:40px;max-width:600px;margin:0 auto">
  <h1 style="font-size:24px;font-weight:900;margin-bottom:8px">AI Scan Complete</h1>
  <p style="color:rgba(255,255,255,0.5);margin-bottom:32px">${brandName} visibility report</p>
  <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:16px;padding:24px;margin-bottom:24px;text-align:center">
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0 0 8px">AI Mention Rate</p>
    <p style="font-size:48px;font-weight:900;margin:0;color:${mentionRate >= 50 ? '#34d399' : mentionRate >= 25 ? '#fbbf24' : '#f87171'}">${mentionRate}%</p>
    <p style="color:rgba(255,255,255,0.3);font-size:13px;margin:8px 0 0">across ${totalScans} queries</p>
  </div>
  <a href="https://www.clouts.com/dashboard/visibility" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:700;font-size:14px">View full report →</a>
  <p style="color:rgba(255,255,255,0.2);font-size:12px;margin-top:40px">Clouts · <a href="https://www.clouts.com" style="color:rgba(255,255,255,0.3)">clouts.com</a></p>
</body>
</html>`,
  })
}
