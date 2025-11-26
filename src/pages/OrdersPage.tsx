import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MobileOptimizedLayout from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Package, MapPin, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

const OrdersPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkUser();
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

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          deals (
            title,
            original_price,
            discounted_price,
            merchants (
              business_name,
              phone,
              email
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  if (!user) {
    return (
      <DashboardLayout pageTitle="My Orders" showBackButton>
        <MobileOptimizedLayout>
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your orders</p>
            <Link to="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </MobileOptimizedLayout>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="My Orders" showBackButton>
      <MobileOptimizedLayout>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">Start exploring deals to place your first order</p>
            <Link to="/deals">
              <Button>Browse Deals</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Order #{order.order_code}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            Qty: {order.quantity}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          order.status === 'completed' ? 'default' : 
                          order.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{order.deals?.title}</h3>
                        <p className="text-gray-600">{order.deals?.merchants?.business_name}</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Amount:</span>
                              <span>₹{order.total_amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>JaiCoins Used:</span>
                              <span>{order.jaicoin_used || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Payment:</span>
                              <span className="capitalize">{order.payment_method}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Contact Info</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{order.customer_phone || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{order.deals?.merchants?.email || 'Not available'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {order.delivery_address && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mt-0.5" />
                              <span>{order.delivery_address}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
              </Card>
            ))}
          </div>
        )}
      </MobileOptimizedLayout>
    </DashboardLayout>
  );
};

export default OrdersPage;
