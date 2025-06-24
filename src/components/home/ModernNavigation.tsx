import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Menu, User, ChevronDown, LogOut,
  LayoutDashboard, Wallet, Heart, HelpCircle, Crown
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

  return (
    <nav className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-pink-600" />
            </div>
            <span className="text-2xl font-bold text-white">MyJaipur</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
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
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <JaiCoinWallet />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <User className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">{profile?.full_name || 'User'}</span>
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
              </>
            ) : (
              <Button 
                onClick={onAuthModal}
                variant="secondary" 
                size="sm"
                className="bg-white text-pink-600 hover:bg-gray-100 font-semibold"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-white/20">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <MapPin className="w-6 h-6 text-pink-600" />
                    <span>MyJaipur</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <Link to="/explore" className="block py-2 text-lg font-medium hover:text-pink-600 transition-colors">
                    Explore
                  </Link>
                  <Link to="/deals" className="block py-2 text-lg font-medium hover:text-pink-600 transition-colors">
                    Deals
                  </Link>
                  <Link to="/categories" className="block py-2 text-lg font-medium hover:text-pink-600 transition-colors">
                    Categories
                  </Link>
                  {user && (
                    <Link to="/dashboard" className="block py-2 text-lg font-medium hover:text-pink-600 transition-colors">
                      Dashboard
                    </Link>
                  )}
                  {user ? (
                    <>
                      <Separator />
                      <Link to="/profile" className="block py-2 text-lg font-medium hover:text-pink-600 transition-colors">
                        Profile
                      </Link>
                      <Link to="/wallet" className="block py-2 text-lg font-medium hover:text-pink-600 transition-colors">
                        Wallet
                      </Link>
                      <Link to="/favorites" className="block py-2 text-lg font-medium hover:text-pink-600 transition-colors">
                        Favorites
                      </Link>
                      <Separator />
                      <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button onClick={onAuthModal} className="w-full">
                      Sign In
                    </Button>
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
