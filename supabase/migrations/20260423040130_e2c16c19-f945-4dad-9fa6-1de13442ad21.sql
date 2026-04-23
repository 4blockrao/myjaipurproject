CREATE POLICY "Anyone can view published IPL campaign articles"
ON public.articles
FOR SELECT
USING (
  status = 'published'
  AND campaign_slug = 'ipl-2026'
  AND article_type IN ('pillar', 'cluster', 'news_flash')
);