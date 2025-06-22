
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, Utensils, Sparkles, Laptop, Dumbbell, Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryIcons = {
    'Food & Dining': { icon: Utensils, color: 'from-red-500 to-orange-500', emoji: '🍽️' },
    'Beauty & Wellness': { icon: Sparkles, color: 'from-pink-500 to-purple-500', emoji: '💆‍♀️' },
    'Shopping': { icon: ShoppingBag, color: 'from-blue-500 to-cyan-500', emoji: '🛍️' },
    'Electronics': { icon: Laptop, color: 'from-gray-600 to-gray-800', emoji: '📱' },
    'Health & Fitness': { icon: Dumbbell, color: 'from-green-500 to-emerald-500', emoji: '💪' },
    'Services': { icon: Heart, color: 'from-purple-500 to-pink-500', emoji: '🔧' }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      // Count deals per category
      const categoryCounts = data?.reduce((acc: any, deal: any) => {
        acc[deal.category] = (acc[deal.category] || 0) + 1;
        return acc;
      }, {});

      const categoryList = Object.entries(categoryCounts || {}).map(([name, count]) => ({
        name,
        count,
        ...categoryIcons[name as keyof typeof categoryIcons]
      }));

      setCategories(categoryList);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Categories
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover amazing deals organized by category. Find exactly what you're looking for.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl h-48 shadow-sm"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Link key={index} to={`/deals?category=${encodeURIComponent(category.name)}`}>
                    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md overflow-hidden h-full">
                      <div className={`h-32 bg-gradient-to-br ${category.color} flex items-center justify-center relative`}>
                        <div className="text-center">
                          <div className="text-4xl mb-2">{category.emoji}</div>
                          {IconComponent && <IconComponent className="w-8 h-8 text-white mx-auto" />}
                        </div>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl group-hover:text-pink-600 transition-colors">
                          {category.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          {category.count} active deals
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <Button variant="outline" className="w-full group-hover:border-pink-300 group-hover:text-pink-600">
                          Browse Deals
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Popular Locations */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Popular Locations in Jaipur
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'C-Scheme', 'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar',
                  'Jagatpura', 'Shyam Nagar', 'Tonk Road', 'Ajmer Road'
                ].map((location) => (
                  <Link 
                    key={location} 
                    to={`/deals?location=${encodeURIComponent(location)}`}
                    className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <MapPin className="w-4 h-4 text-gray-400 group-hover:text-pink-500" />
                    <span className="text-gray-700 group-hover:text-pink-600 font-medium">
                      {location}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
