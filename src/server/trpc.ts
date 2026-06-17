import { initTRPC, TRPCError } from '@trpc/server'
import { type NextRequest } from 'next/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// ─── Context ─────────────────────────────────────────────────
export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const session = await auth()
  return {
    db,
    session,
    req: opts.req,
  }
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

// ─── Init ────────────────────────────────────────────────────
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

// ─── Middleware ───────────────────────────────────────────────
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, session: ctx.session } })
})

// ─── Exports ─────────────────────────────────────────────────
export const router          = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
