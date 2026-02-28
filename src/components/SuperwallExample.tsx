import React, { useEffect } from 'react';
import SuperwallHelper, { SuperwallCapacitor } from '../plugins/superwall';

// Exemplo de componente que usa Superwall
const SuperwallExample: React.FC = () => {
  
  useEffect(() => {
    // Configurar Superwall quando o componente monta
    initializeSuperwall();
  }, []);

  const initializeSuperwall = async () => {
    try {
      // Registrar eventos comuns
      await SuperwallHelper.registerCommonEvents();
      
      // Configurar atributos básicos do usuário
      await SuperwallHelper.setBasicUserAttributes();
      
      console.log('Superwall inicializado com sucesso!');
    } catch (error) {
      console.error('Erro ao inicializar Superwall:', error);
    }
  };

  const handlePremiumFeature = async () => {
    try {
      // Dispara paywall quando usuário tenta acessar funcionalidade premium
      const result = await SuperwallHelper.triggerPremiumFeature('advanced_analytics');
      console.log('Paywall trigger result:', result);
    } catch (error) {
      console.error('Erro ao disparar paywall:', error);
    }
  };

  const handleSubscription = async () => {
    try {
      // Rastreia início de processo de assinatura
      const result = await SuperwallHelper.trackSubscriptionStart('monthly');
      console.log('Subscription tracking result:', result);
    } catch (error) {
      console.error('Erro ao rastrear assinatura:', error);
    }
  };

  const handleRestore = async () => {
    try {
      // Rastreia tentativa de restauração
      const result = await SuperwallHelper.trackRestoreStart();
      console.log('Restore tracking result:', result);
    } catch (error) {
      console.error('Erro ao rastrear restauração:', error);
    }
  };

  const handleCustomEvent = async () => {
    try {
      // Exemplo de evento customizado
      const result = await SuperwallCapacitor.track({
        event: 'custom_action',
        parameters: {
          action_type: 'button_click',
          screen: 'main_dashboard',
          timestamp: new Date().toISOString()
        }
      });
      console.log('Custom event result:', result);
    } catch (error) {
      console.error('Erro ao rastrear evento customizado:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Superwall Integration Example</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <button onClick={handlePremiumFeature}>
          🚀 Acessar Funcionalidade Premium
        </button>
        
        <button onClick={handleSubscription}>
          💳 Iniciar Assinatura
        </button>
        
        <button onClick={handleRestore}>
          🔄 Restaurar Compras
        </button>
        
        <button onClick={handleCustomEvent}>
          📊 Evento Customizado
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Como usar:</h3>
        <ul>
          <li><strong>Funcionalidade Premium:</strong> Dispara paywall quando usuário tenta acessar recurso pago</li>
          <li><strong>Iniciar Assinatura:</strong> Rastreia quando usuário inicia processo de compra</li>
          <li><strong>Restaurar Compras:</strong> Rastreia tentativas de restauração</li>
          <li><strong>Evento Customizado:</strong> Exemplo de como rastrear eventos personalizados</li>
        </ul>
      </div>
    </div>
  );
};

export default SuperwallExample;
