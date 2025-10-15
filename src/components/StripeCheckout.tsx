import { useState } from 'react';
import { getStripe, STRIPE_PRICES, PlanType, PLAN_DESCRIPTIONS, PRICES_BRL } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, CreditCard, Shield, Zap } from 'lucide-react';

interface StripeCheckoutProps {
  plan: PlanType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * 💳 Componente de Checkout Stripe
 * 
 * Processa pagamentos recorrentes para planos Premium do Stater.
 * Integra com Stripe Checkout e Edge Functions do Supabase.
 */
export default function StripeCheckout({ plan, onSuccess, onCancel }: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      alert('Você precisa estar logado para assinar o Premium');
      return;
    }

    if (!STRIPE_PRICES[plan]) {
      alert('Erro: Preço não configurado. Configure as variáveis de ambiente.');
      return;
    }

    setLoading(true);

    try {
      console.log('💳 Iniciando checkout Stripe:', { plan, priceId: STRIPE_PRICES[plan] });

      // 1. Criar Checkout Session via Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: STRIPE_PRICES[plan],
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/dashboard?payment=canceled`,
        },
      });

      if (error) {
        console.error('❌ Erro ao criar sessão:', error);
        throw error;
      }

      if (!data?.url) {
        throw new Error('URL de checkout não retornada pela API');
      }

      console.log('✅ Sessão criada:', data.sessionId);

      // 2. Redirecionar para Stripe Checkout (API moderna)
      console.log('🔄 Redirecionando para:', data.url);
      window.location.href = data.url;

    } catch (err: any) {
      console.error('❌ Erro no checkout:', err);
      alert(`Erro ao processar pagamento: ${err.message || 'Tente novamente'}`);
      if (onCancel) onCancel();
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Transações ilimitadas',
    'Análise financeira com IA',
    'Telegram Bot sem limites',
    'Relatórios avançados',
    'Suporte prioritário',
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {plan === 'monthly' && '💎 '}
          Stater Premium {plan === 'monthly' && '- MELHOR OFERTA'}
        </CardTitle>
        <CardDescription className="text-center">
          {PLAN_DESCRIPTIONS[plan]}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preço */}
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <div className="text-4xl font-bold text-blue-900">
            R$ {PRICES_BRL[plan].toFixed(2)}
          </div>
          <div className="text-sm text-blue-600 mt-1">
            por {plan === 'weekly' ? 'semana' : 'mês'}
          </div>
        </div>

        {/* Benefícios */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            O que está incluído:
          </h3>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Garantias */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
            <Shield className="w-5 h-5" />
            Garantia de 7 dias
          </div>
          <p className="text-sm text-green-700">
            Cancele quando quiser. Reembolso total em até 7 dias sem perguntas.
          </p>
        </div>

        {/* Botão de Checkout */}
        <Button
          onClick={handleCheckout}
          disabled={loading}
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Assinar Agora
            </>
          )}
        </Button>

        {/* Informações adicionais */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>✅ Pagamento 100% seguro via Stripe</p>
          <p>✅ Cancele quando quiser, sem burocracia</p>
        </div>
      </CardContent>
    </Card>
  );
}
