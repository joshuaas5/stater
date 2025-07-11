// src/pages/FinancialAnalysisPage.tsx
import React, { Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Target, BookOpen, Loader2, TrendingUp } from 'lucide-react';
import NavBar from '@/components/navigation/NavBar';

// Lazy load dos componentes pesados
const ModernCharts = lazy(() => import('@/components/dashboard/ModernCharts'));
const FinancialHealthScoreCard = lazy(() => import('@/components/personal_analysis/FinancialHealthScoreCard'));
const FinancialInsights = lazy(() => import('@/components/dashboard/FinancialInsights'));
const BookOfTheWeek = lazy(() => import('@/components/personal_analysis/BookOfTheWeek'));

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
    <div className="min-h-screen pb-20" style={{
      background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header com glassmorphism igual ao Stater IA */}
      <div 
        className="sticky top-0 z-50"
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
          ANÁLISE FINANCEIRA
        </h1>
      </div>

      {/* Container principal */}
      <div className="p-4 space-y-6">
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 mb-6 p-1 rounded-2xl shadow-lg">
            <TabsTrigger 
              value="insights" 
              className="data-[state=active]:bg-white/90 data-[state=active]:text-blue-600 data-[state=active]:shadow-lg flex items-center gap-2 text-xs sm:text-sm text-white/80 hover:text-white transition-all duration-300 rounded-xl py-3 px-2 sm:px-4"
            >
              <Brain className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline font-medium">Insights</span>
              <span className="sm:hidden font-medium">IA</span>
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="data-[state=active]:bg-white/90 data-[state=active]:text-blue-600 data-[state=active]:shadow-lg flex items-center gap-2 text-xs sm:text-sm text-white/80 hover:text-white transition-all duration-300 rounded-xl py-3 px-2 sm:px-4"
            >
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline font-medium">Gráficos</span>
              <span className="sm:hidden font-medium">📊</span>
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="data-[state=active]:bg-white/90 data-[state=active]:text-blue-600 data-[state=active]:shadow-lg flex items-center gap-2 text-xs sm:text-sm text-white/80 hover:text-white transition-all duration-300 rounded-xl py-3 px-2 sm:px-4"
            >
              <Target className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline font-medium">Saúde</span>
              <span className="sm:hidden font-medium">❤️</span>
            </TabsTrigger>
            <TabsTrigger 
              value="books" 
              className="data-[state=active]:bg-white/90 data-[state=active]:text-blue-600 data-[state=active]:shadow-lg flex items-center gap-2 text-xs sm:text-sm text-white/80 hover:text-white transition-all duration-300 rounded-xl py-3 px-2 sm:px-4"
            >
              <BookOpen className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline font-medium">Livros</span>
              <span className="sm:hidden font-medium">📚</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Insights */}
          <TabsContent value="insights" className="space-y-4">            
            <Suspense fallback={<LoadingCard title="insights personalizados" />}>
              <FinancialInsights />
            </Suspense>
          </TabsContent>

          {/* Tab: Gráficos */}
          <TabsContent value="charts" className="space-y-4">
            <Suspense fallback={<LoadingCard title="gráficos interativos" />}>
              <ModernCharts />
            </Suspense>
          </TabsContent>

          {/* Tab: Saúde Financeira */}
          <TabsContent value="health" className="space-y-4">
            <Suspense fallback={<LoadingCard title="análise de saúde financeira" />}>
              <FinancialHealthScoreCard />
            </Suspense>
          </TabsContent>

          {/* Tab: Livros */}
          <TabsContent value="books" className="space-y-4">
            <Suspense fallback={<LoadingCard title="recomendações de livros" />}>
              <BookOfTheWeek />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
      
      <NavBar />
    </div>
  );
};

export default FinancialAnalysisPage;
