
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Utensils, 
  Sparkles, 
  ShoppingBag, 
  Smartphone, 
  Dumbbell, 
  Wrench,
  Gamepad2,
  GraduationCap
} from "lucide-react";

interface CategoryGridProps {
  dealCounts: Record<string, number>;
  onCategorySelect: (category: string) => void;
}

const CATEGORIES = [
  { 
    id: "Food & Dining", 
    name: "Food & Dining", 
    icon: Utensils, 
    color: "from-orange-400 to-red-500",
    bgColor: "from-orange-50 to-red-50"
  },
  { 
    id: "Beauty & Wellness", 
    name: "Beauty & Wellness", 
    icon: Sparkles, 
    color: "from-pink-400 to-purple-500",
    bgColor: "from-pink-50 to-purple-50"
  },
  { 
    id: "Shopping", 
    name: "Shopping", 
    icon: ShoppingBag, 
    color: "from-blue-400 to-indigo-500",
    bgColor: "from-blue-50 to-indigo-50"
  },
  { 
    id: "Electronics", 
    name: "Electronics", 
    icon: Smartphone, 
    color: "from-gray-400 to-gray-600",
    bgColor: "from-gray-50 to-gray-100"
  },
  { 
    id: "Health & Fitness", 
    name: "Health & Fitness", 
    icon: Dumbbell, 
    color: "from-green-400 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50"
  },
  { 
    id: "Services", 
    name: "Services", 
    icon: Wrench, 
    color: "from-yellow-400 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50"
  },
  { 
    id: "Entertainment", 
    name: "Entertainment", 
    icon: Gamepad2, 
    color: "from-purple-400 to-pink-500",
    bgColor: "from-purple-50 to-pink-50"
  },
  { 
    id: "Education", 
    name: "Education", 
    icon: GraduationCap, 
    color: "from-teal-400 to-cyan-500",
    bgColor: "from-teal-50 to-cyan-50"
  }
];

const CategoryGrid = ({ dealCounts, onCategorySelect }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const count = dealCounts[category.id] || 0;
        
        return (
          <Card 
            key={category.id} 
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 overflow-hidden"
            onClick={() => onCategorySelect(category.id)}
          >
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${category.bgColor} p-6 text-center relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-gray-800">
                  {category.name}
                </h3>
                
                <Badge 
                  variant="secondary" 
                  className="bg-white/80 text-gray-700 text-xs font-medium"
                >
                  {count} deals
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
