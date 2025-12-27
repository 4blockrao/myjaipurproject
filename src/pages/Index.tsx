import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";
import HeaderMinimal from "@/components/home/HeaderMinimal";
import HeroBanner from "@/components/home/HeroBanner";
import SearchBarFloating from "@/components/home/SearchBarFloating";
import CategoryIconGrid from "@/components/home/CategoryIconGrid";
import HotDealsSection from "@/components/home/HotDealsSection";
import BottomNavHeritage from "@/components/home/BottomNavHeritage";
import { NewsHomeSection } from "@/components/news/NewsHomeSection";
import EventHomeSection from "@/components/events/EventHomeSection";
import TopMerchantsSection from "@/components/home/TopMerchantsSection";
import TopLocalitiesSection from "@/components/home/TopLocalitiesSection";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import HomeSEO from "@/components/seo/HomeSEO";
import Footer from "@/components/layout/Footer";
import { HomepageSchema } from "@/components/seo/SchemaInjector";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const isAuthenticated = !!user;

  // Fetch user balance
  const { data: userBalance = 0 } = useQuery({
    queryKey: ['userBalance', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data, error } = await supabase.rpc('get_user_balance', { user_uuid: user.id });
      if (error) return 0;
      return data || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch deals
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select(`*, merchants (business_name, is_verified, average_rating)`)
        .eq('approval_status', 'approved')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Hot deals - sorted by discount
  const hotDeals = [...deals].sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0)).slice(0, 8);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      }
    } finally {
      setIsLoading(false);
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      } else {
        setUser(null);
        setProfile(null);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeSEO />
      <HomepageSchema />
      <Toaster />
      <Sonner />
      
      {/* Minimal Header */}
      <HeaderMinimal 
        isAuthenticated={isAuthenticated}
        onSignIn={() => setShowAuthModal(true)}
      />

      <main className="flex-1 pb-24">
        {/* Hero Banner with Hawa Mahal */}
        <HeroBanner />
        
        {/* Floating Search Bar */}
        <SearchBarFloating />

        {/* Category Icons */}
        <CategoryIconGrid 
          onCategorySelect={setSelectedCategory}
        />

        {/* Hot Deals */}
        <HotDealsSection 
          deals={hotDeals}
          isLoading={dealsLoading}
          title="Hot Deals"
        />

        {/* Events Section */}
        <section className="px-4">
          <EventHomeSection />
        </section>

        {/* News Section */}
        <section className="px-4">
          <NewsHomeSection />
        </section>

        {/* Top Merchants */}
        <TopMerchantsSection />

        {/* Top Localities */}
        <TopLocalitiesSection />
      </main>

      <Footer />
      <BottomNavHeritage />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default Index;
