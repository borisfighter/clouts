import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan, isUnlimited } from '@/lib/plan-limits'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, title, sourceUrl } = await req.json()
  if (!brandId || !title) return NextResponse.json({ error: 'brandId and title required' }, { status: 400 })

  const { data: brand } = await supabase
    .from('brands').select('id').eq('id', brandId).eq('user_id', user.id).single()
  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const { plan } = await getUserPlan(user.id)

  if (!isUnlimited(plan.limits.clips)) {
    if (plan.limits.clips === 0) {
      return NextResponse.json({
        error: `Clips are not available on the ${plan.name} plan. Upgrade to Pro to create clips.`,
      }, { status: 403 })
    }
    const since = new Date()
    since.setDate(1); since.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('clips').select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId).gte('created_at', since.toISOString())
    if ((count || 0) >= plan.limits.clips) {
      return NextResponse.json({
        error: `Monthly clip limit reached (${plan.limits.clips}/mo on the ${plan.name} plan). Upgrade for more.`,
      }, { status: 403 })
    }
  }

  const { data: clip, error } = await supabase.from('clips').insert({
    brand_id: brandId, title, source_url: sourceUrl || null, status: 'processing',
  }).select().single()

  if (error || !clip) return NextResponse.json({ error: 'Failed to create clip' }, { status: 500 })

  // Mux upload if configured and source URL provided
  const muxId = process.env.MUX_TOKEN_ID
  const muxSecret = process.env.MUX_TOKEN_SECRET
  const muxConfigured = muxId && muxSecret && !muxId.includes('REPLACE') && !muxSecret.includes('REPLACE') && muxId.length > 5

  if (muxConfigured && sourceUrl) {
    try {
      const { default: Mux } = await import('@mux/mux-node')
      const mux = new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET })
      const asset = await mux.video.assets.create({
        input: [{ url: sourceUrl }],
        playback_policy: ['public'],
        mp4_support: 'capped-1080p',
      })
      await supabase.from('clips').update({
        mux_asset_id: asset.id,
        mux_playback_id: asset.playback_ids?.[0]?.id,
      }).eq('id', clip.id)
      return NextResponse.json({ clipId: clip.id, muxAssetId: asset.id, status: 'processing' })
    } catch (err) {
      console.error('Mux error:', err)
    }
  }

  return NextResponse.json({ clipId: clip.id, status: 'processing' })
}
