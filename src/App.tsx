
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import DealsPage from "./pages/DealsPage";
import DealDetailPage from "./pages/DealDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import NewCheckoutPage from "./pages/NewCheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import WalletPage from "./pages/WalletPage";
import CouponsPage from "./pages/CouponsPage";
import FavoritesPage from "./pages/FavoritesPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import ReferralProgramPage from "./pages/ReferralProgramPage";
import ProMembershipPage from "./pages/ProMembershipPage";
import GamificationPage from "./pages/GamificationPage";
import JAICoinZonePage from "./pages/JAICoinZonePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ChallengesPage from "./pages/ChallengesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import ExplorePage from "./pages/ExplorePage";
import CategoriesPage from "./pages/CategoriesPage";
import ScanPage from "./pages/ScanPage";
import MerchantOnboardingPage from "./pages/MerchantOnboardingPage";
import MerchantDashboardPage from "./pages/MerchantDashboardPage";
import MerchantPortalPage from "./pages/MerchantPortalPage";
import MerchantPage from "./pages/MerchantPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry for certain errors
        if (error?.status === 404 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/deal/:id" element={<DealDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/new-checkout" element={<NewCheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/referral" element={<ReferralProgramPage />} />
            <Route path="/referral-program" element={<ReferralProgramPage />} />
            <Route path="/pro" element={<ProMembershipPage />} />
            <Route path="/pro-membership" element={<ProMembershipPage />} />
            <Route path="/gamification" element={<GamificationPage />} />
            <Route path="/jaicoin-zone" element={<JAICoinZonePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/merchant-onboarding" element={<MerchantOnboardingPage />} />
            <Route path="/merchant-dashboard" element={<MerchantDashboardPage />} />
            <Route path="/merchant-portal" element={<MerchantPortalPage />} />
            <Route path="/merchant" element={<MerchantPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
