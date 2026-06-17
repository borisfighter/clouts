/**
 * AEO (Answer Engine Optimization) Agent
 * Uses Claude claude-sonnet-4-6 to analyze brand mentions and generate
 * optimized content recommendations to improve AI visibility
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
}

export async function runAEOAgent(
  brandName: string,
  domain: string,
  keywords: string[],
  mentions: Array<{ engine: string; prompt: string; mentioned: boolean; sentiment: string | null; score: number | null; response_text: string }>
): Promise<AEOAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return mockAEOAnalysis(brandName, mentions)

  const client = new Anthropic({ apiKey })

  const mentionSummary = mentions.slice(0, 20).map(m =>
    `- ${m.engine}: "${m.prompt}" → ${m.mentioned ? `MENTIONED (score: ${m.score}, ${m.sentiment})` : 'NOT MENTIONED'}`
  ).join('\n')

  const prompt = `You are an expert in Answer Engine Optimization (AEO) — helping brands appear in AI chatbot responses.

Brand: ${brandName}
Domain: ${domain}
Keywords tracked: ${keywords.join(', ')}

Recent AI engine scan results:
${mentionSummary}

Analyze this brand's AI visibility and provide a JSON response with this exact structure:
{
  "overallScore": <0-100 integer>,
  "strengths": [<2-3 specific strengths based on data>],
  "gaps": [<2-3 specific gaps or missed opportunities>],
  "recommendations": [
    {
      "title": "<short action title>",
      "priority": "high|medium|low",
      "action": "<specific action to take>",
      "expectedImpact": "<what this will improve>"
    }
  ],
  "contentIdeas": [
    {
      "title": "<content title>",
      "format": "faq|article|comparison|guide",
      "targetQuery": "<query this targets>",
      "outline": [<3-4 key points>]
    }
  ],
  "summary": "<2-3 sentence executive summary of AI visibility status>"
}

Return ONLY valid JSON, no markdown, no explanation.`

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = (msg.content[0] as any).text || ''
    return JSON.parse(text)
  } catch {
    return mockAEOAnalysis(brandName, mentions)
  }
}

function mockAEOAnalysis(brandName: string, mentions: any[]): AEOAnalysis {
  const mentioned = mentions.filter(m => m.mentioned).length
  const total = mentions.length
  const rate = total > 0 ? Math.round((mentioned / total) * 100) : 0

  return {
    overallScore: rate,
    strengths: ['Brand domain is indexed', 'Keywords are being tracked'],
    gaps: ['Low mention rate across AI engines', 'No citation URLs detected', 'Missing structured FAQ content'],
    recommendations: [
      { title: 'Create AI-optimized FAQ page', priority: 'high', action: `Add a comprehensive FAQ page to ${brandName} covering all tracked keywords`, expectedImpact: 'Increase mention rate by 20-40%' },
      { title: 'Add structured data markup', priority: 'high', action: 'Implement JSON-LD schema for Organization, Product, and FAQ', expectedImpact: 'Improve citation rates in Perplexity and Gemini' },
      { title: 'Publish comparison content', priority: 'medium', action: `Write "${brandName} vs competitors" articles targeting your keywords`, expectedImpact: 'Appear in comparison queries' },
    ],
    contentIdeas: [
      { title: `What is ${brandName} and how does it work?`, format: 'faq', targetQuery: `${brandName} overview`, outline: ['What the product does', 'Key features', 'Who it\'s for', 'How to get started'] },
      { title: `${brandName} vs alternatives: Complete guide`, format: 'comparison', targetQuery: `best alternative to ${brandName}`, outline: ['Feature comparison', 'Pricing breakdown', 'Use case fit', 'Migration guide'] },
    ],
    summary: `${brandName} has a ${rate}% AI mention rate across ${total} scanned queries. There is significant opportunity to improve visibility by creating structured, AI-optimized content targeting your tracked keywords.`,
  }
}
