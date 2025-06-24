
-- Add user_id field to profiles table for invitation codes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id_code TEXT;

-- Create a function to generate 6-digit user ID
CREATE OR REPLACE FUNCTION public.generate_user_id_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    -- Generate 6-digit random number (100000 to 999999)
    code := LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
    
    -- Check if this code already exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id_code = code) THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Update existing profiles to have user_id_code
UPDATE public.profiles 
SET user_id_code = public.generate_user_id_code() 
WHERE user_id_code IS NULL;

-- Update the handle_new_user function to include user_id_code generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  new_referral_code TEXT;
  new_user_id_code TEXT;
  referrer_id UUID;
BEGIN
  -- Generate referral code
  new_referral_code := public.generate_referral_code();
  
  -- Generate user ID code
  new_user_id_code := public.generate_user_id_code();
  
  -- Get referrer ID if referral code was used
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    SELECT id INTO referrer_id 
    FROM public.profiles 
    WHERE id::text = NEW.raw_user_meta_data->>'referred_by';
  END IF;
  
  -- Insert into profiles with error handling
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
    new_user_id_code,
    COALESCE(NEW.raw_user_meta_data->>'city', 'Jaipur'),
    NEW.raw_user_meta_data->>'locality',
    referrer_id,
    NOW(),
    NOW()
  );
  
  -- Give signup bonus (increased for referrals)
  INSERT INTO public.jaicoin_transactions (
    user_id, 
    amount, 
    type, 
    source, 
    description,
    created_at
  ) VALUES (
    NEW.id, 
    CASE WHEN referrer_id IS NOT NULL THEN 50 ELSE 30 END, -- More coins for referred users
    'earned', 
    'signup', 
    CASE WHEN referrer_id IS NOT NULL 
         THEN 'Welcome bonus for joining via referral' 
         ELSE 'Welcome bonus for signing up' END,
    NOW()
  );
  
  -- Give referral bonus to referrer if applicable
  IF referrer_id IS NOT NULL THEN
    -- Award referrer
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
      'referral', 
      'Referral bonus for bringing a new friend',
      NOW()
    );
    
    -- Update referrer's total referrals count
    UPDATE public.profiles 
    SET total_referrals = total_referrals + 1
    WHERE id = referrer_id;
    
    -- Create referral earning record
    INSERT INTO public.referral_earnings (
      referrer_id,
      referred_id,
      level,
      earnings,
      source,
      created_at
    ) VALUES (
      referrer_id,
      NEW.id,
      1,
      50,
      'signup',
      NOW()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block user creation
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$function$;
