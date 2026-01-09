-- Drop partial tables that may have been created
DROP TABLE IF EXISTS public.soft_registrations CASCADE;
DROP TABLE IF EXISTS public.search_queries CASCADE;
DROP TABLE IF EXISTS public.click_events CASCADE;
DROP TABLE IF EXISTS public.page_views CASCADE;
DROP TABLE IF EXISTS public.visitor_sessions CASCADE;

-- Create visitor_sessions table to track all site visitors
CREATE TABLE public.visitor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  device_type TEXT,
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  os_version TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  landing_page TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_visit_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_page_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  is_converted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page_views table for detailed page tracking
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  referrer_url TEXT,
  time_on_page INTEGER,
  scroll_depth INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create click_events table for click tracking
CREATE TABLE public.click_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  element_type TEXT,
  element_text TEXT,
  element_id TEXT,
  element_class TEXT,
  target_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search_queries table for search tracking
CREATE TABLE public.search_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  search_query TEXT NOT NULL,
  search_type TEXT,
  results_count INTEGER,
  clicked_result_id TEXT,
  clicked_result_type TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create soft_registrations table for capturing partial registration data
CREATE TABLE public.soft_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  locality TEXT,
  ip_address TEXT,
  city TEXT,
  state TEXT,
  device_type TEXT,
  browser TEXT,
  fields_filled TEXT[],
  form_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_interaction_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_completed BOOLEAN DEFAULT false,
  completed_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_visitor_sessions_session_id ON public.visitor_sessions(session_id);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_click_events_session_id ON public.click_events(session_id);
CREATE INDEX idx_search_queries_session_id ON public.search_queries(session_id);
CREATE INDEX idx_soft_registrations_session_id ON public.soft_registrations(session_id);
CREATE INDEX idx_soft_registrations_email ON public.soft_registrations(email);
CREATE INDEX idx_visitor_sessions_created_at ON public.visitor_sessions(created_at);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);

-- Enable RLS
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soft_registrations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for tracking
CREATE POLICY "Anyone can insert visitor sessions"
  ON public.visitor_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert click events"
  ON public.click_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert search queries"
  ON public.search_queries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert soft registrations"
  ON public.soft_registrations FOR INSERT
  WITH CHECK (true);

-- Allow updates for session continuation
CREATE POLICY "Anyone can update their session"
  ON public.visitor_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can update their soft registration"
  ON public.soft_registrations FOR UPDATE
  USING (true);

-- Admin can view all analytics (using just 'admin' role)
CREATE POLICY "Admins can view all visitor sessions"
  ON public.visitor_sessions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all page views"
  ON public.page_views FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all click events"
  ON public.click_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all search queries"
  ON public.search_queries FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all soft registrations"
  ON public.soft_registrations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger for soft_registrations
CREATE TRIGGER update_soft_registrations_updated_at
  BEFORE UPDATE ON public.soft_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();