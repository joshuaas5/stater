import React from 'react';
import { SuperwallPlugin } from '../plugins/superwall';

export const SuperwallTester: React.FC = () => {
  
  const testPaywall = async (paywallName: string) => {
    try {
      console.log(`🚀 Tentando mostrar paywall: ${paywallName}`);
      
      // Configurar usuário primeiro
      await SuperwallPlugin.setUserAttributes({
        attributes: {
          user_id: 'test_user_' + Date.now(),
          plan: 'free',
          teste: 'true'
        }
      });
      
      // Mostrar paywall
      const result = await SuperwallPlugin.presentPaywall({ name: paywallName });
      console.log('✅ Paywall resultado:', result);
      
    } catch (error) {
      console.error('❌ Erro ao mostrar paywall:', error);
      alert(`Erro: ${error}`);
    }
  };

  const testSetUser = async () => {
    try {
      await SuperwallPlugin.setUserAttributes({
        attributes: {
          user_id: 'joshua_test',
          email: 'joshua@stater.app',
          plan: 'free',
          app_version: '1.0.0'
        }
      });
      alert('✅ Usuário configurado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao configurar usuário:', error);
      alert(`Erro: ${error}`);
    }
  };

  return (
    <div className="p-6 bg-white space-y-4">
      <h1 className="text-2xl font-bold text-center">🧪 Superwall Tester</h1>
      
      <div className="space-y-3">
        <button 
          onClick={testSetUser}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          👤 Configurar Usuário
        </button>
        
        <button 
          onClick={() => testPaywall('onboarding')}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          🎯 Testar Onboarding
        </button>
        
        <button 
          onClick={() => testPaywall('premium_features')}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          💎 Testar Premium Features
        </button>
        
        <button 
          onClick={() => testPaywall('limit_reached')}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          ⚠️ Testar Limite Atingido
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
        <p><strong>📱 Como testar:</strong></p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
          <li>Clique em "Configurar Usuário" primeiro</li>
          <li>Clique em qualquer botão de paywall</li>
          <li>Verifique o console para logs</li>
          <li>Se não aparecer paywall, configure no dashboard Superwall</li>
        </ol>
      </div>
    </div>
  );
};
