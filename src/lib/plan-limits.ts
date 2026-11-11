import { createClient } from '@/lib/supabase/server'
import { PLANS, normalizePlan, planEngines, type PlanKey } from '@/lib/plans'

/** Resolves the authenticated user's plan server-side; never trust client state. */
export async function getUserPlan(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('plan').eq('id', userId).single()
  const planKey = normalizePlan(data?.plan)
  return { planKey, plan: PLANS[planKey] }
}

export function allowedEngines(planKey: PlanKey | string): string[] {
  return planEngines(planKey)
}

/** Filters a client-requested engine list to what the plan allows (default: all allowed). */
export function clampEngines(requested: string[] | undefined, planKey: PlanKey | string): string[] {
  const allowed = allowedEngines(planKey)
  if (!requested || requested.length === 0) return allowed
  const filtered = requested.filter(e => allowed.includes(e))
  return filtered.length > 0 ? filtered : allowed
}

/** -1 in PLANS.limits means unlimited. */
export function isUnlimited(limit: number) {
  return limit === -1
}
