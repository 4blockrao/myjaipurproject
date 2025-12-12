import { useNavigate } from "react-router-dom";
import { 
  Utensils, Scissors, ShoppingBag, Smartphone, 
  Dumbbell, Car, Camera, Plane, GraduationCap, Sparkles 
} from "lucide-react";

interface NativeCategoryGridProps {
  dealCounts: Record<string, number>;
  onCategorySelect: (category: string) => void;
}

const NativeCategoryGrid = ({ dealCounts, onCategorySelect }: NativeCategoryGridProps) => {
  const navigate = useNavigate();

  const categories = [
    { id: "Food & Dining", name: "Food", icon: Utensils, emoji: "🍽️", color: "bg-orange-500" },
    { id: "Beauty & Wellness", name: "Beauty", icon: Scissors, emoji: "💆‍♀️", color: "bg-pink-500" },
    { id: "Shopping", name: "Shopping", icon: ShoppingBag, emoji: "🛍️", color: "bg-blue-500" },
    { id: "Electronics", name: "Electronics", icon: Smartphone, emoji: "📱", color: "bg-purple-500" },
    { id: "Health & Fitness", name: "Fitness", icon: Dumbbell, emoji: "💪", color: "bg-green-500" },
    { id: "Automotive", name: "Auto", icon: Car, emoji: "🚗", color: "bg-slate-600" },
    { id: "Services", name: "Services", icon: Camera, emoji: "📷", color: "bg-amber-500" },
    { id: "Travel", name: "Travel", icon: Plane, emoji: "✈️", color: "bg-cyan-500" },
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect(categoryId);
    navigate(`/deals?category=${encodeURIComponent(categoryId)}`);
  };

  return (
    <div className="px-4 py-5 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Categories</h2>
        <button 
          onClick={() => navigate('/categories')}
          className="text-sm text-primary font-medium"
        >
          See All
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card hover:bg-accent transition-all duration-200 active:scale-95"
          >
            <div className={`w-12 h-12 ${category.color} rounded-2xl flex items-center justify-center shadow-sm`}>
              <span className="text-xl">{category.emoji}</span>
            </div>
            <span className="text-xs font-medium text-foreground text-center leading-tight">
              {category.name}
            </span>
            {dealCounts[category.id] > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {dealCounts[category.id]} deals
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NativeCategoryGrid;
