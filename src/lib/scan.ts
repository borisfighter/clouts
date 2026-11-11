import type { SupabaseClient } from '@supabase/supabase-js'
import { scrapeAllEngines, Engine, EngineFailure, ENGINE_LABELS } from '@/lib/scraper'

export interface ScanBrand {
  id: string
  name: string
  domain: string
  keywords: string[] | null
  competitors: string[] | null
}

export interface EngineFailureSummary {
  engine: Engine
  label: string
  failed: number
  notConfigured: boolean
  error: string
}

export function summarizeFailures(failures: EngineFailure[]): EngineFailureSummary[] {
  const byEngine = new Map<Engine, EngineFailureSummary>()
  for (const f of failures) {
    const s = byEngine.get(f.engine) || { engine: f.engine, label: ENGINE_LABELS[f.engine], failed: 0, notConfigured: f.notConfigured, error: f.error }
    s.failed += f.prompt === '*' ? 0 : 1
    byEngine.set(f.engine, s)
  }
  return Array.from(byEngine.values())
}

export async function runBrandScan(db: SupabaseClient, brand: ScanBrand, engines: Engine[], trigger: 'manual' | 'scheduled') {
  const keywords = (brand.keywords || []).filter(k => k.trim())
  const { data: run } = await db.from('scan_runs')
    .insert({ brand_id: brand.id, trigger, engines }).select('id').single()

  const { results, failures } = await scrapeAllEngines(keywords, brand.name, brand.domain, engines, brand.competitors || [])

  let insertError: string | null = null
  if (results.length > 0) {
    const { error } = await db.from('mentions').insert(results.map(r => ({
      brand_id: brand.id,
      engine: r.engine,
      prompt: r.prompt,
      response_text: r.responseText,
      mentioned: r.mentioned,
      sentiment: r.sentiment,
      position: r.position,
      cited_url: r.citedUrl,
      citations: r.citations,
      competitor_mentions: r.competitorMentions,
      score: r.score,
    })))
    if (error) insertError = error.message
  }

  const failureSummary = summarizeFailures(failures)
  const mentioned = results.filter(r => r.mentioned).length
  if (run?.id) {
    await db.from('scan_runs').update({
      results: insertError ? 0 : results.length,
      mentioned: insertError ? 0 : mentioned,
      failures: insertError ? [...failureSummary, { engine: 'all', error: `Saving results failed: ${insertError}` }] : failureSummary,
      finished_at: new Date().toISOString(),
    }).eq('id', run.id)
  }
  if (results.length > 0 && !insertError) {
    await db.from('brands').update({ last_scanned_at: new Date().toISOString() }).eq('id', brand.id)
  }

  return { results, failures: failureSummary, mentioned, insertError }
}
