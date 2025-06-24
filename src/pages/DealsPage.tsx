
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Filter, MapPin, Star, Clock, Percent, 
  Heart, Share2, Eye, TrendingUp, Zap, Gift,
  Grid, List, SlidersHorizontal, Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

interface Deal {
  id: string;
  title: string;
  description: string;
  category: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  location: string;
  image_url?: string;
  end_date: string;
  is_featured: boolean;
  current_redemptions: number;
  max_redemptions: number;
  merchants?: {
    business_name: string;
    average_rating: number;
    is_verified: boolean;
  };
}

const DealsPage = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const categories = [
    { id: "all", name: "All Categories", count: 0 },
    { id: "Food & Dining", name: "Food & Dining", count: 0 },
    { id: "Beauty & Wellness", name: "Beauty & Wellness", count: 0 },
    { id: "Shopping", name: "Shopping", count: 0 },
    { id: "Electronics", name: "Electronics", count: 0 },
    { id: "Services", name: "Services", count: 0 },
    { id: "Health & Fitness", name: "Health & Fitness", count: 0 },
    { id: "Entertainment", name: "Entertainment", count: 0 },
    { id: "Travel & Tourism", name: "Travel & Tourism", count: 0 }
  ];

  const sortOptions = [
    { id: "featured", name: "Featured" },
    { id: "discount", name: "Highest Discount" },
    { id: "price_low", name: "Price: Low to High" },
    { id: "price_high", name: "Price: High to Low" },
    { id: "rating", name: "Highest Rated" },
    { id: "newest", name: "Newest First" },
    { id: "ending_soon", name: "Ending Soon" },
    { id: "popular", name: "Most Popular" }
  ];

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    filterAndSortDeals();
  }, [deals, searchQuery, selectedCategory, priceRange, sortBy]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants(
            business_name,
            average_rating,
            is_verified
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortDeals = () => {
    let filtered = deals;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.merchants?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(deal => deal.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(deal => 
      deal.discounted_price >= priceRange[0] && deal.discounted_price <= priceRange[1]
    );

    // Sort deals
    switch (sortBy) {
      case "discount":
        filtered.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));
        break;
      case "price_low":
        filtered.sort((a, b) => (a.discounted_price || 0) - (b.discounted_price || 0));
        break;
      case "price_high":
        filtered.sort((a, b) => (b.discounted_price || 0) - (a.discounted_price || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.merchants?.average_rating || 0) - (a.merchants?.average_rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case "ending_soon":
        filtered.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        break;
      case "popular":
        filtered.sort((a, b) => (b.current_redemptions || 0) - (a.current_redemptions || 0));
        break;
      default:
        // Featured: prioritize featured deals, then by creation date
        filtered.sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        });
        break;
    }

    setFilteredDeals(filtered);
  };

  const toggleSave = (dealId: string) => {
    // Implement save/unsave functionality
    toast({
      title: "Added to Favorites",
      description: "Deal saved to your favorites list"
    });
  };

  const shareDeal = (deal: Deal) => {
    if (navigator.share) {
      navigator.share({
        title: deal.title,
        text: `Check out this amazing deal: ${deal.discount_percentage}% off!`,
        url: `/deal/${deal.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/deal/${deal.id}`);
      toast({
        title: "Link Copied",
        description: "Deal link copied to clipboard"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discover Amazing Deals</h1>
              <p className="text-gray-600">Find the best offers from top merchants in Jaipur</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {filteredDeals.length} deals found
              </Badge>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search deals, restaurants, services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000}
                    min={0}
                    step={50}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deals Grid/List */}
        {filteredDeals.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No deals found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setPriceRange([0, 5000]);
            }}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredDeals.map((deal) => (
              <Card key={deal.id} className={`group hover:shadow-lg transition-all duration-200 ${
                viewMode === "list" ? "flex" : ""
              }`}>
                {viewMode === "grid" ? (
                  <>
                    <div className="relative">
                      <div className="aspect-video bg-gradient-to-br from-pink-100 to-orange-100 rounded-t-lg flex items-center justify-center">
                        {deal.image_url ? (
                          <img
                            src={deal.image_url}
                            alt={deal.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="text-4xl">🎯</div>
                        )}
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-red-500 text-white">
                          {deal.discount_percentage}% OFF
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        {deal.is_featured && (
                          <Badge className="bg-yellow-500 text-yellow-900">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {deal.merchants?.is_verified && (
                          <Badge className="bg-blue-500 text-white">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3 flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleSave(deal.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.preventDefault();
                            shareDeal(deal);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <Link to={`/deal/${deal.id}`}>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                          {deal.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {deal.description}
                      </p>
                      
                      {deal.merchants && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <span>{deal.merchants.business_name}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{deal.merchants.average_rating?.toFixed(1)}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{deal.location}</span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-pink-600">
                            ₹{deal.discounted_price}
                          </span>
                          {deal.original_price > deal.discounted_price && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{deal.original_price}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {deal.max_redemptions - deal.current_redemptions} left
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <Clock className="w-3 h-3" />
                        <span>Ends {new Date(deal.end_date).toLocaleDateString()}</span>
                      </div>

                      <Link to={`/deal/${deal.id}`}>
                        <Button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
                          View Deal
                        </Button>
                      </Link>
                    </CardContent>
                  </>
                ) : (
                  // List view layout
                  <div className="flex">
                    <div className="w-48 h-32 bg-gradient-to-br from-pink-100 to-orange-100 rounded-l-lg flex items-center justify-center relative">
                      {deal.image_url ? (
                        <img
                          src={deal.image_url}
                          alt={deal.title}
                          className="w-full h-full object-cover rounded-l-lg"
                        />
                      ) : (
                        <div className="text-3xl">🎯</div>
                      )}
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                        {deal.discount_percentage}% OFF
                      </Badge>
                    </div>
                    <CardContent className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Link to={`/deal/${deal.id}`}>
                          <h3 className="font-semibold text-lg group-hover:text-pink-600 transition-colors">
                            {deal.title}
                          </h3>
                        </Link>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => toggleSave(deal.id)}>
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => shareDeal(deal)}>
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {deal.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-pink-600">
                              ₹{deal.discounted_price}
                            </span>
                            {deal.original_price > deal.discounted_price && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{deal.original_price}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{deal.location}</span>
                          </div>
                        </div>
                        <Link to={`/deal/${deal.id}`}>
                          <Button size="sm" className="bg-gradient-to-r from-pink-500 to-orange-400">
                            View Deal
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
