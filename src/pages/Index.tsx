
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/home/HeroSection";
import CategoryShortcuts from "@/components/home/CategoryShortcuts";
import TodaysTopDeals from "@/components/home/TodaysTopDeals";
import TopMerchants from "@/components/home/TopMerchants";
import TrustIndicators from "@/components/home/TrustIndicators";
import ReferEarnSection from "@/components/home/ReferEarnSection";
import AuthModal from "@/components/AuthModal";
import AppLayout from "@/components/layout/AppLayout";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [referralCode, setReferralCode] = useState<string>('');

  useEffect(() => {
    // Check for referral code in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
      setShowAuthModal(true);
      // Clean URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      fetchUserProfile(session.user.id);
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
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

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSearch = (searchTerm: string) => {
    console.log('Search:', searchTerm);
    // Implement search functionality
  };

  // Mock data for components that need props
  const mockCategories = ["Food & Dining", "Beauty & Wellness", "Shopping", "Entertainment"];
  const mockDealCounts = { total: 120, today: 15 };

  const mockDeals = [
    {
      id: '1',
      title: '50% off at Rajasthani Thali House',
      description: 'Traditional Rajasthani cuisine',
      discount_percentage: 50,
      original_price: 800,
      discounted_price: 400,
      location: 'C-Scheme, Jaipur',
      category: 'food',
      image: '/placeholder.svg',
      is_featured: true,
      merchant_id: '1',
      end_date: '2024-07-15',
      jaicoin_reward: 25,
      created_at: '2024-06-20T10:00:00Z'
    }
  ];

  return (
    <AppLayout 
      user={user} 
      profile={profile} 
      onAuthModal={() => setShowAuthModal(true)}
      showBottomNav={true}
    >
      <div className="min-h-screen bg-white">
        <HeroSection onSearch={handleSearch} />
        <CategoryShortcuts 
          categories={mockCategories}
          selectedCategory=""
          onCategorySelect={() => {}}
          dealCounts={mockDealCounts}
        />
        <TodaysTopDeals deals={mockDeals} />
        <TopMerchants />
        <ReferEarnSection user={user} profile={profile} />
        <TrustIndicators />
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          referralCode={referralCode}
        />
      </div>
    </AppLayout>
  );
};

export default Index;
