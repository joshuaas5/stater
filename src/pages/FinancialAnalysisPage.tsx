// src/pages/FinancialAnalysisPage.tsx
import React, { Suspense, lazy, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, BarChart3, Target, BookOpen, Lightbulb, Loader2, TrendingUp, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("insights");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header moderno e limpo */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Button>
            
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Análises Financeiras
              </h1>
            </div>
            
            <div className="w-16"></div> {/* Spacer para centralizar o título */}
          </div>
        </div>
      </div>

      {/* Navegação reorganizada com destaque para Insights */}
      <div className="p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4 bg-white dark:bg-gray-800 shadow-sm h-auto border dark:border-gray-700">
            <TabsTrigger value="insights" className="flex flex-col items-center gap-1 py-3 px-2 text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300 rounded-md transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex flex-col items-center gap-1 py-3 px-2 text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300 rounded-md transition-colors">
              <TrendingUp className="w-4 h-4" />
              <span>Gráficos</span>
            </TabsTrigger>
            <TabsTrigger value="score" className="flex flex-col items-center gap-1 py-3 px-2 text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300 rounded-md transition-colors">
              <Target className="w-4 h-4" />
              <span>Score</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex flex-col items-center gap-1 py-3 px-2 text-xs data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-300 rounded-md transition-colors">
              <BookOpen className="w-4 h-4" />
              <span>Educação</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Insights (PRIORIDADE MÁXIMA) */}
          <TabsContent value="insights" className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">� Insights Inteligentes</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Descobertas importantes sobre seus hábitos financeiros</p>
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
