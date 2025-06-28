
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
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch deals with React Query
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select('*')
        .eq('approval_status', 'approved')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (selectedCategory !== "all") {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Get categories and deal counts
  const categories = ["all", "Food & Dining", "Beauty & Wellness", "Shopping", "Electronics", "Health & Fitness", "Services"];
  const dealCounts = categories.reduce((acc, category) => {
    if (category === "all") {
      acc[category] = deals.length;
    } else {
      acc[category] = deals.filter(deal => deal.category === category).length;
    }
    return acc;
  }, {} as Record<string, number>);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <AppLayout 
      user={user} 
      profile={profile} 
      onAuthModal={() => setShowAuthModal(true)}
    >
      <div className="min-h-screen">
        <HeroSection 
          userLocality={profile?.locality}
          onSearch={handleSearch}
        />
        <CategoryShortcuts 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          dealCounts={dealCounts}
        />
        <ImprovedTodaysTopDeals 
          deals={deals}
          isLoading={dealsLoading}
        />
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
