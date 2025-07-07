
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Star, TrendingUp, Gift, Users, Zap } from "lucide-react";

interface EnhancedHeroSectionProps {
  userLocality?: string;
  onSearch: (query: string) => void;
}

const EnhancedHeroSection = ({ userLocality, onSearch }: EnhancedHeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const stats = [
    { icon: Users, label: "Active Users", value: "10,000+", color: "text-blue-600" },
    { icon: Gift, label: "Deals Available", value: "500+", color: "text-green-600" },
    { icon: Star, label: "Happy Customers", value: "8,500+", color: "text-yellow-600" },
    { icon: TrendingUp, label: "Money Saved", value: "₹2M+", color: "text-purple-600" }
  ];

  return (
    <div className="relative bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-400 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-400 rounded-full blur-xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <div className="mb-6">
            <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              New Deals Added Daily
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Discover Amazing Deals in Jaipur
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-2">
              Save money while exploring the Pink City's best experiences
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <MapPin className="w-5 h-5" />
              <span>Currently serving: {userLocality || 'All Jaipur'}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-12">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200 p-2">
                <Search className="w-5 h-5 text-gray-400 ml-4" />
                <Input
                  type="text"
                  placeholder="Search for restaurants, spas, electronics, or any deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus:ring-0 text-lg px-4 py-3 bg-transparent"
                />
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg"
                >
                  Search Deals
                </Button>
              </div>
            </form>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold shadow-lg"
            >
              Explore All Deals
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-4 text-lg font-semibold"
            >
              Download App
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 mb-4">Trusted by thousands of happy customers</p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.8/5 Rating</span>
              </div>
              <div>🔒 Secure Payments</div>
              <div>📱 Mobile Friendly</div>
              <div>🎯 Verified Merchants</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHeroSection;
