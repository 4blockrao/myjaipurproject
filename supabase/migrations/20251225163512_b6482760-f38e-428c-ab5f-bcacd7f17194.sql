-- Categories Table (Pillar + Subcategory Tree)
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_slug TEXT,
  pillar_slug TEXT NOT NULL,
  pillar_group TEXT,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  schema_type TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Category Locality Pages (Locality Scope Mappings)
CREATE TABLE public.category_locality_pages (
  id SERIAL PRIMARY KEY,
  category_slug TEXT NOT NULL,
  locality_slug TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_slug, locality_slug)
);

-- Real Estate Categories
CREATE TABLE public.real_estate_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  property_type TEXT,
  pillar_slug TEXT DEFAULT 'real-estate',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_locality_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.real_estate_categories ENABLE ROW LEVEL SECURITY;

-- Categories: Anyone can read, admins can manage
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Category Locality Pages: Anyone can read, admins can manage
CREATE POLICY "Anyone can view category locality pages"
  ON public.category_locality_pages FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage category locality pages"
  ON public.category_locality_pages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Real Estate Categories: Anyone can read, admins can manage
CREATE POLICY "Anyone can view real estate categories"
  ON public.real_estate_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage real estate categories"
  ON public.real_estate_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes for performance
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_slug ON public.categories(parent_slug);
CREATE INDEX idx_categories_pillar_slug ON public.categories(pillar_slug);
CREATE INDEX idx_categories_pillar_group ON public.categories(pillar_group);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);

CREATE INDEX idx_category_locality_pages_category ON public.category_locality_pages(category_slug);
CREATE INDEX idx_category_locality_pages_locality ON public.category_locality_pages(locality_slug);
CREATE INDEX idx_category_locality_pages_enabled ON public.category_locality_pages(is_enabled);

CREATE INDEX idx_real_estate_categories_slug ON public.real_estate_categories(slug);
CREATE INDEX idx_real_estate_categories_property_type ON public.real_estate_categories(property_type);
CREATE INDEX idx_real_estate_categories_active ON public.real_estate_categories(is_active);

-- Add updated_at triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_category_locality_pages_updated_at
  BEFORE UPDATE ON public.category_locality_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_real_estate_categories_updated_at
  BEFORE UPDATE ON public.real_estate_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();