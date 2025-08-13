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
      const canAccessResult = await AdCooldownManager.canPerformAction(user.id, 'financial_analysis');
      console.log('🔒 [FINANCIAL_GATE] Resultado do acesso:', canAccessResult);
      
      // Se tem acesso (premium, developer ou ações livres), liberar imediatamente
      if (canAccessResult.allowed) {
        console.log('🔒 [FINANCIAL_GATE] Acesso permitido! Liberando conteúdo');
        setHasAccess(true);
        setTimeUntilNextAd(null);
        return;
      }

      // Se está em cooldown, verificar tempo restante
      if (canAccessResult.reason === 'cooldown_active' && canAccessResult.minutesUntilNextAd) {
        console.log('🔒 [FINANCIAL_GATE] Em cooldown, próximo anúncio em:', canAccessResult.minutesUntilNextAd, 'minutos');
        setTimeUntilNextAd(canAccessResult.minutesUntilNextAd);
        setHasAccess(false);
        return;
      }

      // Precisa assistir anúncio
      console.log('🔒 [FINANCIAL_GATE] Usuário precisa assistir anúncio para acessar');
      setHasAccess(false);
      setTimeUntilNextAd(null);

    } catch (error) {
      console.error('🔒 [FINANCIAL_GATE] Erro ao verificar acesso:', error);
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
      const result = await AdCooldownManager.watchAdForActions(user.id, 'financial_analysis');
      
      if (result.success) {
        console.log('🎉 [FINANCIAL_GATE] Anúncio assistido com sucesso! Liberando acesso');
        setHasAccess(true);
        setTimeUntilNextAd(null);
        
        // Após assistir o anúncio, o usuário tem 1 hora de acesso livre
        // O sistema automaticamente pedirá novo anúncio após 1 hora
        console.log('🎉 [FINANCIAL_GATE] Usuário agora tem 1 hora de acesso livre');
      } else {
        setAdError(result.message || 'Erro ao assistir anúncio');
        console.error('❌ [FINANCIAL_GATE] Falha ao assistir anúncio:', result.message);
      }
    } catch (error) {
      console.error('❌ [FINANCIAL_GATE] Erro ao assistir anúncio:', error);
      setAdError('Erro inesperado. Tente novamente.');
    } finally {
      setIsWatchingAd(false);
    }
  };

  // Atualizar timer do cooldown e verificar expiração
  useEffect(() => {
    if (timeUntilNextAd && timeUntilNextAd > 0) {
      const interval = setInterval(() => {
        setTimeUntilNextAd(prev => {
          if (prev && prev > 1) {
            return prev - 1;
          } else {
            // Cooldown terminou, verificar acesso novamente
            console.log('⏰ [FINANCIAL_GATE] Cooldown expirou, verificando acesso novamente');
            checkAccess();
            return null;
          }
        });
      }, 60000); // Atualizar a cada minuto

      return () => clearInterval(interval);
    }
  }, [timeUntilNextAd]);

  // Verificação periódica para detectar quando o acesso expira (sem interromper o usuário)
  useEffect(() => {
    if (hasAccess && user?.id) {
      const interval = setInterval(async () => {
        console.log('🔍 [FINANCIAL_GATE] Verificação silenciosa de acesso...');
        try {
          const canAccessResult = await AdCooldownManager.canPerformAction(user.id, 'financial_analysis');
          
          // Se perdeu o acesso mas está usando a análise, não interromper
          // Apenas registrar que precisará de novo anúncio na próxima vez que acessar
          if (!canAccessResult.allowed) {
            console.log('⏰ [FINANCIAL_GATE] Acesso expirou. Próximo acesso precisará de anúncio.');
            // Não remover hasAccess aqui para não interromper o usuário
            // A verificação será feita apenas quando ele sair e tentar entrar novamente
          }
        } catch (error) {
          console.error('❌ [FINANCIAL_GATE] Erro na verificação silenciosa:', error);
        }
      }, 5 * 60 * 1000); // Verificar a cada 5 minutos

      return () => clearInterval(interval);
    }
  }, [hasAccess, user?.id]);

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

  // Gate de acesso - usuário precisa assistir anúncio
  return (
    <div className="financial-analysis-page min-h-screen pb-20" style={{
      background: '#31518b',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header igual ao da página original */}
      <div 
        className="sticky top-0 z-50"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '12px 30px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          height: '60px'
        }}
      >
        <h1 
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: '"Fredoka One", "Comic Sans MS", "Poppins", sans-serif',
            letterSpacing: '1px',
            textShadow: '2px 2px 0px #3b82f6, 4px 4px 0px #1d4ed8, 0 0 20px rgba(59, 130, 246, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6)',
            textTransform: 'uppercase',
            position: 'relative',
            filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5))'
          }}
        >
          ANÁLISE FINANCEIRA
        </h1>
      </div>

      {/* Modal de acesso bloqueado */}
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
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
                Para acessar a análise financeira completa, assista a um anúncio recompensado.
              </p>
            </div>

            {/* Mostrar erro se houver */}
            {adError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{adError}</p>
              </div>
            )}

            {/* Mostrar cooldown se ativo */}
            {timeUntilNextAd && timeUntilNextAd > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  Próximo anúncio disponível em {timeUntilNextAd} minutos
                </p>
              </div>
            )}

            {/* Botão de assistir anúncio */}
            {(!timeUntilNextAd || timeUntilNextAd <= 0) && (
              <Button
                onClick={watchRewardedAd}
                disabled={isWatchingAd}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWatchingAd ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Carregando anúncio...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    <span>Assistir Anúncio para Acessar</span>
                  </div>
                )}
              </Button>
            )}

            {/* Informações sobre o sistema */}
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Análises personalizadas e insights</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Gráficos interativos avançados</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Recomendações inteligentes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialAnalysisGate;
