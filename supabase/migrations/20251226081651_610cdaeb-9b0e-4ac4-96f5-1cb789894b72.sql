-- =====================================================
-- JAIPURCIRCLE KNOWLEDGE GRAPH FOUNDATION
-- Phase 1: Core Graph Infrastructure
-- =====================================================

-- 1️⃣ CREATE ZONES TABLE
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  locality_count INTEGER DEFAULT 0,
  description TEXT,
  geo_center_lat DECIMAL(10,6),
  geo_center_lng DECIMAL(10,6),
  meta JSONB DEFAULT '{}'::jsonb,
  confidence_score DECIMAL(3,2) DEFAULT 0.80,
  verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'community_submitted', 'needs_review')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on zones
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for zones (public read, admin write)
CREATE POLICY "Anyone can view zones" ON public.zones FOR SELECT USING (true);
CREATE POLICY "Admins can manage zones" ON public.zones FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 2️⃣ ADD ZONE_ID TO LOCALITIES + ENRICHMENT FIELDS
ALTER TABLE public.localities 
  ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES public.zones(id),
  ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 0.80,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'community_submitted', 'needs_review')),
  ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;

-- 3️⃣ ADD PARENT_ID TO CATEGORIES FOR TRUE HIERARCHY
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES public.categories(id),
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 0.90,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'verified';

-- 4️⃣ ENTITY → LOCALITY MAPPING TABLE
CREATE TABLE public.entity_locality_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('merchant', 'deal', 'event', 'news_article', 'product', 'landmark', 'poi')),
  locality_id INTEGER NOT NULL REFERENCES public.localities(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'located_in' CHECK (relation_type IN ('located_in', 'serves', 'headquartered_in', 'operates_in', 'mentioned_in')),
  is_primary BOOLEAN DEFAULT true,
  confidence_score DECIMAL(3,2) DEFAULT 0.80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(entity_id, entity_type, locality_id, relation_type)
);

-- Enable RLS on entity_locality_map
ALTER TABLE public.entity_locality_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view entity locality mappings" ON public.entity_locality_map FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage entity locality mappings" ON public.entity_locality_map FOR ALL USING (auth.role() = 'authenticated');

-- 5️⃣ ENTITY → CATEGORY MAPPING TABLE
CREATE TABLE public.entity_category_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('merchant', 'deal', 'event', 'news_article', 'product', 'landmark', 'poi')),
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'primary' CHECK (relation_type IN ('primary', 'secondary', 'related', 'tagged')),
  confidence_score DECIMAL(3,2) DEFAULT 0.80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(entity_id, entity_type, category_id, relation_type)
);

-- Enable RLS on entity_category_map
ALTER TABLE public.entity_category_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view entity category mappings" ON public.entity_category_map FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage entity category mappings" ON public.entity_category_map FOR ALL USING (auth.role() = 'authenticated');

-- 6️⃣ GENERIC ENTITY RELATIONSHIPS TABLE (Graph Edges)
CREATE TABLE public.entity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_entity_id UUID NOT NULL,
  source_entity_type TEXT NOT NULL,
  target_entity_id UUID,
  target_entity_type TEXT,
  target_locality_id INTEGER REFERENCES public.localities(id),
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'nearby', 'adjacent_to', 'serves', 'part_of', 'contains', 
    'similar_to', 'competes_with', 'partners_with', 'belongs_to',
    'located_near_landmark', 'connected_via', 'alternative_to'
  )),
  weight DECIMAL(3,2) DEFAULT 1.0,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on entity_relationships
ALTER TABLE public.entity_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view entity relationships" ON public.entity_relationships FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage entity relationships" ON public.entity_relationships FOR ALL USING (auth.role() = 'authenticated');

-- 7️⃣ CREATE INDEXES FOR GRAPH QUERIES
CREATE INDEX idx_localities_zone_id ON public.localities(zone_id);
CREATE INDEX idx_localities_zone_slug ON public.localities(zone);
CREATE INDEX idx_entity_locality_entity ON public.entity_locality_map(entity_id, entity_type);
CREATE INDEX idx_entity_locality_locality ON public.entity_locality_map(locality_id);
CREATE INDEX idx_entity_category_entity ON public.entity_category_map(entity_id, entity_type);
CREATE INDEX idx_entity_category_category ON public.entity_category_map(category_id);
CREATE INDEX idx_entity_rel_source ON public.entity_relationships(source_entity_id, source_entity_type);
CREATE INDEX idx_entity_rel_target ON public.entity_relationships(target_entity_id, target_entity_type);
CREATE INDEX idx_entity_rel_type ON public.entity_relationships(relationship_type);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);

-- 8️⃣ UPDATE TRIGGERS FOR TIMESTAMPS
CREATE TRIGGER update_zones_updated_at
  BEFORE UPDATE ON public.zones
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_entity_locality_map_updated_at
  BEFORE UPDATE ON public.entity_locality_map
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 9️⃣ SEED ZONES FROM EXISTING DATA
INSERT INTO public.zones (name, slug, locality_count, verification_status)
VALUES 
  ('Adarsh Nagar Zone', 'adarsh-nagar-zone', 9, 'verified'),
  ('Civil Lines Zone', 'civil-lines-zone', 20, 'verified'),
  ('Hawa Mahal Zone', 'hawa-mahal-zone', 21, 'verified'),
  ('Jhotwara Zone', 'jhotwara-zone', 6, 'verified'),
  ('Sanganer Zone', 'sanganer-zone', 20, 'verified'),
  ('Vidyadhar Nagar Zone', 'vidyadhar-nagar-zone', 20, 'verified'),
  ('Vishwakarma Zone', 'vishwakarma-zone', 8, 'verified')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  locality_count = EXCLUDED.locality_count,
  updated_at = now();

-- 🔟 UPDATE LOCALITIES WITH ZONE_ID BASED ON EXISTING ZONE SLUG
UPDATE public.localities l
SET zone_id = z.id
FROM public.zones z
WHERE l.zone = z.name OR l.zone = z.slug;

-- 1️⃣1️⃣ UPDATE CATEGORIES WITH PARENT_ID BASED ON PARENT_SLUG
UPDATE public.categories c
SET parent_id = p.id,
    level = CASE 
      WHEN c.parent_slug IS NULL THEN 1 
      ELSE 2 
    END
FROM public.categories p
WHERE c.parent_slug = p.slug AND c.parent_slug IS NOT NULL;