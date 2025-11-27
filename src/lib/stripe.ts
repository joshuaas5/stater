import { loadStripe, Stripe } from '@stripe/stripe-js';

/**
 * 💳 Stripe Configuration - MODELO NETFLIX
 * 
 * Configuração do Stripe para pagamentos do Stater.
 * Apenas 1 plano: PRO por R$ 14,90/mês
 */

let stripePromise: Promise<Stripe | null>;

/**
 * Obtém instância do Stripe (singleton)
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    
    if (!publicKey) {
      console.error('❌ VITE_STRIPE_PUBLIC_KEY não configurada!');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publicKey);
  }
  
  return stripePromise;
};

/**
 * ID do preço PRO configurado no Stripe Dashboard (Produção)
 * 
 * ATENÇÃO: O preço de R$ 14,90 precisa ser criado no Stripe Dashboard!
 * Por enquanto usando o mensal de R$ 19,90 que já existe.
 * 
 * Para criar o preço de R$ 14,90:
 * 1. Acesse https://dashboard.stripe.com/products
 * 2. Crie um produto "Stater PRO" 
 * 3. Adicione um preço de R$ 14,90/mês recorrente
 * 4. Copie o Price ID (price_xxx) e substitua abaixo
 * 
 * Price ID atual (Mensal R$ 19,90): price_1SIZz12HBVUtKi5tFtu75oX4
 */
export const STRIPE_PRICE_PRO = 'price_1SIZz12HBVUtKi5tFtu75oX4';

/**
 * Preço em reais (para display) - ATUALIZAR quando criar preço de R$ 14,90
 */
export const PRO_PRICE_BRL = 19.90; // Temporário até criar preço de 14,90

/**
 * Descrição do plano
 */
export const PRO_DESCRIPTION = 'Stater PRO - R$ 14,90/mês';

// Mantendo tipos antigos para compatibilidade (deprecated)
export type PlanType = 'monthly';
export const STRIPE_PRICES = {
  monthly: STRIPE_PRICE_PRO,
} as const;
export const PRICES_BRL = {
  monthly: PRO_PRICE_BRL,
} as const;
export const PLAN_DESCRIPTIONS = {
  monthly: PRO_DESCRIPTION,
} as const;
