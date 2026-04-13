
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Target, Award, Coins, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdvancedAnalytics = () => {
  const [userAnalytics, setUserAnalytics] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user analytics
      const { data: analyticsData } = await (supabase as any)
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      setUserAnalytics(analyticsData || []);

      // Fetch user badges
      const { data: badgesData } = await (supabase as any)
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      setUserBadges(badgesData || []);

      // Calculate total stats
      const totals = (analyticsData || []).reduce((acc: any, day: any) => ({
        totalDealsViewed: (acc.totalDealsViewed || 0) + (day.deals_viewed || 0),
        totalDealsRedeemed: (acc.totalDealsRedeemed || 0) + (day.deals_redeemed || 0),
        totalJaicoinEarned: (acc.totalJaicoinEarned || 0) + (day.jaicoin_earned || 0),
        totalReferrals: (acc.totalReferrals || 0) + (day.referrals_made || 0),
        totalReviews: (acc.totalReviews || 0) + (day.reviews_written || 0),
        totalSpinAttempts: (acc.totalSpinAttempts || 0) + (day.spin_attempts || 0)
      }), {});

      setTotalStats(totals);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = userAnalytics.slice(0, 15).reverse().map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    jaicoin: day.jaicoin_earned || 0,
    deals: day.deals_redeemed || 0,
    reviews: day.reviews_written || 0
  }));

  const activityData = [
    { name: 'Deals Viewed', value: totalStats.totalDealsViewed || 0, color: '#8884d8' },
    { name: 'Deals Redeemed', value: totalStats.totalDealsRedeemed || 0, color: '#82ca9d' },
    { name: 'Reviews Written', value: totalStats.totalReviews || 0, color: '#ffc658' },
    { name: 'Referrals Made', value: totalStats.totalReferrals || 0, color: '#ff7300' }
  ];

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-600 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Advanced Analytics
          </CardTitle>
          <CardDescription>
            Deep insights into your HiJaipur activity and achievements
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Coins className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{totalStats.totalJaicoinEarned || 0}</div>
                <div className="text-sm text-gray-600">JaiCoins Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{totalStats.totalDealsRedeemed || 0}</div>
                <div className="text-sm text-gray-600">Deals Redeemed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalStats.totalReferrals || 0}</div>
                <div className="text-sm text-gray-600">Referrals Made</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{userBadges.length}</div>
                <div className="text-sm text-gray-600">Badges Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Activity Trends (Last 15 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="jaicoin" stroke="#ffc658" name="JaiCoins Earned" />
                    <Line type="monotone" dataKey="deals" stroke="#82ca9d" name="Deals Redeemed" />
                    <Line type="monotone" dataKey="reviews" stroke="#8884d8" name="Reviews Written" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No activity data available yet. Start using HiJaipur to see your trends!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {activityData.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No activity data available yet. Start exploring deals to see your activity distribution!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Your Badges & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {userBadges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userBadges.map((badge) => (
                    <Card key={badge.id} className="border-yellow-200 bg-yellow-50">
                      <CardContent className="pt-4 text-center">
                        <Award className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
                        <h4 className="font-semibold">{badge.badge_name}</h4>
                        <p className="text-sm text-gray-600">{badge.badge_description}</p>
                        <Badge className="mt-2">{badge.badge_type}</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Earned on {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No badges earned yet. Complete activities to earn your first badge!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
