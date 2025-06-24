import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, MapPin, Bell, Coins, User, Search, Home, Ticket, Camera, Database, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import JaiCoinWallet from "@/components/JaiCoinWallet";
import AuthButton from "@/components/auth/AuthButton";

interface ModernNavigationProps {
  user: any;
  profile: any;
  onAuthModal: () => void;
}

const ModernNavigation = ({ user, profile, onAuthModal }: ModernNavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const mainNavItems = [
    { name: "Deals", path: "/deals", icon: Ticket },
    { name: "Restaurants", path: "/categories?filter=Food & Dining", icon: Home },
    { name: "Events", path: "/categories?filter=Events", icon: Camera },
    { name: "Explore Jaipur", path: "/explore", icon: MapPin },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <>
      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                    MyJaipur
                  </h1>
                  <p className="text-xs text-gray-500 -mt-1">Pink City Deals</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-8">
                <a href="/" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
                  Home
                </a>
                <a href="/deals" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
                  Deals
                </a>
                <a href="/categories" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
                  Categories
                </a>
                {user && (
                  <a href="/wallet" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
                    Wallet
                  </a>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Location Badge */}
              {profile?.locality && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hidden sm:flex">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.locality}
                </Badge>
              )}

              {/* Auth Section */}
              <AuthButton 
                user={user} 
                profile={profile} 
                onAuthModal={onAuthModal} 
              />

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <a href="/" className="block text-gray-700 hover:text-pink-600 font-medium">
                Home
              </a>
              <a href="/deals" className="block text-gray-700 hover:text-pink-600 font-medium">
                Deals
              </a>
              <a href="/categories" className="block text-gray-700 hover:text-pink-600 font-medium">
                Categories
              </a>
              {user && (
                <a href="/wallet" className="block text-gray-700 hover:text-pink-600 font-medium">
                  Wallet
                </a>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default ModernNavigation;
