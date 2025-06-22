
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DealsPage from "./pages/DealsPage";
import WalletPage from "./pages/WalletPage";
import GamificationPage from "./pages/GamificationPage";
import ProMembershipPage from "./pages/ProMembershipPage";
import MerchantPage from "./pages/MerchantPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ChallengesPage from "./pages/ChallengesPage";

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
          <Route path="/community" element={<GamificationPage />} />
          <Route path="/pro" element={<ProMembershipPage />} />
          <Route path="/merchant" element={<MerchantPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
