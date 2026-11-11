-- Prompt volumes now come from Google Ads data (DataForSEO). Rows created by
-- the old client-side estimator were invented numbers, so remove them.
delete from public.prompt_volumes;
alter table public.prompt_volumes
  add column if not exists cpc numeric,
  add column if not exists competition int,
  add column if not exists trend text,
  add column if not exists monthly jsonb not null default '[]'::jsonb,
  add column if not exists source text,
  add column if not exists updated_at timestamptz not null default now();
create unique index if not exists prompt_volumes_brand_query_uidx on public.prompt_volumes(brand_id, query);
