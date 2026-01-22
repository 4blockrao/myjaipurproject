-- Enable admin management for events and registrations (draft workflow)

-- EVENTS: admins can view/manage all events (including drafts)
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events"
ON public.events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can create any event" ON public.events;
CREATE POLICY "Admins can create any event"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update any event" ON public.events;
CREATE POLICY "Admins can update any event"
ON public.events
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete any event" ON public.events;
CREATE POLICY "Admins can delete any event"
ON public.events
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- EVENT_REGISTRATIONS: allow admins to see ticket counts + manage attendee list
DROP POLICY IF EXISTS "Admins can view all event registrations" ON public.event_registrations;
CREATE POLICY "Admins can view all event registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update event registrations" ON public.event_registrations;
CREATE POLICY "Admins can update event registrations"
ON public.event_registrations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete event registrations" ON public.event_registrations;
CREATE POLICY "Admins can delete event registrations"
ON public.event_registrations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
