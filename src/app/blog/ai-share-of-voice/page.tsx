import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Share of Voice: What It Is and How to Measure It | Clouts Blog',
  description: 'AI share of voice measures how often your brand appears vs competitors in AI-generated responses. Learn how to calculate it, benchmark it, and improve it.',
}

export default function AIShareOfVoicePage() {
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
            <span className="rounded-full bg-yellow-500/20 text-yellow-300 px-2.5 py-0.5 text-[10px] font-bold">Metrics</span>
            <span className="text-xs text-white/25">June 2026 · 5 min read</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-[1.1]">
            AI Share of Voice: What It Is and How to Measure It
          </h1>
          <p className="text-xl text-white/50 leading-relaxed">
            Traditional share of voice tracks ad spend. AI share of voice tracks something more valuable — who AI engines recommend when buyers are ready to decide.
          </p>
        </header>

        <div className="space-y-8 text-white/70 leading-relaxed text-[15px]">
          <section>
            <h2 className="text-2xl font-black text-white mb-4">What is AI share of voice?</h2>
            <p className="mb-4">In traditional marketing, <em>share of voice</em> measures how much of the total advertising space in your category your brand occupies vs competitors. It's a proxy for brand presence and competitive position.</p>
            <p className="mb-4"><strong className="text-white">AI share of voice</strong> is the same concept applied to AI-generated responses. It measures: of all the times an AI engine recommends or mentions brands in your category, what percentage of those mentions go to you vs competitors?</p>
            <div className="rounded-2xl border border-violet-500/15 bg-violet-500/[0.06] p-5">
              <p className="text-sm font-semibold text-violet-300 mb-2">Formula</p>
              <p className="font-mono text-sm text-white/80">
                AI SoV = (Your brand mentions) / (Your mentions + All competitor mentions) × 100
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">Why AI share of voice matters more than mention rate</h2>
            <p className="mb-4">Mention rate tells you how often you appear. AI share of voice tells you how you compare to the alternatives buyers are actually considering.</p>
            <p className="mb-4">A 60% mention rate sounds great — until you discover your top competitor has an 85% mention rate and captures 70% of AI share of voice in your category. That's the gap that's actually costing you revenue.</p>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-3">
              <p className="text-sm font-semibold text-white">Example scenario</p>
              <div className="text-sm text-white/60 space-y-1">
                <p>Category query: "best CRM for startups"</p>
                <p>Your brand: mentioned 60 times in 100 queries (60% rate)</p>
                <p>Competitor A: mentioned 80 times (80% rate)</p>
                <p>Competitor B: mentioned 40 times (40% rate)</p>
                <hr className="border-white/[0.08] my-2" />
                <p className="text-white/80 font-medium">Your AI share of voice: 60/(60+80+40) = <span className="text-violet-400">33%</span></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">How to measure AI share of voice</h2>
            <div className="space-y-4">
              {[
                { n: '1', title: 'Define your competitor set', desc: 'List 3-5 direct competitors you want to track. Focus on the brands buyers actually compare you to, not every player in your space.' },
                { n: '2', title: 'Set shared tracking keywords', desc: 'Use the same keywords across your brand and competitors. These should be the category-level queries buyers actually search: "best [category] tool", "top [category] software", etc.' },
                { n: '3', title: 'Run comparative scans', desc: 'Query AI engines with your keywords and check both how often your brand appears AND how often each competitor appears in the same responses.' },
                { n: '4', title: 'Calculate the ratio', desc: 'Divide your mentions by the total mentions across your competitive set. Track this weekly to see if you\'re gaining or losing share.' },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-black text-violet-400">{n}</span>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{title}</p>
                    <p className="text-sm text-white/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">What's a good AI share of voice?</h2>
            <div className="space-y-2">
              {[
                ['70%+', 'Category leader — AI strongly prefers you over alternatives', 'text-emerald-400'],
                ['40–70%', 'Strong contender — mentioned alongside 1-2 competitors', 'text-blue-400'],
                ['20–40%', 'In the conversation but losing ground to leaders', 'text-yellow-400'],
                ['Under 20%', 'AI primarily recommends competitors — urgent optimization needed', 'text-red-400'],
              ].map(([range, desc, color]) => (
                <div key={range as string} className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                  <span className={`font-black text-lg w-20 shrink-0 ${color}`}>{range}</span>
                  <p className="text-sm text-white/60">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">How to improve your AI share of voice</h2>
            <p className="mb-4">Improving AI share of voice is fundamentally about making AI engines prefer your brand over competitors. The levers:</p>
            <ul className="space-y-3 ml-4">
              {['Create more comprehensive content than competitors — depth wins over breadth',
                'Target comparison queries explicitly ("your brand vs competitor")',
                'Build domain authority through quality backlinks from industry publications',
                'Get your brand mentioned in third-party content that AI engines trust (G2, Product Hunt, TechCrunch)',
                'Run the AEO agent to get a personalized roadmap based on your current share of voice',
              ].map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-violet-400 mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-8 text-center">
          <p className="text-lg font-black text-white mb-2">Track your AI share of voice</p>
          <p className="text-sm text-white/40 mb-6">Clouts shows your share of voice vs competitors in real-time — free to start.</p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
            Start monitoring free →
          </Link>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.07] pt-6">
          <Link href="/blog" className="text-sm text-white/40 hover:text-white transition-colors">← Blog</Link>
          <Link href="/blog/how-to-get-cited-in-chatgpt" className="text-sm text-violet-400 hover:text-violet-300">How to get cited in ChatGPT →</Link>
        </div>
      </article>
    </div>
  )
}
