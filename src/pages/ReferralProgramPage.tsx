
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DetailedReferralProgram from "@/components/referral/DetailedReferralProgram";
import MerchantReferralSystem from "@/components/referral/MerchantReferralSystem";
import { supabase } from "@/integrations/supabase/client";
import { Users, Store } from "lucide-react";

const ReferralProgramPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="Referral Program" showBackButton>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Refer Friends
            </TabsTrigger>
            <TabsTrigger value="merchants" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Refer Merchants
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <DetailedReferralProgram user={user} profile={profile} />
          </TabsContent>

          <TabsContent value="merchants">
            <MerchantReferralSystem />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReferralProgramPage;
