
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ReferEarnSection from "@/components/home/ReferEarnSection";
import MerchantReferralSystem from "@/components/referral/MerchantReferralSystem";
import { Users, Store } from "lucide-react";

const ReferralProgramPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  return (
    <DashboardLayout user={user} profile={profile} pageTitle="Referral Program" showBackButton>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Referral Program
          </h1>
          <p className="text-gray-600 text-lg">
            Earn JAICoins by referring friends and merchants to JaipurCircle
          </p>
        </div>

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
            <ReferEarnSection user={user} profile={profile} />
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
