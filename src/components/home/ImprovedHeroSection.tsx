
import { useState } from "react";
import { Search, MapPin, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface HeroSectionProps {
  onSearch: (searchTerm: string) => void;
}

const ImprovedHeroSection = ({ onSearch }: HeroSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-pink-500 via-purple-600 to-orange-500 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-300 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-300 rounded-full blur-xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <h1 className="text-4xl md:text-6xl font-bold">
              My<span className="text-yellow-300">Jaipur</span>
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>
          
          <p className="text-xl md:text-2xl mb-2 font-medium">
            Discover Amazing Deals in the Pink City
          </p>
          
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Save up to 80% on restaurants, services, and experiences
          </p>

          {/* Search section */}
          <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search for restaurants, spas, activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 text-gray-800 bg-white border-gray-200 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="h-12 px-8 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold"
                >
                  Search Deals
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-2 mt-4 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Showing deals in Jaipur</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300">500+</div>
              <div className="text-sm opacity-90">Active Deals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300">200+</div>
              <div className="text-sm opacity-90">Partner Merchants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300">50K+</div>
              <div className="text-sm opacity-90">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-300">₹2Cr+</div>
              <div className="text-sm opacity-90">Savings Generated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedHeroSection;
