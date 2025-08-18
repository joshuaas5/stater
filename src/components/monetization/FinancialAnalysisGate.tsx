// src/components/monetization/FinancialAnalysisGate.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdCooldownManager } from '@/utils/adCooldownManager';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface FinancialAnalysisGateProps {
  children: React.ReactNode;
}

const FinancialAnalysisGate: React.FC<FinancialAnalysisGateProps> = ({ children }) => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false); // Começar sempre sem acesso
  const [isLoading, setIsLoading] = useState(true);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [timeUntilNextAd, setTimeUntilNextAd] = useState<number | null>(null);

  // Verificar acesso do usuário
  const checkAccess = async () => {
    if (!user?.id) {
      console.log('🔒 [FINANCIAL_GATE] Usuário não autenticado');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔒 [FINANCIAL_GATE] Verificando acesso para usuário:', user.id);
      
      // Verificar se usuário é premium primeiro
      const { UserPlanManager } = await import('@/utils/userPlanManager');
      const userPlan = await UserPlanManager.getUserPlan(user.id);
      console.log('📋 [FINANCIAL_GATE] Plano do usuário:', userPlan.planType);
      
      // Se é premium, liberar acesso direto
      if (userPlan.planType !== 'free') {
        console.log('✅ [FINANCIAL_GATE] Usuário premium - acesso liberado');
        setHasAccess(true);
        setIsLoading(false);
        return;
      }
      
      // Para usuários FREE, verificar se há cooldown ativo (já assistiu ad recentemente)
      console.log('🔒 [FINANCIAL_GATE] Usuário FREE - verificando cooldown do reward ad');
      const { RewardCooldownManager } = await import('@/utils/rewardCooldownManager');
      const cooldownInfo = await RewardCooldownManager.checkCooldownStatus(user.id, 'financial_analysis');
      console.log('🔒 [FINANCIAL_GATE] Info de cooldown:', cooldownInfo);
      
      // Se há cooldown ativo (isInCooldown = true), usuário já assistiu ad recentemente - liberar acesso
      if (cooldownInfo.isInCooldown) {
        console.log('✅ [FINANCIAL_GATE] Cooldown ativo - usuário assistiu ad recentemente, acesso liberado');
        setHasAccess(true);
        setTimeUntilNextAd(cooldownInfo.remainingMinutes || 0);
      } else {
        console.log('🔒 [FINANCIAL_GATE] Nenhum cooldown ativo - precisa assistir reward ad');
        setHasAccess(false);
        setTimeUntilNextAd(null);
      }
    } catch (error) {
      console.error('🔒 [FINANCIAL_GATE] Erro ao verificar acesso:', error);
      // Em caso de erro, usuário FREE fica bloqueado
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Assistir anúncio recompensado
  const watchRewardedAd = async () => {
    if (!user?.id || isWatchingAd) return;

    setIsWatchingAd(true);
    setAdError(null);

    try {
      console.log('🎬 [FINANCIAL_GATE] Iniciando reward ad para financial_analysis');
      
      // Importar AdManager dinamicamente
      const { AdManager } = await import('@/utils/adManager');
      const result = await AdManager.showRewardedAd('financial_analysis');
      
      if (result.success) {
        console.log('✅ [FINANCIAL_GATE] Reward ad assistido com sucesso!');
        
        // Registrar o cooldown no sistema
        const { RewardCooldownManager } = await import('@/utils/rewardCooldownManager');
        await RewardCooldownManager.setRewardCooldown(user.id, 'financial_analysis');
        
        // Liberar acesso imediatamente
        setHasAccess(true);
        setTimeUntilNextAd(60); // 1 hora = 60 minutos
        
        console.log('🔓 [FINANCIAL_GATE] Acesso liberado por 1 hora!');
      } else {
        console.log('❌ [FINANCIAL_GATE] Reward ad cancelado ou falhou');
        setAdError('Anúncio cancelado. Tente novamente para acessar a análise financeira.');
      }
    } catch (error) {
      console.error('❌ [FINANCIAL_GATE] Erro no reward ad:', error);
      setAdError('Erro inesperado. Tente novamente.');
    } finally {
      setIsWatchingAd(false);
    }
  };

  // Atualizar timer do cooldown
  useEffect(() => {
    if (timeUntilNextAd && timeUntilNextAd > 0) {
      const interval = setInterval(() => {
        setTimeUntilNextAd(prev => {
          if (prev && prev > 1) {
            return prev - 1;
          } else {
            // Cooldown terminou, verificar acesso novamente
            checkAccess();
            return null;
          }
        });
      }, 60000); // Atualizar a cada minuto

      return () => clearInterval(interval);
    }
  }, [timeUntilNextAd]);

  // Verificar acesso inicial
  useEffect(() => {
    checkAccess();
  }, [user?.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="financial-analysis-page min-h-screen pb-20" style={{
        background: '#31518b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/30 dark:border-gray-700/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Verificando acesso...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Se o usuário tem acesso, mostrar o conteúdo
  if (hasAccess) {
    return <>{children}</>;
  }

  // Gate de acesso - TELA EXCLUSIVA para reward ad (sem informações técnicas)
  return (
    <div className="financial-analysis-page min-h-screen pb-20" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-lg w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-white/30 dark:border-gray-700/30 shadow-2xl rounded-3xl">
          <CardContent className="p-10 text-center">
            {/* Ícone principal */}
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                <Play className="h-10 w-10 text-white" />
              </div>
              
              {/* Título principal */}
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Análise Financeira
              </h2>
              
              {/* Mensagem simples e direta */}
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Assista para ver sua análise financeira personalizada!
              </p>
            </div>

            {/* Estado do botão baseado na situação */}
            {timeUntilNextAd && timeUntilNextAd > 0 ? (
              // Estado: Cooldown ativo
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-6">
                  <Clock className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Aguarde um momento para assistir novamente
                  </p>
                </div>
              </div>
            ) : (
              // Estado: Pode assistir anúncio
              <div className="space-y-6">
                <Button
                  onClick={watchRewardedAd}
                  disabled={isWatchingAd}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ minHeight: '60px' }}
                >
                  {isWatchingAd ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Carregando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Play className="h-6 w-6" />
                      <span>Assistir e Desbloquear</span>
                    </div>
                  )}
                </Button>

                {/* Erro do anúncio */}
                {adError && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <p className="text-red-700 dark:text-red-300 text-sm">{adError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Benefícios após assistir */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Após assistir, você terá acesso a:
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Insights personalizados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Gráficos detalhados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Análise de saúde financeira</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Recomendações de livros</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialAnalysisGate;
