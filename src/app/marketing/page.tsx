import Link from 'next/link'
import { ArrowRight, Radio, Scissors, Bot, BarChart3, Check, Zap, TrendingUp, Globe, Shield } from 'lucide-react'

const ENGINES = ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'Grok', 'Copilot', 'Meta AI', 'DeepSeek', 'Google AIO']

const FEATURES = [
  { icon: Radio, title: 'AI Mention Tracking', desc: 'Monitor your brand across 9 AI engines in real-time. Know exactly when and how AI recommends your product.', color: 'text-violet-400' },
  { icon: BarChart3, title: 'Visibility Scores', desc: 'Get a 0–100 score per engine. See sentiment, position, and citation rates at a glance.', color: 'text-blue-400' },
  { icon: Bot, title: 'AEO Agent', desc: 'Claude claude-sonnet-4-6 analyzes your mentions and generates a content roadmap to boost your AI ranking.', color: 'text-pink-400' },
  { icon: Scissors, title: 'Auto Clips', desc: 'Upload video and let Clouts auto-detect brand moments, clip them, and format for TikTok, Reels, and Shorts.', color: 'text-emerald-400' },
  { icon: TrendingUp, title: 'Prompt Volumes', desc: 'See how many times people ask AI about your category. Prioritize keywords by AI search volume.', color: 'text-yellow-400' },
  { icon: Globe, title: 'Hourly Scans', desc: 'Set it and forget it. Background jobs scan all engines every hour and alert you to changes.', color: 'text-cyan-400' },
]

const PLANS = [
  { name: 'Free', price: '$0', color: 'border-white/[0.08]', features: ['1 brand', '100 mentions/mo', 'Perplexity only', 'AEO agent (mock)'] },
  { name: 'Pro', price: '$79', color: 'border-violet-500/40 bg-violet-500/[0.04]', badge: 'Most Popular', features: ['5 brands', '10K mentions/mo', 'All 5 AI engines', '50 clips/mo', 'Real AEO agent'] },
  { name: 'Team', price: '$299', color: 'border-white/[0.08]', features: ['Unlimited brands', 'Unlimited mentions', 'All engines', 'Unlimited clips', 'Priority support'] },
]

export default function MarketingPage() {
  return (
    <div className="bg-[#08090A] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#08090A]/90 px-6 backdrop-blur-md">
        <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
        <div className="hidden items-center gap-6 md:flex">
          {['Platform', 'Clips', 'Pricing'].map(item => (
            <Link key={item} href={item === 'Pricing' ? '/pricing' : '#'} className="text-sm text-white/50 hover:text-white transition-colors">{item}</Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-white/50 hover:text-white transition-colors">Log in</Link>
          <Link href="/auth/signup"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
            Start free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-24 pb-16 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
          <Zap size={13} /> AI Visibility + Content Clipping
        </div>
        <h1 className="text-6xl font-black tracking-tight leading-[1.05] mb-6">
          Win in AI Search.<br />
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">Clip. Repurpose. Dominate.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-white/50 mb-10 leading-relaxed">
          Monitor your brand across 9 AI engines. Get AI-powered recommendations. Auto-clip your best moments into viral content.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/auth/signup"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 text-base font-bold text-white hover:bg-violet-500 transition-colors">
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="/pricing" className="text-sm text-white/40 hover:text-white transition-colors">
            See pricing →
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/20">No credit card required · Free plan forever</p>
      </section>

      {/* AI engine ticker */}
      <div className="border-y border-white/[0.07] bg-white/[0.02] py-4 overflow-hidden">
        <div className="flex items-center gap-3 px-6 whitespace-nowrap">
          <span className="text-xs font-semibold text-white/30 shrink-0">Your brand, mentioned in →</span>
          {[...ENGINES, ...ENGINES].map((e, i) => (
            <span key={i} className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-xs text-white/60 shrink-0">{e}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black tracking-tight mb-4">Everything you need to own AI search</h2>
          <p className="text-lg text-white/40">From monitoring to optimization to content — all in one platform.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 hover:border-white/[0.12] transition-colors">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] ${color}`}>
                <Icon size={18} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/[0.07] bg-white/[0.01] py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black tracking-tight mb-4">Up and running in minutes</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Add your brand', desc: 'Enter your domain and the keywords your customers search for in AI engines.' },
              { step: '02', title: 'Run first scan', desc: 'Clouts queries all 5 AI engines and scores your visibility in seconds.' },
              { step: '03', title: 'Optimize & grow', desc: 'Use AEO recommendations to create content that gets your brand cited by AI.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/[0.06] text-lg font-black text-violet-400">{step}</div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing snapshot */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black tracking-tight mb-4">Simple pricing</h2>
          <p className="text-white/40">Start free. Scale as you grow.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {PLANS.map(({ name, price, color, badge, features }) => (
            <div key={name} className={`relative rounded-2xl border p-6 ${color}`}>
              {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold">{badge}</span>
                </div>
              )}
              <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">{name}</p>
              <p className="text-4xl font-black text-white mb-1">{price}</p>
              <p className="text-xs text-white/30 mb-5">{price === '$0' ? 'forever' : '/month'}</p>
              <ul className="space-y-2 mb-6">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={13} className="text-emerald-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href={price === '$0' ? '/auth/signup' : '/pricing'}
                className={`block w-full text-center rounded-xl py-2.5 text-sm font-bold transition-colors ${
                  badge ? 'bg-violet-600 text-white hover:bg-violet-500' : 'border border-white/[0.10] text-white hover:border-white/20'
                }`}>
                {price === '$0' ? 'Get started free' : `Get ${name}`}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.07] py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-5xl font-black tracking-tight mb-6">Your competitors are already<br />optimizing for AI search.</h2>
          <p className="text-lg text-white/40 mb-10">Every day you wait, AI engines are learning to recommend someone else.</p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-4 text-base font-bold text-white hover:bg-violet-500 transition-colors">
            Start monitoring for free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] py-12">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <span className="text-lg font-black">Clouts<span className="text-violet-400">.</span></span>
          <div className="flex gap-6 text-sm text-white/30">
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/auth/login" className="hover:text-white">Log in</Link>
            <Link href="/auth/signup" className="hover:text-white">Sign up</Link>
          </div>
          <p className="text-xs text-white/20">© 2026 Clouts. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
