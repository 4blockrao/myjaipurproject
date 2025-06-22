
-- Fix RLS policies for merchants table to allow data seeding
-- First, let's check if there are existing policies and update them

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view merchants" ON merchants;
DROP POLICY IF EXISTS "Users can create merchants" ON merchants;
DROP POLICY IF EXISTS "Merchants can update own data" ON merchants;

-- Create more permissive policies for data seeding and general access
-- Allow anyone to view merchants (public access)
CREATE POLICY "Anyone can view merchants" ON merchants
  FOR SELECT USING (true);

-- Allow authenticated users to insert merchants (for seeding and onboarding)
CREATE POLICY "Authenticated users can create merchants" ON merchants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Allow merchant owners to update their own data
CREATE POLICY "Merchant owners can update own data" ON merchants
  FOR UPDATE USING (user_id = auth.uid() OR auth.uid() IS NULL);

-- Allow authenticated users to delete (for admin operations and seeding cleanup)
CREATE POLICY "Authenticated users can delete merchants" ON merchants
  FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Similarly fix deals table RLS
DROP POLICY IF EXISTS "Users can view deals" ON deals;
DROP POLICY IF EXISTS "Users can create deals" ON deals;

CREATE POLICY "Anyone can view deals" ON deals
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create deals" ON deals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated users can update deals" ON deals
  FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Authenticated users can delete deals" ON deals
  FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Fix coupons table RLS
DROP POLICY IF EXISTS "Users can view their own coupons" ON coupons;
DROP POLICY IF EXISTS "Users can create coupons" ON coupons;

CREATE POLICY "Anyone can view coupons" ON coupons
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage coupons" ON coupons
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Fix profiles table RLS for comprehensive access
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage profiles" ON profiles
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Fix jaicoin_transactions table RLS
DROP POLICY IF EXISTS "Users can view their own transactions" ON jaicoin_transactions;

CREATE POLICY "Anyone can view transactions" ON jaicoin_transactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage transactions" ON jaicoin_transactions
  FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
