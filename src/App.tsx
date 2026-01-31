import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ModulePage from "./pages/ModulePage";
import RecordDetail from "./pages/RecordDetail";
import AuditPage from "./pages/AuditPage";
import NotFound from "./pages/NotFound";

import ArchivePage from "./pages/ArchivePage";
import RiskManagementPage from "./pages/RiskManagementPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/module/:moduleId" element={<ModulePage />} />
          <Route path="/record/:code" element={<RecordDetail />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/risk-management" element={<RiskManagementPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
