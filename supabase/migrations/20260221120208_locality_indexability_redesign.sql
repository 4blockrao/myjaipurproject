-- Locality indexability redesign
-- Goal: Determine indexability based on locality quality signals (not events mapping).

begin;

-- 1) Add missing columns safely
alter table public.localities
  add column if not exists verification_status text,
  add column if not exists confidence_score numeric,
  add column if not exists seo_blurb text,
  add column if not exists content_quality_score integer,
  add column if not exists index_override text,
  add column if not exists should_index boolean;

-- 2) Constrain index_override values (soft + safe)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'localities_index_override_check'
  ) then
    alter table public.localities
      add constraint localities_index_override_check
      check (index_override is null or index_override in ('force_index','force_noindex'));
  end if;
end $$;

-- 3) Function: compute should_index from row values
create or replace function public.compute_locality_should_index(
  p_verification_status text,
  p_confidence_score numeric,
  p_seo_blurb text,
  p_content_quality_score integer,
  p_index_override text
)
returns boolean
language plpgsql
stable
as $$
declare
  v_blurb_len int := length(coalesce(p_seo_blurb, ''));
  v_conf numeric := coalesce(p_confidence_score, 0);
  v_quality int := coalesce(p_content_quality_score, 0);
  v_status text := lower(coalesce(p_verification_status, ''));
begin
  -- Override wins
  if p_index_override = 'force_noindex' then
    return false;
  end if;

  if p_index_override = 'force_index' then
    return true;
  end if;

  -- Quality-based signals (no event dependency)
  if v_status in ('verified','curated') then
    return true;
  end if;

  if v_conf >= 0.75 then
    return true;
  end if;

  if v_blurb_len >= 280 then
    return true;
  end if;

  if v_quality >= 60 then
    return true;
  end if;

  return false;
end $$;

-- 4) Trigger function to keep stored should_index updated
create or replace function public.localities_set_should_index()
returns trigger
language plpgsql
as $$
begin
  new.should_index :=
    public.compute_locality_should_index(
      new.verification_status,
      new.confidence_score,
      new.seo_blurb,
      new.content_quality_score,
      new.index_override
    );

  return new;
end $$;

-- 5) Trigger: run on inserts + relevant updates
do $$
begin
  if exists (
    select 1
    from pg_trigger
    where tgname = 'trg_localities_set_should_index'
  ) then
    drop trigger trg_localities_set_should_index on public.localities;
  end if;

  create trigger trg_localities_set_should_index
  before insert or update of verification_status, confidence_score, seo_blurb, content_quality_score, index_override
  on public.localities
  for each row
  execute function public.localities_set_should_index();
end $$;

-- 6) Backfill should_index for existing rows
update public.localities l
set should_index =
  public.compute_locality_should_index(
    l.verification_status,
    l.confidence_score,
    l.seo_blurb,
    l.content_quality_score,
    l.index_override
  )
where true;

-- 7) Optional: index for sitemap/SSR filters
create index if not exists localities_should_index_true_idx
  on public.localities (should_index)
  where should_index is true;

commit;
