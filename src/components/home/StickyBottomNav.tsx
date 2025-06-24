
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Search, Heart, User, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const StickyBottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Home, label: "Home", path: "/", badge: null },
    { icon: Search, label: "Explore", path: "/deals", badge: null },
    { icon: Heart, label: "Favorites", path: "/favorites", badge: 3 },
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", badge: null },
    { icon: User, label: "Profile", path: "/profile", badge: null },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-pb">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || 
            (item.path === "/dashboard" && currentPath.startsWith("/dashboard"));
          
          return (
            <Link key={index} to={item.path} className="flex-1">
              <Button
                variant="ghost"
                size="sm"
                className={`
                  w-full h-auto px-1 py-3 flex flex-col items-center space-y-1 relative
                  ${isActive 
                    ? "text-pink-600 bg-pink-50" 
                    : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                  }
                `}
              >
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                    {item.badge}
                  </Badge>
                )}
                
                <Icon className={`w-5 h-5 ${isActive ? "text-pink-600" : "text-gray-600"}`} />
                
                <span className={`text-xs font-medium ${isActive ? "text-pink-600" : "text-gray-600"}`}>
                  {item.label}
                </span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default StickyBottomNav;
