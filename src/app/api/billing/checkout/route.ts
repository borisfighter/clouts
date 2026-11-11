import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, stripePriceId, trialDays } from '@/lib/stripe'
import { CHECKOUT_PLANS, normalizePlan, type PlanKey } from '@/lib/plans'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: 'Billing is not set up yet' }, { status: 503 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, interval = 'monthly' } = await req.json()
  if (plan === 'enterprise') {
    return NextResponse.json({ error: 'Enterprise is set up by our team', contact: 'mailto:sales@clouts.com' }, { status: 400 })
  }
  if (!CHECKOUT_PLANS.includes(plan)) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  const planKey = plan as PlanKey
  const priceId = stripePriceId(planKey, interval === 'yearly' ? 'yearly' : 'monthly')
  if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 503 })

  const { data: userData } = await supabase.from('users')
    .select('plan, stripe_customer_id, stripe_subscription_id').eq('id', user.id).single()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin

  // Existing subscribers change plans in the billing portal (prorated), not a second subscription.
  if (userData?.stripe_customer_id && userData.stripe_subscription_id && normalizePlan(userData.plan) !== 'free') {
    const portal = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${appUrl}/dashboard/settings`,
    })
    return NextResponse.json({ url: portal.url })
  }

  let customerId = userData?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email!, metadata: { supabase_uid: user.id } })
    customerId = customer.id
    const { error } = await createAdminClient().from('users')
      .upsert({ id: user.id, email: user.email!, stripe_customer_id: customerId })
    if (error) return NextResponse.json({ error: 'Could not save billing account' }, { status: 500 })
  }

  const days = trialDays(planKey)
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: user.id,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { user_id: user.id, plan: planKey },
      ...(days ? { trial_period_days: days, trial_settings: { end_behavior: { missing_payment_method: 'cancel' as const } } } : {}),
    },
    payment_method_collection: 'always',
    success_url: `${appUrl}/dashboard?upgraded=true${days ? '&trial=true' : ''}`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { user_id: user.id, plan: planKey },
  })

  return NextResponse.json({ url: session.url })
}
