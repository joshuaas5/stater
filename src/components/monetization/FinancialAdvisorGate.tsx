// src/components/monetization/FinancialAdvisorGate.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, AlertCircle, Play } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdCooldownManager } from '@/utils/adCooldownManager';

interface FinancialAdvisorGateProps {
  children: React.ReactNode;
  onAccessGranted?: () => void;
}

const FinancialAdvisorGate: React.FC<FinancialAdvisorGateProps> = ({ 
  children, 
  onAccessGranted 
}) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isDebugMode] = useState(true); // Debug mode ativo
  
  const { user } = useAuth();

  const checkAccess = async () => {
    try {
      console.log('[FinancialAdvisorGate] Verificando acesso...');
      
      if (!user) {
        console.log('[FinancialAdvisorGate] Usuário não logado');
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // Verificar se pode acessar a análise financeira
      const accessResult = await AdCooldownManager.canPerformAction(
        user.id, 
        'financial_analysis'
      );
      
      console.log('[FinancialAdvisorGate] Resultado do acesso:', accessResult);
      
      // Em modo debug, sempre forçar o gate para aparecer
      if (isDebugMode) {
        console.log('[FinancialAdvisorGate] Modo debug ativo - forçando gate');
        setHasAccess(false);
      } else {
        setHasAccess(accessResult.allowed);
      }
      
      // Se houver cooldown, definir tempo restante
      if (accessResult.minutesUntilNextAd) {
        setTimeRemaining(accessResult.minutesUntilNextAd * 60); // converter para segundos
      }
      
    } catch (error) {
      console.error('[FinancialAdvisorGate] Erro ao verificar acesso:', error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const watchRewardedAd = async () => {
    if (!user) return;
    
    try {
      setIsWatchingAd(true);
      setAdError(null);
      
      console.log('[FinancialAdvisorGate] Iniciando reward ad...');
      
      // Simular assistir ao anúncio (em produção, integrar com AdMob/AdSense)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Usar o método correto do AdCooldownManager
      const result = await AdCooldownManager.watchAdForActions(
        user.id,
        'financial_analysis'
      );
      
      console.log('[FinancialAdvisorGate] Resultado do reward ad:', result);
      
      if (result.success) {
        setHasAccess(true);
        onAccessGranted?.();
      } else {
        setAdError('Erro ao processar anúncio. Tente novamente.');
      }
      
    } catch (error) {
      console.error('[FinancialAdvisorGate] Erro no reward ad:', error);
      setAdError('Erro ao carregar anúncio. Tente novamente.');
    } finally {
      setIsWatchingAd(false);
    }
  };

  useEffect(() => {
    checkAccess();
  }, [user]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            checkAccess(); // Reverificar acesso
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
      <Card className="max-w-lg w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/30 dark:border-gray-700/30 shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Conteúdo Desbloqueável
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Assista um anúncio para continuar
            </p>
          </div>

          {/* Mostrar erro se houver */}
          {adError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm">{adError}</p>
            </div>
          )}

          {/* Mostrar tempo restante se ainda estiver no cooldown */}
          {timeRemaining > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-amber-700 dark:text-amber-300 text-sm">
                Acesso será liberado em: <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
              </p>
            </div>
          )}

          <Button
            onClick={watchRewardedAd}
            disabled={isWatchingAd || timeRemaining > 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isWatchingAd ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Carregando anúncio...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Assistir anúncio
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Após assistir ao anúncio, você terá acesso por 1 hora
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialAdvisorGate;
