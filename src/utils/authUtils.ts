import { supabase } from '../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';

let authListener: any = null;

/**
 * Login com Google otimizado para Android e Web
 * Resolve o problema de OAuth abrindo Chrome externo no Android
 */
export async function signInWithGoogle() {
  console.log('🚀 [AUTH] Iniciando login com Google...');
  
  try {
    if (Capacitor.isNativePlatform()) {
      console.log('📱 [MOBILE] Ambiente Android detectado');
      
      // Limpar listeners anteriores
      if (authListener) {
        await App.removeAllListeners();
        authListener = null;
        console.log('🧹 [MOBILE] Listeners anteriores removidos');
      }
      
      // Configurar listener para deep links
      authListener = await App.addListener('appUrlOpen', async ({ url }) => {
        console.log('🔗 [MOBILE] Deep link recebido:', url);
        
        if (url.includes('auth/callback')) {
          console.log('✅ [MOBILE] Callback de autenticação detectado');
          
          // Fechar browser Custom Chrome Tab
          await Browser.close();
          
          // Aguardar processamento do Supabase
          setTimeout(async () => {
            try {
              const { data } = await supabase.auth.getSession();
              if (data?.session) {
                console.log('✅ [MOBILE] Usuário autenticado:', data.session.user.email);
                
                // Redirecionar para dashboard
                window.location.href = '/dashboard';
              } else {
                console.warn('⚠️ [MOBILE] Sessão não encontrada após callback');
              }
            } catch (error) {
              console.error('❌ [MOBILE] Erro ao verificar sessão:', error);
            }
          }, 1000);
        }
      });
      
      console.log('🔧 [MOBILE] Obtendo URL OAuth do Supabase...');
      
      // Obter URL OAuth do Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.timothy.stater://auth/callback', // Deep link mobile
          scopes: 'email profile',
          skipBrowserRedirect: true, // CRÍTICO: Impede redirecionamento automático
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });
      
      if (error || !data.url) {
        throw new Error(error?.message || 'Falha ao obter URL OAuth do Supabase');
      }
      
      console.log('🌐 [MOBILE] URL OAuth obtida:', data.url.substring(0, 100) + '...');
      console.log('🚀 [MOBILE] Abrindo Custom Chrome Tab...');
      
      // Abrir em Custom Chrome Tab com configurações otimizadas
      await Browser.open({
        url: data.url,
        presentationStyle: 'fullscreen',  // Força tela cheia
        toolbarColor: '#31518b'           // Cor integrada ao app
      });
      
      console.log('✅ [MOBILE] Custom Chrome Tab aberto com sucesso');
      
    } else {
      console.log('🌐 [WEB] Ambiente web detectado');
      
      // Fluxo web padrão - mais simples
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          scopes: 'email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('✅ [WEB] OAuth iniciado no ambiente web');
    }
  } catch (error) {
    console.error('❌ [AUTH] Erro no login Google:', error);
    
    // Limpar listeners em caso de erro
    if (authListener && Capacitor.isNativePlatform()) {
      await App.removeAllListeners();
      authListener = null;
    }
    
    throw error;
  }
}

/**
 * Limpa listeners de autenticação (útil para cleanup)
 */
export async function cleanupAuthListeners() {
  if (authListener && Capacitor.isNativePlatform()) {
    await App.removeAllListeners();
    authListener = null;
    console.log('🧹 [AUTH] Listeners de autenticação limpos');
  }
}

/**
 * Verifica se há uma sessão ativa
 */
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [AUTH] Erro ao verificar sessão:', error);
      return null;
    }
    
    return data?.session || null;
  } catch (error) {
    console.error('❌ [AUTH] Erro ao obter sessão:', error);
    return null;
  }
}