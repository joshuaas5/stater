import { useState } from 'react';
import { X, Crown, Check, Sparkles } from 'lucide-react';
import StripeCheckout from '@/components/StripeCheckout';
import { PlanType } from '@/lib/stripe';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 💎 Modal Premium com Stripe Checkout
 * 
 * Modal moderno para assinatura Premium do Stater.
 * Integra com componente StripeCheckout para pagamentos.
 */
export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');

  if (!isOpen) return null;

  const benefits = [
    'Transações ilimitadas',
    'Análise financeira com IA avançada',
    'Telegram Bot sem limites',
    'Relatórios personalizados',
    'OCR ilimitado de documentos',
    'Suporte prioritário 24/7',
    'Backup automático na nuvem',
    'Acesso antecipado a novos recursos',
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header com gradiente */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white rounded-t-3xl">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-16 h-16 text-yellow-300 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
            Desbloqueie o Poder Completo
          </h2>
          <p className="text-center text-blue-100 text-lg">
            Transforme sua gestão financeira com recursos Premium
          </p>
        </div>

        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
          {/* Lado Esquerdo: Benefícios */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h3 className="text-2xl font-bold">O que você ganha:</h3>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Aviso de Garantia */}
            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Garantia de 7 dias
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Cancele quando quiser. Reembolso total em até 7 dias sem perguntas.
              </p>
            </div>
          </div>

          {/* Lado Direito: Planos */}
          <div>
            {/* Seletor de Planos */}
            <div className="mb-6">
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    selectedPlan === 'monthly'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">Mensal</span>
                    {selectedPlan === 'monthly' && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    R$ 19,90
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    por mês
                  </div>
                </button>

                <button
                  onClick={() => setSelectedPlan('weekly')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    selectedPlan === 'weekly'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-lg mb-2">Semanal</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    R$ 8,90
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    por semana
                  </div>
                </button>
              </div>

              {/* Componente Stripe Checkout */}
              <StripeCheckout
                plan={selectedPlan}
                onSuccess={() => {
                  onClose();
                  alert('✅ Assinatura ativada com sucesso! Bem-vindo ao Premium!');
                }}
                onCancel={() => {
                  console.log('Checkout cancelado');
                }}
              />

              {/* Garantias */}
              <div className="mt-4 space-y-2 text-sm text-center text-gray-600 dark:text-gray-400">
                <p>✅ Cancele quando quiser</p>
                <p>✅ Garantia de 7 dias ou seu dinheiro de volta</p>
                <p>✅ Pagamento seguro via Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
