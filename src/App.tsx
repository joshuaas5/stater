import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationManager from "@/components/notifications/NotificationManager";
import NotificationToastManager from "@/components/notifications/NotificationToastManager";
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
import { FinancialAdvisorPage } from "./pages/FinancialAdvisorPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/auth/PrivateRoute";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <NotificationManager />
              <NotificationToastManager />
            </TooltipProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/transactions" 
                element={
                  <PrivateRoute>
                    <Transactions />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/bills" 
                element={
                  <PrivateRoute>
                    <BillsPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/add-bill" 
                element={
                  <PrivateRoute>
                    <AddBillPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <PrivateRoute>
                    <NotificationsPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/preferences" 
                element={
                  <PrivateRoute>
                    <PreferencesPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/security" 
                element={
                  <PrivateRoute>
                    <SecurityPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/charts" 
                element={
                  <PrivateRoute>
                    <ChartsPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/financial-advisor" 
                element={
                  <PrivateRoute>
                    <FinancialAdvisorPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/recomendacoes" 
                element={
                  <PrivateRoute>
                    <RecommendationsPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <PrivateRoute>
                    <SettingsPage />
                  </PrivateRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
