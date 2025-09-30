import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';

/**
 * Interface para o plugin nativo GoogleNativeDirect
 */
export interface GoogleNativeDirectPlugin {
  signIn(): Promise<{
    idToken: string;
    email: string;
    name: string;
    success: boolean;
  }>;
  signOut(): Promise<{ success: boolean }>;
}

/**
 * Login Google 100% NATIVO - Implementação direta que bypass o código 10
 * Usa plugin personalizado que implementa Google Sign-In diretamente
 */
export async function signInWithGoogleNativeDirect() {
  console.log('🚀 [NATIVE DIRECT] Iniciando login Google nativo direto...');
  
  try {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Login nativo direto só funciona em ambiente mobile');
    }

    // Marcar que estamos fazendo login nativo (para evitar deep link processing)
    localStorage.setItem('native_login_in_progress', 'true');

    // Acessar nosso plugin personalizado
    const GoogleNativeDirect = (Capacitor.Plugins as any).GoogleNativeDirect as GoogleNativeDirectPlugin;
    
    if (!GoogleNativeDirect) {
      throw new Error('Plugin GoogleNativeDirect não está disponível');
    }
    
    console.log('📱 [NATIVE DIRECT] Plugin encontrado - executando signIn...');
    
    // Fazer login usando nosso plugin personalizado
    const result = await GoogleNativeDirect.signIn();
    
    if (!result || !result.success || !result.idToken) {
      console.error('❌ [NATIVE DIRECT] Resultado inválido:', JSON.stringify(result, null, 2));
      throw new Error('Login falhou: dados inválidos retornados pelo plugin');
    }
    
    console.log('✅ [NATIVE DIRECT] Token obtido com sucesso');
    console.log('👤 [NATIVE DIRECT] Usuário:', result.email, result.name);
    
    // Autenticar no Supabase usando o idToken
    console.log('🔄 [NATIVE DIRECT] Autenticando no Supabase...');
    
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: result.idToken
    });
    
    if (error) {
      console.error('❌ [NATIVE DIRECT] Erro Supabase:', error);
      throw new Error(`Falha na autenticação Supabase: ${error.message}`);
    }
    
    if (!data.user) {
      throw new Error('Supabase não retornou dados do usuário');
    }
    
    console.log('✅ [NATIVE DIRECT] Autenticação Supabase concluída!');
    console.log('🎉 [NATIVE DIRECT] Login 100% nativo bem-sucedido:', data.user.email);
    
    // ✅ MARCAR LOGIN COMO 100% NATIVO COMPLETO
    localStorage.setItem('native_login_completed', 'true');
    localStorage.removeItem('native_login_in_progress');
    
    // Pequeno delay para garantir que não há conflito com deep links
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      email: data.user.email,
      name: data.user.user_metadata?.name || result.name,
      id: data.user.id
    };
    
  } catch (error: any) {
    console.error('❌ [NATIVE DIRECT] Erro no login nativo direto:', error);
    console.error('❌ [NATIVE DIRECT] Tipo do erro:', typeof error);
    console.error('❌ [NATIVE DIRECT] Nome do erro:', error?.name);
    console.error('❌ [NATIVE DIRECT] Mensagem do erro:', error?.message);
    console.error('❌ [NATIVE DIRECT] Stack do erro:', error?.stack);
    
    // Limpar flag e estado se houver erro
    localStorage.removeItem('native_login_in_progress');
    
    try {
      const GoogleNativeDirect = (Capacitor.Plugins as any).GoogleNativeDirect as GoogleNativeDirectPlugin;
      if (GoogleNativeDirect) {
        await GoogleNativeDirect.signOut();
      }
    } catch (cleanupError) {
      console.warn('⚠️ [CLEANUP] Erro ao limpar estado:', cleanupError);
    }
    
    // Re-throw com informação mais detalhada
    const detailedError = new Error(`Login nativo direto falhou: ${error?.message || 'Erro desconhecido'}`);
    (detailedError as any).originalError = error;
    throw detailedError;
  }
}

/**
 * Logout nativo direto
 */
export async function signOutNativeDirect() {
  console.log('🚪 [NATIVE DIRECT] Fazendo logout...');
  
  try {
    // Logout do Supabase
    const { error: supabaseError } = await supabase.auth.signOut();
    if (supabaseError) {
      console.warn('⚠️ [LOGOUT] Erro no logout Supabase:', supabaseError);
    }
    
    // Logout do plugin nativo (se disponível)
    if (Capacitor.isNativePlatform()) {
      try {
        const GoogleNativeDirect = (Capacitor.Plugins as any).GoogleNativeDirect as GoogleNativeDirectPlugin;
        if (GoogleNativeDirect) {
          await GoogleNativeDirect.signOut();
          console.log('✅ [LOGOUT] Plugin nativo direto deslogado');
        }
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