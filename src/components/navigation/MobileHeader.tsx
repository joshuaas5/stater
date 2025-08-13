import React, { useState } from 'react';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MobileMenu from './MobileMenu';
import FloatingActionButton from '@/components/ui/floating-action-button';
import QuickAddTransaction from '@/components/transactions/QuickAddTransaction';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { TransactionCounter } from '@/utils/transactionCounter';
import { UserPlanManager } from '@/utils/userPlanManager';
import { AdManager } from '@/utils/adManager';
import { PlanType } from '@/types';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title = 'Stater',
  showBackButton = false,
  className
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleQuickAddSubmit = async (transaction: any) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Converter tipo de transação para o formato do banco
      const transactionData = {
        user_id: user.id,
        title: transaction.description,
        amount: parseFloat(transaction.amount),
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        is_recurring: false,
        recurrence_frequency: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (error) {
        console.error('Erro ao salvar transação:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a transação",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: `${transaction.type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso`,
        variant: "default"
      });

      // Disparar evento customizado para atualizar outras partes da aplicação
      window.dispatchEvent(new CustomEvent('transactionsUpdated'));
      
      // 🎯 SISTEMA DE CONTADOR DE TRANSAÇÕES - Verificar se deve mostrar anúncio após 5ª transação
      try {
        // Verificar se o usuário é premium
        const userPlan = await UserPlanManager.getUserPlan(user.id);
        const isPremium = userPlan.planType !== PlanType.FREE;
        
        console.log(`📊 [QUICK_ADD_REWARD] Plano do usuário: ${userPlan.planType}, isPremium: ${isPremium}`);
        
        if (!isPremium) {
          // Incrementar contador e verificar se deve mostrar reward ad
          const counterResult = await TransactionCounter.incrementAndCheck(user.id);
          
          console.log(`📊 [QUICK_ADD_COUNTER] Contador atual: ${counterResult.currentCount}, deve mostrar ad: ${counterResult.shouldShowRewardAd}`);
          
          if (counterResult.shouldShowRewardAd) {
            console.log('🎬 [QUICK_ADD_REWARD] Mostrando reward ad após 5 transações');
            
            // Mostrar reward ad específico para transações
            const adResult = await AdManager.showRewardedAd('transactions');
            
            if (adResult.success) {
              console.log('✅ [QUICK_ADD_REWARD] Reward ad assistido com sucesso');
              toast({
                title: '🎁 Recompensa obtida!',
                description: 'Você ganhou mais transações por assistir o anúncio!',
              });
            } else {
              console.log('❌ [QUICK_ADD_REWARD] Reward ad não assistido');
            }
          } else {
            console.log(`📊 [QUICK_ADD_COUNTER] ${counterResult.nextRewardAt} transações restantes para próximo reward ad`);
          }
        }
      } catch (error) {
        console.error('❌ [QUICK_ADD_REWARD] Erro ao processar contador:', error);
      }
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar transação",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {/* Header Principal */}
      <header className={cn(
        "sticky top-0 z-40 bg-white border-b border-gray-200",
        "px-4 py-3 shadow-sm",
        className
      )}>
        <div className="flex items-center justify-between">
          {/* Menu + Título */}
          <div className="flex items-center gap-3">
            <MobileMenu />
            <div>
              <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">
                {title}
              </h1>
              {user && (
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  Olá, {user.user_metadata?.name || user.email?.split('@')[0]}
                </p>
              )}
            </div>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-2">
            {/* Notificações */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 relative"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {/* Badge de notificações pendentes */}
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                3
              </Badge>
              <span className="sr-only">Notificações</span>
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => navigate('/profile')}
            >
              <User className="h-5 w-5 text-gray-600" />
              <span className="sr-only">Perfil</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => setShowQuickAdd(true)}
      />

      {/* Modal de Adição Rápida */}
      <QuickAddTransaction
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSubmit={handleQuickAddSubmit}
      />
    </>
  );
};

export default MobileHeader;
