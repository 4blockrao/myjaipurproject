
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Store, Plus, TrendingUp, Users, Star, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MerchantDashboard = () => {
  const [merchant, setMerchant] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDealForm, setShowNewDealForm] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: '',
    description: '',
    original_price: '',
    discounted_price: '',
    category: '',
    jaicoin_reward: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const fetchMerchantData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch merchant profile
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (merchantData) {
        setMerchant(merchantData);
        
        // Fetch deals
        const { data: dealsData } = await supabase
          .from('deals')
          .select('*')
          .eq('merchant_id', merchantData.id)
          .order('created_at', { ascending: false });
        
        setDeals(dealsData || []);

        // Fetch analytics
        const { data: analyticsData } = await supabase
          .from('merchant_analytics')
          .select('*')
          .eq('merchant_id', merchantData.id)
          .order('date', { ascending: false })
          .limit(30);
        
        setAnalytics(analyticsData || []);
      }
    } catch (error) {
      console.error('Error fetching merchant data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createMerchantProfile = async (businessName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('merchants')
      .insert({
        user_id: user.id,
        business_name: businessName
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create merchant profile",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Merchant profile created successfully"
      });
      fetchMerchantData();
    }
  };

  const createDeal = async () => {
    if (!merchant) return;

    const { error } = await supabase
      .from('deals')
      .insert({
        merchant_id: merchant.id,
        title: newDeal.title,
        description: newDeal.description,
        original_price: parseFloat(newDeal.original_price),
        discounted_price: parseFloat(newDeal.discounted_price),
        category: newDeal.category,
        jaicoin_reward: parseInt(newDeal.jaicoin_reward),
        discount_percentage: Math.round(((parseFloat(newDeal.original_price) - parseFloat(newDeal.discounted_price)) / parseFloat(newDeal.original_price)) * 100)
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Deal created successfully"
      });
      setNewDeal({
        title: '',
        description: '',
        original_price: '',
        discounted_price: '',
        category: '',
        jaicoin_reward: ''
      });
      setShowNewDealForm(false);
      fetchMerchantData();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!merchant) {
    return (
      <Card>
        <CardHeader className="text-center">
          <Store className="w-12 h-12 mx-auto text-blue-500 mb-4" />
          <CardTitle>Become a Merchant Partner</CardTitle>
          <CardDescription>
            Join HiJaipur as a merchant and reach thousands of customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Business Name"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                createMerchantProfile((e.target as HTMLInputElement).value);
              }
            }}
          />
          <Button 
            onClick={() => {
              const input = document.querySelector('input') as HTMLInputElement;
              createMerchantProfile(input.value);
            }}
            className="w-full"
          >
            Create Merchant Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-6 h-6" />
            {merchant.business_name}
            {merchant.is_verified && (
              <Badge className="bg-green-500">Verified</Badge>
            )}
          </CardTitle>
          <CardDescription>Merchant Dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{merchant.total_deals}</div>
              <div className="text-sm text-gray-600">Total Deals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{merchant.total_reviews}</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{merchant.average_rating || 0}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics?.reduce((sum: number, day: any) => sum + (day.deals_viewed || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="deals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Deals</h3>
            <Button onClick={() => setShowNewDealForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Deal
            </Button>
          </div>

          {showNewDealForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Deal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Deal Title"
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                />
                <Textarea
                  placeholder="Deal Description"
                  value={newDeal.description}
                  onChange={(e) => setNewDeal({...newDeal, description: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Original Price"
                    type="number"
                    value={newDeal.original_price}
                    onChange={(e) => setNewDeal({...newDeal, original_price: e.target.value})}
                  />
                  <Input
                    placeholder="Discounted Price"
                    type="number"
                    value={newDeal.discounted_price}
                    onChange={(e) => setNewDeal({...newDeal, discounted_price: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Category"
                    value={newDeal.category}
                    onChange={(e) => setNewDeal({...newDeal, category: e.target.value})}
                  />
                  <Input
                    placeholder="JaiCoin Reward"
                    type="number"
                    value={newDeal.jaicoin_reward}
                    onChange={(e) => setNewDeal({...newDeal, jaicoin_reward: e.target.value})}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createDeal}>Create Deal</Button>
                  <Button variant="outline" onClick={() => setShowNewDealForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {deals.map((deal) => (
              <Card key={deal.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{deal.title}</h4>
                      <p className="text-sm text-gray-600">{deal.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-lg font-bold text-green-600">₹{deal.discounted_price}</span>
                        <span className="text-sm line-through text-gray-500">₹{deal.original_price}</span>
                        <Badge>{deal.discount_percentage}% OFF</Badge>
                      </div>
                    </div>
                    <Badge variant={deal.is_active ? "default" : "secondary"}>
                      {deal.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Analytics Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Deals Created</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Redemptions</TableHead>
                    <TableHead>Reviews</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.slice(0, 10).map((day: any) => (
                    <TableRow key={day.date}>
                      <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                      <TableCell>{day.deals_created || 0}</TableCell>
                      <TableCell>{day.deals_viewed || 0}</TableCell>
                      <TableCell>{day.deals_redeemed || 0}</TableCell>
                      <TableCell>{day.reviews_received || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MerchantDashboard;
