
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReferralSystem from "@/components/ReferralSystem";
import SpinWheel from "@/components/SpinWheel";
import CommunityHub from "@/components/CommunityHub";
import Leaderboard from "@/components/Leaderboard";
import { Users, RotateCcw, MessageCircle, Trophy } from "lucide-react";

const GamificationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent">
            HiJaipur Community
          </h1>
          <p className="text-gray-600 mt-2">Earn rewards, connect with friends, and climb the leaderboard!</p>
        </div>

        <Tabs defaultValue="referrals" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="spin" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Spin Wheel
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="referrals">
            <ReferralSystem />
          </TabsContent>
          
          <TabsContent value="spin">
            <SpinWheel />
          </TabsContent>
          
          <TabsContent value="community">
            <CommunityHub />
          </TabsContent>
          
          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GamificationPage;
