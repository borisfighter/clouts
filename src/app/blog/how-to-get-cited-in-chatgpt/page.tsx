import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Get Your Brand Cited in ChatGPT Answers | Clouts Blog',
  description: 'A step-by-step guide to creating content that ChatGPT, Perplexity, and other AI engines will cite when answering questions in your category.',
}

export default function HowToGetCitedPage() {
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
            <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">Tutorial</span>
            <span className="text-xs text-white/25">June 2026 · 10 min read</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-[1.1]">
            How to Get Your Brand Cited in ChatGPT Answers
          </h1>
          <p className="text-xl text-white/50 leading-relaxed">
            AI engines are picky about what they cite. Here's exactly how to structure your content so ChatGPT, Perplexity, and Gemini recommend your brand.
          </p>
        </header>

        <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-2xl font-black text-white mb-4">Why AI engines ignore most brands</h2>
            <p className="mb-4">ChatGPT and Perplexity are trained on billions of web pages — but they don't cite everything equally. They tend to cite content that is:</p>
            <ul className="space-y-2 ml-4">
              {['<strong className="text-white">Authoritative</strong> — from sites with domain authority and quality backlinks', '<strong className="text-white">Structured</strong> — organized in clear Q&A, comparison, or how-to format', '<strong className="text-white">Entity-rich</strong> — explicitly names your brand, describes what it does, and links to your domain', '<strong className="text-white">Comprehensive</strong> — thoroughly answers the question, not just mentions it'].map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-violet-400 mt-1 shrink-0">→</span>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
            <p className="mt-4">If your brand only appears in your own marketing copy, AI engines will mostly ignore you. You need third-party mentions, structured content, and semantic coverage of your category.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Step 1: Track your current mention rate</h2>
            <p className="mb-4">Before optimizing, you need a baseline. Use <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300">Clouts</Link> to run your first AI visibility scan. This queries ChatGPT, Perplexity, Gemini, Grok, and Claude with your tracked keywords and measures how often your brand appears.</p>
            <div className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.06] p-5">
              <p className="text-sm font-semibold text-violet-300 mb-2">Benchmark mention rates (2026)</p>
              <div className="space-y-2 text-sm">
                {[['Below 10%', 'AI engines don\'t know you exist. Start with fundamentals.', 'text-red-400'],
                  ['10–30%', 'You\'re on the radar but not consistently recommended.', 'text-yellow-400'],
                  ['30–60%', 'Solid presence. Optimize for consistency across engines.', 'text-blue-400'],
                  ['60%+', 'Strong AI visibility. Focus on sentiment and share of voice.', 'text-emerald-400']].map(([range, desc, color]) => (
                  <div key={range as string} className="flex gap-3">
                    <span className={`font-bold w-20 shrink-0 ${color}`}>{range}</span>
                    <span className="text-white/50">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Step 2: Build your AEO content foundation</h2>
            <p className="mb-6">These four content types drive the most AI citations. Prioritize them in order:</p>
            <div className="space-y-4">
              {[
                {
                  n: '1',
                  title: 'FAQ page targeting your exact keywords',
                  body: 'Create a dedicated /faq page that directly answers the questions your customers ask. Use H2 headers for each question, then a 100-200 word answer. Include your brand name, key features, and pricing in the answers.',
                  tip: 'Target queries like "best [category] tool", "how does [category] work", "[your brand] review"',
                },
                {
                  n: '2',
                  title: 'Brand overview / "What is X?" page',
                  body: 'Create a Wikipedia-style overview of your product. Include: what it is (1-2 sentences), who it\'s for, core features, how it works, and pricing. Link to it from your homepage. AI engines use this as the authoritative source for brand facts.',
                  tip: 'URL: /about or /what-is-[brand-name] — keep it factual, not salesy',
                },
                {
                  n: '3',
                  title: 'Comparison pages ("X vs Y")',
                  body: 'Write honest "Brand vs Competitor" comparison pages. These are goldmines for AI citation because they\'re comprehensive and directly answer the questions buyers ask before purchasing. Include feature tables, pricing, pros and cons.',
                  tip: 'Target: "[your brand] vs [competitor]", "best alternative to [competitor]"',
                },
                {
                  n: '4',
                  title: 'Category how-to guides',
                  body: 'Create comprehensive guides that answer the category-level questions your customers have. Mention your product naturally within the guide as the recommended solution. These help AI engines associate your brand with the problem you solve.',
                  tip: 'Long-form (2000+ words) performs better for AI citations than short-form',
                },
              ].map(({ n, title, body, tip }) => (
                <div key={n} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-black text-violet-400">{n}</span>
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                  </div>
                  <p className="text-sm text-white/50 mb-3">{body}</p>
                  <div className="rounded-lg bg-white/[0.04] border border-white/[0.07] px-3 py-2">
                    <p className="text-xs text-violet-400/80"><span className="text-white/30">Target: </span>{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Step 3: Add structured data markup</h2>
            <p className="mb-4">JSON-LD schema is one of the most reliable ways to improve AI citation rates. Add these schemas to your site:</p>
            <div className="rounded-xl border border-white/[0.07] bg-black/40 p-4 font-mono text-xs text-white/60 overflow-x-auto">
              <pre>{`{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Brand",
  "url": "https://yourdomain.com",
  "description": "What you do in 1-2 sentences",
  "foundingDate": "2024",
  "sameAs": [
    "https://twitter.com/yourbrand",
    "https://linkedin.com/company/yourbrand"
  ]
}`}</pre>
            </div>
            <p className="mt-3 text-sm">Also add <code className="bg-white/[0.08] px-1.5 py-0.5 rounded text-xs">FAQPage</code>, <code className="bg-white/[0.08] px-1.5 py-0.5 rounded text-xs">Product</code>, and <code className="bg-white/[0.08] px-1.5 py-0.5 rounded text-xs">SoftwareApplication</code> schemas where relevant.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Step 4: Build third-party citations</h2>
            <p className="mb-4">AI engines don't just read your own site — they synthesize information from across the web. High-priority sources for AI training data:</p>
            <ul className="space-y-3 ml-4">
              {['Product Hunt launch (gets you listed on a highly-cited aggregator)',
                'G2 / Capterra / Trustpilot profile with detailed reviews',
                'Wikipedia article (if you qualify — requires notability)',
                'Guest posts on authoritative industry blogs',
                'Reddit and Hacker News mentions in relevant threads',
                'Press releases on PR Newswire or similar'].map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Step 5: Monitor and iterate</h2>
            <p className="mb-4">AEO is not a one-time project. AI engines update their training data, competitors publish new content, and query patterns shift. Run weekly scans using Clouts to track your mention rate over time.</p>
            <p>What to watch:</p>
            <ul className="space-y-2 mt-2 ml-4">
              {['Mention rate trend (week-over-week)',
                'Which engines mention you vs ignore you',
                'Sentiment of mentions (positive/neutral/negative)',
                'Competitor mention rate vs yours (share of voice)',
                'Which queries trigger mentions vs misses'].map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-violet-400 mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-8 text-center">
          <p className="text-lg font-black text-white mb-2">Start tracking your AI visibility today</p>
          <p className="text-sm text-white/40 mb-6">Clouts monitors your brand across ChatGPT, Perplexity, Claude, Gemini, and Grok — and runs the AEO agent to prioritize exactly what content to create next.</p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
            Start free — no credit card →
          </Link>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.07] pt-6">
          <Link href="/blog" className="text-sm text-white/40 hover:text-white transition-colors">← Back to blog</Link>
          <Link href="/what-is-aeo" className="text-sm text-violet-400 hover:text-violet-300">What is AEO? →</Link>
        </div>
      </article>
    </div>
  )
}
