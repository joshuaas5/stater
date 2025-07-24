import { PlanType } from '@/types';

// Configuração dos produtos do Google Play Billing
export const PLAY_STORE_PRODUCTS = {
  [PlanType.WEEKLY]: {
    productId: 'stater_weekly_890',
    title: 'Stater Weekly',
    description: 'Plano semanal com 10 mensagens/dia e recursos básicos',
    price: 'R$ 8,90',
    period: '7 dias',
    trialPeriod: '3 dias'
  },
  [PlanType.MONTHLY]: {
    productId: 'stater_monthly_1590',
    title: 'Stater Monthly',
    description: 'Plano mensal com 20 mensagens/dia e exports ilimitados',
    price: 'R$ 15,90',
    period: '30 dias',
    trialPeriod: '7 dias'
  },
  [PlanType.PRO]: {
    productId: 'stater_pro_2990',
    title: 'Stater Pro',
    description: 'Plano profissional com recursos completos e PDFs',
    price: 'R$ 29,90',
    period: '30 dias',
    trialPeriod: '7 dias'
  }
};

// Interface para dados de compra
export interface PurchaseData {
  productId: string;
  purchaseToken: string;
  orderId: string;
  purchaseTime: number;
  purchaseState: number;
  acknowledged: boolean;
  packageName: string;
}

// Interface para verificação de assinatura
export interface SubscriptionData {
  productId: string;
  purchaseToken: string;
  expiryTimeMillis: number;
  autoRenewing: boolean;
  priceCurrencyCode: string;
  priceAmountMicros: number;
  countryCode: string;
  paymentState: number;
  cancelReason?: number;
  userCancellationTimeMillis?: number;
  orderId: string;
  linkedPurchaseToken?: string;
  purchaseType: number;
  testPurchase?: boolean;
}

/**
 * Gerenciador do Google Play Billing para assinaturas
 * Days 5-7 da implementação de monetização
 */
export class GooglePlayBilling {
  
  private static isPlayBillingAvailable(): boolean {
    // Verificar se está em ambiente React Native/Capacitor com Google Play Services
    return typeof window !== 'undefined' && 
           'cordova' in window && 
           window.cordova?.plugins?.googlePlayBilling;
  }

  /**
   * Inicializar conexão com Google Play Billing
   */
  static async initialize(): Promise<boolean> {
    try {
      if (!this.isPlayBillingAvailable()) {
        console.log('🏪 Google Play Billing não disponível (ambiente web/desenvolvimento)');
        return false;
      }

      // Inicializar conexão com Play Billing
      const connection = await window.cordova.plugins.googlePlayBilling.startConnection();
      
      if (connection.responseCode === 0) { // BILLING_RESPONSE_RESULT_OK
        console.log('✅ Google Play Billing conectado com sucesso');
        return true;
      } else {
        console.error('❌ Erro ao conectar Google Play Billing:', connection);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erro ao inicializar Google Play Billing:', error);
      return false;
    }
  }

  /**
   * Buscar produtos disponíveis na Play Store
   */
  static async getAvailableProducts(): Promise<any[]> {
    try {
      if (!this.isPlayBillingAvailable()) {
        // Retornar dados mock para desenvolvimento
        return Object.entries(PLAY_STORE_PRODUCTS).map(([planType, product]) => ({
          productId: product.productId,
          type: 'subs',
          price: product.price,
          title: product.title,
          description: product.description,
          subscriptionPeriod: product.period,
          freeTrialPeriod: product.trialPeriod,
          mock: true
        }));
      }

      const productIds = Object.values(PLAY_STORE_PRODUCTS).map(p => p.productId);
      
      const products = await window.cordova.plugins.googlePlayBilling.querySkuDetails({
        skuList: productIds,
        type: 'subs' // subscription
      });

      console.log('🛒 Produtos disponíveis:', products);
      return products.skuDetailsList || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return [];
    }
  }

  /**
   * Iniciar fluxo de compra de assinatura
   */
  static async purchaseSubscription(
    productId: string, 
    userId: string
  ): Promise<{ success: boolean; purchaseData?: PurchaseData; error?: string }> {
    try {
      console.log(`🛒 Iniciando compra de assinatura: ${productId} para usuário ${userId}`);

      if (!this.isPlayBillingAvailable()) {
        // Mock para desenvolvimento
        const mockPurchase: PurchaseData = {
          productId,
          purchaseToken: `mock_token_${Date.now()}`,
          orderId: `mock_order_${Date.now()}`,
          purchaseTime: Date.now(),
          purchaseState: 1, // PURCHASED
          acknowledged: false,
          packageName: 'com.stater.financial'
        };

        console.log('🎭 Compra mock simulada:', mockPurchase);
        return { success: true, purchaseData: mockPurchase };
      }

      // Fluxo real do Google Play Billing
      const purchaseResult = await window.cordova.plugins.googlePlayBilling.launchBillingFlow({
        sku: productId,
        type: 'subs'
      });

      if (purchaseResult.responseCode === 0) { // BILLING_RESPONSE_RESULT_OK
        console.log('✅ Compra realizada com sucesso:', purchaseResult);
        
        // Extrair dados da compra
        const purchase = purchaseResult.purchases[0];
        const purchaseData: PurchaseData = {
          productId: purchase.sku,
          purchaseToken: purchase.purchaseToken,
          orderId: purchase.orderId,
          purchaseTime: purchase.purchaseTime,
          purchaseState: purchase.purchaseState,
          acknowledged: purchase.acknowledged,
          packageName: purchase.packageName
        };

        return { success: true, purchaseData };
      } else {
        const errorMsg = this.getErrorMessage(purchaseResult.responseCode);
        console.error('❌ Erro na compra:', errorMsg);
        return { success: false, error: errorMsg };
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar compra:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Verificar assinaturas ativas do usuário
   */
  static async getActiveSubscriptions(): Promise<SubscriptionData[]> {
    try {
      if (!this.isPlayBillingAvailable()) {
        // Mock para desenvolvimento
        return [];
      }

      const purchases = await window.cordova.plugins.googlePlayBilling.queryPurchases({
        type: 'subs'
      });

      if (purchases.responseCode === 0) {
        return purchases.purchasesList || [];
      } else {
        console.error('❌ Erro ao buscar assinaturas:', purchases);
        return [];
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar assinaturas:', error);
      return [];
    }
  }

  /**
   * Acknowledgment de compra (obrigatório)
   */
  static async acknowledgePurchase(purchaseToken: string): Promise<boolean> {
    try {
      if (!this.isPlayBillingAvailable()) {
        console.log('🎭 Acknowledgment mock simulado');
        return true;
      }

      const result = await window.cordova.plugins.googlePlayBilling.acknowledgePurchase({
        purchaseToken
      });

      return result.responseCode === 0;
      
    } catch (error) {
      console.error('❌ Erro ao fazer acknowledgment:', error);
      return false;
    }
  }

  /**
   * Verificar se um produto está comprado
   */
  static async isProductPurchased(productId: string): Promise<boolean> {
    try {
      const subscriptions = await this.getActiveSubscriptions();
      return subscriptions.some(sub => 
        sub.productId === productId && 
        sub.expiryTimeMillis > Date.now() &&
        sub.paymentState === 1 // PAYMENT_RECEIVED
      );
    } catch (error) {
      console.error('❌ Erro ao verificar produto:', error);
      return false;
    }
  }

  /**
   * Restaurar compras do usuário
   */
  static async restorePurchases(): Promise<SubscriptionData[]> {
    try {
      console.log('🔄 Restaurando compras...');
      return await this.getActiveSubscriptions();
    } catch (error) {
      console.error('❌ Erro ao restaurar compras:', error);
      return [];
    }
  }

  /**
   * Desconectar do Google Play Billing
   */
  static async disconnect(): Promise<void> {
    try {
      if (this.isPlayBillingAvailable()) {
        await window.cordova.plugins.googlePlayBilling.endConnection();
        console.log('🔌 Google Play Billing desconectado');
      }
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
    }
  }

  /**
   * Converter código de erro em mensagem legível
   */
  private static getErrorMessage(responseCode: number): string {
    const errorMessages: Record<number, string> = {
      1: 'Operação cancelada pelo usuário',
      2: 'Google Play Services indisponível',
      3: 'Google Play Billing indisponível',
      4: 'Item não disponível',
      5: 'Erro de desenvolvedor',
      6: 'Erro fatal durante API',
      7: 'Item já possui',
      8: 'Item não possui'
    };

    return errorMessages[responseCode] || `Erro desconhecido (código: ${responseCode})`;
  }

  /**
   * Verificar se o dispositivo suporta assinaturas
   */
  static async isSubscriptionSupported(): Promise<boolean> {
    try {
      if (!this.isPlayBillingAvailable()) {
        return false;
      }

      const response = await window.cordova.plugins.googlePlayBilling.isFeatureSupported({
        feature: 'subscriptions'
      });

      return response.responseCode === 0;
      
    } catch (error) {
      console.error('❌ Erro ao verificar suporte a assinaturas:', error);
      return false;
    }
  }
}

// Estender window para TypeScript
declare global {
  interface Window {
    cordova?: {
      plugins?: {
        googlePlayBilling?: any;
      };
    };
  }
}

export default GooglePlayBilling;
