ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'articles'
      AND policyname = 'Anyone can view published guide articles'
  ) THEN
    CREATE POLICY "Anyone can view published guide articles"
    ON public.articles
    FOR SELECT
    TO public
    USING (
      status = 'published'
      AND type = 'guide'
      AND COALESCE(is_evergreen, false) = true
    );
  END IF;
END $$;