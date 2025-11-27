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
 * Price ID: price_1SXpCw2HBVUtKi5tQOUjW5py - R$ 14,90/mês
 */
export const STRIPE_PRICE_PRO = 'price_1SXpCw2HBVUtKi5tQOUjW5py';

/**
 * Preço em reais (para display)
 */
export const PRO_PRICE_BRL = 14.90;

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
