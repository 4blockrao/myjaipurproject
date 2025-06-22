
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Wallet, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const featuredDeals = [
    {
      id: 1,
      title: "20% Off Traditional Rajasthani Thali",
      merchant: "Chokhi Dhani Restaurant",
      originalPrice: 500,
      discountedPrice: 400,
      category: "Food & Dining",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Hair Spa & Styling - Flat 30% Off",
      merchant: "Royal Beauty Salon",
      originalPrice: 1500,
      discountedPrice: 1050,
      category: "Beauty & Wellness",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Handcrafted Jewelry - Buy 2 Get 1 Free",
      merchant: "Jaipur Gems & Crafts",
      originalPrice: 2000,
      discountedPrice: 1333,
      category: "Shopping",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-pink-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full"></div>
            <h1 className="text-2xl font-bold text-pink-600">HiJaipur</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/deals" className="text-gray-700 hover:text-pink-600 transition-colors">Deals</Link>
            <a href="#community" className="text-gray-700 hover:text-pink-600 transition-colors">Community</a>
            <Link to="/wallet" className="text-gray-700 hover:text-pink-600 transition-colors">JaiCoin</Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              className="border-pink-300 text-pink-600 hover:bg-pink-50"
              onClick={() => setIsAuthModalOpen(true)}
            >
              <User className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button 
              className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Discover Deals. <span className="text-pink-600">Support Local.</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Jaipur's leading hyperlocal deals discovery platform. Find exclusive offers from local businesses, 
            earn JaiCoins, and unlock amazing rewards!
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for deals, restaurants, salons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg border-2 border-pink-200 rounded-full focus:border-pink-400"
            />
            <Link to="/deals">
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 rounded-full px-6">
                Search
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">500+</div>
              <div className="text-gray-600">Local Partners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600">Deals Redeemed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      <section id="deals" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Featured Deals</h3>
          <p className="text-gray-600">Discover the best offers from local businesses in Jaipur</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDeals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-lg transition-shadow border-2 border-pink-100 hover:border-pink-200">
              <CardHeader className="pb-2">
                <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Deal Image</span>
                </div>
                <CardTitle className="text-lg text-gray-800">{deal.title}</CardTitle>
                <CardDescription className="text-pink-600 font-medium">{deal.merchant}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">₹{deal.discountedPrice}</span>
                    <span className="text-gray-500 line-through">₹{deal.originalPrice}</span>
                  </div>
                  <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm font-medium">
                    {Math.round(((deal.originalPrice - deal.discountedPrice) / deal.originalPrice) * 100)}% OFF
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{deal.category}</span>
                  <Button size="sm" className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600">
                    Redeem
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/deals">
            <Button variant="outline" size="lg" className="border-pink-300 text-pink-600 hover:bg-pink-50">
              View All Deals
            </Button>
          </Link>
        </div>
      </section>

      {/* JaiCoin Section */}
      <section id="wallet" className="bg-gradient-to-r from-pink-500 to-yellow-500 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <Wallet className="w-16 h-16 mx-auto mb-6" />
          <h3 className="text-3xl font-bold mb-4">Earn JaiCoins with Every Deal</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get rewarded for discovering local businesses! Earn JaiCoins for every purchase, 
            referral, and review. Redeem them for exclusive discounts and perks.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">25</div>
              <div>JaiCoins for Sign-up</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50</div>
              <div>JaiCoins per Purchase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">25</div>
              <div>JaiCoins per Referral</div>
            </div>
          </div>
          <Link to="/wallet">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-pink-600">
              Explore JaiCoin Wallet
            </Button>
          </Link>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Join the Community</h3>
          <p className="text-gray-600">Share experiences, discover new places, and connect with fellow Jaipurites</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center border-2 border-blue-100 hover:border-blue-200 transition-colors">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">Share</div>
              <p className="text-gray-600">Post photos and reviews</p>
            </CardContent>
          </Card>
          <Card className="text-center border-2 border-pink-100 hover:border-pink-200 transition-colors">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-pink-600 mb-2">Refer</div>
              <p className="text-gray-600">Invite friends and earn</p>
            </CardContent>
          </Card>
          <Card className="text-center border-2 border-yellow-100 hover:border-yellow-200 transition-colors">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600 mb-2">Compete</div>
              <p className="text-gray-600">Top leaderboards</p>
            </CardContent>
          </Card>
          <Card className="text-center border-2 border-green-100 hover:border-green-200 transition-colors">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">Win</div>
              <p className="text-gray-600">Monthly prizes</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-800 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Discover Jaipur?</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of locals who are already saving money and supporting local businesses
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 px-8"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Get Started Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-800 px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-pink-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full"></div>
              <span className="text-xl font-bold text-pink-600">Hi

Jaipur</span>
            </Link>
            <div className="flex space-x-6 text-gray-600">
              <a href="#" className="hover:text-pink-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-pink-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-pink-600 transition-colors">Support</a>
            </div>
          </div>
          <div className="text-center text-gray-500 mt-4 border-t border-gray-200 pt-4">
            © 2024 HiJaipur. Made with ❤️ in the Pink City.
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default Index;
