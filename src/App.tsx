import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import ScrollToTop from "@/components/ScrollToTop";
import HomePage from "@/pages/HomePage";
import Measure from "@/pages/Measure";
import Verify from "@/pages/Verify";
import ABCDEFramework from "@/pages/ABCDEFramework";
import Technology from "@/components/TechnologyShowcase";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import CurrentProjects from "@/pages/CurrentProjects";
import Data from "./pages/Data";
import GetTheReport from "@/pages/GetTheReport";
import BPOP from "@/pages/BPOP";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import { AuthProvider } from "@/auth";
// New audience-centric pages
import Landowners from "@/pages/Landowners";
import CorporatesInvestors from "@/pages/CorporatesInvestors";
import FinancialInstitutions from "@/pages/FinancialInstitutions";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />

        {/* New audience-centric routes */}
        <Route path="/landowners" element={<PageTransition><Landowners /></PageTransition>} />
        <Route path="/corporates-investors" element={<PageTransition><CorporatesInvestors /></PageTransition>} />
        <Route path="/financial-institutions" element={<PageTransition><FinancialInstitutions /></PageTransition>} />

        {/* Technology & Process routes */}
        <Route path="/measure" element={<PageTransition><Measure /></PageTransition>} />
        <Route path="/verify" element={<PageTransition><Verify /></PageTransition>} />
        <Route path="/abcde-framework" element={<PageTransition><ABCDEFramework /></PageTransition>} />
        <Route path="/technology" element={<PageTransition><Technology /></PageTransition>} />
        <Route path="/projects/current" element={<PageTransition><CurrentProjects /></PageTransition>} />

        {/* Company & utility routes */}
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/Data" element={<PageTransition><Data /></PageTransition>} />
        <Route path="/getthereport" element={<PageTransition><GetTheReport /></PageTransition>} />
        <Route path="/bpop" element={<PageTransition><BPOP /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
