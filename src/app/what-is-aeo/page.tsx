import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'What is AEO (Answer Engine Optimization)? | Clouts',
  description: 'Answer Engine Optimization (AEO) is the practice of optimizing your content to appear in AI chatbot responses. Learn how to rank in ChatGPT, Perplexity, and Gemini.',
}

export default function WhatIsAEOPage() {
  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      <nav className="flex h-16 items-center justify-between border-b border-white/[0.07] px-8">
        <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-white/50 hover:text-white">Pricing</Link>
          <Link href="/auth/signup" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16 space-y-16">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-block rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-4 py-1.5 text-xs font-semibold text-violet-300">
            The definitive guide
          </div>
          <h1 className="text-5xl font-black tracking-tight">
            What is AEO?
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Answer Engine Optimization is the new SEO — optimizing your brand to appear in ChatGPT, Perplexity, Claude, and Gemini responses.
          </p>
        </div>

        <div className="space-y-10 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-2xl font-black text-white mb-4">The shift from search to AI</h2>
            <p className="mb-4">When someone wants to find "the best project management software" today, they're increasingly not going to Google. They're opening ChatGPT and asking: <em className="text-white/90">"What's the best project management tool for a 10-person startup?"</em></p>
            <p className="mb-4">The AI gives a specific answer. It names brands. It explains why. The user often doesn't search any further — they've got their recommendation.</p>
            <p>If your brand isn't in that response, you don't exist for that buyer.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">What AEO means</h2>
            <p className="mb-4"><strong className="text-white">Answer Engine Optimization (AEO)</strong> is the practice of structuring your content, positioning, and digital presence so that AI engines cite your brand when answering relevant queries.</p>
            <p className="mb-4">Traditional SEO optimizes for search engine rankings. AEO optimizes for AI citations — the brands AI engines recommend when users ask questions in your category.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Why AEO matters in 2026</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose my-6">
              {[
                { stat: '40%+', label: 'of B2B searches now start in an AI tool', color: 'text-violet-400' },
                { stat: '47%', label: 'of consumers say AI shapes brand discovery', color: 'text-emerald-400' },
                { stat: '8x', label: 'more citations for structured vs unstructured content', color: 'text-yellow-400' },
              ].map(({ stat, label, color }) => (
                <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-center">
                  <p className={`text-4xl font-black mb-1 ${color}`}>{stat}</p>
                  <p className="text-xs text-white/40">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">How AI engines decide what to recommend</h2>
            <p className="mb-4">AI engines like ChatGPT and Perplexity are trained on internet content — blogs, forums, review sites, documentation, and more. They learn which brands are associated with which problems, and they reflect that in their answers.</p>
            <p className="mb-4">Key factors that influence AI citations:</p>
            <ul className="space-y-3 mt-4">
              {[
                ['Structured content', 'FAQ pages, comparison articles, and how-to guides in clear Q&A format'],
                ['Domain authority', 'High-quality backlinks and mentions on authoritative sites'],
                ['Entity consistency', 'Your brand name, description, and key facts must be consistent across the web'],
                ['Semantic coverage', 'Content that thoroughly answers the questions people ask about your category'],
                ['Structured data', 'JSON-LD schema markup (Organization, Product, FAQ) helps AI parse your content'],
              ].map(([term, def]) => (
                <li key={term as string} className="flex gap-3">
                  <span className="text-violet-400 shrink-0 mt-0.5">→</span>
                  <span><strong className="text-white/90">{term}: </strong>{def}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">The AEO playbook</h2>
            <div className="space-y-4 mt-4">
              {[
                { step: '1', title: 'Track your visibility', desc: 'First, know where you stand. Run queries across ChatGPT, Perplexity, Gemini, and Grok to see your current mention rate. Identify which engines mention you and which ignore you.' },
                { step: '2', title: 'Analyze the gap', desc: 'Look at what competitors are doing right. When an AI cites a competitor instead of you, what content are they drawing from? FAQ pages, comparison articles, and Wikipedia-style overviews are usually the source.' },
                { step: '3', title: 'Create AEO-optimized content', desc: 'Build content that directly answers the questions your customers ask. Use clear Q&A format, include specific data points, and structure answers so AI can extract and cite them easily.' },
                { step: '4', title: 'Monitor and iterate', desc: 'AEO is ongoing. AI engine training changes. Your competitors publish new content. Track your mention rate weekly and run the AEO agent to get updated recommendations.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-black text-violet-400">{step}</div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{title}</p>
                    <p className="text-sm text-white/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">AEO vs SEO: key differences</h2>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="text-left py-3 pr-4 text-white/30 font-semibold w-40">Dimension</th>
                    <th className="text-left py-3 pr-4 text-white font-bold">AEO</th>
                    <th className="text-left py-3 text-white/60 font-semibold">SEO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ['Goal', 'Appear in AI responses', 'Rank in search results'],
                    ['What you track', 'Mention rate, citation rate, sentiment', 'Rankings, organic clicks, impressions'],
                    ['Content format', 'Q&A, entity-centric, structured', 'Long-form, keyword-rich, link-building'],
                    ['Update cycle', 'Weeks to months (AI retraining)', 'Days to weeks (crawling + indexing)'],
                    ['Competition', 'Other cited brands in AI responses', 'Other ranked pages on SERPs'],
                  ].map(([dim, aeo, seo]) => (
                    <tr key={dim as string}>
                      <td className="py-3 pr-4 text-white/30">{dim}</td>
                      <td className="py-3 pr-4 text-white/80">{aeo}</td>
                      <td className="py-3 text-white/50">{seo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-8 text-center">
          <h3 className="text-xl font-black text-white mb-3">Start tracking your AI visibility</h3>
          <p className="text-sm text-white/40 mb-6">
            Clouts monitors your brand across 5 AI engines and runs the AEO agent to give you a prioritized content roadmap — free.
          </p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
            Start free — no credit card →
          </Link>
        </div>
      </div>

      <footer className="border-t border-white/[0.07] py-8 mt-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
          <div className="flex gap-6 text-sm text-white/30">
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/changelog" className="hover:text-white">Changelog</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
