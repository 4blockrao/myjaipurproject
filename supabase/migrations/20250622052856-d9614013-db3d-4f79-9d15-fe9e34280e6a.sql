
-- Add merchant onboarding and deal management tables

-- Update merchants table to include referrer and approval status
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS listing_tier text DEFAULT 'basic' CHECK (listing_tier IN ('basic', 'featured', 'exclusive')),
ADD COLUMN IF NOT EXISTS listing_fee_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS listing_payment_id text,
ADD COLUMN IF NOT EXISTS social_handles jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

-- Create merchant applications table for tracking submissions
CREATE TABLE public.merchant_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  merchant_name text NOT NULL,
  business_type text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  address text NOT NULL,
  location text NOT NULL,
  description text,
  photos text[] DEFAULT '{}',
  social_handles jsonb DEFAULT '{}',
  deals_data jsonb DEFAULT '[]',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  submitted_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on merchant_applications
ALTER TABLE public.merchant_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for merchant_applications
CREATE POLICY "Users can view their own applications" ON public.merchant_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" ON public.merchant_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON public.merchant_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (
        email LIKE '%admin%' OR 
        id IN (SELECT id FROM public.profiles LIMIT 1) -- First user is admin for demo
      )
    )
  );

-- Create coupons table for deal redemption
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES public.deals(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  merchant_id uuid REFERENCES public.merchants(id) NOT NULL,
  coupon_code text NOT NULL UNIQUE,
  qr_code text,
  purchase_amount numeric(10,2) DEFAULT 0,
  discount_amount numeric(10,2) NOT NULL,
  coupon_type text NOT NULL CHECK (coupon_type IN ('free', 'paid_discount', 'full_value')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired')),
  payment_id text,
  purchased_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  redeemed_at timestamp with time zone,
  redeemed_by uuid REFERENCES auth.users(id),
  min_order_value numeric(10,2) DEFAULT 0,
  usage_terms text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for coupons
CREATE POLICY "Users can view their own coupons" ON public.coupons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Merchants can view their coupons" ON public.coupons
  FOR SELECT USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create coupons" ON public.coupons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Merchants can update redemption status" ON public.coupons
  FOR UPDATE USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- Create merchant_referral_rewards table for tracking referral rewards
CREATE TABLE public.merchant_referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) NOT NULL,
  merchant_id uuid REFERENCES public.merchants(id) NOT NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('onboarding', 'deal_submission', 'redemption', 'milestone')),
  amount integer NOT NULL,
  coupon_id uuid REFERENCES public.coupons(id),
  milestone_count integer,
  awarded_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on merchant_referral_rewards
ALTER TABLE public.merchant_referral_rewards ENABLE ROW LEVEL SECURITY;

-- Create policy for merchant_referral_rewards
CREATE POLICY "Users can view their referral rewards" ON public.merchant_referral_rewards
  FOR SELECT USING (auth.uid() = referrer_id);

-- Update deals table to include coupon-specific fields
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS coupon_type text DEFAULT 'paid_discount' CHECK (coupon_type IN ('free', 'paid_discount', 'full_value')),
ADD COLUMN IF NOT EXISTS purchase_price numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_order_value numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_terms text,
ADD COLUMN IF NOT EXISTS validity_days integer DEFAULT 30;

-- Create function to generate unique coupon codes
CREATE OR REPLACE FUNCTION public.generate_coupon_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := 'JAI' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    IF NOT EXISTS (SELECT 1 FROM public.coupons WHERE coupon_code = code) THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Create function to award referral rewards
CREATE OR REPLACE FUNCTION public.award_referral_reward(
  referrer_uuid uuid,
  merchant_uuid uuid,
  reward_type_param text,
  reward_amount integer,
  coupon_uuid uuid DEFAULT NULL,
  milestone_count_param integer DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert reward record
  INSERT INTO public.merchant_referral_rewards (
    referrer_id, merchant_id, reward_type, amount, coupon_id, milestone_count
  ) VALUES (
    referrer_uuid, merchant_uuid, reward_type_param, reward_amount, coupon_uuid, milestone_count_param
  );
  
  -- Award JaiCoins
  INSERT INTO public.jaicoin_transactions (user_id, amount, type, source, description)
  VALUES (
    referrer_uuid, 
    reward_amount, 
    'earned', 
    'merchant_referral',
    CASE reward_type_param
      WHEN 'onboarding' THEN 'Merchant onboarding reward'
      WHEN 'deal_submission' THEN 'Deal submission bonus'
      WHEN 'redemption' THEN 'Redemption reward'
      WHEN 'milestone' THEN 'Milestone reward (' || milestone_count_param || ' redemptions)'
    END
  );
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_merchant_applications_user_id ON public.merchant_applications(user_id);
CREATE INDEX idx_merchant_applications_status ON public.merchant_applications(status);
CREATE INDEX idx_coupons_user_id ON public.coupons(user_id);
CREATE INDEX idx_coupons_merchant_id ON public.coupons(merchant_id);
CREATE INDEX idx_coupons_status ON public.coupons(status);
CREATE INDEX idx_coupons_coupon_code ON public.coupons(coupon_code);
CREATE INDEX idx_merchant_referral_rewards_referrer ON public.merchant_referral_rewards(referrer_id);
