import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — AI Visibility & AEO Insights | Clouts',
  description: 'Practical guides on Answer Engine Optimization, AI brand monitoring, and getting your brand cited in ChatGPT, Perplexity, and Gemini.',
}

const POSTS = [
  {
    slug: '/what-is-aeo',
    title: 'What is AEO (Answer Engine Optimization)?',
    excerpt: 'Answer Engine Optimization is the new SEO. Learn how to rank in ChatGPT, Perplexity, Gemini, and Grok — and why it matters more than traditional search.',
    date: 'June 2026',
    readTime: '8 min read',
    tag: 'Guide',
    tagColor: 'bg-violet-500/20 text-violet-300',
  },
  {
    slug: '/blog/ai-visibility-tools-compared',
    title: 'AI Visibility Tools Compared: Clouts vs Profound vs Visiblie',
    excerpt: 'An honest comparison of the top AI visibility monitoring platforms in 2026 — features, pricing, and what actually matters for growing brands.',
    date: 'June 2026',
    readTime: '6 min read',
    tag: 'Comparison',
    tagColor: 'bg-blue-500/20 text-blue-300',
  },
  {
    slug: '/blog/how-to-get-cited-in-chatgpt',
    title: 'How to Get Your Brand Cited in ChatGPT Answers',
    excerpt: 'A step-by-step guide to creating content that ChatGPT, Perplexity, and other AI engines will cite when answering questions in your category.',
    date: 'June 2026',
    readTime: '10 min read',
    tag: 'Tutorial',
    tagColor: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    slug: '/blog/ai-hallucination-detection',
    title: 'AI Hallucination Detection: Protecting Your Brand from AI Misinformation',
    excerpt: 'AI engines sometimes fabricate facts about your brand — wrong pricing, fake features, inaccurate comparisons. Learn how to detect and fix it before it costs you customers.',
    date: 'June 2026',
    readTime: '5 min read',
    tag: 'Metrics',
    tagColor: 'bg-yellow-500/20 text-yellow-300',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      <nav className="flex h-16 items-center justify-between border-b border-white/[0.07] px-8">
        <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
        <div className="flex items-center gap-4">
          <Link href="/what-is-aeo" className="text-sm text-white/50 hover:text-white">What is AEO?</Link>
          <Link href="/pricing" className="text-sm text-white/50 hover:text-white">Pricing</Link>
          <Link href="/auth/signup" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-3">Blog</h1>
          <p className="text-white/40">Guides on AI search, AEO, and brand visibility.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {POSTS.map((post, i) => (
            <Link key={i} href={post.slug}
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 hover:border-white/[0.14] hover:bg-white/[0.04] transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${post.tagColor}`}>{post.tag}</span>
                <span className="text-[10px] text-white/25">{post.date} · {post.readTime}</span>
              </div>
              <h2 className="text-sm font-bold text-white mb-2 group-hover:text-violet-300 transition-colors leading-snug">{post.title}</h2>
              <p className="text-xs text-white/40 leading-relaxed line-clamp-3">{post.excerpt}</p>
              <div className="mt-4 text-[11px] font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">Read article →</div>
            </Link>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] p-8 text-center">
          <p className="text-base font-black text-white mb-2">Get AI visibility insights in your inbox</p>
          <p className="text-sm text-white/40 mb-6">Weekly tips on AEO, AI search trends, and how to rank higher in AI-generated responses.</p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-colors">
            Start free — get weekly reports →
          </Link>
        </div>
      </div>

      <footer className="border-t border-white/[0.07] py-8 mt-8">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
          <div className="flex gap-6 text-sm text-white/30">
            <Link href="/what-is-aeo" className="hover:text-white">What is AEO?</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
