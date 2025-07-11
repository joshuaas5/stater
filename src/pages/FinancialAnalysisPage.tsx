// src/pages/FinancialAnalysisPage.tsx
import React, { Suspense, lazy, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, BarChart3, Target, BookOpen, Lightbulb, Loader2, Activity, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Lazy load dos componentes pesados
const FinancialMetrics = lazy(() => import('@/components/dashboard/FinancialMetrics'));
const ModernCharts = lazy(() => import('@/components/dashboard/ModernCharts'));
const FinancialHealthScoreCard = lazy(() => import('@/components/personal_analysis/FinancialHealthScoreCard'));
const FinancialInsights = lazy(() => import('@/components/dashboard/FinancialInsights'));
const BookOfTheWeek = lazy(() => import('@/components/personal_analysis/BookOfTheWeek'));

// Componente de Loading personalizado
const LoadingCard = ({ title }: { title: string }) => (
  <Card className="backdrop-blur-md bg-white/95 border-white/20 shadow-xl">
    <CardContent className="flex items-center justify-center h-40">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-600">Carregando {title}...</p>
      </div>
    </CardContent>
  </Card>
);

const FinancialAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header simplificado - removido animações pesadas */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} className="mr-2" />
              Voltar
            </Button>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30">
              <Activity className="w-4 h-4 text-green-300" />
              <span className="text-white/90 text-sm font-medium">Análise IA</span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Central de Análise Financeira
            </h1>
            <p className="text-white/90 mt-2">Hub completo para suas análises e insights financeiros</p>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="container mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Gráficos</span>
            </TabsTrigger>
            <TabsTrigger value="score" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Score</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Educação</span>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das Abas */}
          <TabsContent value="overview" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">📊 Resumo Financeiro</h2>
              <p className="text-gray-600">Suas principais métricas em tempo real</p>
            </div>
            
            <Suspense fallback={<LoadingCard title="métricas financeiras" />}>
              <FinancialMetrics />
            </Suspense>

            {/* Cards de acesso rápido */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                onClick={() => setActiveTab("charts")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    <CardTitle className="text-lg">Gráficos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100 text-sm">Visualize tendências e padrões</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 bg-gradient-to-br from-green-500 to-green-600 text-white"
                onClick={() => setActiveTab("score")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    <CardTitle className="text-lg">Score</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-green-100 text-sm">Avalie sua saúde financeira</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                onClick={() => setActiveTab("insights")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    <CardTitle className="text-lg">Insights IA</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-purple-100 text-sm">Análises personalizadas</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                onClick={() => setActiveTab("education")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <CardTitle className="text-lg">Educação</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-orange-100 text-sm">Dicas e conhecimento</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">📈 Análise Gráfica</h2>
              <p className="text-gray-600">Visualização avançada dos seus dados financeiros</p>
            </div>
            
            <Suspense fallback={<LoadingCard title="gráficos interativos" />}>
              <ModernCharts />
            </Suspense>
          </TabsContent>

          <TabsContent value="score" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">🎯 Score de Saúde Financeira</h2>
              <p className="text-gray-600">Análise detalhada do seu perfil financeiro</p>
            </div>
            
            <Suspense fallback={<LoadingCard title="score financeiro" />}>
              <FinancialHealthScoreCard />
            </Suspense>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">🤖 Insights Inteligentes</h2>
              <p className="text-gray-600">Análises personalizadas baseadas em IA</p>
            </div>
            
            <Suspense fallback={<LoadingCard title="insights da IA" />}>
              <FinancialInsights />
            </Suspense>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">📚 Educação Financeira</h2>
              <p className="text-gray-600">Conhecimento para crescer financeiramente</p>
            </div>
            
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
