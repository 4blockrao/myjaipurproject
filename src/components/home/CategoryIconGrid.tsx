import { useNavigate } from "react-router-dom";
import { 
  Tag, Calendar, Home, Car, Utensils, Heart, 
  ShoppingBag, Building2, Newspaper
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryIconGridProps {
  onCategorySelect?: (category: string) => void;
}

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  gradient: string;
  shadowColor: string;
  path: string;
  isPillar?: boolean;
  count?: string;
}

const CategoryIconGrid = ({ onCategorySelect }: CategoryIconGridProps) => {
  const navigate = useNavigate();

  const categories: Category[] = [
    // Core Pillars - highlighted
    { 
      id: "deals", 
      name: "Deals", 
      icon: Tag, 
      gradient: "from-rose-500 to-pink-600",
      shadowColor: "shadow-rose-500/30",
      path: "/deals",
      isPillar: true,
      count: "200+"
    },
    { 
      id: "events", 
      name: "Events", 
      icon: Calendar, 
      gradient: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/30",
      path: "/events",
      isPillar: true,
      count: "50+"
    },
    { 
      id: "property", 
      name: "Property", 
      icon: Home, 
      gradient: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/30",
      path: "/properties",
      isPillar: true,
      count: "1K+"
    },
    { 
      id: "automobile", 
      name: "Cars", 
      icon: Car, 
      gradient: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/30",
      path: "/cars",
      isPillar: true,
      count: "100+"
    },
    // Secondary categories
    { 
      id: "food", 
      name: "Food", 
      icon: Utensils, 
      gradient: "from-orange-400 to-red-500",
      shadowColor: "shadow-orange-500/25",
      path: "/deals?category=Food+%26+Dining"
    },
    { 
      id: "beauty", 
      name: "Beauty", 
      icon: Heart, 
      gradient: "from-pink-400 to-rose-500",
      shadowColor: "shadow-pink-500/25",
      path: "/deals?category=Beauty+%26+Wellness"
    },
    { 
      id: "shopping", 
      name: "Shop", 
      icon: ShoppingBag, 
      gradient: "from-cyan-400 to-blue-500",
      shadowColor: "shadow-cyan-500/25",
      path: "/deals?category=Shopping"
    },
    { 
      id: "news", 
      name: "News", 
      icon: Newspaper, 
      gradient: "from-slate-500 to-gray-600",
      shadowColor: "shadow-slate-500/25",
      path: "/news"
    },
  ];

  const handleCategoryClick = (category: Category) => {
    onCategorySelect?.(category.id);
    navigate(category.path);
  };

  return (
    <section className="px-4 pt-6 pb-5 relative z-10">
      {/* Elevated card container */}
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl shadow-black/5 p-4">
        {/* Horizontal scrollable category icons */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="flex flex-col items-center gap-2 group flex-shrink-0"
              >
                {/* Icon container with gradient and shadow */}
                <div className={cn(
                  "relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center transition-all duration-300",
                  category.gradient,
                  category.shadowColor,
                  "shadow-lg group-hover:shadow-xl group-hover:scale-105 group-active:scale-95"
                )}>
                  <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={1.5} />
                  
                  {/* Pillar indicator - small star */}
                  {category.isPillar && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-card shadow-sm flex items-center justify-center">
                      <span className="text-[8px]">⭐</span>
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {category.name}
                  </span>
                  {category.count && (
                    <span className="text-[10px] text-muted-foreground">
                      {category.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          
          {/* Fade indicator for more */}
          <div className="w-2 flex-shrink-0" />
        </div>
      </div>
    </section>
  );
};

export default CategoryIconGrid;
