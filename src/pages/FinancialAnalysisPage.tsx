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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header responsivo */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 sticky top-0 z-50">
        <div className="px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white text-center">
            ANÁLISE FINANCEIRA
          </h1>
        </div>
      </div>

      {/* Container principal */}
      <div className="p-4 space-y-6">
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 mb-6">
            <TabsTrigger 
              value="insights" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center gap-2 text-xs sm:text-sm"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
              <span className="sm:hidden">IA</span>
            </TabsTrigger>
            <TabsTrigger 
              value="charts" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center gap-2 text-xs sm:text-sm"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Gráficos</span>
              <span className="sm:hidden">📊</span>
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center gap-2 text-xs sm:text-sm"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Saúde</span>
              <span className="sm:hidden">Score</span>
            </TabsTrigger>
            <TabsTrigger 
              value="books" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center gap-2 text-xs sm:text-sm"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Livros</span>
              <span className="sm:hidden">📚</span>
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
