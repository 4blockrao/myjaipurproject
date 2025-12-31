-- Add body_html column for pre-rendered HTML content (better for SEO)
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS body_html TEXT;

-- Add word_count for schema markup
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

-- Add reading_time_minutes for better UX
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 1;

-- Create index on slug for faster lookups (critical for SSR-like performance)
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON public.news_articles(slug);

-- Create index on category + status for filtered queries
CREATE INDEX IF NOT EXISTS idx_news_articles_category_status ON public.news_articles(category, status);

-- Create index on published_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON public.news_articles(published_at DESC);

-- Add comment explaining the purpose of body_html
COMMENT ON COLUMN public.news_articles.body_html IS 'Pre-rendered HTML content from markdown for SEO optimization. Rendered at publish time to avoid runtime conversion.';