import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, FileText, Store, Calendar, BarChart3, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import AppLayout from "@/components/layout/AppLayout";
import RoleManager from "@/components/admin/RoleManager";
import DealApprovalQueue from "@/components/admin/DealApprovalQueue";
import EventsManagement from "@/components/admin/EventsManagement";
import MerchantsManagement from "@/components/admin/MerchantsManagement";
import UsersManagement from "@/components/admin/UsersManagement";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import { NightlifeArticleSeeder } from "@/components/admin/NightlifeArticleSeeder";

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

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4 hidden sm:inline" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4 hidden sm:inline" />
              Users
            </TabsTrigger>
            <TabsTrigger value="merchants" className="gap-2">
              <Store className="w-4 h-4 hidden sm:inline" />
              Merchants
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-2">
              <FileText className="w-4 h-4 hidden sm:inline" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4 hidden sm:inline" />
              Events
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <Newspaper className="w-4 h-4 hidden sm:inline" />
              Content
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="w-4 h-4 hidden sm:inline" />
              Roles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
          <TabsContent value="users"><UsersManagement /></TabsContent>
          <TabsContent value="merchants"><MerchantsManagement /></TabsContent>
          <TabsContent value="deals"><DealApprovalQueue /></TabsContent>
          <TabsContent value="events"><EventsManagement /></TabsContent>
          <TabsContent value="content">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>Publish evergreen SEO-optimized articles and guides</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <NightlifeArticleSeeder />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="roles"><RoleManager /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminDashboardPage;
