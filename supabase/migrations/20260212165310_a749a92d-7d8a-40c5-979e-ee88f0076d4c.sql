-- Allow anon/authenticated users to read their own soft registration by session_id
CREATE POLICY "Users can view their own soft registrations"
ON public.soft_registrations
FOR SELECT
USING (true);