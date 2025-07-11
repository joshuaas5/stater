// src/pages/FinancialAnalysisPage.tsx
import React, { Suspense, lazy, useState } from 'react';
import { Button} from '@/components/ui/button';
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
      {/* Header moderno com mesmo design do advisor */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 30px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          height: '60px',
          backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
        }}
      >
        <Button 
          variant="ghost" 
          size="sm"
          style={{
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
          className="hover:bg-white/20"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-2" />
          Voltar
        </Button>
        
        <div 
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: '"Fredoka One", "Comic Sans MS", "Poppins", sans-serif',
            letterSpacing: '1px',
            textShadow: '2px 2px 0px #3b82f6, 4px 4px 0px #1d4ed8, 0 0 20px rgba(59, 130, 246, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6)',
            textTransform: 'uppercase'
          }}
        >
          ANÁLISE FINANCEIRA
        </div>
        
        <div style={{ width: '80px' }}></div> {/* Spacer para centralizar o título */}
      </div>

      {/* Espaçamento para compensar header fixo */}
      <div style={{ height: '60px' }}></div>

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
