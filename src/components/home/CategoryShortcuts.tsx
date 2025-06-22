
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Utensils, Sparkles, ShoppingBag, Smartphone, Dumbbell, Wrench } from "lucide-react";

interface CategoryShortcutsProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  dealCounts: Record<string, number>;
}

const CategoryShortcuts = ({ categories, selectedCategory, onCategorySelect, dealCounts }: CategoryShortcutsProps) => {
  const categoryIcons: Record<string, any> = {
    "Food & Dining": Utensils,
    "Beauty & Wellness": Sparkles,
    "Shopping": ShoppingBag,
    "Electronics": Smartphone,
    "Health & Fitness": Dumbbell,
    "Services": Wrench,
  };

  const categoryEmojis: Record<string, string> = {
    "all": "🏪",
    "Food & Dining": "🍽️",
    "Beauty & Wellness": "💆‍♀️",
    "Shopping": "🛍️",
    "Electronics": "📱",
    "Health & Fitness": "💪",
    "Services": "🔧",
  };

  const trendingCategories = ["Food & Dining", "Beauty & Wellness"];

  return (
    <section className="sticky top-16 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <Button variant="outline" size="sm" className="text-pink-600 border-pink-300 hover:bg-pink-50">
            View All
          </Button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            const emoji = categoryEmojis[category];
            const count = dealCounts[category] || 0;
            const isSelected = selectedCategory === category;
            const isTrending = trendingCategories.includes(category);
            
            return (
              <Button
                key={category}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategorySelect(category)}
                className={`
                  flex-shrink-0 h-auto px-4 py-3 flex flex-col items-center space-y-1 min-w-[80px] relative
                  ${isSelected 
                    ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg" 
                    : "bg-white border-gray-200 text-gray-700 hover:bg-pink-50 hover:border-pink-300"
                  }
                `}
              >
                {isTrending && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 animate-pulse">
                    HOT
                  </Badge>
                )}
                
                <div className="text-xl">
                  {emoji}
                </div>
                
                <span className="text-xs font-medium text-center leading-tight">
                  {category === "all" ? "All" : category.split(' ')[0]}
                </span>
                
                <span className={`text-xs ${isSelected ? "text-white/80" : "text-gray-500"}`}>
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryShortcuts;
