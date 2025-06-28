
import { useState, useEffect } from "react";
import { Home, Search, Heart, User, ShoppingBag, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";

const StickyBottomNav = () => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const { canManageDeals, isAdmin } = useUserRoles(user?.id);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting user session:', error);
        setUser(null);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Deals", path: "/deals" },
    { icon: ShoppingBag, label: "Orders", path: "/orders" },
    { icon: Heart, label: "Favorites", path: "/favorites" },
    { icon: User, label: "Profile", path: "/profile" }
  ];

  // Add admin nav item for authorized users
  if (canManageDeals || isAdmin) {
    navItems.splice(4, 0, { icon: Shield, label: "Admin", path: "/admin" });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? "text-pink-600 bg-pink-50" 
                  : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
              }`}
            >
              <IconComponent className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default StickyBottomNav;
