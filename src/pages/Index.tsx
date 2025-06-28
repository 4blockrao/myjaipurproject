
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import AuthModal from "@/components/auth/AuthModal";
import HeroSection from "@/components/home/HeroSection";
import CategoryShortcuts from "@/components/home/CategoryShortcuts";
import ImprovedTodaysTopDeals from "@/components/home/ImprovedTodaysTopDeals";
import TopMerchants from "@/components/home/TopMerchants";
import ReferEarnSection from "@/components/home/ReferEarnSection";
import TrustIndicators from "@/components/home/TrustIndicators";
import { HealthCheck } from "@/components/HealthCheck";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return (
    <AppLayout 
      user={user} 
      profile={profile} 
      onAuthModal={() => setShowAuthModal(true)}
    >
      <div className="min-h-screen">
        <HeroSection user={user} onAuthModal={() => setShowAuthModal(true)} />
        <CategoryShortcuts />
        <ImprovedTodaysTopDeals />
        <TopMerchants />
        <ReferEarnSection user={user} profile={profile} />
        <TrustIndicators />
        
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        
        <HealthCheck />
      </div>
    </AppLayout>
  );
};

export default Index;
