// components/PaywallExample.tsx
import React from 'react';
import { useSuperwall } from '../hooks/useSuperwall';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export const PaywallExample = () => {
  const { register, setUserAttributes, track, isNative } = useSuperwall();

  const handleShowPaywall = async () => {
    try {
      const result = await register('premium_access');
      
      switch (result.result) {
        case 'paywallPresented':
          console.log('✅ Paywall foi mostrado!');
          break;
        case 'noRuleMatch':
          console.log('✅ Usuário já é premium ou não precisa ver paywall');
          // Aqui você daria acesso direto ao conteúdo premium
          break;
        case 'eventNotFound':
          console.log('❌ Evento não configurado no dashboard Superwall');
          break;
      }
    } catch (error) {
      console.error('Erro ao mostrar paywall:', error);
    }
  };

  const handleSetUserInfo = async () => {
    try {
      await setUserAttributes({
        user_id: '12345',
        email: 'usuario@exemplo.com',
        subscription_status: 'free',
        app_version: '1.0.0'
      });
      console.log('✅ Atributos do usuário definidos!');
    } catch (error) {
      console.error('Erro ao definir atributos:', error);
    }
  };

  const handleTrackEvent = async () => {
    try {
      await track('user_clicked_premium_feature', {
        feature_name: 'advanced_analytics',
        screen: 'dashboard'
      });
      console.log('✅ Evento rastreado!');
    } catch (error) {
      console.error('Erro ao rastrear evento:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🚀 Superwall Demo</CardTitle>
        <p className="text-sm text-muted-foreground">
          {isNative ? '📱 Executando no dispositivo' : '🌐 Executando na web'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleShowPaywall}
          className="w-full"
          variant="default"
        >
          💳 Mostrar Paywall Premium
        </Button>
        
        <Button 
          onClick={handleSetUserInfo}
          className="w-full"
          variant="outline"
        >
          👤 Definir Dados do Usuário
        </Button>
        
        <Button 
          onClick={handleTrackEvent}
          className="w-full"
          variant="secondary"
        >
          📊 Rastrear Evento
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>📝 Para configurar:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Crie conta em superwall.com</li>
            <li>Substitua API key em MyApplication.java</li>
            <li>Configure evento "premium_access" no dashboard</li>
            <li>Teste no dispositivo Android</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
