import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, domain } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey || anthropicKey.includes('REPLACE') || anthropicKey.length < 20) {
    return NextResponse.json({ suggestions: [
      `best ${name.toLowerCase()} alternative`,
      `${name.toLowerCase()} review`,
      `how does ${name.toLowerCase()} work`,
      `${name.toLowerCase()} pricing`,
      `top ${name.toLowerCase()} competitors`,
    ]})
  }

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: anthropicKey })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: `Generate 5 short search queries (5-8 words each) that potential customers type into ChatGPT or Perplexity when looking for a product like "${name}" (${domain}). Return ONLY a JSON array: ["query 1", "query 2", "query 3", "query 4", "query 5"]` }],
    })
    const text = (msg.content[0] as any).text?.trim() || '[]'
    const suggestions = JSON.parse(text.replace(/```json|```/g, '').trim())
    return NextResponse.json({ suggestions: suggestions.slice(0, 5) })
  } catch {
    return NextResponse.json({ suggestions: [
      `best ${name.toLowerCase()} tool`,
      `${name.toLowerCase()} review 2026`,
      `how to use ${name.toLowerCase()}`,
      `${name.toLowerCase()} vs alternatives`,
      `${name.toLowerCase()} features`,
    ]})
  }
}
