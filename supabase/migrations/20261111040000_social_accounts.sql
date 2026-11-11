-- OAuth connections for direct publishing. Tokens are server-only: RLS on, no policies.
create table if not exists public.social_accounts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  provider      text not null,
  account_id    text,
  account_name  text,
  refresh_token text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, provider)
);
alter table public.social_accounts enable row level security;
revoke all on public.social_accounts from anon, authenticated;

alter table public.clip_publishes
  add column if not exists external_url text,
  add column if not exists error text;

-- Publish rows are written by the server after a real upload; users may only read theirs.
drop policy if exists "clip_publishes_own" on public.clip_publishes;
create policy "clip_publishes_read_own" on public.clip_publishes for select using (
  clip_id in (select id from public.clips where brand_id in (select id from public.brands where user_id = auth.uid()))
);
create policy "clip_publishes_delete_own" on public.clip_publishes for delete using (
  clip_id in (select id from public.clips where brand_id in (select id from public.brands where user_id = auth.uid()))
);
