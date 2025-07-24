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
  const [countdown, setCountdown] = useState(5);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanProceed(true);
    }
  }, [isOpen, countdown]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setCanProceed(false);
    }
  }, [isOpen]);

  const handleWatchAd = async () => {
    try {
      await onWatchAd();
    } catch (error) {
      console.error('Erro ao assistir anúncio:', error);
    }
  };

  const dayColor = DAY_COLORS[currentDay as keyof typeof DAY_COLORS] || 'from-gray-500 to-gray-600';
  const dayMessage = DAY_MESSAGES[currentDay as keyof typeof DAY_MESSAGES] || `${messagesWillGrant} mensagens`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-white rounded-2xl p-0 overflow-hidden">
        {/* Header com gradiente */}
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
              Assista a um anúncio e desbloqueie mais mensagens
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
          <Card className="p-4 mb-6 border-2 border-dashed border-gray-200">
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
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-green-600">
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
              disabled={!canProceed || isLoading}
              className={`w-full py-3 bg-gradient-to-r ${dayColor} hover:opacity-90 text-white font-medium transition-all`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Carregando anúncio...
                </div>
              ) : !canProceed ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Aguarde {countdown}s
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  Assistir Anúncio
                </div>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Após {adsRequired} anúncio{adsRequired > 1 ? 's' : ''}, você terá {messagesWillGrant} mensagens para usar hoje
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
