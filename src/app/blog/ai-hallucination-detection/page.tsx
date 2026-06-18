import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Hallucination Detection: How to Find and Fix Inaccurate Brand Info | Clouts',
  description: 'AI engines sometimes make up facts about your brand. Learn how to detect when ChatGPT or Perplexity is spreading false information and what to do about it.',
}

export default function HallucinationDetectionPage() {
  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      <nav className="flex h-16 items-center justify-between border-b border-white/[0.07] px-8">
        <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-sm text-white/50 hover:text-white">← Blog</Link>
          <Link href="/auth/signup" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500 transition-colors">Get started free</Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-6 py-16 space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-red-500/20 text-red-300 px-2.5 py-0.5 text-[10px] font-bold">Alert</span>
            <span className="text-xs text-white/25">June 2026 · 6 min read</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-[1.1]">
            AI Hallucination Detection: How to Protect Your Brand from AI Misinformation
          </h1>
          <p className="text-xl text-white/50 leading-relaxed">
            AI engines sometimes fabricate facts about your brand — wrong pricing, fake features, or inaccurate comparisons. Here's how to catch it and fix it.
          </p>
        </header>

        <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5">
            <p className="text-sm font-semibold text-red-300 mb-2">⚠ Real-world examples of AI brand hallucinations</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li>"ChatGPT told a customer our plan costs $499/month — we charge $79"</li>
              <li>"Perplexity said we don't support integrations — we have 50+"</li>
              <li>"Gemini described a competitor's features as ours"</li>
            </ul>
          </div>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">What is AI hallucination?</h2>
            <p className="mb-4">AI hallucination occurs when a language model generates information that is incorrect, fabricated, or misleading — and presents it as fact. For brands, this means AI engines may tell potential customers incorrect things about your pricing, features, company history, or positioning.</p>
            <p>Unlike a bad review (which a customer can see is subjective), AI hallucinations are presented with the same authority as accurate information. Buyers don't know to be skeptical.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Common types of brand hallucinations</h2>
            <div className="space-y-3">
              {[
                { title: 'Pricing errors', desc: 'AI states wrong prices, wrong plan names, or wrong billing periods', severity: 'High' },
                { title: 'Feature attribution', desc: 'AI credits features to your brand that belong to competitors (or vice versa)', severity: 'High' },
                { title: 'Outdated information', desc: 'AI states old pricing, discontinued features, or former company details', severity: 'Medium' },
                { title: 'Mixed-up comparisons', desc: 'AI confuses your brand with a competitor with a similar name or position', severity: 'High' },
                { title: 'False restrictions', desc: 'AI claims your product doesn\'t support something it actually does', severity: 'Medium' },
              ].map(({ title, desc, severity }) => (
                <div key={title} className="flex items-start gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <span className={`text-[10px] font-bold shrink-0 mt-0.5 ${severity === 'High' ? 'text-red-400' : 'text-yellow-400'}`}>{severity}</span>
                  <div>
                    <p className="text-sm font-bold text-white mb-0.5">{title}</p>
                    <p className="text-xs text-white/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">How to detect hallucinations</h2>
            <div className="space-y-4">
              {[
                { n: '1', title: 'Run regular AI scans', desc: 'Query AI engines with your brand name and category keywords. Read the actual responses carefully — don\'t just look at whether you were mentioned.' },
                { n: '2', title: 'Check factual claims', desc: 'Note every specific fact the AI states about your brand: pricing, features, founding date, headcount, integrations. Cross-reference against your actual product.' },
                { n: '3', title: 'Use the AEO hallucination detector', desc: 'Clouts\' AEO agent analyzes your mention data and flags responses where it detects potentially inaccurate claims — saving you from manually reviewing hundreds of responses.' },
                { n: '4', title: 'Monitor after product changes', desc: 'AI training data lags reality. Run scans after major product launches, pricing changes, or rebrands to catch outdated information quickly.' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-sm font-black text-red-400">{n}</span>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{title}</p>
                    <p className="text-sm text-white/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">How to fix AI hallucinations about your brand</h2>
            <p className="mb-4">You can't directly edit what AI engines say. But you can change the training data they learn from:</p>
            <ul className="space-y-3 ml-4">
              {['Publish a clear, comprehensive "About" page with current pricing, features, and company facts',
                'Create an official FAQ page that directly contradicts the false information',
                'Update your Wikipedia page if you have one (highly trusted by AI)',
                'Publish a press release or blog post clarifying the correct information',
                'Update your G2/Capterra profile with accurate feature information',
                'Run a retargeting campaign correcting the misinformation for anyone who saw it',
              ].map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-white/50">Note: AI engines update their training data periodically (months, not days). Monitor regularly to verify corrections take effect.</p>
          </section>
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-8 text-center">
          <p className="text-lg font-black text-white mb-2">Detect hallucinations automatically</p>
          <p className="text-sm text-white/40 mb-6">Clouts' AEO agent scans your mentions and flags inaccurate claims — before they cost you customers.</p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
            Start monitoring free →
          </Link>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.07] pt-6">
          <Link href="/blog" className="text-sm text-white/40 hover:text-white transition-colors">← Blog</Link>
          <Link href="/blog/how-to-get-cited-in-chatgpt" className="text-sm text-violet-400 hover:text-violet-300">Get cited in ChatGPT →</Link>
        </div>
      </article>
    </div>
  )
}
