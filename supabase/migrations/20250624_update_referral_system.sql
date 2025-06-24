
-- Update the handle_new_user function to properly process referral data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $function$
DECLARE
  new_referral_code TEXT;
  referrer_id UUID;
BEGIN
  -- Generate referral code
  new_referral_code := public.generate_referral_code();
  
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

-- Add city column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'city') THEN
    ALTER TABLE public.profiles ADD COLUMN city TEXT DEFAULT 'Jaipur';
  END IF;
END $$;

-- Update existing profiles to have Jaipur as default city
UPDATE public.profiles SET city = 'Jaipur' WHERE city IS NULL;
