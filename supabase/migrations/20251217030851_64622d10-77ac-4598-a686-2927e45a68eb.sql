-- Create events table for Eventbrite-like functionality
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  
  -- Event timing
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  is_all_day BOOLEAN DEFAULT false,
  
  -- Location
  venue_name TEXT,
  venue_address TEXT,
  city TEXT DEFAULT 'Jaipur',
  locality TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_online BOOLEAN DEFAULT false,
  online_url TEXT,
  
  -- Organizer
  organizer_id UUID REFERENCES auth.users(id),
  organizer_name TEXT,
  organizer_email TEXT,
  organizer_phone TEXT,
  
  -- Categorization
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  
  -- Media
  cover_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  
  -- Ticketing
  is_free BOOLEAN DEFAULT true,
  ticket_price DECIMAL(10, 2),
  max_tickets INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  registration_url TEXT,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  is_featured BOOLEAN DEFAULT false,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create event_registrations table for ticket/RSVP tracking
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Registration details
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  ticket_count INTEGER DEFAULT 1,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'attended')),
  registration_code TEXT NOT NULL UNIQUE,
  
  -- Timestamps
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  attended_at TIMESTAMP WITH TIME ZONE
);

-- Create event_interests table for "Interested" functionality
CREATE TABLE public.event_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (status = 'published');

CREATE POLICY "Organizers can view their own events"
  ON public.events FOR SELECT
  USING (organizer_id = auth.uid());

CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events"
  ON public.events FOR UPDATE
  USING (organizer_id = auth.uid());

CREATE POLICY "Organizers can delete their events"
  ON public.events FOR DELETE
  USING (organizer_id = auth.uid());

-- Event registrations policies
CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Organizers can view event registrations"
  ON public.event_registrations FOR SELECT
  USING (event_id IN (SELECT id FROM public.events WHERE organizer_id = auth.uid()));

CREATE POLICY "Anyone can register for events"
  ON public.event_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their registrations"
  ON public.event_registrations FOR UPDATE
  USING (user_id = auth.uid());

-- Event interests policies
CREATE POLICY "Anyone can view interests count"
  ON public.event_interests FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their interests"
  ON public.event_interests FOR ALL
  USING (user_id = auth.uid());

-- Function to generate event slug
CREATE OR REPLACE FUNCTION public.generate_event_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  base_slug := TRIM(BOTH '-' FROM base_slug);
  final_slug := base_slug || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER;
  RETURN final_slug;
END;
$$;

-- Function to generate registration code
CREATE OR REPLACE FUNCTION public.generate_registration_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := 'EVT' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    IF NOT EXISTS (SELECT 1 FROM public.event_registrations WHERE registration_code = code) THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Function to increment event views
CREATE OR REPLACE FUNCTION public.increment_event_views(event_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.events
  SET view_count = view_count + 1
  WHERE id = event_id;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_news_article_timestamp();

-- Create indexes for performance
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_locality ON public.events(locality);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON public.event_registrations(user_id);