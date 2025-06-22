
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Globe, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Deal {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  category: string;
  subcategory: string;
  location: string;
  jaicoin_reward: number;
  is_featured: boolean;
  max_redemptions: number;
  current_redemptions: number;
  merchant: {
    business_name: string;
    is_verified: boolean;
  };
}

const DealsDiscovery = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    "all", "Food & Dining", "Beauty & Wellness", "Shopping", 
    "Electronics", "Services", "Health & Fitness"
  ];

  const locations = [
    "all", "C-Scheme", "Malviya Nagar", "Vaishali Nagar", 
    "Mansarovar", "Jagatpura", "Shyam Nagar", "Tonk Road", "Ajmer Road", "Online Delivery Jaipur"
  ];

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    filterDeals();
  }, [deals, searchQuery, selectedCategory, selectedLocation]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants!inner(
            business_name,
            is_verified
          )
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching deals:', error);
        toast({
          title: "Error",
          description: "Failed to load deals",
          variant: "destructive"
        });
        return;
      }

      const formattedDeals = data?.map(deal => ({
        id: deal.id,
        title: deal.title,
        description: deal.description || '',
        original_price: deal.original_price || 0,
        discounted_price: deal.discounted_price || 0,
        discount_percentage: deal.discount_percentage || 0,
        category: deal.category || '',
        subcategory: deal.subcategory || '',
        location: deal.location || '',
        jaicoin_reward: deal.jaicoin_reward || 0,
        is_featured: deal.is_featured || false,
        max_redemptions: deal.max_redemptions || 0,
        current_redemptions: deal.current_redemptions || 0,
        merchant: {
          business_name: deal.merchants?.business_name || 'Unknown Merchant',
          is_verified: deal.merchants?.is_verified || false
        }
      })) || [];

      setDeals(formattedDeals);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDeals = () => {
    let filtered = deals;

    if (searchQuery) {
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.merchant.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(deal => deal.category === selectedCategory);
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter(deal => deal.location === selectedLocation);
    }

    setFilteredDeals(filtered);
  };

  const handleRedeemDeal = async (dealId: string, isOnline: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to redeem deals",
          variant: "destructive"
        });
        return;
      }

      const deal = deals.find(d => d.id === dealId);
      if (!deal) return;

      // Create redemption record
      const { data: redemption, error: redemptionError } = await supabase
        .from('deal_redemptions')
        .insert({
          deal_id: dealId,
          user_id: user.id,
          redemption_code: Math.random().toString(36).substring(2, 15).toUpperCase(),
          jaicoin_earned: deal.jaicoin_reward
        })
        .select()
        .single();

      if (redemptionError) {
        toast({
          title: "Error",
          description: "Failed to redeem deal",
          variant: "destructive"
        });
        return;
      }

      // Award JaiCoins
      await supabase
        .from('jaicoin_transactions')
        .insert({
          user_id: user.id,
          amount: deal.jaicoin_reward,
          type: 'earned',
          source: 'deal_purchase',
          description: `Earned from deal: ${deal.title}`
        });

      // Update deal redemption count
      await supabase
        .from('deals')
        .update({ 
          current_redemptions: (deal.current_redemptions || 0) + 1 
        })
        .eq('id', dealId);

      toast({
        title: "Deal Redeemed Successfully!",
        description: `You earned ${deal.jaicoin_reward} JaiCoins! ${isOnline ? 'Check your email for purchase details.' : `Your redemption code: ${redemption.redemption_code}`}`,
      });

      // Refresh deals
      fetchDeals();
    } catch (error) {
      console.error('Error redeeming deal:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      });
    }
  };

  const isOnlineDeal = (location: string) => {
    return location.toLowerCase().includes('online') || location.toLowerCase().includes('delivery');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Discover Amazing Deals</h1>
          <p className="text-gray-600 text-lg">Find the best offers from local businesses in Jaipur</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-pink-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search deals, restaurants, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-pink-200 focus:border-pink-400"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border border-pink-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            >
              {locations.map(location => (
                <option key={location} value={location}>
                  {location === "all" ? "All Locations" : location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
            {selectedLocation !== "all" && ` in ${selectedLocation}`}
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => {
            const isOnline = isOnlineDeal(deal.location);
            const availableSlots = deal.max_redemptions - deal.current_redemptions;
            
            return (
              <Card key={deal.id} className={`hover:shadow-lg transition-shadow border-2 ${deal.is_featured ? 'border-yellow-300 bg-yellow-50' : 'border-pink-100'} hover:border-pink-200`}>
                <CardHeader className="pb-2">
                  {deal.is_featured && (
                    <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium w-fit mb-2">
                      ⭐ Featured Deal
                    </div>
                  )}
                  
                  <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-500">{deal.subcategory} Deal</span>
                  </div>
                  
                  <CardTitle className="text-lg text-gray-800 line-clamp-2">{deal.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="text-pink-600 font-medium">{deal.merchant.business_name}</span>
                    {deal.merchant.is_verified && (
                      <span className="text-green-600 text-xs">✓ Verified</span>
                    )}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-600">₹{deal.discounted_price.toLocaleString()}</span>
                        {deal.original_price > 0 && (
                          <span className="text-gray-500 line-through">₹{deal.original_price.toLocaleString()}</span>
                        )}
                      </div>
                      {deal.discount_percentage > 0 && (
                        <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm font-medium">
                          {deal.discount_percentage}% OFF
                        </span>
                      )}
                    </div>

                    {/* Location and Type */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        {isOnline ? (
                          <Globe className="w-4 h-4 text-blue-500" />
                        ) : (
                          <MapPin className="w-4 h-4 text-red-500" />
                        )}
                        <span>{isOnline ? 'Online/Delivery' : deal.location}</span>
                      </div>
                      {availableSlots > 0 && (
                        <span className="text-green-600 font-medium">{availableSlots} left</span>
                      )}
                    </div>

                    {/* Description */}
                    {deal.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{deal.description}</p>
                    )}

                    {/* JaiCoins and Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">+{deal.jaicoin_reward} JaiCoins</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleRedeemDeal(deal.id, isOnline)}
                        disabled={availableSlots <= 0}
                        className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 disabled:opacity-50"
                      >
                        {isOnline ? 'Buy Online' : 'Redeem'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredDeals.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No deals found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedLocation("all");
              }}
              variant="outline"
              className="border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsDiscovery;
