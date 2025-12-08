import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CustomToastContainer } from "@/components/ui/CustomToast";
import { useCustomToast } from "@/hooks/useCustomToast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation } from "react-router-dom";
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
import AppRouter from "@/components/router/AppRouter";
import CookieConsent from "@/components/CookieConsent";
import { useEffect } from "react";
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
// Import the paywall fixes CSS
import '@/styles/paywall-fixes.css';
// Import analytics
import { initGA, trackPageView } from '@/lib/analytics';

const queryClient = new QueryClient();

// PROCESSADOR AUTOMÁTICO REMOVIDO - Sistema manual apenas para evitar notificações indesejadas
// startRecurringProcessor();

// Inicializar sistema de notificações de contas (in-app)
initializeBillNotifications();

// Inicializar sistema de push notifications (após 2 segundos para não atrasar o carregamento)
setTimeout(() => {
  initializePushNotifications().then(success => {
    if (success) {
      console.log('🔔 Push notifications inicializadas com sucesso');
    }
  }).catch(console.error);
}, 2000);

// 🚀 Edge-to-Edge Background Hook - SOLUÇÃO DEFINITIVA
const useEdgeToEdgeBackground = () => {
  useEffect(() => {
    const setEdgeToEdge = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Configura overlay primeiro para garantir que o conteúdo fique atrás da barra se ela aparecer
          await StatusBar.setOverlaysWebView({ overlay: true });
          // Oculta a status bar para uma experiência de tela cheia completa
          await StatusBar.hide();
          console.log('✅ Status bar configurada (overlay + hide) para modo tela cheia.');
        } catch (error) {
          console.warn('⚠️ StatusBar plugin não disponível, fallback para CSS.', error);
          // Fallback para CSS se o plugin falhar
          applyCssFallback();
        }
      } else {
        // Aplica o fallback em web
        applyCssFallback();
      }
    };

    const applyCssFallback = () => {
      console.log('🎨 Aplicando fallback de CSS para edge-to-edge.');
      // Garante que o corpo e o root preencham a tela
      const styles = `
        margin: 0;
        padding: 0;
        background-color: #31518b !important;
        min-height: 100vh;
        min-height: -webkit-fill-available;
        width: 100vw;
        overflow-x: hidden;
      `;
      document.documentElement.style.cssText = styles;
      document.body.style.cssText = styles;

      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.cssText = styles + `
          display: flex;
          flex-direction: column;
        `;
      }
    };
    
    setEdgeToEdge();
  }, []);
};

// Component to handle route preloading
const RoutePreloadingProvider = ({ children }: { children: React.ReactNode }) => {
  useRoutePreloading();
  return <>{children}</>;
};

// 🚀 Edge-to-Edge Provider Component
const EdgeToEdgeProvider = ({ children }: { children: React.ReactNode }) => {
  useEdgeToEdgeBackground();
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

// Analytics Provider Component - Rastreamento automático de páginas
const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Inicializar analytics na primeira montagem
  useEffect(() => {
    initGA();
    trackPageView(location.pathname + location.search);
  }, []);
  
  // Rastrear mudanças de página automaticamente
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <BrowserRouter>
        <AnalyticsProvider>
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
        </AnalyticsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
