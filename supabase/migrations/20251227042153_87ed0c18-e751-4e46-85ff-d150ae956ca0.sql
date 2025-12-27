-- Create car_brands table
CREATE TABLE IF NOT EXISTS public.car_brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  country TEXT,
  description TEXT,
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create car_models table
CREATE TABLE IF NOT EXISTS public.car_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.car_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  variant_name TEXT,
  body_type TEXT CHECK (body_type IN ('hatchback', 'sedan', 'suv', 'muv', 'compact-suv', 'coupe', 'convertible', 'pickup', 'van')),
  fuel_type TEXT CHECK (fuel_type IN ('petrol', 'diesel', 'cng', 'electric', 'hybrid', 'plug-in-hybrid')),
  transmission TEXT CHECK (transmission IN ('manual', 'automatic', 'amt', 'cvt', 'dct')),
  seating_capacity INTEGER,
  ex_showroom_price_min NUMERIC,
  ex_showroom_price_max NUMERIC,
  on_road_price_jaipur_min NUMERIC,
  on_road_price_jaipur_max NUMERIC,
  mileage_city NUMERIC,
  mileage_highway NUMERIC,
  engine_cc INTEGER,
  power_bhp NUMERIC,
  torque_nm NUMERIC,
  features JSONB DEFAULT '[]'::jsonb,
  pros TEXT[],
  cons TEXT[],
  best_for TEXT[],
  is_ev BOOLEAN DEFAULT false,
  is_new_launch BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  waiting_period_weeks INTEGER,
  cover_image TEXT,
  gallery_images TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(brand_id, slug)
);

-- Create car_dealers table
CREATE TABLE IF NOT EXISTS public.car_dealers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.car_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  dealer_type TEXT CHECK (dealer_type IN ('authorized', 'multi-brand', 'used-cars', 'service-center')),
  address TEXT,
  locality TEXT,
  city TEXT DEFAULT 'Jaipur',
  pincode TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  phone TEXT,
  email TEXT,
  website TEXT,
  working_hours JSONB DEFAULT '{}'::jsonb,
  services_offered TEXT[],
  models_available UUID[],
  is_verified BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  cover_image TEXT,
  gallery_images TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ev_charging_stations table
CREATE TABLE IF NOT EXISTS public.ev_charging_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  operator TEXT,
  address TEXT,
  locality TEXT,
  city TEXT DEFAULT 'Jaipur',
  latitude NUMERIC,
  longitude NUMERIC,
  charger_types TEXT[],
  power_output_kw NUMERIC[],
  number_of_chargers INTEGER,
  amenities TEXT[],
  working_hours TEXT,
  pricing_info TEXT,
  phone TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_24x7 BOOLEAN DEFAULT false,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create car_inquiries table for leads
CREATE TABLE IF NOT EXISTS public.car_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  model_id UUID REFERENCES public.car_models(id),
  dealer_id UUID REFERENCES public.car_dealers(id),
  inquiry_type TEXT CHECK (inquiry_type IN ('price-quote', 'test-drive', 'callback', 'used-car', 'service')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  locality TEXT,
  preferred_time TEXT,
  intent_stage TEXT CHECK (intent_stage IN ('researching', 'likely-to-buy', 'ready-to-buy')),
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create car_ownership_stories table
CREATE TABLE IF NOT EXISTS public.car_ownership_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  model_id UUID REFERENCES public.car_models(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  ownership_duration_months INTEGER,
  kms_driven INTEGER,
  city TEXT DEFAULT 'Jaipur',
  pros TEXT[],
  cons TEXT[],
  images TEXT[],
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.car_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ev_charging_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_ownership_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for car_brands (public read)
CREATE POLICY "Anyone can view car brands" ON public.car_brands FOR SELECT USING (true);
CREATE POLICY "Admins can manage car brands" ON public.car_brands FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for car_models (public read)
CREATE POLICY "Anyone can view car models" ON public.car_models FOR SELECT USING (true);
CREATE POLICY "Admins can manage car models" ON public.car_models FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for car_dealers (public read)
CREATE POLICY "Anyone can view car dealers" ON public.car_dealers FOR SELECT USING (true);
CREATE POLICY "Admins can manage car dealers" ON public.car_dealers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ev_charging_stations (public read)
CREATE POLICY "Anyone can view EV charging stations" ON public.ev_charging_stations FOR SELECT USING (true);
CREATE POLICY "Admins can manage EV charging stations" ON public.ev_charging_stations FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for car_inquiries
CREATE POLICY "Anyone can create car inquiries" ON public.car_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own inquiries" ON public.car_inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all inquiries" ON public.car_inquiries FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for car_ownership_stories
CREATE POLICY "Anyone can view approved stories" ON public.car_ownership_stories FOR SELECT USING (status = 'approved' OR user_id = auth.uid());
CREATE POLICY "Authenticated users can create stories" ON public.car_ownership_stories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own stories" ON public.car_ownership_stories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all stories" ON public.car_ownership_stories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_car_models_brand ON public.car_models(brand_id);
CREATE INDEX idx_car_models_body_type ON public.car_models(body_type);
CREATE INDEX idx_car_models_fuel_type ON public.car_models(fuel_type);
CREATE INDEX idx_car_models_is_ev ON public.car_models(is_ev);
CREATE INDEX idx_car_dealers_brand ON public.car_dealers(brand_id);
CREATE INDEX idx_car_dealers_locality ON public.car_dealers(locality);
CREATE INDEX idx_ev_charging_locality ON public.ev_charging_stations(locality);

-- Seed some initial data for car brands
INSERT INTO public.car_brands (name, slug, country, is_popular, display_order) VALUES
('Tata', 'tata', 'India', true, 1),
('Maruti Suzuki', 'maruti-suzuki', 'India', true, 2),
('Hyundai', 'hyundai', 'South Korea', true, 3),
('Mahindra', 'mahindra', 'India', true, 4),
('Kia', 'kia', 'South Korea', true, 5),
('Toyota', 'toyota', 'Japan', true, 6),
('Honda', 'honda', 'Japan', true, 7),
('MG', 'mg', 'UK/China', true, 8),
('Skoda', 'skoda', 'Czech Republic', false, 9),
('Volkswagen', 'volkswagen', 'Germany', false, 10)
ON CONFLICT (slug) DO NOTHING;

-- Seed sample car models
INSERT INTO public.car_models (brand_id, name, slug, body_type, fuel_type, transmission, on_road_price_jaipur_min, on_road_price_jaipur_max, is_trending, is_new_launch, best_for, waiting_period_weeks)
SELECT 
  b.id,
  'Punch',
  'punch',
  'compact-suv',
  'petrol',
  'manual',
  650000,
  1200000,
  true,
  false,
  ARRAY['first-time buyers', 'city commute', 'safety-conscious'],
  2
FROM public.car_brands b WHERE b.slug = 'tata'
ON CONFLICT (brand_id, slug) DO NOTHING;

INSERT INTO public.car_models (brand_id, name, slug, body_type, fuel_type, transmission, on_road_price_jaipur_min, on_road_price_jaipur_max, is_ev, is_trending, best_for, waiting_period_weeks)
SELECT 
  b.id,
  'Nexon EV',
  'nexon-ev',
  'compact-suv',
  'electric',
  'automatic',
  1500000,
  2000000,
  true,
  true,
  ARRAY['EV enthusiasts', 'city drivers', 'eco-conscious buyers'],
  4
FROM public.car_brands b WHERE b.slug = 'tata'
ON CONFLICT (brand_id, slug) DO NOTHING;

INSERT INTO public.car_models (brand_id, name, slug, body_type, fuel_type, transmission, on_road_price_jaipur_min, on_road_price_jaipur_max, is_trending, is_new_launch, best_for, waiting_period_weeks)
SELECT 
  b.id,
  'Creta',
  'creta',
  'compact-suv',
  'petrol',
  'automatic',
  1200000,
  2200000,
  true,
  false,
  ARRAY['family buyers', 'feature lovers', 'upgrade seekers'],
  3
FROM public.car_brands b WHERE b.slug = 'hyundai'
ON CONFLICT (brand_id, slug) DO NOTHING;