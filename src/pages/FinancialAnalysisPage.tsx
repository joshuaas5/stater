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
  <Card className="bg-white border-gray-200 shadow-sm">
    <CardContent className="flex items-center justify-center h-32 p-4">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-600 text-center">Carregando {title}...</p>
      </div>
    </CardContent>
  </Card>
);

const FinancialAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("insights");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplificado */}
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
          </div>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-1">
              Análise Financeira Inteligente
            </h1>
            <p className="text-white/90 text-sm">Insights baseados nos seus dados financeiros</p>
          </div>
        </div>
      </div>

      {/* Navegação reorganizada com destaque para Insights */}
      <div className="p-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4 bg-white shadow-sm h-auto">
            <TabsTrigger value="insights" className="flex flex-col items-center gap-1 py-3 px-2 text-xs">
              <MessageSquare className="w-4 h-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex flex-col items-center gap-1 py-3 px-2 text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>Gráficos</span>
            </TabsTrigger>
            <TabsTrigger value="score" className="flex flex-col items-center gap-1 py-3 px-2 text-xs">
              <Target className="w-4 h-4" />
              <span>Score</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex flex-col items-center gap-1 py-3 px-2 text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Educação</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Insights (PRIORIDADE MÁXIMA) */}
          <TabsContent value="insights" className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">� Insights Inteligentes</h2>
              <p className="text-gray-600 text-sm">Descobertas importantes sobre seus hábitos financeiros</p>
            </div>
            
            {/* Banner destacando insights */}
            <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-yellow-300" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Análises Personalizadas</h3>
                    <p className="text-green-100 text-xs">Baseadas nos seus padrões únicos de gastos e receitas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Suspense fallback={<LoadingCard title="insights personalizados" />}>
              <FinancialInsights />
            </Suspense>

            {/* Resumo de métricas no final dos insights */}
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-3">📊 Resumo das Métricas</h3>
              <Suspense fallback={<LoadingCard title="métricas financeiras" />}>
                <FinancialMetrics />
              </Suspense>
            </div>
          </TabsContent>

          {/* Tab: Gráficos (com correção de corte) */}
          <TabsContent value="charts" className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">📈 Análise Gráfica</h2>
              <p className="text-gray-600 text-sm">Visualização da evolução das suas finanças</p>
            </div>
            
            {/* Container com padding para evitar corte dos números */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <Suspense fallback={<LoadingCard title="gráficos" />}>
                <ModernCharts />
              </Suspense>
            </div>
          </TabsContent>

          {/* Tab: Score (mais claro e direto) */}
          <TabsContent value="score" className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">🎯 Score de Saúde Financeira</h2>
              <p className="text-gray-600 text-sm">Avaliação clara e objetiva da sua situação financeira</p>
            </div>
            
            {/* Explicação do score */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-800 text-sm mb-2">Como calculamos seu score:</h3>
                <div className="text-blue-700 text-xs space-y-1">
                  <p>• <strong>Saldo positivo:</strong> +25 pontos</p>
                  <p>• <strong>Receitas vs gastos:</strong> até 30 pontos</p>
                  <p>• <strong>Consistência mensal:</strong> até 25 pontos</p>
                  <p>• <strong>Diversificação de categorias:</strong> até 20 pontos</p>
                </div>
              </CardContent>
            </Card>
            
            <Suspense fallback={<LoadingCard title="score financeiro" />}>
              <FinancialHealthScoreCard />
            </Suspense>
          </TabsContent>

          {/* Tab: Educação (honesta sobre não ser personalizada) */}
          <TabsContent value="education" className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">📚 Educação Financeira</h2>
              <p className="text-gray-600 text-sm">Conteúdo educativo para melhorar suas finanças</p>
            </div>
            
            {/* Banner honesto sobre educação */}
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-yellow-300" />
                  <div>
                    <h3 className="font-semibold text-sm">Conteúdo Educativo</h3>
                    <p className="text-orange-100 text-xs">Livros e dicas selecionados pela nossa equipe</p>
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
