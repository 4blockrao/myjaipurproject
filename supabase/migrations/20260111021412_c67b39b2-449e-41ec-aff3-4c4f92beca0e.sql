-- Drop existing policies for visitor_sessions
DROP POLICY IF EXISTS "Anyone can insert visitor sessions" ON public.visitor_sessions;
DROP POLICY IF EXISTS "Anyone can update their session" ON public.visitor_sessions;
DROP POLICY IF EXISTS "Admins can view all visitor sessions" ON public.visitor_sessions;

-- Create more permissive policies for analytics tables (anonymous tracking)
-- INSERT policy - allow anyone (including anon) to insert
CREATE POLICY "Allow anonymous inserts" ON public.visitor_sessions
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- UPDATE policy - allow anyone to update based on session_id match
CREATE POLICY "Allow session updates" ON public.visitor_sessions
FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);

-- SELECT policy - only admins can view
CREATE POLICY "Admins can view all visitor sessions" ON public.visitor_sessions
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix page_views policies
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
DROP POLICY IF EXISTS "Admins can view all page views" ON public.page_views;

CREATE POLICY "Allow anonymous page view inserts" ON public.page_views
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all page views" ON public.page_views
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix click_events policies
DROP POLICY IF EXISTS "Anyone can insert click events" ON public.click_events;
DROP POLICY IF EXISTS "Admins can view all click events" ON public.click_events;

CREATE POLICY "Allow anonymous click event inserts" ON public.click_events
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all click events" ON public.click_events
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix search_queries policies
DROP POLICY IF EXISTS "Anyone can insert search queries" ON public.search_queries;
DROP POLICY IF EXISTS "Admins can view all search queries" ON public.search_queries;

CREATE POLICY "Allow anonymous search query inserts" ON public.search_queries
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all search queries" ON public.search_queries
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix soft_registrations policies
DROP POLICY IF EXISTS "Anyone can insert soft registrations" ON public.soft_registrations;
DROP POLICY IF EXISTS "Anyone can update their soft registration" ON public.soft_registrations;
DROP POLICY IF EXISTS "Admins can view all soft registrations" ON public.soft_registrations;

CREATE POLICY "Allow anonymous soft registration inserts" ON public.soft_registrations
FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow soft registration updates" ON public.soft_registrations
FOR UPDATE TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins can view all soft registrations" ON public.soft_registrations
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));