'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Zap, ArrowRight, Mail } from 'lucide-react'

const TIERS = [
  {
    key: 'starter',
    name: 'Starter',
    price: '$99',
    period: '/mo',
    tagline: 'Track one AI engine and start building visibility',
    highlight: false,
    badge: null,
    features: [
      'ChatGPT monitoring',
      'Up to 50 tracked prompts',
      '1 seat',
      'Basic visibility scoring',
      'Email support',
    ],
  },
  {
    key: 'growth',
    name: 'Growth',
    price: '$399',
    period: '/mo',
    tagline: 'Multi-engine coverage for teams actively optimizing',
    highlight: true,
    badge: 'Most popular',
    features: [
      'ChatGPT, Perplexity, Google AI Overviews',
      'Up to 250 tracked prompts',
      '5 seats',
      'Sentiment + competitor tracking',
      'AEO agent — 6 content pieces/mo',
      'Priority support',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'Full platform coverage with security and scale built in',
    highlight: false,
    badge: null,
    features: [
      'All AI engines (ChatGPT, Perplexity, Gemini, Claude, Grok + more)',
      'Unlimited tracked prompts',
      'Unlimited seats',
      'Prompt Volumes — real query-volume data',
      'Unlimited AEO agent runs',
      'SSO / SAML + SOC 2',
      'Dedicated account team',
    ],
  },
]

export default function PricingPage() {
  const [requestSentFor, setRequestSentFor] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#08090A] text-white">
      {/* Nav */}
      <nav className="flex h-16 items-center justify-between border-b border-white/[0.07] px-8">
        <Link href="/" className="text-lg font-black">Clouts<span className="text-violet-400">.</span></Link>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm text-white/50 hover:text-white">Log in</Link>
          <a href="#demo" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-500 transition-colors">Get a demo</a>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-8 py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <Zap size={13} /> Built for brands with a global footprint
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4">
            Pricing that scales<br />
            <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">with your AI visibility</span>
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Every plan starts with a conversation, not a credit card. We'll scope coverage, prompt volume, and seats to your team.
          </p>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div key={tier.key}
              id={tier.highlight ? 'demo' : undefined}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all ${
                tier.highlight
                  ? 'border-violet-500/40 bg-violet-500/[0.06] shadow-lg shadow-violet-500/10'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14]'
              }`}>
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">{tier.badge}</span>
                </div>
              )}

              <div className="mb-2">
                <p className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">{tier.name}</p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-white">{tier.price}</span>
                  {tier.period && <span className="text-white/30 pb-1.5">{tier.period}</span>}
                </div>
                <p className="text-xs text-white/30 mt-2">{tier.tagline}</p>
              </div>

              <ul className="flex-1 space-y-3 my-7">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setRequestSentFor(tier.key)}
                disabled={requestSentFor === tier.key}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                  tier.highlight
                    ? 'bg-violet-600 text-white hover:bg-violet-500'
                    : 'border border-white/[0.10] text-white hover:border-white/20'
                } disabled:opacity-70`}>
                {requestSentFor === tier.key ? "We'll be in touch" : 'Get a demo'}
                {requestSentFor !== tier.key && <ArrowRight size={14} />}
              </button>
            </div>
          ))}
        </div>

        {requestSentFor && (
          <div className="mx-auto mt-6 max-w-xl rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-3 text-sm text-emerald-200 text-center flex items-center justify-center gap-2">
            <Mail size={14} />
            Thanks — email <a href="mailto:hello@clouts.com" className="font-semibold underline hover:text-emerald-100">hello@clouts.com</a> and we'll schedule a walkthrough.
          </div>
        )}

        <p className="text-center text-xs text-white/20 mt-8">
          No self-serve checkout — every plan is scoped to your team's prompt volume, seats, and engine coverage on a call.
        </p>
      </div>

      {/* Competitor comparison */}
      <section className="border-t border-white/[0.07] bg-white/[0.01] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3">How Clouts compares</h2>
            <p className="text-white/40">Same category, different starting point.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  <th className="text-left px-4 py-3 text-xs font-bold text-white/30 uppercase tracking-widest w-52">Feature</th>
                  {[
                    { name: 'Clouts Growth', price: '$399/mo', highlight: true },
                    { name: 'Profound Growth', price: '$399/mo', highlight: false },
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
                  ['AI engines monitored', '5', '3', '4-8', '4'],
                  ['Mention rate tracking', '✓', '✓', '✓', '✓'],
                  ['Sentiment analysis', '✓', '✓', '✓', '✓'],
                  ['Competitor tracking', '✓', '✓', '✓', '✓'],
                  ['Hallucination detection', '✓', '✓', '✓', '—'],
                  ['AEO agent (AI recommendations)', '✓', '✓ (capped)', '—', '—'],
                  ['Auto video clipping', '✓', '—', '—', '—'],
                  ['Public share reports', '✓', '—', '—', '—'],
                  ['CSV export', '✓', '✓', '—', '—'],
                  ['Scan history', '✓', '✓', '✓', '✓'],
                  ['Self-serve trial', '—', '—', '✓', '✓'],
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
          <p className="text-center text-xs text-white/20 mt-4">Competitor pricing as of June 2026, based on publicly reported figures. Clouts features based on Growth plan.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/[0.07] py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-black text-white text-center mb-10">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'How does Clouts monitor AI engines?', a: 'We query ChatGPT, Perplexity, Claude, Gemini, and Grok with your tracked keywords and analyze every response to see if — and how — your brand is mentioned. You get mention rate, sentiment, position, and score for each engine.' },
              { q: 'Is there a free trial or self-serve signup?', a: "No — like the rest of the enterprise AEO category, every Clouts plan starts with a short call so we can scope prompt volume, engine coverage, and seats to your team before you commit." },
              { q: 'What is hallucination detection?', a: 'Our AEO agent analyzes AI response text to flag when an engine makes potentially inaccurate claims about your brand — wrong pricing, fabricated features, or misleading comparisons. You are alerted so you can create corrective content.' },
              { q: 'Can I change plans later?', a: 'Yes. Your account team can move you between Starter, Growth, and Enterprise as your tracked prompt volume and engine coverage needs change.' },
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
