
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Menu, User, ChevronDown, LogOut,
  LayoutDashboard, Wallet, Heart, HelpCircle, Crown, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import JaiCoinWallet from "@/components/JaiCoinWallet";

interface ModernNavigationProps {
  user: any;
  profile: any;
  onAuthModal: () => void;
}

const ModernNavigation = ({ user, profile, onAuthModal }: ModernNavigationProps) => {
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-pink-600" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-white hidden xs:block">MyJaipur</span>
            <span className="text-lg font-bold text-white block xs:hidden">MJ</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/explore" className="text-white hover:text-pink-200 transition-colors font-medium">
              Explore
            </Link>
            <Link to="/deals" className="text-white hover:text-pink-200 transition-colors font-medium">
              Deals
            </Link>
            <Link to="/categories" className="text-white hover:text-pink-200 transition-colors font-medium">
              Categories
            </Link>
            {user && (
              <Link to="/dashboard" className="text-white hover:text-pink-200 transition-colors font-medium">
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* JaiCoin Wallet - Hidden on small screens */}
                <div className="hidden sm:block">
                  <JaiCoinWallet />
                </div>
                
                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                        <User className="w-4 h-4 mr-2" />
                        <span className="hidden lg:inline">{profile?.full_name || 'User'}</span>
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/wallet" className="flex items-center">
                          <Wallet className="w-4 h-4 mr-2" />
                          Wallet
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/favorites" className="flex items-center">
                          <Heart className="w-4 h-4 mr-2" />
                          Favorites
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/help" className="flex items-center">
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Help & Support
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/pro" className="flex items-center">
                          <Crown className="w-4 h-4 mr-2" />
                          Pro Membership
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile User Avatar */}
                <div className="md:hidden">
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <Button 
                onClick={onAuthModal}
                variant="secondary" 
                size="sm"
                className="bg-white text-pink-600 hover:bg-gray-100 font-semibold text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Login</span>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden text-white hover:bg-white/20 p-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="p-6 border-b bg-gradient-to-r from-pink-500 to-purple-500">
                    <div className="flex items-center justify-between mb-4">
                      <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <h2 className="font-bold text-white">MyJaipur</h2>
                          <p className="text-xs text-pink-100">Your Local Hub</p>
                        </div>
                      </Link>
                      <SheetClose asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white">
                          <X className="w-4 h-4" />
                        </Button>
                      </SheetClose>
                    </div>

                    {/* User Profile in Mobile Menu */}
                    {user && (
                      <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-pink-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white truncate">{profile?.full_name || 'User'}</h3>
                          <p className="text-sm text-pink-100">ID: {profile?.user_id_code || 'Loading...'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 p-4 space-y-2">
                    <Link 
                      to="/explore" 
                      onClick={closeMobileMenu}
                      className="flex items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium">Explore</span>
                    </Link>
                    <Link 
                      to="/deals" 
                      onClick={closeMobileMenu}
                      className="flex items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium">Deals</span>
                    </Link>
                    <Link 
                      to="/categories" 
                      onClick={closeMobileMenu}
                      className="flex items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium">Categories</span>
                    </Link>
                    {user && (
                      <>
                        <Separator className="my-4" />
                        <Link 
                          to="/dashboard" 
                          onClick={closeMobileMenu}
                          className="flex items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="w-5 h-5 mr-3" />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link 
                          to="/wallet" 
                          onClick={closeMobileMenu}
                          className="flex items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Wallet className="w-5 h-5 mr-3" />
                          <span className="font-medium">Wallet</span>
                        </Link>
                        <Link 
                          to="/favorites" 
                          onClick={closeMobileMenu}
                          className="flex items-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Heart className="w-5 h-5 mr-3" />
                          <span className="font-medium">Favorites</span>
                        </Link>
                      </>
                    )}
                    
                    {!user && (
                      <Button 
                        onClick={() => {
                          closeMobileMenu();
                          onAuthModal();
                        }}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white mt-4"
                      >
                        Sign In
                      </Button>
                    )}
                  </nav>

                  {/* Mobile Menu Footer */}
                  {user && (
                    <div className="p-4 border-t">
                      <Button 
                        onClick={() => {
                          closeMobileMenu();
                          handleSignOut();
                        }}
                        variant="outline" 
                        className="w-full text-red-600 border-red-200"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ModernNavigation;
