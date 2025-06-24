
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, MapPin, Star, Clock, Percent } from "lucide-react";
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
  merchants?: {
    business_name: string;
    average_rating: number;
  };
}

const CategoriesPage = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { id: "all", name: "All Categories", icon: "🏪" },
    { id: "Food & Dining", name: "Food & Dining", icon: "🍽️" },
    { id: "Beauty & Wellness", name: "Beauty & Wellness", icon: "💄" },
    { id: "Shopping", name: "Shopping", icon: "🛍️" },
    { id: "Electronics", name: "Electronics", icon: "📱" },
    { id: "Services", name: "Services", icon: "🔧" },
    { id: "Health & Fitness", name: "Health & Fitness", icon: "💪" },
    { id: "Entertainment", name: "Entertainment", icon: "🎬" },
    { id: "Travel & Tourism", name: "Travel & Tourism", icon: "✈️" }
  ];

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    filterAndSortDeals();
  }, [deals, selectedCategory, searchQuery, sortBy]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          merchants(
            business_name,
            average_rating
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

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(deal => deal.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.merchants?.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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
      case "ending_soon":
        filtered.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        break;
      default:
        break;
    }

    setFilteredDeals(filtered);
  };

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return deals.length;
    return deals.filter(deal => deal.category === categoryId).length;
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
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Categories</h1>
              <p className="text-gray-600">Discover amazing deals across different categories</p>
            </div>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search deals, restaurants, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="featured">Featured</option>
                <option value="discount">Highest Discount</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="ending_soon">Ending Soon</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? "bg-pink-50 text-pink-700 border border-pink-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getCategoryCount(category.id)}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Deals Grid */}
          <div className="lg:col-span-3">
            {filteredDeals.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No deals found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDeals.map((deal) => (
                  <Link key={deal.id} to={`/deal/${deal.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
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
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {deal.category}
                          </Badge>
                          <Badge className="bg-green-100 text-green-700">
                            {deal.discount_percentage}% OFF
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-pink-600 transition-colors">
                          {deal.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {deal.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{deal.location}</span>
                        </div>
                        {deal.merchants && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <span>{deal.merchants.business_name}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{deal.merchants.average_rating?.toFixed(1)}</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-pink-600">
                              ₹{deal.discounted_price}
                            </span>
                            {deal.original_price > deal.discounted_price && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{deal.original_price}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Ends {new Date(deal.end_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
