-- Add slug column to deals table for SEO-friendly URLs
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_deals_slug ON public.deals(slug);

-- Create function to generate slugs from title
CREATE OR REPLACE FUNCTION generate_deal_slug(title TEXT, deal_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug: lowercase, replace spaces with dashes, remove special chars
  base_slug := LOWER(REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
  
  -- Truncate to reasonable length
  base_slug := LEFT(base_slug, 80);
  
  -- Remove trailing dashes
  base_slug := RTRIM(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.deals WHERE slug = final_slug AND id != deal_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_deal_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_deal_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_set_deal_slug ON public.deals;
CREATE TRIGGER trigger_set_deal_slug
  BEFORE INSERT OR UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION set_deal_slug();

-- Populate slugs for existing deals
UPDATE public.deals 
SET slug = generate_deal_slug(title, id) 
WHERE slug IS NULL;