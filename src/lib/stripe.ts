import { loadStripe, Stripe } from '@stripe/stripe-js';

/**
 * 💳 Stripe Configuration
 * 
 * Configuração do Stripe para pagamentos do Stater Premium.
 * Suporta planos Semanal (R$ 8,90) e Mensal (R$ 19,90).
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
 * IDs dos preços configurados no Stripe Dashboard
 * 
 * Configure estes em .env.local:
 * VITE_STRIPE_PRICE_WEEKLY=price_stater_weekly_890
 * VITE_STRIPE_PRICE_MONTHLY=price_stater_monthly_1990
 */
export const STRIPE_PRICES = {
  weekly: import.meta.env.VITE_STRIPE_PRICE_WEEKLY || '',
  monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
} as const;

/**
 * Preços em reais (para display)
 */
export const PRICES_BRL = {
  weekly: 8.90,
  monthly: 19.90,
} as const;

/**
 * Descrições dos planos
 */
export const PLAN_DESCRIPTIONS = {
  weekly: 'Plano Semanal - R$ 8,90/semana',
  monthly: 'Plano Mensal - R$ 19,90/mês (MELHOR OFERTA)',
} as const;

export type PlanType = 'weekly' | 'monthly';
