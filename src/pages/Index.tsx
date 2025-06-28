
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ImprovedHeroSection from "@/components/home/ImprovedHeroSection";
import CategoryShortcuts from "@/components/home/CategoryShortcuts";
import ImprovedTodaysTopDeals from "@/components/home/ImprovedTodaysTopDeals";
import TopMerchants from "@/components/home/TopMerchants";
import TrustIndicators from "@/components/home/TrustIndicators";
import ReferEarnSection from "@/components/home/ReferEarnSection";
import EnhancedAuthModal from "@/components/auth/EnhancedAuthModal";
import AppLayout from "@/components/layout/AppLayout";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [referralCode, setReferralCode] = useState<string>('');
  const [dealsLoading, setDealsLoading] = useState(true);
  const { redirectPath, handleAuthRedirect, clearRedirectPath } = useAuthRedirect();

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
    
    // Simulate loading delay for deals
    setTimeout(() => {
      setDealsLoading(false);
    }, 1500);
  }, []);

  const checkUser = async () => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile after setting user
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // Then check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      fetchUserProfile(session.user.id);
    }

    return () => subscription.unsubscribe();
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      console.log('Profile loaded:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSearch = (searchTerm: string) => {
    console.log('Search:', searchTerm);
    // Implement search functionality
  };

  const handleAuthModalOpen = () => {
    handleAuthRedirect(window.location.pathname);
    setShowAuthModal(true);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    clearRedirectPath();
  };

  // Mock data for components that need props
  const mockCategories = ["Food & Dining", "Beauty & Wellness", "Shopping", "Entertainment"];
  const mockDealCounts = { total: 120, today: 15 };

  const mockDeals = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: '50% off at Rajasthani Thali House',
      description: 'Traditional Rajasthani cuisine with authentic flavors',
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
    },
    {
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      title: 'Spa & Wellness Package',
      description: 'Rejuvenating spa experience with full body massage',
      discount_percentage: 60,
      original_price: 1200,
      discounted_price: 480,
      location: 'Malviya Nagar, Jaipur',
      category: 'wellness',
      image: '/placeholder.svg',
      is_featured: false,
      merchant_id: '2',
      end_date: '2024-07-20',
      jaicoin_reward: 35,
      created_at: '2024-06-21T10:00:00Z'
    }
  ];

  return (
    <AppLayout 
      user={user} 
      profile={profile} 
      onAuthModal={handleAuthModalOpen}
      showBottomNav={true}
    >
      <div className="min-h-screen bg-white">
        <ImprovedHeroSection onSearch={handleSearch} />
        <CategoryShortcuts 
          categories={mockCategories}
          selectedCategory=""
          onCategorySelect={() => {}}
          dealCounts={mockDealCounts}
        />
        <ImprovedTodaysTopDeals deals={mockDeals} isLoading={dealsLoading} />
        <TopMerchants />
        <ReferEarnSection user={user} profile={profile} />
        <TrustIndicators />
        
        <EnhancedAuthModal 
          isOpen={showAuthModal} 
          onClose={handleAuthModalClose}
          referralCode={referralCode}
          redirectPath={redirectPath}
        />
      </div>
    </AppLayout>
  );
};

export default Index;
