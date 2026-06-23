import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    limits: { brands: 1, mentionsPerMonth: 100, clips: 0, agents: 0 },
    features: ['1 brand', '100 AI mentions/mo', 'Perplexity only', 'Email support'],
  },
  starter: {
    name: 'Starter',
    price: 99,
    priceMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
    priceYearly: process.env.STRIPE_PRICE_STARTER_YEARLY || '',
    trialDays: 3,
    limits: { brands: 1, mentionsPerMonth: 1000, clips: 0, agents: 0 },
    features: ['ChatGPT monitoring', 'Up to 50 tracked prompts', '1 seat', 'Basic visibility scoring', 'Email support'],
  },
  pro: {
    name: 'Pro',
    price: 79,
    priceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    priceYearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
    limits: { brands: 5, mentionsPerMonth: 10000, clips: 50, agents: 3 },
    features: ['5 brands', '10K AI mentions/mo', 'All 5 AI engines', '50 clips/mo', '3 agents', 'Priority support'],
  },
  team: {
    name: 'Team',
    price: 299,
    priceMonthly: process.env.STRIPE_PRICE_TEAM_MONTHLY || '',
    priceYearly: process.env.STRIPE_PRICE_TEAM_YEARLY || '',
    limits: { brands: -1, mentionsPerMonth: -1, clips: -1, agents: -1 },
    features: ['Unlimited brands', 'Unlimited mentions', 'All 5 AI engines', 'Unlimited clips', 'Unlimited agents', 'Dedicated support', 'Custom integrations'],
  },
  // growth/enterprise power the /pricing page's tier cards specifically.
  // pro/team above remain the tiers actually enforced across the dashboard
  // (src/lib/plan-limits.ts, admin panel, etc) - kept separate rather than
  // renamed so existing plan-gating logic isn't touched by a pricing-page
  // copy change.
  growth: {
    name: 'Growth',
    price: 399,
    priceMonthly: process.env.STRIPE_PRICE_GROWTH_MONTHLY || '',
    priceYearly: process.env.STRIPE_PRICE_GROWTH_YEARLY || '',
    trialDays: 3,
    limits: { brands: 5, mentionsPerMonth: 10000, clips: 20, agents: 6 },
    features: ['ChatGPT, Perplexity, Gemini, Grok + Claude', 'Up to 250 tracked prompts', '5 seats', 'Sentiment + competitor tracking', 'AEO agent — 6 content pieces/mo', 'Priority support'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 399, // Trial bills at the Growth rate; sales adjusts to the
                // negotiated custom rate before or shortly after trial ends.
    priceMonthly: process.env.STRIPE_PRICE_ENTERPRISE_TRIAL_MONTHLY || process.env.STRIPE_PRICE_GROWTH_MONTHLY || '',
    priceYearly: process.env.STRIPE_PRICE_ENTERPRISE_TRIAL_YEARLY || process.env.STRIPE_PRICE_GROWTH_YEARLY || '',
    trialDays: 3,
    limits: { brands: -1, mentionsPerMonth: -1, clips: -1, agents: -1 },
    features: ['All AI engines (ChatGPT, Perplexity, Gemini, Claude, Grok + more)', 'Unlimited tracked prompts', 'Unlimited seats', 'Prompt Volumes — real query-volume data', 'Unlimited AEO agent runs', 'SSO / SAML + SOC 2', 'Dedicated account team'],
  },
} as const

export type PlanKey = keyof typeof PLANS
