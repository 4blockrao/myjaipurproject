
-- Extend profiles table for Pro membership
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pro_tier TEXT DEFAULT 'basic' CHECK (pro_tier IN ('basic', 'pro', 'premium')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'cancelled', 'expired'));

-- Create merchants table for merchant dashboard
CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  total_deals INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deals table (referenced in earlier tables but not created)
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  discount_percentage INTEGER,
  category TEXT,
  subcategory TEXT,
  image_url TEXT,
  terms_conditions TEXT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  location TEXT,
  tags TEXT[],
  jaicoin_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deal redemptions table
CREATE TABLE public.deal_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  redemption_code TEXT UNIQUE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  jaicoin_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user analytics table
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  deals_viewed INTEGER DEFAULT 0,
  deals_saved INTEGER DEFAULT 0,
  deals_redeemed INTEGER DEFAULT 0,
  jaicoin_earned INTEGER DEFAULT 0,
  jaicoin_spent INTEGER DEFAULT 0,
  referrals_made INTEGER DEFAULT 0,
  posts_created INTEGER DEFAULT 0,
  reviews_written INTEGER DEFAULT 0,
  spin_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create merchant analytics table
CREATE TABLE public.merchant_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  deals_created INTEGER DEFAULT 0,
  deals_viewed INTEGER DEFAULT 0,
  deals_redeemed INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  reviews_received INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(merchant_id, date)
);

-- Create group challenges table
CREATE TABLE public.group_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('referral', 'spending', 'review', 'social')),
  target_value INTEGER NOT NULL,
  reward_amount INTEGER NOT NULL,
  reward_type TEXT DEFAULT 'jaicoin' CHECK (reward_type IN ('jaicoin', 'badge', 'rank_boost')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create group challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.group_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Create user badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Enable RLS on new tables
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for merchants
CREATE POLICY "Users can view all active merchants" ON public.merchants FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own merchant profile" ON public.merchants FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for deals
CREATE POLICY "Users can view active deals" ON public.deals FOR SELECT USING (is_active = true);
CREATE POLICY "Merchants can manage own deals" ON public.deals FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM public.merchants WHERE id = merchant_id)
);

-- RLS Policies for deal redemptions
CREATE POLICY "Users can view own redemptions" ON public.deal_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own redemptions" ON public.deal_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Merchants can view their deal redemptions" ON public.deal_redemptions FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.merchants WHERE id = merchant_id)
);

-- RLS Policies for user analytics
CREATE POLICY "Users can view own analytics" ON public.user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON public.user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for merchant analytics
CREATE POLICY "Merchants can view own analytics" ON public.merchant_analytics FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.merchants WHERE id = merchant_id)
);

-- RLS Policies for group challenges
CREATE POLICY "Users can view active challenges" ON public.group_challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create challenges" ON public.group_challenges FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS Policies for challenge participants
CREATE POLICY "Users can view challenge participants" ON public.challenge_participants FOR SELECT USING (true);
CREATE POLICY "Users can manage own participation" ON public.challenge_participants FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user badges
CREATE POLICY "Users can view all badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update merchant stats
CREATE OR REPLACE FUNCTION update_merchant_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update merchant stats when new deal is created
    IF TG_TABLE_NAME = 'deals' THEN
      UPDATE public.merchants 
      SET total_deals = total_deals + 1, updated_at = NOW()
      WHERE id = NEW.merchant_id;
    END IF;
    
    -- Update merchant stats when new review is created
    IF TG_TABLE_NAME = 'reviews' AND NEW.deal_id IS NOT NULL THEN
      UPDATE public.merchants 
      SET total_reviews = total_reviews + 1,
          average_rating = (
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM public.reviews r
            JOIN public.deals d ON r.deal_id = d.id
            WHERE d.merchant_id = (
              SELECT merchant_id FROM public.deals WHERE id = NEW.deal_id
            )
          ),
          updated_at = NOW()
      WHERE id = (SELECT merchant_id FROM public.deals WHERE id = NEW.deal_id);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for merchant stats
CREATE TRIGGER update_merchant_stats_on_deal
  AFTER INSERT ON public.deals
  FOR EACH ROW EXECUTE FUNCTION update_merchant_stats();

CREATE TRIGGER update_merchant_stats_on_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_merchant_stats();

-- Function to generate redemption codes
CREATE OR REPLACE FUNCTION generate_redemption_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 10));
    IF NOT EXISTS (SELECT 1 FROM public.deal_redemptions WHERE redemption_code = code) THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check pro membership status
CREATE OR REPLACE FUNCTION is_pro_member(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND is_pro = true 
    AND (pro_expires_at IS NULL OR pro_expires_at > NOW())
    AND subscription_status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award badges
CREATE OR REPLACE FUNCTION award_badge(user_uuid UUID, badge_type TEXT, badge_name TEXT, badge_description TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_description)
  VALUES (user_uuid, badge_type, badge_name, badge_description)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
