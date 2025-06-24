
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Wallet, Trophy, Star, 
  User, Heart, Settings, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DashboardLayoutProps {
  children: ReactNode;
  user?: any;
  profile?: any;
}

const DashboardLayout = ({ children, user, profile }: DashboardLayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/dashboard", exact: true },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: Trophy, label: "Leaderboard", path: "/dashboard?tab=leaderboard" },
    { icon: Star, label: "JaiCoin Zone", path: "/dashboard?tab=gamification" },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/profile?tab=settings" },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return currentPath === path || (currentPath === "/dashboard" && path === "/dashboard");
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {profile?.full_name || 'User'}!</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
            Home
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{profile?.full_name || 'User'}</h2>
                <p className="text-sm text-gray-600">Dashboard</p>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      active 
                        ? 'bg-pink-50 text-pink-600 border-r-2 border-pink-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation Cards */}
        <div className="lg:hidden w-full p-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {sidebarItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <Link key={item.path} to={item.path}>
                  <Card className={`p-4 hover:shadow-md transition-shadow ${
                    active ? 'bg-pink-50 border-pink-200' : ''
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${active ? 'text-pink-600' : 'text-gray-600'}`} />
                      <span className={`font-medium ${active ? 'text-pink-600' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:p-8 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
