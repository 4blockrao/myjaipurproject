
import { useState } from "react";
import { Search, MapPin, Sparkles, TrendingUp, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  userLocality?: string;
  onSearch: (query: string) => void;
}

const HeroSection = ({ userLocality, onSearch }: HeroSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const quickCategories = [
    { name: "Food & Dining", emoji: "🍽️", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
    { name: "Shopping", emoji: "🛍️", color: "bg-pink-100 text-pink-700 hover:bg-pink-200" },
    { name: "Beauty & Wellness", emoji: "💆‍♀️", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
    { name: "Experiences", emoji: "🎭", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-600 to-orange-500">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-white/20 rounded-lg rotate-45"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Title */}
          <div className="mb-6">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Top deals & events in Jaipur — curated daily
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Discover the Best of
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Pink City
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              From authentic Rajasthani cuisine to hidden gems, find verified deals from local merchants 
              and experience Jaipur like a local.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search for biryani, jewelry, spa, experiences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-32 py-6 text-lg bg-white/95 backdrop-blur-sm border-white/20 rounded-full shadow-lg focus:ring-4 focus:ring-white/20"
              />
              <Button 
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white rounded-full px-6 py-3 font-semibold shadow-lg"
              >
                Search
              </Button>
            </div>
            
            {/* Location indicator */}
            {userLocality && (
              <div className="flex items-center justify-center mt-3 text-white/80">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">Showing deals near {userLocality}</span>
              </div>
            )}
          </div>

          {/* Quick Category Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {quickCategories.map((category) => (
              <Button
                key={category.name}
                variant="outline"
                onClick={() => onSearch(category.name)}
                className={`${category.color} border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-md`}
              >
                <span className="mr-2 text-lg">{category.emoji}</span>
                {category.name}
              </Button>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">50,000+ Happy Customers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 fill-current text-yellow-300" />
              <span className="text-sm font-medium">4.8 Average Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">1000+ Verified Merchants</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
