import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, FileText, Store, Calendar, BarChart3, Newspaper, Car, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import AppLayout from "@/components/layout/AppLayout";
import RoleManager from "@/components/admin/RoleManager";
import DealsManagement from "@/components/admin/DealsManagement";
import EventsManagement from "@/components/admin/EventsManagement";
import MerchantsManagement from "@/components/admin/MerchantsManagement";
import UsersManagement from "@/components/admin/UsersManagement";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import ArticleCMS from "@/components/admin/cms/ArticleCMS";
import CarsManagement from "@/components/admin/CarsManagement";
import SiteAnalyticsDashboard from "@/components/admin/SiteAnalyticsDashboard";

const AdminDashboardPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const { isLoading: rolesLoading, isAdmin, canManageUsers } = useUserRoles(user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => setProfile(data));
      }
    });
  }, []);

  if (rolesLoading) {
    return (
      <AppLayout title="Admin Portal" subtitle="Loading..." showBackButton={true} backPath="/">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!user || (!isAdmin && !canManageUsers)) {
    return (
      <AppLayout title="Access Denied" showBackButton={true} backPath="/">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have permission to access this area.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Admin Portal" subtitle="Complete platform management" showBackButton={true} backPath="/">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
          <p className="text-muted-foreground">Complete platform management</p>
        </div>

        <Tabs defaultValue="site-analytics" className="space-y-6">
          <TabsList className="flex flex-wrap justify-start gap-1 h-auto p-1 bg-muted/50">
            <TabsTrigger value="site-analytics" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-background">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Site</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-background">
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Business</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-background">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="merchants" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-background">
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Merchants</span>
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-background">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Deals</span>
            </TabsTrigger>
            <TabsTrigger value="cars" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-background">
              <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Cars</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-background">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Events</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-background">
              <Newspaper className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 data-[state=active]:bg-background">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Roles</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="site-analytics"><SiteAnalyticsDashboard /></TabsContent>
          <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
          <TabsContent value="users"><UsersManagement /></TabsContent>
          <TabsContent value="merchants"><MerchantsManagement /></TabsContent>
          <TabsContent value="deals"><DealsManagement /></TabsContent>
          <TabsContent value="cars"><CarsManagement /></TabsContent>
          <TabsContent value="events"><EventsManagement /></TabsContent>
          <TabsContent value="content"><ArticleCMS /></TabsContent>
          <TabsContent value="roles"><RoleManager /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminDashboardPage;
