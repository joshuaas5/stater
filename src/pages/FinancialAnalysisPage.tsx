// src/pages/FinancialAnalysisPage.tsx
import React from 'react';
import FinancialHealthScoreCard from '@/components/personal_analysis/FinancialHealthScoreCard';
import BookOfTheWeek from '@/components/personal_analysis/BookOfTheWeek';
import FinancialMetrics from '@/components/dashboard/FinancialMetrics';
import ModernCharts from '@/components/dashboard/ModernCharts';
import FinancialInsights from '@/components/dashboard/FinancialInsights';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FinancialAnalysisPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 container mx-auto p-4 md:p-6 lg:p-8 space-y-8">        {/* Header com botão voltar e título */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              className="backdrop-blur-md bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-300 shadow-lg font-medium"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} className="mr-2" />
              Voltar
            </Button>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
              <TrendingUp className="w-5 h-5 text-green-300" />
              <span className="text-white/90 text-sm font-medium">Análise em tempo real</span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Análise Financeira
            </h1>
            <p className="text-white/90 mt-3 text-lg drop-shadow-md">Sua análise financeira completa e personalizada</p>
          </div>
        </div>

        {/* Métricas Financeiras - Cards Principais */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2 drop-shadow-md">📊 Visão Geral</h2>
            <p className="text-white/90 drop-shadow-sm">Suas principais métricas financeiras do mês</p>
          </div>
          <FinancialMetrics />
        </section>

        {/* Layout Principal - Gráficos e Análise */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Gráficos e Score */}
          <div className="xl:col-span-2 space-y-8">
            {/* Gráficos Modernos */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2 drop-shadow-md">📈 Análise Temporal</h2>
                <p className="text-white/90 drop-shadow-sm">Evolução das suas finanças ao longo do tempo</p>
              </div>
              <ModernCharts />
            </section>

            {/* Score de Saúde Financeira */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2 drop-shadow-md">🎯 Pontuação de Saúde Financeira</h2>
                <p className="text-white/90 drop-shadow-sm">Análise detalhada do seu perfil financeiro</p>
              </div>
              <div className="p-1 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/20">
                <FinancialHealthScoreCard />
              </div>
            </section>
          </div>

          {/* Coluna Direita - Insights e Dicas */}
          <div className="xl:col-span-1 space-y-8">
            {/* Insights da IA */}
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2 drop-shadow-md">🤖 Insights IA</h2>
                <p className="text-white/90 text-sm drop-shadow-sm">Análises personalizadas</p>
              </div>
              <FinancialInsights />
            </section>

            {/* Livro da Semana */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white mb-2 drop-shadow-md">📚 Dica da Semana</h2>
                <p className="text-white/90 text-sm drop-shadow-sm">Conhecimento para crescer</p>
              </div>
              <div className="p-1 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-white/20">
                <BookOfTheWeek />
              </div>
            </section>
          </div>        
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalysisPage;
