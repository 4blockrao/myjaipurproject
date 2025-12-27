import { useNavigate } from "react-router-dom";
import { 
  Tag, Calendar, Home, Car, Utensils, Sparkles, 
  ShoppingBag, Building2, Ticket
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface CategoryIconGridProps {
  onCategorySelect?: (category: string) => void;
}

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  path: string;
  isPillar?: boolean;
}

const CategoryIconGrid = ({ onCategorySelect }: CategoryIconGridProps) => {
  const navigate = useNavigate();

  const categories: Category[] = [
    // Core Pillars - highlighted
    { 
      id: "deals", 
      name: "Deals", 
      icon: Tag, 
      bgColor: "bg-gradient-to-br from-rose-500 to-pink-600",
      iconColor: "text-white",
      path: "/deals",
      isPillar: true
    },
    { 
      id: "events", 
      name: "Events", 
      icon: Calendar, 
      bgColor: "bg-gradient-to-br from-purple-500 to-violet-600",
      iconColor: "text-white",
      path: "/events",
      isPillar: true
    },
    { 
      id: "property", 
      name: "Property", 
      icon: Home, 
      bgColor: "bg-gradient-to-br from-emerald-500 to-teal-600",
      iconColor: "text-white",
      path: "/properties",
      isPillar: true
    },
    { 
      id: "automobile", 
      name: "Cars", 
      icon: Car, 
      bgColor: "bg-gradient-to-br from-blue-500 to-indigo-600",
      iconColor: "text-white",
      path: "/cars",
      isPillar: true
    },
    // Secondary categories
    { 
      id: "food", 
      name: "Food", 
      icon: Utensils, 
      bgColor: "bg-gradient-to-br from-orange-400 to-red-500",
      iconColor: "text-white",
      path: "/deals?category=Food+%26+Dining"
    },
    { 
      id: "beauty", 
      name: "Beauty", 
      icon: Sparkles, 
      bgColor: "bg-gradient-to-br from-pink-400 to-rose-500",
      iconColor: "text-white",
      path: "/deals?category=Beauty+%26+Wellness"
    },
    { 
      id: "shopping", 
      name: "Shop", 
      icon: ShoppingBag, 
      bgColor: "bg-gradient-to-br from-cyan-400 to-blue-500",
      iconColor: "text-white",
      path: "/deals?category=Shopping"
    },
    { 
      id: "merchants", 
      name: "Business", 
      icon: Building2, 
      bgColor: "bg-gradient-to-br from-slate-500 to-gray-600",
      iconColor: "text-white",
      path: "/merchants"
    },
  ];

  const handleCategoryClick = (category: Category) => {
    onCategorySelect?.(category.id);
    navigate(category.path);
  };

  return (
    <section className="px-4 py-5">
      {/* Horizontal scrollable category icons */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((category) => {
          const IconComponent = category.icon;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="flex flex-col items-center gap-2 group flex-shrink-0"
            >
              {/* Icon container with gradient */}
              <div className={`relative w-16 h-16 rounded-2xl ${category.bgColor} flex items-center justify-center shadow-md group-hover:shadow-lg group-active:scale-95 transition-all duration-200`}>
                <IconComponent className={`w-7 h-7 ${category.iconColor}`} />
                {/* Pillar indicator */}
                {category.isPillar && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                )}
              </div>
              
              {/* Label */}
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                {category.name}
              </span>
            </button>
          );
        })}
        
        {/* Fade indicator for more */}
        <div className="w-4 flex-shrink-0" />
      </div>
    </section>
  );
};

export default CategoryIconGrid;
