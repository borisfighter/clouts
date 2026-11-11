-- A "source" is an uploaded video; AI-selected moments are "clip" rows cut from it.
alter table public.clips
  add column if not exists kind text not null default 'source',
  add column if not exists parent_id uuid references public.clips(id) on delete cascade,
  add column if not exists transcript_track_id text,
  add column if not exists captions_vtt text,
  add column if not exists error text;
do $$ begin
  alter table public.clips add constraint clips_kind_check check (kind in ('source', 'clip'));
exception when duplicate_object then null; end $$;
create index if not exists clips_parent_idx on public.clips(parent_id);
create index if not exists clips_mux_asset_idx on public.clips(mux_asset_id);
create index if not exists clips_mux_upload_idx on public.clips(mux_upload_id);
