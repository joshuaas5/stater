// Lazy import do Stripe - só carrega quando necessário
import type { Stripe } from '@stripe/stripe-js';

/**
 * 💳 Stripe Configuration - MODELO NETFLIX
 * 
 * Configuração do Stripe para pagamentos do Stater.
 * Apenas 1 plano: PRO por R$ 14,90/mês
 */

let stripePromise: Promise<Stripe | null>;

/**
 * Obtém instância do Stripe (singleton com LAZY LOAD)
 * Só carrega o SDK quando realmente necessário
 */
export const getStripe = async () => {
  if (!stripePromise) {
    const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    
    if (!publicKey) {
      console.error('❌ VITE_STRIPE_PUBLIC_KEY não configurada!');
      return null;
    }

    // Lazy load do Stripe SDK - só carrega quando necessário
    const { loadStripe } = await import('@stripe/stripe-js');
    stripePromise = loadStripe(publicKey);
  }
  
  return stripePromise;
};

/**
 * ID do preço PRO configurado no Stripe Dashboard (Produção)
 * Produto: Stater PRO (prod_TUoqCgIUQyn5Oi)
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
