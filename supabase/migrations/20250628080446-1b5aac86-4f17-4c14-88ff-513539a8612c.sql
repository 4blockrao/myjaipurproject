
-- First, let's check and fix Row Level Security policies for critical tables

-- Enable RLS on all user-data tables if not already enabled
ALTER TABLE public.jaicoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Users can only view their own transactions" ON public.jaicoin_transactions;
DROP POLICY IF EXISTS "Users can only view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can only view their own coupons" ON public.coupons;
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only view their own redemptions" ON public.deal_redemptions;
DROP POLICY IF EXISTS "Users can only view their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can only view their own analytics" ON public.user_analytics;

-- Create comprehensive RLS policies for jaicoin_transactions
CREATE POLICY "Users can only view their own transactions" ON public.jaicoin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own transactions" ON public.jaicoin_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own transactions" ON public.jaicoin_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for orders
CREATE POLICY "Users can only view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for coupons
CREATE POLICY "Users can only view their own coupons" ON public.coupons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own coupons" ON public.coupons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own coupons" ON public.coupons
  FOR UPDATE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can only view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can only insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can only update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create comprehensive RLS policies for deal_redemptions
CREATE POLICY "Users can only view their own redemptions" ON public.deal_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own redemptions" ON public.deal_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create comprehensive RLS policies for reviews
CREATE POLICY "Users can only view their own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for user_analytics
CREATE POLICY "Users can only view their own analytics" ON public.user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own analytics" ON public.user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Clean up any test/dummy data that might be causing cross-contamination
-- Remove any transactions not associated with valid users
DELETE FROM public.jaicoin_transactions 
WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM auth.users);

-- Remove any orders not associated with valid users
DELETE FROM public.orders 
WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM auth.users);

-- Remove any coupons not associated with valid users
DELETE FROM public.coupons 
WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM auth.users);

-- Update the handle_new_user function to ensure proper user setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public', 'auth'
AS $function$
DECLARE
  new_referral_code TEXT;
  user_id_code_val TEXT;
BEGIN
  -- Generate referral code
  new_referral_code := public.generate_referral_code();
  
  -- Generate user ID code (6-digit number)
  user_id_code_val := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Ensure user ID code is unique
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE user_id_code = user_id_code_val) LOOP
    user_id_code_val := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END LOOP;
  
  -- Insert into profiles with complete user data
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    referral_code,
    user_id_code,
    city,
    locality,
    referred_by,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    new_referral_code,
    user_id_code_val,
    COALESCE(NEW.raw_user_meta_data->>'city', 'Jaipur'),
    NEW.raw_user_meta_data->>'locality',
    CASE 
      WHEN NEW.raw_user_meta_data->>'referred_by' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'referred_by')::UUID 
      ELSE NULL 
    END,
    NOW(),
    NOW()
  );
  
  -- Give signup bonus - ensure it's only for this user
  INSERT INTO public.jaicoin_transactions (
    user_id, 
    amount, 
    type, 
    source, 
    description,
    created_at
  ) VALUES (
    NEW.id, 
    30, -- Increased signup bonus
    'earned', 
    'signup_bonus', 
    'Welcome bonus for joining MyJaipur',
    NOW()
  );
  
  -- Handle referral bonus if user was referred
  IF NEW.raw_user_meta_data->>'referral_code_used' IS NOT NULL THEN
    -- Find the referrer
    DECLARE
      referrer_id UUID;
    BEGIN
      SELECT id INTO referrer_id 
      FROM public.profiles 
      WHERE referral_code = UPPER(NEW.raw_user_meta_data->>'referral_code_used');
      
      IF referrer_id IS NOT NULL THEN
        -- Give bonus to referrer
        INSERT INTO public.jaicoin_transactions (
          user_id, 
          amount, 
          type, 
          source, 
          description,
          created_at
        ) VALUES (
          referrer_id, 
          50, 
          'earned', 
          'referral_reward', 
          'Referral bonus for inviting new user',
          NOW()
        );
        
        -- Update referrer's total referrals
        UPDATE public.profiles 
        SET total_referrals = total_referrals + 1,
            updated_at = NOW()
        WHERE id = referrer_id;
        
        -- Update new user's referred_by field
        UPDATE public.profiles 
        SET referred_by = referrer_id,
            updated_at = NOW()
        WHERE id = NEW.id;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block user creation
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$function$;
