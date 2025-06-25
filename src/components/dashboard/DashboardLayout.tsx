
import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Wallet, Trophy, Star, 
  User, Heart, Settings, ChevronRight, Home, ArrowLeft, Ticket,
  ShoppingBag, Receipt, Users, Gift, HelpCircle, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
  user?: any;
  profile?: any;
  pageTitle?: string;
  showBackButton?: boolean;
}

const DashboardLayout = ({ children, user, profile, pageTitle = "Dashboard", showBackButton = false }: DashboardLayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: ShoppingBag, label: "My Orders", path: "/orders" },
    { icon: Ticket, label: "My Coupons", path: "/coupons" },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: Star, label: "JaiCoin Zone", path: "/jaicoin-zone" },
    { icon: Users, label: "Referral Program", path: "/referral-program" },
    { icon: Gift, label: "Pro Membership", path: "/pro-membership" },
    { icon: HelpCircle, label: "Help & Support", path: "/help" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {showBackButton ? (
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 flex-shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 flex-shrink-0">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Menu Header */}
                    <div className="p-6 border-b bg-gradient-to-r from-pink-500 to-orange-400">
                      <div className="flex items-center justify-between mb-4">
                        <Link to="/" className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-pink-600 font-bold text-sm">MJ</span>
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
                      <div className="flex items-center space-x-3 p-3 bg-white/20 rounded-lg">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                          <AvatarFallback className="bg-white text-pink-600 font-bold">
                            {getInitials(profile?.full_name || 'User')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white truncate text-sm">{profile?.full_name || 'User'}</h3>
                          <p className="text-xs text-pink-100">ID: {profile?.user_id_code || 'Loading...'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                      {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeMobileMenu}
                            className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors group ${
                              active 
                                ? 'bg-pink-50 text-pink-600 border-r-2 border-pink-600' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium text-sm">{item.label}</span>
                            {active && <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />}
                          </Link>
                        );
                      })}
                    </nav>

                    {/* Mobile Menu Footer */}
                    <div className="p-4 border-t">
                      <Link to="/" onClick={closeMobileMenu}>
                        <Button variant="outline" className="w-full">
                          <Home className="w-4 h-4 mr-2" />
                          Back to Home
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">{pageTitle}</h1>
              {profile?.full_name && (
                <p className="text-xs text-gray-600 truncate">Welcome, {profile.full_name}</p>
              )}
            </div>
          </div>
          
          <Link to="/">
            <Button variant="outline" size="sm" className="h-8 px-3 flex-shrink-0">
              <Home className="w-4 h-4 mr-1" />
              <span className="text-xs">Home</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <Link to="/" className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">MJ</span>
              </div>
              <div>
                <h2 className="font-bold text-gray-900">MyJaipur</h2>
                <p className="text-xs text-gray-600">Your Local Hub</p>
              </div>
            </Link>

            <div className="mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                  <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold">
                    {getInitials(profile?.full_name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">{profile?.full_name || 'User'}</h3>
                  <p className="text-sm text-gray-600">ID: {profile?.user_id_code || 'Loading...'}</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                      active 
                        ? 'bg-pink-50 text-pink-600 border-r-2 border-pink-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="lg:p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
