// src/components/SuperwallTest.tsx
import React from 'react';
import { useSuperwall } from '../hooks/useSuperwall';

export const SuperwallTest = () => {
  const { register, isNative } = useSuperwall();

  const handleTestPaywall = async () => {
    try {
      console.log('🚀 Testando Superwall...');
      const result = await register('premium_access');
      
      console.log('📊 Resultado:', result);
      
      switch (result.result) {
        case 'paywallPresented':
          alert('✅ Paywall foi mostrado!');
          break;
        case 'noRuleMatch':
          alert('ℹ️ Usuário não precisa ver paywall (já é premium)');
          break;
        case 'eventNotFound':
          alert('❌ Evento "premium_access" não configurado no dashboard');
          break;
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      alert('❌ Erro ao mostrar paywall: ' + error);
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>🚀 Teste do Superwall</h2>
      <p>Status: {isNative ? '📱 Dispositivo' : '🌐 Web'}</p>
      
      <button 
        onClick={handleTestPaywall}
        style={{
          backgroundColor: '#007AFF',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        💳 Testar Paywall Premium
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>📝 Para funcionar:</p>
        <p>1. Configure campanha "premium_access" no Superwall</p>
        <p>2. Execute: npx cap run android</p>
        <p>3. Clique no botão acima</p>
      </div>
    </div>
  );
};
