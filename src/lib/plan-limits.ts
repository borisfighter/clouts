import { createClient } from '@/lib/supabase/server'
import { PLANS, type PlanKey } from '@/lib/stripe'

/**
 * Resolves the authenticated user's current plan and the PLANS config for it.
 * Centralizes the "what is this user allowed to do" logic so every API route
 * enforces the same limits — instead of trusting client-supplied state.
 */
export async function getUserPlan(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('plan').eq('id', userId).single()
  const planKey = (data?.plan as PlanKey) || 'free'
  const plan = PLANS[planKey] || PLANS.free
  return { planKey, plan }
}

/** Engines allowed for a given plan tier. Mirrors PLANS.<tier>.features intent. */
export function allowedEngines(planKey: PlanKey): string[] {
  if (planKey === 'free') return ['perplexity']
  return ['perplexity', 'chatgpt', 'gemini', 'grok', 'claude']
}

/**
 * Filters a client-requested engines array down to what the plan actually
 * allows. Never trusts the client list directly — this is the fix for
 * engines being scannable for free by anyone who calls the API directly.
 */
export function clampEngines(requested: string[] | undefined, planKey: PlanKey): string[] {
  const allowed = allowedEngines(planKey)
  if (!requested || requested.length === 0) return [allowed[0]]
  const filtered = requested.filter(e => allowed.includes(e))
  return filtered.length > 0 ? filtered : [allowed[0]]
}

/** -1 in PLANS.limits means unlimited. */
export function isUnlimited(limit: number) {
  return limit === -1
}
