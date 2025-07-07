
-- Insert sample deals across different categories
INSERT INTO public.deals (
  title, description, category, subcategory, original_price, discounted_price, 
  discount_percentage, merchant_id, coupon_type, is_active, is_featured, 
  max_redemptions, current_redemptions, jaicoin_reward, min_order_value, 
  validity_days, location, tags, terms_conditions, usage_terms
) VALUES 
-- Food & Dining Category
('Authentic Rajasthani Thali at Royal Heritage', 'Experience the royal flavors of Rajasthan with our traditional thali featuring dal baati churma, gatte ki sabzi, and more authentic dishes', 'Food & Dining', 'Traditional', 800, 400, 50, (SELECT id FROM merchants WHERE business_name LIKE '%Royal Heritage%' LIMIT 1), 'discount', true, true, 100, 15, 75, 200, 30, 'Tonk Road, Jaipur', ARRAY['rajasthani', 'traditional', 'thali'], 'Valid for dine-in only. Prior reservation recommended.', 'Show coupon before ordering'),

('Gourmet Pizza & Pasta Combo', 'Delicious wood-fired pizzas and fresh pasta made with authentic Italian ingredients', 'Food & Dining', 'Italian', 1200, 720, 40, (SELECT id FROM merchants WHERE business_name LIKE '%Peacock%' LIMIT 1), 'discount', true, false, 75, 8, 60, 500, 15, 'City Palace Area, Jaipur', ARRAY['pizza', 'pasta', 'italian'], 'Valid for lunch and dinner. Not valid on weekends.', 'Present coupon at time of ordering'),

('Street Food Festival Experience', 'Taste the best of Jaipur street food including pyaaz kachori, mirchi bada, and kulfi', 'Food & Dining', 'Street Food', 300, 180, 40, (SELECT id FROM merchants WHERE business_name LIKE '%LMB%' LIMIT 1), 'discount', true, true, 200, 45, 25, 100, 7, 'Johari Bazaar, Jaipur', ARRAY['street-food', 'local', 'snacks'], 'Valid during festival hours only.', 'Show coupon to vendor'),

-- Beauty & Wellness Category
('Luxury Spa & Massage Package', 'Rejuvenating 90-minute spa session with aromatherapy massage and facial treatment', 'Beauty & Wellness', 'Spa', 3500, 1750, 50, (SELECT id FROM merchants WHERE business_name LIKE '%Wellness%' LIMIT 1), 'discount', true, true, 50, 12, 150, 1000, 60, 'Bani Park, Jaipur', ARRAY['spa', 'massage', 'relaxation'], 'Appointment required. Valid Monday to Friday only.', 'Book in advance with coupon code'),

('Bridal Makeup & Hair Styling', 'Complete bridal makeover including HD makeup, hair styling, and draping', 'Beauty & Wellness', 'Bridal', 8000, 5600, 30, (SELECT id FROM merchants WHERE business_name LIKE '%Lakme%' LIMIT 1), 'discount', true, false, 25, 3, 250, 2000, 90, 'Vaishali Nagar, Jaipur', ARRAY['bridal', 'makeup', 'styling'], 'Trial session included. Book 1 week in advance.', 'Valid for bride only with valid ID'),

('Men\'s Grooming Package', 'Complete grooming service including haircut, beard styling, and facial', 'Beauty & Wellness', 'Men\'s Grooming', 1500, 900, 40, (SELECT id FROM merchants WHERE business_name LIKE '%Jawed Habib%' LIMIT 1), 'discount', true, false, 100, 22, 50, 500, 30, 'Malviya Nagar, Jaipur', ARRAY['grooming', 'haircut', 'men'], 'Valid on weekdays only.', 'Show coupon before service'),

-- Shopping Category
('Traditional Rajasthani Jewelry Set', 'Exquisite handcrafted jewelry set featuring Kundan work and precious stones', 'Shopping', 'Jewelry', 15000, 9000, 40, (SELECT id FROM merchants WHERE business_name LIKE '%Gem Palace%' LIMIT 1), 'discount', true, true, 30, 5, 400, 5000, 180, 'MI Road, Jaipur', ARRAY['jewelry', 'traditional', 'kundan'], 'Certificate of authenticity included.', 'Valid on original pieces only'),

('Block Print Fabric Collection', 'Premium cotton fabrics with traditional Rajasthani block prints', 'Shopping', 'Textiles', 2500, 1500, 40, (SELECT id FROM merchants WHERE business_name LIKE '%Anokhi%' LIMIT 1), 'discount', true, false, 150, 28, 75, 1000, 45, 'C-Scheme, Jaipur', ARRAY['textiles', 'block-print', 'cotton'], 'Minimum 5 meters purchase required.', 'Present coupon at billing counter'),

('Handicraft Home Decor Items', 'Beautiful handcrafted home decor pieces including paintings, sculptures, and artifacts', 'Shopping', 'Handicrafts', 5000, 3500, 30, (SELECT id FROM merchants WHERE business_name LIKE '%Handicrafts%' LIMIT 1), 'discount', true, true, 80, 15, 175, 2000, 60, 'Hawa Mahal Area, Jaipur', ARRAY['handicrafts', 'decor', 'art'], 'Free shipping within Jaipur.', 'Show coupon for discount'),

-- Electronics Category
('Latest Smartphone with Accessories', 'Premium smartphone with screen protector, case, and wireless charger', 'Electronics', 'Mobile', 25000, 20000, 20, (SELECT id FROM merchants WHERE business_name LIKE '%Mobile Hub%' LIMIT 1), 'discount', true, false, 40, 8, 500, 15000, 30, 'Gaurav Tower, Jaipur', ARRAY['smartphone', 'mobile', 'accessories'], '1 year warranty included.', 'Valid on selected models only'),

('Smart Home Appliances Bundle', 'Complete smart home package including smart TV, speakers, and automation devices', 'Electronics', 'Home Appliances', 45000, 31500, 30, (SELECT id FROM merchants WHERE business_name LIKE '%Reliance Digital%' LIMIT 1), 'discount', true, true, 20, 3, 800, 25000, 45, 'World Trade Park, Jaipur', ARRAY['smart-home', 'appliances', 'technology'], 'Professional installation included.', 'Installation within 48 hours'),

('Gaming Laptop & Accessories', 'High-performance gaming laptop with gaming mouse, keyboard, and headset', 'Electronics', 'Computers', 65000, 52000, 20, (SELECT id FROM merchants WHERE business_name LIKE '%Croma%' LIMIT 1), 'discount', true, false, 15, 2, 1200, 40000, 60, 'Malviya Nagar, Jaipur', ARRAY['gaming', 'laptop', 'accessories'], '2 year extended warranty available.', 'Valid for students with ID proof'),

-- Health & Fitness Category
('Annual Gym Membership Premium', 'Complete gym access with personal trainer sessions and nutrition consultation', 'Health & Fitness', 'Gym', 15000, 7500, 50, (SELECT id FROM merchants WHERE business_name LIKE '%Gold Gym%' LIMIT 1), 'discount', true, true, 100, 35, 300, 5000, 365, 'Vaishali Nagar, Jaipur', ARRAY['gym', 'fitness', 'training'], 'Medical clearance required for beginners.', 'Valid for 12 months from activation'),

('Yoga & Meditation Classes', 'Complete wellness package with yoga classes, meditation sessions, and ayurvedic consultation', 'Health & Fitness', 'Yoga', 8000, 4800, 40, (SELECT id FROM merchants WHERE business_name LIKE '%Fitness First%' LIMIT 1), 'discount', true, false, 75, 18, 200, 3000, 90, 'C-Scheme, Jaipur', ARRAY['yoga', 'meditation', 'wellness'], 'Suitable for all age groups.', 'Attend orientation session first'),

('Sports Equipment Package', 'Complete sports equipment set for badminton, tennis, or cricket', 'Health & Fitness', 'Sports', 12000, 8400, 30, (SELECT id FROM merchants WHERE business_name LIKE '%Anytime Fitness%' LIMIT 1), 'discount', true, false, 50, 12, 250, 5000, 120, 'Mansarovar, Jaipur', ARRAY['sports', 'equipment', 'fitness'], 'Quality guarantee included.', 'Choose sport type at time of redemption'),

-- Automotive Category
('Complete Car Service Package', 'Comprehensive car servicing including oil change, brake check, and AC service', 'Automotive', 'Service', 5000, 3000, 40, (SELECT id FROM merchants WHERE business_name LIKE '%Auto Care%' LIMIT 1), 'discount', true, false, 200, 45, 150, 2000, 90, 'Sikar Road, Jaipur', ARRAY['car-service', 'maintenance', 'automotive'], 'Valid for all car models.', 'Book appointment 24 hours in advance'),

('Premium Car Wash & Detailing', 'Complete car washing and detailing service with interior cleaning', 'Automotive', 'Car Wash', 2500, 1500, 40, (SELECT id FROM merchants WHERE business_name LIKE '%Quick Car%' LIMIT 1), 'discount', true, true, 300, 78, 75, 1000, 30, 'Jagatpura, Jaipur', ARRAY['car-wash', 'detailing', 'cleaning'], 'Pickup and drop service available.', 'Valid for cars and SUVs only'),

-- Services Category
('Professional Photography Session', 'Complete photography package for events, portraits, or product shoots', 'Services', 'Photography', 8000, 4800, 40, (SELECT id FROM merchants WHERE business_name LIKE '%Photography%' LIMIT 1), 'discount', true, false, 60, 15, 200, 3000, 60, 'C-Scheme, Jaipur', ARRAY['photography', 'events', 'portraits'], 'Edited photos delivered within 7 days.', 'Book session with advance payment'),

('Event Planning & Management', 'Complete event planning service for weddings, parties, and corporate events', 'Services', 'Events', 25000, 17500, 30, (SELECT id FROM merchants WHERE business_name LIKE '%Event Management%' LIMIT 1), 'discount', true, true, 25, 8, 500, 15000, 180, 'Bani Park, Jaipur', ARRAY['events', 'planning', 'management'], 'Customized packages available.', 'Advance booking required'),

-- Travel Category
('Udaipur Heritage Tour Package', '3-day heritage tour of Udaipur including accommodation, meals, and sightseeing', 'Travel', 'Tours', 12000, 8400, 30, (SELECT id FROM merchants WHERE business_name LIKE '%Travel Experts%' LIMIT 1), 'discount', true, true, 40, 12, 300, 5000, 90, 'MI Road, Jaipur', ARRAY['travel', 'udaipur', 'heritage'], 'Valid for groups of 2-6 people.', 'Book 15 days in advance'),

('Rajasthan Cultural Circuit', '5-day tour covering Jaipur, Jodhpur, and Jaisalmer with cultural experiences', 'Travel', 'Packages', 20000, 15000, 25, (SELECT id FROM merchants WHERE business_name LIKE '%Rajasthan Tours%' LIMIT 1), 'discount', true, false, 30, 5, 400, 10000, 120, 'Station Road, Jaipur', ARRAY['rajasthan', 'culture', 'tour'], 'All meals and accommodation included.', 'Valid for Indian nationals only'),

-- Education Category
('Digital Marketing Course', 'Complete digital marketing certification course with hands-on projects', 'Education', 'Professional', 15000, 9000, 40, (SELECT id FROM merchants WHERE business_name LIKE '%Music Academy%' LIMIT 1), 'discount', true, false, 50, 15, 300, 5000, 180, 'Vaishali Nagar, Jaipur', ARRAY['education', 'digital-marketing', 'certification'], 'Course completion certificate provided.', 'Valid for 6 months from enrollment'),

('Classical Dance Classes', 'Traditional Kathak dance classes for beginners and intermediate levels', 'Education', 'Arts', 8000, 5600, 30, (SELECT id FROM merchants WHERE business_name LIKE '%Dance Classes%' LIMIT 1), 'discount', true, true, 75, 25, 200, 3000, 120, 'Malviya Nagar, Jaipur', ARRAY['dance', 'kathak', 'classical'], 'Costume and accessories included.', 'Regular practice sessions mandatory');
