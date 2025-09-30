import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { supabase } from '../lib/supabase';

/**
 * Login Google 100% NATIVO - SEM FALLBACK
 * Só funciona se o Google Console estiver configurado corretamente
 */
export async function signInWithGoogleNative() {
  console.log('🚀 [NATIVE] Login Google 100% nativo iniciado...');
  
  try {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Login nativo só funciona em ambiente mobile');
    }

    console.log('📱 [NATIVE] Inicializando GoogleAuth...');
    
    // Configuração robusta do plugin
    await GoogleAuth.initialize({
      scopes: ['profile', 'email'],
      grantOfflineAccess: true // Para obter refresh_token
    });
    
    console.log('🔐 [NATIVE] Plugin inicializado - executando signIn...');
    
    // Login nativo direto
    const user = await GoogleAuth.signIn();
    
    if (!user || !user.authentication || !user.authentication.idToken) {
      console.error('❌ [NATIVE] Dados inválidos:', JSON.stringify(user, null, 2));
      throw new Error('Falha na autenticação: dados inválidos do GoogleAuth');
    }
    
    const { idToken, accessToken } = user.authentication;
    console.log('✅ [NATIVE] Tokens obtidos com sucesso');
    console.log('👤 [NATIVE] Usuário:', user.email, user.name);
    
    // Autenticar no Supabase usando o idToken
    console.log('🔄 [NATIVE] Autenticando no Supabase...');
    
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
      access_token: accessToken
    });
    
    if (error) {
      console.error('❌ [NATIVE] Erro Supabase:', error);
      throw new Error(`Falha na autenticação Supabase: ${error.message}`);
    }
    
    if (!data.user) {
      throw new Error('Supabase não retornou dados do usuário');
    }
    
    console.log('✅ [NATIVE] Autenticação Supabase concluída!');
    console.log('🎉 [NATIVE] Login 100% nativo bem-sucedido:', data.user.email);
    
    return {
      email: data.user.email,
      name: data.user.user_metadata?.name || user.name,
      id: data.user.id
    };
    
  } catch (error: any) {
    console.error('❌ [NATIVE] Erro no login nativo:', error);
    console.error('❌ [NATIVE] Tipo do erro:', typeof error);
    console.error('❌ [NATIVE] Nome do erro:', error?.name);
    console.error('❌ [NATIVE] Mensagem do erro:', error?.message);
    console.error('❌ [NATIVE] Stack do erro:', error?.stack);
    console.error('❌ [NATIVE] Erro completo (JSON):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Tentar limpar estado do plugin em caso de erro
    try {
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.signOut();
      }
    } catch (cleanupError) {
      console.warn('⚠️ [CLEANUP] Erro ao limpar estado:', cleanupError);
    }
    
    // Diagnóstico específico para erro código 10
    if (error?.code === '10') {
      throw new Error(`CONFIGURAÇÃO INCOMPLETA NO GOOGLE CONSOLE:

1. SHA-1 fingerprint: ✅ JÁ CONFIGURADO
2. VERIFICAR OAUTH CONSENT SCREEN:
   - Vá para console.cloud.google.com
   - OAuth consent screen 
   - Status deve ser "Published" (não "Testing")
   - OU adicione seu email como "Test user"

3. VERIFICAR APIS HABILITADAS:
   - Google Identity API ✅
   - People API (Google+ API) ✅
   
4. AGUARDAR PROPAGAÇÃO: 5-15 minutos

Erro técnico: ${error?.message || 'Código 10'}`);
    }
    
    // Re-throw com informação mais detalhada
    const detailedError = new Error(`Login nativo falhou: ${error?.message || 'Erro desconhecido'}`);
    (detailedError as any).originalError = error;
    throw detailedError;
  }
}

/**
 * Logout nativo
 */
export async function signOutNative() {
  console.log('🚪 [NATIVE] Fazendo logout...');
  
  try {
    // Logout do Supabase
    const { error: supabaseError } = await supabase.auth.signOut();
    if (supabaseError) {
      console.warn('⚠️ [LOGOUT] Erro no logout Supabase:', supabaseError);
    }
    
    // Logout do plugin nativo (se disponível)
    if (Capacitor.isNativePlatform()) {
      try {
        await GoogleAuth.signOut();
        console.log('✅ [LOGOUT] Plugin nativo deslogado');
      } catch (pluginError) {
        console.warn('⚠️ [LOGOUT] Erro no logout plugin:', pluginError);
      }
    }
    
    console.log('✅ [LOGOUT] Logout concluído');
    
  } catch (error) {
    console.error('❌ [LOGOUT] Erro no logout:', error);
    throw error;
  }
}