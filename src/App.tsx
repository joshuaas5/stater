import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CustomToastContainer } from "@/components/ui/CustomToast";
import { useCustomToast } from "@/hooks/useCustomToast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationToastManager from "@/components/notifications/NotificationToastManager";
import { startRecurringProcessor } from "@/utils/recurringProcessor";
import { initializeBillNotifications } from "@/utils/billNotifications";
import ErrorBoundary from "@/components/ErrorBoundary";
import TermsWrapper from "@/components/terms/TermsWrapper";
import { useRoutePreloading } from "@/hooks/useRoutePreloading";
import PersistentLayout from '@/components/layout/PersistentLayout';
import HomePage from '@/pages/HomePage';
import Dashboard from '@/pages/Dashboard';
import FinancialAdvisorPage from '@/pages/FinancialAdvisorPage';
// Import the paywall fixes CSS
import '@/styles/paywall-fixes.css';
import FinancialAnalysisPage from '@/pages/FinancialAnalysisPage';
import Transactions from '@/pages/Transactions';
import BillsPage from '@/pages/BillsPage';
import AddBillPage from '@/pages/AddBillPage';
import ChartsPage from '@/pages/ChartsPage';
import ExportReportPage from '@/pages/ExportReportPage';
import NotificationsPage from '@/pages/NotificationsPage';
import PreferencesPage from '@/pages/PreferencesPage';
import SecurityPage from '@/pages/SecurityPage';
import TelegramSettingsPage from '@/pages/TelegramSettingsPage';
import LoginPage from '@/pages/Login';
// Assuming Signup is part of Login or doesn't exist as a separate page
// import SignupPage from '@/pages/SignupPage'; 
// Assuming Onboarding doesn't exist as a separate page
// import Onboarding from '@/pages/Onboarding';
import TermsOfService from '@/pages/TermsPage';
import PrivacyPolicy from '@/pages/PrivacyPage';
import NotFound from '@/pages/NotFound';
import ProfilePage from '@/pages/Profile';
import SettingsPage from '@/pages/SettingsPage';

const queryClient = new QueryClient();

// PROCESSADOR AUTOMÁTICO REMOVIDO - Sistema manual apenas para evitar notificações indesejadas
// startRecurringProcessor();

// Inicializar sistema de notificações de contas
initializeBillNotifications();

// Component to handle route preloading
const RoutePreloadingProvider = ({ children }: { children: React.ReactNode }) => {
  useRoutePreloading();
  return <>{children}</>;
};

// Toast Provider Component
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const { toasts, removeToast } = useCustomToast();
  
  return (
    <>
      {children}
      <CustomToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TermsWrapper>
              <NotificationProvider>
                <RoutePreloadingProvider>
                  <ToastProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <NotificationToastManager />
                      <Routes>
                        {/* Rotas sem o layout persistente */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        {/* <Route path="/signup" element={<SignupPage />} /> */}
                        {/* <Route path="/onboarding" element={<Onboarding />} /> */}
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="*" element={<NotFound />} />

                        {/* Rotas com o layout persistente */}
                        <Route element={<PersistentLayout />}>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/financial-advisor" element={<FinancialAdvisorPage />} />
                          <Route path="/analise-financeira" element={<FinancialAnalysisPage />} />
                          <Route path="/transactions" element={<Transactions />} />
                          <Route path="/bills" element={<BillsPage />} />
                          <Route path="/add-bill" element={<AddBillPage />} />
                          <Route path="/charts" element={<ChartsPage />} />
                          <Route path="/export" element={<ExportReportPage />} />
                          <Route path="/notifications" element={<NotificationsPage />} />
                          <Route path="/preferences" element={<PreferencesPage />} />
                          <Route path="/security" element={<SecurityPage />} />
                          <Route path="/telegram" element={<TelegramSettingsPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                      </Routes>
                    </TooltipProvider>
                  </ToastProvider>
                </RoutePreloadingProvider>
              </NotificationProvider>
            </TermsWrapper>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
