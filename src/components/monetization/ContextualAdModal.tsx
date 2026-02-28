import React, { useState, useEffect } from 'react';
import { X, Play, Clock, CreditCard, Receipt, TrendingUp, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ContextualAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAd: () => Promise<void>;
  action: 'bills' | 'transactions';
  actionsWillGrant: number;
  cooldownMinutes: number;
  isLoading?: boolean;
}

const ACTION_CONFIG = {
  bills: {
    icon: <Receipt className="w-8 h-8" />,
    title: 'Adicionar Mais Contas',
    description: 'Continue organizando suas contas',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    examples: ['💡 Conta de Luz', '💧 Conta de Água', '📱 Plano Celular', '🏠 Aluguel']
  },
  transactions: {
    icon: <CreditCard className="w-8 h-8" />,
    title: 'Adicionar Mais Transações',
    description: 'Continue registrando suas movimentações',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    examples: ['🛒 Compras', '⛽ Combustível', '🍕 Alimentação', '🎬 Entretenimento']
  }
} as const;

export const ContextualAdModal: React.FC<ContextualAdModalProps> = ({
  isOpen,
  onClose,
  onWatchAd,
  action,
  actionsWillGrant,
  cooldownMinutes,
  isLoading = false
}) => {
  const [phase, setPhase] = useState<'explanation' | 'ready' | 'loading'>('explanation');
  const [countdown, setCountdown] = useState(5);

  const config = ACTION_CONFIG[action];
  const actionText = action === 'bills' ? 'contas' : 'transações';

  useEffect(() => {
    if (isOpen && phase === 'explanation') {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setPhase('ready');
      }
    }
  }, [isOpen, phase, countdown]);

  useEffect(() => {
    if (isOpen) {
      setPhase('explanation');
      setCountdown(5);
    }
  }, [isOpen]);

  const handleWatchAd = async () => {
    try {
      setPhase('loading');
      await onWatchAd();
    } catch (error) {
      console.error('Erro ao assistir anúncio:', error);
      setPhase('ready');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-white rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        
        {/* Explanation Phase */}
        {phase === 'explanation' && (
          <>
            {/* Header */}
            <div className={`bg-gradient-to-r ${config.color} p-6 text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  {config.icon}
                </div>
                <h2 className="text-xl font-bold mb-2">
                  Limite de {actionText} atingido!
                </h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  Você pode assistir a um anúncio para continuar adicionando {actionText}
                </p>
              </div>
            </div>

            {/* Explanation Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  🎯 Como funciona?
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-xs">1</span>
                    </div>
                    <span>Assista a um anúncio de 30 segundos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-bold text-xs">2</span>
                    </div>
                    <span>Ganhe {actionsWillGrant} {actionText} extras</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold text-xs">3</span>
                    </div>
                    <span>Continue organizando suas finanças</span>
                  </div>
                </div>
              </div>

              {/* Examples */}
              <Card className={`p-4 ${config.bgColor} border-0`}>
                <h4 className={`font-semibold ${config.textColor} mb-3 text-center`}>
                  Exemplos de {actionText}:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {config.examples.map((example, index) => (
                    <div key={index} className={`${config.textColor} text-center py-1`}>
                      {example}
                    </div>
                  ))}
                </div>
              </Card>

              <div className="text-center mt-4">
                <div className="text-sm text-gray-500">
                  Preparando anúncio... {countdown}s
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div 
                    className={`bg-gradient-to-r ${config.color} h-1 rounded-full transition-all duration-1000`}
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Ready Phase */}
        {phase === 'ready' && (
          <>
            {/* Header */}
            <div className={`bg-gradient-to-r ${config.color} p-6 text-white relative`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {config.icon}
                </div>
                <h2 className="text-xl font-bold mb-2">
                  {config.title}
                </h2>
                <p className="text-white/90 text-sm">
                  {config.description}
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* Ad Preview Card */}
              <Card className="p-4 mb-6 border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Play className="w-6 h-6 text-red-600 fill-current" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Anúncio Contextual
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Anúncio de ~30 segundos da nossa rede de parceiros
                  </p>
                  
                  {/* Rewards */}
                  <div className={`${config.bgColor} rounded-lg p-3 border border-current border-opacity-20`}>
                    <div className={`flex items-center justify-center gap-2 ${config.textColor}`}>
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        +{actionsWillGrant} {actionText} desbloqueadas
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Cooldown Info */}
              <div className="bg-amber-50 rounded-lg p-3 mb-6 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Próximo anúncio em {cooldownMinutes} minutos
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                <Button
                  onClick={handleWatchAd}
                  className={`w-full py-4 bg-gradient-to-r ${config.color} hover:opacity-90 text-white font-medium transition-all transform hover:scale-105 shadow-lg`}
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 fill-current" />
                    Assistir Anúncio Agora
                  </div>
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Após o anúncio, você poderá adicionar {actionsWillGrant} {actionText} extras
                </p>
              </div>
            </div>
          </>
        )}

        {/* Loading Phase */}
        {phase === 'loading' && (
          <>
            <div className={`bg-gradient-to-r ${config.color} p-6 text-white text-center`}>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-bold mb-2">
                Carregando anúncio...
              </h2>
              <p className="text-white/90 text-sm">
                Aguarde enquanto preparamos seu anúncio contextual
              </p>
            </div>
            
            <div className="p-6 text-center">
              <div className="text-sm text-gray-600">
                Isso pode levar alguns segundos
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContextualAdModal;
