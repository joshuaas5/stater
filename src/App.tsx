import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CustomToastContainer } from "@/components/ui/CustomToast";
import { useCustomToast } from "@/hooks/useCustomToast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationToastManager from "@/components/notifications/NotificationToastManager";
import { startRecurringProcessor } from "@/utils/recurringProcessor";
import { initializeBillNotifications } from "@/utils/billNotifications";
import { initializePushNotifications } from "@/utils/pushNotifications";
import ErrorBoundary from "@/components/ErrorBoundary";
import TermsWrapper from "@/components/terms/TermsWrapper";
import { useRoutePreloading } from "@/hooks/useRoutePreloading";
import { useScrollGuard } from "@/hooks/useScrollGuard";
import AppRouter from "@/components/router/AppRouter";
import CookieConsent from "@/components/CookieConsent";
import { useEffect } from "react";
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
// Import the paywall fixes CSS
import '@/styles/paywall-fixes.css';

const queryClient = new QueryClient();

// Inicializar sistema de notificacoes de contas (in-app)
initializeBillNotifications();

// Inicializar sistema de push notifications (apos 2 segundos para nao atrasar o carregamento)
setTimeout(() => {
  initializePushNotifications().then(success => {
    if (success) {
      console.log('Push notifications inicializadas com sucesso');
    }
  }).catch(console.error);
}, 2000);

// Status Bar Hook - MOSTRA a status bar com estilo correto
const useStatusBarSetup = () => {
  useEffect(() => {
    const setupStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.show();
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0f172a' });
          console.log('Status bar configurada: visivel, azul, icones brancos');
        } catch (error) {
          console.warn('StatusBar plugin error:', error);
        }
      }

      document.documentElement.style.backgroundColor = '#0f172a';
      document.body.style.backgroundColor = '#0f172a';
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.backgroundColor = '#0f172a';
      }
    };

    setupStatusBar();
  }, []);
};

// Component to handle route preloading
const RoutePreloadingProvider = ({ children }: { children: React.ReactNode }) => {
  useRoutePreloading();
  return <>{children}</>;
};

// Edge-to-Edge Provider Component
const EdgeToEdgeProvider = ({ children }: { children: React.ReactNode }) => {
  useStatusBarSetup();
  useScrollGuard();
  return <div className="edge-to-edge-container">{children}</div>;
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
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <EdgeToEdgeProvider>
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
                          <CookieConsent />
                          <AppRouter />
                        </TooltipProvider>
                      </ToastProvider>
                    </RoutePreloadingProvider>
                  </NotificationProvider>
                </TermsWrapper>
              </AuthProvider>
            </ThemeProvider>
          </EdgeToEdgeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
