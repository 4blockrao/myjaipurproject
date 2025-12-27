import { Home, Tag, CalendarDays, MapPin, User, Car, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const BottomNavHeritage = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Tag, label: "Deals", path: "/deals" },
    { icon: CalendarDays, label: "Events", path: "/events" },
    { icon: MapPin, label: "Explore", path: "/jaipur" },
    { icon: User, label: "Account", path: "/account" }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/50 z-50 safe-area-pb">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-2 px-4 transition-all duration-200 min-w-[64px] relative",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
              
              <div className={cn(
                "p-2 rounded-xl transition-all duration-200",
                active && "bg-primary/10"
              )}>
                <IconComponent 
                  className={cn(
                    "w-5 h-5 transition-all",
                    active && "scale-110"
                  )} 
                  strokeWidth={active ? 2.5 : 2} 
                />
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 font-medium",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavHeritage;
