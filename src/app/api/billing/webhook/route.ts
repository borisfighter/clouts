import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
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
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any
      await supabase.from('users').update({
        plan: session.metadata.plan,
        stripe_subscription_id: session.subscription,
      }).eq('id', session.metadata.user_id)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as any
      await supabase.from('users').update({ plan: 'free', stripe_subscription_id: null })
        .eq('stripe_customer_id', sub.customer)
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as any
      if (sub.status === 'active') {
        const plan = sub.metadata?.plan || 'pro'
        await supabase.from('users').update({ plan, plan_expires_at: new Date(sub.current_period_end * 1000).toISOString() })
          .eq('stripe_customer_id', sub.customer)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
