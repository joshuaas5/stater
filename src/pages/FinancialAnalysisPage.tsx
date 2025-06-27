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
    <>
      {/* CSS Inline Forçado para sobrepor qualquer estilo */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .financial-analysis-page {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
            min-height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: -1 !important;
          }
          .financial-analysis-content {
            position: relative !important;
            z-index: 10 !important;
            overflow-y: auto !important;
            height: 100vh !important;
          }
          body, html, #root {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
          }
        `
      }} />
      
      {/* Background fixo */}
      <div className="financial-analysis-page"></div>
      
      <div 
        className="financial-analysis-content"
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important',
          minHeight: '100vh'
        }}
      >
      {/* Animated background elements with blue tones */}
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
              className="backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} className="mr-2" />
              Voltar
            </Button>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white/80 text-sm">Análise em tempo real</span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Análise Financeira
            </h1>
            <p className="text-white/70 mt-2">Sua análise financeira completa e personalizada</p>
          </div>
        </div>

        {/* Métricas Financeiras - Cards Principais */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">📊 Visão Geral</h2>
            <p className="text-white/70">Suas principais métricas financeiras do mês</p>
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
                <h2 className="text-2xl font-semibold text-white mb-2">📈 Análise Temporal</h2>
                <p className="text-white/70">Evolução das suas finanças ao longo do tempo</p>
              </div>
              <ModernCharts />
            </section>

            {/* Score de Saúde Financeira */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-white mb-2">🎯 Pontuação de Saúde Financeira</h2>
                <p className="text-white/70">Análise detalhada do seu perfil financeiro</p>
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
                <h2 className="text-xl font-semibold text-white mb-2">🤖 Insights IA</h2>
                <p className="text-white/70 text-sm">Análises personalizadas</p>
              </div>
              <FinancialInsights />
            </section>

            {/* Livro da Semana */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white mb-2">📚 Dica da Semana</h2>
                <p className="text-white/70 text-sm">Conhecimento para crescer</p>
              </div>
              <div className="p-1 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-white/20">
                <BookOfTheWeek />
              </div>
            </section>
          </div>        
        </div>
      </div>
    </div>
    </>
  );
};

export default FinancialAnalysisPage;
