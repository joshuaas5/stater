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
import { useEffect } from "react";
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
// Import the paywall fixes CSS
import '@/styles/paywall-fixes.css';

const queryClient = new QueryClient();

// PROCESSADOR AUTOMÁTICO REMOVIDO - Sistema manual apenas para evitar notificações indesejadas
// startRecurringProcessor();

// Inicializar sistema de notificações de contas
initializeBillNotifications();

// 🚀 Edge-to-Edge Background Hook - SOLUÇÃO DEFINITIVA
const useEdgeToEdgeBackground = () => {
  useEffect(() => {
    // ✅ CONFIGURAR STATUS BAR NATIVA (MOBILE)
    const configureStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Define a cor de fundo da status bar para o azul escuro e unificado
          await StatusBar.setBackgroundColor({ color: '#31518b' });
          // Define o estilo dos ícones/texto da status bar
          await StatusBar.setStyle({ style: Style.Light });
        } catch (error) {
          console.log('StatusBar não disponível:', error);
        }
      }
    };
    
    configureStatusBar();
    
    // ✅ RESET GLOBAL - Remove qualquer margin/padding que impeça edge-to-edge
    document.documentElement.style.cssText = `
      margin: 0;
      padding: 0;
      background-color: #31518b !important;
      min-height: 100vh;
      min-height: -webkit-fill-available;
      overflow-x: hidden;
    `;
    
    document.body.style.cssText = `
      margin: 0;
      padding: 0;
      background-color: #31518b !important;
      min-height: 100vh;
      min-height: -webkit-fill-available;
      overflow-x: hidden;
    `;

    // ✅ APLICA NO #root TAMBÉM
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.cssText = `
        margin: 0;
        padding: 0;
        background-color: #31518b !important;
        min-height: 100vh;
        min-height: -webkit-fill-available;
        display: flex;
        flex-direction: column;
      `;
    }
    
    // ✅ ELEMENTO PARA COBRIR STATUS BAR - POSIÇÃO ABSOLUTA NO TOPO
    let statusBarFill = document.querySelector('.edge-to-edge-status-fill');
    if (!statusBarFill) {
      statusBarFill = document.createElement('div');
      statusBarFill.className = 'edge-to-edge-status-fill';
      statusBarFill.style.cssText = `
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
        right: 0;
        height: env(safe-area-inset-top, 24px);
        background-color: #31518b;
        pointer-events: none;
      `;
      document.body.appendChild(statusBarFill);
    }
    
    // ✅ META TAGS PARA PWA EDGE-TO-EDGE
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
    }
    
    // Cleanup
    return () => {
      const existingFill = document.querySelector('.edge-to-edge-status-fill');
      if (existingFill && existingFill.parentElement) {
        existingFill.parentElement.removeChild(existingFill);
      }
    };
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

const App = () => (
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
);

export default App;
