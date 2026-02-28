// Plugin Superwall para Capacitor
import { registerPlugin } from '@capacitor/core';

export interface SuperwallPluginInterface {
  /**
   * Registra um evento no Superwall
   */
  register(options: { event: string }): Promise<{ success: boolean; event: string }>;

  /**
   * Define atributos do usuário
   */
  setUserAttributes(options: { 
    attributes: Record<string, any> 
  }): Promise<{ success: boolean }>;

  /**
   * Rastreia um evento com parâmetros opcionais
   */
  track(options: { 
    event: string; 
    parameters?: Record<string, any> 
  }): Promise<{ success: boolean; event: string }>;

  /**
   * Apresenta um paywall específico
   */
  presentPaywall(options: { name: string }): Promise<{ success: boolean }>;

  /**
   * Obtém resultado da apresentação do paywall
   */
  getPresentationResult(): Promise<{ success: boolean; message: string }>;
}

const SuperwallCapacitor = registerPlugin<SuperwallPluginInterface>('SuperwallPlugin');

// Classe helper para facilitar o uso
export class SuperwallHelper {
  
  /**
   * Configura atributos básicos do usuário
   */
  static async setBasicUserAttributes(userId?: string, email?: string) {
    const attributes: Record<string, any> = {
      app_version: '1.0.0',
      platform: 'android',
      device_type: 'mobile',
      app_name: 'Stater'
    };

    if (userId) attributes.user_id = userId;
    if (email) attributes.email = email;

    return await SuperwallCapacitor.setUserAttributes({ attributes });
  }

  /**
   * Registra eventos de paywall comuns
   */
  static async registerCommonEvents() {
    const events = [
      'campaign_trigger',
      'subscription_start',
      'restore_start',
      'paywall_open',
      'paywall_close'
    ];

    for (const event of events) {
      await SuperwallCapacitor.register({ event });
    }
  }

  /**
   * Dispara evento quando usuário acessa funcionalidade premium
   */
  static async triggerPremiumFeature(featureName: string) {
    return await SuperwallCapacitor.track({ 
      event: 'campaign_trigger',
      parameters: { feature: featureName }
    });
  }

  /**
   * Dispara evento quando usuário inicia processo de assinatura
   */
  static async trackSubscriptionStart(plan?: string) {
    const parameters: Record<string, any> = {};
    if (plan) parameters.plan = plan;
    
    return await SuperwallCapacitor.track({ 
      event: 'subscription_start',
      parameters 
    });
  }

  /**
   * Dispara evento quando usuário tenta restaurar compras
   */
  static async trackRestoreStart() {
    return await SuperwallCapacitor.track({ 
      event: 'restore_start'
    });
  }
}

export { SuperwallCapacitor };
export const SuperwallPlugin = SuperwallCapacitor;
export default SuperwallHelper;
