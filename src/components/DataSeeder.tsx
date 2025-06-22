
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, Download, Users, Store, Tag, RefreshCw } from 'lucide-react';

const DataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const seedSampleData = async () => {
    setIsSeeding(true);
    try {
      console.log('Starting comprehensive data seeding...');

      // First, clean existing data to avoid duplicates
      await supabase.from('jaicoin_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('coupons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('deals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('merchants').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Create comprehensive sample merchants with varied data
      const sampleMerchants = [
        {
          business_name: 'Spice Garden Restaurant',
          business_type: 'Restaurant',
          email: 'contact@spicegarden.com',
          phone: '+91-9876543210',
          address: '123 M.I. Road, C-Scheme, Jaipur, Rajasthan 302001',
          description: 'Authentic Rajasthani cuisine with modern ambiance. Experience the royal flavors of Rajasthan.',
          is_verified: true,
          is_active: true,
          listing_tier: 'premium',
          listing_fee_paid: true,
          approval_status: 'approved',
          average_rating: 4.5,
          total_reviews: 150,
          total_deals: 3,
          website: 'https://spicegarden.com'
        },
        {
          business_name: 'Beauty Bliss Salon & Spa',
          business_type: 'Beauty & Wellness',
          email: 'info@beautybliss.com',
          phone: '+91-9876543211',
          address: '456 Malviya Nagar, Jaipur, Rajasthan 302017',
          description: 'Premium beauty and wellness services. Rejuvenate your mind, body, and soul.',
          is_verified: true,
          is_active: true,
          listing_tier: 'basic',
          listing_fee_paid: true,
          approval_status: 'approved',
          average_rating: 4.2,
          total_reviews: 89,
          total_deals: 2,
          website: 'https://beautybliss.com'
        },
        {
          business_name: 'TechMart Electronics',
          business_type: 'Electronics',
          email: 'sales@techmart.com',
          phone: '+91-9876543212',
          address: '789 Vaishali Nagar, Jaipur, Rajasthan 302021',
          description: 'Latest gadgets and electronics at best prices. Your tech destination in Jaipur.',
          is_verified: true,
          is_active: true,
          listing_tier: 'enterprise',
          listing_fee_paid: true,
          approval_status: 'approved',
          average_rating: 4.0,
          total_reviews: 45,
          total_deals: 1,
          website: 'https://techmart.com'
        },
        {
          business_name: 'Fitness First Gym',
          business_type: 'Health & Fitness',
          email: 'info@fitnessfirst.com',
          phone: '+91-9876543213',
          address: '321 Mansarovar, Jaipur, Rajasthan 302020',
          description: 'Complete fitness solution with modern equipment and expert trainers.',
          is_verified: true,
          is_active: true,
          listing_tier: 'premium',
          listing_fee_paid: true,
          approval_status: 'approved',
          average_rating: 4.3,
          total_reviews: 67,
          total_deals: 2
        },
        {
          business_name: 'Fashion Hub',
          business_type: 'Shopping',
          email: 'contact@fashionhub.com',
          phone: '+91-9876543214',
          address: '654 Jagatpura, Jaipur, Rajasthan 302025',
          description: 'Latest fashion trends and designer clothing for all occasions.',
          is_verified: true,
          is_active: true,
          listing_tier: 'basic',
          listing_fee_paid: true,
          approval_status: 'approved',
          average_rating: 4.1,
          total_reviews: 34,
          total_deals: 1
        }
      ];

      console.log('Inserting merchants...');
      const { data: merchantsData, error: merchantsError } = await supabase
        .from('merchants')
        .insert(sampleMerchants)
        .select();

      if (merchantsError) throw merchantsError;
      console.log('Merchants created:', merchantsData?.length);

      // Create comprehensive sample deals
      const sampleDeals = [
        {
          merchant_id: merchantsData[0].id,
          title: '50% Off on Traditional Rajasthani Thali',
          description: 'Enjoy authentic Rajasthani thali with 50% discount. Includes dal baati churma, gatte ki sabzi, and more traditional delicacies.',
          category: 'Food & Dining',
          subcategory: 'Indian Cuisine',
          original_price: 500,
          discounted_price: 250,
          purchase_price: 50,
          coupon_type: 'paid_discount',
          is_active: true,
          is_featured: true,
          max_redemptions: 100,
          current_redemptions: 15,
          jaicoin_reward: 15,
          validity_days: 30,
          min_order_value: 400,
          location: 'C-Scheme',
          discount_percentage: 50,
          terms_conditions: 'Valid for dine-in only. Cannot be combined with other offers.'
        },
        {
          merchant_id: merchantsData[0].id,
          title: 'Free Dessert with Main Course',
          description: 'Get complimentary traditional dessert with any main course order.',
          category: 'Food & Dining',
          subcategory: 'Indian Cuisine',
          original_price: 150,
          discounted_price: 0,
          purchase_price: 0,
          coupon_type: 'free',
          is_active: true,
          is_featured: false,
          max_redemptions: 50,
          current_redemptions: 8,
          jaicoin_reward: 10,
          validity_days: 15,
          location: 'C-Scheme'
        },
        {
          merchant_id: merchantsData[1].id,
          title: 'Complimentary Face Cleanup with Facial',
          description: 'Free basic face cleanup with any premium facial service. Experience our signature treatments.',
          category: 'Beauty & Wellness',
          subcategory: 'Facial Services',
          original_price: 800,
          discounted_price: 0,
          purchase_price: 0,
          coupon_type: 'free',
          is_active: true,
          is_featured: true,
          max_redemptions: 30,
          current_redemptions: 5,
          jaicoin_reward: 20,
          validity_days: 45,
          location: 'Malviya Nagar'
        },
        {
          merchant_id: merchantsData[1].id,
          title: '30% Off Hair Spa Package',
          description: 'Rejuvenate your hair with our premium spa package at 30% discount.',
          category: 'Beauty & Wellness',
          subcategory: 'Hair Care',
          original_price: 2000,
          discounted_price: 1400,
          purchase_price: 100,
          coupon_type: 'paid_discount',
          is_active: true,
          is_featured: false,
          max_redemptions: 25,
          current_redemptions: 3,
          jaicoin_reward: 25,
          validity_days: 60,
          location: 'Malviya Nagar',
          discount_percentage: 30
        },
        {
          merchant_id: merchantsData[2].id,
          title: '₹2000 Off on Smartphones',
          description: 'Get ₹2000 discount on smartphones above ₹15000. Latest models available.',
          category: 'Electronics',
          subcategory: 'Mobile Phones',
          original_price: 20000,
          discounted_price: 18000,
          purchase_price: 99,
          coupon_type: 'paid_discount',
          is_active: true,
          is_featured: true,
          max_redemptions: 25,
          current_redemptions: 3,
          jaicoin_reward: 50,
          validity_days: 60,
          min_order_value: 15000,
          location: 'Vaishali Nagar',
          discount_percentage: 10
        },
        {
          merchant_id: merchantsData[3].id,
          title: '3 Months Gym Membership at 40% Off',
          description: 'Complete fitness package with modern equipment and personal trainer guidance.',
          category: 'Health & Fitness',
          subcategory: 'Gym Membership',
          original_price: 6000,
          discounted_price: 3600,
          purchase_price: 200,
          coupon_type: 'paid_discount',
          is_active: true,
          is_featured: true,
          max_redemptions: 20,
          current_redemptions: 7,
          jaicoin_reward: 40,
          validity_days: 90,
          location: 'Mansarovar',
          discount_percentage: 40
        },
        {
          merchant_id: merchantsData[3].id,
          title: 'Free Fitness Assessment',
          description: 'Complete body analysis and personalized workout plan absolutely free.',
          category: 'Health & Fitness',
          subcategory: 'Consultation',
          original_price: 500,
          discounted_price: 0,
          purchase_price: 0,
          coupon_type: 'free',
          is_active: true,
          is_featured: false,
          max_redemptions: 40,
          current_redemptions: 12,
          jaicoin_reward: 15,
          validity_days: 30,
          location: 'Mansarovar'
        },
        {
          merchant_id: merchantsData[4].id,
          title: '25% Off on Designer Collection',
          description: 'Exclusive discount on our latest designer clothing collection.',
          category: 'Shopping',
          subcategory: 'Fashion',
          original_price: 4000,
          discounted_price: 3000,
          purchase_price: 150,
          coupon_type: 'paid_discount',
          is_active: true,
          is_featured: false,
          max_redemptions: 15,
          current_redemptions: 2,
          jaicoin_reward: 30,
          validity_days: 45,
          location: 'Jagatpura',
          discount_percentage: 25,
          min_order_value: 2000
        }
      ];

      console.log('Inserting deals...');
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .insert(sampleDeals)
        .select();

      if (dealsError) throw dealsError;
      console.log('Deals created:', dealsData?.length);

      // Create sample user profiles
      const sampleProfiles = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          full_name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phone: '+91-9876543220',
          referral_code: 'RAJ2024',
          rank: 'Silver',
          is_pro: false,
          total_referrals: 3
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          full_name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '+91-9876543221',
          referral_code: 'PRI2024',
          rank: 'Gold',
          is_pro: true,
          total_referrals: 8,
          pro_tier: 'premium',
          subscription_status: 'active'
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          full_name: 'Amit Singh',
          email: 'amit@example.com',
          phone: '+91-9876543222',
          referral_code: 'AMI2024',
          rank: 'Bronze',
          is_pro: false,
          total_referrals: 1
        },
        {
          id: '44444444-4444-4444-4444-444444444444',
          full_name: 'Neha Gupta',
          email: 'neha@example.com',
          phone: '+91-9876543223',
          referral_code: 'NEH2024',
          rank: 'Silver',
          is_pro: true,
          total_referrals: 5,
          pro_tier: 'basic',
          subscription_status: 'active'
        },
        {
          id: '55555555-5555-5555-5555-555555555555',
          full_name: 'Vikram Jain',
          email: 'vikram@example.com',
          phone: '+91-9876543224',
          referral_code: 'VIK2024',
          rank: 'Bronze',
          is_pro: false,
          total_referrals: 0
        }
      ];

      console.log('Inserting user profiles...');
      const { error: profilesError } = await supabase
        .from('profiles')
        .upsert(sampleProfiles, { onConflict: 'id' });

      if (profilesError) throw profilesError;
      console.log('User profiles created:', sampleProfiles.length);

      // Create sample JAICoin transactions
      const sampleTransactions = [
        {
          user_id: '11111111-1111-1111-1111-111111111111',
          amount: 25,
          type: 'earned',
          source: 'signup',
          description: 'Welcome bonus for signing up'
        },
        {
          user_id: '22222222-2222-2222-2222-222222222222',
          amount: 20,
          type: 'earned',
          source: 'deal_purchase',
          description: 'Reward for purchasing facial service coupon'
        },
        {
          user_id: '11111111-1111-1111-1111-111111111111',
          amount: 50,
          type: 'spent',
          source: 'purchase',
          description: 'Purchased thali discount coupon'
        },
        {
          user_id: '33333333-3333-3333-3333-333333333333',
          amount: 15,
          type: 'earned',
          source: 'referral',
          description: 'Referral bonus'
        },
        {
          user_id: '44444444-4444-4444-4444-444444444444',
          amount: 30,
          type: 'earned',
          source: 'deal_purchase',
          description: 'Reward for gym membership purchase'
        }
      ];

      console.log('Inserting transactions...');
      const { error: transactionsError } = await supabase
        .from('jaicoin_transactions')
        .insert(sampleTransactions);

      if (transactionsError) throw transactionsError;
      console.log('Transactions created:', sampleTransactions.length);

      toast({
        title: "Sample Data Created Successfully! 🎉",
        description: `Created ${merchantsData?.length} merchants, ${dealsData?.length} deals, ${sampleProfiles.length} users, and ${sampleTransactions.length} transactions`,
      });

    } catch (error) {
      console.error('Error seeding data:', error);
      toast({
        title: "Seeding Failed",
        description: "Failed to create sample data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const clearAllData = async () => {
    try {
      console.log('Clearing all data...');
      
      // Clear in correct order due to foreign key constraints
      await supabase.from('jaicoin_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('coupons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('deals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('merchants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      toast({
        title: "Data Cleared",
        description: "All sample data has been removed from the database",
      });

    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Clear Failed",
        description: "Failed to clear data. Check console for details.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Management & Sample Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={seedSampleData}
            disabled={isSeeding}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            {isSeeding ? 'Seeding Data...' : 'Seed Complete Sample Data'}
          </Button>
          
          <Button
            onClick={clearAllData}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Clear All Data
          </Button>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">What gets created:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 5 Sample merchants (restaurants, salon, electronics, gym, fashion)</li>
            <li>• 8 Sample deals (mix of paid discounts and free offers)</li>
            <li>• 5 Sample user profiles with different ranks and pro status</li>
            <li>• Sample JAICoin transactions showing earnings and spending</li>
            <li>• Realistic data with proper relationships and varied categories</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Click "Seed Complete Sample Data" to populate the database</li>
            <li>Go to the home page to see the updated stats</li>
            <li>Visit /deals page to see all the sample deals</li>
            <li>Check /merchant pages for sample merchant data</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSeeder;
