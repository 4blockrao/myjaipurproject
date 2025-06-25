
-- Enable RLS on all user-related tables (some might already be enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jaicoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_deal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_analytics ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for user data separation

-- Profiles: Users can only access their own profile
DROP POLICY IF EXISTS "Users can only see their own profile" ON public.profiles;
CREATE POLICY "Users can only see their own profile" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id);

-- Coupons: Users can only see their own coupons
DROP POLICY IF EXISTS "Users can only see their own coupons" ON public.coupons;
CREATE POLICY "Users can only see their own coupons" 
  ON public.coupons FOR ALL 
  USING (auth.uid() = user_id);

-- Orders: Users can only see their own orders
DROP POLICY IF EXISTS "Users can only see their own orders" ON public.orders;
CREATE POLICY "Users can only see their own orders" 
  ON public.orders FOR ALL 
  USING (auth.uid() = user_id);

-- Order Items: Users can only see items from their own orders
CREATE POLICY "Users can only see their own order items" 
  ON public.order_items FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Deal Redemptions: Users can only see their own redemptions
DROP POLICY IF EXISTS "Users can only see their own redemptions" ON public.deal_redemptions;
CREATE POLICY "Users can only see their own redemptions" 
  ON public.deal_redemptions FOR ALL 
  USING (auth.uid() = user_id);

-- JAICoin Transactions: Users can only see their own transactions
DROP POLICY IF EXISTS "Users can only see their own transactions" ON public.jaicoin_transactions;
CREATE POLICY "Users can only see their own transactions" 
  ON public.jaicoin_transactions FOR ALL 
  USING (auth.uid() = user_id);

-- Reviews: Users can read all reviews but only manage their own
CREATE POLICY "Users can read all reviews" 
  ON public.reviews FOR SELECT 
  USING (true);
CREATE POLICY "Users can insert their own reviews" 
  ON public.reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" 
  ON public.reviews FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" 
  ON public.reviews FOR DELETE 
  USING (auth.uid() = user_id);

-- Product Reviews: Users can read all but only manage their own
CREATE POLICY "Users can read all product reviews" 
  ON public.product_reviews FOR SELECT 
  USING (true);
CREATE POLICY "Users can insert their own product reviews" 
  ON public.product_reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own product reviews" 
  ON public.product_reviews FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own product reviews" 
  ON public.product_reviews FOR DELETE 
  USING (auth.uid() = user_id);

-- Community Posts: Users can read all but only manage their own
CREATE POLICY "Users can read all community posts" 
  ON public.community_posts FOR SELECT 
  USING (true);
CREATE POLICY "Users can insert their own community posts" 
  ON public.community_posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own community posts" 
  ON public.community_posts FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own community posts" 
  ON public.community_posts FOR DELETE 
  USING (auth.uid() = user_id);

-- Post Likes: Users can read all but only manage their own
CREATE POLICY "Users can read all post likes" 
  ON public.post_likes FOR SELECT 
  USING (true);
CREATE POLICY "Users can insert their own post likes" 
  ON public.post_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own post likes" 
  ON public.post_likes FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own post likes" 
  ON public.post_likes FOR DELETE 
  USING (auth.uid() = user_id);

-- User Analytics: Users can only see their own analytics
CREATE POLICY "Users can only see their own analytics" 
  ON public.user_analytics FOR ALL 
  USING (auth.uid() = user_id);

-- User Badges: Users can only see their own badges
CREATE POLICY "Users can only see their own badges" 
  ON public.user_badges FOR ALL 
  USING (auth.uid() = user_id);

-- Spin Attempts: Users can only see their own spin attempts
CREATE POLICY "Users can only see their own spin attempts" 
  ON public.spin_attempts FOR ALL 
  USING (auth.uid() = user_id);

-- Referral Earnings: Users can only see their own referral earnings
CREATE POLICY "Users can only see their own referral earnings" 
  ON public.referral_earnings FOR ALL 
  USING (auth.uid() = referrer_id);

-- Referral Tracking: Users can see tracking for their shared links
CREATE POLICY "Users can see their own referral tracking" 
  ON public.referral_tracking FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_deal_links 
      WHERE shared_deal_links.token = referral_tracking.share_token 
      AND shared_deal_links.user_id = auth.uid()
    )
  );

-- Shared Deal Links: Users can only manage their own shared links
CREATE POLICY "Users can only manage their own shared links" 
  ON public.shared_deal_links FOR ALL 
  USING (auth.uid() = user_id);

-- Challenge Participants: Users can only see their own participation
CREATE POLICY "Users can only see their own challenge participation" 
  ON public.challenge_participants FOR ALL 
  USING (auth.uid() = user_id);

-- Merchants: Users can read all but only manage their own
CREATE POLICY "Users can read all merchants" 
  ON public.merchants FOR SELECT 
  USING (true);
CREATE POLICY "Users can insert their own merchant profiles" 
  ON public.merchants FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own merchant profiles" 
  ON public.merchants FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own merchant profiles" 
  ON public.merchants FOR DELETE 
  USING (auth.uid() = user_id);

-- Merchant Applications: Users can only see their own applications
CREATE POLICY "Users can only see their own merchant applications" 
  ON public.merchant_applications FOR ALL 
  USING (auth.uid() = user_id);

-- Merchant Referral Rewards: Users can only see rewards they earned
CREATE POLICY "Users can only see their own merchant referral rewards" 
  ON public.merchant_referral_rewards FOR ALL 
  USING (auth.uid() = referrer_id);

-- Merchant Analytics: Merchants can only see their own analytics
CREATE POLICY "Merchants can only see their own analytics" 
  ON public.merchant_analytics FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.merchants 
      WHERE merchants.id = merchant_analytics.merchant_id 
      AND merchants.user_id = auth.uid()
    )
  );
