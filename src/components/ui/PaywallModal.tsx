import React, { useState, useEffect } from 'react';
import { X, Crown, Star, Zap, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlanType, PlanFeatures, UserPlan } from '@/types';
import { UserPlanManager } from '@/utils/userPlanManager';
import { AdManager } from '@/utils/adManager';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planType: PlanType) => void;
  trigger: 'messages' | 'bills' | 'transactions' | 'reports' | 'manual';
  userId: string;
}

interface PlanOption {
  type: PlanType;
  name: string;
  price: string;
  period: string;
  discount?: string;
  badge?: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ComponentType<any>;
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
      price: 'R$ 15,90',
      period: '/mês',
      discount: '↓55% vs semanal',
      badge: 'POPULAR',
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
      discount: '↓65% vs mensal',
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
      // TODO: Integrar com Google Play Billing
      console.log(`🛒 Iniciando compra do plano: ${planType}`);
      
      // Simular processo de compra
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onUpgrade(planType);
      onClose();
    } catch (error) {
      console.error('Erro ao processar upgrade:', error);
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
                <strong>Plano atual:</strong> Gratuito • {currentPlan.trialDaysUsed}/3 dias explorados
              </p>
            </div>
          )}
        </DialogHeader>

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
