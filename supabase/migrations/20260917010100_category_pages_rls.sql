-- RLS for category_pages - same shape as the articles/news_articles
-- policies already live, with the one deliberate difference: no
-- auto-publish carve-out. None of these 24 categories are time-sensitive
-- the way news_flash/weather content is, so self-publish is never allowed
-- here regardless of category - draft is always available to an author,
-- publishing always requires an admin.
--
-- Reuses current_author_id() and has_role() directly - no new helper
-- functions needed, both already exist from the author-role migrations.

CREATE POLICY "Anyone can view published category pages"
ON public.category_pages FOR SELECT
USING (status = 'published');

CREATE POLICY "Authors can view own draft category pages"
ON public.category_pages FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR author_id = public.current_author_id()
);

CREATE POLICY "Authors and admins can create category pages"
ON public.category_pages FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR (
    public.has_role(auth.uid(), 'author')
    AND author_id = public.current_author_id()
    AND author_id IS NOT NULL
    AND status = 'draft'
  )
);

CREATE POLICY "Authors update own drafts, admins update any"
ON public.category_pages FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR author_id = public.current_author_id()
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR (
    author_id = public.current_author_id()
    AND status = 'draft'
  )
);

CREATE POLICY "Authors can delete own drafts"
ON public.category_pages FOR DELETE
TO authenticated
USING (
  author_id = public.current_author_id()
  AND status = 'draft'
);
