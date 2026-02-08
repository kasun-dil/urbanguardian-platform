import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import GovernmentHub from "./pages/GovernmentHub";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import AIAssistant from "./pages/AIAssistant";
import DonationCenters from "./pages/DonationCenters";
import About from "./pages/About";
import SuperAdmin from "./pages/SuperAdmin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/government-hub" element={<GovernmentHub />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/donation-centers" element={<DonationCenters />} />
            <Route path="/about" element={<About />} />
            
            {/* Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin Pages */}
            <Route path="/admin" element={<SuperAdmin />} />
            <Route path="/government-dashboard" element={<GovernmentDashboard />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
