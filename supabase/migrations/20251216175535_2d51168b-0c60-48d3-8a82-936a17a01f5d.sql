-- Create enum for news categories
CREATE TYPE public.news_category AS ENUM ('city', 'events', 'food', 'culture', 'business', 'sports');

-- Create enum for article status
CREATE TYPE public.article_status AS ENUM ('draft', 'published', 'archived');

-- Create news_articles table
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  
  -- Categorization
  category news_category NOT NULL DEFAULT 'city',
  tags TEXT[] DEFAULT '{}',
  locality TEXT,
  
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  canonical_url TEXT,
  og_image TEXT,
  
  -- Structured data for Google Discovery
  structured_data JSONB DEFAULT '{}',
  
  -- Status and moderation
  status article_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for SEO and performance
CREATE INDEX idx_news_articles_slug ON public.news_articles(slug);
CREATE INDEX idx_news_articles_category ON public.news_articles(category);
CREATE INDEX idx_news_articles_status ON public.news_articles(status);
CREATE INDEX idx_news_articles_published_at ON public.news_articles(published_at DESC);
CREATE INDEX idx_news_articles_featured ON public.news_articles(is_featured) WHERE is_featured = true;

-- Enable RLS
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view published articles
CREATE POLICY "Anyone can view published news"
ON public.news_articles
FOR SELECT
USING (status = 'published');

-- Authors can view their own drafts
CREATE POLICY "Authors can view own articles"
ON public.news_articles
FOR SELECT
USING (auth.uid() = author_id);

-- Authenticated users can create articles
CREATE POLICY "Authenticated users can create articles"
ON public.news_articles
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own articles
CREATE POLICY "Authors can update own articles"
ON public.news_articles
FOR UPDATE
USING (auth.uid() = author_id);

-- Authors can delete their own drafts only
CREATE POLICY "Authors can delete own drafts"
ON public.news_articles
FOR DELETE
USING (auth.uid() = author_id AND status = 'draft');

-- Create news_likes table for tracking likes
CREATE TABLE public.news_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(article_id, user_id)
);

ALTER TABLE public.news_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view news likes"
ON public.news_likes FOR SELECT USING (true);

CREATE POLICY "Users can manage own likes"
ON public.news_likes FOR ALL USING (auth.uid() = user_id);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_news_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase and replace spaces with hyphens
  base_slug := LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Add timestamp for uniqueness
  final_slug := base_slug || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER;
  
  RETURN final_slug;
END;
$$;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.news_articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_news_article_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_news_articles_timestamp
BEFORE UPDATE ON public.news_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_news_article_timestamp();