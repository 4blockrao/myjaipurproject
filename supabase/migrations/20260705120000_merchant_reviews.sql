-- Phase 1: Verified merchant reviews
-- Real per-review rows (replacing the fabricated total_reviews/avg_rating scalars),
-- publish-all policy, verified-visit flag, and automatic aggregate recompute.

create table if not exists public.merchant_reviews (
  id            uuid primary key default gen_random_uuid(),
  merchant_id   uuid not null references public.merchants(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  rating        smallint not null check (rating between 1 and 5),
  reviewer_name text,                                      -- denormalized so names show to logged-out visitors
  title         text,
  body          text,
  photos        text[] not null default '{}',
  is_verified   boolean not null default false,          -- true once tied to a real visit/redemption
  status        text not null default 'published'
                  check (status in ('published','flagged','removed')),
  helpful_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (merchant_id, user_id)                            -- one review per user per merchant
);

create index if not exists idx_merchant_reviews_merchant on public.merchant_reviews (merchant_id, status);
create index if not exists idx_merchant_reviews_user     on public.merchant_reviews (user_id);

alter table public.merchant_reviews enable row level security;

-- Public can read published reviews (publish-all: negatives included, never hidden by merchants)
drop policy if exists "read published merchant reviews" on public.merchant_reviews;
create policy "read published merchant reviews"
  on public.merchant_reviews for select
  using (status = 'published');

-- Authenticated users manage only their own review
drop policy if exists "insert own merchant review" on public.merchant_reviews;
create policy "insert own merchant review"
  on public.merchant_reviews for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "update own merchant review" on public.merchant_reviews;
create policy "update own merchant review"
  on public.merchant_reviews for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own merchant review" on public.merchant_reviews;
create policy "delete own merchant review"
  on public.merchant_reviews for delete to authenticated
  using (auth.uid() = user_id);

-- Admins moderate (only action available to a business/admin: flag/remove spam — not hide negatives)
drop policy if exists "admins manage merchant reviews" on public.merchant_reviews;
create policy "admins manage merchant reviews"
  on public.merchant_reviews for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---- Aggregate recompute (keeps merchants.total_reviews / average_rating / avg_rating truthful) ----
create or replace function public.recompute_merchant_rating(_merchant_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.merchants m
     set total_reviews  = agg.cnt,
         average_rating = agg.avg_r,
         avg_rating     = agg.avg_r
    from (
      select count(*)::int as cnt,
             coalesce(round(avg(rating)::numeric, 1), 0) as avg_r
        from public.merchant_reviews
       where merchant_id = _merchant_id and status = 'published'
    ) agg
   where m.id = _merchant_id;
$$;

create or replace function public.trg_merchant_reviews_aggregate()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_merchant_rating(old.merchant_id);
    return old;
  end if;
  perform public.recompute_merchant_rating(new.merchant_id);
  if tg_op = 'UPDATE' and new.merchant_id <> old.merchant_id then
    perform public.recompute_merchant_rating(old.merchant_id);
  end if;
  return new;
end;
$$;

drop trigger if exists merchant_reviews_aggregate on public.merchant_reviews;
create trigger merchant_reviews_aggregate
  after insert or update or delete on public.merchant_reviews
  for each row execute function public.trg_merchant_reviews_aggregate();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists merchant_reviews_set_updated_at on public.merchant_reviews;
create trigger merchant_reviews_set_updated_at
  before update on public.merchant_reviews
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- HONESTY RESET (optional): the current total_reviews / avg_rating on merchants
-- are fabricated seed values (e.g. "128 reviews, 4.2★" with zero real rows).
-- Showing verified reviews alongside fake counts undermines the whole trust play.
-- This zeroes the scalars for merchants that have no real reviews yet; real
-- reviews repopulate them via the trigger above.
-- Comment this block out if you'd rather keep the seed numbers for now.
update public.merchants
   set total_reviews = 0, average_rating = 0, avg_rating = 0
 where not exists (
   select 1 from public.merchant_reviews r where r.merchant_id = merchants.id
 );
