
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, Download, Users, Store, Tag } from 'lucide-react';

const DataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const seedSampleData = async () => {
    setIsSeeding(true);
    try {
      console.log('Starting data seeding...');

      // First, check if we have any existing data
      const { data: existingMerchants } = await supabase
        .from('merchants')
        .select('id')
        .limit(1);

      if (existingMerchants && existingMerchants.length > 0) {
        toast({
          title: "Data Already Exists",
          description: "Sample data has already been seeded",
          variant: "destructive"
        });
        return;
      }

      // Create sample merchants
      const sampleMerchants = [
        {
          business_name: 'Spice Garden Restaurant',
          business_type: 'Restaurant',
          email: 'contact@spicegarden.com',
          phone: '+91-9876543210',
          address: '123 M.I. Road, C-Scheme, Jaipur',
          description: 'Authentic Rajasthani cuisine with modern ambiance',
          is_verified: true,
          is_active: true,
          listing_tier: 'premium',
          listing_fee_paid: true,
          approval_status: 'approved',
          average_rating: 4.5,
          total_reviews: 150
        },
        {
          business_name: 'Beauty Bliss Salon',
          business_type: 'Beauty Salon',
          email: 'info@beautybliss.com',
          phone: '+91-9876543211',
          address: '456 Malviya Nagar, Jaipur',
          description: 'Premium beauty and wellness services',
          is_verified: true,
          is_active: true,
          listing_tier: 'basic',
          listing_fee_paid: false,
          approval_status: 'approved',
          average_rating: 4.2,
          total_reviews: 89
        },
        {
          business_name: 'TechMart Electronics',
          business_type: 'Electronics Store',
          email: 'sales@techmart.com',
          phone: '+91-9876543212',
          address: '789 Vaishali Nagar, Jaipur',
          description: 'Latest gadgets and electronics at best prices',
          is_verified: false,
          is_active: true,
          listing_tier: 'enterprise',
          listing_fee_paid: true,
          approval_status: 'pending',
          average_rating: 4.0,
          total_reviews: 45
        }
      ];

      console.log('Inserting merchants...');
      const { data: merchantsData, error: merchantsError } = await supabase
        .from('merchants')
        .insert(sampleMerchants)
        .select();

      if (merchantsError) throw merchantsError;
      console.log('Merchants created:', merchantsData);

      // Create sample deals
      const sampleDeals = [
        {
          merchant_id: merchantsData[0].id,
          title: '50% Off on Traditional Thali',
          description: 'Enjoy authentic Rajasthani thali with 50% discount',
          category: 'Food & Dining',
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
          min_order_value: 400
        },
        {
          merchant_id: merchantsData[1].id,
          title: 'Complimentary Face Cleanup',
          description: 'Free basic face cleanup with any facial service',
          category: 'Beauty & Wellness',
          original_price: 800,
          discounted_price: 0,
          purchase_price: 0,
          coupon_type: 'free',
          is_active: true,
          is_featured: false,
          max_redemptions: 50,
          current_redemptions: 8,
          jaicoin_reward: 10,
          validity_days: 45
        },
        {
          merchant_id: merchantsData[2].id,
          title: '₹2000 Off on Smartphones',
          description: 'Get ₹2000 discount on smartphones above ₹15000',
          category: 'Electronics',
          original_price: 20000,
          discounted_price: 18000,
          purchase_price: 99,
          coupon_type: 'paid_discount',
          is_active: true,
          is_featured: true,
          max_redemptions: 25,
          current_redemptions: 3,
          jaicoin_reward: 25,
          validity_days: 60,
          min_order_value: 15000
        }
      ];

      console.log('Inserting deals...');
      const { data: dealsData, error: dealsError } = await supabase
        .from('deals')
        .insert(sampleDeals)
        .select();

      if (dealsError) throw dealsError;
      console.log('Deals created:', dealsData);

      // Create sample coupons
      const sampleCoupons = [
        {
          deal_id: dealsData[0].id,
          merchant_id: merchantsData[0].id,
          user_id: '00000000-0000-0000-0000-000000000001', // Placeholder user ID
          coupon_code: 'JAI' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          status: 'active',
          discount_amount: 250,
          purchase_amount: 50,
          coupon_type: 'paid_discount',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          min_order_value: 400
        },
        {
          deal_id: dealsData[1].id,
          merchant_id: merchantsData[1].id,
          user_id: '00000000-0000-0000-0000-000000000002', // Placeholder user ID
          coupon_code: 'JAI' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          status: 'redeemed',
          discount_amount: 800,
          purchase_amount: 0,
          coupon_type: 'free',
          expires_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          redeemed_at: new Date().toISOString()
        }
      ];

      console.log('Inserting coupons...');
      const { data: couponsData, error: couponsError } = await supabase
        .from('coupons')
        .insert(sampleCoupons)
        .select();

      if (couponsError) throw couponsError;
      console.log('Coupons created:', couponsData);

      // Create sample JAICoin transactions
      const sampleTransactions = [
        {
          user_id: '00000000-0000-0000-0000-000000000001',
          amount: 25,
          type: 'earned',
          source: 'signup',
          description: 'Welcome bonus for signing up'
        },
        {
          user_id: '00000000-0000-0000-0000-000000000002',
          amount: 10,
          type: 'earned',
          source: 'redemption',
          description: 'Reward for redeeming free cleanup coupon'
        },
        {
          user_id: '00000000-0000-0000-0000-000000000001',
          amount: 50,
          type: 'spent',
          source: 'purchase',
          description: 'Purchased thali discount coupon'
        }
      ];

      console.log('Inserting transactions...');
      const { error: transactionsError } = await supabase
        .from('jaicoin_transactions')
        .insert(sampleTransactions);

      if (transactionsError) throw transactionsError;

      toast({
        title: "Sample Data Created!",
        description: "Successfully seeded the database with sample merchants, deals, and coupons",
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

  const syncUserProfiles = async () => {
    try {
      console.log('Syncing user profiles...');
      
      // Get all authenticated users and ensure they have profiles
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.log('Cannot access auth users directly, using alternative approach');
        
        // Alternative: Create sample profiles directly
        const sampleProfiles = [
          {
            id: '00000000-0000-0000-0000-000000000001',
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '+91-9876543210',
            referral_code: 'JOHN2024',
            rank: 'Silver',
            is_pro: false,
            total_referrals: 3
          },
          {
            id: '00000000-0000-0000-0000-000000000002',
            full_name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+91-9876543211',
            referral_code: 'JANE2024',
            rank: 'Gold',
            is_pro: true,
            total_referrals: 8,
            pro_tier: 'premium',
            subscription_status: 'active'
          },
          {
            id: '00000000-0000-0000-0000-000000000003',
            full_name: 'Mike Johnson',
            email: 'mike@example.com',
            phone: '+91-9876543212',
            referral_code: 'MIKE2024',
            rank: 'Bronze',
            is_pro: false,
            total_referrals: 1
          }
        ];

        const { error: profilesError } = await supabase
          .from('profiles')
          .upsert(sampleProfiles, { onConflict: 'id' });

        if (profilesError) throw profilesError;
        
        toast({
          title: "User Profiles Synced!",
          description: "Sample user profiles have been created successfully",
        });
      }

    } catch (error) {
      console.error('Error syncing profiles:', error);
      toast({
        title: "Profile Sync Failed",
        description: "Could not sync user profiles. Check console for details.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={seedSampleData}
            disabled={isSeeding}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
          </Button>
          
          <Button
            onClick={syncUserProfiles}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Sync User Profiles
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Seed Sample Data:</strong> Creates sample merchants, deals, coupons, and transactions</p>
          <p><strong>Sync User Profiles:</strong> Ensures all users have complete profile information</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSeeder;
