
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Star, TrendingUp, Gift, Users, Zap, Clock, Flame, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModernHeroSectionProps {
  userLocality?: string;
  onSearch: (query: string) => void;
}

const ModernHeroSection = ({ userLocality, onSearch }: ModernHeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const quickCategories = [
    { name: "Food & Dining", emoji: "🍽️", deals: "200+" },
    { name: "Beauty & Wellness", emoji: "💆‍♀️", deals: "150+" },
    { name: "Shopping", emoji: "🛍️", deals: "300+" },
    { name: "Electronics", emoji: "📱", deals: "100+" },
  ];

  const stats = [
    { icon: Users, label: "Happy Customers", value: "50,000+", color: "text-blue-600" },
    { icon: Gift, label: "Active Deals", value: "1,500+", color: "text-green-600" },
    { icon: Trophy, label: "Partner Merchants", value: "800+", color: "text-purple-600" },
    { icon: TrendingUp, label: "Money Saved", value: "₹5Cr+", color: "text-orange-600" }
  ];

  return (
    <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden min-h-[80vh]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-pink-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-64 h-64 bg-blue-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-purple-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-6xl mx-auto">
          {/* Top Badge */}
          <div className="mb-8">
            <Badge className="mb-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 text-lg font-medium">
              <Flame className="w-5 h-5 mr-2" />
              Jaipur's Premier Deals Platform
            </Badge>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Discover Amazing
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                Deals & Discounts
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Save up to 80% on restaurants, spas, electronics, and experiences in the Pink City
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="mb-12 max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-3 backdrop-blur-lg">
                <div className="flex items-center flex-1">
                  <Search className="w-6 h-6 text-gray-400 ml-4" />
                  <Input
                    type="text"
                    placeholder="Search for restaurants, spas, electronics, or any deals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 focus:ring-0 text-lg px-4 py-4 bg-transparent placeholder:text-gray-500"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Find Deals
                </Button>
              </div>
              
              {/* Location indicator */}
              <div className="flex items-center justify-center mt-4 text-gray-300">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-sm">📍 Showing deals in {userLocality || 'All Jaipur'}</span>
              </div>
            </form>
          </div>

          {/* Quick Category Pills */}
          <div className="mb-12">
            <p className="text-gray-300 mb-6 text-lg">🔥 Trending Categories</p>
            <div className="flex flex-wrap justify-center gap-4">
              {quickCategories.map((category, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  onClick={() => onSearch(category.name)}
                  className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 px-6 py-3 rounded-full"
                >
                  <span className="text-xl mr-2">{category.emoji}</span>
                  <div className="text-left">
                    <div className="font-semibold">{category.name}</div>
                    <div className="text-xs opacity-80">{category.deals} deals</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <stat.icon className={`w-10 h-10 mx-auto mb-4 ${stat.color}`} />
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-10 py-4 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-full"
              onClick={() => navigate('/deals')}
            >
              <Zap className="w-6 h-6 mr-2" />
              Explore All Deals
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-purple-900 px-10 py-4 text-xl font-semibold backdrop-blur-md transition-all duration-300 rounded-full"
              onClick={() => navigate('/merchants')}
            >
              <Users className="w-6 h-6 mr-2" />
              For Merchants
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-white/20">
            <p className="text-gray-300 mb-6 text-lg">✨ Trusted by thousands of happy customers</p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-semibold">4.8/5</span>
                <span>Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span>⚡ Instant Activation</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-400" />
                <span>🔒 Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-400" />
                <span>✅ Verified Merchants</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernHeroSection;
