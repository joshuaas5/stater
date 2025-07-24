/**
 * Webhook do Google Play para verificar assinaturas
 * Days 5-7: Implementação completa do Google Play Billing
 * 
 * Este arquivo deve ser usado no backend (Next.js API routes ou servidor Express)
 * para verificar assinaturas via Google Play Developer API
 */

// Tipos para o Google Play Developer API
interface GooglePlaySubscription {
  kind: string;
  startTimeMillis: string;
  expiryTimeMillis: string;
  autoRenewing: boolean;
  priceCurrencyCode: string;
  priceAmountMicros: string;
  countryCode: string;
  developerPayload: string;
  paymentState: number;
  cancelReason?: number;
  userCancellationTimeMillis?: string;
  cancelSurveyResult?: any;
  orderId: string;
  linkedPurchaseToken?: string;
  purchaseType: number;
  acknowledgementState: number;
  externalAccountId?: string;
  obfuscatedExternalAccountId?: string;
  obfuscatedExternalProfileId?: string;
  profileName?: string;
  emailAddress?: string;
  givenName?: string;
  familyName?: string;
  profileId?: string;
  testPurchase?: any;
}

interface PlayWebhookNotification {
  version: string;
  notificationType: number;
  purchaseToken: string;
  subscriptionId: string;
}

/**
 * Classe para gerenciar verificação de assinaturas no backend
 */
export class GooglePlaySubscriptionVerifier {
  
  private static readonly GOOGLE_PLAY_API_BASE = 'https://androidpublisher.googleapis.com/androidpublisher/v3';
  
  /**
   * Verificar assinatura usando Google Play Developer API
   * IMPORTANTE: Deve ser executado no backend com service account
   */
  static async verifySubscription(
    packageName: string,
    subscriptionId: string,
    purchaseToken: string,
    accessToken: string
  ): Promise<GooglePlaySubscription | null> {
    try {
      const url = `${this.GOOGLE_PLAY_API_BASE}/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const subscription: GooglePlaySubscription = await response.json();
        console.log('✅ Assinatura verificada:', subscription);
        return subscription;
      } else {
        console.error('❌ Erro ao verificar assinatura:', response.status, await response.text());
        return null;
      }
      
    } catch (error) {
      console.error('❌ Erro na verificação:', error);
      return null;
    }
  }

  /**
   * Verificar se uma assinatura está ativa
   */
  static isSubscriptionActive(subscription: GooglePlaySubscription): boolean {
    const now = Date.now();
    const expiryTime = parseInt(subscription.expiryTimeMillis);
    
    return subscription.paymentState === 1 && // PAYMENT_RECEIVED
           expiryTime > now &&
           subscription.autoRenewing;
  }

  /**
   * Processar webhook do Google Play
   * Este endpoint deve ser configurado no Google Play Console
   */
  static async processWebhook(
    notification: PlayWebhookNotification,
    packageName: string,
    accessToken: string
  ): Promise<{
    success: boolean;
    subscription?: GooglePlaySubscription;
    action: 'renewed' | 'expired' | 'cancelled' | 'recovered' | 'unknown';
  }> {
    try {
      const { notificationType, subscriptionId, purchaseToken } = notification;
      
      // Verificar assinatura atual
      const subscription = await this.verifySubscription(
        packageName,
        subscriptionId,
        purchaseToken,
        accessToken
      );

      if (!subscription) {
        return { success: false, action: 'unknown' };
      }

      // Determinar ação baseada no tipo de notificação
      let action: 'renewed' | 'expired' | 'cancelled' | 'recovered' | 'unknown' = 'unknown';
      
      switch (notificationType) {
        case 1: // SUBSCRIPTION_RECOVERED
          action = 'recovered';
          break;
        case 2: // SUBSCRIPTION_RENEWED  
          action = 'renewed';
          break;
        case 3: // SUBSCRIPTION_CANCELED
          action = 'cancelled';
          break;
        case 4: // SUBSCRIPTION_PURCHASED
          action = 'renewed';
          break;
        case 5: // SUBSCRIPTION_ON_HOLD
          action = 'cancelled';
          break;
        case 6: // SUBSCRIPTION_IN_GRACE_PERIOD
          action = 'renewed'; // Ainda ativo durante período de graça
          break;
        case 7: // SUBSCRIPTION_RESTARTED
          action = 'recovered';
          break;
        case 8: // SUBSCRIPTION_PRICE_CHANGE_CONFIRMED
          action = 'renewed';
          break;
        case 9: // SUBSCRIPTION_DEFERRED
          action = 'renewed';
          break;
        case 10: // SUBSCRIPTION_PAUSED
          action = 'cancelled';
          break;
        case 11: // SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED
          action = 'renewed';
          break;
        case 12: // SUBSCRIPTION_REVOKED
          action = 'cancelled';
          break;
        case 13: // SUBSCRIPTION_EXPIRED
          action = 'expired';
          break;
        default:
          action = 'unknown';
      }

      console.log(`📩 Webhook processado: ${action} para ${subscriptionId}`);
      
      return {
        success: true,
        subscription,
        action
      };
      
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      return { success: false, action: 'unknown' };
    }
  }

  /**
   * Obter access token usando service account
   * IMPORTANTE: service account JSON deve estar no backend
   */
  static async getAccessToken(serviceAccountPath: string): Promise<string | null> {
    try {
      // Este código deve ser executado no backend Node.js
      const { GoogleAuth } = require('google-auth-library');
      
      const auth = new GoogleAuth({
        keyFile: serviceAccountPath,
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
      });

      const authClient = await auth.getClient();
      const accessToken = await authClient.getAccessToken();
      
      return accessToken.token;
      
    } catch (error) {
      console.error('❌ Erro ao obter access token:', error);
      return null;
    }
  }

  /**
   * Sincronizar assinatura do usuário
   * Deve ser chamado periodicamente para manter dados atualizados
   */
  static async syncUserSubscription(
    userId: string,
    packageName: string,
    subscriptionId: string,
    purchaseToken: string,
    accessToken: string
  ): Promise<boolean> {
    try {
      const subscription = await this.verifySubscription(
        packageName,
        subscriptionId,
        purchaseToken,
        accessToken
      );

      if (!subscription) {
        console.error(`❌ Não foi possível verificar assinatura para usuário ${userId}`);
        return false;
      }

      const isActive = this.isSubscriptionActive(subscription);
      
      // Aqui você atualizaria o banco de dados do usuário
      console.log(`📊 Sincronizando usuário ${userId}: ${isActive ? 'ATIVO' : 'INATIVO'}`);
      
      // Exemplo de atualização no banco:
      // await UserPlanManager.updateSubscriptionStatus(userId, isActive, subscription);
      
      return isActive;
      
    } catch (error) {
      console.error(`❌ Erro ao sincronizar usuário ${userId}:`, error);
      return false;
    }
  }
}

// Exemplo de implementação no Next.js API Route
export const playWebhookHandler = async (req: any, res: any) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const notification: PlayWebhookNotification = req.body;
    const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME;
    const serviceAccountPath = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PATH;

    if (!packageName || !serviceAccountPath) {
      return res.status(500).json({ error: 'Missing configuration' });
    }

    // Obter access token
    const accessToken = await GooglePlaySubscriptionVerifier.getAccessToken(serviceAccountPath);
    if (!accessToken) {
      return res.status(500).json({ error: 'Failed to get access token' });
    }

    // Processar webhook
    const result = await GooglePlaySubscriptionVerifier.processWebhook(
      notification,
      packageName,
      accessToken
    );

    if (result.success && result.subscription) {
      // Aqui você pode atualizar o status da assinatura no seu banco de dados
      console.log(`✅ Webhook processado com sucesso: ${result.action}`);
    }

    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default GooglePlaySubscriptionVerifier;
