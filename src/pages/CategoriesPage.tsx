import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Scissors, ShoppingBag, Smartphone, Dumbbell, Car, Camera, Plane, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const CategoriesPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dealCounts, setDealCounts] = useState<Record<string, number>>({});

  const categories = [
    {
      id: "Food & Dining",
      name: "Food & Dining",
      icon: Utensils,
      description: "Restaurants, cafes, and culinary experiences",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      id: "Beauty & Wellness",
      name: "Beauty & Wellness",
      icon: Scissors,
      description: "Salons, spas, and wellness centers",
      color: "from-pink-500 to-purple-500",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600"
    },
    {
      id: "Shopping",
      name: "Shopping",
      icon: ShoppingBag,
      description: "Fashion, jewelry, and lifestyle products",
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      id: "Electronics",
      name: "Electronics",
      icon: Smartphone,
      description: "Gadgets, appliances, and tech accessories",
      color: "from-purple-500 to-blue-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      id: "Health & Fitness",
      name: "Health & Fitness",
      icon: Dumbbell,
      description: "Gyms, yoga studios, and sports equipment",
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      id: "Automotive",
      name: "Automotive",
      icon: Car,
      description: "Car services, accessories, and maintenance",
      color: "from-gray-600 to-gray-800",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600"
    },
    {
      id: "Services",
      name: "Services",
      icon: Camera,
      description: "Photography, events, and professional services",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600"
    },
    {
      id: "Travel",
      name: "Travel",
      icon: Plane,
      description: "Tours, packages, and travel experiences",
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600"
    },
    {
      id: "Education",
      name: "Education",
      icon: GraduationCap,
      description: "Courses, classes, and skill development",
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    }
  ];

  useEffect(() => {
    checkUser();
    fetchDealCounts();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchUserProfile(session.user.id);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

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
    <AppLayout user={user} profile={profile}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">All Categories</h1>
            <p className="text-xl text-gray-600">Explore deals across all categories</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/deals?category=${encodeURIComponent(category.id)}`}>
                <Card className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md ${category.bgColor}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-full ${category.bgColor} border-2 border-white shadow-sm`}>
                        <category.icon className={`w-6 h-6 ${category.iconColor}`} />
                      </div>
                      <Badge variant="secondary" className="bg-white text-gray-700">
                        {dealCounts[category.id] || 0} deals
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CategoriesPage;
