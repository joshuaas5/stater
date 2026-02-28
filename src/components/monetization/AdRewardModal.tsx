import React, { useState, useEffect } from 'react';
import { X, Play, Gift, Clock, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface AdRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAd: () => Promise<void>;
  currentDay: number;
  adsWatched: number;
  adsRequired: number;
  messagesWillGrant: number;
  isLoading?: boolean;
}

const DAY_MESSAGES = {
  1: '3 mensagens',
  2: '4 mensagens', 
  3: '5 mensagens'
} as const;

const DAY_COLORS = {
  1: 'from-blue-500 to-blue-600',
  2: 'from-purple-500 to-purple-600',
  3: 'from-orange-500 to-orange-600'
} as const;

export const AdRewardModal: React.FC<AdRewardModalProps> = ({
  isOpen,
  onClose,
  onWatchAd,
  currentDay,
  adsWatched,
  adsRequired,
  messagesWillGrant,
  isLoading = false
}) => {
  const [phase, setPhase] = useState<'explanation' | 'ready' | 'loading'>('explanation');
  const [countdown, setCountdown] = useState(8);
  const [explanationStep, setExplanationStep] = useState(0);

  const explanationSteps = [
    {
      icon: <Gift className="w-8 h-8" />,
      title: "🎯 Mensagens esgotadas!",
      description: "Você atingiu o limite de mensagens gratuitas por hoje."
    },
    {
      icon: <Play className="w-8 h-8 text-red-600 fill-current" />,
      title: "📺 Solução: Assistir anúncio",
      description: "Assista a um anúncio de 30 segundos para desbloquear mais mensagens."
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500 fill-current" />,
      title: `✨ Recompensa: +${messagesWillGrant} mensagens`,
      description: `Após o anúncio, você terá ${messagesWillGrant} mensagens extras para continuar usando o app.`
    }
  ];

  useEffect(() => {
    if (isOpen && phase === 'explanation') {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Auto-avançar para próximo step ou fase ready
        if (explanationStep < explanationSteps.length - 1) {
          setExplanationStep(prev => prev + 1);
          setCountdown(3); // 3 segundos para cada step
        } else {
          setPhase('ready');
        }
      }
    }
  }, [isOpen, phase, countdown, explanationStep, explanationSteps.length]);

  useEffect(() => {
    if (isOpen) {
      setPhase('explanation');
      setCountdown(4); // 4 segundos para o primeiro step
      setExplanationStep(0);
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

  const dayColor = DAY_COLORS[currentDay as keyof typeof DAY_COLORS] || 'from-gray-500 to-gray-600';
  const dayMessage = DAY_MESSAGES[currentDay as keyof typeof DAY_MESSAGES] || `${messagesWillGrant} mensagens`;
  const currentStep = explanationSteps[explanationStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-white rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        
        {/* Explanation Phase */}
        {phase === 'explanation' && (
          <>
            {/* Header com gradiente animado */}
            <div className={`bg-gradient-to-r ${dayColor} p-6 text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  {currentStep.icon}
                </div>
                <h2 className="text-xl font-bold mb-2 animate-fadeIn">
                  {currentStep.title}
                </h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  {currentStep.description}
                </p>
              </div>
            </div>

            {/* Progress indicators */}
            <div className="p-6">
              <div className="flex justify-center gap-2 mb-4">
                {explanationSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === explanationStep 
                        ? `bg-gradient-to-r ${dayColor}` 
                        : index < explanationStep 
                          ? 'bg-green-400' 
                          : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">
                  {explanationStep < explanationSteps.length - 1 
                    ? `Próximo em ${countdown}s...` 
                    : countdown > 0 
                      ? `Preparando anúncio... ${countdown}s`
                      : 'Pronto!'
                  }
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className={`bg-gradient-to-r ${dayColor} h-1 rounded-full transition-all duration-1000`}
                    style={{ 
                      width: explanationStep < explanationSteps.length - 1 
                        ? `${((4 - countdown) / 4) * 100}%`
                        : countdown > 0 
                          ? `${((3 - countdown) / 3) * 100}%`
                          : '100%'
                    }}
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
            <div className={`bg-gradient-to-r ${dayColor} p-6 text-white relative`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold mb-2">
                  Ganhe {dayMessage}!
                </h2>
                <p className="text-white/90 text-sm">
                  Tudo pronto! Clique para assistir o anúncio
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Progresso do Dia {currentDay}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {adsWatched}/{adsRequired} anúncios
                  </Badge>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${dayColor} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${(adsWatched / adsRequired) * 100}%` }}
                  />
                </div>
              </div>

              {/* Ad Preview Card */}
              <Card className="p-4 mb-6 border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Play className="w-6 h-6 text-red-600 fill-current" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Anúncio Rewarded
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Anúncio de ~30 segundos da nossa rede de parceiros
                  </p>
                  
                  {/* Rewards */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        +{messagesWillGrant} mensagens desbloqueadas
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Button */}
              <div className="space-y-3">
                <Button
                  onClick={handleWatchAd}
                  className={`w-full py-4 bg-gradient-to-r ${dayColor} hover:opacity-90 text-white font-medium transition-all transform hover:scale-105 shadow-lg`}
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 fill-current" />
                    Assistir Anúncio Agora
                  </div>
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Após {adsRequired} anúncio{adsRequired > 1 ? 's' : ''}, você terá {messagesWillGrant} mensagens para usar hoje
                </p>
              </div>
            </div>
          </>
        )}

        {/* Loading Phase */}
        {phase === 'loading' && (
          <>
            <div className={`bg-gradient-to-r ${dayColor} p-6 text-white text-center`}>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-bold mb-2">
                Carregando anúncio...
              </h2>
              <p className="text-white/90 text-sm">
                Aguarde enquanto preparamos seu anúncio
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
