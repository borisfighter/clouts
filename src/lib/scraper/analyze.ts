/**
 * Shared mention analysis utility used by all engine scrapers.
 * Extracted from per-engine files to prevent sentiment/scoring logic from
 * drifting out of sync across perplexity, chatgpt, gemini, grok, and claude.
 */

export interface MentionAnalysis {
  mentioned: boolean
  sentiment: 'positive' | 'neutral' | 'negative' | null
  position: number | null
  score: number
}

const POSITIVE_WORDS = [
  'best', 'excellent', 'great', 'top', 'leading', 'recommended',
  'popular', 'trusted', 'powerful', 'effective', 'outstanding', 'innovative',
]
const NEGATIVE_WORDS = [
  'bad', 'poor', 'avoid', 'worst', 'expensive', 'complicated',
  'limited', 'weak', 'unreliable', 'disappointing', 'overpriced',
]

export function analyzeMention(text: string, brandName: string, domain: string): MentionAnalysis {
  const lower = text.toLowerCase()
  const b = brandName.toLowerCase()
  const d = domain.toLowerCase().replace('www.', '').split('/')[0]

  const mentioned = lower.includes(b) || lower.includes(d)
  if (!mentioned) return { mentioned: false, sentiment: null, position: null, score: 0 }

  const sentences = text.split(/[.!?]+/).filter(Boolean)
  const brandSentences = sentences.filter(s => {
    const sl = s.toLowerCase()
    return sl.includes(b) || sl.includes(d)
  })

  const position = sentences.findIndex(s => {
    const sl = s.toLowerCase()
    return sl.includes(b) || sl.includes(d)
  }) + 1

  const ctx = brandSentences.join(' ').toLowerCase()
  const posCount = POSITIVE_WORDS.filter(w => ctx.includes(w)).length
  const negCount = NEGATIVE_WORDS.filter(w => ctx.includes(w)).length

  const sentiment: 'positive' | 'neutral' | 'negative' =
    posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral'

  // Score: starts at 100, drops 15 per position from first mention,
  // ±10 for sentiment
  const positionPenalty = Math.max(0, (position - 1) * 15)
  const sentimentBonus = sentiment === 'positive' ? 10 : sentiment === 'negative' ? -10 : 0
  const score = Math.min(100, Math.max(0, 100 - positionPenalty + sentimentBonus))

  return { mentioned: true, sentiment, position, score }
}
