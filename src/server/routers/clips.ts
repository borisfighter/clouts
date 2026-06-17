import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { clips, clipPublishes } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { inngest } from '@/lib/inngest'

export const clipsRouter = router({
  list: protectedProcedure
    .input(z.object({
      brandId: z.string().uuid(),
      status:  z.enum(['processing', 'ready', 'published', 'failed']).optional(),
      limit:   z.number().min(1).max(100).default(20),
      offset:  z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const where = input.status
        ? and(eq(clips.brandId, input.brandId), eq(clips.status, input.status))
        : eq(clips.brandId, input.brandId)

      return ctx.db.select().from(clips)
        .where(where)
        .orderBy(desc(clips.createdAt))
        .limit(input.limit)
        .offset(input.offset)
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [clip] = await ctx.db.select().from(clips)
        .where(eq(clips.id, input.id))
      return clip
    }),

  create: protectedProcedure
    .input(z.object({
      brandId:    z.string().uuid(),
      title:      z.string().min(1).max(200),
      sourceUrl:  z.string().url(),
      mentionId:  z.string().uuid().optional(),
      startSec:   z.number().default(0),
      endSec:     z.number().optional(),
      format:     z.enum(['16:9', '9:16', '1:1']).default('16:9'),
    }))
    .mutation(async ({ ctx, input }) => {
      const [clip] = await ctx.db.insert(clips).values({
        ...input,
        status: 'processing',
      }).returning()

      // Kick off background processing job
      await inngest.send({
        name: 'clip/process',
        data: { clipId: clip.id, sourceUrl: input.sourceUrl, startSec: input.startSec, endSec: input.endSec, format: input.format },
      })

      return clip
    }),

  trim: protectedProcedure
    .input(z.object({
      id:       z.string().uuid(),
      startSec: z.number(),
      endSec:   z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db.update(clips)
        .set({ startSec: input.startSec, endSec: input.endSec, status: 'processing' })
        .where(eq(clips.id, input.id))
        .returning()

      await inngest.send({
        name: 'clip/retrim',
        data: { clipId: input.id, startSec: input.startSec, endSec: input.endSec },
      })

      return updated
    }),

  publish: protectedProcedure
    .input(z.object({
      clipId:    z.string().uuid(),
      platforms: z.array(z.enum(['tiktok', 'instagram', 'youtube', 'linkedin', 'twitter'])),
    }))
    .mutation(async ({ ctx, input }) => {
      const publishes = await ctx.db.insert(clipPublishes)
        .values(input.platforms.map(platform => ({
          clipId: input.clipId,
          platform,
          status: 'queued' as const,
        })))
        .returning()

      await inngest.send({
        name: 'clip/publish',
        data: { clipId: input.clipId, platforms: input.platforms },
      })

      return publishes
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(clips).where(eq(clips.id, input.id))
      return { success: true }
    }),
})
