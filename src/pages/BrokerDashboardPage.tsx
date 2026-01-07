import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  Building2, BarChart3, Home, Plus, Settings,
  TrendingUp, Eye, Phone, MapPin, ArrowLeft, Loader2
} from "lucide-react";

const BrokerDashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { roles, isLoading: rolesLoading } = useUserRoles();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth?redirect=/broker/dashboard');
        return;
      }
      setUser(session.user);
      await fetchUserProfile(session.user.id);
      await fetchProperties(session.user.id);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const fetchProperties = async (userId: string) => {
    // This would fetch from a properties table - for now using placeholder
    setProperties([]);
  };

  const statsCards = [
    { title: "Active Listings", value: "0", icon: Home, color: "text-green-600" },
    { title: "Total Views", value: "0", icon: Eye, color: "text-blue-600" },
    { title: "Inquiries", value: "0", icon: Phone, color: "text-purple-600" },
    { title: "This Month", value: "₹0", icon: TrendingUp, color: "text-orange-600" }
  ];

  if (isLoading || rolesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAccess = roles.includes('real_estate_broker') || roles.includes('admin');
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be a registered property broker to access this dashboard.
            </p>
            <Button onClick={() => navigate('/register/vendor?type=real_estate_broker')} className="bg-gradient-to-r from-green-500 to-teal-600">
              Register as Broker
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Broker Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Welcome, {profile?.full_name || 'Broker'}</p>
                </div>
              </div>
            </div>
            
            <Button className="bg-gradient-to-r from-green-500 to-teal-600">
              <Plus className="w-4 h-4 mr-2" /> List Property
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsCards.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Plus className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Add Property</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Home className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">My Listings</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-medium">Analytics</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Settings className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="font-medium">Settings</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Properties Listed Yet</h3>
            <p className="text-muted-foreground mb-6">Start listing properties to reach thousands of potential buyers in Jaipur</p>
            <Button className="bg-gradient-to-r from-green-500 to-teal-600">
              <Plus className="w-4 h-4 mr-2" /> Add Your First Property
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrokerDashboardPage;
