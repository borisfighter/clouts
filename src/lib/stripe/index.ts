import Stripe from 'stripe'
import { PLANS, CHECKOUT_PLANS, type PlanKey } from '@/lib/plans'

export { PLANS, normalizePlan, type PlanKey } from '@/lib/plans'

export const stripe = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('REPLACE')
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null

export function stripePriceId(plan: PlanKey, interval: 'monthly' | 'yearly'): string {
  const env = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`
  return process.env[env] || ''
}

export function planForPrice(priceId: string | undefined | null): PlanKey | null {
  if (!priceId) return null
  for (const plan of CHECKOUT_PLANS) {
    if (stripePriceId(plan, 'monthly') === priceId || stripePriceId(plan, 'yearly') === priceId) return plan
  }
  return null
}

export function trialDays(plan: PlanKey) {
  return PLANS[plan].trialDays
}
