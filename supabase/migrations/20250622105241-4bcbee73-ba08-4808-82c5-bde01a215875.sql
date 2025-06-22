
-- Create products table separate from deals
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES public.merchants(id) NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  subcategory text,
  brand text,
  model text,
  sku text UNIQUE,
  original_price numeric(10,2) NOT NULL,
  discounted_price numeric(10,2),
  discount_percentage integer DEFAULT 0,
  inventory_count integer DEFAULT 0,
  min_order_quantity integer DEFAULT 1,
  max_order_quantity integer,
  weight numeric(8,2),
  dimensions jsonb DEFAULT '{}',
  specifications jsonb DEFAULT '{}',
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  shipping_required boolean DEFAULT true,
  shipping_weight numeric(8,2),
  warranty_period text,
  return_policy text,
  jaicoin_reward integer DEFAULT 0,
  total_sales integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add product_id to deals table to link deals to products (optional)
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id);

-- Create product_reviews table for detailed product reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  merchant_id uuid REFERENCES public.merchants(id) NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title text,
  review_text text,
  verified_purchase boolean DEFAULT false,
  helpful_votes integer DEFAULT 0,
  images text[] DEFAULT '{}',
  jaicoin_rewarded boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create order_items table for tracking individual products in orders
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) NOT NULL,
  product_id uuid REFERENCES public.products(id),
  deal_id uuid REFERENCES public.deals(id),
  item_type text NOT NULL CHECK (item_type IN ('product', 'deal', 'service')),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  discount_applied numeric(10,2) DEFAULT 0,
  jaicoin_used integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for products (public read, merchant write)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Merchants can manage their products" ON public.products;
CREATE POLICY "Merchants can manage their products" ON public.products
  FOR ALL USING (
    merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    )
  );

-- RLS policies for product_reviews
DROP POLICY IF EXISTS "Anyone can view product reviews" ON public.product_reviews;
CREATE POLICY "Anyone can view product reviews" ON public.product_reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create product reviews" ON public.product_reviews;
CREATE POLICY "Users can create product reviews" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.product_reviews;
CREATE POLICY "Users can update their own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for order_items
DROP POLICY IF EXISTS "Users can view their order items" ON public.order_items;
CREATE POLICY "Users can view their order items" ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;
CREATE POLICY "Users can create order items for their orders" on public.order_items
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- Insert merchants (only if they don't exist - checking by business_name manually)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.merchants WHERE business_name = 'Tech Zone Electronics') THEN
    INSERT INTO public.merchants (business_name, business_type, address, phone, email, description, is_verified, is_active, total_deals, total_reviews, average_rating) VALUES
    ('Tech Zone Electronics', 'Electronics', 'Shop 45, Crystal Palm Mall, Malviya Nagar, Jaipur', '+911412345001', 'contact@techzone.com', 'Premium electronics store with latest gadgets and accessories', true, true, 15, 89, 4.5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.merchants WHERE business_name = 'Fashion Forward Boutique') THEN
    INSERT INTO public.merchants (business_name, business_type, address, phone, email, description, is_verified, is_active, total_deals, total_reviews, average_rating) VALUES
    ('Fashion Forward Boutique', 'Fashion', '23, C-Scheme, Near MI Road, Jaipur', '+911412345002', 'info@fashionforward.com', 'Trendy clothing and accessories for modern lifestyle', true, true, 22, 156, 4.3);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.merchants WHERE business_name = 'Spice Route Restaurant') THEN
    INSERT INTO public.merchants (business_name, business_type, address, phone, email, description, is_verified, is_active, total_deals, total_reviews, average_rating) VALUES
    ('Spice Route Restaurant', 'Food', '12, Vaishali Nagar, Jaipur', '+911412345003', 'orders@spiceroute.com', 'Authentic Rajasthani cuisine with modern twist', true, true, 8, 234, 4.7);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.merchants WHERE business_name = 'Beauty Bliss Salon') THEN
    INSERT INTO public.merchants (business_name, business_type, address, phone, email, description, is_verified, is_active, total_deals, total_reviews, average_rating) VALUES
    ('Beauty Bliss Salon', 'Beauty', '67, Mansarovar, Jaipur', '+911412345004', 'appointments@beautybliss.com', 'Premium beauty and wellness services', true, true, 12, 178, 4.4);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.merchants WHERE business_name = 'Home Decor Studio') THEN
    INSERT INTO public.merchants (business_name, business_type, address, phone, email, description, is_verified, is_active, total_deals, total_reviews, average_rating) VALUES
    ('Home Decor Studio', 'Home & Garden', '89, Tonk Road, Jaipur', '+911412345005', 'info@homedecor.com', 'Furniture and home decoration items', true, true, 18, 92, 4.2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.merchants WHERE business_name = 'Fitness First Gym') THEN
    INSERT INTO public.merchants (business_name, business_type, address, phone, email, description, is_verified, is_active, total_deals, total_reviews, average_rating) VALUES
    ('Fitness First Gym', 'Health & Fitness', '34, JLN Marg, Jaipur', '+911412345006', 'info@fitnessfirst.com', 'Complete fitness solutions and training', true, true, 6, 67, 4.6);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.merchants WHERE business_name = 'Book Cafe Literary') THEN
    INSERT INTO public.merchants (business_name, business_type, address, phone, email, description, is_verified, is_active, total_deals, total_reviews, average_rating) VALUES
    ('Book Cafe Literary', 'Books & Media', '56, Bani Park, Jaipur', '+911412345007', 'hello@bookcafe.com', 'Books, coffee and literary events', true, true, 9, 45, 4.8);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.merchants WHERE business_name = 'Organic Grocery Store') THEN
    INSERT INTO public.merchants (business_name, business_type, address, phone, email, description, is_verified, is_active, total_deals, total_reviews, average_rating) VALUES
    ('Organic Grocery Store', 'Grocery', '78, Shyam Nagar, Jaipur', '+911412345008', 'orders@organicstore.com', 'Fresh organic fruits, vegetables and groceries', true, true, 25, 203, 4.1);
  END IF;
END $$;

-- Insert sample products
INSERT INTO public.products (merchant_id, name, description, category, subcategory, brand, original_price, discounted_price, discount_percentage, inventory_count, specifications, images, tags, is_featured, jaicoin_reward) VALUES
-- Electronics
((SELECT id FROM public.merchants WHERE business_name = 'Tech Zone Electronics' LIMIT 1), 'iPhone 14 Pro 256GB', 'Latest iPhone with Pro camera system and A16 Bionic chip', 'Electronics', 'Smartphones', 'Apple', 129900.00, 119900.00, 8, 15, '{"storage": "256GB", "color": "Deep Purple", "warranty": "1 year"}', '{"https://example.com/iphone14pro.jpg"}', '{"smartphone", "apple", "premium"}', true, 500),
((SELECT id FROM public.merchants WHERE business_name = 'Tech Zone Electronics' LIMIT 1), 'Samsung 65" 4K Smart TV', 'Ultra HD Smart TV with HDR and built-in streaming apps', 'Electronics', 'Televisions', 'Samsung', 89999.00, 69999.00, 22, 8, '{"size": "65 inch", "resolution": "4K", "smart": true}', '{"https://example.com/samsung-tv.jpg"}', '{"tv", "samsung", "4k", "smart"}', true, 300),
((SELECT id FROM public.merchants WHERE business_name = 'Tech Zone Electronics' LIMIT 1), 'MacBook Air M2', 'Lightweight laptop with M2 chip and all-day battery life', 'Electronics', 'Laptops', 'Apple', 119900.00, 109900.00, 8, 5, '{"processor": "M2", "memory": "8GB", "storage": "256GB SSD"}', '{"https://example.com/macbook-air.jpg"}', '{"laptop", "apple", "macbook"}', false, 400),

-- Fashion
((SELECT id FROM public.merchants WHERE business_name = 'Fashion Forward Boutique' LIMIT 1), 'Designer Lehenga Set', 'Handcrafted lehenga with intricate embroidery work', 'Fashion', 'Ethnic Wear', 'Rajasthani Craft', 25000.00, 18500.00, 26, 12, '{"fabric": "Silk", "work": "Hand Embroidery", "occasion": "Wedding"}', '{"https://example.com/lehenga.jpg"}', '{"lehenga", "ethnic", "wedding", "handcrafted"}', true, 250),
((SELECT id FROM public.merchants WHERE business_name = 'Fashion Forward Boutique' LIMIT 1), 'Casual Cotton Kurta', 'Comfortable cotton kurta for daily wear', 'Fashion', 'Casual Wear', 'Local Brand', 1200.00, 899.00, 25, 50, '{"fabric": "Cotton", "fit": "Regular", "care": "Machine Wash"}', '{"https://example.com/kurta.jpg"}', '{"kurta", "cotton", "casual"}', false, 50),

-- Beauty Products
((SELECT id FROM public.merchants WHERE business_name = 'Beauty Bliss Salon' LIMIT 1), 'Bridal Makeup Kit', 'Complete bridal makeup kit with premium products', 'Beauty & Wellness', 'Makeup', 'Professional', 8500.00, 6500.00, 24, 20, '{"items": "Foundation, Lipstick, Eyeshadow, Brushes", "skin_type": "All"}', '{"https://example.com/makeup-kit.jpg"}', '{"makeup", "bridal", "professional"}', true, 150),

-- Home & Garden
((SELECT id FROM public.merchants WHERE business_name = 'Home Decor Studio' LIMIT 1), 'Wooden Coffee Table', 'Handcrafted wooden coffee table with storage', 'Home & Garden', 'Furniture', 'Craftsman', 15000.00, 12000.00, 20, 8, '{"material": "Sheesham Wood", "dimensions": "120x60x45 cm", "storage": true}', '{"https://example.com/coffee-table.jpg"}', '{"furniture", "wooden", "handcrafted"}', false, 200),
((SELECT id FROM public.merchants WHERE business_name = 'Home Decor Studio' LIMIT 1), 'Decorative Wall Art Set', 'Set of 3 canvas paintings with Rajasthani themes', 'Home & Garden', 'Decor', 'Local Artist', 4500.00, 3200.00, 29, 25, '{"pieces": 3, "size": "40x30 cm each", "theme": "Rajasthani"}', '{"https://example.com/wall-art.jpg"}', '{"art", "canvas", "rajasthani", "decor"}', true, 80),

-- Books
((SELECT id FROM public.merchants WHERE business_name = 'Book Cafe Literary' LIMIT 1), 'Rajasthan History Collection', 'Set of 5 books about Rajasthan history and culture', 'Books & Media', 'History', 'Various Authors', 2500.00, 1800.00, 28, 15, '{"books": 5, "language": "English", "pages": "1200+ total"}', '{"https://example.com/book-set.jpg"}', '{"books", "history", "rajasthan", "culture"}', false, 60),

-- Grocery
((SELECT id FROM public.merchants WHERE business_name = 'Organic Grocery Store' LIMIT 1), 'Organic Fruit Basket', 'Fresh organic fruits - weekly subscription', 'Grocery', 'Fruits', 'Organic Farm', 800.00, 650.00, 19, 50, '{"items": "Seasonal Fruits 2kg", "organic": true, "subscription": "Weekly"}', '{"https://example.com/fruit-basket.jpg"}', '{"organic", "fruits", "fresh", "subscription"}', true, 40);

-- Insert sample deals (both service deals and product deals)
INSERT INTO public.deals (merchant_id, product_id, title, description, category, subcategory, original_price, discounted_price, discount_percentage, is_product_sale, inventory_count, jaicoin_reward, is_active, is_featured, max_redemptions, tags, terms_conditions, location) VALUES
-- Service Deals
((SELECT id FROM public.merchants WHERE business_name = 'Beauty Bliss Salon' LIMIT 1), NULL, 'Bridal Makeover Package', 'Complete bridal makeover with hair styling and makeup', 'Beauty & Wellness', 'Bridal Services', 8000.00, 6000.00, 25, false, 0, 150, true, true, 50, '{"bridal", "makeover", "premium"}', 'Valid for bookings within 3 months. Advance booking required.', 'Mansarovar'),
((SELECT id FROM public.merchants WHERE business_name = 'Fitness First Gym' LIMIT 1), NULL, 'Annual Gym Membership', 'Complete fitness access with trainer guidance', 'Health & Fitness', 'Membership', 15000.00, 9999.00, 33, false, 0, 200, true, true, 100, '{"gym", "fitness", "annual"}', 'Valid for 1 year from date of purchase. Non-transferable.', 'JLN Marg'),
((SELECT id FROM public.merchants WHERE business_name = 'Spice Route Restaurant' LIMIT 1), NULL, 'Family Dinner Special', 'Dinner for 4 people with dessert and welcome drink', 'Food & Dining', 'Family Meal', 2400.00, 1800.00, 25, false, 0, 100, true, false, 200, '{"family", "dinner", "restaurant"}', 'Valid till end of month. Reservation required.', 'Vaishali Nagar'),

-- Product Sale Deals
((SELECT id FROM public.merchants WHERE business_name = 'Tech Zone Electronics' LIMIT 1), (SELECT id FROM public.products WHERE name = 'iPhone 14 Pro 256GB' LIMIT 1), 'iPhone 14 Pro - Limited Offer', 'Get the latest iPhone at special price with warranty', 'Electronics', 'Smartphones', 129900.00, 119900.00, 8, true, 15, 500, true, true, 15, '{"iphone", "apple", "smartphone"}', 'Limited stock offer. Full warranty included.', 'Crystal Palm Mall'),
((SELECT id FROM public.merchants WHERE business_name = 'Tech Zone Electronics' LIMIT 1), (SELECT id FROM public.products WHERE name = 'Samsung 65" 4K Smart TV' LIMIT 1), 'Smart TV Mega Sale', 'Premium 4K Smart TV at unbeatable price', 'Electronics', 'Televisions', 89999.00, 69999.00, 22, true, 8, 300, true, true, 8, '{"tv", "samsung", "4K"}', 'Installation and setup included. 2 year warranty.', 'Crystal Palm Mall'),
((SELECT id FROM public.merchants WHERE business_name = 'Fashion Forward Boutique' LIMIT 1), (SELECT id FROM public.products WHERE name = 'Designer Lehenga Set' LIMIT 1), 'Wedding Season Special', 'Designer lehenga with matching accessories', 'Fashion', 'Ethnic Wear', 25000.00, 18500.00, 26, true, 12, 250, true, true, 12, '{"lehenga", "wedding", "designer"}', 'Customization available. Final sale item.', 'C-Scheme'),
((SELECT id FROM public.merchants WHERE business_name = 'Home Decor Studio' LIMIT 1), (SELECT id FROM public.products WHERE name = 'Wooden Coffee Table' LIMIT 1), 'Furniture Flash Sale', 'Handcrafted coffee table with free delivery', 'Home & Garden', 'Furniture', 15000.00, 12000.00, 20, true, 8, 200, true, false, 8, '{"furniture", "wooden"}', 'Free delivery within Jaipur. Assembly included.', 'Tonk Road');

-- Insert sample reviews for products
INSERT INTO public.product_reviews (product_id, merchant_id, rating, review_title, review_text, verified_purchase, helpful_votes) VALUES
((SELECT id FROM public.products WHERE name = 'iPhone 14 Pro 256GB' LIMIT 1), (SELECT id FROM public.merchants WHERE business_name = 'Tech Zone Electronics' LIMIT 1), 5, 'Excellent phone!', 'Amazing camera quality and performance. Totally worth the upgrade.', true, 12),
((SELECT id FROM public.products WHERE name = 'Samsung 65" 4K Smart TV' LIMIT 1), (SELECT id FROM public.merchants WHERE business_name = 'Tech Zone Electronics' LIMIT 1), 4, 'Great picture quality', 'Very good TV for the price. Smart features work well.', true, 8),
((SELECT id FROM public.products WHERE name = 'Designer Lehenga Set' LIMIT 1), (SELECT id FROM public.merchants WHERE business_name = 'Fashion Forward Boutique' LIMIT 1), 5, 'Perfect for my wedding', 'Beautiful work and great quality fabric. Highly recommended!', true, 15),
((SELECT id FROM public.products WHERE name = 'Wooden Coffee Table' LIMIT 1), (SELECT id FROM public.merchants WHERE business_name = 'Home Decor Studio' LIMIT 1), 4, 'Good quality furniture', 'Well made and sturdy. Delivery was on time.', true, 6);

-- Update product ratings based on reviews
UPDATE public.products SET 
  average_rating = (
    SELECT AVG(rating)::numeric(3,2) 
    FROM public.product_reviews 
    WHERE product_id = products.id
  ),
  total_reviews = (
    SELECT COUNT(*) 
    FROM public.product_reviews 
    WHERE product_id = products.id
  )
WHERE id IN (
  SELECT DISTINCT product_id FROM public.product_reviews
);

-- Insert some community posts about products and deals
INSERT INTO public.community_posts (content, likes_count) VALUES
('Just bought the iPhone 14 Pro from Tech Zone! Amazing deal and great service 📱✨ #JaipurDeals', 23),
('The bridal makeover at Beauty Bliss was incredible! Perfect for my sister''s wedding 💄👰', 18),
('Found the best Rajasthani thali at Spice Route. Must try! 🍽️ #JaipurFood', 31),
('Home Decor Studio has amazing furniture. Just got a beautiful coffee table! 🏡', 14),
('Annual gym membership at such a great price! Time to get fit 💪 #FitnessGoals', 9);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_merchant_id ON public.products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_deals_product_id ON public.deals(product_id);
CREATE INDEX IF NOT EXISTS idx_deals_is_product_sale ON public.deals(is_product_sale);
