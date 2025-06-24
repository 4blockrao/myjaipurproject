
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingBag, QrCode, Clock, MapPin, Star, Share2, Download, 
  CheckCircle, XCircle, Calendar, Receipt, Eye, Ticket,
  CreditCard, Gift, RefreshCw, AlertCircle, Phone
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface Order {
  id: string;
  order_number: string;
  deal_title: string;
  merchant_name: string;
  merchant_phone: string;
  location: string;
  original_price: number;
  paid_amount: number;
  discount_amount: number;
  coupon_code: string;
  purchase_date: string;
  expiry_date: string;
  status: 'active' | 'used' | 'expired' | 'refunded';
  qr_code: string;
  terms_conditions: string;
  rating?: number;
  review?: string;
  merchant_rating?: number;
}

interface RedemptionHistory {
  id: string;
  order_id: string;
  redeemed_at: string;
  merchant_name: string;
  location: string;
  amount_saved: number;
  rating: number;
  review?: string;
}

const OrdersPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchRedemptionHistory();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await fetchUserProfile(session.user.id);
    }
    setIsLoading(false);
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

  const fetchOrders = async () => {
    try {
      // Mock data - in real implementation, fetch from coupons table
      const mockOrders: Order[] = [
        {
          id: "1",
          order_number: "MJ240001",
          deal_title: "50% off Traditional Rajasthani Thali",
          merchant_name: "Rajasthani Thali House",
          merchant_phone: "+91 98765 43210",
          location: "C-Scheme, Jaipur",
          original_price: 800,
          paid_amount: 350,
          discount_amount: 450,
          coupon_code: "SAVE50RTH",
          purchase_date: "2024-06-20T10:30:00Z",
          expiry_date: "2024-07-20T23:59:59Z",
          status: 'active',
          qr_code: "QR_SAVE50RTH_MJ240001",
          terms_conditions: "Valid only for dine-in. Cannot be combined with other offers. Valid till expiry date.",
          merchant_rating: 4.5
        },
        {
          id: "2",
          order_number: "MJ240002",
          deal_title: "40% off Spa & Wellness Package",
          merchant_name: "Serenity Spa",
          merchant_phone: "+91 98765 43211",
          location: "Malviya Nagar, Jaipur",
          original_price: 2000,
          paid_amount: 1200,
          discount_amount: 800,
          coupon_code: "SPA40OFF",
          purchase_date: "2024-06-15T14:20:00Z",
          expiry_date: "2024-07-15T23:59:59Z",
          status: 'used',
          qr_code: "QR_SPA40OFF_MJ240002",
          terms_conditions: "Advance booking required. Valid for all services except premium treatments.",
          rating: 5,
          review: "Amazing spa experience! Highly recommended.",
          merchant_rating: 4.8
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchRedemptionHistory = async () => {
    try {
      // Mock data
      const mockRedemptions: RedemptionHistory[] = [
        {
          id: "1",
          order_id: "2",
          redeemed_at: "2024-06-22T16:45:00Z",
          merchant_name: "Serenity Spa",
          location: "Malviya Nagar, Jaipur",
          amount_saved: 800,
          rating: 5,
          review: "Amazing spa experience! Highly recommended."
        }
      ];
      setRedemptionHistory(mockRedemptions);
    } catch (error) {
      console.error('Error fetching redemption history:', error);
    }
  };

  const generateQRCode = (order: Order) => {
    setSelectedOrder(order);
    setShowQRCode(true);
  };

  const downloadCoupon = (order: Order) => {
    // In real implementation, generate PDF or image
    toast({
      title: "Coupon Downloaded",
      description: `Order ${order.order_number} coupon saved to downloads`
    });
  };

  const shareOrder = (order: Order) => {
    const shareText = `Check out this amazing deal I got: ${order.deal_title} at ${order.merchant_name}!`;
    if (navigator.share) {
      navigator.share({
        title: order.deal_title,
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Shared!",
        description: "Order details copied to clipboard"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'used':
        return <Badge className="bg-blue-100 text-blue-700">Used</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-700">Expired</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-700">Refunded</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'used':
        return <Ticket className="w-5 h-5 text-blue-500" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Orders">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="Orders">
        <Card className="m-4">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="My Orders" showBackButton>
      <div className="p-4 max-w-6xl mx-auto space-y-6">
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Active ({orders.filter(o => o.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              All Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              History ({redemptionHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Orders Tab */}
          <TabsContent value="active">
            <div className="space-y-4">
              {orders.filter(order => order.status === 'active').map((order) => (
                <Card key={order.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{order.deal_title}</h3>
                            <p className="text-gray-600">{order.merchant_name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-4 h-4" />
                              {order.location}
                            </p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-500">Order #</p>
                            <p className="font-medium">{order.order_number}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Coupon Code</p>
                            <p className="font-medium font-mono">{order.coupon_code}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">You Paid</p>
                            <p className="font-medium text-green-600">₹{order.paid_amount}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">You Save</p>
                            <p className="font-medium text-pink-600">₹{order.discount_amount}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Purchased: {new Date(order.purchase_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className={isExpiringSoon(order.expiry_date) ? 'text-red-600 font-medium' : ''}>
                              Expires: {new Date(order.expiry_date).toLocaleDateString()}
                            </span>
                            {isExpiringSoon(order.expiry_date) && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                onClick={() => generateQRCode(order)}
                                className="bg-gradient-to-r from-pink-500 to-orange-400"
                              >
                                <QrCode className="w-4 h-4 mr-2" />
                                Show QR Code
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Redeem at Merchant</DialogTitle>
                              </DialogHeader>
                              <div className="text-center p-6">
                                <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                  <QrCode className="w-24 h-24 text-gray-400" />
                                </div>
                                <p className="font-mono text-lg font-bold mb-2">{order.coupon_code}</p>
                                <p className="text-sm text-gray-600 mb-4">Show this code to the merchant</p>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-sm font-medium">{order.merchant_name}</p>
                                  <p className="text-xs text-gray-600">{order.location}</p>
                                  <p className="text-xs text-gray-600 flex items-center justify-center gap-1 mt-1">
                                    <Phone className="w-3 h-3" />
                                    {order.merchant_phone}
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button variant="outline" onClick={() => downloadCoupon(order)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>

                          <Button variant="outline" onClick={() => shareOrder(order)}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost">
                                <Eye className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Order Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                                  <p className="text-sm text-gray-600">{order.terms_conditions}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Merchant Rating</h4>
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span>{order.merchant_rating}/5</span>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {orders.filter(order => order.status === 'active').length === 0 && (
                <Card className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No active orders</h3>
                  <p className="text-gray-500 mb-6">Purchase some deals to see them here</p>
                  <Button onClick={() => window.location.href = '/deals'}>
                    Browse Deals
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* All Orders Tab */}
          <TabsContent value="all">
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">{order.deal_title}</h3>
                        <p className="text-gray-600 text-sm">{order.merchant_name} • {order.location}</p>
                        <p className="text-xs text-gray-500 mt-1">Order #{order.order_number}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-sm text-gray-500 mt-1">₹{order.paid_amount}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {getStatusIcon(order.status)}
                        <span>{new Date(order.purchase_date).toLocaleDateString()}</span>
                      </div>
                      {order.status === 'active' && (
                        <Button size="sm" onClick={() => generateQRCode(order)}>
                          <QrCode className="w-4 h-4 mr-1" />
                          Redeem
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Redemption History Tab */}
          <TabsContent value="history">
            <div className="space-y-4">
              {redemptionHistory.map((redemption) => (
                <Card key={redemption.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">Redeemed at {redemption.merchant_name}</h3>
                        <p className="text-gray-600 text-sm">{redemption.location}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(redemption.redeemed_at).toLocaleDateString()} • 
                          Saved ₹{redemption.amount_saved}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{redemption.rating}/5</span>
                      </div>
                    </div>
                    
                    {redemption.review && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm italic">"{redemption.review}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {redemptionHistory.length === 0 && (
                <Card className="p-12 text-center">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No redemption history</h3>
                  <p className="text-gray-500">Your redeemed deals will appear here</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
