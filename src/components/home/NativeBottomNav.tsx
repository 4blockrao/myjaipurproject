import { useState, useEffect } from "react";
import { Home, Tag, CalendarDays, Newspaper, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const NativeBottomNav = () => {
  const location = useLocation();

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 safe-area-pb">
      <div className="flex justify-around items-center max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[60px]",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
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
                "text-[10px] mt-0.5",
                active ? "font-semibold" : "font-medium"
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

export default NativeBottomNav;
