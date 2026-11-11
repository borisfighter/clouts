export interface MentionAnalysis {
  mentioned: boolean
  sentiment: 'positive' | 'neutral' | 'negative' | null
  position: number | null
  score: number
}

const POSITIVE_WORDS = [
  'best', 'excellent', 'great', 'top', 'leading', 'recommended', 'recommend',
  'popular', 'trusted', 'powerful', 'effective', 'outstanding', 'innovative', 'reliable', 'favorite',
]
const NEGATIVE_WORDS = [
  'bad', 'poor', 'avoid', 'worst', 'expensive', 'complicated', 'drawback',
  'limited', 'weak', 'unreliable', 'disappointing', 'overpriced', 'downside', 'lacks',
]

export function normalizeDomain(input: string) {
  return input.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Terms that identify an entity: its name (whole-word) and its domain. */
export function entityMatcher(nameOrDomain: string, domain?: string): (text: string) => boolean {
  const terms = new Set<string>()
  const raw = nameOrDomain.trim()
  const looksLikeDomain = /\.[a-z]{2,}$/i.test(raw.replace(/\/.*$/, ''))
  if (looksLikeDomain) {
    const d = normalizeDomain(raw)
    terms.add(d)
    const label = d.split('.')[0]
    if (label.length >= 4) terms.add(label)
  } else if (raw) {
    terms.add(raw.toLowerCase())
  }
  if (domain) terms.add(normalizeDomain(domain))
  const res = Array.from(terms).map(t => new RegExp(`(^|[^a-z0-9])${escapeRe(t)}([^a-z0-9]|$)`, 'i'))
  return (text: string) => res.some(re => re.test(text))
}

/**
 * Position = rank of the brand among the named entities/list items in the
 * answer (1 = first). Falls back to sentence order for prose answers.
 */
function brandPosition(text: string, matches: (t: string) => boolean): number | null {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const items = lines.filter(l => /^(\d+[.)]|[-*•]|#{1,4}\s)/.test(l))
  if (items.length >= 2) {
    const idx = items.findIndex(matches)
    if (idx >= 0) return idx + 1
  }
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  const idx = sentences.findIndex(matches)
  return idx >= 0 ? idx + 1 : null
}

export function analyzeMention(text: string, brandName: string, domain: string): MentionAnalysis {
  const matches = entityMatcher(brandName, domain)
  if (!matches(text)) return { mentioned: false, sentiment: null, position: null, score: 0 }

  const position = brandPosition(text, matches) ?? 1
  const ctx = text.split(/(?<=[.!?])\s+|\n/).filter(matches).join(' ').toLowerCase()
  const posCount = POSITIVE_WORDS.filter(w => new RegExp(`\\b${w}\\b`).test(ctx)).length
  const negCount = NEGATIVE_WORDS.filter(w => new RegExp(`\\b${w}\\b`).test(ctx)).length
  const sentiment: 'positive' | 'neutral' | 'negative' =
    posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral'

  const positionPenalty = Math.max(0, (position - 1) * 12)
  const sentimentBonus = sentiment === 'positive' ? 10 : sentiment === 'negative' ? -15 : 0
  const score = Math.min(100, Math.max(5, 90 - positionPenalty + sentimentBonus))
  return { mentioned: true, sentiment, position, score }
}

export function findCitation(citations: string[], domain: string): string | null {
  const d = normalizeDomain(domain)
  return citations.find(u => {
    try { const h = new URL(u).hostname.replace(/^www\./, ''); return h === d || h.endsWith('.' + d) } catch { return false }
  }) || null
}
