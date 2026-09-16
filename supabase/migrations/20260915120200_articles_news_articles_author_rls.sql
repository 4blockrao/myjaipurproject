-- Closes the open-write gap on `news_articles` (any authenticated user can
-- currently INSERT with status='published' directly - confirmed via the
-- existing "Authenticated users can create articles" policy, which only
-- checks auth.uid() = author_id, no role, no status restriction) and adds
-- equivalent, review-gated access to `articles` (which currently has no
-- INSERT policy for regular users at all).
--
-- Review-gate design: an 'author'-role user may INSERT/UPDATE as their own
-- draft freely, and may self-publish ONLY when article_type = 'news_flash'
-- (short-lived, low-stakes updates). Everything else requires an admin to
-- move status to 'published'. Reasoning: evergreen/high-stakes content
-- (guides, pillars, stories) sits indexed for months, so an unreviewed
-- factual error there costs more than the latency of a review step; a
-- weather/traffic news_flash is short-lived and self-correcting, so the
-- review step mostly adds latency without much safety benefit. This is
-- argued on its own merits, not from project history - see the "retracted
-- claim" note in the accompanying report for why no historical precedent is
-- cited here.
--
-- IMPORTANT SIDE EFFECT of the previous migration
-- (20260915120100_authors_user_id_and_author_id_fk.sql): repointing
-- author_id from auth.users(id) to authors(id) silently breaks any EXISTING
-- policy written as `auth.uid() = author_id`, because auth.uid() (a user's
-- login id) will never again equal author_id (now an authors.id). This
-- migration was only asked to add INSERT/UPDATE policies, but leaving the
-- pre-existing SELECT-own-drafts and DELETE-own-drafts policies on
-- news_articles silently dead (matching nothing, ever, without erroring) is
-- a regression this same change would otherwise introduce - so those two are
-- also updated here, not left broken. `articles` never had an own-drafts
-- SELECT policy at all; without one, an author couldn't read back their own
-- unpublished draft after creating it, so one is added for the same reason.

-- Reusable helper, same pattern as public.has_role(): resolve the calling
-- user's linked authors.id once, instead of repeating the subquery in every
-- policy below.
CREATE OR REPLACE FUNCTION public.current_author_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.authors WHERE user_id = auth.uid();
$$;

-- ============================================================
-- articles
-- ============================================================

DROP POLICY IF EXISTS "Authors can view own draft articles" ON public.articles;
CREATE POLICY "Authors can view own draft articles"
ON public.articles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR author_id = public.current_author_id()
);

DROP POLICY IF EXISTS "Authors and admins can create articles" ON public.articles;
CREATE POLICY "Authors and admins can create articles"
ON public.articles FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR (
    public.has_role(auth.uid(), 'author')
    AND author_id = public.current_author_id()
    AND author_id IS NOT NULL
    AND (
      status = 'draft'
      OR (status = 'published' AND article_type = 'news_flash')
    )
  )
);

DROP POLICY IF EXISTS "Authors can update own articles, admins update any" ON public.articles;
CREATE POLICY "Authors can update own articles, admins update any"
ON public.articles FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR author_id = public.current_author_id()
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR (
    author_id = public.current_author_id()
    AND (
      status = 'draft'
      OR (status = 'published' AND article_type = 'news_flash')
    )
  )
);

-- ============================================================
-- news_articles
-- ============================================================

-- CORRECTED 2026-09-16, verified via direct pg_policies query against the
-- live database (supabase db query --linked), not just the original
-- CREATE TABLE migration's text: live news_articles does NOT have the 4
-- separate named policies that migration 20251216175535 originally created
-- ("Authenticated users can create articles" / "Authors can update own
-- articles" / "Authors can view own articles" / "Authors can delete own
-- drafts"). At some point those were replaced, out-of-band, with a single
-- consolidated policy: "Authors can manage own news_articles" FOR ALL,
-- USING/WITH CHECK (auth.uid() = author_id) - same open gap, different
-- name. The 4 DROP POLICY IF EXISTS statements this file originally had
-- would have silently no-op'd against stale names, leaving that permissive
-- ALL policy fully active alongside the new restrictive ones below - since
-- RLS policies OR together, the actual gap this migration exists to close
-- would NOT have closed. Dropping the real one now.
DROP POLICY IF EXISTS "Authors can manage own news_articles" ON public.news_articles;
-- Kept as a no-op safety net in case the original 4-policy shape is what's
-- actually live in some environment this runs against - IF EXISTS makes
-- this harmless either way.
DROP POLICY IF EXISTS "Authenticated users can create articles" ON public.news_articles;
CREATE POLICY "Authors and admins can create news articles"
ON public.news_articles FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR (
    public.has_role(auth.uid(), 'author')
    AND author_id = public.current_author_id()
    AND author_id IS NOT NULL
    AND (
      status = 'draft'
      OR (status = 'published' AND lower(category) IN ('weather', 'local news'))
      -- CORRECTED 2026-09-15, was `category = 'city'` - that was wrong on
      -- two counts, checked against real data (11 rows, anon-key visible,
      -- so possibly incomplete) rather than left as a guess:
      --   1. Case: no live row has lower-case 'city' at all - the live
      --      value is 'City'. As originally written this branch could never
      --      match anything, so it wasn't unsafe, just dead - it would have
      --      silently forced every news_articles publish through review
      --      regardless of category, contrary to the stated design intent.
      --   2. Semantics: `category` is NOT actually constrained to the
      --      documented `news_category` enum ('city','events','food',
      --      'culture','business','sports') live - real values are
      --      'Business','City','Culture','Food','Health','Local News',
      --      'Sports','Travel','Weather', several of which (Local News,
      --      Weather, Travel, Health) aren't in that enum at all. Another
      --      instance of the schema-drift pattern found throughout this
      --      project - the enum in the original CREATE TABLE migration does
      --      not reflect what's actually live. The one 'City' row that
      --      exists ("Jaipur to Host International Literature Festival") is
      --      an evergreen-ish announcement, not the short-lived/low-stakes
      --      kind of update this carve-out is meant for. 'Weather'
      --      ("Rajasthan Heatwave Alert...") and 'Local News' ("Jaipur
      --      School Timings Changed... Amid Heatwave") are the two visible
      --      categories that actually match that intent.
      -- `lower(...)` guards against the exact casing drift that broke the
      -- original version. This is still a judgment call on a small,
      -- RLS-filtered (11-row) sample, not a guaranteed-complete taxonomy -
      -- worth a second look with full visibility before this ships. Getting
      -- it wrong is fail-safe in the direction that matters: any category
      -- not listed here simply falls through to `status = 'draft'`, i.e.
      -- requires admin review rather than silently allowing self-publish.
    )
  )
);

DROP POLICY IF EXISTS "Authors can update own articles" ON public.news_articles;
CREATE POLICY "Authors can update own articles, admins update any"
ON public.news_articles FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR author_id = public.current_author_id()
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR (
    author_id = public.current_author_id()
    AND (
      status = 'draft'
      OR (status = 'published' AND lower(category) IN ('weather', 'local news'))
      -- Same correction as the INSERT policy above - see that comment for
      -- why 'city' (and its casing) was wrong.
    )
  )
);

-- Fixes the auth.uid()-comparison bug the FK change would otherwise
-- silently introduce into these two pre-existing policies (see note above).
DROP POLICY IF EXISTS "Authors can view own articles" ON public.news_articles;
CREATE POLICY "Authors can view own articles"
ON public.news_articles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR author_id = public.current_author_id()
);

DROP POLICY IF EXISTS "Authors can delete own drafts" ON public.news_articles;
CREATE POLICY "Authors can delete own drafts"
ON public.news_articles FOR DELETE
TO authenticated
USING (
  author_id = public.current_author_id()
  AND status = 'draft'
);
