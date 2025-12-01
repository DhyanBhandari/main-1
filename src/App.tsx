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
import Investors from "@/pages/Investors";
import Corporates from "@/pages/Corporates";
import Technology from "@/components/TechnologyShowcase";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import CurrentProjects from "@/pages/CurrentProjects";
import Data from "./pages/Data";
import GetTheReport from "@/pages/GetTheReport";
import { AuthProvider } from "@/auth";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/measure" element={<PageTransition><Measure /></PageTransition>} />
        <Route path="/verify" element={<PageTransition><Verify /></PageTransition>} />
        <Route path="/abcde-framework" element={<PageTransition><ABCDEFramework /></PageTransition>} />
        <Route path="/investors" element={<PageTransition><Investors /></PageTransition>} />
        <Route path="/corporates" element={<PageTransition><Corporates /></PageTransition>} />
        <Route path="/technology" element={<PageTransition><Technology /></PageTransition>} />
        <Route path="/projects/current" element={<PageTransition><CurrentProjects /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/Data" element={<PageTransition><Data /></PageTransition>} />
        <Route path="/getthereport" element={<PageTransition><GetTheReport /></PageTransition>} />
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
