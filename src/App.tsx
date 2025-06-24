
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/gamification" element={<GamificationPage />} />
          <Route path="/pro" element={<ProMembershipPage />} />
          <Route path="/deal/:id" element={<DealDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/merchant" element={<MerchantPage />} />
          <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />
          <Route path="/merchant/onboard" element={<MerchantOnboardingPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
