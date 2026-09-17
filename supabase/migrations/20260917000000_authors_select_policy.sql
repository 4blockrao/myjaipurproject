-- `authors` had RLS enabled (relrowsecurity=true) but zero policies at all
-- (confirmed via pg_policies, empty) - in Postgres that's default-deny for
-- every role except a superuser/service-role connection. This was invisible
-- all along because nothing tried to read the table client-side before the
-- author-onboarding work in this migration series; the first real author's
-- own client-side lookup of her own row (added to CreateNewsArticle.tsx to
-- resolve auth.uid() -> authors.id for the FK-repointed author_id column)
-- surfaced it immediately: "No author profile is linked to your account".
--
-- Author bios are public-facing content by nature (meant to appear as
-- bylines on published articles), so a public SELECT policy is the correct
-- fix, not a narrower "view own row" one - same pattern as the existing
-- "Anyone can view published news" policy elsewhere in this schema.
--
-- Already applied directly to production and verified (2026-09-17) via
-- supabase db query --linked; this file exists so git matches reality,
-- same reasoning as the other out-of-band-applied migrations this session.

CREATE POLICY "Anyone can view authors"
ON public.authors FOR SELECT
USING (true);
