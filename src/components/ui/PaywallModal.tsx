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
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, X, Zap, Brain, FileText, MessageSquare } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planType: PlanType) => void;
  trigger: 'messages' | 'bills' | 'transactions' | 'reports' | 'manual' | 'ocr' | 'pdf' | 'audio';
  userId: string;
}

// Preço do plano PRO
const PRO_PRICE = 'R$ 14,90';
const PRO_PRICE_ID = 'price_1SXpCw2HBVUtKi5tQOUjW5py'; // Stripe Price ID - Produção

export function PaywallModal({ isOpen, onClose, onUpgrade, trigger, userId }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  // Carregar email do usuário
  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error('Erro ao carregar email:', error);
      }
    };

    if (isOpen) {
      loadUserEmail();
    }
  }, [isOpen]);

  // Mensagem contextual baseada no trigger
  const getTriggerMessage = () => {
    switch (trigger) {
      case 'messages':
        return 'Você atingiu o limite de 5 mensagens diárias';
      case 'ocr':
        return 'Análise de fotos/documentos é exclusiva do PRO';
      case 'pdf':
        return 'Leitura de PDFs é exclusiva do PRO';
      case 'audio':
        return 'Análise de áudio é exclusiva do PRO';
      case 'reports':
        return 'Exportação de relatórios é exclusiva do PRO';
      default:
        return 'Desbloqueie todo o potencial do Stater';
    }
  };

  const handleSubscribe = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      console.log('🛒 [SUBSCRIPTION] Iniciando checkout Stripe PRO');

      // Chamar Edge Function do Supabase para criar checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: PRO_PRICE_ID,
          userId: userId,
          userEmail: userEmail,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard?payment=canceled`
        }
      });

      if (error) {
        console.error('❌ [STRIPE] Erro ao criar checkout:', error);
        alert('Erro ao processar pagamento. Tente novamente.');
        return;
      }

      if (data?.url) {
        // Redirecionar para checkout do Stripe
        console.log('✅ [STRIPE] Redirecionando para checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
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
        className="sm:max-w-md p-0 border-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden"
      >
        <VisuallyHidden>
          <DialogTitle>Stater PRO</DialogTitle>
          <DialogDescription>
            Assine o Stater PRO e desbloqueie todos os recursos
          </DialogDescription>
        </VisuallyHidden>
        
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Stater PRO</h2>
              <p className="text-white/60 text-sm">Sua IA financeira completa</p>
            </div>
          </div>
          
          {/* Trigger message */}
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <p className="text-amber-300 text-sm font-medium">
              ⚠️ {getTriggerMessage()}
            </p>
          </div>
        </div>
        
        {/* Features */}
        <div className="px-6 pb-4">
          <p className="text-white/80 text-sm mb-4">Com o PRO você desbloqueia:</p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white">
              <div className="p-1.5 rounded-lg bg-green-500/20">
                <MessageSquare className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-sm">50 mensagens de IA por dia</span>
            </div>
            
            <div className="flex items-center gap-3 text-white">
              <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Brain className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm">Análise de fotos e documentos (OCR)</span>
            </div>
            
            <div className="flex items-center gap-3 text-white">
              <div className="p-1.5 rounded-lg bg-purple-500/20">
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm">Leitura de PDFs e extratos</span>
            </div>
            
            <div className="flex items-center gap-3 text-white">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-sm">Bot do Telegram integrado</span>
            </div>
            
            <div className="flex items-center gap-3 text-white">
              <div className="p-1.5 rounded-lg bg-emerald-500/20">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm">Exportação de relatórios</span>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="p-6 pt-4 bg-black/20">
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/25"
          >
            {loading ? (
              'Processando...'
            ) : (
              <>
                Assinar PRO por {PRO_PRICE}/mês
              </>
            )}
          </Button>
          
          <p className="text-center text-white/40 text-xs mt-3">
            Cancele quando quiser • Pagamento seguro via Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook para usar o PaywallModal facilmente
export function usePaywallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<'messages' | 'bills' | 'transactions' | 'reports' | 'manual' | 'ocr' | 'pdf' | 'audio'>('manual');

  const openPaywall = (triggerType: 'messages' | 'bills' | 'transactions' | 'reports' | 'manual' | 'ocr' | 'pdf' | 'audio') => {
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
