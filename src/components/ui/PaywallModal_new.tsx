import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
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
          // Verificar se o usuário já usou o trial
          const hasUsedTrial = await UserPlanManager.hasUsedTrial(userId);
          if (hasUsedTrial) {
            console.log('❌ [TRIAL] Usuário já usou o período de teste');
            alert('Você já utilizou o período de teste gratuito. Escolha um plano para continuar.');
            setLoading(false);
            return;
          }
          
          planType = PlanType.TRIAL;
          productId = PLAY_STORE_PRODUCTS.trial?.productId || PLAY_STORE_PRODUCTS.monthly.productId;
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
        const result = await GooglePlayBilling.purchaseProduct(productId);
        
        if (result.success) {
          console.log('✅ [SUBSCRIPTION] Compra realizada com sucesso via Google Play');
          
          // Atualizar plano do usuário
          await UserPlanManager.updateUserPlan(userId, planType);
          
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
        
        // Atualizar plano do usuário
        await UserPlanManager.updateUserPlan(userId, planType);
        
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
      <DialogContent className="p-0 border-0 bg-transparent max-w-none w-full h-full">
        <StaterPaywall 
          onClose={onClose}
          onSubscribe={handleSubscribe}
        />
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
