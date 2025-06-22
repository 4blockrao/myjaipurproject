
-- First, let's create some sample JaiCoin transactions for existing users
UPDATE public.profiles 
SET 
  full_name = CASE 
    WHEN full_name IS NULL THEN 
      (ARRAY['Arjun Sharma', 'Priya Agarwal', 'Rohit Singh', 'Kavya Jain', 'Vikram Gupta', 'Anjali Meena', 'Karan Sharma', 'Sneha Patel', 'Amit Kumar', 'Ritu Singh'])[1 + (random() * 9)::int]
    ELSE full_name 
  END,
  phone = '+91987654' || LPAD((random() * 9999)::int::text, 4, '0'),
  total_referrals = (random() * 15)::int,
  rank = (ARRAY['Bronze', 'Silver', 'Gold', 'Platinum'])[1 + (random() * 3)::int],
  is_pro = random() < 0.3,
  pro_tier = CASE WHEN random() < 0.3 THEN 'pro' WHEN random() < 0.1 THEN 'premium' ELSE 'basic' END,
  subscription_status = CASE WHEN random() < 0.3 THEN 'active' ELSE 'inactive' END;

-- Add more JaiCoin transactions to make the system look active
INSERT INTO public.jaicoin_transactions (user_id, amount, type, source, description)
SELECT 
    id,
    (25 + random() * 150)::int,
    CASE WHEN random() < 0.7 THEN 'earned' ELSE 'spent' END,
    CASE (random() * 5)::int
        WHEN 0 THEN 'referral'
        WHEN 1 THEN 'spin'
        WHEN 2 THEN 'review'
        WHEN 3 THEN 'deal_purchase'
        ELSE 'challenge_reward'
    END,
    'Sample activity transaction'
FROM public.profiles
WHERE id IS NOT NULL;

-- Insert sample merchants using a simpler approach
WITH merchant_data AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at) as rn,
    CASE (ROW_NUMBER() OVER (ORDER BY created_at) - 1) % 50
      WHEN 0 THEN 'Chokhi Dhani Restaurant'
      WHEN 1 THEN 'LMB Sweets'
      WHEN 2 THEN 'Peacock Rooftop Restaurant'
      WHEN 3 THEN 'Natraj Restaurant'
      WHEN 4 THEN 'Tapri Central'
      WHEN 5 THEN 'Jawed Habib Hair Studio'
      WHEN 6 THEN 'Lakme Salon'
      WHEN 7 THEN 'Wellness Spa & Salon'
      WHEN 8 THEN 'Naturals Family Salon'
      WHEN 9 THEN 'Gem Palace'
      WHEN 10 THEN 'Anokhi'
      WHEN 11 THEN 'Rajasthani Handicrafts'
      WHEN 12 THEN 'Kothari Textiles'
      WHEN 13 THEN 'Reliance Digital'
      WHEN 14 THEN 'Croma Electronics'
      WHEN 15 THEN 'Mobile Hub Jaipur'
      WHEN 16 THEN 'Gold Gym Jaipur'
      WHEN 17 THEN 'Fitness First'
      WHEN 18 THEN 'Anytime Fitness'
      WHEN 19 THEN 'Urban Company Jaipur'
      WHEN 20 THEN 'Royal Rajasthani Dhaba'
      WHEN 21 THEN 'Spice Route Restaurant'
      WHEN 22 THEN 'Heritage Hotel & Spa'
      WHEN 23 THEN 'Modern Electronics Store'
      WHEN 24 THEN 'Fashion Forward Boutique'
      WHEN 25 THEN 'Jaipur Jewelers'
      WHEN 26 THEN 'Tech Zone'
      WHEN 27 THEN 'Beauty Bliss Salon'
      WHEN 28 THEN 'Fitness Zone Gym'
      WHEN 29 THEN 'Home Decor Studio'
      WHEN 30 THEN 'Organic Food Store'
      WHEN 31 THEN 'Mobile World'
      WHEN 32 THEN 'Cafe Coffee Day'
      WHEN 33 THEN 'Pizza Hut Jaipur'
      WHEN 34 THEN 'Dominos Pizza'
      WHEN 35 THEN 'KFC Jaipur'
      WHEN 36 THEN 'McDonalds'
      WHEN 37 THEN 'Burger King'
      WHEN 38 THEN 'Subway Jaipur'
      WHEN 39 THEN 'Baskin Robbins'
      WHEN 40 THEN 'Haldirams'
      WHEN 41 THEN 'Bikanervala'
      WHEN 42 THEN 'Sagar Ratna'
      WHEN 43 THEN 'Saravana Bhavan'
      WHEN 44 THEN 'Chinese Dragon'
      WHEN 45 THEN 'Punjabi Tadka'
      WHEN 46 THEN 'South Indian Corner'
      WHEN 47 THEN 'North Indian Delights'
      WHEN 48 THEN 'Continental Cuisine'
      ELSE 'Italian Corner'
    END as business_name,
    CASE (ROW_NUMBER() OVER (ORDER BY created_at) - 1) % 6
      WHEN 0 THEN 'Food & Dining'
      WHEN 1 THEN 'Beauty & Wellness'
      WHEN 2 THEN 'Shopping'
      WHEN 3 THEN 'Electronics'
      WHEN 4 THEN 'Services'
      ELSE 'Health & Fitness'
    END as business_type,
    CASE (ROW_NUMBER() OVER (ORDER BY created_at) - 1) % 8
      WHEN 0 THEN 'C-Scheme'
      WHEN 1 THEN 'Malviya Nagar'
      WHEN 2 THEN 'Vaishali Nagar'
      WHEN 3 THEN 'Mansarovar'
      WHEN 4 THEN 'Jagatpura'
      WHEN 5 THEN 'Shyam Nagar'
      WHEN 6 THEN 'Tonk Road'
      ELSE 'Ajmer Road'
    END as location
  FROM public.profiles 
  WHERE id IS NOT NULL
  LIMIT 50
)
INSERT INTO public.merchants (user_id, business_name, business_type, address, phone, email, description, is_verified, is_active, total_deals, total_reviews, average_rating)
SELECT 
    id,
    business_name,
    business_type,
    location || ', Jaipur',
    '+91141234' || LPAD((500 + rn)::text, 4, '0'),
    lower(replace(business_name, ' ', '')) || '@gmail.com',
    'Quality services and products in Jaipur',
    random() < 0.8,
    true,
    (3 + random() * 20)::int,
    (20 + random() * 150)::int,
    (3.5 + random() * 1.5)::numeric(3,2)
FROM merchant_data;

-- Insert sample deals
WITH deal_data AS (
  SELECT 
    m.id as merchant_id,
    m.business_type,
    m.address,
    CASE (ROW_NUMBER() OVER (ORDER BY m.id) - 1) % 20
      WHEN 0 THEN 'iPhone 14 Pro 256GB - Exclusive Deal'
      WHEN 1 THEN 'Samsung 65" 4K Smart TV - Mega Sale'
      WHEN 2 THEN 'OnePlus 11 5G - Limited Offer'
      WHEN 3 THEN 'Diamond Necklace Set - Wedding Special'
      WHEN 4 THEN 'Designer Lehenga Collection'
      WHEN 5 THEN 'Royal Dining Experience Package'
      WHEN 6 THEN 'Bridal Makeover Package Complete'
      WHEN 7 THEN 'Annual Premium Gym Membership'
      WHEN 8 THEN 'Home Deep Cleaning Service'
      WHEN 9 THEN 'Premium Sofa Set 5 Seater'
      WHEN 10 THEN 'MacBook Air M2 Student Special'
      WHEN 11 THEN 'Monthly Organic Grocery Box'
      WHEN 12 THEN 'Royal Rajasthani Thali Experience'
      WHEN 13 THEN 'Premium Beauty Package'
      WHEN 14 THEN 'Traditional Jewelry Collection'
      WHEN 15 THEN 'Fitness Membership Discount'
      WHEN 16 THEN 'Special Service Package'
      WHEN 17 THEN 'Electronics Combo Deal'
      WHEN 18 THEN 'Fashion Week Special'
      ELSE 'Wellness Spa Package'
    END as title,
    CASE (ROW_NUMBER() OVER (ORDER BY m.id) - 1) % 4
      WHEN 0 THEN 'Exclusive offer with premium quality and fast delivery.'
      WHEN 1 THEN 'Limited time deal with warranty and support included.'
      WHEN 2 THEN 'Special discount for early customers with additional benefits.'
      ELSE 'Premium experience with professional service guarantee.'
    END as description,
    CASE (ROW_NUMBER() OVER (ORDER BY m.id) - 1) % 10
      WHEN 0 THEN 'Smartphones'
      WHEN 1 THEN 'Electronics'
      WHEN 2 THEN 'Jewelry'
      WHEN 3 THEN 'Clothing'
      WHEN 4 THEN 'Experience'
      WHEN 5 THEN 'Beauty'
      WHEN 6 THEN 'Fitness'
      WHEN 7 THEN 'Services'
      WHEN 8 THEN 'Furniture'
      ELSE 'Grocery'
    END as subcategory
  FROM public.merchants m
  WHERE m.id IS NOT NULL
)
INSERT INTO public.deals (
    merchant_id, title, description, original_price, discounted_price, discount_percentage,
    category, subcategory, location, jaicoin_reward, is_active, is_featured, 
    max_redemptions, tags, terms_conditions
)
SELECT 
    merchant_id,
    title,
    description,
    (500 + random() * 50000)::numeric(10,2),
    (300 + random() * 30000)::numeric(10,2),
    (15 + random() * 50)::int,
    business_type,
    subcategory,
    CASE WHEN random() < 0.3 THEN 'Online Delivery Jaipur' ELSE SUBSTRING(address FROM 1 FOR POSITION(',' IN address) - 1) END,
    (50 + random() * 400)::int,
    true,
    random() < 0.2,
    (5 + random() * 45)::int,
    ARRAY['premium', 'exclusive', 'limited'],
    'Valid till stocks last. Terms and conditions apply.'
FROM deal_data;

-- Insert sample reviews
INSERT INTO public.reviews (user_id, merchant_name, rating, review_text, jaicoin_rewarded)
SELECT 
    p.id,
    m.business_name,
    (4 + random())::int,
    CASE (random() * 4)::int
        WHEN 0 THEN 'Excellent service and great quality. Highly recommended!'
        WHEN 1 THEN 'Good experience overall. Will visit again.'
        WHEN 2 THEN 'Amazing deals and friendly staff. Very satisfied.'
        ELSE 'Outstanding quality and professional service. Worth every penny!'
    END,
    true
FROM public.profiles p
CROSS JOIN public.merchants m
WHERE random() < 0.02
LIMIT 100;

-- Insert sample community posts
INSERT INTO public.community_posts (user_id, content)
SELECT 
    id,
    CASE (random() * 5)::int
        WHEN 0 THEN 'Just got an amazing deal! The service was fantastic and I earned great JaiCoins.'
        WHEN 1 THEN 'Has anyone tried the new restaurant at C-Scheme? Looking for recommendations.'
        WHEN 2 THEN 'Loving the JaiCoin rewards system! Already earned 500+ coins this month.'
        WHEN 3 THEN 'Great community here! Thanks for all the amazing deal recommendations.'
        ELSE 'Found some incredible offers today. This platform is amazing for savings!'
    END
FROM public.profiles
WHERE random() < 0.4
LIMIT 30;

-- Insert sample group challenges
INSERT INTO public.group_challenges (
    title, description, challenge_type, target_value, reward_amount,
    end_date, max_participants, created_by
)
SELECT 
    'Referral Champion',
    'Refer 5 friends and earn bonus JaiCoins',
    'referral',
    5,
    500,
    NOW() + INTERVAL '30 days',
    100,
    (SELECT id FROM public.profiles LIMIT 1)
UNION ALL
SELECT 
    'Review Master',
    'Write 10 detailed reviews',
    'review',
    10,
    300,
    NOW() + INTERVAL '30 days',
    50,
    (SELECT id FROM public.profiles LIMIT 1)
UNION ALL
SELECT 
    'Social Butterfly',
    'Share 15 deals on social media',
    'social',
    15,
    250,
    NOW() + INTERVAL '30 days',
    75,
    (SELECT id FROM public.profiles LIMIT 1)
UNION ALL
SELECT 
    'Big Spender',
    'Make purchases worth 10000 JaiCoins',
    'spending',
    10000,
    1000,
    NOW() + INTERVAL '30 days',
    30,
    (SELECT id FROM public.profiles LIMIT 1);

-- Add some challenge participants
INSERT INTO public.challenge_participants (challenge_id, user_id, current_progress)
SELECT 
    gc.id,
    p.id,
    (random() * gc.target_value * 0.8)::int
FROM public.group_challenges gc
CROSS JOIN public.profiles p
WHERE random() < 0.3
LIMIT 50;
