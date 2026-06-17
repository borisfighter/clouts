import { router } from '../trpc'
import { clipsRouter } from './clips'

export const appRouter = router({
  clips: clipsRouter,
})

export type AppRouter = typeof appRouter
