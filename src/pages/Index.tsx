
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Coins, Users, Gift, Star, Trophy, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: <Search className="w-8 h-8 text-pink-500" />,
      title: "Discover Deals",
      description: "Find amazing discounts at local Jaipur businesses",
      action: () => navigate("/deals")
    },
    {
      icon: <Coins className="w-8 h-8 text-yellow-500" />,
      title: "JaiCoin Wallet",
      description: "Earn and spend JaiCoins for exclusive rewards",
      action: () => navigate("/wallet")
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Referral System",
      description: "Invite friends and earn JaiCoins together",
      action: () => navigate("/community?tab=referrals")
    },
    {
      icon: <Gift className="w-8 h-8 text-green-500" />,
      title: "Daily Spin",
      description: "Spin the wheel daily for surprise rewards",
      action: () => navigate("/community?tab=spin")
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-purple-500" />,
      title: "Community Hub",
      description: "Share experiences and connect with locals",
      action: () => navigate("/community?tab=community")
    },
    {
      icon: <Trophy className="w-8 h-8 text-orange-500" />,
      title: "Leaderboard",
      description: "Compete and climb the rankings",
      action: () => navigate("/community?tab=leaderboard")
    }
  ];

  const popularDeals = [
    { name: "Rajasthani Thali", discount: "30% OFF", restaurant: "Chokhi Dhani", rating: 4.8 },
    { name: "Heritage Tour", discount: "25% OFF", restaurant: "Pink City Tours", rating: 4.9 },
    { name: "Jewelry Shopping", discount: "40% OFF", restaurant: "Johari Bazaar", rating: 4.7 },
    { name: "Traditional Spa", discount: "35% OFF", restaurant: "Palace Wellness", rating: 4.6 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-yellow-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-pink-600">HiJaipur</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/deals")}>Deals</Button>
              <Button variant="ghost" onClick={() => navigate("/wallet")}>Wallet</Button>
              <Button variant="ghost" onClick={() => navigate("/community")}>Community</Button>
              <Button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
              HiJaipur
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover amazing deals, earn JaiCoins, and connect with the vibrant community of the Pink City!
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/deals")}
              className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600"
            >
              Explore Deals
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/community")}
              className="border-pink-300 hover:bg-pink-50"
            >
              Join Community
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Everything You Need in One App
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer border-pink-100 hover:border-pink-200"
                onClick={feature.action}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-50 to-yellow-50 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-gray-800">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Deals Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Trending Deals</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate("/deals")}
              className="border-pink-300 hover:bg-pink-50"
            >
              View All Deals
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDeals.map((deal, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-pink-100">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Badge className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white">
                      {deal.discount}
                    </Badge>
                    <h3 className="font-semibold text-lg">{deal.name}</h3>
                    <p className="text-gray-600">{deal.restaurant}</p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{deal.rating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Jaipur Journey?
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Join thousands of locals discovering the best deals and earning rewards every day!
          </p>
          <Button 
            size="lg"
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-4 text-lg"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">HiJaipur</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 HiJaipur. Made with ❤️ for the Pink City.</p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default Index;
