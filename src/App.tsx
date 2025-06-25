
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import WalletPage from "./pages/WalletPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import JAICoinZonePage from "./pages/JAICoinZonePage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import CouponsPage from "./pages/CouponsPage";
import OrdersPage from "./pages/OrdersPage";
import DealsPage from "./pages/DealsPage";
import DealDetailPage from "./pages/DealDetailPage";
import MerchantPage from "./pages/MerchantPage";
import CategoriesPage from "./pages/CategoriesPage";
import ExplorePage from "./pages/ExplorePage";
import ScanPage from "./pages/ScanPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import HelpPage from "./pages/HelpPage";
import NotFound from "./pages/NotFound";
import ReferralProgramPage from "./pages/ReferralProgramPage";
import MerchantOnboardingPage from "./pages/MerchantOnboardingPage";
import MerchantDashboardPage from "./pages/MerchantDashboardPage";
import ProMembershipPage from "./pages/ProMembershipPage";
import GamificationPage from "./pages/GamificationPage";
import ChallengesPage from "./pages/ChallengesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/jaicoin-zone" element={<JAICoinZonePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deal/:id" element={<DealDetailPage />} />
          <Route path="/merchant/:id" element={<MerchantPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/checkout/:orderId" element={<CheckoutPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/referral-program" element={<ReferralProgramPage />} />
          <Route path="/merchant-onboarding" element={<MerchantOnboardingPage />} />
          <Route path="/merchant-dashboard" element={<MerchantDashboardPage />} />
          <Route path="/pro-membership" element={<ProMembershipPage />} />
          <Route path="/gamification" element={<GamificationPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
