# Clouts.com — Claude Code Instructions

## What this project is
Clouts.com is a SaaS platform combining:
1. **AI Visibility / AEO** — monitor how brands appear in ChatGPT, Perplexity, Gemini, Claude, Grok, Copilot, Meta AI, DeepSeek, Google AIO. Inspired by tryprofound.com.
2. **Content Clipping** — auto-clip video moments into viral short-form content (9:16, 1:1, 16:9). Similar to Vyro and Plaform. Built as a side feature inside the same dashboard.

## Stack (do not deviate from these)
- **Framework**: Next.js 14 App Router + React Server Components
- **Styling**: Tailwind CSS + shadcn/ui components only (no other UI libs)
- **API**: tRPC v11 with superjson transformer
- **Auth**: NextAuth v5 (Auth.js)
- **DB**: Supabase (Postgres) via Drizzle ORM — schema in `src/lib/db/schema.ts`
- **Cache**: Upstash Redis
- **AI**: Anthropic Claude (`@ai-sdk/anthropic`) + Vercel AI SDK for streaming
- **Background jobs**: Inngest — all jobs defined in `jobs/inngest.ts`
- **Video**: Mux for playback, FFmpeg WASM for browser-side trimming, AssemblyAI for captions
- **Storage**: Cloudflare R2
- **Email**: Resend + React Email templates in `src/emails/`
- **Payments**: Stripe
- **Monitoring**: Sentry, PostHog, Axiom

## Commands
```bash
npm run dev          # Next.js dev server (localhost:3000)
npm run inngest:dev  # Inngest dev server (localhost:8288) — run alongside dev
npm run email:dev    # React Email preview (localhost:3001)
npm run db:push      # Push Drizzle schema to Supabase
npm run db:studio    # Drizzle Studio GUI
npm run type-check   # tsc --noEmit
npm run lint         # ESLint
```

## Project structure
```
src/
  app/
    marketing/        # Public landing pages (page.tsx = homepage clone of tryprofound.com)
    auth/             # login/ signup/ — NextAuth pages
    dashboard/        # Protected app (layout.tsx has sidebar + auth guard)
      visibility/     # AI mention tracking dashboard
      clips/          # Clip library (library/) and publish queue (publish/)
      agents/         # Marketing agent builder
      analytics/      # Agent bot analytics
      settings/       # Account, billing, brand setup
    api/
      trpc/           # tRPC handler — route.ts
      webhooks/
        stripe/       # Stripe webhook handler
        inngest/      # Inngest webhook handler
      clips/          # Direct clip upload endpoint
      scrape/         # Manual scrape trigger
  components/
    ui/               # shadcn/ui base components ONLY — do not modify
    marketing/        # Landing page sections
    dashboard/        # Shell, sidebar, topbar, cards
    clips/            # ClipStudio, Timeline, ClipPlayer, FormatPicker
    agents/           # AgentBuilder, AgentCard, RunLog
  lib/
    db/               # index.ts (Drizzle client) + schema.ts
    ai/
      agents/         # aeo.ts | content.ts | pr.ts | shopping.ts
      scraper.ts      # BrightData AI engine scraper
      embeddings.ts   # OpenAI embeddings + pgvector search
    clips/
      ffmpeg.ts       # FFmpeg WASM browser clip processing
      mux.ts          # Mux upload + playback helpers
      captions.ts     # AssemblyAI caption generation
    email/            # Resend send helpers
    stripe/           # Stripe client + plan helpers
    scraper/          # AI engine scraping logic per engine
  server/
    trpc.ts           # tRPC init + auth middleware
    routers/
      index.ts        # Root router (combines all)
      brands.ts       # CRUD for brand tracking
      mentions.ts     # Mention queries + visibility scores
      clips.ts        # Clip CRUD + publish queue
      agents.ts       # Agent CRUD + run trigger
      billing.ts      # Stripe subscription management
  hooks/              # useClips, useMentions, useAgent, useBrand
  types/              # Global TS types
  emails/             # React Email templates
jobs/
  inngest.ts          # All Inngest functions (processClip, scrapeMentions, runAgent, hourlyScrape)
supabase/
  migrations/         # SQL migration files
```

## Coding conventions
- **TypeScript strict mode** — no `any`, no `as unknown`
- **Server vs Client**: default to Server Components. Add `'use client'` only when needed (useState, useEffect, browser APIs)
- **Data fetching**: server components call db directly via Drizzle. Client components use tRPC hooks.
- **Forms**: use `react-hook-form` + `zod` resolver
- **Error handling**: tRPC procedures throw `TRPCError`. UI catches with `onError` in tRPC hooks.
- **Naming**: files = kebab-case. Components = PascalCase. Functions = camelCase.
- **Imports**: always use `@/` path alias, never relative `../`
- **No inline styles** — Tailwind classes only
- **shadcn/ui**: install components with `npx shadcn@latest add <component>`, never copy-paste manually

## Database rules
- All schema changes go in `src/lib/db/schema.ts` first, then `npm run db:push`
- Never write raw SQL in application code — use Drizzle query builder
- Every table has RLS enabled in Supabase — always filter by `userId` or via brand ownership
- Use `db.select().from(table).where(eq(table.userId, session.user.id))` pattern

## AI / scraping notes
- Anthropic Claude is the primary agent model: `claude-sonnet-4-6`
- BrightData handles scraping ChatGPT, Perplexity, Gemini etc. — never scrape directly
- Store embeddings in `mentions.embedding` (pgvector, 1536 dims via OpenAI `text-embedding-3-small`)
- Inngest handles ALL async work — never use `setTimeout` or fire-and-forget promises

## Clips feature notes
- FFmpeg WASM runs in the browser — no server-side video processing for trim/preview
- After trim, upload final clip to Cloudflare R2, then create Mux asset from R2 URL
- AssemblyAI generates SRT captions, stored in R2, URL saved to `clips.captions_url`
- Supported export formats: 9:16 (TikTok/Reels), 1:1 (Instagram feed), 16:9 (YouTube)
- Publish queue processes via Inngest `clip/publish` event

## Environment variables
All required vars are in `.env.example`. Copy to `.env.local` and fill in.
Never commit `.env.local`. Never hardcode secrets.

## Co-founders
- **Kseniya** — product, strategy, outreach (deals@kumbaya.com)
- **Boris** — engineering lead (kreimanchess@gmail.com)

## Current build priority
1. `src/app/marketing/page.tsx` — homepage (clone tryprofound.com layout + clips section)
2. `src/app/dashboard/layout.tsx` — dashboard shell with sidebar
3. `src/app/dashboard/visibility/page.tsx` — AI mention tracking page
4. `src/app/dashboard/clips/page.tsx` — clip library page
5. `src/server/routers/brands.ts` — brands CRUD router
6. `src/server/routers/mentions.ts` — mentions router with visibility scores
7. `src/lib/scraper/` — AI engine scrapers (start with Perplexity)
8. `jobs/inngest.ts` — clip processing job (already scaffolded, needs FFmpeg + Mux wired)
