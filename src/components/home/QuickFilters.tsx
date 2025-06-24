
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Clock, Star, Fire, Zap } from "lucide-react";

interface QuickFiltersProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
  dealCounts: Record<string, number>;
}

const QuickFilters = ({ 
  selectedCategory, 
  onCategorySelect, 
  selectedFilter, 
  onFilterSelect, 
  dealCounts 
}: QuickFiltersProps) => {
  const categories = [
    { id: "all", name: "All Deals", emoji: "🏪", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
    { id: "Food & Dining", name: "Food & Dining", emoji: "🍽️", color: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
    { id: "Beauty & Wellness", name: "Beauty & Wellness", emoji: "💆‍♀️", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
    { id: "Shopping", name: "Shopping", emoji: "🛍️", color: "bg-pink-100 text-pink-700 hover:bg-pink-200" },
    { id: "Electronics", name: "Electronics", emoji: "📱", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
    { id: "Health & Fitness", name: "Health & Fitness", emoji: "💪", color: "bg-green-100 text-green-700 hover:bg-green-200" },
    { id: "Services", name: "Services", emoji: "🔧", color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
  ];

  const filters = [
    { id: "all", name: "All", icon: Fire, color: "bg-gray-100 text-gray-700" },
    { id: "nearby", name: "Nearby", icon: MapPin, color: "bg-blue-100 text-blue-700" },
    { id: "trending", name: "Trending", icon: TrendingUp, color: "bg-green-100 text-green-700" },
    { id: "ending-soon", name: "Ending Soon", icon: Clock, color: "bg-red-100 text-red-700" },
    { id: "top-rated", name: "Top Rated", icon: Star, color: "bg-yellow-100 text-yellow-700" },
    { id: "new", name: "New", icon: Zap, color: "bg-purple-100 text-purple-700" },
  ];

  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Categories */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Categories</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                onClick={() => onCategorySelect(category.id)}
                className={`
                  whitespace-nowrap transition-all duration-200 hover:scale-105 border-transparent shadow-sm
                  ${selectedCategory === category.id 
                    ? `${category.color} ring-2 ring-offset-2 ring-pink-300 shadow-md` 
                    : category.color
                  }
                `}
              >
                <span className="mr-2 text-base">{category.emoji}</span>
                {category.name}
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-white/70 text-gray-600 text-xs"
                >
                  {dealCounts[category.id] || 0}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Sort & Filter</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onFilterSelect(filter.id)}
                  className={`
                    whitespace-nowrap transition-all duration-200 hover:scale-105 border-transparent shadow-sm
                    ${selectedFilter === filter.id 
                      ? `${filter.color} ring-2 ring-offset-2 ring-pink-300 shadow-md` 
                      : filter.color
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {filter.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickFilters;
