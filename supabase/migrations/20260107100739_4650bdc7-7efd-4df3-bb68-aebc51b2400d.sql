-- Add new vendor roles to the enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'real_estate_broker';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'event_organizer';

-- Create a vendor_applications table for unified tracking of all vendor registrations
CREATE TABLE IF NOT EXISTS public.vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_type TEXT NOT NULL CHECK (vendor_type IN ('merchant', 'real_estate_broker', 'event_organizer')),
  business_name TEXT NOT NULL,
  business_type TEXT,
  description TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT,
  locality TEXT,
  city TEXT DEFAULT 'Jaipur',
  social_handles JSONB,
  documents JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, vendor_type)
);

-- Enable RLS
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
ON public.vendor_applications FOR SELECT
USING (user_id = auth.uid());

-- Users can create their own applications  
CREATE POLICY "Users can create own applications"
ON public.vendor_applications FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their pending applications
CREATE POLICY "Users can update pending applications"
ON public.vendor_applications FOR UPDATE
USING (user_id = auth.uid() AND status = 'pending');

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.vendor_applications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update any application
CREATE POLICY "Admins can update any application"
ON public.vendor_applications FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER set_vendor_applications_updated_at
BEFORE UPDATE ON public.vendor_applications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();