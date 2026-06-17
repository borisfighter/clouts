import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, interval = 'monthly' } = await req.json()
  const planConfig = PLANS[plan as keyof typeof PLANS]
  if (!planConfig || plan === 'free') return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const priceId = interval === 'yearly'
    ? (planConfig as any).priceYearly
    : (planConfig as any).priceMonthly

  if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 400 })

  // Get or create Stripe customer
  const { data: userData } = await supabase.from('users').select('stripe_customer_id').eq('id', user.id).single()

  let customerId = userData?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email!, metadata: { supabase_uid: user.id } })
    customerId = customer.id
    await supabase.from('users').upsert({ id: user.id, email: user.email!, stripe_customer_id: customerId })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { user_id: user.id, plan },
  })

  return NextResponse.json({ url: session.url })
}
