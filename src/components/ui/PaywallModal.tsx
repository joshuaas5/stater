import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { PlanType, UserPlan } from '@/types';
import { UserPlanManager } from '@/utils/userPlanManager';
import { AdManager } from '@/utils/adManager';
import { GooglePlayBilling, PLAY_STORE_PRODUCTS } from '@/utils/googlePlayBilling';
import StaterPaywall from './StaterPaywall';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planType: PlanType) => void;
  trigger: 'messages' | 'bills' | 'transactions' | 'reports' | 'manual';
  userId: string;
}

export function PaywallModal({ isOpen, onClose, onUpgrade, trigger, userId }: PaywallModalProps) {
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasReachedPaywall, setHasReachedPaywall] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const plan = await UserPlanManager.getUserPlan(userId);
        setCurrentPlan(plan);
        
        const paywall = await AdManager.hasReachedPaywall(userId);
        setHasReachedPaywall(paywall);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    if (isOpen && userId) {
      loadUserData();
    }
  }, [isOpen, userId]);

  const handleSubscribe = async (plan: 'weekly' | 'monthly' | 'trial') => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      let planType: PlanType;
      let productId: string;
      
      switch (plan) {
        case 'weekly':
          planType = PlanType.WEEKLY;
          productId = PLAY_STORE_PRODUCTS.weekly.productId;
          break;
        case 'monthly':
          planType = PlanType.MONTHLY;
          productId = PLAY_STORE_PRODUCTS.monthly.productId;
          break;
        case 'trial':
          // Por enquanto, mapear trial para monthly (versão gratuita por tempo limitado)
          console.log('🎁 [TRIAL] Iniciando período de teste');
          planType = PlanType.MONTHLY;
          productId = PLAY_STORE_PRODUCTS.monthly.productId;
          break;
        default:
          planType = PlanType.MONTHLY;
          productId = PLAY_STORE_PRODUCTS.monthly.productId;
      }

      console.log(`🛒 [SUBSCRIPTION] Iniciando assinatura: ${plan} (${planType})`);

      // Verificar se está em ambiente mobile para usar Google Play Billing
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Usar Google Play Billing em dispositivos móveis
        const result = await GooglePlayBilling.purchaseSubscription(productId, userId);
        
        if (result.success) {
          console.log('✅ [SUBSCRIPTION] Compra realizada com sucesso via Google Play');
          
          // Ativar plano do usuário
          const trialDays = plan === 'trial' ? 3 : undefined;
          await UserPlanManager.activatePlan(userId, planType, result.purchaseData?.purchaseToken, productId, trialDays);
          
          // Chamar callback de upgrade
          onUpgrade(planType);
          
          // Fechar modal
          onClose();
        } else {
          console.error('❌ [SUBSCRIPTION] Erro na compra:', result.error);
          alert('Erro ao processar pagamento. Tente novamente.');
        }
      } else {
        // Em ambiente web/desktop, simular sucesso para desenvolvimento
        console.log('🌐 [SUBSCRIPTION] Ambiente web - simulando assinatura para desenvolvimento');
        
        // Ativar plano do usuário
        const trialDays = plan === 'trial' ? 3 : undefined;
        await UserPlanManager.activatePlan(userId, planType, `mock_token_${Date.now()}`, productId, trialDays);
        
        // Chamar callback de upgrade
        onUpgrade(planType);
        
        // Fechar modal
        onClose();
      }
      
    } catch (error) {
      console.error('❌ [SUBSCRIPTION] Erro ao processar assinatura:', error);
      alert('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="p-0 border-0 bg-transparent max-w-none w-full h-full overflow-hidden"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          maxHeight: 'none',
          transform: 'none',
          zIndex: 2147483647
        }}
      >
        <VisuallyHidden>
          <DialogTitle>Stater Premium</DialogTitle>
          <DialogDescription>
            Faça upgrade para o Stater Premium e desbloqueie todos os recursos
          </DialogDescription>
        </VisuallyHidden>
        <div className="w-full h-full overflow-y-auto">
          <StaterPaywall 
            onClose={onClose}
            onSubscribe={handleSubscribe}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook para usar o PaywallModal facilmente
export function usePaywallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<'messages' | 'bills' | 'transactions' | 'reports' | 'manual'>('manual');

  const openPaywall = (triggerType: 'messages' | 'bills' | 'transactions' | 'reports' | 'manual') => {
    setTrigger(triggerType);
    setIsOpen(true);
  };

  const closePaywall = () => {
    setIsOpen(false);
  };

  return {
    isPaywallOpen: isOpen,
    openPaywall,
    closePaywall,
    trigger
  };
}
