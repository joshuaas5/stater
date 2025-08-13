import React, { useState, useEffect } from 'react';
import { X, Crown, Star, Zap, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { PlanType, PlanFeatures, UserPlan } from '@/types';
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

  const planOptions: PlanOption[] = [
    {
      type: PlanType.WEEKLY,
      name: 'Semanal',
      price: 'R$ 8,90',
      period: '/semana',
      features: [
        'Contas ilimitadas',
        'Transações ilimitadas',
        'Mensagens Telegram ilimitadas',
        'Relatórios sem limite',
        'Sem anúncios',
        'Suporte prioritário'
      ],
      icon: Zap
    },
    {
      type: PlanType.MONTHLY,
      name: 'Mensal',
      price: 'R$ 19,90',
      period: '/mês',
      discount: '↓48% vs semanal',
      badge: 'MAIS POPULAR',
      features: [
        'Tudo do plano semanal',
        'Análises avançadas',
        'Backup automático',
        'Categorias personalizadas',
        'Relatórios personalizados',
        'Dashboard premium'
      ],
      highlighted: true,
      icon: Star
    },
    {
      type: PlanType.PRO,
      name: 'Anual PRO',
      price: 'R$ 29,90',
      period: '/mês',
      discount: '↓20% vs mensal',
      badge: 'MELHOR VALOR',
      features: [
        'Tudo do plano mensal',
        'OCR avançado (PDF/imagens)',
        'Inteligência artificial',
        'Previsões financeiras',
        'Consultoria por Telegram',
        'Acesso antecipado'
      ],
      highlighted: false,
      icon: Crown
    }
  ];

  const getTriggerMessage = () => {
    if (hasReachedPaywall) {
      return {
        title: '🚀 Desbloqueie todo o potencial do ICTUS',
        subtitle: 'Você explorou nossa versão gratuita. Agora é hora de voar mais alto!'
      };
    }

    switch (trigger) {
      case 'messages':
        return {
          title: '📱 Quer mais mensagens Telegram?',
          subtitle: 'Desbloqueie mensagens ilimitadas e muito mais!'
        };
      case 'bills':
        return {
          title: '📄 Adicionar mais contas?',
          subtitle: 'Upgrade para contas ilimitadas sem anúncios!'
        };
      case 'transactions':
        return {
          title: '💰 Quer mais transações?',
          subtitle: 'Desbloqueie controle financeiro total!'
        };
      case 'reports':
        return {
          title: '📊 Relatórios ilimitados?',
          subtitle: 'Acesse análises avançadas e insights únicos!'
        };
      default:
        return {
          title: '⭐ Upgrade para Premium',
          subtitle: 'Desbloqueie todos os recursos do ICTUS!'
        };
    }
  };

  const handleUpgrade = async (planType: PlanType) => {
    setLoading(true);
    try {
      console.log(`🛒 Iniciando compra do plano: ${planType}`);
      
      // Verificar se não é plano FREE (que não tem produto na loja)
      if (planType === PlanType.FREE) {
        throw new Error('Plano gratuito não pode ser comprado');
      }

      // Obter productId do Google Play Store
      const productInfo = PLAY_STORE_PRODUCTS[planType];
      if (!productInfo) {
        throw new Error(`Produto não encontrado para o plano: ${planType}`);
      }

      // Inicializar Google Play Billing se necessário
      const isInitialized = await GooglePlayBilling.initialize();
      if (!isInitialized) {
        console.warn('⚠️ Google Play Billing não inicializado, usando método legacy');
        onUpgrade(planType);
        onClose();
        return;
      }

      // Processar compra através do Google Play Billing
      const purchaseResult = await GooglePlayBilling.purchaseSubscription(
        productInfo.productId, 
        userId
      );

      if (purchaseResult.success && purchaseResult.purchaseData) {
        console.log('✅ Compra realizada com sucesso:', purchaseResult.purchaseData);

        // Fazer acknowledgment da compra (obrigatório)
        await GooglePlayBilling.acknowledgePurchase(purchaseResult.purchaseData.purchaseToken);

        // Ativar o plano no sistema interno com dados da compra
        await UserPlanManager.activatePlan(
          userId,
          planType,
          purchaseResult.purchaseData.purchaseToken,
          purchaseResult.purchaseData.productId
        );

        console.log(`🎉 Plano ${planType} ativado com sucesso!`);
        onUpgrade(planType);
        onClose();
      } else {
        throw new Error(purchaseResult.error || 'Erro na compra');
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar upgrade:', error);
      
      // Mostrar erro amigável para o usuário
      if (error instanceof Error) {
        if (error.message.includes('cancelada')) {
          console.log('ℹ️ Compra cancelada pelo usuário');
        } else {
          alert(`Erro na compra: ${error.message}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    try {
      console.log('🔄 Restaurando compras...');
      
      const isInitialized = await GooglePlayBilling.initialize();
      if (!isInitialized) {
        alert('Google Play Billing não disponível');
        return;
      }

      const subscriptions = await GooglePlayBilling.restorePurchases();
      
      if (subscriptions.length === 0) {
        alert('Nenhuma compra encontrada');
        return;
      }

      // Processar cada assinatura ativa
      for (const subscription of subscriptions) {
        // Verificar se ainda está ativa
        if (subscription.expiryTimeMillis > Date.now() && subscription.paymentState === 1) {
          // Encontrar o tipo de plano baseado no productId
          const planType = Object.entries(PLAY_STORE_PRODUCTS).find(
            ([_, product]) => product.productId === subscription.productId
          )?.[0] as PlanType;

          if (planType) {
            await UserPlanManager.activatePlan(
              userId,
              planType,
              subscription.purchaseToken,
              subscription.productId
            );
            
            console.log(`✅ Plano ${planType} restaurado com sucesso!`);
            onUpgrade(planType);
            onClose();
            return;
          }
        }
      }

      alert('Nenhuma assinatura ativa encontrada');
      
    } catch (error) {
      console.error('❌ Erro ao restaurar compras:', error);
      alert('Erro ao restaurar compras');
    } finally {
      setLoading(false);
    }
  };

  const message = getTriggerMessage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
        <DialogHeader className="text-center space-y-4 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {message.title}
          </DialogTitle>
          <p className="text-gray-600 text-lg">
            {message.subtitle}
          </p>
          
          {currentPlan?.planType === PlanType.FREE && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                <strong>Plano atual:</strong> Gratuito
              </p>
            </div>
          )}
        </DialogHeader>

        {/* 🎁 DESTAQUE TESTE GRÁTIS DE 3 DIAS */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              🎁 Teste GRÁTIS por 3 dias!
            </h3>
            <p className="text-blue-700 text-sm">
              Experimente todos os recursos premium sem pagar nada. Cancele quando quiser.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {planOptions.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.type}
                className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${
                  plan.highlighted
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.badge && (
                  <Badge
                    className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${
                      plan.highlighted
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    {plan.badge}
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    plan.highlighted ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600">
                      {plan.period}
                    </span>
                  </div>
                  
                  {plan.discount && (
                    <p className="text-green-600 font-medium text-sm">
                      {plan.discount}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.type)}
                  disabled={loading}
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {loading ? 'Processando...' : 'Escolher Plano'}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              ✅ <strong>Garantia:</strong> 7 dias para cancelar e receber 100% do valor de volta
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span>🔒 Pagamento seguro via Google Play</span>
            <span>📱 Cancele quando quiser</span>
            <span>🎯 Sem taxas escondidas</span>
          </div>

          {/* Botão Restaurar Compras */}
          <Button
            variant="outline"
            onClick={handleRestorePurchases}
            disabled={loading}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            {loading ? 'Verificando...' : '🔄 Restaurar Compras'}
          </Button>

          {!hasReachedPaywall && (
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              Continuar com plano gratuito
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook para usar o PaywallModal facilmente
export function usePaywallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<PaywallModalProps['trigger']>('manual');

  const openPaywall = (triggerType: PaywallModalProps['trigger']) => {
    setTrigger(triggerType);
    setIsOpen(true);
  };

  const closePaywall = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    trigger,
    openPaywall,
    closePaywall
  };
}
