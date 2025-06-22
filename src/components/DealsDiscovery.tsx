
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Globe, Coins, Filter, Sliders, Heart, Share2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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
  created_at?: string;
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
  const [sortBy, setSortBy] = useState("featured");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const categories = [
    "all", "Food & Dining", "Beauty & Wellness", "Shopping", 
    "Electronics", "Services", "Health & Fitness"
  ];

  const locations = [
    "all", "C-Scheme", "Malviya Nagar", "Vaishali Nagar", 
    "Mansarovar", "Jagatpura", "Shyam Nagar", "Tonk Road", "Ajmer Road", "Online Delivery Jaipur"
  ];

  const sortOptions = [
    { value: "featured", label: "Featured First" },
    { value: "discount", label: "Highest Discount" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" }
  ];

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    filterDeals();
  }, [deals, searchQuery, selectedCategory, selectedLocation, sortBy]);

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
        created_at: deal.created_at,
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

    if (sortBy === "discount") {
      filtered = filtered.sort((a, b) => b.discount_percentage - a.discount_percentage);
    } else if (sortBy === "price_low") {
      filtered = filtered.sort((a, b) => a.discounted_price - b.discounted_price);
    } else if (sortBy === "price_high") {
      filtered = filtered.sort((a, b) => b.discounted_price - a.discounted_price);
    } else if (sortBy === "newest" && filtered[0]?.created_at) {
      filtered = filtered.sort((a, b) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading premium deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Premium Deals</h1>
                <p className="text-sm text-gray-600">{filteredDeals.length} deals available</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sliders className="w-5 h-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search deals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>
                        {location === "all" ? "All Locations" : location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedLocation("all");
                    setSortBy("featured");
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Deals Grid */}
          <div className="lg:col-span-3">
            {filteredDeals.length === 0 ? (
              <div className="text-center py-16">
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDeals.map((deal) => {
                  const isOnline = isOnlineDeal(deal.location);
                  const availableSlots = deal.max_redemptions - deal.current_redemptions;
                  
                  return (
                    <Card key={deal.id} className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden ${deal.is_featured ? 'ring-2 ring-yellow-300' : ''}`}>
                      <div className="relative">
                        <div className="h-48 bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl mb-2">
                              {deal.category === 'Food & Dining' ? '🍽️' : 
                               deal.category === 'Beauty & Wellness' ? '💆‍♀️' : 
                               deal.category === 'Shopping' ? '🛍️' : 
                               deal.category === 'Electronics' ? '📱' : 
                               deal.category === 'Health & Fitness' ? '💪' : '✨'}
                            </div>
                            <div className="text-sm font-medium text-gray-600">{deal.subcategory}</div>
                          </div>
                        </div>
                        
                        {/* Badges */}
                        <div className="absolute top-4 left-4 space-y-2">
                          {deal.is_featured && (
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                              ⭐ FEATURED
                            </span>
                          )}
                          {deal.discount_percentage > 0 && (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                              {deal.discount_percentage}% OFF
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 space-y-2">
                          <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg group-hover:text-pink-600 transition-colors line-clamp-2">
                          {deal.title}
                        </CardTitle>
                        <CardDescription className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{deal.merchant.business_name}</span>
                          {deal.merchant.is_verified && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              ✓ Verified
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          {/* Price */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-gray-900">₹{deal.discounted_price.toLocaleString()}</span>
                              {deal.original_price > 0 && (
                                <span className="text-sm line-through text-gray-500">₹{deal.original_price.toLocaleString()}</span>
                              )}
                            </div>
                          </div>

                          {/* Location and JaiCoins */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-1 text-gray-600">
                              {isOnline ? (
                                <Globe className="w-4 h-4 text-blue-500" />
                              ) : (
                                <MapPin className="w-4 h-4 text-red-500" />
                              )}
                              <span>{isOnline ? 'Online/Delivery' : deal.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Coins className="w-4 h-4 text-yellow-500" />
                              <span className="text-yellow-700 font-medium">+{deal.jaicoin_reward}</span>
                            </div>
                          </div>

                          {/* Description */}
                          {deal.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{deal.description}</p>
                          )}

                          {/* Available slots */}
                          {availableSlots > 0 && availableSlots <= 10 && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                              <p className="text-xs text-orange-700 font-medium">
                                ⏰ Only {availableSlots} left!
                              </p>
                            </div>
                          )}

                          {/* Action Button */}
                          <Button 
                            onClick={() => handleRedeemDeal(deal.id, isOnline)}
                            disabled={availableSlots <= 0}
                            className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 disabled:opacity-50 font-medium text-white shadow-lg hover:shadow-xl transition-all"
                          >
                            {availableSlots <= 0 ? 'Sold Out' : isOnline ? 'Buy Online' : 'Redeem Deal'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealsDiscovery;
