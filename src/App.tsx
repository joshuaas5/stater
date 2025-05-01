
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import BillsPage from "./pages/BillsPage";
import AddBillPage from "./pages/AddBillPage";
import NotificationsPage from "./pages/NotificationsPage";
import PreferencesPage from "./pages/PreferencesPage";
import SecurityPage from "./pages/SecurityPage";
import ChartsPage from "./pages/ChartsPage";
import FinancialAdvisorPage from "./pages/FinancialAdvisorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Navigate to="/financial-advisor" replace />} />
            <Route path="/bills" element={<BillsPage />} />
            <Route path="/add-bill" element={<AddBillPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/financial-advisor" element={<FinancialAdvisorPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
