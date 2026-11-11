// Single source of truth for plans. Keep in sync with
// public.plan_limit() in supabase/migrations (brands/prompts enforcement).
export const ALL_PLAN_ENGINES = ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude'] as const

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    trialDays: 0,
    engines: ['perplexity'],
    limits: { brands: 1, prompts: 5, mentionsPerMonth: 150, clips: 0, agents: 1 },
    features: ['1 brand', '5 tracked prompts', 'Perplexity', 'Daily automatic scans', '150 AI answers/mo'],
  },
  starter: {
    name: 'Starter',
    price: 99,
    trialDays: 3,
    engines: ['chatgpt', 'perplexity'],
    limits: { brands: 1, prompts: 25, mentionsPerMonth: 1500, clips: 0, agents: 4 },
    features: ['1 brand', '25 tracked prompts', 'ChatGPT + Perplexity', 'Daily scans with citations', 'Competitor tracking', '4 AEO agent runs/mo', 'Email support'],
  },
  growth: {
    name: 'Growth',
    price: 399,
    trialDays: 3,
    engines: [...ALL_PLAN_ENGINES],
    limits: { brands: 5, prompts: 100, mentionsPerMonth: 15000, clips: 20, agents: 30 },
    features: ['5 brands', '100 tracked prompts per brand', 'ChatGPT, Perplexity, Gemini, Grok + Claude', 'Daily scans with citations', 'Sentiment + competitor tracking', '30 AEO agent runs/mo', '20 video clips/mo', 'Priority support'],
  },
  enterprise: {
    name: 'Enterprise',
    price: null,
    trialDays: 0,
    engines: [...ALL_PLAN_ENGINES],
    limits: { brands: -1, prompts: -1, mentionsPerMonth: -1, clips: -1, agents: -1 },
    features: ['Unlimited brands and prompts', 'All 5 AI engines', 'Unlimited AEO agent runs', 'Unlimited video clips', 'Custom contract + invoicing', 'Dedicated account manager'],
  },
} as const

export type PlanKey = keyof typeof PLANS
export type PlanConfig = (typeof PLANS)[PlanKey]
export const CHECKOUT_PLANS: PlanKey[] = ['starter', 'growth']

const LEGACY: Record<string, PlanKey> = { pro: 'growth', team: 'enterprise' }

export function normalizePlan(raw: string | null | undefined): PlanKey {
  if (!raw) return 'free'
  if (raw in PLANS) return raw as PlanKey
  return LEGACY[raw] || 'free'
}

export function planEngines(plan: string | null | undefined): string[] {
  return [...PLANS[normalizePlan(plan)].engines]
}

export function formatLimit(n: number, unit: string) {
  return n === -1 ? `Unlimited ${unit}` : `${n.toLocaleString()} ${unit}`
}

export function planSummary(plan: string | null | undefined) {
  const p = PLANS[normalizePlan(plan)]
  return [formatLimit(p.limits.brands, p.limits.brands === 1 ? 'brand' : 'brands'), formatLimit(p.limits.prompts, 'prompts'), formatLimit(p.limits.mentionsPerMonth, 'answers/mo'), `${p.engines.length} engine${p.engines.length > 1 ? 's' : ''}`].join(' · ')
}
