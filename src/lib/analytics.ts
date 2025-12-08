/**
 * 📊 Analytics & Real-time Monitoring
 * 
 * Sistema PRÓPRIO de rastreamento em tempo real via Supabase
 * - 100% preciso (não é bloqueado por adblockers)
 * - Tempo real instantâneo
 * - Grátis e ilimitado
 * - Dashboard SQL: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/editor
 */

import { supabase } from '@/lib/supabase';

// Declarar gtag global (fallback para GA se configurado)
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Detectar tipo de device
const getDeviceType = (): 'mobile' | 'desktop' | 'tablet' => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * Inicializar Analytics
 */
export const initGA = async (measurementId?: string) => {
  // Google Analytics como fallback (se configurado)
  const GA_ID = measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (GA_ID && typeof window.gtag === 'function') {
    console.log('✅ Google Analytics inicializado:', GA_ID);
  }
  
  console.log('✅ Supabase Analytics inicializado (100% preciso, tempo real)');
};

/**
 * Rastrear visualização de página no Supabase
 */
export const trackPageView = async (path?: string) => {
  const pagePath = path || window.location.pathname + window.location.search;
  
  try {
    // 1. Salvar no Supabase (100% preciso, não é bloqueado)
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('analytics_pageviews').insert({
      user_id: user?.id || null,
      path: pagePath,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      device: getDeviceType(),
      created_at: new Date().toISOString()
    });
    
    console.log('📊 Page view tracked (Supabase):', pagePath);
    
    // 2. Google Analytics como fallback (se disponível)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: document.title,
        page_location: window.location.href
      });
    }
  } catch (error) {
    console.error('❌ Erro ao rastrear pageview:', error);
  }
};

/**
 * Rastrear eventos customizados no Supabase
 */
export const trackEvent = async (
  eventName: string,
  params?: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: any;
  }
) => {
  try {
    // 1. Salvar no Supabase
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      event_name: eventName,
      event_category: params?.category || 'General',
      event_label: params?.label,
      event_value: params?.value,
      metadata: params,
      created_at: new Date().toISOString()
    });
    
    console.log('📊 Event tracked (Supabase):', eventName, params);
    
    // 2. Google Analytics como fallback (se disponível)
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        event_category: params?.category || 'General',
        event_label: params?.label,
        value: params?.value,
        ...params
      });
    }
  } catch (error) {
    console.error('❌ Erro ao rastrear evento:', error);
  }
};

/**
 * Eventos específicos do Stater
 */
export const analytics = {
  // Autenticação
  signUp: () => trackEvent('sign_up', { category: 'Auth', label: 'New User' }),
  login: () => trackEvent('login', { category: 'Auth', label: 'User Login' }),
  
  // Funcionalidades
  addTransaction: (type: 'income' | 'expense', amount: number) => 
    trackEvent('add_transaction', { 
      category: 'Feature', 
      label: type, 
      value: Math.abs(amount) 
    }),
  
  addBill: (amount: number) => 
    trackEvent('add_bill', { 
      category: 'Feature', 
      label: 'Bill Created', 
      value: amount 
    }),
  
  useStaterIA: (messageType: 'text' | 'voice' | 'image') => 
    trackEvent('use_stater_ia', { 
      category: 'AI', 
      label: messageType 
    }),
  
  scanReceipt: () => 
    trackEvent('scan_receipt', { 
      category: 'OCR', 
      label: 'Receipt Scanned' 
    }),
  
  // Monetização
  viewPricing: () => 
    trackEvent('view_pricing', { 
      category: 'Monetization', 
      label: 'Pricing Page Viewed' 
    }),
  
  clickUpgrade: (from: string) => 
    trackEvent('click_upgrade', { 
      category: 'Monetization', 
      label: `From ${from}` 
    }),
  
  startCheckout: (plan: string, price: number) => 
    trackEvent('begin_checkout', { 
      category: 'Monetization', 
      label: plan, 
      value: price,
      currency: 'BRL',
      items: [{ item_name: plan, price }]
    }),
  
  completePurchase: (plan: string, price: number) => 
    trackEvent('purchase', { 
      category: 'Monetization', 
      label: plan, 
      value: price,
      currency: 'BRL',
      transaction_id: `${Date.now()}`,
      items: [{ item_name: plan, price }]
    }),
  
  // Engajamento
  shareApp: (method: string) => 
    trackEvent('share', { 
      category: 'Engagement', 
      label: method 
    }),
  
  exportReport: (format: 'pdf' | 'excel' | 'csv') => 
    trackEvent('export_report', { 
      category: 'Feature', 
      label: format 
    }),
  
  connectTelegram: () => 
    trackEvent('connect_telegram', { 
      category: 'Integration', 
      label: 'Telegram Bot Connected' 
    })
};

/**
 * Identificar usuário (após login)
 */
export const identifyUser = async (userId: string, properties?: {
  email?: string;
  name?: string;
  plan?: string;
  [key: string]: any;
}) => {
  try {
    // Salvar propriedades do usuário no Supabase
    await supabase.from('analytics_users').upsert({
      user_id: userId,
      email: properties?.email,
      name: properties?.name,
      plan: properties?.plan,
      metadata: properties,
      last_seen: new Date().toISOString()
    }, { onConflict: 'user_id' });
    
    console.log('👤 User identified (Supabase):', userId, properties);
    
    // Google Analytics como fallback
    if (typeof window.gtag === 'function') {
      window.gtag('set', 'user_properties', {
        user_id: userId,
        ...properties
      });
    }
  } catch (error) {
    console.error('❌ Erro ao identificar usuário:', error);
  }
};

/**
 * 📊 QUERIES PARA VER OS DADOS EM TEMPO REAL
 * 
 * Cole no SQL Editor do Supabase: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/editor
 * 
 * -- Ver visitantes de hoje (ATUALIZA EM TEMPO REAL)
 * SELECT COUNT(DISTINCT user_agent) as visitantes_unicos,
 *        COUNT(*) as total_pageviews,
 *        device,
 *        path
 * FROM analytics_pageviews
 * WHERE created_at >= CURRENT_DATE
 * GROUP BY device, path
 * ORDER BY total_pageviews DESC;
 * 
 * -- Ver eventos de hoje
 * SELECT event_name, 
 *        event_category,
 *        COUNT(*) as total,
 *        AVG(event_value) as valor_medio
 * FROM analytics_events
 * WHERE created_at >= CURRENT_DATE
 * GROUP BY event_name, event_category
 * ORDER BY total DESC;
 * 
 * -- Ver conversão (signups vs purchases)
 * SELECT 
 *   (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'sign_up' AND created_at >= CURRENT_DATE) as signups,
 *   (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'purchase' AND created_at >= CURRENT_DATE) as purchases,
 *   ROUND((SELECT COUNT(*) FROM analytics_events WHERE event_name = 'purchase' AND created_at >= CURRENT_DATE)::numeric / 
 *         NULLIF((SELECT COUNT(*) FROM analytics_events WHERE event_name = 'sign_up' AND created_at >= CURRENT_DATE), 0) * 100, 2) as taxa_conversao;
 */

export default {
  init: initGA,
  trackPageView,
  trackEvent,
  identifyUser,
  ...analytics
};
