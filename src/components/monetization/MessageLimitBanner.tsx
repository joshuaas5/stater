import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Zap, Crown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AdManager } from '@/utils/adManager';

interface MessageLimitBannerProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAd: () => Promise<void>;
  onUpgrade: () => void;
  messagesRemaining: number;
  totalMessages: number;
  className?: string;
}

export const MessageLimitBanner: React.FC<MessageLimitBannerProps> = ({
  isOpen,
  onClose,
  onWatchAd,
  onUpgrade,
  messagesRemaining,
  totalMessages,
  className = ''
}) => {
  const [phase, setPhase] = useState<'explanation' | 'countdown' | 'ad'>('explanation');
  const [countdown, setCountdown] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  // Reiniciar quando abrir
  useEffect(() => {
    if (isOpen) {
      setPhase('explanation');
      setCountdown(5);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Countdown para o anúncio
  useEffect(() => {
    if (phase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (phase === 'countdown' && countdown === 0) {
      handleWatchAd();
    }
  }, [phase, countdown]);

  const handleWatchAd = async () => {
    setPhase('ad');
    setIsLoading(true);
    
    try {
      await onWatchAd();
      onClose();
    } catch (error) {
      console.error('Erro ao assistir anúncio:', error);
      setIsLoading(false);
      setPhase('explanation');
    }
  };

  const startCountdown = () => {
    setPhase('countdown');
    setCountdown(5);
  };

  if (!isOpen) return null;

  const usagePercent = ((totalMessages - messagesRemaining) / totalMessages) * 100;

  return (
    <div className={`
      fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
      flex items-center justify-center p-4 ${className}
    `}>
      <Card className="w-full max-w-md mx-auto bg-white shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-red-600 p-4 text-white">
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="absolute top-2 right-2 h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20"
          >
            <X size={16} />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Limite de Mensagens</h2>
              <p className="text-white/90 text-sm">Suas mensagens diárias se esgotaram</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Explanation Phase */}
          {phase === 'explanation' && (
            <div className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mensagens usadas hoje</span>
                  <span className="font-medium">{totalMessages - messagesRemaining}/{totalMessages}</span>
                </div>
                <Progress value={usagePercent} className="h-2" />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Você pode continuar de duas formas:
                </p>

                {/* Watch Ad Option */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-900">Assistir Anúncio</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Ganhe +3 mensagens assistindo um anúncio de 30 segundos
                  </p>
                  <Button 
                    onClick={startCountdown}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={isLoading}
                  >
                    <Zap size={16} className="mr-2" />
                    Assistir Anúncio (Grátis)
                  </Button>
                </div>

                {/* Upgrade Option */}
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <Crown className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Upgrade para Premium</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Mensagens ilimitadas a partir de <strong>R$ 8,90/semana</strong>
                  </p>
                  <Button 
                    onClick={onUpgrade}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-600 hover:bg-blue-100"
                    disabled={isLoading}
                  >
                    <Crown size={16} className="mr-2" />
                    Ver Planos Premium
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Countdown Phase */}
          {phase === 'countdown' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                <Clock size={24} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Anúncio começando em...
                </h3>
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {countdown}
                </div>
                <p className="text-sm text-gray-600">
                  Prepare-se para assistir o anúncio e ganhar +3 mensagens
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setPhase('explanation')}
                disabled={countdown <= 1}
              >
                Voltar
              </Button>
            </div>
          )}

          {/* Ad Phase */}
          {phase === 'ad' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Zap size={24} className="text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Carregando anúncio...
                </h3>
                <p className="text-sm text-gray-600">
                  Aguarde enquanto preparamos seu anúncio
                </p>
              </div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MessageLimitBanner;
