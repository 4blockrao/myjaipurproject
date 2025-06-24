
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Ticket, QrCode, Download, Share2, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface PurchasedCoupon {
  id: string;
  coupon_code: string;
  purchase_date: string;
  expiry_date: string;
  is_used: boolean;
  deal: {
    id: string;
    title: string;
    description: string;
    category: string;
    discount_percentage: number;
    original_price: number;
    discounted_price: number;
    location: string;
    merchants?: {
      business_name: string;
      average_rating: number;
    };
  };
}

const CouponsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [purchasedCoupons, setPurchasedCoupons] = useState<PurchasedCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPurchasedCoupons();
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

  const fetchPurchasedCoupons = async () => {
    try {
      // Mock data - in real implementation, fetch from database
      const mockCoupons: PurchasedCoupon[] = [
        {
          id: "1",
          coupon_code: "SAVE50JH",
          purchase_date: "2024-06-20",
          expiry_date: "2024-07-20",
          is_used: false,
          deal: {
            id: "1",
            title: "Spa & Wellness Package",
            description: "Relaxing spa experience",
            category: "Beauty & Wellness",
            discount_percentage: 40,
            original_price: 2000,
            discounted_price: 1200,
            location: "Malviya Nagar, Jaipur",
            merchants: {
              business_name: "Serenity Spa",
              average_rating: 4.8
            }
          }
        },
        {
          id: "2",
          coupon_code: "FOOD30JH",
          purchase_date: "2024-06-18",
          expiry_date: "2024-07-18",
          is_used: true,
          deal: {
            id: "2",
            title: "Dinner for Two",
            description: "Romantic dinner experience",
            category: "Food & Dining",
            discount_percentage: 30,
            original_price: 1500,
            discounted_price: 1050,
            location: "C-Scheme, Jaipur",
            merchants: {
              business_name: "Royal Palace Restaurant",
              average_rating: 4.6
            }
          }
        }
      ];
      setPurchasedCoupons(mockCoupons);
    } catch (error) {
      console.error('Error fetching purchased coupons:', error);
    }
  };

  const downloadCoupon = (coupon: PurchasedCoupon) => {
    toast({
      title: "Coupon Downloaded",
      description: "Your coupon has been saved to downloads"
    });
  };

  const shareCoupon = (coupon: PurchasedCoupon) => {
    if (navigator.share) {
      navigator.share({
        title: `My ${coupon.deal.title} coupon`,
        text: `I got this amazing deal: ${coupon.deal.discount_percentage}% off!`,
        url: `${window.location.origin}/deal/${coupon.deal.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/deal/${coupon.deal.id}`);
      toast({
        title: "Link copied",
        description: "Deal link has been copied to clipboard"
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="My Coupons">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout user={user} profile={profile} pageTitle="My Coupons">
        <Card className="m-4">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your coupons</CardDescription>
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

  const activeCoupons = purchasedCoupons.filter(c => !c.is_used);
  const usedCoupons = purchasedCoupons.filter(c => c.is_used);

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="My Coupons" showBackButton>
      <div className="p-4 max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Coupons</h1>
            <p className="text-gray-600">Your purchased deals and coupon codes</p>
          </div>
          <div className="flex items-center space-x-3">
            <Ticket className="w-6 h-6 text-blue-500" />
            <Badge variant="outline">{activeCoupons.length} active</Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{activeCoupons.length}</div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{usedCoupons.length}</div>
              <div className="text-sm text-gray-600">Used</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{purchasedCoupons.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                ₹{purchasedCoupons.reduce((sum, c) => sum + (c.deal.original_price - c.deal.discounted_price), 0)}
              </div>
              <div className="text-sm text-gray-600">Saved</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Coupons */}
        {activeCoupons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Coupons</h2>
            <div className="space-y-4">
              {activeCoupons.map((coupon) => (
                <Card key={coupon.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Coupon Code Section */}
                      <div className="md:w-1/3">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white text-center">
                          <QrCode className="w-12 h-12 mx-auto mb-3" />
                          <h3 className="text-xl font-bold mb-2">{coupon.coupon_code}</h3>
                          <Badge className="bg-green-500">Active</Badge>
                        </div>
                      </div>

                      {/* Deal Details Section */}
                      <div className="md:w-2/3">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline">{coupon.deal.category}</Badge>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadCoupon(coupon)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => shareCoupon(coupon)}
                            >
                              <Share2 className="w-4 h-4 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold mb-2">{coupon.deal.title}</h3>
                        <p className="text-gray-600 mb-3">{coupon.deal.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Merchant</p>
                            <p className="font-medium">{coupon.deal.merchants?.business_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">{coupon.deal.location}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Purchased On</p>
                            <p className="font-medium">{new Date(coupon.purchase_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Expires On</p>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-red-500" />
                              <p className="font-medium text-red-600">{new Date(coupon.expiry_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-pink-600">₹{coupon.deal.discounted_price}</span>
                            <span className="text-sm text-gray-500 line-through">₹{coupon.deal.original_price}</span>
                            <Badge className="bg-green-100 text-green-700">
                              {coupon.deal.discount_percentage}% OFF
                            </Badge>
                          </div>
                          <Button className="bg-gradient-to-r from-pink-500 to-orange-400">
                            Use Coupon
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Used Coupons */}
        {usedCoupons.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Used Coupons</h2>
            <div className="space-y-4">
              {usedCoupons.map((coupon) => (
                <Card key={coupon.id} className="opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Ticket className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{coupon.deal.title}</h3>
                          <p className="text-sm text-gray-600">{coupon.coupon_code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">Used</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Used on {new Date(coupon.purchase_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {purchasedCoupons.length === 0 && (
          <Card className="p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No coupons yet</h3>
            <p className="text-gray-500 mb-6">Purchase deals to get exclusive coupons</p>
            <Button onClick={() => window.location.href = '/deals'}>
              Browse Deals
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CouponsPage;
