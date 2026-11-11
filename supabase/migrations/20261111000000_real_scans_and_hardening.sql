-- Real scan results: citations, competitor detection, scan run log
alter table public.mentions
  add column if not exists citations jsonb not null default '[]'::jsonb,
  add column if not exists competitor_mentions jsonb not null default '{}'::jsonb;

alter table public.brands add column if not exists last_scanned_at timestamptz;

create table if not exists public.scan_runs (
  id          uuid primary key default gen_random_uuid(),
  brand_id    uuid not null references public.brands(id) on delete cascade,
  trigger     text not null default 'manual',
  engines     text[] not null default '{}',
  results     int not null default 0,
  mentioned   int not null default 0,
  failures    jsonb not null default '[]'::jsonb,
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists scan_runs_brand_idx on public.scan_runs(brand_id, started_at desc);
alter table public.scan_runs enable row level security;
drop policy if exists scan_runs_own on public.scan_runs;
create policy scan_runs_own on public.scan_runs for all to authenticated
  using (brand_id in (select id from public.brands where user_id = auth.uid()))
  with check (brand_id in (select id from public.brands where user_id = auth.uid()));

-- Users must not be able to change their own plan or billing fields.
revoke all on public.users from anon;
revoke insert, update on public.users from authenticated;
grant insert (id, email, name, avatar_url) on public.users to authenticated;
grant update (name, avatar_url, notif_scan_complete, notif_weekly_report, notif_sentiment_alerts, updated_at) on public.users to authenticated;

-- Public share reports: replace table-wide anon SELECT (which exposed every
-- brand and every answer to anyone with the anon key) with a slug lookup.
drop policy if exists brands_public_share_read on public.brands;
drop policy if exists mentions_public_share_read on public.mentions;

create or replace function public.public_share_report(p_slug text, p_days int default 30)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'brand', jsonb_build_object('name', b.name, 'domain', b.domain, 'keywords', b.keywords, 'competitors', b.competitors),
    'mentions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'engine', m.engine, 'prompt', m.prompt, 'mentioned', m.mentioned, 'sentiment', m.sentiment,
        'score', m.score, 'scraped_at', m.scraped_at, 'response_text', m.response_text, 'cited_url', m.cited_url
      ) order by m.scraped_at desc)
      from (
        select * from public.mentions
        where brand_id = b.id and scraped_at >= now() - make_interval(days => least(greatest(p_days, 1), 90))
        order by scraped_at desc limit 500
      ) m
    ), '[]'::jsonb)
  )
  from public.brands b
  where b.share_slug = p_slug and p_slug is not null and length(p_slug) >= 6
$$;
revoke all on function public.public_share_report(text, int) from public;
grant execute on function public.public_share_report(text, int) to anon, authenticated;
