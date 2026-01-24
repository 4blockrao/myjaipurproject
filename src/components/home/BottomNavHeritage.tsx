import { Home, Tag, CalendarDays, Newspaper, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/contexts/AnalyticsContext";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const BottomNavHeritage = () => {
  const location = useLocation();
  const { trackClick } = useAnalytics();

  const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Tag, label: "Deals", path: "/deals" },
    { icon: CalendarDays, label: "Events", path: "/events" },
    { icon: Newspaper, label: "News", path: "/news" },
    { icon: User, label: "Account", path: "/account" }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (item: NavItem) => {
    trackClick('bottom_nav', item.label, item.path, item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-pb">
      {/* Glassmorphism background */}
      <div className="bg-background/80 backdrop-blur-2xl border-t border-border/30 shadow-[0_-4px_30px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "flex flex-col items-center py-2.5 px-3 sm:px-5 transition-all duration-300 min-w-[56px] relative group",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active indicator pill */}
                {active && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-full shadow-lg shadow-primary/30" />
                )}
                
                {/* Icon container */}
                <div className={cn(
                  "relative p-2 rounded-2xl transition-all duration-300",
                  active 
                    ? "bg-primary/10 scale-110" 
                    : "group-hover:bg-muted/50"
                )}>
                  <IconComponent 
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      active && "drop-shadow-sm"
                    )} 
                    strokeWidth={active ? 2.5 : 2} 
                  />
                  
                  {/* Glow effect for active */}
                  {active && (
                    <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md -z-10" />
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-[10px] mt-0.5 transition-all duration-300",
                  active ? "font-bold" : "font-medium"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavHeritage;
