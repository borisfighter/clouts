import { router, protectedProcedure } from '../trpc'

export const clipsRouter = router({
  list: protectedProcedure.query(() => []),
})
