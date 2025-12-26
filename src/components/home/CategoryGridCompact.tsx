import { useNavigate } from "react-router-dom";
import { 
  Utensils, Scissors, ShoppingBag, Smartphone, 
  Dumbbell, Car, Wrench, Plane, ChevronRight
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface CategoryGridProps {
  dealCounts?: Record<string, number>;
  onCategorySelect?: (category: string) => void;
}

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  gradient: string;
  emoji: string;
}

const CategoryGridCompact = ({ dealCounts = {}, onCategorySelect }: CategoryGridProps) => {
  const navigate = useNavigate();

  const categories: Category[] = [
    { id: "Food & Dining", name: "Food", icon: Utensils, gradient: "from-orange-500 to-red-500", emoji: "🍽️" },
    { id: "Beauty & Wellness", name: "Beauty", icon: Scissors, gradient: "from-pink-500 to-rose-500", emoji: "💆" },
    { id: "Shopping", name: "Shop", icon: ShoppingBag, gradient: "from-blue-500 to-indigo-500", emoji: "🛍️" },
    { id: "Electronics", name: "Tech", icon: Smartphone, gradient: "from-violet-500 to-purple-500", emoji: "📱" },
    { id: "Health & Fitness", name: "Fitness", icon: Dumbbell, gradient: "from-green-500 to-emerald-500", emoji: "💪" },
    { id: "Automotive", name: "Auto", icon: Car, gradient: "from-slate-600 to-slate-700", emoji: "🚗" },
    { id: "Services", name: "Services", icon: Wrench, gradient: "from-amber-500 to-orange-500", emoji: "🔧" },
    { id: "Travel", name: "Travel", icon: Plane, gradient: "from-cyan-500 to-teal-500", emoji: "✈️" },
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect?.(categoryId);
    navigate(`/deals?category=${encodeURIComponent(categoryId)}`);
  };

  return (
    <section className="px-4 py-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Browse Categories</h2>
        <button 
          onClick={() => navigate('/categories')}
          className="flex items-center gap-1 text-sm text-primary font-medium"
        >
          All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category grid - 4 columns */}
      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => {
          const count = dealCounts[category.id] || 0;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="flex flex-col items-center gap-2 group"
            >
              {/* Icon container with gradient */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg group-active:scale-95 transition-all duration-200`}>
                <span className="text-2xl">{category.emoji}</span>
              </div>
              
              {/* Label */}
              <div className="text-center">
                <span className="text-xs font-medium text-foreground leading-tight block">
                  {category.name}
                </span>
                {count > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {count} deals
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGridCompact;
