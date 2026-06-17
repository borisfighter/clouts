# Clouts.com

AI Visibility + Content Clipping platform.

## Stack

| Layer      | Tech                                              |
|------------|---------------------------------------------------|
| Frontend   | Next.js 14, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend    | Vercel Edge, tRPC, NextAuth v5, Zod               |
| Database   | Supabase (Postgres + RLS), Drizzle ORM, pgvector  |
| Cache      | Upstash Redis + QStash                            |
| AI         | Anthropic Claude, OpenAI, Vercel AI SDK           |
| Scraping   | BrightData                                        |
| Media      | FFmpeg WASM, Mux, Cloudflare R2, AssemblyAI       |
| Email      | Resend + React Email, Loops                       |
| Jobs       | Inngest (background), Vercel Cron                 |
| Payments   | Stripe                                            |
| Monitoring | Sentry, PostHog, Axiom, Checkly                   |

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/clouts.git
cd clouts
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
# Fill in all values — see .env.example for full list
```

### 3. Supabase

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local Supabase
supabase start

# Run migrations
supabase db push
# OR
npm run db:push
```

### 4. Database

```bash
# Generate types from schema
npm run db:generate

# Push schema to DB
npm run db:push

# Seed with sample data
npm run db:seed

# Open Drizzle Studio (DB GUI)
npm run db:studio
```

### 5. Run dev

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Inngest dev server (background jobs)
npm run inngest:dev

# Terminal 3 — Email previews
npm run email:dev
```

## Project Structure

```
clouts/
├── src/
│   ├── app/
│   │   ├── marketing/          # Landing, pricing, blog (public)
│   │   ├── auth/               # Login, signup pages
│   │   ├── dashboard/          # Protected app pages
│   │   │   ├── visibility/     # AI mention tracking
│   │   │   ├── clips/          # Clip library + publish queue
│   │   │   ├── agents/         # Marketing agents
│   │   │   ├── analytics/      # Agent analytics
│   │   │   └── settings/       # Account, billing, brand setup
│   │   └── api/
│   │       ├── trpc/           # tRPC handler
│   │       ├── webhooks/       # Stripe, Inngest webhooks
│   │       ├── clips/          # Clip upload endpoint
│   │       └── scrape/         # Manual scrape trigger
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── marketing/          # Landing page sections
│   │   ├── dashboard/          # Dashboard shell, nav, cards
│   │   ├── clips/              # Clip studio, timeline, player
│   │   └── agents/             # Agent builder UI
│   ├── lib/
│   │   ├── db/                 # Drizzle schema + client
│   │   ├── ai/                 # Claude/OpenAI wrappers + agents
│   │   ├── clips/              # FFmpeg WASM + clip utils
│   │   ├── email/              # Resend helpers
│   │   ├── scraper/            # BrightData AI engine scraper
│   │   └── stripe/             # Stripe client + helpers
│   ├── server/
│   │   ├── trpc.ts             # tRPC init + middleware
│   │   └── routers/            # brands, mentions, clips, agents, billing
│   ├── hooks/                  # React hooks (useClips, useMentions…)
│   ├── types/                  # Global TypeScript types
│   └── emails/                 # React Email templates
├── jobs/
│   └── inngest.ts              # All background job definitions
├── supabase/
│   ├── migrations/             # SQL migration files
│   └── seed/                   # Seed data scripts
├── scripts/
│   └── seed.ts                 # DB seed script
├── .env.example
├── drizzle.config.ts
├── next.config.ts
└── tsconfig.json
```

## Key Features

### AI Visibility (Profound clone)
- Scrape ChatGPT, Perplexity, Gemini, Claude, Grok every hour via Inngest cron
- Store mentions with embeddings in pgvector for semantic search
- Visibility score (0–100) per engine per brand
- Prompt volume intelligence via BrightData

### Clips (Vyro/Plaform-style)
- Upload any video → auto-clip notable moments
- Browser-side trim with FFmpeg WASM (no server roundtrip)
- Upload to Mux for HLS playback
- AssemblyAI for auto captions
- Export in 9:16, 1:1, 16:9
- Publish queue to TikTok, Instagram, YouTube, LinkedIn

### Marketing Agents
- AEO Agent — rewrites content to rank in AI answers
- Content Agent — generates AEO-optimized FAQs and articles
- PR Agent — monitors sentiment, drafts press responses

## Deployment

```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# or via CLI:
vercel env add ANTHROPIC_API_KEY production
```

## Stripe Plans

| Plan  | Price         | Limits                          |
|-------|---------------|---------------------------------|
| Free  | $0/mo         | 1 brand, 100 mentions/mo        |
| Pro   | $79/mo        | 5 brands, 10K mentions/mo, clips |
| Team  | $299/mo       | Unlimited brands, agents, clips |
