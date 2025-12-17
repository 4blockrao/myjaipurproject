import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay } from "date-fns";
import {
  BarChart3,
  TrendingUp,
  Users,
  Store,
  Ticket,
  ShoppingCart,
  Coins,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#10b981", "#f59e0b", "#ef4444"];

const AdminAnalytics = () => {
  // Platform stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-analytics-stats"],
    queryFn: async () => {
      const [
        { count: usersCount },
        { count: merchantsCount },
        { count: dealsCount },
        { count: ordersCount },
        { count: eventsCount },
        { count: registrationsCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("merchants").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("deals").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("event_registrations").select("*", { count: "exact", head: true }),
      ]);

      return {
        users: usersCount || 0,
        merchants: merchantsCount || 0,
        deals: dealsCount || 0,
        orders: ordersCount || 0,
        events: eventsCount || 0,
        registrations: registrationsCount || 0,
      };
    },
  });

  // User growth (last 7 days)
  const { data: userGrowth } = useQuery({
    queryKey: ["admin-user-growth"],
    queryFn: async () => {
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          date: format(date, "MMM d"),
          start: startOfDay(date).toISOString(),
          end: startOfDay(subDays(date, -1)).toISOString(),
        };
      });

      const results = await Promise.all(
        days.map(async (day) => {
          const { count } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", day.start)
            .lt("created_at", day.end);

          return { date: day.date, users: count || 0 };
        })
      );

      return results;
    },
  });

  // Orders by status
  const { data: ordersByStatus } = useQuery({
    queryKey: ["admin-orders-status"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("status");

      const counts: Record<string, number> = {};
      data?.forEach((order) => {
        const status = order.status || "pending";
        counts[status] = (counts[status] || 0) + 1;
      });

      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  // Events by category
  const { data: eventsByCategory } = useQuery({
    queryKey: ["admin-events-category"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("category");

      const counts: Record<string, number> = {};
      data?.forEach((event) => {
        const category = event.category || "other";
        counts[category] = (counts[category] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    },
  });

  // Revenue data
  const { data: revenueData } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount, created_at")
        .eq("status", "completed");

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      const { data: eventRegs } = await supabase
        .from("event_registrations")
        .select("total_amount")
        .eq("status", "confirmed");

      const eventRevenue = eventRegs?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

      return {
        totalRevenue,
        eventRevenue,
        dealRevenue: totalRevenue,
        combined: totalRevenue + eventRevenue,
      };
    },
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="w-4 h-4 text-green-500" />
              Merchants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.merchants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-500" />
              Active Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.deals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-purple-500" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.events}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-500" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{revenueData?.combined.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              User Growth (7 Days)
            </CardTitle>
            <CardDescription>New user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Events by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Events by Category
            </CardTitle>
            <CardDescription>Distribution of event types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventsByCategory || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs capitalize" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Orders by Status
            </CardTitle>
            <CardDescription>Current order distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatus || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {ordersByStatus?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue Summary
            </CardTitle>
            <CardDescription>Platform earnings breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Deal Orders</p>
                  <p className="text-sm text-muted-foreground">Product & coupon sales</p>
                </div>
              </div>
              <div className="text-xl font-bold">
                ₹{revenueData?.dealRevenue.toLocaleString() || 0}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium">Event Tickets</p>
                  <p className="text-sm text-muted-foreground">Event registrations</p>
                </div>
              </div>
              <div className="text-xl font-bold">
                ₹{revenueData?.eventRevenue.toLocaleString() || 0}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <div>
                <p className="font-bold text-lg">Total Revenue</p>
                <p className="text-sm text-muted-foreground">All sources combined</p>
              </div>
              <div className="text-2xl font-bold text-primary">
                ₹{revenueData?.combined.toLocaleString() || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
