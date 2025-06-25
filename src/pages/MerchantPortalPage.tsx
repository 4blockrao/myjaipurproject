
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Store, BarChart3, Users, Package, Settings,
  TrendingUp, DollarSign, ShoppingBag, Star,
  Bell, Calendar, FileText, MapPin, ArrowLeft
} from "lucide-react";

const MerchantPortalPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const merchantMenuItems = [
    {
      icon: BarChart3,
      title: "Analytics",
      description: "View your store performance",
      path: "/merchant/analytics",
      color: "bg-blue-500"
    },
    {
      icon: Package,
      title: "Products",
      description: "Manage your inventory",
      path: "/merchant/products",
      color: "bg-green-500"
    },
    {
      icon: ShoppingBag,
      title: "Orders",
      description: "Track customer orders",
      path: "/merchant/orders",
      color: "bg-purple-500"
    },
    {
      icon: Users,
      title: "Customers",
      description: "Manage customer relationships",
      path: "/merchant/customers",
      color: "bg-orange-500"
    },
    {
      icon: Star,
      title: "Reviews",
      description: "Monitor customer feedback",
      path: "/merchant/reviews",
      color: "bg-yellow-500"
    },
    {
      icon: FileText,
      title: "Reports",
      description: "Download business reports",
      path: "/merchant/reports",
      color: "bg-red-500"
    },
    {
      icon: Settings,
      title: "Store Settings",
      description: "Configure your store",
      path: "/merchant/settings",
      color: "bg-gray-500"
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Stay updated with alerts",
      path: "/merchant/notifications",
      color: "bg-indigo-500"
    }
  ];

  const statsCards = [
    {
      title: "Total Revenue",
      value: "₹1,24,567",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Orders Today",
      value: "23",
      change: "+8.3%",
      icon: ShoppingBag,
      color: "text-blue-600"
    },
    {
      title: "Active Products",
      value: "156",
      change: "+2.1%",
      icon: Package,
      color: "text-purple-600"
    },
    {
      title: "Customer Rating",
      value: "4.8",
      change: "+0.2",
      icon: Star,
      color: "text-yellow-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading merchant portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Merchant Portal</h1>
                  <p className="text-sm text-gray-600">Welcome, {profile?.full_name || 'Merchant'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Customer Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Here's what's happening with your store today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change} from last month</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {merchantMenuItems.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((order) => (
                  <div key={order} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Order #MJ{1000 + order}</p>
                      <p className="text-sm text-gray-600">Customer Name</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(Math.random() * 1000 + 500).toFixed(0)}</p>
                      <Badge className="bg-green-100 text-green-700">Completed</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Performance</CardTitle>
              <CardDescription>This week's highlights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revenue Growth</span>
                  <span className="font-semibold text-green-600">+15.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">New Customers</span>
                  <span className="font-semibold text-blue-600">+28</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="font-semibold text-purple-600">₹847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Product Views</span>
                  <span className="font-semibold text-orange-600">+42%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <Store className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Ready to grow your business?</h3>
              <p className="mb-6 opacity-90">Join our merchant program and reach thousands of customers in Jaipur</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Boost Your Store
                </Button>
                <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MerchantPortalPage;
