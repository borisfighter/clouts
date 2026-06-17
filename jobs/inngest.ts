import { Inngest } from 'inngest'
import Mux from '@mux/mux-node'
import AssemblyAI from 'assemblyai'
import { db, clips, agents, agentRuns } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { scrapeEngine } from '@/lib/scraper'
import { sendClipReadyEmail } from '@/lib/email'

export const inngest = new Inngest({ id: 'clouts' })

const mux = new Mux({
  tokenId:     process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})
const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })

// ─── JOB: Process a clip (upload to Mux, generate captions) ──
export const processClip = inngest.createFunction(
  { id: 'clip-process', retries: 3 },
  { event: 'clip/process' },
  async ({ event, step }) => {
    const { clipId, sourceUrl, format } = event.data

    // Upload to Mux
    const asset = await step.run('upload-to-mux', async () => {
      const asset = await mux.video.assets.create({
        input:        [{ url: sourceUrl }],
        playback_policy: ['public'],
        mp4_support: 'capped-1080p',
      })
      return asset
    })

    // Wait for Mux to process (poll)
    await step.sleep('wait-for-mux', '30s')

    // Generate captions via AssemblyAI
    const captions = await step.run('generate-captions', async () => {
      const transcript = await aai.transcripts.transcribe({
        audio_url: sourceUrl,
        language_detection: true,
      })
      return transcript.srt_url
    })

    // Update clip record
    await step.run('update-clip', async () => {
      await db.update(clips)
        .set({
          muxAssetId:    asset.id,
          muxPlaybackId: asset.playback_ids?.[0]?.id,
          captionsUrl:   captions ?? undefined,
          hasCaptions:   !!captions,
          status:        'ready',
        })
        .where(eq(clips.id, clipId))
    })

    // Notify user
    await step.run('send-notification', async () => {
      const [clip] = await db.select().from(clips).where(eq(clips.id, clipId))
      if (clip) await sendClipReadyEmail(clip)
    })

    return { clipId, status: 'ready' }
  }
)

// ─── JOB: Scrape AI engines for brand mentions ───────────────
export const scrapeMentions = inngest.createFunction(
  { id: 'scrape-mentions', retries: 2 },
  { event: 'mentions/scrape' },
  async ({ event, step }) => {
    const { brandId, engines, prompts } = event.data

    const results = await step.run('scrape-all-engines', async () => {
      return Promise.allSettled(
        engines.flatMap((engine: string) =>
          prompts.map((prompt: string) =>
            scrapeEngine({ engine, prompt, brandId })
          )
        )
      )
    })

    return { brandId, scraped: results.length }
  }
)

// ─── JOB: Run an AEO agent ───────────────────────────────────
export const runAgent = inngest.createFunction(
  { id: 'run-agent', retries: 1, timeout: '10m' },
  { event: 'agent/run' },
  async ({ event, step }) => {
    const { agentId } = event.data

    const [agent] = await db.select().from(agents).where(eq(agents.id, agentId))
    if (!agent) throw new Error(`Agent ${agentId} not found`)

    const [run] = await db.insert(agentRuns).values({
      agentId,
      status: 'running',
      input: event.data,
    }).returning()

    try {
      const output = await step.run('execute-agent', async () => {
        // Agent execution logic varies by type
        // Each agent type has its own module in src/lib/ai/agents/
        const { executeAgent } = await import(`@/lib/ai/agents/${agent.type}`)
        return executeAgent(agent)
      })

      await db.update(agentRuns)
        .set({ status: 'completed', output, completedAt: new Date() })
        .where(eq(agentRuns.id, run.id))

      return { agentId, runId: run.id, status: 'completed' }
    } catch (error) {
      await db.update(agentRuns)
        .set({ status: 'failed', error: String(error), completedAt: new Date() })
        .where(eq(agentRuns.id, run.id))
      throw error
    }
  }
)

// ─── CRON: Hourly brand mention scrapes ──────────────────────
export const hourlyScrape = inngest.createFunction(
  { id: 'hourly-scrape' },
  { cron: '0 * * * *' },
  async ({ step }) => {
    await step.run('trigger-all-brand-scrapes', async () => {
      const { brands } = await import('@/lib/db/schema')
      const allBrands = await db.select().from(brands)

      await Promise.all(
        allBrands.map(brand =>
          inngest.send({
            name: 'mentions/scrape',
            data: {
              brandId: brand.id,
              engines: ['chatgpt', 'perplexity', 'gemini', 'claude', 'grok'],
              prompts: brand.keywords ?? [],
            },
          })
        )
      )
    })
  }
)

export const functions = [processClip, scrapeMentions, runAgent, hourlyScrape]
