import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { STRIPE_PRICE_PRO, PRO_PRICE_BRL } from '@/lib/stripe';
import { 
  X, 
  Crown, 
  Sparkles, 
  MessageSquare, 
  Camera, 
  FileText, 
  Send, 
  Download,
  Shield,
  Zap,
  Check,
  Loader2,
  Star
} from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (planType: any) => void;
  trigger: 'messages' | 'bills' | 'transactions' | 'reports' | 'manual' | 'ocr' | 'pdf' | 'audio';
  userId: string;
}

export function PaywallModal({ isOpen, onClose, trigger, userId }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

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

  // Bloquear scroll do body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getTriggerInfo = () => {
    switch (trigger) {
      case 'messages':
        return {
          icon: <MessageSquare className="w-7 h-7" />,
          title: 'Limite de mensagens atingido',
          subtitle: 'Você usou suas 5 mensagens diárias gratuitas'
        };
      case 'ocr':
        return {
          icon: <Camera className="w-7 h-7" />,
          title: 'Recurso exclusivo PRO',
          subtitle: 'Análise de fotos e documentos'
        };
      case 'pdf':
        return {
          icon: <FileText className="w-7 h-7" />,
          title: 'Recurso exclusivo PRO',
          subtitle: 'Leitura de PDFs e extratos'
        };
      case 'audio':
        return {
          icon: <MessageSquare className="w-7 h-7" />,
          title: 'Recurso exclusivo PRO',
          subtitle: 'Análise de áudio e voz'
        };
      case 'reports':
        return {
          icon: <Download className="w-7 h-7" />,
          title: 'Recurso exclusivo PRO',
          subtitle: 'Exportação de relatórios'
        };
      default:
        return {
          icon: <Sparkles className="w-7 h-7" />,
          title: 'Desbloqueie o Stater PRO',
          subtitle: 'Potencialize sua gestão financeira'
        };
    }
  };

  const handleSubscribe = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      console.log('🛒 Iniciando checkout PRO:', STRIPE_PRICE_PRO);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: STRIPE_PRICE_PRO,
          userId: userId,
          userEmail: userEmail,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard?payment=canceled`
        }
      });

      if (error) {
        console.error('❌ Erro ao criar checkout:', error);
        alert('Erro ao processar pagamento. Tente novamente.');
        return;
      }

      if (data?.url) {
        console.log('✅ Redirecionando para checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
      
    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      alert('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const triggerInfo = getTriggerInfo();

  const features = [
    { icon: <MessageSquare className="w-5 h-5" />, text: '50 mensagens de IA por dia', highlight: true },
    { icon: <Camera className="w-5 h-5" />, text: 'Análise de fotos e documentos' },
    { icon: <FileText className="w-5 h-5" />, text: 'Leitura de PDFs e extratos' },
    { icon: <Send className="w-5 h-5" />, text: 'Bot do Telegram integrado' },
    { icon: <Download className="w-5 h-5" />, text: 'Exportação de relatórios' },
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
    >
      {/* Backdrop com blur */}
      <div 
        className="absolute inset-0 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        
        {/* Card principal com gradiente de borda */}
        <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-amber-400/50 via-amber-500/20 to-transparent">
          <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-[27px] overflow-hidden">
            
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl pointer-events-none" />
            
            {/* Estrelas decorativas */}
            <div className="absolute top-6 left-8 text-amber-400/30">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <div className="absolute top-12 right-12 text-amber-400/20">
              <Star className="w-2 h-2 fill-current" />
            </div>
            <div className="absolute top-20 left-16 text-amber-400/10">
              <Star className="w-2 h-2 fill-current" />
            </div>
            
            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>

            {/* Header */}
            <div className="relative pt-8 pb-6 px-6 text-center">
              {/* Badge PRO animado */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 mb-5 animate-pulse">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold tracking-wide text-amber-300">STATER PRO</span>
              </div>

              {/* Trigger icon com glow */}
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 blur-xl opacity-50" />
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-2xl">
                  {triggerInfo.icon}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                {triggerInfo.title}
              </h2>
              <p className="text-white/50 text-sm">
                {triggerInfo.subtitle}
              </p>
            </div>

            {/* Preço */}
            <div className="px-6 pb-5">
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg shadow-amber-500/30">
                    OFERTA ESPECIAL
                  </span>
                </div>
                
                <div className="flex items-baseline justify-center gap-1 mt-3">
                  <span className="text-lg text-white/50 font-medium">R$</span>
                  <span className="text-5xl font-extrabold text-white tracking-tight">19</span>
                  <span className="text-2xl font-bold text-white">,90</span>
                  <span className="text-white/50 ml-1">/mês</span>
                </div>
                
                <p className="text-center text-xs text-white/40 mt-3">
                  Sem fidelidade • Cancele quando quiser
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="px-6 pb-5">
              <div className="space-y-2.5">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                      feature.highlight 
                        ? 'bg-gradient-to-r from-emerald-500/15 to-green-500/10 border border-emerald-500/20' 
                        : 'bg-white/[0.03] border border-white/5'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      feature.highlight 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-white/5 text-white/50'
                    }`}>
                      {feature.icon}
                    </div>
                    <span className={`text-sm font-medium flex-1 ${
                      feature.highlight ? 'text-emerald-300' : 'text-white/70'
                    }`}>
                      {feature.text}
                    </span>
                    <Check className={`w-4 h-4 ${
                      feature.highlight ? 'text-emerald-400' : 'text-white/30'
                    }`} />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="px-6 pb-4">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="relative w-full py-4 px-6 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500" />
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
                
                {/* Shadow */}
                <div className="absolute inset-0 rounded-2xl shadow-lg shadow-amber-500/30" />
                
                {/* Content */}
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Desbloquear PRO Agora
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="px-6 pb-5">
              <div className="flex items-center justify-center gap-6 text-xs text-white/35">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Pagamento seguro</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>7 dias de garantia</span>
                </div>
              </div>
            </div>

            {/* Botão continuar grátis */}
            <div className="px-6 pb-8">
              <button
                onClick={onClose}
                className="w-full py-3 text-sm text-white/40 hover:text-white/60 transition-colors font-medium"
              >
                Continuar com plano gratuito →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para usar o PaywallModal
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
