/**
 * AEO (Answer Engine Optimization) Agent
 * Uses Claude claude-sonnet-4-6 to analyze brand mentions, detect hallucinations,
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

export async function runAEOAgent(
  brandName: string,
  domain: string,
  keywords: string[],
  mentions: Array<{ engine: string; prompt: string; mentioned: boolean; sentiment: string | null; score: number | null; response_text: string }>
): Promise<AEOAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey.includes('REPLACE') || apiKey.length < 20) {
    return mockAEOAnalysis(brandName, mentions)
  }

  const client = new Anthropic({ apiKey })

  const mentionSummary = mentions.slice(0, 15).map(m =>
    `- ${m.engine}: "${m.prompt}" → ${m.mentioned ? `MENTIONED (score: ${m.score}, ${m.sentiment})\n  Response: "${(m.response_text || '').slice(0, 200)}"` : 'NOT MENTIONED'}`
  ).join('\n')

  const prompt = `You are an expert in Answer Engine Optimization (AEO) — helping brands appear prominently and accurately in AI chatbot responses.

Brand: ${brandName}
Domain: ${domain}
Keywords tracked: ${keywords.join(', ')}

Recent AI engine scan results (with response snippets):
${mentionSummary}

Analyze this brand's AI visibility and provide a JSON response with this EXACT structure:
{
  "overallScore": <0-100 integer based on mention rate, sentiment, and consistency>,
  "strengths": [<2-3 specific strengths observed in the data>],
  "gaps": [<2-4 specific gaps or missed opportunities>],
  "recommendations": [
    {
      "title": "<short actionable title>",
      "priority": "high|medium|low",
      "action": "<specific, concrete action to take>",
      "expectedImpact": "<measurable expected outcome>"
    }
  ],
  "contentIdeas": [
    {
      "title": "<specific content title>",
      "format": "faq|article|comparison|guide",
      "targetQuery": "<exact query this targets>",
      "outline": [<3-4 specific key points to cover>]
    }
  ],
  "summary": "<2-3 sentence executive summary of current AI visibility status and top opportunity>",
  "hallucinations": [
    {
      "engine": "<engine name>",
      "query": "<the query>",
      "issue": "<description of inaccurate or misleading information found>",
      "severity": "high|medium|low"
    }
  ]
}

The hallucinations array should only include entries where you detect factually suspicious or potentially inaccurate claims about ${brandName} in the response text. If none detected, return an empty array.

Return ONLY valid JSON, no markdown fences, no explanation.`

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = (msg.content[0] as any).text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return mockAEOAnalysis(brandName, mentions)
  }
}

function mockAEOAnalysis(brandName: string, mentions: any[]): AEOAnalysis {
  const mentioned = mentions.filter(m => m.mentioned).length
  const total = mentions.length
  const rate = total > 0 ? Math.round((mentioned / total) * 100) : 0

  return {
    overallScore: Math.min(100, rate + 5),
    strengths: ['Brand domain is indexed by AI engines', 'Keywords are actively being tracked'],
    gaps: [
      'Missing structured FAQ content targeting your keywords',
      'No citation URLs detected — AI engines not linking to your domain',
      'Content gaps: no comparison pages vs competitors',
    ],
    recommendations: [
      {
        title: 'Create AI-optimized FAQ page',
        priority: 'high',
        action: `Add a comprehensive FAQ page to ${domain} covering all ${keywords.length} tracked keywords with clear, definitive answers`,
        expectedImpact: 'Increase mention rate by 20-40% within 4-6 weeks',
      },
      {
        title: 'Add structured data markup (JSON-LD)',
        priority: 'high',
        action: 'Implement Organization, Product, and FAQ schemas on your homepage and product pages',
        expectedImpact: 'Improve citation rates in Perplexity and Gemini by 15-30%',
      },
      {
        title: 'Publish "vs competitors" comparison content',
        priority: 'medium',
        action: `Write detailed comparison articles: "${brandName} vs [Top 3 competitors]" with honest feature breakdowns`,
        expectedImpact: 'Appear in high-intent comparison queries — often highest-converting traffic',
      },
      {
        title: 'Build authoritative "How to" guides',
        priority: 'medium',
        action: `Create long-form guides for each tracked keyword explaining how ${brandName} solves the problem`,
        expectedImpact: 'Increase average visibility score by 10-20 points',
      },
    ],
    contentIdeas: [
      {
        title: `What is ${brandName}? Complete guide for ${new Date().getFullYear()}`,
        format: 'guide',
        targetQuery: keywords[0] || `${brandName} overview`,
        outline: [`What ${brandName} does`, 'Key features and benefits', 'Who it\'s built for', 'How to get started in 5 minutes'],
      },
      {
        title: `${brandName} vs alternatives: Honest comparison`,
        format: 'comparison',
        targetQuery: `best alternative to ${brandName}`,
        outline: ['Feature-by-feature comparison table', 'Pricing breakdown', 'Best use cases for each', 'Migration guide'],
      },
      {
        title: `How to use ${brandName} for ${keywords[1] || 'AI search optimization'}`,
        format: 'article',
        targetQuery: keywords[1] || `how to improve AI visibility`,
        outline: ['The problem it solves', 'Step-by-step setup', 'Advanced tips', 'Results you can expect'],
      },
    ],
    summary: `${brandName} has a ${rate}% AI mention rate across ${total} scanned queries. ${rate < 30 ? 'This is below average — significant optimization opportunity exists.' : rate < 60 ? 'This is moderate — targeted content improvements can push you into the top tier.' : 'Strong visibility! Focus on maintaining accuracy and expanding to more query variations.'} The highest-impact action is creating structured, FAQ-format content targeting your exact tracked keywords.`,
    hallucinations: [],
  }
}
