export type Engine = 'perplexity' | 'chatgpt' | 'gemini' | 'grok' | 'claude'

export interface EngineAnswer {
  text: string
  citations: string[]
}

export class EngineError extends Error {
  constructor(public engine: Engine, message: string, public notConfigured = false) {
    super(message)
  }
}

function key(name: string): string | undefined {
  const k = process.env[name]
  return !k || k.includes('REPLACE') || k.length < 20 ? undefined : k
}

export const ENGINE_ENV: Record<Engine, string> = {
  perplexity: 'PERPLEXITY_API_KEY',
  chatgpt: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
  grok: 'XAI_API_KEY',
  claude: 'ANTHROPIC_API_KEY',
}

export function isEngineConfigured(engine: Engine) {
  return !!key(ENGINE_ENV[engine])
}

const SYSTEM = 'You are a helpful assistant. Answer the user\'s question accurately, naming specific products, companies or websites where relevant.'
const TIMEOUT_MS = 60_000

async function postJson(engine: Engine, url: string, headers: Record<string, string>, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300)
    throw new EngineError(engine, `HTTP ${res.status}: ${detail}`)
  }
  return res.json()
}

function uniq(urls: (string | undefined | null)[]) {
  return Array.from(new Set(urls.filter((u): u is string => !!u && /^https?:\/\//.test(u))))
}

async function askPerplexity(prompt: string, apiKey: string): Promise<EngineAnswer> {
  const data = await postJson('perplexity', 'https://api.perplexity.ai/chat/completions', { Authorization: `Bearer ${apiKey}` }, {
    model: process.env.PERPLEXITY_MODEL || 'sonar',
    messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
    max_tokens: 1024,
    temperature: 0.2,
  })
  return {
    text: data.choices?.[0]?.message?.content || '',
    citations: uniq([...(data.citations || []), ...((data.search_results || []).map((r: any) => r.url))]),
  }
}

async function askChatGPT(prompt: string, apiKey: string): Promise<EngineAnswer> {
  const data = await postJson('chatgpt', 'https://api.openai.com/v1/responses', { Authorization: `Bearer ${apiKey}` }, {
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    tools: [{ type: 'web_search_preview' }],
    instructions: SYSTEM,
    input: prompt,
    max_output_tokens: 1200,
  })
  const parts = (data.output || []).filter((o: any) => o.type === 'message').flatMap((o: any) => o.content || [])
  const textParts = parts.filter((c: any) => c.type === 'output_text')
  return {
    text: data.output_text || textParts.map((c: any) => c.text).join('\n'),
    citations: uniq(textParts.flatMap((c: any) => (c.annotations || []).map((a: any) => a.url))),
  }
}

async function askGemini(prompt: string, apiKey: string): Promise<EngineAnswer> {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
  const data = await postJson('gemini', `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { 'x-goog-api-key': apiKey }, {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
  })
  const cand = data.candidates?.[0]
  const chunks = cand?.groundingMetadata?.groundingChunks || []
  return {
    text: (cand?.content?.parts || []).map((p: any) => p.text || '').join(''),
    // Gemini returns redirect URLs; the title holds the source domain.
    citations: uniq(chunks.map((c: any) => (c.web?.title && /\./.test(c.web.title) && !c.web.title.includes(' ') ? `https://${c.web.title}` : c.web?.uri))),
  }
}

async function askGrok(prompt: string, apiKey: string): Promise<EngineAnswer> {
  const data = await postJson('grok', 'https://api.x.ai/v1/chat/completions', { Authorization: `Bearer ${apiKey}` }, {
    model: process.env.XAI_MODEL || 'grok-3-mini',
    messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
    max_tokens: 1200,
    temperature: 0.3,
  })
  return { text: data.choices?.[0]?.message?.content || '', citations: uniq(data.citations || []) }
}

async function askClaude(prompt: string, apiKey: string): Promise<EngineAnswer> {
  const data = await postJson('claude', 'https://api.anthropic.com/v1/messages', { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, {
    model: process.env.ANTHROPIC_SCAN_MODEL || 'claude-haiku-4-5',
    max_tokens: 1200,
    system: SYSTEM,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
    messages: [{ role: 'user', content: prompt }],
  })
  const blocks = data.content || []
  const text = blocks.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
  const cited = blocks.flatMap((b: any) => (b.citations || []).map((c: any) => c.url))
  const searched = blocks.filter((b: any) => b.type === 'web_search_tool_result')
    .flatMap((b: any) => (Array.isArray(b.content) ? b.content : []).map((r: any) => r.url))
  return { text, citations: uniq([...cited, ...searched]) }
}

const ASK: Record<Engine, (prompt: string, apiKey: string) => Promise<EngineAnswer>> = {
  perplexity: askPerplexity,
  chatgpt: askChatGPT,
  gemini: askGemini,
  grok: askGrok,
  claude: askClaude,
}

export async function askEngine(engine: Engine, prompt: string): Promise<EngineAnswer> {
  const apiKey = key(ENGINE_ENV[engine])
  if (!apiKey) throw new EngineError(engine, `${ENGINE_ENV[engine]} is not configured`, true)
  try {
    const answer = await ASK[engine](prompt, apiKey)
    if (!answer.text.trim()) throw new EngineError(engine, 'Empty response')
    return answer
  } catch (e) {
    if (e instanceof EngineError) throw e
    throw new EngineError(engine, e instanceof Error ? e.message : String(e))
  }
}
