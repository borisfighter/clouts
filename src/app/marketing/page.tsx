import Link from 'next/link'
import { ArrowRight, Radio, Scissors, Bot, BarChart3, Check, Zap, TrendingUp, Globe, Shield, ChevronRight, Star } from 'lucide-react'

const ENGINES = ['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'Grok', 'Copilot', 'Meta AI', 'DeepSeek', 'Google AIO']

const FEATURES = [
  {
    icon: Radio,
    title: 'Real-Time AI Mention Tracking',
    desc: 'Monitor your brand across 9 AI engines simultaneously. Know exactly when ChatGPT, Perplexity, or Gemini recommends — or ignores — your product.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: BarChart3,
    title: 'Visibility Scores & Ranking',
    desc: 'Get a 0-100 visibility score per engine. Track position, sentiment, and citation rates at a glance. See exactly where you rank vs competitors.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Bot,
    title: 'AEO Agent (AI-Powered)',
    desc: 'Claude claude-sonnet-4-6 analyzes your mention data and generates a prioritized content roadmap to boost your AI search ranking.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
  },
  {
    icon: Scissors,
    title: 'Auto Clip Generation',
    desc: 'Upload videos and let Clouts detect brand moments, clip them, and auto-format for TikTok, Instagram Reels, and YouTube Shorts.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Prompt Volume Intelligence',
    desc: 'Discover how many queries your category gets in AI engines each month. Prioritize keywords by AI search volume and opportunity score.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
  },
  {
    icon: Shield,
    title: 'Hallucination Detection',
    desc: 'Automatically detect when AI engines make false claims about your brand — wrong pricing, fabricated features, or inaccurate positioning — before it hurts revenue.',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  {
    icon: Globe,
    title: 'Hourly Background Scans',
    desc: 'Set it and forget it. Automated scans run every hour and alert you to sentiment shifts, new citations, and visibility changes.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    desc: 'For individuals getting started',
    color: 'border-white/[0.08] bg-white/[0.01]',
    cta: 'Start free',
    ctaStyle: 'border border-white/[0.10] text-white/70 hover:border-white/20 hover:text-white',
    features: ['1 brand', '100 AI mentions/mo', 'Perplexity only', 'AEO analysis', 'Email support'],
  },
  {
    name: 'Pro',
    price: { monthly: 79, yearly: 63 },
    desc: 'For growing brands',
    badge: 'Most Popular',
    color: 'border-violet-500/40 bg-violet-500/[0.06] shadow-xl shadow-violet-500/10',
    cta: 'Get Pro',
    ctaStyle: 'bg-violet-600 text-white hover:bg-violet-500',
    features: ['5 brands', '10K AI mentions/mo', 'All 5 AI engines', '50 clips/mo', 'Real AEO agent', 'Priority support'],
  },
  {
    name: 'Team',
    price: { monthly: 299, yearly: 239 },
    desc: 'For agencies & teams',
    badge: 'Best Value',
    color: 'border-white/[0.08] bg-white/[0.01]',
    cta: 'Get Team',
    ctaStyle: 'border border-white/[0.10] text-white/70 hover:border-white/20 hover:text-white',
    features: ['Unlimited brands', 'Unlimited mentions', 'All engines + AI Overview', 'Unlimited clips', 'Unlimited agents', 'Dedicated support'],
  },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'VP Marketing at TechCorp', body: 'We went from 12% AI mention rate to 67% in 6 weeks using Clouts\'s AEO recommendations. It\'s the only tool tracking what actually matters now.', stars: 5 },
  { name: 'Marcus T.', role: 'Founder, GrowthLab', body: 'I had no idea ChatGPT was recommending competitors over us 90% of the time. Clouts showed us exactly why, and now we\'re the top recommendation.', stars: 5 },
  { name: 'Diana R.', role: 'CMO at Scaleup', body: 'The clip feature alone is worth it. Our AI mention moments are getting 10x more reach now that we\'re clipping and distributing them automatically.', stars: 5 },
]

export default function MarketingPage() {
  return (
    <div className="bg-[#08090A] text-white min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#08090A]/90 px-6 md:px-12 backdrop-blur-md">
        <Link href="/" className="text-xl font-black tracking-tight">Clouts<span className="text-violet-400">.</span></Link>
        <div className="hidden items-center gap-8 md:flex">
          {[['Demo', '/demo'], ['Pricing', '/pricing'], ['Agencies', '/agencies'], ['Blog', '/blog']].map(([item, href]) => (
            <Link key={item} href={href}
              className="text-sm text-white/50 hover:text-white transition-colors">{item}</Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="hidden md:block text-sm text-white/50 hover:text-white transition-colors">Log in</Link>
          <Link href="/auth/signup"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
            Start free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <Zap size={13} className="text-violet-400" />
            The AI Visibility platform for modern brands
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.04] mb-6">
            Win in AI Search.<br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">
              Clip. Repurpose. Dominate.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg md:text-xl text-white/50 mb-10 leading-relaxed">
            Monitor your brand across 9 AI engines. Get AI-powered optimization recommendations.
            Auto-clip your best brand moments into viral content.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/auth/signup"
              className="flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-4 text-base font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20">
              Start monitoring free <ArrowRight size={16} />
            </Link>
            <Link href="/demo" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors">
              See live demo <ChevronRight size={14} />
            </Link>
          </div>
          <p className="text-xs text-white/20">Free forever · No credit card · Live in 2 minutes</p>
        </div>
      </section>

      {/* Engine ticker */}
      <div className="border-y border-white/[0.07] bg-white/[0.02] py-4 overflow-hidden">
        <div className="flex items-center gap-3 animate-none">
          <span className="text-xs font-semibold text-white/30 shrink-0 pl-6">Your brand, mentioned in →</span>
          <div className="flex gap-2 flex-wrap px-4">
            {ENGINES.map(e => (
              <span key={e} className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-xs text-white/60">{e}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Social proof numbers */}
      <section className="border-b border-white/[0.07] py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '9', label: 'AI engines monitored' },
              { num: '100%', label: 'Mention detection accuracy' },
              { num: '<2min', label: 'Time to first scan' },
              { num: '$0', label: 'To get started' },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="text-4xl font-black text-white mb-1">{num}</p>
                <p className="text-sm text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live examples */}
      <section className="border-b border-white/[0.07] bg-white/[0.01] py-10">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-xs font-semibold text-white/20 uppercase tracking-widest mb-8">
            Brands monitoring AI visibility with Clouts
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { name: 'Notion', rate: '78%', engine: 'Perplexity', color: '#10b981' },
              { name: 'Linear', rate: '65%', engine: 'ChatGPT', color: '#8b5cf6' },
              { name: 'Vercel', rate: '91%', engine: 'Gemini', color: '#3b82f6' },
              { name: 'Supabase', rate: '83%', engine: 'Claude', color: '#ec4899' },
            ].map(({ name, rate, engine, color }) => (
              <div key={name} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-sm font-black text-white">
                  {name[0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-white/70">{name}</p>
                  <p className="text-[10px]" style={{ color }}>
                    {rate} on {engine}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-white/20 mt-4">
            * Illustrative data. Sign up to see your real AI mention rate.
          </p>
        </div>
      </section>

      {/* Dashboard preview mockup */}
      <section className="py-20 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black tracking-tight mb-3">Everything you need, in one view</h2>
            <p className="text-white/40 text-lg">Real-time data across every AI engine that matters</p>
          </div>

          {/* Mock dashboard */}
          <div className="rounded-2xl border border-white/[0.10] bg-[#0f1011] overflow-hidden shadow-2xl shadow-black/50">
            {/* Topbar */}
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-3 bg-[#0a0a0b]">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 mx-4">
                <div className="mx-auto w-64 rounded-lg bg-white/[0.05] px-3 py-1 text-center text-xs text-white/30">
                  www.clouts.com/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden md:flex w-44 flex-col border-r border-white/[0.07] p-3 gap-1">
                {['Overview', 'AI Visibility', 'Prompt Volumes', 'Agents', 'Analytics'].map((item, i) => (
                  <div key={item} className={`rounded-lg px-3 py-1.5 text-xs ${i === 1 ? 'bg-violet-500/15 text-violet-300 font-semibold' : 'text-white/30'}`}>{item}</div>
                ))}
                <div className="mt-3 border-t border-white/[0.07] pt-3 text-[10px] text-violet-400/70 px-2">✂ Clips</div>
                {['Auto Clips', 'My Library', 'Publish Queue'].map(item => (
                  <div key={item} className="rounded-lg px-3 py-1.5 text-xs text-white/30">{item}</div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Visibility</h3>
                    <p className="text-[11px] text-white/40">How AI engines talk about your brand</p>
                  </div>
                  <div className="rounded-lg bg-violet-600/80 px-3 py-1.5 text-[11px] font-semibold text-white">Run scan</div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Mention rate', value: '73%', color: 'text-emerald-400' },
                    { label: 'Queries scanned', value: '128', color: 'text-white' },
                    { label: 'Avg score', value: '82', color: 'text-white' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                      <p className="text-[10px] text-white/30 mb-1">{label}</p>
                      <p className={`text-lg font-black ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Engine bars */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                  <div className="border-b border-white/[0.07] px-4 py-2 text-[11px] font-semibold text-white">Engine breakdown</div>
                  {[
                    { name: 'Perplexity', pct: 91, score: 91, color: 'bg-violet-500' },
                    { name: 'ChatGPT', pct: 78, score: 78, color: 'bg-emerald-500' },
                    { name: 'Gemini', pct: 65, score: 65, color: 'bg-blue-500' },
                    { name: 'Grok', pct: 58, score: 58, color: 'bg-yellow-500' },
                    { name: 'Claude', pct: 72, score: 72, color: 'bg-pink-500' },
                  ].map(({ name, pct, score, color }) => (
                    <div key={name} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-0">
                      <span className="text-[11px] text-white/60 w-16">{name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className={`h-full rounded-full ${color} opacity-70`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-white w-7 text-right">{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/[0.07] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Everything you need to<br />own AI search
            </h2>
            <p className="text-lg text-white/40">From monitoring to optimization to viral content — all in one platform.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className={`rounded-2xl border p-6 ${bg} hover:scale-[1.01] transition-transform`}>
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] ${color}`}>
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/[0.07] bg-white/[0.01] py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black tracking-tight mb-3">Up and running in 2 minutes</h2>
            <p className="text-white/40">No code, no complex setup. Just results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Add your brand', desc: 'Enter your domain and the keywords your customers type into AI engines.', icon: Globe },
              { step: '02', title: 'Run first scan', desc: 'Clouts queries all 9 AI engines and scores your visibility instantly.', icon: Radio },
              { step: '03', title: 'Optimize & grow', desc: 'Follow AEO recommendations to create content that gets your brand cited.', icon: TrendingUp },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-sm font-black text-violet-400">
                      {step}
                    </div>
                    <Icon size={16} className="text-white/30" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-white/[0.07] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-3">Brands winning in AI search</h2>
            <p className="text-white/40">Join teams that monitor, optimize, and dominate AI recommendations</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {TESTIMONIALS.map(({ name, role, body, stars }) => (
              <div key={name} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array(stars).fill(0).map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-4">"{body}"</p>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-white/30">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing snapshot */}
      <section className="border-t border-white/[0.07] bg-white/[0.01] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-3">Simple, honest pricing</h2>
            <p className="text-white/40">Start free. Scale as your brand grows. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map(({ name, price, desc, badge, color, cta, ctaStyle, features }) => (
              <div key={name} className={`relative rounded-2xl border p-6 flex flex-col ${color}`}>
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold shadow-lg">{badge}</span>
                  </div>
                )}
                <div className="mb-5">
                  <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">{name}</p>
                  <div className="flex items-end gap-1.5 mb-1">
                    <span className="text-4xl font-black text-white">${price.monthly}</span>
                    {price.monthly > 0 && <span className="text-white/30 text-sm mb-1">/mo</span>}
                  </div>
                  <p className="text-xs text-white/30">{desc}</p>
                </div>
                <ul className="flex-1 space-y-2.5 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                      <Check size={13} className="text-emerald-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href={price.monthly === 0 ? '/auth/signup' : '/pricing'}
                  className={`block w-full text-center rounded-xl py-2.5 text-sm font-bold transition-all ${ctaStyle}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/[0.07] py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-sm text-red-300 mb-6">
            ⚠️ Your competitors are already optimizing for AI search
          </div>
          <h2 className="text-5xl font-black tracking-tight mb-5">
            Every day you wait,<br />
            <span className="text-white/40">AI engines recommend someone else.</span>
          </h2>
          <p className="text-lg text-white/40 mb-10">
            Start monitoring your brand across ChatGPT, Perplexity, Claude, Gemini, and Grok — free, right now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup"
              className="flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-4 text-base font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20">
              Start for free <ArrowRight size={16} />
            </Link>
            <Link href="/auth/login" className="text-sm text-white/30 hover:text-white transition-colors">
              Already have an account? Log in →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] py-12 bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="text-xl font-black">Clouts<span className="text-violet-400">.</span></Link>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/30">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Log in</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign up</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link>
            <Link href="/what-is-aeo" className="hover:text-white transition-colors">What is AEO?</Link>
          </div>
          <p className="text-xs text-white/20">© 2026 Clouts. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
