
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedReferralSystem from "./referral/EnhancedReferralSystem";
import SocialTasksHub from "./gamification/SocialTasksHub";
import ScratchCard from "./gamification/ScratchCard";

const ReferralSystem = () => {
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [scratchCardTrigger, setScratchCardTrigger] = useState<'welcome' | 'referral' | 'daily' | 'achievement'>('welcome');

  // Show welcome scratch card for new users
  useEffect(() => {
    const hasSeenWelcomeCard = localStorage.getItem('hasSeenWelcomeCard');
    if (!hasSeenWelcomeCard) {
      setScratchCardTrigger('welcome');
      setShowScratchCard(true);
      localStorage.setItem('hasSeenWelcomeCard', 'true');
    }
  }, []);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="referrals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="referrals">🤝 Referrals</TabsTrigger>
          <TabsTrigger value="tasks">📱 Social Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="referrals">
          <EnhancedReferralSystem />
        </TabsContent>
        
        <TabsContent value="tasks">
          <SocialTasksHub />
        </TabsContent>
      </Tabs>

      <ScratchCard 
        isOpen={showScratchCard}
        onClose={() => setShowScratchCard(false)}
        trigger={scratchCardTrigger}
      />
    </div>
  );
};

export default ReferralSystem;
