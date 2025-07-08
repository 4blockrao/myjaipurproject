
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import AuthModal from "@/components/auth/AuthModal";
import ModernHeroSection from "@/components/home/ModernHeroSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import ImprovedTodaysTopDeals from "@/components/home/ImprovedTodaysTopDeals";
import TopMerchants from "@/components/home/TopMerchants";
import ReferEarnSection from "@/components/home/ReferEarnSection";
import TrustIndicators from "@/components/home/TrustIndicators";
import { HealthCheck } from "@/components/HealthCheck";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch deals with React Query - Fixed query
  const { data: deals = [], isLoading: dealsLoading, error } = useQuery({
    queryKey: ['deals', selectedCategory, searchQuery],
    queryFn: async () => {
      console.log('Fetching deals with category:', selectedCategory, 'search:', searchQuery);
      
      let query = supabase
        .from('deals')
        .select(`
          *,
          merchants (
            business_name,
            is_verified,
            average_rating
          )
        `)
        .eq('approval_status', 'approved')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching deals:', error);
        toast({
          title: "Error loading deals",
          description: "Please refresh the page to try again.",
          variant: "destructive",
        });
        throw error;
      }
      
      console.log('Fetched deals:', data?.length || 0);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaced cacheTime)
  });

  // Get categories and deal counts - Fixed categories
  const categories = [
    "all", "Food & Dining", "Beauty & Wellness", "Shopping", "Electronics", 
    "Health & Fitness", "Automotive", "Services", "Travel", "Education"
  ];
  
  const dealCounts = categories.reduce((acc, category) => {
    if (category === "all") {
      acc[category] = deals.length;
    } else {
      acc[category] = deals.filter(deal => deal.category === category).length;
    }
    return acc;
  }, {} as Record<string, number>);

  console.log('Deal counts:', dealCounts);

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
    console.log('Search query:', query);
    setSearchQuery(query);
  };

  const handleCategorySelect = (category: string) => {
    console.log('Selected category:', category);
    setSelectedCategory(category);
  };

  return (
    <AppLayout 
      user={user} 
      profile={profile} 
      onAuthModal={() => setShowAuthModal(true)}
    >
      <div className="min-h-screen">
        <ModernHeroSection 
          userLocality={profile?.locality}
          onSearch={handleSearch}
        />
        <CategoryShowcase 
          dealCounts={dealCounts}
          onCategorySelect={handleCategorySelect}
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
