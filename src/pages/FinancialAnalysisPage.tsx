// src/pages/FinancialAnalysisPage.tsx
import React, { Suspense, lazy, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Brain, BarChart3, Target, BookOpen, Loader2, TrendingUp } from 'lucide-react';
import NavBar from '@/components/navigation/NavBar';

// Lazy load dos componentes pesados
const FinancialMetrics = lazy(() => import('@/components/dashboard/FinancialMetrics'));
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
  const [activeTab, setActiveTab] = useState("insights");

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
        }}
      >
        <Button 
          variant="ghost" 
          size="sm"
          style={{
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'      {/* Container principal */}
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
          <TabsContent value="insights" className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">� Insights Inteligentes</h2>

            </div>
            

            
            <Suspense fallback={<LoadingCard title="insights personalizados" />}>
              <FinancialInsights />
            </Suspense>

            {/* Resumo de métricas no final dos insights */}
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Resumo das Métricas</h3>
              <Suspense fallback={<LoadingCard title="métricas financeiras" />}>
                <FinancialMetrics />
              </Suspense>
            </div>
          </TabsContent>

          {/* Tab: Gráficos */}
          <TabsContent value="charts" className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <Suspense fallback={<LoadingCard title="gráficos" />}>
                <ModernCharts />
              </Suspense>
            </div>
          </TabsContent>

          {/* Tab: Score */}
          <TabsContent value="score" className="space-y-4">
            <Suspense fallback={<LoadingCard title="score financeiro" />}>
              <FinancialHealthScoreCard />
            </Suspense>
          </TabsContent>

          {/* Tab: Educação */}
          <TabsContent value="education" className="space-y-4">
            <Suspense fallback={<LoadingCard title="conteúdo educacional" />}>
              <BookOfTheWeek />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinancialAnalysisPage;
