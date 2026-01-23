import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, Eye, MousePointerClick, Search, UserPlus, Globe, 
  Smartphone, Monitor, Tablet, MapPin, Clock, TrendingUp 
} from "lucide-react";
import { format, subDays } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const SiteAnalyticsDashboard = () => {
  // Fetch total counts separately for accurate stats
  const { data: sessionCount, isLoading: sessionCountLoading } = useQuery({
    queryKey: ['admin-session-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('visitor_sessions')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: pageViewCount, isLoading: pageViewCountLoading } = useQuery({
    queryKey: ['admin-pageview-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: searchCount, isLoading: searchCountLoading } = useQuery({
    queryKey: ['admin-search-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('search_queries')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: clickCount, isLoading: clickCountLoading } = useQuery({
    queryKey: ['admin-click-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('click_events')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: softRegCount, isLoading: softRegCountLoading } = useQuery({
    queryKey: ['admin-softreg-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('soft_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', false);
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: convertedCount } = useQuery({
    queryKey: ['admin-converted-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('visitor_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_converted', true);
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch visitor sessions for details (limited for display)
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin-visitor-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visitor_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch page views for breakdown (limited for display)
  const { data: pageViews, isLoading: pageViewsLoading } = useQuery({
    queryKey: ['admin-page-views'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_views')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch search queries for display
  const { data: searches, isLoading: searchesLoading } = useQuery({
    queryKey: ['admin-search-queries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_queries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch soft registrations for display
  const { data: softRegs, isLoading: softRegsLoading } = useQuery({
    queryKey: ['admin-soft-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('soft_registrations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = sessionCountLoading || pageViewCountLoading || searchCountLoading || 
                    clickCountLoading || softRegCountLoading || sessionsLoading || 
                    pageViewsLoading || searchesLoading || softRegsLoading;

  // Stats from COUNT queries (accurate totals)
  const totalSessions = sessionCount || 0;
  const totalPageViews = pageViewCount || 0;
  const totalSearches = searchCount || 0;
  const totalClicks = clickCount || 0;
  const totalSoftRegs = softRegCount || 0;
  const conversionRate = totalSessions > 0 
    ? ((convertedCount || 0) / totalSessions * 100).toFixed(1)
    : '0';

  // Device breakdown
  const deviceBreakdown = sessions?.reduce((acc, s) => {
    const type = s.device_type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const deviceData = Object.entries(deviceBreakdown).map(([name, value]) => ({ name, value }));

  // City breakdown
  const cityBreakdown = sessions?.reduce((acc, s) => {
    const city = s.city || 'Unknown';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topCities = Object.entries(cityBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  // UTM source breakdown
  const sourceBreakdown = sessions?.reduce((acc, s) => {
    const source = s.utm_source || s.referrer || 'Direct';
    const key = source.length > 30 ? source.substring(0, 30) + '...' : source;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topSources = Object.entries(sourceBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  // Top pages
  const pageBreakdown = pageViews?.reduce((acc, p) => {
    const page = p.page_url || '/';
    acc[page] = (acc[page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topPages = Object.entries(pageBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, views]) => ({ page, views }));

  // Top search queries
  const searchBreakdown = searches?.reduce((acc, s) => {
    const query = s.search_query?.toLowerCase() || '';
    if (query) acc[query] = (acc[query] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topSearches = Object.entries(searchBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([query, count]) => ({ query, count }));

  // Daily sessions (last 7 days)
  const dailySessions = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = sessions?.filter(s => 
      s.created_at && format(new Date(s.created_at), 'yyyy-MM-dd') === dateStr
    )?.length || 0;
    return { date: format(date, 'MMM dd'), sessions: count };
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Sessions</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Page Views</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalPageViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Searches</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalSearches}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Clicks</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalClicks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Soft Regs</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalSoftRegs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Conversion</span>
            </div>
            <p className="text-2xl font-bold mt-1">{conversionRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="searches">Searches</TabsTrigger>
          <TabsTrigger value="soft-regs">Soft Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Sessions Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sessions (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dailySessions}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Device Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {topPages.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1 text-muted-foreground">{p.page}</span>
                        <Badge variant="secondary">{p.views}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Top Cities */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topCities.slice(0, 5)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Sources */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" /> Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {topSources.map((s, i) => (
                  <div key={i} className="p-2 bg-muted/50 rounded-lg text-center">
                    <p className="text-lg font-semibold">{s.value}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitors">
          <Card>
            <CardHeader>
              <CardTitle>Recent Visitors</CardTitle>
              <CardDescription>Detailed visitor session data</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {sessions?.slice(0, 50).map((session) => (
                    <div key={session.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {session.device_type === 'mobile' && <Smartphone className="w-4 h-4" />}
                          {session.device_type === 'tablet' && <Tablet className="w-4 h-4" />}
                          {session.device_type === 'desktop' && <Monitor className="w-4 h-4" />}
                          <span className="text-sm font-medium">{session.browser} on {session.os}</span>
                          {session.is_converted && <Badge className="bg-green-500">Converted</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {session.created_at && format(new Date(session.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">IP:</span>{' '}
                          <span className="font-mono">{session.ip_address || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>{' '}
                          {session.city ? `${session.city}, ${session.state}` : 'Unknown'}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Source:</span>{' '}
                          {session.utm_source || (session.referrer ? 'Referral' : 'Direct')}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Landing:</span>{' '}
                          <span className="truncate">{session.landing_page}</span>
                        </div>
                      </div>
                      {session.utm_campaign && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Campaign:</span>{' '}
                          {session.utm_campaign}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="searches">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Search Queries</CardTitle>
                <CardDescription>What users are searching for</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {topSearches.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">{s.query}</span>
                        <Badge variant="outline">{s.count}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Searches</CardTitle>
                <CardDescription>Live search activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {searches?.slice(0, 30).map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm p-2 border-b">
                        <div>
                          <span className="font-medium">{s.search_query}</span>
                          <span className="text-xs text-muted-foreground ml-2">({s.search_type})</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {s.created_at && format(new Date(s.created_at), 'HH:mm')}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="soft-regs">
          <Card>
            <CardHeader>
              <CardTitle>Soft Registrations</CardTitle>
              <CardDescription>Users who started but didn't complete registration</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {softRegs?.filter(r => !r.is_completed).map((reg) => (
                    <div key={reg.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-primary" />
                          <span className="font-medium">{reg.email || 'No email'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {reg.created_at && format(new Date(reg.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs">Name:</span>
                          <p>{reg.full_name || '-'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Phone:</span>
                          <p>{reg.phone || '-'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Locality:</span>
                          <p>{reg.locality || '-'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">Location:</span>
                          <p>{reg.city ? `${reg.city}, ${reg.state}` : '-'}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(reg.fields_filled as string[])?.map((field, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{field}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>IP: {reg.ip_address || 'N/A'}</span>
                        <span>{reg.device_type} / {reg.browser}</span>
                      </div>
                    </div>
                  ))}
                  {softRegs?.filter(r => !r.is_completed).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No pending soft registrations</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteAnalyticsDashboard;
