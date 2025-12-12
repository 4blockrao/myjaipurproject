import { useState, useEffect } from "react";
import { Home, Search, Heart, User, ShoppingBag, Shield, Compass } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";

const NativeBottomNav = () => {
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
    { icon: Compass, label: "Explore", path: "/deals" },
    { icon: ShoppingBag, label: "Orders", path: "/orders" },
    { icon: Heart, label: "Saved", path: "/favorites" },
    { icon: User, label: "Profile", path: "/profile" }
  ];

  // Add admin nav item for authorized users
  if (canManageDeals || isAdmin) {
    navItems.splice(4, 0, { icon: Shield, label: "Admin", path: "/admin" });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 safe-area-pb">
      <div className="flex justify-around items-center max-w-lg mx-auto px-2 py-1">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 min-w-[64px] ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-primary/10' : ''
              }`}>
                <IconComponent className={`w-5 h-5 transition-all ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NativeBottomNav;
