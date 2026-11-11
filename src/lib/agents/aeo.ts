/**
 * AEO (Answer Engine Optimization) Agent
 * Uses Claude to analyze brand mentions, detect hallucinations,
 * and generate optimized content recommendations to improve AI visibility
 */
import Anthropic from '@anthropic-ai/sdk'

export interface AEOAnalysis {
  overallScore: number
  strengths: string[]
  gaps: string[]
  recommendations: {
    title: string
    priority: 'high' | 'medium' | 'low'
    action: string
    expectedImpact: string
  }[]
  contentIdeas: {
    title: string
    format: 'faq' | 'article' | 'comparison' | 'guide'
    targetQuery: string
    outline: string[]
  }[]
  summary: string
  hallucinations?: {
    engine: string
    query: string
    issue: string
    severity: 'high' | 'medium' | 'low'
  }[]
}

export class AgentNotConfiguredError extends Error {}

function anthropicKey() {
  const k = process.env.ANTHROPIC_API_KEY
  if (!k || k.includes('REPLACE') || k.length < 20) throw new AgentNotConfiguredError('ANTHROPIC_API_KEY is not configured')
  return k
}

const AGENT_MODEL = () => process.env.ANTHROPIC_AGENT_MODEL || 'claude-sonnet-4-5'

function parseJson<T>(text: string): T {
  const clean = text.replace(/```json|```/g, '').trim()
  const start = clean.search(/[[{]/)
  const end = Math.max(clean.lastIndexOf('}'), clean.lastIndexOf(']'))
  return JSON.parse(clean.slice(start, end + 1))
}

export interface AgentMention {
  engine: string; prompt: string; mentioned: boolean; sentiment: string | null; score: number | null
  response_text: string; cited_url?: string | null; citations?: string[] | null; competitor_mentions?: Record<string, boolean> | null
}

function citedDomains(mentions: AgentMention[]) {
  const counts: Record<string, number> = {}
  mentions.forEach(m => (m.citations || []).forEach(u => {
    try { const h = new URL(u).hostname.replace(/^www\./, ''); counts[h] = (counts[h] || 0) + 1 } catch {}
  }))
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 15)
}

export async function runAEOAgent(
  brandName: string,
  domain: string,
  keywords: string[],
  mentions: AgentMention[],
  competitors: string[] = [],
): Promise<AEOAnalysis> {
  const client = new Anthropic({ apiKey: anthropicKey() })
  if (mentions.length === 0) throw new Error('Run a visibility scan first; the agent analyzes real scan results.')

  const total = mentions.length
  const rate = Math.round((mentions.filter(m => m.mentioned).length / total) * 100)
  const compStats = competitors.map(c => `${c}: ${mentions.filter(m => m.competitor_mentions?.[c]).length}/${total}`).join(', ')
  const sources = citedDomains(mentions).map(([d, n]) => `${d} (${n})`).join(', ')
  const mentionSummary = mentions.slice(0, 25).map(m =>
    `- ${m.engine}: "${m.prompt}" → ${m.mentioned ? `MENTIONED (position score ${m.score}, ${m.sentiment})` : 'NOT MENTIONED'}\n  Answer excerpt: "${(m.response_text || '').slice(0, 400).replace(/\s+/g, ' ')}"`
  ).join('\n')

  const prompt = `You are an expert in Answer Engine Optimization (AEO): helping brands appear prominently and accurately in AI assistant answers.

Brand: ${brandName}
Domain: ${domain}
Tracked prompts: ${keywords.join(', ')}
Measured mention rate: ${rate}% of ${total} real AI answers
Competitor mentions in the same answers: ${compStats || 'none tracked'}
Sources the AI engines cited most: ${sources || 'none returned'}

Recent real AI engine answers:
${mentionSummary}

Base every statement on the data above. Do not invent numbers. Provide a JSON response with this EXACT structure:
{
  "overallScore": <0-100 integer reflecting mention rate, position, sentiment and consistency>,
  "strengths": [<2-3 specific strengths observed in the data>],
  "gaps": [<2-4 specific gaps, e.g. prompts where competitors appear and the brand does not>],
  "recommendations": [{ "title": "<short title>", "priority": "high|medium|low", "action": "<concrete action, e.g. which cited source to get listed on>", "expectedImpact": "<qualitative expected outcome>" }],
  "contentIdeas": [{ "title": "<content title>", "format": "faq|article|comparison|guide", "targetQuery": "<exact tracked prompt>", "outline": [<3-5 key points>] }],
  "summary": "<2-3 sentence executive summary>",
  "hallucinations": [{ "engine": "<engine>", "query": "<prompt>", "issue": "<inaccurate claim about ${brandName}>", "severity": "high|medium|low" }]
}
Only include hallucinations for claims about ${brandName} that look factually wrong. Return ONLY JSON.`

  const msg = await client.messages.create({ model: AGENT_MODEL(), max_tokens: 3000, messages: [{ role: 'user', content: prompt }] })
  const text = msg.content.filter(b => b.type === 'text').map(b => (b as any).text).join('')
  return parseJson<AEOAnalysis>(text)
}

export async function generateContentDraft(
  brandName: string,
  domain: string,
  idea: { title: string; format: string; targetQuery: string; outline: string[] },
): Promise<string> {
  const client = new Anthropic({ apiKey: anthropicKey() })
  const msg = await client.messages.create({
    model: AGENT_MODEL(),
    max_tokens: 4000,
    messages: [{ role: 'user', content: `Write a publish-ready ${idea.format} for ${brandName} (${domain}) titled "${idea.title}".
It should be the best answer on the web to the query "${idea.targetQuery}", so AI assistants quote and cite it.
Cover: ${idea.outline.join('; ')}.
Rules: Markdown; open with a 2-3 sentence direct answer; use clear H2/H3 headings; include a FAQ section with 4-6 questions; be factual and do not invent statistics, prices, customers or awards; mark any fact the brand must confirm as [verify].` }],
  })
  return msg.content.filter(b => b.type === 'text').map(b => (b as any).text).join('')
}
