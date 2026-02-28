import React, { useState, useEffect } from 'react';
import { Clock, Receipt, CreditCard, Play, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdCooldownManager } from '@/utils/adCooldownManager';
import ContextualAdModal from './ContextualAdModal';

interface AdCooldownStatusProps {
  userId: string;
  onActionUnlocked?: (action: 'bills' | 'transactions', amount: number) => void;
  className?: string;
}

interface CooldownStats {
  bills: {
    freeActionsRemaining: number;
    adsWatchedToday: number;
    cooldownActive: boolean;
    minutesUntilNextAd?: number;
  };
  transactions: {
    freeActionsRemaining: number;
    adsWatchedToday: number;
    cooldownActive: boolean;
    minutesUntilNextAd?: number;
  };
}

export const AdCooldownStatus: React.FC<AdCooldownStatusProps> = ({
  userId,
  onActionUnlocked,
  className = ''
}) => {
  const [stats, setStats] = useState<CooldownStats | null>(null);
  const [showModal, setShowModal] = useState<{
    show: boolean;
    action: 'bills' | 'transactions';
  }>({ show: false, action: 'bills' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, [userId]);

  const loadStats = async () => {
    try {
      const cooldownStats = await AdCooldownManager.getCooldownStats(userId);
      setStats(cooldownStats);
    } catch (error) {
      console.error('Erro ao carregar stats de cooldown:', error);
    }
  };

  const handleWatchAd = async (action: 'bills' | 'transactions') => {
    try {
      setIsLoading(true);
      const result = await AdCooldownManager.watchAdForActions(userId, action);
      
      if (result.success) {
        await loadStats(); // Recarregar stats
        onActionUnlocked?.(action, result.actionsGranted);
        setShowModal({ show: false, action: 'bills' });
      }
    } catch (error) {
      console.error('Erro ao assistir anúncio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAdModal = (action: 'bills' | 'transactions') => {
    setShowModal({ show: true, action });
  };

  if (!stats) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  const actionConfig = {
    bills: {
      icon: <Receipt className="w-4 h-4" />,
      title: 'Contas',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      reward: 3
    },
    transactions: {
      icon: <CreditCard className="w-4 h-4" />,
      title: 'Transações',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      reward: 5
    }
  };

  return (
    <>
      <Card className={`p-4 bg-gradient-to-br from-gray-50 to-white ${className}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-800">Status de Ações</h3>
          </div>

          {/* Bills Status */}
          <div className={`p-3 rounded-lg border ${actionConfig.bills.borderColor} ${actionConfig.bills.bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {actionConfig.bills.icon}
                <span className="font-medium text-gray-800">Contas</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {stats.bills.freeActionsRemaining} restantes
              </Badge>
            </div>

            {stats.bills.freeActionsRemaining > 0 ? (
              <p className="text-sm text-gray-600">
                Você pode adicionar {stats.bills.freeActionsRemaining} contas gratuitamente
              </p>
            ) : stats.bills.cooldownActive ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Próximo anúncio em {stats.bills.minutesUntilNextAd} min
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Cooldown ativo</span>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => openAdModal('bills')}
                className={`w-full mt-2 bg-green-600 hover:bg-green-700 text-white`}
              >
                <Play className="w-3 h-3 mr-1" />
                Ver anúncio (+{actionConfig.bills.reward} contas)
              </Button>
            )}
          </div>

          {/* Transactions Status */}
          <div className={`p-3 rounded-lg border ${actionConfig.transactions.borderColor} ${actionConfig.transactions.bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {actionConfig.transactions.icon}
                <span className="font-medium text-gray-800">Transações</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {stats.transactions.freeActionsRemaining} restantes
              </Badge>
            </div>

            {stats.transactions.freeActionsRemaining > 0 ? (
              <p className="text-sm text-gray-600">
                Você pode adicionar {stats.transactions.freeActionsRemaining} transações gratuitamente
              </p>
            ) : stats.transactions.cooldownActive ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Próximo anúncio em {stats.transactions.minutesUntilNextAd} min
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Cooldown ativo</span>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => openAdModal('transactions')}
                className={`w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white`}
              >
                <Play className="w-3 h-3 mr-1" />
                Ver anúncio (+{actionConfig.transactions.reward} transações)
              </Button>
            )}
          </div>

          {/* Daily Summary */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Anúncios assistidos hoje: {stats.bills.adsWatchedToday + stats.transactions.adsWatchedToday}
          </div>
        </div>
      </Card>

      {/* Contextual Ad Modal */}
      <ContextualAdModal
        isOpen={showModal.show}
        onClose={() => setShowModal({ show: false, action: 'bills' })}
        onWatchAd={() => handleWatchAd(showModal.action)}
        action={showModal.action}
        actionsWillGrant={actionConfig[showModal.action].reward}
        cooldownMinutes={showModal.action === 'bills' ? 30 : 20}
        isLoading={isLoading}
      />
    </>
  );
};
