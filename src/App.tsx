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
import { Suspense, lazy } from "react";

// Core components that need to load immediately
import HomePage from "./pages/HomePage";
import HomeRedirect from "./components/auth/HomeRedirect";
import Login from "./pages/Login";
import PrivateRoute from "./components/auth/PrivateRoute";
import OnboardingWrapper from "./components/onboarding/OnboardingWrapper";
import TermsWrapper from "./components/terms/TermsWrapper";
import { LoadingFallback } from "@/components/ui/loading-fallback";

// Lazy loaded pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Profile = lazy(() => import("./pages/Profile"));
const BillsPage = lazy(() => import("./pages/BillsPage"));
const AddBillPage = lazy(() => import("./pages/AddBillPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const PreferencesPage = lazy(() => import("./pages/PreferencesPage"));
const SecurityPage = lazy(() => import("./pages/SecurityPage"));
const FinancialAdvisorPage = lazy(() => import("./pages/FinancialAdvisorPage").then(module => ({ default: module.FinancialAdvisorPage })));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPageNew"));
const ExportReportPage = lazy(() => import("./pages/ExportReportPage"));
const FinancialAnalysisPage = lazy(() => import("./pages/FinancialAnalysisPage"));
const RecurringTransactionsPage = lazy(() => import("./pages/RecurringTransactionsPage"));
const TelegramSettingsPage = lazy(() => import("./pages/TelegramSettingsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const SimpleErrorTestPage = lazy(() => import("./pages/SimpleErrorTestPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

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
                  <Route path="/reset-password" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ResetPasswordPage />
                    </Suspense>
                  } />
                  <Route path="/privacy" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <PrivacyPage />
                    </Suspense>
                  } />
                  <Route path="/terms" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <TermsPage />
                    </Suspense>
                  } />
                  <Route 
                    path="/dashboard" 
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <OnboardingWrapper>
                            <Suspense fallback={<LoadingFallback />}>
                              <Dashboard />
                            </Suspense>
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
                          <Suspense fallback={<LoadingFallback />}>
                            <Transactions />
                          </Suspense>
                        </ErrorBoundary>
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/recurring-transactions" 
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingFallback />}>
                            <RecurringTransactionsPage />
                          </Suspense>
                        </ErrorBoundary>
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingFallback />}>
                            <Profile />
                          </Suspense>
                        </ErrorBoundary>
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/bills" 
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingFallback />}>
                            <BillsPage />
                          </Suspense>
                        </ErrorBoundary>
                      </PrivateRoute>
                    } 
                  />
                <Route 
                  path="/add-bill" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <AddBillPage />
                        </Suspense>
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <NotificationsPage />
                        </Suspense>
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/analise-financeira"
                  element={ 
                    <PrivateRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <FinancialAnalysisPage />
                        </Suspense>
                      </ErrorBoundary>
                    </PrivateRoute>
                  }
                />
                <Route 
                  path="/preferences" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <PreferencesPage />
                        </Suspense>
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/settings/telegram" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <TelegramSettingsPage />
                        </Suspense>
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/security" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <SecurityPage />
                        </Suspense>
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/financial-advisor" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <FinancialAdvisorPage />
                        </Suspense>
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/recomendacoes" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <RecommendationsPage />
                        </Suspense>
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <SettingsPage />
                        </Suspense>
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/export-report" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <ExportReportPage />
                        </Suspense>
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/error-test" 
                  element={
                    <PrivateRoute>
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingFallback />}>
                          <SimpleErrorTestPage />
                        </Suspense>
                      </ErrorBoundary>
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <NotFound />
                  </Suspense>
                } />
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
