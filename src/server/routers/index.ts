import { router } from '../trpc'
import { brandsRouter }   from './brands'
import { mentionsRouter } from './mentions'
import { clipsRouter }    from './clips'
import { agentsRouter }   from './agents'
import { billingRouter }  from './billing'

export const appRouter = router({
  brands:   brandsRouter,
  mentions: mentionsRouter,
  clips:    clipsRouter,
  agents:   agentsRouter,
  billing:  billingRouter,
})

export type AppRouter = typeof appRouter
