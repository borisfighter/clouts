export interface KeywordVolume {
  keyword: string
  searchVolume: number | null
  cpc: number | null
  competition: number | null
  trend: 'up' | 'flat' | 'down' | null
  monthly: { year: number; month: number; search_volume: number }[]
}

export class VolumesNotConfiguredError extends Error {}

export function volumesConfigured() {
  return !!process.env.DATAFORSEO_LOGIN && !!process.env.DATAFORSEO_PASSWORD
}

function trendOf(monthly: KeywordVolume['monthly']): KeywordVolume['trend'] {
  if (monthly.length < 6) return null
  const sorted = [...monthly].sort((a, b) => a.year - b.year || a.month - b.month)
  const avg = (xs: typeof sorted) => xs.reduce((s, m) => s + (m.search_volume || 0), 0) / xs.length
  const recent = avg(sorted.slice(-3)), prior = avg(sorted.slice(-6, -3))
  if (prior === 0) return recent > 0 ? 'up' : 'flat'
  const change = (recent - prior) / prior
  return change > 0.15 ? 'up' : change < -0.15 ? 'down' : 'flat'
}

/** Google Ads search volume (US, English) via DataForSEO. */
export async function fetchSearchVolumes(keywords: string[], locationCode = 2840): Promise<KeywordVolume[]> {
  if (!volumesConfigured()) throw new VolumesNotConfiguredError('DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD not configured')
  const clean = Array.from(new Set(keywords.map(k => k.trim().toLowerCase()).filter(k => k && k.length <= 80 && k.split(/\s+/).length <= 10)))
  if (clean.length === 0) return []
  const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64')
  const res = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([{ keywords: clean.slice(0, 1000), location_code: locationCode, language_code: 'en' }]),
    signal: AbortSignal.timeout(60_000),
  })
  const data = await res.json().catch(() => null)
  const task = data?.tasks?.[0]
  if (!res.ok || !task || task.status_code !== 20000) {
    throw new Error(`DataForSEO error: ${task?.status_message || data?.status_message || res.status}`)
  }
  return (task.result || []).map((r: any) => ({
    keyword: r.keyword,
    searchVolume: r.search_volume ?? null,
    cpc: r.cpc ?? null,
    competition: r.competition_index ?? null,
    monthly: r.monthly_searches || [],
    trend: trendOf(r.monthly_searches || []),
  }))
}

/**
 * Opportunity (0-100): high search demand where the brand is rarely
 * mentioned in AI answers. visibility = brand mention rate for that prompt.
 */
export function opportunityScore(searchVolume: number | null, visibility: number | null) {
  if (searchVolume == null) return null
  const demand = Math.min(1, Math.log10(Math.max(1, searchVolume)) / 5)
  const gap = visibility == null ? 0.7 : 1 - visibility
  return Math.round(100 * (0.6 * demand + 0.4 * gap))
}
