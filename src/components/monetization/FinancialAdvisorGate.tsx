// src/components/monetization/FinancialAdvisorGate.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdCooldownManager } from '@/utils/adCooldownManager';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface FinancialAdvisorGateProps {
  children: React.ReactNode;
}

const FinancialAdvisorGate: React.FC<FinancialAdvisorGateProps> = ({ children }) => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [timeUntilNextAd, setTimeUntilNextAd] = useState<number | null>(null);

  // Verificar acesso do usuário
  const checkAccess = async () => {
    if (!user?.id) {
      console.log('🤖 [ADVISOR_GATE] Usuário não autenticado');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🤖 [ADVISOR_GATE] Verificando acesso para usuário:', user.id);
      
      // Para o advisor, vamos usar um sistema diferente - baseado em mensagens restantes
      // Por enquanto, vamos simular que sempre tem acesso inicial
      setHasAccess(true);
    } catch (error) {
      console.error('🤖 [ADVISOR_GATE] Erro ao verificar acesso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar acesso inicial
  useEffect(() => {
    checkAccess();
  }, [user?.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-white/30 dark:border-gray-700/30 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Carregando assistente...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se o usuário tem acesso, mostrar o conteúdo
  return <>{children}</>;
};

export default FinancialAdvisorGate;
