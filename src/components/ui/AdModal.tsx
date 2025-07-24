import React, { useState, useEffect } from 'react';
import { X, Play, Gift, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AdManager, AdResult } from '@/utils/adManager';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (success: boolean, reward?: string) => void;
  type: 'bills' | 'transactions' | 'messages';
  userId: string;
  rewardInfo?: {
    description: string;
    count: number;
  };
}

export function AdModal({ isOpen, onClose, onReward, type, userId, rewardInfo }: AdModalProps) {
  const [adState, setAdState] = useState<'waiting' | 'playing' | 'completed' | 'error'>('waiting');
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canClose, setCanClose] = useState(false);
  const [result, setResult] = useState<AdResult | null>(null);

  // Reset estado quando modal abre
  useEffect(() => {
    if (isOpen) {
      setAdState('waiting');
      setProgress(0);
      setTimeLeft(0);
      setCanClose(false);
      setResult(null);
    }
  }, [isOpen]);

  const getAdInfo = () => {
    switch (type) {
      case 'bills':
        return {
          title: '💡 Assista e continue adicionando contas',
          description: 'Anúncio rápido para manter o app gratuito',
          reward: 'Continue sem limites',
          duration: 6
        };
      case 'transactions':
        return {
          title: '📊 Assista e adicione mais transações',
          description: 'Ajude-nos a manter o ICTUS gratuito',
          reward: 'Continue organizando suas finanças',
          duration: 5
        };
      case 'messages':
        return {
          title: '🎁 Assista e ganhe mensagens grátis',
          description: rewardInfo?.description || 'Ganhe mensagens para usar no Telegram',
          reward: `${rewardInfo?.count || 3} mensagens liberadas`,
          duration: 7
        };
      default:
        return {
          title: '📺 Anúncio',
          description: 'Assista para continuar',
          reward: 'Obrigado!',
          duration: 5
        };
    }
  };

  const startAd = async () => {
    setAdState('playing');
    setCanClose(false);
    
    const adInfo = getAdInfo();
    const totalTime = adInfo.duration * 1000; // milliseconds
    const interval = 100; // update every 100ms
    
    setTimeLeft(adInfo.duration);
    
    // Simular progresso do anúncio
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (interval / totalTime) * 100;
        
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          completeAd();
          return 100;
        }
        
        // Atualizar tempo restante
        const remainingTime = Math.ceil((totalTime - (newProgress / 100 * totalTime)) / 1000);
        setTimeLeft(remainingTime);
        
        return newProgress;
      });
    }, interval);

    // Permitir fechar após 3 segundos (para usuários impacientes)
    setTimeout(() => {
      setCanClose(true);
    }, 3000);
  };

  const completeAd = async () => {
    setAdState('playing');
    
    try {
      // Mostrar anúncio real via AdManager
      const adResult = await AdManager.showRewardedAd(type);
      setResult(adResult);
      
      if (adResult.success) {
        // Processar recompensa
        await AdManager.processAdReward(userId, type);
        setAdState('completed');
        
        // Auto-fechar após 2 segundos de sucesso
        setTimeout(() => {
          onReward(true, adResult.reward);
          onClose();
        }, 2000);
      } else {
        setAdState('error');
      }
      
    } catch (error) {
      console.error('Erro ao executar anúncio:', error);
      setAdState('error');
    }
  };

  const handleClose = () => {
    if (adState === 'waiting' || canClose || adState === 'completed' || adState === 'error') {
      onReward(adState === 'completed', result?.reward);
      onClose();
    }
  };

  const adInfo = getAdInfo();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-purple-50 to-blue-50">
        <DialogHeader className="text-center space-y-4 pb-4">
          {(adState === 'waiting' || canClose || adState === 'completed' || adState === 'error') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute right-4 top-4 h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <DialogTitle className="text-xl font-bold text-gray-900">
            {adInfo.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado: Aguardando */}
          {adState === 'waiting' && (
            <div className="text-center space-y-4">
              <div className="bg-purple-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
                <Play className="w-8 h-8 text-purple-600" />
              </div>
              
              <p className="text-gray-600">
                {adInfo.description}
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 justify-center">
                  <Gift className="w-4 h-4 text-green-600" />
                  <span className="text-green-800 font-medium text-sm">
                    {adInfo.reward}
                  </span>
                </div>
              </div>
              
              <Button
                onClick={startAd}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Assistir Anúncio ({adInfo.duration}s)
              </Button>
            </div>
          )}

          {/* Estado: Reproduzindo */}
          {adState === 'playing' && (
            <div className="text-center space-y-4">
              <div className="bg-blue-100 rounded-lg p-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
                
                <p className="text-blue-800 font-medium">
                  Anúncio em execução...
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Progresso</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeLeft}s</span>
                  </div>
                </div>
                
                <Progress value={progress} className="h-2" />
              </div>
              
              {canClose && (
                <p className="text-xs text-gray-500">
                  Você pode fechar agora, mas não receberá a recompensa
                </p>
              )}
            </div>
          )}

          {/* Estado: Completado */}
          {adState === 'completed' && (
            <div className="text-center space-y-4">
              <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
                <Gift className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  🎉 Parabéns!
                </h3>
                <p className="text-green-700">
                  {result?.reward || adInfo.reward}
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  Recompensa aplicada com sucesso!
                </p>
              </div>
            </div>
          )}

          {/* Estado: Erro */}
          {adState === 'error' && (
            <div className="text-center space-y-4">
              <div className="bg-red-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
                <X className="w-8 h-8 text-red-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  Ops! Algo deu errado
                </h3>
                <p className="text-red-700 text-sm">
                  {result?.error || 'Não foi possível carregar o anúncio'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={startAd}
                  variant="outline"
                  className="w-full"
                >
                  Tentar Novamente
                </Button>
                
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  className="w-full text-gray-600"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer com info */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Os anúncios nos ajudam a manter o ICTUS gratuito para todos
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook para usar o AdModal facilmente
export function useAdModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [adType, setAdType] = useState<'bills' | 'transactions' | 'messages'>('bills');
  const [rewardInfo, setRewardInfo] = useState<{ description: string; count: number } | undefined>();

  const showAd = (type: 'bills' | 'transactions' | 'messages', reward?: { description: string; count: number }) => {
    setAdType(type);
    setRewardInfo(reward);
    setIsOpen(true);
  };

  const closeAd = () => {
    setIsOpen(false);
    setRewardInfo(undefined);
  };

  return {
    isOpen,
    adType,
    rewardInfo,
    showAd,
    closeAd
  };
}
