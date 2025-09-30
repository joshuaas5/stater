import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { supabase } from '../lib/supabase';

/**
 * SOLUÇÃO DEFINITIVA: OAuth Google com Custom Chrome Tabs garantido
 * Esta implementação força o uso interno no Android, sem abrir Chrome externo
 */
export const handleGoogleOAuth = async (): Promise<any> => {
  console.log('🚀 [OAUTH DEFINITIVO] Iniciando login Google...');
  
  if (!Capacitor.isNativePlatform()) {
    // Web: usar método padrão do Supabase
    console.log('🌐 Web: usando OAuth padrão');
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback'
      }
    });
  }

  // Android: implementação customizada com Custom Chrome Tabs
  console.log('📱 Android: usando Custom Chrome Tabs otimizado');
  
  return new Promise(async (resolve, reject) => {
    let authCompleted = false;
    
    try {
      // 1. Limpar listeners anteriores
      await Browser.removeAllListeners();
      
      // 2. Configurar listener para deep link
      const appListener = await App.addListener('appUrlOpen', async (event) => {
        if (authCompleted) return;
        authCompleted = true;
        
        console.log('🔗 Deep link capturado:', event.url);
        appListener.remove();
        browserListener.remove();
        
        try {
          await Browser.close();
          
          // Processar callback do Supabase
          const url = new URL(event.url);
          const fragment = url.hash.substring(1); // Remove #
          const params = new URLSearchParams(fragment);
          
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken) {
            console.log('✅ Token recebido, definindo sessão...');
            
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            if (error) throw error;
            
            console.log('✅ Login Google finalizado com sucesso');
            resolve(data);
          } else {
            throw new Error('Token não encontrado no callback');
          }
        } catch (error) {
          console.error('❌ Erro no callback:', error);
          reject(error);
        }
      });
      
      // 3. Configurar listener para browser fechado
      const browserListener = await Browser.addListener('browserFinished', async () => {
        if (authCompleted) return;
        
        console.log('🔄 Browser fechado, verificando sessão...');
        browserListener.remove();
        
        setTimeout(async () => {
          if (authCompleted) return;
          authCompleted = true;
          appListener.remove();
          
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) {
            console.log('✅ Sessão encontrada após fechar browser');
            resolve(sessionData);
          } else {
            console.warn('⚠️ Login cancelado');
            reject(new Error('Login cancelado'));
          }
        }, 1000);
      });
      
      // 4. Obter URL OAuth do Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
          redirectTo: 'com.timothy.stater://auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      if (error || !data?.url) {
        throw new Error('Falha ao obter URL OAuth: ' + error?.message);
      }

      console.log('🌐 URL OAuth obtida:', data.url);

      // 5. Abrir Custom Chrome Tabs com configurações otimizadas
      console.log('🚀 Abrindo Custom Chrome Tabs...');
      
      await Browser.open({
        url: data.url,
        
        // ✅ CONFIGURAÇÕES OTIMIZADAS PARA ANDROID
        presentationStyle: 'fullscreen',  // Tela cheia
        toolbarColor: '#31518b'           // Cor integrada ao app
      });

      console.log('✅ Custom Chrome Tabs aberto com sucesso');
      
      // 6. Timeout de segurança
      setTimeout(() => {
        if (!authCompleted) {
          authCompleted = true;
          appListener.remove();
          browserListener.remove();
          Browser.close();
          reject(new Error('Timeout no login (2 minutos)'));
        }
      }, 120000);
      
    } catch (error) {
      console.error('❌ Erro no OAuth:', error);
      if (!authCompleted) {
        authCompleted = true;
        reject(error);
      }
    }
  });
};