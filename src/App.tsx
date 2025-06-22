
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DealsPage from "./pages/DealsPage";
import WalletPage from "./pages/WalletPage";
import ChallengesPage from "./pages/ChallengesPage";
import MerchantPage from "./pages/MerchantPage";
import MerchantOnboardingPage from "./pages/MerchantOnboardingPage";
import MerchantDashboardPage from "./pages/MerchantDashboardPage";
import GamificationPage from "./pages/GamificationPage";
import ProMembershipPage from "./pages/ProMembershipPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DataDashboard from "./components/DataDashboard";
import SystemAudit from "./components/SystemAudit";
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
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/merchant" element={<MerchantPage />} />
          <Route path="/merchant/onboard" element={<MerchantOnboardingPage />} />
          <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />
          <Route path="/gamification" element={<GamificationPage />} />
          <Route path="/pro" element={<ProMembershipPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/admin/data" element={<DataDashboard />} />
          <Route path="/admin/audit" element={<SystemAudit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
