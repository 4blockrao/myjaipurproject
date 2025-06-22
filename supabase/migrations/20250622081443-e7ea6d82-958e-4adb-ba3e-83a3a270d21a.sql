
-- First, let's make sure we're working in the correct schema and fix any issues
SET search_path = public, auth;

-- Drop and recreate the function with proper schema qualification
DROP FUNCTION IF EXISTS public.generate_referral_code() CASCADE;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    -- Use fully qualified table name
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code) THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Drop and recreate the trigger function with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate referral code
  new_referral_code := public.generate_referral_code();
  
  -- Insert into profiles with error handling
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    referral_code,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    new_referral_code,
    NOW(),
    NOW()
  );
  
  -- Give signup bonus
  INSERT INTO public.jaicoin_transactions (
    user_id, 
    amount, 
    type, 
    source, 
    description,
    created_at
  ) VALUES (
    NEW.id, 
    25, 
    'earned', 
    'signup', 
    'Welcome bonus for signing up',
    NOW()
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block user creation
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop existing trigger and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.generate_referral_code() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Test the function to make sure it works
SELECT public.generate_referral_code() as test_referral_code;
