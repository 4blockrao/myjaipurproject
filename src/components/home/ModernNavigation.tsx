
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, MapPin, Bell, Coins, User, Search, Home, Ticket, Camera, Database, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import JaiCoinWallet from "@/components/JaiCoinWallet";

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
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MJ</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
                MyJaipur
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link key={item.name} to={item.path}>
                    <Button
                      variant="ghost"
                      className={`px-4 py-2 rounded-full transition-all duration-200 ${
                        active 
                          ? "bg-pink-50 text-pink-600 font-medium" 
                          : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Location Indicator (Desktop) */}
              {profile?.locality && (
                <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.locality}</span>
                </div>
              )}

              {/* Admin Quick Access (Desktop) */}
              <div className="hidden md:flex items-center space-x-1">
                <Link to="/admin/data">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-pink-600 hover:bg-pink-50">
                    <Database className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/admin/audit">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-pink-600 hover:bg-pink-50">
                    <AlertTriangle className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {user ? (
                <>
                  {/* JaiCoin Wallet */}
                  <JaiCoinWallet />
                  
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full p-2">
                    <Bell className="w-5 h-5" />
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                      3
                    </Badge>
                  </Button>

                  {/* Profile */}
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </div>
                    </Button>
                  </Link>
                </>
              ) : (
                <Button 
                  onClick={onAuthModal} 
                  className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-semibold rounded-full px-6 shadow-lg hover:shadow-xl transition-all"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link 
                    key={item.name} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      active 
                        ? "bg-pink-50 text-pink-600" 
                        : "text-gray-600 hover:bg-gray-50"
                    }`}>
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
              
              {/* Mobile Admin Access */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2 px-4">Admin</div>
                <Link to="/admin/data" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
                    <Database className="w-5 h-5" />
                    <span>Data Dashboard</span>
                  </div>
                </Link>
                <Link to="/admin/audit" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
                    <AlertTriangle className="w-5 h-5" />
                    <span>System Audit</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default ModernNavigation;
