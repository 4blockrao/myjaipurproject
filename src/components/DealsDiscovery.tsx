
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface Deal {
  id: number;
  title: string;
  merchant: string;
  originalPrice: number;
  discountedPrice: number;
  category: string;
  location: string;
  expiresAt: string;
  jaiCoinsEarned: number;
}

const DealsDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const categories = [
    "all", "Food & Dining", "Beauty & Wellness", "Shopping", 
    "Entertainment", "Services", "Health & Fitness"
  ];

  const locations = [
    "all", "C-Scheme", "Malviya Nagar", "Vaishali Nagar", 
    "Pink City", "Mansarovar", "Jagatpura"
  ];

  const deals: Deal[] = [
    {
      id: 1,
      title: "Royal Rajasthani Thali with Live Folk Dance",
      merchant: "Chokhi Dhani",
      originalPrice: 800,
      discountedPrice: 600,
      category: "Food & Dining",
      location: "Pink City",
      expiresAt: "2024-01-31",
      jaiCoinsEarned: 50
    },
    {
      id: 2,
      title: "Premium Hair Care Package",
      merchant: "Jawed Habib Hair & Beauty",
      originalPrice: 2000,
      discountedPrice: 1400,
      category: "Beauty & Wellness",
      location: "C-Scheme",
      expiresAt: "2024-01-28",
      jaiCoinsEarned: 70
    },
    {
      id: 3,
      title: "Handcrafted Jaipur Jewelry Collection",
      merchant: "Gem Palace",
      originalPrice: 5000,
      discountedPrice: 3500,
      category: "Shopping",
      location: "Pink City",
      expiresAt: "2024-02-05",
      jaiCoinsEarned: 100
    },
    {
      id: 4,
      title: "Traditional Block Print Fabrics",
      merchant: "Anokhi",
      originalPrice: 1200,
      discountedPrice: 840,
      category: "Shopping",
      location: "C-Scheme",
      expiresAt: "2024-01-30",
      jaiCoinsEarned: 60
    },
    {
      id: 5,
      title: "Full Body Massage & Spa Treatment",
      merchant: "Four Fountains De-Stress Spa",
      originalPrice: 2500,
      discountedPrice: 1750,
      category: "Beauty & Wellness",
      location: "Malviya Nagar",
      expiresAt: "2024-02-10",
      jaiCoinsEarned: 85
    },
    {
      id: 6,
      title: "Italian Cuisine Fine Dining Experience",
      merchant: "Peshawri Restaurant",
      originalPrice: 1500,
      discountedPrice: 1125,
      category: "Food & Dining",
      location: "Vaishali Nagar",
      expiresAt: "2024-01-25",
      jaiCoinsEarned: 75
    }
  ];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || deal.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || deal.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleRedeemDeal = (dealId: number) => {
    // TODO: Implement deal redemption logic
    console.log('Redeeming deal:', dealId);
  };

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
          {filteredDeals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-lg transition-shadow border-2 border-pink-100 hover:border-pink-200">
              <CardHeader className="pb-2">
                <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Deal Image</span>
                </div>
                <CardTitle className="text-lg text-gray-800 line-clamp-2">{deal.title}</CardTitle>
                <CardDescription className="text-pink-600 font-medium">{deal.merchant}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-green-600">₹{deal.discountedPrice}</span>
                      <span className="text-gray-500 line-through">₹{deal.originalPrice}</span>
                    </div>
                    <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm font-medium">
                      {Math.round(((deal.originalPrice - deal.discountedPrice) / deal.originalPrice) * 100)}% OFF
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{deal.location}</span>
                    <span>Expires: {new Date(deal.expiresAt).toLocaleDateString()}</span>
                  </div>

                  {/* JaiCoins */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">+{deal.jaiCoinsEarned} JaiCoins</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleRedeemDeal(deal.id)}
                      className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600"
                    >
                      Redeem
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredDeals.length === 0 && (
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
