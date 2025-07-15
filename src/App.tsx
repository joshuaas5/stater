import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationToastManager from "@/components/notifications/NotificationToastManager";
import { startRecurringProcessor } from "@/utils/recurringProcessor";
import ErrorBoundary from "@/components/ErrorBoundary";
import HomePage from "./pages/HomePage";
import HomeRedirect from "./components/auth/HomeRedirect";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import BillsPage from "./pages/BillsPage";
import AddBillPage from "./pages/AddBillPage";
import NotificationsPage from "./pages/NotificationsPage";
import PreferencesPage from "./pages/PreferencesPage";
import SecurityPage from "./pages/SecurityPage";
import { FinancialAdvisorPage } from "./pages/FinancialAdvisorPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import SettingsPage from "./pages/SettingsPageNew";
import ExportReportPage from "./pages/ExportReportPage";
import FinancialAnalysisPage from "./pages/FinancialAnalysisPage"; // Nova página
import RecurringTransactionsPage from "./pages/RecurringTransactionsPage"; // Nova página de recorrentes
import TelegramSettingsPage from "./pages/TelegramSettingsPage"; // Página de configurações do Telegram
import PrivacyPage from "./pages/PrivacyPage";
import ErrorTestPage from "./pages/ErrorTestPage"; // Página de teste de erros
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/auth/PrivateRoute";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OnboardingWrapper from "./components/onboarding/OnboardingWrapper";
import TermsWrapper from "./components/terms/TermsWrapper";

const queryClient = new QueryClient();

// PROCESSADOR AUTOMÁTICO REMOVIDO - Sistema manual apenas para evitar notificações indesejadas
// startRecurringProcessor();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TermsWrapper>
              <NotificationProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <NotificationToastManager />
                <Routes>
                  <Route path="/" element={<HomeRedirect />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <OnboardingWrapper>
                            <Dashboard />
                          </OnboardingWrapper>
                        </ErrorBoundary>
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/transactions" 
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <Transactions />
                        </ErrorBoundary>
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/recurring-transactions" 
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <RecurringTransactionsPage />
                        </ErrorBoundary>
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <Profile />
                        </ErrorBoundary>
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/bills" 
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <BillsPage />
                        </ErrorBoundary>
                      </PrivateRoute>
                    } 
                  />
                <Route 
                  path="/add-bill" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <AddBillPage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <NotificationsPage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/analise-financeira"
                  element={ 
                    <PrivateRoute>
                      <ErrorBoundary>
                        <FinancialAnalysisPage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  }
                />
                <Route 
                  path="/preferences" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <PreferencesPage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/settings/telegram" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <TelegramSettingsPage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/security" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <SecurityPage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/financial-advisor" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <FinancialAdvisorPage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/recomendacoes" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <RecommendationsPage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <SettingsPage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/export-report" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <ExportReportPage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/error-test" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <ErrorTestPage />
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </NotificationProvider>
        </TermsWrapper>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
</ErrorBoundary>
</QueryClientProvider>
);

export default App;
