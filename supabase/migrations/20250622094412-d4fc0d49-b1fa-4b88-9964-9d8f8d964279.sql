
-- Fix the trigger function to handle missing deal_id column
CREATE OR REPLACE FUNCTION public.update_merchant_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update merchant stats when new deal is created
    IF TG_TABLE_NAME = 'deals' THEN
      UPDATE public.merchants 
      SET total_deals = total_deals + 1, updated_at = NOW()
      WHERE id = NEW.merchant_id;
    END IF;
    
    -- Update merchant stats when new review is created
    -- Only process if the review is for a deal (some reviews might not have deal_id)
    IF TG_TABLE_NAME = 'reviews' THEN
      -- Check if deal_id column exists and is not null
      IF (SELECT column_name FROM information_schema.columns 
          WHERE table_name = 'reviews' AND column_name = 'deal_id') IS NOT NULL 
         AND NEW.deal_id IS NOT NULL THEN
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
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Now add the missing columns to existing tables
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_product_sale BOOLEAN DEFAULT false;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS inventory_count INTEGER DEFAULT 0;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS product_details JSONB DEFAULT '{}';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deal_type TEXT DEFAULT 'service';

-- Add locality to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locality TEXT;

-- Create orders table for checkout functionality
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  order_code TEXT UNIQUE DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  jaicoin_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'online',
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  order_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Create get_order_details function
CREATE OR REPLACE FUNCTION get_order_details(order_uuid uuid)
RETURNS TABLE (
  id uuid,
  order_code text,
  quantity integer,
  total_amount numeric,
  jaicoin_used integer,
  status text,
  payment_method text,
  customer_name text,
  deal_title text,
  deal_discounted_price numeric,
  deal_jaicoin_reward integer,
  deal_is_product_sale boolean,
  merchant_business_name text,
  merchant_address text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_code,
    o.quantity,
    o.total_amount,
    o.jaicoin_used,
    o.status,
    o.payment_method,
    o.customer_name,
    d.title as deal_title,
    d.discounted_price as deal_discounted_price,
    d.jaicoin_reward as deal_jaicoin_reward,
    d.is_product_sale as deal_is_product_sale,
    m.business_name as merchant_business_name,
    m.address as merchant_address
  FROM orders o
  JOIN deals d ON o.deal_id = d.id
  JOIN merchants m ON o.merchant_id = m.id
  WHERE o.id = order_uuid;
END;
$$;

-- Insert some sample deals data to test
INSERT INTO deals (
  title, description, category, subcategory, deal_type, 
  original_price, discounted_price, discount_percentage,
  is_product_sale, inventory_count, product_details,
  merchant_id, is_active, is_featured, jaicoin_reward,
  location, start_date, end_date
) VALUES 
(
  'Premium Headphones - Wireless Bluetooth', 
  'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
  'Electronics', 'Audio', 'product',
  2999, 1999, 33,
  true, 50, '{"brand": "AudioTech", "warranty": "1 year", "delivery_time": "2-3 days", "return_policy": "7 days"}',
  (SELECT id FROM merchants LIMIT 1), 
  true, true, 15,
  'Online', now(), now() + interval '30 days'
),
(
  'Spa Package - Full Body Massage',
  'Relaxing full body massage with aromatherapy oils and steam bath.',
  'Beauty & Wellness', 'Spa', 'service',
  1500, 899, 40,
  false, 0, '{}',
  (SELECT id FROM merchants LIMIT 1),
  true, true, 10,
  'Malviya Nagar, Jaipur', now(), now() + interval '15 days'
),
(
  'Smartphone - Latest Model',
  'Latest smartphone with 128GB storage, triple camera, and fast charging.',
  'Electronics', 'Mobile', 'product', 
  25999, 19999, 23,
  true, 25, '{"brand": "TechPro", "warranty": "2 years", "delivery_time": "1-2 days", "return_policy": "15 days"}',
  (SELECT id FROM merchants LIMIT 1),
  true, false, 25,
  'Online', now(), now() + interval '7 days'
);
