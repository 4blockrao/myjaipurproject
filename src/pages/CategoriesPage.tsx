import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Scissors, ShoppingBag, Smartphone, Dumbbell, Car, Camera, Plane, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import NativeMobileHeader from "@/components/layout/NativeMobileHeader";
import NativeBottomNav from "@/components/home/NativeBottomNav";

const categories = [
  { id: "Food & Dining", name: "Food & Dining", icon: Utensils, emoji: "🍽️", description: "Restaurants, cafes & dining", color: "bg-orange-100 dark:bg-orange-900/20", iconColor: "text-orange-600" },
  { id: "Beauty & Wellness", name: "Beauty & Wellness", icon: Scissors, emoji: "💆", description: "Salons, spas & wellness", color: "bg-pink-100 dark:bg-pink-900/20", iconColor: "text-pink-600" },
  { id: "Shopping", name: "Shopping", icon: ShoppingBag, emoji: "🛍️", description: "Fashion & lifestyle", color: "bg-blue-100 dark:bg-blue-900/20", iconColor: "text-blue-600" },
  { id: "Electronics", name: "Electronics", icon: Smartphone, emoji: "📱", description: "Gadgets & tech", color: "bg-purple-100 dark:bg-purple-900/20", iconColor: "text-purple-600" },
  { id: "Health & Fitness", name: "Health & Fitness", icon: Dumbbell, emoji: "💪", description: "Gyms & fitness", color: "bg-green-100 dark:bg-green-900/20", iconColor: "text-green-600" },
  { id: "Automotive", name: "Automotive", icon: Car, emoji: "🚗", description: "Car services", color: "bg-gray-100 dark:bg-gray-900/20", iconColor: "text-gray-600" },
  { id: "Services", name: "Services", icon: Camera, emoji: "🔧", description: "Professional services", color: "bg-yellow-100 dark:bg-yellow-900/20", iconColor: "text-yellow-600" },
  { id: "Travel", name: "Travel", icon: Plane, emoji: "✈️", description: "Tours & travel", color: "bg-cyan-100 dark:bg-cyan-900/20", iconColor: "text-cyan-600" },
  { id: "Education", name: "Education", icon: GraduationCap, emoji: "📚", description: "Courses & learning", color: "bg-indigo-100 dark:bg-indigo-900/20", iconColor: "text-indigo-600" }
];

const CategoriesPage = () => {
  const [dealCounts, setDealCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchDealCounts();
  }, []);

  const fetchDealCounts = async () => {
    const { data: deals } = await supabase
      .from('deals')
      .select('category')
      .eq('is_active', true)
      .eq('approval_status', 'approved');

    const counts = deals?.reduce((acc, deal) => {
      acc[deal.category] = (acc[deal.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    setDealCounts(counts);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <NativeMobileHeader title="Categories" subtitle="Browse by category" backPath="/" />

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <Link key={category.id} to={`/deals?category=${encodeURIComponent(category.id)}`}>
              <Card className={`h-full hover:shadow-md transition-all active:scale-[0.98] ${category.color}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{category.emoji}</span>
                    {dealCounts[category.id] > 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {dealCounts[category.id]}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <NativeBottomNav />
    </div>
  );
};

export default CategoriesPage;
