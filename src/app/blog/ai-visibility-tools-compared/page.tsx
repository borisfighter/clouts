import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Visibility Tools Compared: Clouts vs Profound vs Visiblie | Clouts Blog',
  description: 'An honest comparison of the top AI visibility monitoring platforms in 2026 — features, pricing, and what actually matters for growing brands.',
}

export default function ComparisonArticle() {
  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      <nav className="flex h-16 items-center justify-between border-b border-white/[0.07] px-8">
        <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-sm text-white/50 hover:text-white">← Blog</Link>
          <Link href="/auth/signup" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-blue-500/20 text-blue-300 px-2.5 py-0.5 text-[10px] font-bold">Comparison</span>
            <span className="text-xs text-white/25">June 2026 · 6 min read</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-[1.1]">
            AI Visibility Tools Compared: Clouts vs Profound vs Visiblie
          </h1>
          <p className="text-xl text-white/50 leading-relaxed">
            An honest breakdown of the top AI visibility monitoring platforms in 2026 — what they track, how much they cost, and which one is right for your brand.
          </p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none space-y-8 text-white/70 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white">Why AI visibility monitoring matters now</h2>
            <p>When someone asks ChatGPT "what's the best CRM for a 50-person team?" your brand either shows up — or it doesn't. There's no page 2. The AI's answer is the answer.</p>
            <p>AI visibility monitoring tools track whether, when, and how your brand gets mentioned across AI engines like ChatGPT, Perplexity, Gemini, Grok, and Claude. This category didn't exist 18 months ago. Now there are several credible options.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white">The contenders</h2>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="text-left px-4 py-3 text-white/50 font-semibold">Feature</th>
                    <th className="text-center px-4 py-3 text-violet-400 font-semibold">Clouts</th>
                    <th className="text-center px-4 py-3 text-white/50 font-semibold">Profound</th>
                    <th className="text-center px-4 py-3 text-white/50 font-semibold">Visiblie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {[
                    ['Engines tracked', '5 (all major)', '4', '3'],
                    ['Free plan', '✓ Yes', '✗ No', '✗ No'],
                    ['AEO recommendations', '✓ AI-powered', '✗ No', 'Manual only'],
                    ['Auto video clips', '✓ Yes', '✗ No', '✗ No'],
                    ['Shareable reports', '✓ Public URL', 'PDF only', '✗ No'],
                    ['Starting price', '$99/mo', '$299/mo', '$199/mo'],
                    ['Multi-brand', '✓ Starter+', '✓ All plans', '✗ Pro only'],
                  ].map(([feature, clouts, profound, visiblie]) => (
                    <tr key={feature}>
                      <td className="px-4 py-3 text-white/60">{feature}</td>
                      <td className="px-4 py-3 text-center text-white/80">{clouts}</td>
                      <td className="px-4 py-3 text-center text-white/40">{profound}</td>
                      <td className="px-4 py-3 text-center text-white/40">{visiblie}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-white/25 italic">Pricing and features current as of June 2026. We're obviously biased — verify independently.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white">Our take</h2>
            <p><strong className="text-white">Clouts</strong> is the only platform with a free tier, AEO content recommendations, and built-in clip generation — making it the best option for most growing brands that want to both monitor and act on their AI visibility.</p>
            <p><strong className="text-white">Profound</strong> is a strong enterprise option with deeper integrations, but the $299/month starting price and no free trial make it hard to justify for teams under 50 people.</p>
            <p><strong className="text-white">Visiblie</strong> covers the basics for monitoring but lacks any actionability — you see the data but the tool doesn't help you improve. Good if you just need raw numbers.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white">Bottom line</h2>
            <p>Start with Clouts. The free plan gives you real data on Perplexity mentions with no credit card required. Upgrade when you need coverage across all 5 engines or automated weekly reports.</p>
          </section>
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-8 text-center space-y-3">
          <p className="text-lg font-bold text-white">Start tracking your AI visibility today</p>
          <p className="text-sm text-white/50">Free plan available. No credit card required to start.</p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
            Get started free →
          </Link>
        </div>
      </article>
    </div>
  )
}
