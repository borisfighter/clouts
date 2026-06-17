import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'

function checkKey(key: string | undefined): 'connected' | 'placeholder' | 'missing' {
  if (!key) return 'missing'
  if (key.includes('REPLACE') || key.length < 10) return 'placeholder'
  return 'connected'
}

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const integrations = [
    // AI Scrapers
    { key: 'scraper_perplexity', name: 'Perplexity (Sonar)', desc: 'Powers Perplexity AI visibility scans', status: checkKey(process.env.PERPLEXITY_API_KEY), link: 'https://www.perplexity.ai/settings/api', required: true },
    { key: 'scraper_openai', name: 'OpenAI (ChatGPT)', desc: 'Powers ChatGPT visibility scans via GPT-4o-mini', status: checkKey(process.env.OPENAI_API_KEY), link: 'https://platform.openai.com/api-keys', required: true },
    { key: 'scraper_gemini', name: 'Google Gemini', desc: 'Powers Gemini 1.5 Flash visibility scans', status: checkKey(process.env.GEMINI_API_KEY), link: 'https://aistudio.google.com', required: true },
    { key: 'scraper_xai', name: 'xAI (Grok)', desc: 'Powers Grok-2 visibility scans', status: checkKey(process.env.XAI_API_KEY), link: 'https://console.x.ai', required: true },
    { key: 'scraper_anthropic', name: 'Anthropic (Claude)', desc: 'Powers Claude Haiku scans + AEO agent (claude-sonnet-4-6)', status: checkKey(process.env.ANTHROPIC_API_KEY), link: 'https://console.anthropic.com', required: true },
    // Infrastructure
    { key: 'infra_supabase', name: 'Supabase (Anon)', desc: 'Client-side database access', status: checkKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY), link: 'https://supabase.com/dashboard/project/nwemjtwojubvfwngqkzv/settings/api', required: true },
    { key: 'infra_supabase_service', name: 'Supabase (Service Role)', desc: 'Admin panel & background jobs cross-user access', status: checkKey(process.env.SUPABASE_SERVICE_ROLE_KEY), link: 'https://supabase.com/dashboard/project/nwemjtwojubvfwngqkzv/settings/api', required: true },
    { key: 'infra_inngest_event', name: 'Inngest (Event Key)', desc: 'Triggers background scan jobs', status: checkKey(process.env.INNGEST_EVENT_KEY), link: 'https://app.inngest.com', required: false },
    { key: 'infra_inngest_sign', name: 'Inngest (Signing Key)', desc: 'Verifies webhook signatures from Inngest', status: checkKey(process.env.INNGEST_SIGNING_KEY), link: 'https://app.inngest.com', required: false },
    // Monetisation
    { key: 'billing_stripe', name: 'Stripe (Secret Key)', desc: 'Processes payments and subscriptions', status: checkKey(process.env.STRIPE_SECRET_KEY), link: 'https://dashboard.stripe.com/apikeys', required: false },
    { key: 'billing_stripe_webhook', name: 'Stripe (Webhook)', desc: 'Receives subscription lifecycle events', status: checkKey(process.env.STRIPE_WEBHOOK_SECRET), link: 'https://dashboard.stripe.com/webhooks', required: false },
    { key: 'billing_stripe_pro', name: 'Stripe (Pro Price ID)', desc: 'Monthly price ID for Pro plan ($79/mo)', status: checkKey(process.env.STRIPE_PRICE_PRO_MONTHLY), link: 'https://dashboard.stripe.com/products', required: false },
    // Media & Email
    { key: 'media_mux_id', name: 'Mux (Token ID)', desc: 'Video upload and processing for clips', status: checkKey(process.env.MUX_TOKEN_ID), link: 'https://dashboard.mux.com', required: false },
    { key: 'media_mux_secret', name: 'Mux (Token Secret)', desc: 'Video upload and processing for clips', status: checkKey(process.env.MUX_TOKEN_SECRET), link: 'https://dashboard.mux.com', required: false },
    { key: 'media_resend', name: 'Resend', desc: 'Welcome emails and scan notifications', status: checkKey(process.env.RESEND_API_KEY), link: 'https://resend.com/api-keys', required: false },
  ]

  return NextResponse.json({ integrations })
}
