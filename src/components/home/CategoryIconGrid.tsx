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
    <section className="px-4 pt-4 pb-3 relative z-10">
      {/* Elevated card container */}
      <div className="bg-card/90 backdrop-blur-xl rounded-xl border border-border/40 shadow-lg p-3">
        {/* Horizontal scrollable category icons */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-0.5 px-0.5">
          {categories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="flex flex-col items-center gap-1.5 group flex-shrink-0 min-w-[52px]"
              >
                {/* Icon container with gradient and shadow */}
                <div className={cn(
                  "relative w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center transition-all duration-300",
                  category.gradient,
                  category.shadowColor,
                  "shadow-md group-hover:shadow-lg group-hover:scale-105 group-active:scale-95"
                )}>
                  <IconComponent className="w-5 h-5 text-white" strokeWidth={1.5} />
                  
                  {/* Pillar indicator - small star */}
                  {category.isPillar && (
                    <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full border-[1.5px] border-card shadow-sm flex items-center justify-center">
                      <span className="text-[6px]">⭐</span>
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-semibold text-foreground whitespace-nowrap">
                    {category.name}
                  </span>
                </div>
              </button>
            );
          })}
          
          {/* Fade indicator for more */}
          <div className="w-1 flex-shrink-0" />
        </div>
      </div>
    </section>
  );
};

export default CategoryIconGrid;
