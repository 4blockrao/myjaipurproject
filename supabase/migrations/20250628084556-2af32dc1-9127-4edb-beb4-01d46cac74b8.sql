
-- Create enum for different roles in the system
CREATE TYPE public.app_role AS ENUM (
    'user', 
    'pro_user', 
    'merchant', 
    'listing_agent', 
    'listing_supervisor', 
    'admin'
);

-- Create user_roles table to manage user roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = _user_id 
        AND role = _role 
        AND is_active = true
    );
$$;

-- Function to get all user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS TABLE(role app_role, assigned_at TIMESTAMP WITH TIME ZONE, metadata JSONB)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT role, assigned_at, metadata
    FROM public.user_roles 
    WHERE user_id = _user_id 
    AND is_active = true
    ORDER BY assigned_at DESC;
$$;

-- Function to check if user has any of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.user_roles 
        WHERE user_id = _user_id 
        AND role = ANY(_roles) 
        AND is_active = true
    );
$$;

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Listing supervisors can manage listing agent roles" 
ON public.user_roles 
FOR ALL 
USING (
    public.has_role(auth.uid(), 'listing_supervisor') 
    AND role IN ('listing_agent')
);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Add deal approval workflow columns
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft';
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update deals RLS policies for role-based access
DROP POLICY IF EXISTS "Anyone can view deals" ON public.deals;
DROP POLICY IF EXISTS "Authenticated users can create deals" ON public.deals;
DROP POLICY IF EXISTS "Authenticated users can update deals" ON public.deals;

-- New RLS policies for deals with role-based access
CREATE POLICY "Public can view approved deals" 
ON public.deals 
FOR SELECT 
USING (approval_status = 'approved' AND is_active = true);

CREATE POLICY "Merchants can view their own deals" 
ON public.deals 
FOR SELECT 
USING (
    merchant_id IN (
        SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Listing agents and supervisors can view all deals" 
ON public.deals 
FOR SELECT 
USING (
    public.has_any_role(auth.uid(), ARRAY['listing_agent', 'listing_supervisor', 'admin']::app_role[])
);

CREATE POLICY "Merchants can create deals" 
ON public.deals 
FOR INSERT 
WITH CHECK (
    public.has_role(auth.uid(), 'merchant') 
    AND merchant_id IN (
        SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Listing agents can create deals" 
ON public.deals 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'listing_agent'));

CREATE POLICY "Deal creators can update their own deals" 
ON public.deals 
FOR UPDATE 
USING (created_by = auth.uid() OR merchant_id IN (
    SELECT id FROM public.merchants WHERE user_id = auth.uid()
));

CREATE POLICY "Listing supervisors can update all deals" 
ON public.deals 
FOR UPDATE 
USING (public.has_any_role(auth.uid(), ARRAY['listing_supervisor', 'admin']::app_role[]));

-- Update merchants table for role integration
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Function to automatically assign user role on signup
CREATE OR REPLACE FUNCTION public.assign_default_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Assign default 'user' role to new users
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (NEW.id, 'user', NEW.id);
    
    RETURN NEW;
END;
$$;

-- Create trigger to assign default role on user creation
DROP TRIGGER IF EXISTS on_auth_user_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_assign_role
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_default_user_role();

-- Function to upgrade user to pro when they purchase pro membership
CREATE OR REPLACE FUNCTION public.upgrade_to_pro_user(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Add pro_user role if not exists
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (_user_id, 'pro_user', _user_id)
    ON CONFLICT (user_id, role) DO UPDATE SET
        is_active = true,
        updated_at = now();
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_deals_approval_status ON public.deals(approval_status);
CREATE INDEX IF NOT EXISTS idx_deals_created_by ON public.deals(created_by);
