// src/pages/FinancialAnalysisPage.tsx
import React, { Suspense, lazy, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, BarChart3, Target, BookOpen, Lightbulb, Loader2, Activity, PieChart, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Lazy load dos componentes pesados
const FinancialMetrics = lazy(() => import('@/components/dashboard/FinancialMetrics'));
const ModernCharts = lazy(() => import('@/components/dashboard/ModernCharts'));
const FinancialHealthScoreCard = lazy(() => import('@/components/personal_analysis/FinancialHealthScoreCard'));
const FinancialInsights = lazy(() => import('@/components/dashboard/FinancialInsights'));
const BookOfTheWeek = lazy(() => import('@/components/personal_analysis/BookOfTheWeek'));

// Componente de Loading personalizado mobile-first
const LoadingCard = ({ title }: { title: string }) => (
  <Card className="bg-white/95 border-gray-200 shadow-lg">
    <CardContent className="flex items-center justify-center h-32 p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
          <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
        </div>
        <p className="text-sm text-gray-600 text-center">IA analisando {title}...</p>
      </div>
    </CardContent>
  </Card>
);

const FinancialAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile-First */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg sticky top-0 z-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} className="mr-1" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30">
              <Brain className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-xs font-medium">IA Ativa</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-yellow-300" />
              <h1 className="text-xl font-bold text-white">
                Análise IA Personalizada
              </h1>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            <p className="text-white/90 text-sm">Sua IA financeira pessoal está analisando seus dados</p>
          </div>
        </div>
      </div>

      {/* Navegação por Abas - Mobile Otimizada */}
      <div className="p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4 bg-white shadow-sm h-auto">
            <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-3 px-2 text-xs">
              <Activity className="w-4 h-4" />
              <span>Resumo IA</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex flex-col items-center gap-1 py-3 px-2 text-xs">
              <Brain className="w-4 h-4" />
              <span>Análise</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex flex-col items-center gap-1 py-3 px-2 text-xs">
              <Lightbulb className="w-4 h-4" />
              <span>Dicas IA</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Resumo IA */}
          <TabsContent value="overview" className="space-y-4">
            {/* Banner IA Personalizada */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Brain className="w-8 h-8 text-yellow-300" />
                    <Zap className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Sua IA Financeira Pessoal</h3>
                    <p className="text-blue-100 text-xs">Analisando seus padrões únicos de gastos e receitas</p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white/20 rounded-lg">
                  <p className="text-xs text-blue-100">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    A IA detectou padrões únicos no seu perfil financeiro e criou insights personalizados especialmente para você.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">📊 Resumo Inteligente</h2>
              <p className="text-gray-600 text-sm">Suas métricas analisadas pela IA</p>
            </div>
            
            <Suspense fallback={<LoadingCard title="métricas financeiras" />}>
              <FinancialMetrics />
            </Suspense>

            {/* Cards de acesso rápido - Mobile Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-green-500 to-green-600 text-white border-0"
                onClick={() => setActiveTab("analysis")}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="relative">
                      <PieChart className="w-6 h-6" />
                      <Brain className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Gráficos IA</p>
                      <p className="text-green-100 text-xs">Visualizações inteligentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0"
                onClick={() => setActiveTab("analysis")}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="relative">
                      <Target className="w-6 h-6" />
                      <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Score IA</p>
                      <p className="text-purple-100 text-xs">Avaliação personalizada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA para análise completa */}
            <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-800 text-sm mb-1">Análise Completa Disponível</h3>
                <p className="text-blue-600 text-xs mb-3">Sua IA terminou de processar todos os seus dados financeiros</p>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setActiveTab("analysis")}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Ver Análise IA
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Análise Completa */}
          <TabsContent value="analysis" className="space-y-4">
            {/* Sub-abas para análise */}
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex flex-col items-center gap-1 py-3 h-auto"
                onClick={() => {
                  // Scroll para gráficos
                  document.getElementById('charts-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <PieChart className="w-4 h-4" />
                <span className="text-xs">Gráficos</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex flex-col items-center gap-1 py-3 h-auto"
                onClick={() => {
                  document.getElementById('score-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Target className="w-4 h-4" />
                <span className="text-xs">Score</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex flex-col items-center gap-1 py-3 h-auto"
                onClick={() => {
                  document.getElementById('insights-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Brain className="w-4 h-4" />
                <span className="text-xs">Insights</span>
              </Button>
            </div>

            {/* Gráficos */}
            <div id="charts-section">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">📈 Análise Gráfica IA</h2>
              </div>
              <div className="mb-2">
                <p className="text-gray-600 text-sm">A IA detectou padrões únicos nos seus dados</p>
              </div>
              
              <Suspense fallback={<LoadingCard title="gráficos inteligentes" />}>
                <ModernCharts />
              </Suspense>
            </div>

            {/* Score */}
            <div id="score-section">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">🎯 Score Personalizado</h2>
              </div>
              <div className="mb-2">
                <p className="text-gray-600 text-sm">Pontuação calculada pela IA baseada no seu perfil</p>
              </div>
              
              <Suspense fallback={<LoadingCard title="score personalizado" />}>
                <FinancialHealthScoreCard />
              </Suspense>
            </div>

            {/* Insights */}
            <div id="insights-section">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-800">🤖 Insights Exclusivos</h2>
              </div>
              <div className="mb-2">
                <p className="text-gray-600 text-sm">Descobertas da IA sobre seus hábitos financeiros</p>
              </div>
              
              <Suspense fallback={<LoadingCard title="insights personalizados" />}>
                <FinancialInsights />
              </Suspense>
            </div>
          </TabsContent>

          {/* Tab: Educação IA */}
          <TabsContent value="education" className="space-y-4">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-800">📚 Educação Personalizada</h2>
              </div>
              <p className="text-gray-600 text-sm">Conteúdo selecionado pela IA para seu perfil</p>
            </div>
            
            {/* Banner educacional */}
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-yellow-300" />
                  <div>
                    <h3 className="font-semibold text-sm">Recomendação IA</h3>
                    <p className="text-orange-100 text-xs">Baseada na análise do seu perfil financeiro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
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
