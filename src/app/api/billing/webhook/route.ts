import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe, planForPrice } from '@/lib/stripe'
import { normalizePlan, type PlanKey } from '@/lib/plans'
import { createAdminClient, serviceKeyConfigured } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const ACTIVE = new Set(['active', 'trialing'])

function planFromSubscription(sub: Stripe.Subscription): PlanKey {
  return planForPrice(sub.items?.data?.[0]?.price?.id) || normalizePlan(sub.metadata?.plan) || 'free'
}

export async function POST(req: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }
  if (!serviceKeyConfigured()) {
    console.error('[stripe webhook] SUPABASE_SERVICE_ROLE_KEY is not configured - cannot update user plans')
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  }

  const body = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, req.headers.get('stripe-signature') || '', process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = createAdminClient()

  async function applySubscription(sub: Stripe.Subscription, userId?: string | null) {
    const active = ACTIVE.has(sub.status)
    const update = active
      ? { plan: planFromSubscription(sub), stripe_subscription_id: sub.id, plan_expires_at: new Date(sub.current_period_end * 1000).toISOString() }
      : { plan: 'free', stripe_subscription_id: null, plan_expires_at: null }
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    const q = db.from('users').update(userId ? { ...update, stripe_customer_id: customerId } : update)
    const { data, error } = await (userId ? q.eq('id', userId) : q.eq('stripe_customer_id', customerId)).select('id')
    if (error) throw new Error(error.message)
    if (!data?.length) throw new Error(`no user for customer ${customerId}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await applySubscription(sub, session.client_reference_id || session.metadata?.user_id)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await applySubscription(sub, sub.metadata?.user_id)
        break
      }
      case 'invoice.paid': {
        const inv = event.data.object as Stripe.Invoice
        if (inv.subscription) {
          const sub = await stripe.subscriptions.retrieve(inv.subscription as string)
          await applySubscription(sub, sub.metadata?.user_id)
        }
        break
      }
    }
  } catch (e) {
    console.error(`[stripe webhook] ${event.type} failed`, e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
