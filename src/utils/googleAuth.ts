import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';

/**
 * Força a URL OAuth para usar deep link em plataformas nativas
 */
const forceDeepLinkUrl = (originalUrl: string): string => {
  console.log('🔧 forceDeepLinkUrl() chamada com URL:', originalUrl);

  if (!Capacitor.isNativePlatform()) {
    console.log('🌐 Plataforma web - retornando URL original');
    return originalUrl;
  }

  console.log('📱 Plataforma nativa detectada - corrigindo URL OAuth');

  const deepLink = 'com.timothy.stater://auth/callback';
  const supabaseCallback = 'https://tmucbwlhkffrhtexmjze.supabase.co/auth/v1/callback';

  let correctedUrl = originalUrl;

  // Log da URL original
  console.log('📋 URL original recebida:', correctedUrl);

  // Verificar se já contém redirect_to
  const hasRedirectTo = correctedUrl.includes('redirect_to=');
  console.log('🔍 Já tem redirect_to?', hasRedirectTo);

  if (hasRedirectTo) {
    // Extrair o valor atual do redirect_to
    const redirectToMatch = correctedUrl.match(/redirect_to=([^&]+)/);
    const currentRedirectTo = redirectToMatch ? decodeURIComponent(redirectToMatch[1]) : null;
    console.log('📋 Redirect atual:', currentRedirectTo);

    // Substituir por deep link
    correctedUrl = correctedUrl.replace(
      /redirect_to=[^&]+/,
      'redirect_to=' + encodeURIComponent(deepLink)
    );
    console.log('🔄 Redirect substituído para:', deepLink);
  } else {
    // Adicionar redirect_to se não existir
    const separator = correctedUrl.includes('?') ? '&' : '?';
    correctedUrl += separator + 'redirect_to=' + encodeURIComponent(deepLink);
    console.log('➕ Redirect adicionado:', deepLink);
  }

  // Garantir que redirect_uri aponte para Supabase (se existir)
  if (correctedUrl.includes('redirect_uri=')) {
    correctedUrl = correctedUrl.replace(
      /redirect_uri=[^&]+/g,
      'redirect_uri=' + encodeURIComponent(supabaseCallback)
    );
    console.log('🔧 Redirect URI corrigido para Supabase');
  }

  console.log('🎯 URL final corrigida:', correctedUrl);
  console.log('✅ Correção de URL concluída');

  return correctedUrl;
};

/**
 * Inicialização básica do Google Auth
 */
export const initializeGoogleAuth = async () => {
  if (Capacitor.isNativePlatform()) {
    console.log('📱 Plataforma nativa detectada - OAuth via Supabase');
  } else {
    console.log('🌐 Plataforma web - OAuth nativo do Supabase');
  }
};

/**
 * Login com Google usando URL customizada que força browser interno
 */
export const signInWithGoogle = async () => {
  try {
    console.log('[GoogleAuth] Iniciando login com Google');
    
    if (Capacitor.isNativePlatform()) {
      console.log('📱 Mobile: Verificando sessão existente...');
      
      // Verificar se já há sessão ativa
      const { data: existingSession } = await supabase.auth.getSession();
      if (existingSession?.session) {
        console.log('✅ Sessão já ativa, não precisa fazer login');
        return { data: existingSession, error: null };
      }
      
      console.log('📱 Construindo URL OAuth diretamente...');
      
      const { Browser } = await import('@capacitor/browser');
      const { App } = await import('@capacitor/app');
      
      // Limpar listeners anteriores
      await Browser.removeAllListeners();
      
      return new Promise(async (resolve, reject) => {
        let authCompleted = false;
        
        // Listener para deep links
        const appListener = await App.addListener('appUrlOpen', async (event) => {
          if (authCompleted) return;
          authCompleted = true;
          
          console.log('🔗 Deep link capturado:', event.url);
          appListener.remove();
          
          try {
            await Browser.close();
            const user = await handleAuthCallback(event.url);
            if (user) {
              console.log('✅ Login finalizado com sucesso:', user.email);
              window.location.reload();
              resolve({ data: { user }, error: null });
            } else {
              console.warn('⚠️ Callback processado mas sem usuário');
              reject(new Error('Falha na autenticação'));
            }
          } catch (error) {
            console.error('❌ Erro no callback:', error);
            reject(error);
          }
        });
        
        // Listener para browser fechado
        const browserListener = await Browser.addListener('browserFinished', async () => {
          if (authCompleted) return;
          
          console.log('🔄 Browser fechado, verificando sessão...');
          browserListener.remove();
          
          setTimeout(async () => {
            if (authCompleted) return;
            
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session) {
              authCompleted = true;
              console.log('✅ Sessão encontrada após browser fechar');
              appListener.remove();
              window.location.reload();
              resolve({ data: sessionData, error: null });
            } else {
              authCompleted = true;
              console.warn('⚠️ Browser fechado sem autenticação');
              appListener.remove();
              reject(new Error('Login cancelado ou falhou'));
            }
          }, 1500);
        });
        
        try {
          // ABORDAGEM CORRIGIDA: Usar signInWithOAuth do Supabase mas com controle total
          console.log('🔧 Obtendo URL OAuth oficial do Supabase...');
          
          // Detectar plataforma e configurar redirect correto
          const isNative = Capacitor.isNativePlatform();
          const redirectUrl = isNative ? 'com.timothy.stater://auth/callback' : window.location.origin + '/auth/callback';

          console.log('🔧 Plataforma detectada:', isNative ? 'Native' : 'Web');
          console.log('🎯 Redirect URL configurado:', redirectUrl);

          // Obter URL OAuth OFICIAL do Supabase com configurações corretas
          console.log('🔧 Chamando signInWithOAuth com redirectTo:', redirectUrl);
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              skipBrowserRedirect: true, // IMPORTANTE: não abrir browser automaticamente
              redirectTo: redirectUrl, // Deep link correto baseado na plataforma
              queryParams: {
                access_type: 'offline',
                prompt: 'consent'
              }
            }
          });

          if (error) {
            console.error('❌ Erro ao obter URL OAuth:', error);
            throw error;
          }

          if (!data?.url) {
            console.error('❌ URL OAuth não retornada pelo Supabase');
            throw new Error('URL OAuth não disponível');
          }

          console.log('🌐 URL OAuth retornada pelo Supabase:', data.url);

          // VERIFICAÇÃO: Verificar se o Supabase respeitou nosso redirectTo
          const urlObjCheck = new URL(data.url);
          const actualRedirectTo = urlObjCheck.searchParams.get('redirect_to');
          console.log('📋 Redirect retornado pelo Supabase:', actualRedirectTo);
          console.log('🎯 Redirect esperado:', redirectUrl);

          if (actualRedirectTo !== redirectUrl) {
            console.warn('⚠️ Supabase ignorou redirectTo! Usando valor padrão');
            console.log('🔧 Aplicando correção manual...');
          }          // Analisar e corrigir URL se necessário
          const urlObj = new URL(data.url);
          const currentRedirectTo = urlObj.searchParams.get('redirect_to');
          console.log('📋 Redirect atual na URL:', currentRedirectTo);
          
          // Usar função para forçar deep link em plataformas nativas
          console.log('🔧 Chamando forceDeepLinkUrl()...');
          const finalUrl = forceDeepLinkUrl(data.url);
          console.log('✅ forceDeepLinkUrl() retornou:', finalUrl);
          
          if (finalUrl !== data.url) {
            console.warn('⚠️ URL OAuth foi corrigida para usar deep link');
            console.log('🔄 Diferença:', {
              original: data.url,
              corrigida: finalUrl
            });
          } else {
            console.log('✅ URL OAuth já estava correta');
          }
          
          // USAR CUSTOM CHROME TABS INTERNO (SOLUÇÃO DEFINITIVA)
          console.log('� Abrindo OAuth com Custom Chrome Tabs interno...');
          
          // Configurações otimizadas para Custom Chrome Tabs
          await Browser.open({
            url: finalUrl,
            presentationStyle: 'fullscreen',
            toolbarColor: '#31518b'
          });
          
          console.log('✅ Custom Chrome Tabs aberto com configurações otimizadas');          // Timeout de segurança
          setTimeout(() => {
            if (!authCompleted) {
              authCompleted = true;
              console.warn('⏰ Timeout no login Google');
              appListener.remove();
              browserListener.remove();
              Browser.close();
              reject(new Error('Timeout no login'));
            }
          }, 120000);
          
        } catch (error) {
          console.error('❌ Erro ao abrir browser:', error);
          appListener.remove();
          browserListener.remove();
          reject(error);
        }
      });
      
    } else {
      // SOLUÇÃO WEB: OAuth nativo
      console.log('🌐 Usando OAuth nativo para web');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('❌ Erro no OAuth web:', error);
        throw error;
      }

      console.log('✅ OAuth web iniciado com sucesso');
      return data;
    }
    
  } catch (error: any) {
    console.error('❌ Erro ao fazer login com Google:', error);
    throw error;
  }
};

/**
 * Logout do usuário
 */
export const signOut = async () => {
  try {
    console.log('👋 Fazendo logout...');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Erro ao fazer logout:', error);
      throw error;
    }
    
    console.log('✅ Logout realizado com sucesso');
  } catch (error: any) {
    console.error('❌ Erro ao fazer logout:', error);
    throw error;
  }
};

/**
 * Verificar se o usuário está autenticado
 */
export const isGoogleAuthenticated = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return false;
  }
};

/**
 * Obter dados do usuário atual
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Erro ao obter usuário:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('❌ Erro ao obter usuário:', error);
    return null;
  }
};

/**
 * Processar callback de autenticação (para deep links no mobile)
 */
export const handleAuthCallback = async (url: string) => {
  try {
    console.log('🔄 Processando callback de autenticação:', url);
    // Normalizar URL (fragment ou query)
    const hashPart = url.includes('#') ? url.substring(url.indexOf('#') + 1) : '';
    const queryPart = url.includes('?') ? url.substring(url.indexOf('?') + 1) : '';
    const paramsSource = hashPart || queryPart;
    const urlParams = new URLSearchParams(paramsSource);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const code = urlParams.get('code');

    console.log('🔍 Parametros extraídos do deep link:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasCode: !!code
    });

    // Caso 1: Tokens presentes diretamente (fluxo implicit / token hash)
    if (accessToken && refreshToken) {
      try {
        console.log('🧩 Ajustando sessão manualmente com setSession...');
        // @ts-ignore - dependendo da versão pode exigir objeto completo
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (error) {
          console.warn('⚠️ Falha setSession, tentando getUser direto:', error.message);
        } else {
          console.log('✅ Sessão ajustada via setSession');
          return data?.user || null;
        }
      } catch (e:any) {
        console.warn('⚠️ Erro ao setSession:', e?.message);
      }
    }

    // Caso 2: Código de autorização (PKCE)
    if (code) {
      try {
        console.log('🔐 Trocando código por sessão (exchangeCodeForSession)...');
        // @ts-ignore versão recente
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('❌ Erro exchangeCodeForSession:', error.message);
        } else if (data?.session) {
          console.log('✅ Sessão obtida via código');
          return data.session.user;
        }
      } catch (e:any) {
        console.error('❌ Exceção exchangeCodeForSession:', e?.message);
      }
    }

    // Fallback: tentar polling curto por sessão já estabelecida (talvez plugin já salvou)
    for (let i=0;i<5;i++) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('✅ Sessão encontrada no polling fallback');
        return session.user;
      }
      await new Promise(r=>setTimeout(r, 400));
    }

    console.warn('⚠️ Nenhum token/código processado no callback');
    return null;
  } catch (error) {
    console.error('❌ Erro ao processar callback:', error);
    return null;
  }
};
