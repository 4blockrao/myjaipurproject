-- Properties/Real Estate Listings Table (like MagicBricks/99acres)
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  property_type TEXT NOT NULL DEFAULT 'apartment', -- apartment, house, villa, plot, commercial, pg
  listing_type TEXT NOT NULL DEFAULT 'sale', -- sale, rent
  
  -- Location
  locality TEXT NOT NULL,
  locality_slug TEXT,
  address TEXT,
  city TEXT DEFAULT 'Jaipur',
  pincode TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Property Details
  bedrooms INTEGER,
  bathrooms INTEGER,
  balconies INTEGER,
  floor_number INTEGER,
  total_floors INTEGER,
  carpet_area NUMERIC, -- sq ft
  built_up_area NUMERIC, -- sq ft
  plot_area NUMERIC, -- sq ft (for plots/houses)
  facing TEXT, -- East, West, North, South
  furnishing TEXT, -- unfurnished, semi-furnished, fully-furnished
  property_age TEXT, -- new, 0-1 years, 1-5 years, 5-10 years, 10+ years
  
  -- Pricing
  price NUMERIC NOT NULL,
  price_per_sqft NUMERIC,
  maintenance_monthly NUMERIC,
  security_deposit NUMERIC, -- for rent
  is_negotiable BOOLEAN DEFAULT true,
  
  -- Amenities
  amenities TEXT[] DEFAULT '{}',
  
  -- Images
  cover_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  
  -- Contact
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  owner_type TEXT DEFAULT 'owner', -- owner, agent, builder
  
  -- Status
  status TEXT DEFAULT 'active', -- active, sold, rented, inactive
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Ownership
  user_id UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- View tracking
  view_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active properties"
ON public.properties FOR SELECT
USING (status = 'active');

CREATE POLICY "Authenticated users can create properties"
ON public.properties FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own properties"
ON public.properties FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own properties"
ON public.properties FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all properties"
ON public.properties FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_properties_locality ON public.properties(locality_slug);
CREATE INDEX idx_properties_type_listing ON public.properties(property_type, listing_type);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_status ON public.properties(status);

-- Property Inquiries Table
CREATE TABLE public.property_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  inquiry_type TEXT DEFAULT 'general', -- general, site_visit, price_negotiation
  status TEXT DEFAULT 'new', -- new, contacted, converted, closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create property inquiries"
ON public.property_inquiries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own inquiries"
ON public.property_inquiries FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Property owners can view inquiries on their properties"
ON public.property_inquiries FOR SELECT
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all inquiries"
ON public.property_inquiries FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed some sample properties
INSERT INTO public.properties (title, slug, property_type, listing_type, locality, locality_slug, bedrooms, bathrooms, carpet_area, built_up_area, price, price_per_sqft, furnishing, facing, amenities, description, status, is_featured) VALUES
('Spacious 3 BHK in Malviya Nagar', '3bhk-malviya-nagar-001', 'apartment', 'sale', 'Malviya Nagar', 'malviya-nagar', 3, 2, 1450, 1650, 8500000, 5862, 'semi-furnished', 'East', ARRAY['parking', 'lift', 'security', 'power-backup', 'gym'], 'Beautiful 3 BHK apartment in prime location of Malviya Nagar. Close to schools, hospitals and markets.', 'active', true),
('Modern 2 BHK for Rent in Vaishali', '2bhk-rent-vaishali-001', 'apartment', 'rent', 'Vaishali Nagar', 'vaishali-nagar', 2, 2, 1100, 1250, 18000, NULL, 'fully-furnished', 'North', ARRAY['parking', 'lift', 'security', 'ac'], 'Fully furnished 2 BHK available for rent in Vaishali Nagar. Ready to move.', 'active', true),
('Premium Villa in Jagatpura', 'villa-jagatpura-001', 'villa', 'sale', 'Jagatpura', 'jagatpura', 4, 4, 2800, 3200, 25000000, 8928, 'semi-furnished', 'South', ARRAY['parking', 'garden', 'security', 'power-backup', 'swimming-pool'], 'Luxurious 4 BHK villa with private garden and modern amenities in Jagatpura.', 'active', true),
('Residential Plot in Mansarovar', 'plot-mansarovar-001', 'plot', 'sale', 'Mansarovar', 'mansarovar', NULL, NULL, NULL, NULL, 4500000, 4500, NULL, 'West', ARRAY['corner-plot', 'road-facing'], 'Prime residential plot in Mansarovar Extension. JDA approved.', 'active', false),
('1 BHK PG in C-Scheme', '1bhk-pg-cscheme-001', 'pg', 'rent', 'C-Scheme', 'c-scheme', 1, 1, 400, 450, 8000, NULL, 'fully-furnished', 'East', ARRAY['wifi', 'meals', 'laundry', 'security'], 'Comfortable PG accommodation for working professionals in C-Scheme.', 'active', false),
('Commercial Shop in Raja Park', 'shop-rajapark-001', 'commercial', 'rent', 'Raja Park', 'raja-park', NULL, 1, 500, 550, 35000, NULL, 'unfurnished', 'North', ARRAY['main-road', 'parking', 'power-backup'], 'Prime commercial shop on main road in Raja Park. Ideal for retail business.', 'active', false),
('3 BHK Ready Flat Jawahar Nagar', '3bhk-jawaharnagar-001', 'apartment', 'sale', 'Jawahar Nagar', 'jawahar-nagar', 3, 3, 1600, 1850, 9200000, 5750, 'semi-furnished', 'East', ARRAY['parking', 'lift', 'security', 'power-backup', 'club-house'], 'Ready to move 3 BHK in gated society with all amenities.', 'active', true),
('Studio Apartment Tonk Road', 'studio-tonkroad-001', 'apartment', 'rent', 'Tonk Road', 'tonk-road', 1, 1, 550, 600, 12000, NULL, 'fully-furnished', 'West', ARRAY['parking', 'lift', 'security', 'ac', 'wifi'], 'Modern studio apartment ideal for bachelors or couples.', 'active', false);