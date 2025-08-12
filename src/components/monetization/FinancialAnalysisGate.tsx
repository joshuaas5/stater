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
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [timeUntilNextAd, setTimeUntilNextAd] = useState<number | null>(null);

  // Verificar acesso do usuário
  const checkAccess = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const canAccessResult = await AdCooldownManager.canPerformAction(user.id, 'financial_analysis');
      setHasAccess(canAccessResult.allowed);

      if (!canAccessResult.allowed) {
        // Verificar se há cooldown ativo
        const stats = await AdCooldownManager.getCooldownStats(user.id);
        const financialStats = stats.financial_analysis;
        
        if (financialStats.cooldownActive && financialStats.minutesUntilNextAd) {
          setTimeUntilNextAd(financialStats.minutesUntilNextAd);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
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
        setHasAccess(true);
        setTimeUntilNextAd(null);
      } else {
        setAdError(result.message || 'Erro ao assistir anúncio');
      }
    } catch (error) {
      console.error('Erro ao assistir anúncio:', error);
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
                Conteúdo Premium
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Para acessar a análise financeira completa, assista a um anúncio recompensado. 
                Você terá acesso por <strong>1 hora</strong> completa!
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
                    <span>Assistir Anúncio (1h de acesso)</span>
                  </div>
                )}
              </Button>
            )}

            {/* Informações sobre o sistema */}
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Acesso por 1 hora completa</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Análises personalizadas e insights</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Gráficos interativos avançados</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialAnalysisGate;
