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

  return (    <div 
      className="min-h-screen relative overflow-hidden bg-galileo-background"
      style={{
        background: `
          linear-gradient(135deg, 
            rgba(79, 135, 255, 0.08) 0%, 
            rgba(139, 92, 246, 0.08) 25%, 
            rgba(236, 72, 153, 0.08) 50%, 
            rgba(16, 185, 129, 0.08) 75%, 
            rgba(245, 158, 11, 0.08) 100%
          ),
          radial-gradient(circle at 20% 50%, rgba(79, 135, 255, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
          hsl(var(--galileo-background))
        `
      }}
    >      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div><div className="relative z-10 container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* Botão voltar posicionado no canto */}        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="backdrop-blur-md bg-galileo-card/80 border-galileo-border text-galileo-text hover:bg-galileo-accent/20 transition-all duration-300"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} className="mr-2" />
            Voltar
          </Button>
        </div>        {/* Header centralizado */}
        <div className="text-center mb-8 pt-16">
          <h1 className="text-3xl md:text-4xl font-bold text-galileo-text mb-2">
            Análise Financeira
          </h1>
          <p className="text-galileo-secondaryText">Sua análise financeira completa e personalizada</p>
          
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-galileo-card/80 backdrop-blur-md border border-galileo-border">
            <TrendingUp className="w-5 h-5 text-galileo-positive" />
            <span className="text-galileo-text text-sm">Análise em tempo real</span>
          </div>
        </div>        {/* Métricas Financeiras - Cards Principais */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-galileo-text mb-2">📊 Visão Geral</h2>
            <p className="text-galileo-secondaryText">Suas principais métricas financeiras do mês</p>
          </div>
          <FinancialMetrics />
        </section>

        {/* Layout Principal - Gráficos e Análise */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Gráficos e Score */}
          <div className="xl:col-span-2 space-y-8">            {/* Gráficos Modernos */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-galileo-text mb-2">📈 Análise Temporal</h2>
                <p className="text-galileo-secondaryText">Evolução das suas finanças ao longo do tempo</p>
              </div>
              <ModernCharts />
            </section>

            {/* Score de Saúde Financeira */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-galileo-text mb-2">🎯 Pontuação de Saúde Financeira</h2>
                <p className="text-galileo-secondaryText">Análise detalhada do seu perfil financeiro</p>
              </div>
              <div className="p-1 rounded-xl bg-gradient-to-r from-galileo-accent/20 to-galileo-positive/20 backdrop-blur-md border border-galileo-border">
                <FinancialHealthScoreCard />
              </div>
            </section>
          </div>

          {/* Coluna Direita - Insights e Dicas */}
          <div className="xl:col-span-1 space-y-8">            {/* Insights da IA */}
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-galileo-text mb-2">🤖 Insights IA</h2>
                <p className="text-galileo-secondaryText text-sm">Análises personalizadas</p>
              </div>
              <FinancialInsights />
            </section>

            {/* Livro da Semana */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-galileo-text mb-2">📚 Dica da Semana</h2>
                <p className="text-galileo-secondaryText text-sm">Conhecimento para crescer</p>
              </div>
              <div className="p-1 rounded-xl bg-gradient-to-r from-galileo-accent/20 to-blue-500/20 backdrop-blur-md border border-galileo-border">
                <BookOfTheWeek />
              </div>
            </section></div>        </div>
      </div>
    </div>
  );
};

export default FinancialAnalysisPage;
