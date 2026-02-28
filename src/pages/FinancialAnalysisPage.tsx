// src/pages/FinancialAnalysisPage.tsx
import React, { Suspense, lazy, Component, ErrorInfo, ReactNode, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Target, BookOpen, Loader2, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import FinancialAnalysisGate from '@/components/monetization/FinancialAnalysisGate';

// Lazy load com retry para evitar problemas de cache em produção
const lazyWithRetry = <T extends React.ComponentType<unknown>>(
  componentImport: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed =
      window.sessionStorage.getItem('page-has-been-force-refreshed') === 'true';

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Cache bust - force refresh
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        console.warn('Module loading failed, forcing page refresh...', error);
        window.location.reload();
      }
      throw error;
    }
  });

// Lazy load dos componentes pesados com retry automático
const ModernCharts = lazyWithRetry(() => import('@/components/dashboard/ModernCharts'));
const ScientificFinancialHealth = lazyWithRetry(() => import('@/components/dashboard/ScientificFinancialHealth'));
const FinancialInsights = lazyWithRetry(() => import('@/components/dashboard/FinancialInsights'));
const BookOfTheWeek = lazyWithRetry(() => import('@/components/personal_analysis/BookOfTheWeek'));

// Error Boundary Component with Retry
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ComponentErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ComponentErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    // Limpa o flag de refresh e força o reload
    window.sessionStorage.removeItem('page-has-been-force-refreshed');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="bg-white dark:bg-gray-800 border-red-200 dark:border-red-700">
          <CardContent className="flex items-center justify-center min-h-[120px] p-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">
                Erro ao carregar componente
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleRetry}
                className="flex items-center gap-2 mt-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Componente de Loading simples e claro
const LoadingCard = ({ title }: { title: string }) => (
  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
    <CardContent className="flex items-center justify-center h-32 p-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">Carregando {title}...</p>
      </div>
    </CardContent>
  </Card>
);


const FinancialAnalysisPage: React.FC = () => {
  return (
    <FinancialAnalysisGate>
      <div className="financial-analysis-page min-h-screen pb-20 lg:pb-8 bg-[#0f172a] lg:bg-transparent safe-area-top" style={{
        // Mobile: azul | Desktop: transparente (usa gradiente do layout)
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header com glassmorphism - Hidden on desktop (uses DesktopHeader) */}
        <div
          className="sticky top-0 z-50 lg:hidden"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px 30px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            height: '60px'
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: '"Fredoka One", "Comic Sans MS", "Poppins", sans-serif',
              letterSpacing: '1px',
              textShadow: '2px 2px 0px #3b82f6, 4px 4px 0px #1d4ed8, 0 0 20px rgba(59, 130, 246, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6)',
              textTransform: 'uppercase',
              position: 'relative',
              filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5))'
            }}
          >
            Análise FINANCEIRA
          </h1>
        </div>

        {/* Desktop Title */}
        <div className="hidden lg:block px-6 pt-6 pb-4">
          <h1 className="text-3xl font-bold text-white">Análise Financeira</h1>
          <p className="text-white/60 mt-1">Insights inteligentes sobre suas finanças</p>
        </div>

        {/* Container principal */}
        <div className="p-4 lg:px-6 space-y-6">
          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex lg:gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/30 dark:border-gray-700/30 mb-6 rounded-xl shadow-md h-auto">
              <TabsTrigger
                value="insights"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md flex flex-col lg:flex-row items-center gap-1 lg:gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 rounded-lg py-3 px-2 lg:px-6 min-h-[60px] lg:min-h-0 lg:h-12 justify-center m-1"
              >
                <Brain className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium leading-tight">Insights</span>
              </TabsTrigger>
              <TabsTrigger
                value="charts"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md flex flex-col lg:flex-row items-center gap-1 lg:gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 rounded-lg py-3 px-2 lg:px-6 min-h-[60px] lg:min-h-0 lg:h-12 justify-center m-1"
              >
                <TrendingUp className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium leading-tight">Gráficos</span>
              </TabsTrigger>
              <TabsTrigger
                value="health"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md flex flex-col lg:flex-row items-center gap-1 lg:gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 rounded-lg py-3 px-2 lg:px-6 min-h-[60px] lg:min-h-0 lg:h-12 justify-center m-1"
              >
                <Target className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium leading-tight">Saúde</span>
              </TabsTrigger>
              <TabsTrigger
                value="books"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md flex flex-col lg:flex-row items-center gap-1 lg:gap-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 rounded-lg py-3 px-2 lg:px-6 min-h-[60px] lg:min-h-0 lg:h-12 justify-center m-1"
              >
                <BookOpen className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium leading-tight">Livros</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Insights */}
            <TabsContent value="insights" className="space-y-4">
              <ComponentErrorBoundary>
                <Suspense fallback={<LoadingCard title="insights personalizados" />}>
                  <FinancialInsights />
                </Suspense>
              </ComponentErrorBoundary>
            </TabsContent>

            {/* Tab: Gráficos */}
            <TabsContent value="charts" className="space-y-4">
              <ComponentErrorBoundary>
                <Suspense fallback={<LoadingCard title="Gráficos interativos" />}>
                  <ModernCharts />
                </Suspense>
              </ComponentErrorBoundary>
            </TabsContent>

            {/* Tab: Saúde Financeira */}
            <TabsContent value="health" className="space-y-4">
              <ComponentErrorBoundary>
                <Suspense fallback={<LoadingCard title="Análise de Saúde financeira" />}>
                  <ScientificFinancialHealth />
                </Suspense>
              </ComponentErrorBoundary>
            </TabsContent>

            {/* Tab: Livros */}
            <TabsContent value="books" className="space-y-4">
              <ComponentErrorBoundary>
                <Suspense fallback={<LoadingCard title="recomendações de livros" />}>
                  <BookOfTheWeek />
                </Suspense>
              </ComponentErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>

        {/* O NavBar foi movido para o PersistentLayout.tsx */}
      </div>
    </FinancialAnalysisGate>
  );
};

export default FinancialAnalysisPage;



