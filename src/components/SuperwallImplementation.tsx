import React, { useEffect, useState } from 'react';
import { SuperwallPlugin } from '../plugins/superwall';

export const SuperwallImplementation: React.FC = () => {
  const [userPremium, setUserPremium] = useState(false);

  useEffect(() => {
    // Configurar eventos do Superwall
    setupSuperwallEvents();
    
    // Verificar status premium do usuário
    checkPremiumStatus();
  }, []);

  const setupSuperwallEvents = async () => {
    try {
      // Definir atributos do usuário
      await SuperwallPlugin.setUserAttributes({
        attributes: {
          user_id: 'user_' + Date.now(), // Use o ID real do usuário
          email: 'user@email.com', // Email real do usuário
          signup_date: new Date().toISOString(),
          app_version: '1.0.0',
          platform: 'android'
        }
      });
    } catch (error) {
      console.error('Erro ao configurar Superwall:', error);
    }
  };

  const checkPremiumStatus = async () => {
    // Aqui você verificaria se o usuário tem assinatura ativa
    // Por exemplo, consultando seu backend ou Supabase
    setUserPremium(false); // Substitua pela lógica real
  };

  const showPaywall = async (paywallName: string) => {
    try {
      await SuperwallPlugin.presentPaywall({ name: paywallName });
    } catch (error) {
      console.error('Erro ao mostrar paywall:', error);
    }
  };

  const handlePremiumFeature = async () => {
    if (userPremium) {
      // Usuário tem acesso, execute a função premium
      alert('Funcionalidade premium executada!');
    } else {
      // Usuário não tem acesso, mostre o paywall
      await showPaywall('premium_features');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Stater - Funcionalidades</h2>
      
      <div className="space-y-2">
        <button 
          onClick={handlePremiumFeature}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🚀 Funcionalidade Premium
        </button>
        
        <button 
          onClick={() => showPaywall('onboarding')}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          🎯 Ver Planos Premium
        </button>
        
        <button 
          onClick={() => showPaywall('upgrade_prompt')}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          ⭐ Fazer Upgrade
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p>Status: {userPremium ? '✅ Premium Ativo' : '⚠️ Usuário Gratuito'}</p>
      </div>
    </div>
  );
};
