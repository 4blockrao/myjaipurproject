-- Add gallery_images column to deals table for multiple image support
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS gallery_images TEXT[];

-- Add locality column to merchants table (make it required for new entries via application logic)
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS locality TEXT;

-- Add slug column to merchants for SEO-friendly URLs
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for merchant slugs
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON public.merchants(slug);

-- Create index for merchant locality
CREATE INDEX IF NOT EXISTS idx_merchants_locality ON public.merchants(locality);

-- Create index for deals location (locality)
CREATE INDEX IF NOT EXISTS idx_deals_location ON public.deals(location);