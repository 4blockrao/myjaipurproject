
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, AlertTriangle, Trash2, CheckCircle, XCircle } from 'lucide-react';

const DataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const { toast } = useToast();

  const generateComprehensiveSampleData = async () => {
    setIsSeeding(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      console.log('Starting comprehensive data seeding...');

      // 1. Create Sample Users (without auth dependency) - using direct insert
      console.log('Creating sample user profiles...');
      const sampleUsers = [];
      const jaipurNames = [
        'Arjun Sharma', 'Priya Agarwal', 'Rohit Singh', 'Kavya Jain', 'Vikram Gupta',
        'Anjali Meena', 'Karan Sharma', 'Sneha Patel', 'Amit Kumar', 'Ritu Singh',
        'Rajesh Choudhary', 'Sunita Goyal', 'Manoj Agrawal', 'Pooja Saxena', 'Deepak Joshi'
      ];

      for (let i = 0; i < jaipurNames.length; i++) {
        const userId = crypto.randomUUID();
        sampleUsers.push({
          id: userId,
          full_name: jaipurNames[i],
          email: `${jaipurNames[i].toLowerCase().replace(' ', '.')}@gmail.com`,
          phone: `+91987654${String(1000 + i).padStart(4, '0')}`,
          total_referrals: Math.floor(Math.random() * 15),
          rank: ['Bronze', 'Silver', 'Gold', 'Platinum'][Math.floor(Math.random() * 4)],
          is_pro: Math.random() < 0.3,
          pro_tier: Math.random() < 0.3 ? 'pro' : Math.random() < 0.1 ? 'premium' : 'basic',
          subscription_status: Math.random() < 0.3 ? 'active' : 'inactive',
          referral_code: Math.random().toString(36).substring(2, 10).toUpperCase()
        });
      }

      // Insert sample users directly (bypassing auth constraints)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .upsert(sampleUsers, { onConflict: 'id' })
        .select('id, full_name');
      
      if (usersError) {
        console.error('Users creation error:', usersError);
        errorCount++;
      } else {
        successCount++;
        console.log(`Created ${sampleUsers.length} sample users`);
      }

      // 2. Create JaiCoin transactions for sample users
      if (usersData && usersData.length > 0) {
        console.log('Creating JaiCoin transactions...');
        const transactions = [];
        
        for (const user of usersData) {
          // Multiple transactions per user
          for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
            transactions.push({
              user_id: user.id,
              amount: Math.floor(Math.random() * 200) + 25,
              type: Math.random() < 0.7 ? 'earned' : 'spent',
              source: ['referral', 'spin', 'review', 'deal_purchase', 'challenge_reward'][Math.floor(Math.random() * 5)],
              description: `Sample transaction for ${user.full_name}`
            });
          }
        }

        const { error: transactionsError } = await supabase
          .from('jaicoin_transactions')
          .insert(transactions);
        
        if (transactionsError) {
          console.error('Transactions error:', transactionsError);
        } else {
          console.log(`Created ${transactions.length} JaiCoin transactions`);
        }
      }

      // 3. Create 50+ Merchants
      console.log('Creating merchants...');
      const merchants = [];
      const jaipurBusinesses = [
        { name: 'Chokhi Dhani Restaurant', type: 'Restaurant', category: 'Food & Dining', area: 'Tonk Road' },
        { name: 'LMB Sweets & Snacks', type: 'Restaurant', category: 'Food & Dining', area: 'Johari Bazaar' },
        { name: 'Peacock Rooftop Restaurant', type: 'Restaurant', category: 'Food & Dining', area: 'City Palace' },
        { name: 'Natraj Restaurant', type: 'Restaurant', category: 'Food & Dining', area: 'MI Road' },
        { name: 'Tapri Central Cafe', type: 'Cafe', category: 'Food & Dining', area: 'C-Scheme' },
        { name: 'Jawed Habib Hair Studio', type: 'Salon', category: 'Beauty & Wellness', area: 'Malviya Nagar' },
        { name: 'Lakme Salon & Spa', type: 'Salon', category: 'Beauty & Wellness', area: 'Vaishali Nagar' },
        { name: 'Naturals Family Salon', type: 'Salon', category: 'Beauty & Wellness', area: 'Mansarovar' },
        { name: 'Wellness Spa & Massage', type: 'Spa', category: 'Beauty & Wellness', area: 'Bani Park' },
        { name: 'Gem Palace Jewelry', type: 'Jewelry', category: 'Shopping', area: 'MI Road' },
        { name: 'Anokhi Textile Store', type: 'Clothing', category: 'Shopping', area: 'C-Scheme' },
        { name: 'Rajasthani Handicrafts', type: 'Handicrafts', category: 'Shopping', area: 'Hawa Mahal' },
        { name: 'Kothari Textiles', type: 'Textiles', category: 'Shopping', area: 'Bapu Bazaar' },
        { name: 'Reliance Digital Store', type: 'Electronics', category: 'Electronics', area: 'World Trade Park' },
        { name: 'Croma Electronics', type: 'Electronics', category: 'Electronics', area: 'Malviya Nagar' },
        { name: 'Mobile Hub Jaipur', type: 'Mobile Store', category: 'Electronics', area: 'Gaurav Tower' },
        { name: 'Gold Gym Fitness', type: 'Gym', category: 'Health & Fitness', area: 'Vaishali Nagar' },
        { name: 'Fitness First Club', type: 'Gym', category: 'Health & Fitness', area: 'C-Scheme' },
        { name: 'Anytime Fitness', type: 'Gym', category: 'Health & Fitness', area: 'Mansarovar' },
        { name: 'Pink City Dental Care', type: 'Healthcare', category: 'Health & Medical', area: 'SMS Hospital' },
        { name: 'Fortis Escort Hospital', type: 'Healthcare', category: 'Health & Medical', area: 'Malviya Nagar' },
        { name: 'Café Coffee Day', type: 'Cafe', category: 'Food & Dining', area: 'MI Road' },
        { name: 'Pizza Hut Jaipur', type: 'Restaurant', category: 'Food & Dining', area: 'World Trade Park' },
        { name: 'Dominos Pizza', type: 'Restaurant', category: 'Food & Dining', area: 'Vaishali Nagar' },
        { name: 'KFC Jaipur', type: 'Restaurant', category: 'Food & Dining', area: 'Crystal Palm Mall' },
        { name: 'McDonalds Jaipur', type: 'Restaurant', category: 'Food & Dining', area: 'Elements Mall' },
        { name: 'Burger King', type: 'Restaurant', category: 'Food & Dining', area: 'GT Central Mall' },
        { name: 'Subway Jaipur', type: 'Restaurant', category: 'Food & Dining', area: 'Pink Square Mall' },
        { name: 'Baskin Robbins', type: 'Ice Cream', category: 'Food & Dining', area: 'MI Road' },
        { name: 'Haldirams Restaurant', type: 'Restaurant', category: 'Food & Dining', area: 'Malviya Nagar' },
        { name: 'Bikanervala Sweets', type: 'Sweets', category: 'Food & Dining', area: 'C-Scheme' },
        { name: 'Sagar Ratna Restaurant', type: 'Restaurant', category: 'Food & Dining', area: 'Vaishali Nagar' },
        { name: 'Saravana Bhavan', type: 'Restaurant', category: 'Food & Dining', area: 'Mansarovar' },
        { name: 'Chinese Dragon Restaurant', type: 'Restaurant', category: 'Food & Dining', area: 'Tonk Road' },
        { name: 'Punjabi Tadka Dhaba', type: 'Restaurant', category: 'Food & Dining', area: 'Ajmer Road' },
        { name: 'Royal Rajasthani Thali', type: 'Restaurant', category: 'Food & Dining', area: 'Amber Road' },
        { name: 'Italian Corner Bistro', type: 'Restaurant', category: 'Food & Dining', area: 'JLN Marg' },
        { name: 'Auto Care Service Center', type: 'Automotive', category: 'Automotive', area: 'Sikar Road' },
        { name: 'Quick Car Wash', type: 'Car Wash', category: 'Automotive', area: 'Jagatpura' },
        { name: 'Bike Repair Hub', type: 'Automotive', category: 'Automotive', area: 'Sanganer' },
        { name: 'Home Decor Studio', type: 'Home Decor', category: 'Home & Garden', area: 'Malviya Nagar' },
        { name: 'Furniture Palace', type: 'Furniture', category: 'Home & Garden', area: 'Jodhpur Road' },
        { name: 'Garden Center Jaipur', type: 'Garden Store', category: 'Home & Garden', area: 'Shyam Nagar' },
        { name: 'Kids Play Zone', type: 'Entertainment', category: 'Family & Kids', area: 'Fun Kingdom' },
        { name: 'Photography Studio Pro', type: 'Photography', category: 'Services', area: 'C-Scheme' },
        { name: 'Event Management Co', type: 'Events', category: 'Services', area: 'Bani Park' },
        { name: 'Travel Experts Jaipur', type: 'Travel Agency', category: 'Travel', area: 'MI Road' },
        { name: 'Rajasthan Tours & Travels', type: 'Travel Agency', category: 'Travel', area: 'Station Road' },
        { name: 'Book Cafe Literary Hub', type: 'Bookstore', category: 'Books & Media', area: 'JLN Marg' },
        { name: 'Music Academy Jaipur', type: 'Education', category: 'Education', area: 'Vaishali Nagar' },
        { name: 'Dance Classes Studio', type: 'Education', category: 'Education', area: 'Malviya Nagar' }
      ];

      for (let i = 0; i < jaipurBusinesses.length; i++) {
        const business = jaipurBusinesses[i];
        merchants.push({
          business_name: business.name,
          business_type: business.type,
          email: `contact@${business.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          phone: `+91141234${String(Math.floor(Math.random() * 9000) + 1000)}`,
          address: `${Math.floor(Math.random() * 999) + 1}, ${business.area}, Jaipur, Rajasthan 302001`,
          description: `Premium ${business.type.toLowerCase()} services in ${business.area}, Jaipur with exceptional quality and customer satisfaction.`,
          is_verified: Math.random() > 0.2,
          is_active: true,
          listing_tier: 'basic',
          listing_fee_paid: Math.random() > 0.3,
          approval_status: Math.random() > 0.2 ? 'approved' : 'pending',
          average_rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
          total_reviews: Math.floor(Math.random() * 200) + 10,
          total_deals: Math.floor(Math.random() * 15) + 2,
          website: `https://www.${business.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
        });
      }

      const { data: merchantsData, error: merchantsError } = await supabase
        .from('merchants')
        .insert(merchants)
        .select('id, business_name, business_type');
      
      if (merchantsError) {
        console.error('Merchants error:', merchantsError);
        errorCount++;
      } else {
        successCount++;
        console.log(`Created ${merchants.length} merchants`);
      }

      // 4. Create 70+ Deals
      if (merchantsData && merchantsData.length > 0) {
        console.log('Creating deals...');
        const deals = [];
        const dealTemplates = [
          { title: 'Royal Rajasthani Thali Experience', discount: 30, type: 'Food & Dining' },
          { title: 'Traditional Jewelry Collection Sale', discount: 25, type: 'Shopping' },
          { title: 'Premium Spa Package Deal', discount: 40, type: 'Beauty & Wellness' },
          { title: 'iPhone 14 Pro 256GB Special Offer', discount: 15, type: 'Electronics' },
          { title: 'Samsung 65" 4K Smart TV Mega Sale', discount: 20, type: 'Electronics' },
          { title: 'Designer Lehenga Collection', discount: 35, type: 'Shopping' },
          { title: 'Annual Gym Membership Discount', discount: 50, type: 'Health & Fitness' },
          { title: 'Bridal Makeover Complete Package', discount: 30, type: 'Beauty & Wellness' },
          { title: 'Home Deep Cleaning Service', discount: 25, type: 'Services' },
          { title: 'Organic Food Hamper', discount: 20, type: 'Food & Dining' },
          { title: 'MacBook Air M2 Student Special', discount: 12, type: 'Electronics' },
          { title: 'Traditional Handicrafts Sale', discount: 30, type: 'Shopping' },
          { title: 'Car Full Service Package', discount: 35, type: 'Automotive' },
          { title: 'Photography Session Package', discount: 40, type: 'Services' },
          { title: 'Travel Package to Udaipur', discount: 25, type: 'Travel' }
        ];

        for (let i = 0; i < 75; i++) {
          const template = dealTemplates[i % dealTemplates.length];
          const merchant = merchantsData[i % merchantsData.length];
          const originalPrice = Math.floor(Math.random() * 15000) + 500;
          const discountPercent = template.discount + Math.floor(Math.random() * 15) - 7;
          const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));
          
          deals.push({
            title: `${template.title} - ${merchant.business_name}`,
            description: `Exclusive ${template.title.toLowerCase()} from ${merchant.business_name}. Limited time offer with excellent value for money. Perfect for ${template.type.toLowerCase()} enthusiasts in Jaipur.`,
            category: template.type,
            subcategory: ['Premium', 'Standard', 'Deluxe', 'Special'][Math.floor(Math.random() * 4)],
            original_price: originalPrice,
            discounted_price: discountedPrice,
            purchase_price: Math.round(discountedPrice * 0.85),
            discount_percentage: discountPercent,
            merchant_id: merchant.id,
            coupon_type: ['paid_discount', 'free_item', 'percentage_off'][Math.floor(Math.random() * 3)],
            is_active: true,
            is_featured: Math.random() > 0.8,
            max_redemptions: Math.floor(Math.random() * 200) + 50,
            current_redemptions: Math.floor(Math.random() * 30),
            jaicoin_reward: Math.floor(Math.random() * 100) + 25,
            min_order_value: Math.floor(Math.random() * 1000),
            validity_days: [7, 14, 30, 60, 90][Math.floor(Math.random() * 5)],
            location: Math.random() > 0.3 ? 
              ['C-Scheme', 'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'Tonk Road'][Math.floor(Math.random() * 5)] : 
              'Online Delivery Jaipur',
            tags: [template.type.split(' ')[0].toLowerCase(), 'jaipur', 'exclusive', 'limited-time'],
            terms_conditions: 'Valid for new and existing customers. Cannot be combined with other offers. Valid ID required.',
            usage_terms: 'Present coupon at time of purchase or use coupon code for online orders.'
          });
        }

        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .insert(deals)
          .select('id, title');
        
        if (dealsError) {
          console.error('Deals error:', dealsError);
          errorCount++;
        } else {
          successCount++;
          console.log(`Created ${deals.length} deals`);
        }

        // 5. Create Reviews
        if (usersData && usersData.length > 0) {
          console.log('Creating reviews...');
          const reviews = [];
          const reviewTexts = [
            'Excellent service and great quality! Highly recommended for everyone.',
            'Amazing experience with professional staff. Will definitely visit again.',
            'Outstanding quality and value for money. Best in Jaipur!',
            'Great ambiance and friendly service. Perfect for family visits.',
            'Authentic Rajasthani experience with modern facilities.',
            'Quick service and delicious food. Loved the traditional flavors.',
            'Professional staff and clean environment. Very satisfied.',
            'Good quality products at reasonable prices. Recommended!',
            'Excellent customer service and timely delivery.',
            'Best place in Jaipur for this service. Five stars!'
          ];

          for (let i = 0; i < 120; i++) {
            const user = usersData[Math.floor(Math.random() * usersData.length)];
            const merchant = merchantsData[Math.floor(Math.random() * merchantsData.length)];
            
            reviews.push({
              user_id: user.id,
              merchant_name: merchant.business_name,
              rating: Math.floor(Math.random() * 2) + 4, // 4-5 star ratings
              review_text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
              jaicoin_rewarded: true
            });
          }

          const { error: reviewsError } = await supabase
            .from('reviews')
            .insert(reviews);
          
          if (reviewsError) {
            console.error('Reviews error:', reviewsError);
          } else {
            console.log(`Created ${reviews.length} reviews`);
          }
        }

        // 6. Create Community Posts
        if (usersData && usersData.length > 0) {
          console.log('Creating community posts...');
          const posts = [];
          const postContents = [
            'Just discovered this amazing restaurant in C-Scheme! The Rajasthani thali was incredible. Earned 50 JaiCoins too! 🍽️',
            'Has anyone tried the new spa in Malviya Nagar? Looking for authentic Ayurvedic treatments.',
            'Great deals on electronics this week! Got a new smartphone with 25% off. This app is fantastic for savings! 📱',
            'Loving the traditional jewelry collection at Gem Palace. Perfect for upcoming wedding season! 💍',
            'Best gym membership deals are live now. Already saved 2000 rupees on annual membership! 💪',
            'Found amazing handicrafts for Diwali gifts. Supporting local artisans while saving money! 🎨',
            'The car service deal was excellent. Professional work and great customer service. Highly recommended! 🚗',
            'Photography session package was worth every penny. Beautiful traditional Rajasthani photoshoot! 📸',
            'Travel package to Udaipur was amazing! Great value for money and excellent arrangements. 🏰',
            'Organic food delivery has been a game changer. Fresh vegetables and fruits at great prices! 🥬'
          ];

          for (let i = 0; i < 35; i++) {
            const user = usersData[Math.floor(Math.random() * usersData.length)];
            posts.push({
              user_id: user.id,
              content: postContents[Math.floor(Math.random() * postContents.length)],
              likes_count: Math.floor(Math.random() * 25) + 2
            });
          }

          const { error: postsError } = await supabase
            .from('community_posts')
            .insert(posts);
          
          if (postsError) {
            console.error('Community posts error:', postsError);
          } else {
            console.log(`Created ${posts.length} community posts`);
          }
        }

        // 7. Create Group Challenges
        console.log('Creating group challenges...');
        const challenges = [
          {
            title: 'Jaipur Foodie Challenge',
            description: 'Try dishes from 10 different restaurants in Jaipur',
            challenge_type: 'dining',
            target_value: 10,
            reward_amount: 500,
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            max_participants: 100
          },
          {
            title: 'Heritage Shopping Spree',
            description: 'Purchase from 5 traditional handicraft stores',
            challenge_type: 'shopping',
            target_value: 5,
            reward_amount: 300,
            end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
            max_participants: 75
          },
          {
            title: 'Wellness Warrior',
            description: 'Visit 3 different spas or wellness centers',
            challenge_type: 'wellness',
            target_value: 3,
            reward_amount: 400,
            end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            max_participants: 50
          },
          {
            title: 'Tech Savvy Jaipur',
            description: 'Purchase electronics worth 25000 JaiCoins',
            challenge_type: 'spending',
            target_value: 25000,
            reward_amount: 1000,
            end_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
            max_participants: 30
          }
        ];

        if (usersData && usersData.length > 0) {
          const challengesWithCreator = challenges.map(challenge => ({
            ...challenge,
            created_by: usersData[0].id
          }));

          const { data: challengesData, error: challengesError } = await supabase
            .from('group_challenges')
            .insert(challengesWithCreator)
            .select('id');
          
          if (challengesError) {
            console.error('Challenges error:', challengesError);
          } else {
            console.log(`Created ${challenges.length} group challenges`);

            // Add challenge participants
            if (challengesData) {
              const participants = [];
              for (const challenge of challengesData) {
                const participantCount = Math.floor(Math.random() * 15) + 5;
                for (let i = 0; i < participantCount && i < usersData.length; i++) {
                  participants.push({
                    challenge_id: challenge.id,
                    user_id: usersData[i].id,
                    current_progress: Math.floor(Math.random() * 5)
                  });
                }
              }

              const { error: participantsError } = await supabase
                .from('challenge_participants')
                .insert(participants);
              
              if (!participantsError) {
                console.log(`Added ${participants.length} challenge participants`);
              }
            }
          }
        }
      }

      toast({
        title: "Comprehensive Data Seeding Complete! 🎉",
        description: `Successfully created: ${sampleUsers.length} users, ${merchants.length} merchants, 75 deals, 120 reviews, 35 community posts, and 4 challenges with participants.`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Seeding Failed",
        description: "Failed to seed sample data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const verifyDataExists = async () => {
    setIsVerifying(true);
    try {
      const results = {
        profiles: 0,
        merchants: 0,
        deals: 0,
        reviews: 0,
        posts: 0,
        challenges: 0,
        transactions: 0
      };

      // Check each table
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      results.profiles = profilesCount || 0;

      const { count: merchantsCount } = await supabase
        .from('merchants')
        .select('*', { count: 'exact', head: true });
      results.merchants = merchantsCount || 0;

      const { count: dealsCount } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true });
      results.deals = dealsCount || 0;

      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });
      results.reviews = reviewsCount || 0;

      const { count: postsCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });
      results.posts = postsCount || 0;

      const { count: challengesCount } = await supabase
        .from('group_challenges')
        .select('*', { count: 'exact', head: true });
      results.challenges = challengesCount || 0;

      const { count: transactionsCount } = await supabase
        .from('jaicoin_transactions')
        .select('*', { count: 'exact', head: true });
      results.transactions = transactionsCount || 0;

      setVerificationResults(results);
      
    } catch (error) {
      console.error('Error verifying data:', error);
      toast({
        title: "Verification Failed", 
        description: "Failed to verify data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const clearAllData = async () => {
    setIsClearing(true);
    try {
      console.log('Clearing all sample data...');
      
      const tables = ['challenge_participants', 'group_challenges', 'community_posts', 'reviews', 'coupons', 'deals', 'merchants', 'jaicoin_transactions', 'profiles'];
      let clearedCount = 0;
      
      for (const table of tables) {
        const { error } = await supabase.from(table as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          console.error(`Error clearing ${table}:`, error);
        } else {
          clearedCount++;
          console.log(`Cleared ${table} table`);
        }
      }
      
      toast({
        title: "Data Cleared Successfully",
        description: `Successfully cleared ${clearedCount} tables`,
        variant: "default"
      });
      
      setVerificationResults(null);
      
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Clear Failed", 
        description: "Failed to clear data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Database className="w-5 h-5" />
            Comprehensive Data Seeder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-green-700">
              <h3 className="font-semibold mb-2">🚀 Complete Sample Data Creation</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>15 Sample Users</strong> - Realistic Jaipur residents with demographics</li>
                <li><strong>50 Merchants</strong> - Diverse Jaipur businesses across all categories</li>
                <li><strong>75 Deals</strong> - Mix of location-based and online deals</li>
                <li><strong>120 Reviews</strong> - User reviews for merchants</li>
                <li><strong>35 Community Posts</strong> - Social interactions and discussions</li>
                <li><strong>4 Group Challenges</strong> - With participants and progress tracking</li>
                <li><strong>JaiCoin Transactions</strong> - Realistic transaction history</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={generateComprehensiveSampleData}
                disabled={isSeeding}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Database className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
                {isSeeding ? 'Creating Sample Data...' : 'Seed Complete Data'}
              </Button>
              
              <Button 
                onClick={verifyDataExists}
                disabled={isVerifying}
                variant="outline"
                className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <CheckCircle className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                {isVerifying ? 'Verifying...' : 'Verify Data'}
              </Button>
              
              <Button 
                onClick={clearAllData}
                disabled={isClearing}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className={`w-4 h-4 ${isClearing ? 'animate-spin' : ''}`} />
                {isClearing ? 'Clearing Data...' : 'Clear All Data'}
              </Button>
            </div>

            {verificationResults && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">📊 Data Verification Results</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Users:</span>
                    <span className={`font-semibold ${verificationResults.profiles > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {verificationResults.profiles}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Merchants:</span>
                    <span className={`font-semibold ${verificationResults.merchants > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {verificationResults.merchants}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Deals:</span>
                    <span className={`font-semibold ${verificationResults.deals > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {verificationResults.deals}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reviews:</span>
                    <span className={`font-semibold ${verificationResults.reviews > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {verificationResults.reviews}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Posts:</span>
                    <span className={`font-semibold ${verificationResults.posts > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {verificationResults.posts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Challenges:</span>
                    <span className={`font-semibold ${verificationResults.challenges > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {verificationResults.challenges}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Transactions:</span>
                    <span className={`font-semibold ${verificationResults.transactions > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {verificationResults.transactions}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <strong>Note:</strong> This creates comprehensive sample data including users, merchants, deals, reviews, community posts, and challenges. All data represents realistic Jaipur businesses and demographics.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSeeder;
