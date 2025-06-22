
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(15),
  full_name TEXT,
  email TEXT,
  referred_by UUID REFERENCES auth.users(id),
  referral_code VARCHAR(10) UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'Bronze',
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jaicoin transactions table (extended)
CREATE TABLE public.jaicoin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'earned' or 'spent'
  source VARCHAR(50) NOT NULL, -- 'signup', 'referral', 'spin', 'review', etc.
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spin wheel attempts table
CREATE TABLE public.spin_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID, -- optional reference to deals
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post likes table
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID, -- reference to deals when we create them
  merchant_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  image_url TEXT,
  jaicoin_rewarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral tracking table
CREATE TABLE public.referral_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL, -- 1 for direct, 2 for second level
  earnings INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL, -- what action earned the referral bonus
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jaicoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for jaicoin_transactions
CREATE POLICY "Users can view own transactions" ON public.jaicoin_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.jaicoin_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for spin_attempts
CREATE POLICY "Users can view own spins" ON public.spin_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own spins" ON public.spin_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for community_posts
CREATE POLICY "Users can view all posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for post_likes
CREATE POLICY "Users can view all likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.post_likes FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for reviews
CREATE POLICY "Users can view all reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for referral_earnings
CREATE POLICY "Users can view own referral earnings" ON public.referral_earnings FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users can insert referral earnings" ON public.referral_earnings FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code) THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, referral_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    generate_referral_code()
  );
  
  -- Give signup bonus
  INSERT INTO public.jaicoin_transactions (user_id, amount, type, source, description)
  VALUES (NEW.id, 25, 'earned', 'signup', 'Welcome bonus for signing up');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate user's JaiCoin balance
CREATE OR REPLACE FUNCTION get_user_balance(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(CASE WHEN type = 'earned' THEN amount ELSE -amount END)
     FROM public.jaicoin_transactions 
     WHERE user_id = user_uuid), 
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
