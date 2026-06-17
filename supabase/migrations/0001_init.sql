-- ============================================================
-- Clouts.com — Supabase Schema
-- Run via: supabase db push  OR  drizzle-kit migrate
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ─── USERS ──────────────────────────────────────────────────
create table users (
  id            uuid primary key default uuid_generate_v4(),
  email         text unique not null,
  name          text,
  avatar_url    text,
  plan          text not null default 'free', -- free | pro | team
  stripe_customer_id  text unique,
  stripe_subscription_id text unique,
  plan_expires_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── BRANDS ─────────────────────────────────────────────────
-- A user can track multiple brands / domains
create table brands (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references users(id) on delete cascade,
  name          text not null,
  domain        text not null,
  logo_url      text,
  keywords      text[] default '{}',
  competitors   text[] default '{}',
  is_default    boolean default false,
  created_at    timestamptz not null default now()
);

-- ─── AI ENGINE MENTIONS ─────────────────────────────────────
create table mentions (
  id            uuid primary key default uuid_generate_v4(),
  brand_id      uuid not null references brands(id) on delete cascade,
  engine        text not null, -- chatgpt | perplexity | gemini | claude | grok | copilot | metaai | deepseek | aio
  prompt        text not null,
  response_text text not null,
  mentioned     boolean not null default false,
  sentiment     text, -- positive | neutral | negative
  position      int,  -- rank in response (1 = first mention)
  cited_url     text,
  score         int,  -- 0–100 visibility score
  embedding     vector(1536),
  scraped_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index mentions_brand_id_idx on mentions(brand_id);
create index mentions_engine_idx on mentions(engine);
create index mentions_scraped_at_idx on mentions(scraped_at desc);
create index mentions_embedding_idx on mentions using ivfflat (embedding vector_cosine_ops);

-- ─── PROMPT VOLUMES ─────────────────────────────────────────
create table prompt_volumes (
  id            uuid primary key default uuid_generate_v4(),
  brand_id      uuid not null references brands(id) on delete cascade,
  query         text not null,
  category      text,
  estimated_volume int,
  engines       text[] default '{}',
  opportunity_score int,
  date          date not null default current_date,
  created_at    timestamptz not null default now()
);

-- ─── AGENTS ─────────────────────────────────────────────────
create table agents (
  id            uuid primary key default uuid_generate_v4(),
  brand_id      uuid not null references brands(id) on delete cascade,
  name          text not null,
  type          text not null, -- aeo | content | pr | shopping
  status        text not null default 'idle', -- idle | running | completed | failed
  config        jsonb default '{}',
  last_run_at   timestamptz,
  next_run_at   timestamptz,
  created_at    timestamptz not null default now()
);

create table agent_runs (
  id            uuid primary key default uuid_generate_v4(),
  agent_id      uuid not null references agents(id) on delete cascade,
  status        text not null default 'running',
  input         jsonb,
  output        jsonb,
  error         text,
  duration_ms   int,
  started_at    timestamptz not null default now(),
  completed_at  timestamptz
);

-- ─── CLIPS ──────────────────────────────────────────────────
create table clips (
  id            uuid primary key default uuid_generate_v4(),
  brand_id      uuid not null references brands(id) on delete cascade,
  mention_id    uuid references mentions(id) on delete set null,
  title         text not null,
  description   text,
  status        text not null default 'processing', -- processing | ready | published | failed
  source_url    text,          -- original video URL
  mux_asset_id  text,          -- Mux asset ID
  mux_playback_id text,        -- Mux playback ID
  r2_key        text,          -- Cloudflare R2 storage key
  duration_sec  int,
  start_sec     int default 0,
  end_sec       int,
  format        text default '16:9', -- 16:9 | 9:16 | 1:1
  captions_url  text,
  thumbnail_url text,
  has_captions  boolean default false,
  has_branding  boolean default true,
  tags          text[] default '{}',
  views         int default 0,
  created_at    timestamptz not null default now(),
  published_at  timestamptz
);

create index clips_brand_id_idx on clips(brand_id);
create index clips_status_idx on clips(status);

-- ─── CLIP PUBLISHES ─────────────────────────────────────────
create table clip_publishes (
  id            uuid primary key default uuid_generate_v4(),
  clip_id       uuid not null references clips(id) on delete cascade,
  platform      text not null, -- tiktok | instagram | youtube | linkedin | twitter
  platform_post_id text,
  status        text not null default 'queued', -- queued | published | failed
  published_at  timestamptz,
  views         int default 0,
  likes         int default 0,
  shares        int default 0,
  created_at    timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table users enable row level security;
alter table brands enable row level security;
alter table mentions enable row level security;
alter table prompt_volumes enable row level security;
alter table agents enable row level security;
alter table agent_runs enable row level security;
alter table clips enable row level security;
alter table clip_publishes enable row level security;

-- Users can only see their own data
create policy "users_own" on users for all using (auth.uid() = id);
create policy "brands_own" on brands for all using (auth.uid() = user_id);
create policy "mentions_own" on mentions for all using (
  brand_id in (select id from brands where user_id = auth.uid())
);
create policy "prompt_volumes_own" on prompt_volumes for all using (
  brand_id in (select id from brands where user_id = auth.uid())
);
create policy "agents_own" on agents for all using (
  brand_id in (select id from brands where user_id = auth.uid())
);
create policy "agent_runs_own" on agent_runs for all using (
  agent_id in (select id from agents where brand_id in (
    select id from brands where user_id = auth.uid()
  ))
);
create policy "clips_own" on clips for all using (
  brand_id in (select id from brands where user_id = auth.uid())
);
create policy "clip_publishes_own" on clip_publishes for all using (
  clip_id in (select id from clips where brand_id in (
    select id from brands where user_id = auth.uid()
  ))
);
