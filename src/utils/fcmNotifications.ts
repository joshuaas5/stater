import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase';

// Inicializa Firebase Cloud Messaging para push notifications remotas
export const initializeFCM = async (): Promise<boolean> => {
  // Só funciona em plataformas nativas
  if (!Capacitor.isNativePlatform()) {
    console.log(' FCM: Apenas disponível em plataformas nativas');
    return false;
  }

  try {
    // Solicitar permissão
    let permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn(' FCM: Permissão de notificação negada');
      return false;
    }

    // Registrar para receber push notifications
    await PushNotifications.register();

    // Listener para quando o registro é bem-sucedido
    PushNotifications.addListener('registration', async (token) => {
      console.log(' FCM Token:', token.value);
      
      // Salvar token no Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('user_push_tokens')
            .upsert({
              user_id: user.id,
              fcm_token: token.value,
              platform: Capacitor.getPlatform(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
          console.log(' FCM Token salvo no Supabase');
        }
      } catch (error) {
        console.error(' Erro ao salvar FCM token:', error);
      }
    });

    // Listener para erros de registro
    PushNotifications.addListener('registrationError', (error) => {
      console.error(' FCM Erro de registro:', error);
    });

    // Listener para notificações recebidas com app aberto
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log(' Push recebida (foreground):', notification);
      // Aqui você pode mostrar um toast ou atualizar o UI
    });

    // Listener para quando usuário toca na notificação
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log(' Push clicada:', notification);
      // Navegar para a tela apropriada baseado nos dados
    });

    console.log(' FCM inicializado com sucesso');
    return true;
  } catch (error) {
    console.error(' Erro ao inicializar FCM:', error);
    return false;
  }
};

export default initializeFCM;
