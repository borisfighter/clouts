'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Zap, ArrowRight } from 'lucide-react'
import { PLANS } from '@/lib/stripe'

const plans = [
  { key: 'free',  ...PLANS.free,  highlight: false, badge: null },
  { key: 'pro',   ...PLANS.pro,   highlight: true,  badge: 'Most Popular' },
  { key: 'team',  ...PLANS.team,  highlight: false, badge: 'Best Value' },
]

export default function PricingPage() {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState('')

  const handleCheckout = async (planKey: string) => {
    if (planKey === 'free') return window.location.href = '/auth/signup'
    setLoading(planKey)
    setCheckoutError('')
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, interval }),
      })
      const { url, error } = await res.json()
      if (error) {
        setCheckoutError(
          error.includes('not configured')
            ? 'Payment processing is not configured yet. Email hello@clouts.com to upgrade, or check back soon!'
            : error
        )
        return
      }
      window.location.href = url
    } catch {
      setCheckoutError('Something went wrong starting checkout — please try again')
    } finally {
      setLoading(null)
    }
  }

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.price === 0) return 0
    return interval === 'yearly' ? Math.round(plan.price * 0.8) : plan.price
  }

  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      {/* Nav */}
      <nav className="flex h-16 items-center justify-between border-b border-white/[0.07] px-8">
        <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-white/50 hover:text-white">Log in</Link>
          <Link href="/auth/signup" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500 transition-colors">Get started</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-8 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <Zap size={13} /> Simple, transparent pricing
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4">
            Invest in your<br />
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">AI visibility</span>
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Start free. Scale as your brand grows. Cancel anytime.
          </p>

          {/* Interval toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1">
            <button onClick={() => setInterval('monthly')}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${interval === 'monthly' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
              Monthly
            </button>
            <button onClick={() => setInterval('yearly')}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all ${interval === 'yearly' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
              Yearly <span className="ml-1.5 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">–20%</span>
            </button>
          </div>
        </div>

        {checkoutError && (
          <div className="mx-auto mb-6 max-w-xl rounded-xl border border-yellow-400/20 bg-yellow-400/[0.08] px-4 py-3 text-sm text-yellow-200 text-center">
            {checkoutError}
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.key}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all ${
                plan.highlight
                  ? 'border-violet-500/40 bg-violet-500/[0.06] shadow-lg shadow-violet-500/10'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14]'
              }`}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">{plan.badge}</span>
                </div>
              )}

              <div className="mb-5">
                <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">{plan.name}</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-white">${getPrice(plan)}</span>
                  {plan.price > 0 && <span className="text-white/30 pb-1.5">/{interval === 'yearly' ? 'mo' : 'mo'}</span>}
                </div>
                {plan.price > 0 && interval === 'yearly' && (
                  <p className="text-xs text-emerald-400 mt-1">Billed annually (${getPrice(plan) * 12}/yr)</p>
                )}
                {plan.price === 0 && <p className="text-xs text-white/30 mt-1">Forever free</p>}
              </div>

              <ul className="flex-1 space-y-3 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.key)}
                disabled={loading === plan.key}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                  plan.highlight
                    ? 'bg-violet-600 text-white hover:bg-violet-500'
                    : plan.key === 'free'
                    ? 'border border-white/[0.10] text-white hover:border-white/20'
                    : 'border border-white/[0.10] text-white hover:border-white/20'
                } disabled:opacity-60`}>
                {loading === plan.key ? 'Loading...' : plan.key === 'free' ? 'Get started free' : `Get ${plan.name}`}
                {plan.key !== 'free' && <ArrowRight size={14} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor comparison */}
      <section className="border-t border-white/[0.07] bg-white/[0.01] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3">How Clouts compares</h2>
            <p className="text-white/40">Same features. Fraction of the price.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="text-left px-4 py-3 text-xs font-bold text-white/30 uppercase tracking-widest w-52">Feature</th>
                  {[
                    { name: 'Clouts Pro', price: '$79/mo', highlight: true },
                    { name: 'Profound', price: '$499/mo', highlight: false },
                    { name: 'Visiblie', price: '$149/mo', highlight: false },
                    { name: 'SE Visible', price: '$355/mo', highlight: false },
                  ].map(({ name, price, highlight }) => (
                    <th key={name} className={`px-4 py-3 text-center ${highlight ? 'bg-violet-500/[0.08] rounded-t-xl' : ''}`}>
                      <p className={`text-sm font-bold ${highlight ? 'text-white' : 'text-white/50'}`}>{name}</p>
                      <p className={`text-xs ${highlight ? 'text-violet-400' : 'text-white/30'}`}>{price}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI engines monitored', '5', '10', '4-8', '4'],
                  ['Mention rate tracking', '✓', '✓', '✓', '✓'],
                  ['Sentiment analysis', '✓', '✓', '✓', '✓'],
                  ['Competitor tracking', '✓', '✓', '✓', '✓'],
                  ['Hallucination detection', '✓', '✓', '✓', '—'],
                  ['AEO agent (AI recommendations)', '✓', '—', '—', '—'],
                  ['Auto video clipping', '✓', '—', '—', '—'],
                  ['Public share reports', '✓', '—', '—', '—'],
                  ['CSV export', '✓', '✓', '—', '—'],
                  ['Scan history', '✓', '✓', '✓', '✓'],
                  ['5 brands', '✓', '1 (Basic)', '3', '1'],
                ].map(([feature, clouts, profound, visiblie, sevisible]) => (
                  <tr key={feature as string} className="border-b border-white/[0.04] hover:bg-white/[0.01]">
                    <td className="px-4 py-3 text-sm text-white/60">{feature}</td>
                    {[
                      { val: clouts, highlight: true },
                      { val: profound, highlight: false },
                      { val: visiblie, highlight: false },
                      { val: sevisible, highlight: false },
                    ].map(({ val, highlight }, i) => (
                      <td key={i} className={`px-4 py-3 text-center text-sm ${highlight ? 'bg-violet-500/[0.04] font-semibold' : ''}`}>
                        <span className={val === '✓' ? 'text-emerald-400' : val === '—' ? 'text-white/15' : highlight ? 'text-violet-300' : 'text-white/50'}>
                          {val}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-white/20 mt-4">Competitor pricing as of June 2026. Clouts features based on Pro plan.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/[0.07] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-black text-white text-center mb-10">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'How does Clouts monitor AI engines?', a: 'We query ChatGPT, Perplexity, Claude, Gemini, and Grok with your tracked keywords and analyze every response to see if — and how — your brand is mentioned. You get mention rate, sentiment, position, and score for each engine.' },
              { q: 'Is there a free trial?', a: 'Yes — the Free plan is free forever (no credit card required) with 1 brand, 100 mentions/mo, and Perplexity monitoring. Upgrade to Pro for all 5 engines, 10,000 mentions, and 5 brands.' },
              { q: 'What is hallucination detection?', a: 'Our AEO agent analyzes AI response text to flag when an engine makes potentially inaccurate claims about your brand — wrong pricing, fabricated features, or misleading comparisons. You are alerted so you can create corrective content.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime from the Billing section in Settings. You keep access until the end of your billing period.' },
              { q: 'What is the AEO Agent?', a: 'The AEO (Answer Engine Optimization) Agent is powered by Claude claude-sonnet-4-6. It analyzes your scan data and generates a prioritized content roadmap — FAQ pages, comparison articles, and guides — specifically designed to get your brand cited more often in AI responses.' },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <p className="text-sm font-bold text-white mb-2">{q}</p>
                <p className="text-sm text-white/50 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
