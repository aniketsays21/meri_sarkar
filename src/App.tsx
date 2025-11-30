import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import LeaderDetail from "./pages/LeaderDetail";
import ImpactCalculator from "./pages/ImpactCalculator";
import RoomDetail from "./pages/RoomDetail";
import MohallaPerformanceBoard from "./pages/MohallaPerformanceBoard";
import CityRankings from "./pages/CityRankings";
import WardDetail from "./pages/WardDetail";
import WardComparison from "./pages/WardComparison";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leader/:id" element={<LeaderDetail />} />
          <Route path="/impact-calculator" element={<ImpactCalculator />} />
          <Route path="/room/:id" element={<RoomDetail />} />
          <Route path="/board" element={<MohallaPerformanceBoard />} />
          <Route path="/rankings" element={<CityRankings />} />
          <Route path="/compare" element={<WardComparison />} />
          <Route path="/ward/:id" element={<WardDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
