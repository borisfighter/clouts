import Link from 'next/link'
import type { Metadata } from 'next'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Clouts for Agencies — Manage Client AI Visibility at Scale | Clouts',
  description: 'Monitor AI visibility for multiple client brands. Generate shareable reports. Prove ROI. Clouts for agencies tracks ChatGPT, Perplexity, Gemini, and Grok across your entire portfolio.',
}

export default function AgenciesPage() {
  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      <nav className="flex h-16 items-center justify-between border-b border-white/[0.07] px-8">
        <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-white/50 hover:text-white">Pricing</Link>
          <Link href="/auth/signup" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500 transition-colors">
            Start free
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-20 space-y-20">
        {/* Hero */}
        <div className="text-center space-y-5">
          <div className="inline-block rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-4 py-1.5 text-xs font-semibold text-violet-300">
            Built for agencies
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-[1.05]">
            Track AI visibility<br />
            <span className="text-violet-400">for every client.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Manage all your clients' AI search presence from one dashboard. Generate beautiful shareable reports. Prove ROI with data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
              Start free — no credit card →
            </Link>
            <Link href="/pricing" className="text-sm text-white/40 hover:text-white transition-colors">
              View Team plan →
            </Link>
          </div>
        </div>

        {/* Agency features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: '📊',
              title: 'Multi-brand dashboard',
              desc: 'Switch between client brands instantly. Each brand has its own visibility data, keywords, and scan history.',
            },
            {
              icon: '📤',
              title: 'Shareable client reports',
              desc: 'Every brand gets a public share link (e.g. clouts.com/r/client-brand). Share with clients in one click — no login required.',
            },
            {
              icon: '🤖',
              title: 'AEO recommendations at scale',
              desc: 'Run the AEO agent per brand to generate a content roadmap. Deliver AI-optimized briefs to your content team.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-3">
              <span className="text-3xl">{icon}</span>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* How agencies use Clouts */}
        <div className="space-y-6">
          <h2 className="text-3xl font-black text-white text-center">How agencies use Clouts</h2>
          <div className="space-y-4">
            {[
              { n: '1', title: 'Onboard each client brand', desc: 'Add client domains and keywords in minutes. Clouts generates a share link automatically for each brand.' },
              { n: '2', title: 'Run weekly AI scans', desc: 'Automated hourly scans (Team plan) keep your data fresh. Or run manual scans on demand for any client.' },
              { n: '3', title: 'Share reports in one click', desc: 'Send clients their AI visibility report URL. They can see their mention rate, engine breakdown, and competitor comparison — no login needed.' },
              { n: '4', title: 'Deliver AEO content briefs', desc: 'Run the AEO agent per client to get a prioritized content roadmap. Turn AI recommendations into deliverables.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-black text-violet-400">{n}</div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">{title}</p>
                  <p className="text-sm text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing highlight */}
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Team Plan</p>
              <h3 className="text-2xl font-black text-white mb-3">$299/mo · Unlimited everything</h3>
              <ul className="space-y-2">
                {[
                  'Unlimited client brands',
                  'Unlimited AI mentions/mo',
                  'All 5 AI engines (ChatGPT, Perplexity, Gemini, Grok, Claude)',
                  'Unlimited clips and agents',
                  'Hourly automated scans',
                  'Public shareable reports per brand',
                  'Dedicated support',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <Check size={13} className="text-emerald-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center shrink-0">
              <p className="text-5xl font-black text-white mb-1">$299</p>
              <p className="text-white/40 text-sm mb-6">/month · cancel anytime</p>
              <Link href="/auth/signup"
                className="block rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
                Start free trial →
              </Link>
              <p className="text-xs text-white/30 mt-2">No credit card required</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/[0.07] py-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
          <div className="flex gap-6 text-sm text-white/30">
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
