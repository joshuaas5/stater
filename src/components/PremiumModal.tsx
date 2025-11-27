import { useState } from 'react';
import { X, Crown, Check, Sparkles, CreditCard, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { STRIPE_PRICE_PRO, PRO_PRICE_BRL } from '@/lib/stripe';
import { Button } from '@/components/ui/button';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 💎 Modal PRO - Modelo Netflix
 * 
 * Modal simplificado para assinatura do Stater PRO.
 * Apenas 1 plano: R$ 14,90/mês
 */
export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (!isOpen) return null;

  const benefits = [
    '50 mensagens de IA por dia',
    'Análise de fotos e documentos (OCR)',
    'Leitura de PDFs e extratos bancários',
    'Bot do Telegram integrado',
    'Exportação de relatórios',
    'Transações ilimitadas',
    'Suporte prioritário',
  ];

  const handleSubscribe = async () => {
    if (!user) {
      alert('Você precisa estar logado para assinar o PRO');
      return;
    }

    setLoading(true);

    try {
      console.log('💳 Iniciando checkout Stripe PRO:', STRIPE_PRICE_PRO);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: STRIPE_PRICE_PRO,
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard?payment=canceled`,
        },
      });

      if (error) {
        console.error('❌ Erro ao criar sessão:', error);
        alert('Erro ao processar pagamento. Tente novamente.');
        return;
      }

      if (data?.url) {
        console.log('✅ Redirecionando para checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }

    } catch (err: any) {
      console.error('❌ Erro no checkout:', err);
      alert(`Erro ao processar pagamento: ${err.message || 'Tente novamente'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header com gradiente */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white rounded-t-3xl">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-16 h-16 text-yellow-200 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-center mb-2">
            Stater PRO
          </h2>
          <p className="text-center text-amber-100 text-lg">
            Desbloqueie todo o potencial da sua IA financeira
          </p>
        </div>

        <div className="p-6">
          {/* Preço */}
          <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl mb-6 border-2 border-amber-200 dark:border-amber-700">
            <div className="text-5xl font-bold text-amber-600 dark:text-amber-400">
              R$ {PRO_PRICE_BRL.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-lg text-amber-700 dark:text-amber-300 mt-1 font-medium">
              por mês
            </div>
            <div className="text-sm text-amber-600/70 dark:text-amber-400/70 mt-2">
              Cancele quando quiser
            </div>
          </div>

          {/* Benefícios */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold">O que está incluído:</h3>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Garantia */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700 dark:text-green-300">
                Garantia de 7 dias
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400">
              Reembolso total sem perguntas se não gostar.
            </p>
          </div>

          {/* Botão de Checkout */}
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            size="lg"
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/25"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Assinar PRO - R$ 14,90/mês
              </>
            )}
          </Button>

          {/* Rodapé */}
          <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-4">
            ✅ Pagamento seguro via Stripe • Cancele quando quiser
          </p>
        </div>
      </div>
    </div>
  );
}
