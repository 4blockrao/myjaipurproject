-- Links `authors` (real editorial profiles: name/bio/avatar/expertise) to a
-- login account, and repoints `articles.author_id` / `news_articles.author_id`
-- from auth.users(id) to authors(id) so an "author" is a real editorial
-- profile, not a bare account ID.
--
-- Investigation context (2026-09-15 audit), not asserted, verified:
--   - `authors` currently has no column linking a row to a login account.
--   - `news_articles.author_id UUID REFERENCES auth.users(id)` is confirmed
--     directly in migration 20251216175535_...sql:10.
--   - `articles.author_id`'s constraint is NOT in any local migration (the
--     table's CREATE TABLE itself isn't versioned here — same live-DB-only
--     drift pattern found elsewhere in this project). PostgREST relationship
--     probing ruled out `authors` and `profiles` as the current target
--     (both returned "no relationship found", calibrated against the known
--     news_articles->auth.users case, which fails the same way). Most likely
--     also auth.users, by pattern, but not proven — the DO block below
--     handles "FK points to something else" and "no FK constraint at all"
--     the same way: drop whatever's there by looking it up, don't assume a
--     specific constraint name.
--   - Anon-key row sampling (RLS-filtered, NOT a full count) found exactly
--     one non-null `articles.author_id` value, '5e486de0-425c-4a2c-9305-
--     21b6f670a90a', shared across 3 rows, shaped like an auth.users id with
--     no corresponding row in any public-schema table. `news_articles`
--     showed all-NULL in the same limited sample.
--   - Because that sampling is known incomplete (RLS hides rows from the
--     anon key elsewhere in this schema), the backfill below is written
--     generically (null out anything that won't satisfy the new FK) rather
--     than targeting that one specific UUID, so it's correct regardless of
--     how many rows actually exist beyond what was visible during audit.

-- 1. Give `authors` a way to link to a login account.
ALTER TABLE public.authors
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.authors
  ADD CONSTRAINT authors_user_id_key UNIQUE (user_id);

-- 2. Backfill: null out any author_id that won't satisfy a FK to authors(id).
--    Safe/idempotent - matches zero rows once the FK below is in place and
--    all author_id values are either NULL or valid authors.id references.
UPDATE public.articles
SET author_id = NULL
WHERE author_id IS NOT NULL
  AND author_id NOT IN (SELECT id FROM public.authors);

UPDATE public.news_articles
SET author_id = NULL
WHERE author_id IS NOT NULL
  AND author_id NOT IN (SELECT id FROM public.authors);

-- 3. Drop whatever FK currently exists on each author_id column, by looking
--    it up rather than assuming a name - `articles`'s constraint name is
--    unknown (table not in local migration history), and guessing wrong
--    would fail the migration outright instead of fixing the schema.
DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'articles'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'author_id';

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.articles DROP CONSTRAINT %I', fk_name);
  END IF;
END $$;

DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
   AND tc.table_schema = kcu.table_schema
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'news_articles'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'author_id';

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.news_articles DROP CONSTRAINT %I', fk_name);
  END IF;
END $$;

-- 4. Point both at authors(id) instead.
ALTER TABLE public.articles
  ADD CONSTRAINT articles_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE SET NULL;

ALTER TABLE public.news_articles
  ADD CONSTRAINT news_articles_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE SET NULL;
