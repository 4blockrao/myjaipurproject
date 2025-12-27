import { useNavigate } from "react-router-dom";
import { 
  Utensils, Sparkles, ShoppingBag, Flame, 
  Ticket, ChevronRight
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
}

const CategoryIconGrid = ({ onCategorySelect }: CategoryIconGridProps) => {
  const navigate = useNavigate();

  const categories: Category[] = [
    { 
      id: "Food & Dining", 
      name: "Food", 
      icon: Utensils, 
      bgColor: "bg-gradient-to-br from-orange-400 to-red-500",
      iconColor: "text-white"
    },
    { 
      id: "Beauty & Wellness", 
      name: "Beauty", 
      icon: Sparkles, 
      bgColor: "bg-gradient-to-br from-pink-400 to-rose-500",
      iconColor: "text-white"
    },
    { 
      id: "Shopping", 
      name: "Shop", 
      icon: ShoppingBag, 
      bgColor: "bg-gradient-to-br from-blue-400 to-indigo-500",
      iconColor: "text-white"
    },
    { 
      id: "Events", 
      name: "Events", 
      icon: Flame, 
      bgColor: "bg-gradient-to-br from-amber-400 to-orange-500",
      iconColor: "text-white"
    },
    { 
      id: "Entertainment", 
      name: "At the...", 
      icon: Ticket, 
      bgColor: "bg-gradient-to-br from-purple-400 to-violet-500",
      iconColor: "text-white"
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect?.(categoryId);
    if (categoryId === "Events") {
      navigate('/events');
    } else if (categoryId === "Entertainment") {
      navigate('/events?category=entertainment');
    } else {
      navigate(`/deals?category=${encodeURIComponent(categoryId)}`);
    }
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
              onClick={() => handleCategoryClick(category.id)}
              className="flex flex-col items-center gap-2 group flex-shrink-0"
            >
              {/* Icon container with gradient */}
              <div className={`w-16 h-16 rounded-2xl ${category.bgColor} flex items-center justify-center shadow-md group-hover:shadow-lg group-active:scale-95 transition-all duration-200`}>
                <IconComponent className={`w-7 h-7 ${category.iconColor}`} />
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
