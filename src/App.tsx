import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CustomToastContainer } from "@/components/ui/CustomToast";
import { useCustomToast } from "@/hooks/useCustomToast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationToastManager from "@/components/notifications/NotificationToastManager";
import { startRecurringProcessor } from "@/utils/recurringProcessor";
import { initializeBillNotifications } from "@/utils/billNotifications";
import ErrorBoundary from "@/components/ErrorBoundary";
import TermsWrapper from "@/components/terms/TermsWrapper";
import { useRoutePreloading } from "@/hooks/useRoutePreloading";
import AppRouter from "@/components/router/AppRouter";
// Import the paywall fixes CSS
import '@/styles/paywall-fixes.css';

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
                      <AppRouter />
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
