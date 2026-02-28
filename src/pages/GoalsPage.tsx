import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FinancialGoals from '@/components/dashboard/FinancialGoals';

const GoalsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24 lg:pb-8 bg-[#0f172a] lg:bg-transparent safe-area-top">
      {/* Header Mobile */}
      <div 
        className="sticky top-0 z-50 lg:hidden"
        style={{
          background: 'rgba(49, 81, 139, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:text-white hover:bg-white/20 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 
              className="text-xl font-bold text-white"
              style={{ fontFamily: '"Fredoka One", sans-serif' }}
            >
              Metas Financeiras
            </h1>
            <p className="text-xs text-white/60">Acompanhe seu progresso</p>
          </div>
        </div>
      </div>

      {/* Header Desktop */}
      <div className="hidden lg:block px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Target className="w-8 h-8 text-teal-400" />
              Metas Financeiras
            </h1>
            <p className="text-white/60 mt-1">Defina objetivos e acompanhe seu progresso</p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 lg:px-6 py-4 space-y-6">
        {/* Dica */}
        <div 
          className="p-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(20, 184, 166, 0.3)'
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
              }}
            >
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Dica de Economia</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Defina metas SMART (Específicas, Mensuráveis, Alcançáveis, Relevantes e Temporais). 
                Comece com pequenas metas para criar o hábito de poupar!
              </p>
            </div>
          </div>
        </div>

        {/* Componente de Metas */}
        <FinancialGoals />

        {/* Info adicional */}
        <div 
          className="p-4 rounded-2xl lg:grid lg:grid-cols-3 lg:gap-4 space-y-4 lg:space-y-0"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🎯</div>
            <h4 className="text-white font-semibold mb-1">Defina Prioridades</h4>
            <p className="text-white/60 text-sm">
              Foque primeiro na reserva de emergência antes de metas de longo prazo
            </p>
          </div>
          
          <div className="text-center p-4 lg:border-x border-t lg:border-t-0 border-white/10">
            <div className="text-3xl mb-2">📊</div>
            <h4 className="text-white font-semibold mb-1">Acompanhe Sempre</h4>
            <p className="text-white/60 text-sm">
              Revise suas metas mensalmente e ajuste conforme necessário
            </p>
          </div>
          
          <div className="text-center p-4 border-t lg:border-t-0 border-white/10">
            <div className="text-3xl mb-2">🎉</div>
            <h4 className="text-white font-semibold mb-1">Celebre Conquistas</h4>
            <p className="text-white/60 text-sm">
              Cada meta alcançada é um passo para sua liberdade financeira
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
