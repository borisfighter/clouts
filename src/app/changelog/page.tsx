import Link from 'next/link'
import type { Metadata } from 'next'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Changelog | Clouts',
  description: "What's new in Clouts — AI Visibility + Content Clipping platform",
}

const RELEASES = [
  {
    version: '1.0.0',
    date: 'June 2026',
    tag: 'Launch',
    tagColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    title: 'Clouts is live 🚀',
    items: [
      'Monitor your brand across 5 AI engines: Perplexity, ChatGPT, Gemini, Grok, and Claude',
      'AEO Agent powered by Claude claude-sonnet-4-6 — get a prioritized content roadmap',
      'AI Visibility scores (0–100) with sentiment analysis per mention',
      'Prompt Volume tracker with opportunity scores for your keywords',
      'Auto Clips — create and publish video clips from brand moments',
      'Admin panel with integration status dashboard (15 API keys)',
      'Hourly background scans via Inngest (Pro/Team plans)',
      'Stripe billing with Free / Pro ($79) / Team ($299) plans',
    ],
  },
  {
    version: 'Coming soon',
    date: 'Q3 2026',
    tag: 'Roadmap',
    tagColor: 'bg-white/[0.06] text-white/40 border-white/[0.08]',
    title: "What's next",
    items: [
      'Google AI Overview (AIO) and Microsoft Copilot scrapers',
      'Competitor tracking — see how rivals rank vs you in each engine',
      'Social publishing integrations (TikTok, Instagram Reels, YouTube Shorts)',
      'Weekly email digest with visibility trend report',
      'Team collaboration — multiple users per account',
      'Public share link for visibility reports',
      'API access for programmatic scanning',
      'Webhook notifications for sentiment shift alerts',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      <nav className="flex h-16 items-center justify-between border-b border-white/[0.07] px-8">
        <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-white/50 hover:text-white">Pricing</Link>
          <Link href="/auth/login" className="text-sm text-white/50 hover:text-white">Log in</Link>
          <Link href="/auth/signup" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-3">Changelog</h1>
          <p className="text-white/40">What's new in Clouts — updated regularly.</p>
        </div>

        <div className="space-y-12">
          {RELEASES.map(({ version, date, tag, tagColor, title, items }) => (
            <div key={version} className="relative pl-8 border-l border-white/[0.07]">
              <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-violet-500/60 border-2 border-[#08090A]" />
              <div className="flex items-center gap-3 mb-3">
                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${tagColor}`}>{tag}</span>
                <span className="text-xs text-white/30">{date}</span>
              </div>
              <h2 className="text-xl font-black text-white mb-4">{title}</h2>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/60">
                    <Check size={14} className="text-violet-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-6 text-center">
          <p className="text-sm font-semibold text-white mb-2">Want to shape the roadmap?</p>
          <p className="text-sm text-white/40 mb-4">
            Email <a href="mailto:hello@clouts.com" className="text-violet-400 hover:text-violet-300">hello@clouts.com</a> — we build based on user feedback.
          </p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
            Start for free →
          </Link>
        </div>
      </div>

      <footer className="border-t border-white/[0.07] py-8 mt-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
          <div className="flex gap-6 text-sm text-white/30">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/changelog" className="hover:text-white">Changelog</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
          </div>
          <p className="text-xs text-white/20">© 2026 Clouts</p>
        </div>
      </footer>
    </div>
  )
}
