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
  pro: {
    name: 'Pro',
    price: 79,
    priceMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    priceYearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
    limits: { brands: 5, mentionsPerMonth: 10000, clips: 50, agents: 3 },
    features: ['5 brands', '10K AI mentions/mo', 'All 8 AI engines', '50 clips/mo', '3 agents', 'Priority support'],
  },
  team: {
    name: 'Team',
    price: 299,
    priceMonthly: process.env.STRIPE_PRICE_TEAM_MONTHLY || '',
    priceYearly: process.env.STRIPE_PRICE_TEAM_YEARLY || '',
    limits: { brands: -1, mentionsPerMonth: -1, clips: -1, agents: -1 },
    features: ['Unlimited brands', 'Unlimited mentions', 'All engines + AI Overview', 'Unlimited clips', 'Unlimited agents', 'Dedicated support', 'Custom integrations'],
  },
} as const

export type PlanKey = keyof typeof PLANS
