
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import AuthModal from "@/components/auth/AuthModal";
import Index from "./pages/Index";
import DealsPage from "./pages/DealsPage";
import WalletPage from "./pages/WalletPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import CategoriesPage from "./pages/CategoriesPage";
import FavoritesPage from "./pages/FavoritesPage";
import HelpPage from "./pages/HelpPage";
import GamificationPage from "./pages/GamificationPage";
import ProMembershipPage from "./pages/ProMembershipPage";
import DealDetailPage from "./pages/DealDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ScanPage from "./pages/ScanPage";
import ExplorePage from "./pages/ExplorePage";
import MerchantDashboardPage from "./pages/MerchantDashboardPage";
import MerchantOnboardingPage from "./pages/MerchantOnboardingPage";
import MerchantPage from "./pages/MerchantPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ChallengesPage from "./pages/ChallengesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">MyJaipur</h2>
          <p className="text-gray-600">Loading amazing deals near you...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Home page with custom layout */}
            <Route path="/" element={<Index />} />
            
            {/* Pages with standard app layout */}
            <Route path="/deals" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <DealsPage />
              </AppLayout>
            } />
            <Route path="/categories" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <CategoriesPage />
              </AppLayout>
            } />
            <Route path="/explore" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <ExplorePage />
              </AppLayout>
            } />
            <Route path="/scan" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <ScanPage />
              </AppLayout>
            } />
            <Route path="/help" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <HelpPage />
              </AppLayout>
            } />
            <Route path="/pro" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <ProMembershipPage />
              </AppLayout>
            } />
            <Route path="/deal/:id" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <DealDetailPage />
              </AppLayout>
            } />
            <Route path="/checkout" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <CheckoutPage />
              </AppLayout>
            } />
            <Route path="/order-success" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <OrderSuccessPage />
              </AppLayout>
            } />

            {/* Dashboard and user account pages */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <FavoritesPage />
              </AppLayout>
            } />
            <Route path="/gamification" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <GamificationPage />
              </AppLayout>
            } />
            <Route path="/challenges" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <ChallengesPage />
              </AppLayout>
            } />

            {/* Merchant pages */}
            <Route path="/merchant" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <MerchantPage />
              </AppLayout>
            } />
            <Route path="/merchant/dashboard" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <MerchantDashboardPage />
              </AppLayout>
            } />
            <Route path="/merchant/onboard" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <MerchantOnboardingPage />
              </AppLayout>
            } />
            <Route path="/analytics" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <AnalyticsPage />
              </AppLayout>
            } />

            {/* 404 page */}
            <Route path="*" element={
              <AppLayout user={user} profile={profile} onAuthModal={() => setShowAuthModal(true)}>
                <NotFound />
              </AppLayout>
            } />
          </Routes>

          {/* Global Auth Modal */}
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
          />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
