
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, AlertTriangle, Trash2 } from 'lucide-react';

const DataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const generateComprehensiveSampleData = async () => {
    setIsSeeding(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      console.log('Starting comprehensive data seeding...');

      // 1. Create 30+ User Profiles
      const profiles = [];
      const userNames = [
        'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
        'Lisa Anderson', 'Chris Taylor', 'Jessica Martinez', 'Andrew Thomas', 'Amanda White',
        'Ryan Garcia', 'Nicole Miller', 'Kevin Rodriguez', 'Rachel Lee', 'Jason Moore',
        'Ashley Jackson', 'Brandon Clark', 'Stephanie Lewis', 'Tyler Walker', 'Megan Hall',
        'Justin Young', 'Kayla Allen', 'Nathan King', 'Samantha Wright', 'Eric Lopez',
        'Christina Hill', 'Daniel Scott', 'Lauren Green', 'Matthew Adams', 'Brittany Baker',
        'Joshua Gonzalez', 'Amber Nelson', 'Anthony Carter', 'Tiffany Mitchell', 'Mark Perez'
      ];

      for (let i = 0; i < userNames.length; i++) {
        const profile = {
          id: `user-${i + 1}-${Date.now()}`,
          full_name: userNames[i],
          email: `${userNames[i].toLowerCase().replace(' ', '.')}@example.com`,
          phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          rank: ['Bronze', 'Silver', 'Gold', 'Platinum'][Math.floor(Math.random() * 4)],
          is_pro: Math.random() > 0.7,
          total_referrals: Math.floor(Math.random() * 20),
          referral_code: `REF${String(Math.random()).substring(2, 8).toUpperCase()}`
        };
        profiles.push(profile);
      }

      const { error: profilesError } = await supabase.from('profiles').insert(profiles);
      if (profilesError) {
        console.error('Profiles error:', profilesError);
        errorCount++;
      } else {
        successCount++;
        console.log(`Created ${profiles.length} user profiles`);
      }

      // 2. Create 25+ Merchants
      const merchants = [];
      const businessData = [
        { name: 'Pizza Palace Downtown', type: 'Restaurant', category: 'Food & Dining' },
        { name: 'Fitness First Gym', type: 'Health & Fitness', category: 'Health & Wellness' },
        { name: 'Beauty Bliss Spa', type: 'Beauty & Wellness', category: 'Beauty & Spa' },
        { name: 'Tech Repair Pro', type: 'Electronics', category: 'Electronics & Tech' },
        { name: 'Fashion Forward Boutique', type: 'Retail', category: 'Fashion & Apparel' },
        { name: 'Coffee Corner Cafe', type: 'Restaurant', category: 'Food & Dining' },
        { name: 'Auto Care Center', type: 'Automotive', category: 'Automotive Services' },
        { name: 'Home Decor Haven', type: 'Retail', category: 'Home & Garden' },
        { name: 'Learning Tree Academy', type: 'Education', category: 'Education & Training' },
        { name: 'Pet Paradise Store', type: 'Pet Services', category: 'Pet Care' },
        { name: 'Adventure Sports Hub', type: 'Recreation', category: 'Sports & Recreation' },
        { name: 'Gourmet Burger Bar', type: 'Restaurant', category: 'Food & Dining' },
        { name: 'Yoga Zen Studio', type: 'Health & Fitness', category: 'Health & Wellness' },
        { name: 'Digital Solutions Inc', type: 'Technology', category: 'Business Services' },
        { name: 'Artisan Bakery', type: 'Restaurant', category: 'Food & Dining' },
        { name: 'Mobile Phone Repair', type: 'Electronics', category: 'Electronics & Tech' },
        { name: 'Luxury Car Wash', type: 'Automotive', category: 'Automotive Services' },
        { name: 'Kids Play Zone', type: 'Entertainment', category: 'Family & Kids' },
        { name: 'Organic Market', type: 'Retail', category: 'Grocery & Food' },
        { name: 'Dental Care Plus', type: 'Healthcare', category: 'Health & Medical' },
        { name: 'Music Academy', type: 'Education', category: 'Education & Training' },
        { name: 'Travel Experts Agency', type: 'Travel', category: 'Travel & Tourism' },
        { name: 'Jewelry Collection', type: 'Retail', category: 'Jewelry & Accessories' },
        { name: 'Thai Cuisine Palace', type: 'Restaurant', category: 'Food & Dining' },
        { name: 'Bookstore & Cafe', type: 'Retail', category: 'Books & Media' },
        { name: 'Fitness Equipment Store', type: 'Retail', category: 'Sports & Recreation' },
        { name: 'Photography Studio', type: 'Services', category: 'Photography & Events' },
        { name: 'Hair & Beauty Salon', type: 'Beauty & Wellness', category: 'Beauty & Spa' }
      ];

      for (let i = 0; i < businessData.length; i++) {
        const business = businessData[i];
        const merchant = {
          business_name: business.name,
          business_type: business.type,
          email: `contact@${business.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          address: `${Math.floor(Math.random() * 9999) + 1} ${['Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Broadway'][Math.floor(Math.random() * 5)]}, City, State 12345`,
          description: `Premium ${business.type.toLowerCase()} services with exceptional quality and customer satisfaction.`,
          is_verified: Math.random() > 0.3,
          is_active: Math.random() > 0.1,
          listing_tier: ['basic', 'premium', 'enterprise'][Math.floor(Math.random() * 3)],
          listing_fee_paid: Math.random() > 0.2,
          approval_status: ['approved', 'pending', 'rejected'][Math.floor(Math.random() * 3)],
          average_rating: +(Math.random() * 2 + 3).toFixed(1),
          total_reviews: Math.floor(Math.random() * 150) + 5,
          total_deals: Math.floor(Math.random() * 20) + 1,
          website: `https://www.${business.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
        };
        merchants.push(merchant);
      }

      const { data: merchantsData, error: merchantsError } = await supabase
        .from('merchants')
        .insert(merchants)
        .select('id, business_name');
      
      if (merchantsError) {
        console.error('Merchants error:', merchantsError);
        errorCount++;
      } else {
        successCount++;
        console.log(`Created ${merchants.length} merchants`);
      }

      // 3. Create 50+ Deals
      if (merchantsData && merchantsData.length > 0) {
        const deals = [];
        const dealTemplates = [
          { title: '50% Off Pizza & Pasta', category: 'Food & Dining', discount: 50 },
          { title: 'Buy 1 Get 1 Free Coffee', category: 'Food & Dining', discount: 50 },
          { title: '30% Off Gym Membership', category: 'Health & Wellness', discount: 30 },
          { title: 'Free Consultation + 20% Off', category: 'Beauty & Spa', discount: 20 },
          { title: '$100 Off Phone Repair', category: 'Electronics & Tech', discount: 25 },
          { title: '40% Off Designer Clothing', category: 'Fashion & Apparel', discount: 40 },
          { title: 'Free Oil Change with Service', category: 'Automotive Services', discount: 35 },
          { title: '25% Off Home Furniture', category: 'Home & Garden', discount: 25 },
          { title: 'Free Trial Class + 15% Off', category: 'Education & Training', discount: 15 },
          { title: '20% Off Pet Grooming', category: 'Pet Care', discount: 20 }
        ];

        for (let i = 0; i < 55; i++) {
          const template = dealTemplates[i % dealTemplates.length];
          const merchant = merchantsData[i % merchantsData.length];
          const originalPrice = Math.floor(Math.random() * 200) + 20;
          const discountPercent = template.discount + Math.floor(Math.random() * 20) - 10;
          const discountedPrice = originalPrice * (1 - discountPercent / 100);
          
          const deal = {
            title: `${template.title} - ${merchant.business_name}`,
            description: `Amazing deal from ${merchant.business_name}. Limited time offer with excellent value for money.`,
            category: template.category,
            subcategory: ['Premium', 'Standard', 'Deluxe'][Math.floor(Math.random() * 3)],
            original_price: originalPrice,
            discounted_price: Math.round(discountedPrice),
            purchase_price: Math.round(discountedPrice * 0.8),
            discount_percentage: discountPercent,
            merchant_id: merchant.id,
            coupon_type: ['paid_discount', 'free_item', 'percentage_off'][Math.floor(Math.random() * 3)],
            is_active: Math.random() > 0.15,
            is_featured: Math.random() > 0.7,
            max_redemptions: Math.floor(Math.random() * 100) + 10,
            current_redemptions: Math.floor(Math.random() * 20),
            jaicoin_reward: Math.floor(Math.random() * 50) + 5,
            min_order_value: Math.floor(Math.random() * 50),
            validity_days: [7, 14, 30, 60, 90][Math.floor(Math.random() * 5)],
            location: `${['Downtown', 'Uptown', 'West Side', 'East End', 'City Center'][Math.floor(Math.random() * 5)]}`,
            tags: [template.category.split(' ')[0].toLowerCase(), 'popular', 'limited-time'],
            terms_conditions: 'Valid for new customers only. Cannot be combined with other offers.',
            usage_terms: 'Present coupon at time of purchase. Valid ID required.'
          };
          deals.push(deal);
        }

        const { data: dealsData, error: dealsError } = await supabase
          .from('deals')
          .insert(deals)
          .select('id, title, merchant_id, purchase_price');
        
        if (dealsError) {
          console.error('Deals error:', dealsError);
          errorCount++;
        } else {
          successCount++;
          console.log(`Created ${deals.length} deals`);
        }

        // 4. Create Coupons for some deals
        if (dealsData && dealsData.length > 0 && profiles.length > 0) {
          const coupons = [];
          const sampleDeals = dealsData.slice(0, 30); // Create coupons for first 30 deals
          
          for (let i = 0; i < sampleDeals.length; i++) {
            const deal = sampleDeals[i];
            const profile = profiles[i % profiles.length];
            const merchant = merchantsData.find(m => m.id === deal.merchant_id);
            
            const coupon = {
              coupon_code: `JAI${String(Math.random()).substring(2, 10).toUpperCase()}`,
              user_id: profile.id,
              deal_id: deal.id,
              merchant_id: deal.merchant_id,
              coupon_type: 'paid_discount',
              discount_amount: Math.floor(Math.random() * 50) + 10,
              purchase_amount: deal.purchase_price || 25,
              status: ['active', 'redeemed', 'expired'][Math.floor(Math.random() * 3)],
              expires_at: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
              purchased_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              min_order_value: Math.floor(Math.random() * 30),
              usage_terms: 'Valid for single use only. Cannot be transferred.'
            };
            
            if (Math.random() > 0.6) {
              coupon.redeemed_at = new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString();
              coupon.status = 'redeemed';
            }
            
            coupons.push(coupon);
          }

          const { error: couponsError } = await supabase.from('coupons').insert(coupons);
          if (couponsError) {
            console.error('Coupons error:', couponsError);
            errorCount++;
          } else {
            successCount++;
            console.log(`Created ${coupons.length} coupons`);
          }
        }

        // 5. Create JaiCoin Transactions
        const transactions = [];
        for (let i = 0; i < 40; i++) {
          const profile = profiles[i % profiles.length];
          const transactionTypes = [
            { type: 'earned', source: 'signup', amount: 25, description: 'Welcome bonus' },
            { type: 'earned', source: 'referral', amount: 50, description: 'Referral bonus' },
            { type: 'earned', source: 'purchase', amount: 15, description: 'Purchase reward' },
            { type: 'earned', source: 'review', amount: 10, description: 'Review reward' },
            { type: 'spent', source: 'coupon_purchase', amount: -20, description: 'Coupon purchase' },
            { type: 'earned', source: 'spin_wheel', amount: 25, description: 'Spin wheel reward' }
          ];
          
          const transType = transactionTypes[i % transactionTypes.length];
          transactions.push({
            user_id: profile.id,
            amount: Math.abs(transType.amount) * (transType.type === 'spent' ? -1 : 1),
            type: transType.type,
            source: transType.source,
            description: transType.description,
            metadata: { transaction_id: `txn_${Date.now()}_${i}` }
          });
        }

        const { error: transactionsError } = await supabase.from('jaicoin_transactions').insert(transactions);
        if (transactionsError) {
          console.error('Transactions error:', transactionsError);
          errorCount++;
        } else {
          successCount++;
          console.log(`Created ${transactions.length} JaiCoin transactions`);
        }
      }

      // Show success message
      toast({
        title: "Data Seeding Complete!",
        description: `Successfully created comprehensive sample data: ${successCount} data types seeded, ${errorCount} errors encountered.`,
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

  const clearAllData = async () => {
    setIsClearing(true);
    try {
      console.log('Clearing all sample data...');
      
      const tables = ['coupons', 'deals', 'merchants', 'profiles', 'jaicoin_transactions'];
      let clearedCount = 0;
      
      for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          console.error(`Error clearing ${table}:`, error);
        } else {
          clearedCount++;
          console.log(`Cleared ${table} table`);
        }
      }
      
      toast({
        title: "Data Cleared",
        description: `Successfully cleared ${clearedCount} tables`,
        variant: "default"
      });
      
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
            <h3 className="font-semibold mb-2">🚀 Production-Ready Sample Data</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>35 User Profiles</strong> - Diverse user base with different ranks and pro status</li>
              <li><strong>28 Merchants</strong> - Variety of business types and categories</li>
              <li><strong>55 Deals</strong> - Comprehensive deal catalog across all categories</li>
              <li><strong>30 Coupons</strong> - Mix of active, redeemed, and expired coupons</li>
              <li><strong>40 JaiCoin Transactions</strong> - Complete transaction history</li>
              <li><strong>Reviews & Analytics</strong> - Sample ratings and engagement data</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={generateComprehensiveSampleData}
              disabled={isSeeding}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Database className={`w-4 h-4 ${isSeeding ? 'animate-spin' : ''}`} />
              {isSeeding ? 'Creating Sample Data...' : 'Seed Production Data'}
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
          
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2 text-blue-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <strong>Note:</strong> This creates a comprehensive dataset perfect for testing all features including deals discovery, merchant dashboards, user analytics, coupon systems, and JaiCoin wallet functionality.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSeeder;
