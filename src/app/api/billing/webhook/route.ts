import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey || serviceKey.includes('REPLACE')) {
    // Stripe is configured but the DB write key isn't - this handler can
    // verify and parse webhook events but can never persist their effect.
    // Fail loudly here rather than letting createServerClient construct
    // with an invalid/placeholder key and fail later with a much less
    // obvious error inside the actual update() calls below.
    console.error('[stripe webhook] received event but SUPABASE_SERVICE_ROLE_KEY is not configured - cannot update user plans')
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Build a price-ID → plan-key lookup from PLANS config so subscription
  // events can resolve the plan without relying on metadata (which is only
  // present on the checkout session, not on subscription update events).
  const { PLANS } = await import('@/lib/stripe')
  const priceToplan: Record<string, string> = {}
  for (const [key, cfg] of Object.entries(PLANS)) {
    if ((cfg as any).priceMonthly) priceToplan[(cfg as any).priceMonthly] = key
    if ((cfg as any).priceYearly)  priceToplan[(cfg as any).priceYearly]  = key
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      const { error } = await supabase.from('users').update({
        plan: session.metadata.plan,
        stripe_subscription_id: session.subscription,
      }).eq('id', session.metadata.user_id)
      if (error) {
        // A failed plan update here means a customer paid and got nothing,
        // with no UI anywhere to surface that. Log it and return non-2xx so
        // Stripe's built-in webhook retry mechanism keeps trying instead of
        // marking this event as successfully delivered.
        console.error('[stripe webhook] checkout.session.completed: failed to update user plan', {
          userId: session.metadata.user_id, plan: session.metadata.plan, error: error.message,
        })
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as any
      const { error } = await supabase.from('users').update({ plan: 'free', stripe_subscription_id: null })
        .eq('stripe_customer_id', sub.customer)
      if (error) {
        console.error('[stripe webhook] customer.subscription.deleted: failed to downgrade user', {
          customerId: sub.customer, error: error.message,
        })
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as any
      if (sub.status === 'active' || sub.status === 'trialing') {
        // Resolve plan from the subscription's price ID — metadata is only
        // on the checkout session, never on subscription update events.
        const priceId = sub.items?.data?.[0]?.price?.id
        const plan = priceId ? (priceToplan[priceId] || sub.metadata?.plan || 'pro') : (sub.metadata?.plan || 'pro')
        const { error } = await supabase.from('users').update({
          plan,
          plan_expires_at: new Date(sub.current_period_end * 1000).toISOString(),
          stripe_subscription_id: sub.id,
        }).eq('stripe_customer_id', sub.customer)
        if (error) {
          console.error('[stripe webhook] customer.subscription.updated: failed to update user plan', {
            customerId: sub.customer, plan, priceId, error: error.message,
          })
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
        }
      }
      break
    }
    case 'invoice.paid': {
      // Keep plan_expires_at fresh on renewal so it doesn't go stale
      const inv = event.data.object as any
      if (inv.subscription && inv.status === 'paid') {
        const sub2 = await stripe.subscriptions.retrieve(inv.subscription)
        const priceId2 = (sub2 as any).items?.data?.[0]?.price?.id
        const plan2 = priceId2 ? (priceToplan[priceId2] || 'pro') : 'pro'
        await supabase.from('users').update({
          plan: plan2,
          plan_expires_at: new Date((sub2 as any).current_period_end * 1000).toISOString(),
        }).eq('stripe_customer_id', inv.customer)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
