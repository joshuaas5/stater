import { Capacitor, PluginListenerHandle } from '@capacitor/core';
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
  const supabaseCallback = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/callback`;

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

      const { data: existingSession } = await supabase.auth.getSession();
      if (existingSession?.session) {
        console.log('✅ Sessão já ativa, não precisa fazer login');
        return { data: existingSession, error: null };
      }

      const { Browser } = await import('@capacitor/browser');
      const { App } = await import('@capacitor/app');

      await Browser.removeAllListeners();

      const waitForSession = async (attempts = 12, delay = 500) => {
        for (let i = 0; i < attempts; i++) {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            return data;
          }
          await new Promise((resolveDelay) => setTimeout(resolveDelay, delay));
        }
        return null;
      };

      const buildOAuthUrl = async () => {
        const redirectUrl = 'com.timothy.stater://auth/callback';
        console.log('🔧 Chamando signInWithOAuth com redirectTo:', redirectUrl);

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            skipBrowserRedirect: true,
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
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
        const urlObjCheck = new URL(data.url);
        console.log('📋 Redirect retornado pelo Supabase:', urlObjCheck.searchParams.get('redirect_to'));

        const finalUrl = forceDeepLinkUrl(data.url);
        if (finalUrl !== data.url) {
          console.warn('⚠️ URL OAuth foi corrigida para usar deep link', {
            original: data.url,
            corrigida: finalUrl,
          });
        } else {
          console.log('✅ URL OAuth já estava correta');
        }

        return finalUrl;
      };

      const finalUrl = await buildOAuthUrl();
      let deepLinkListener: PluginListenerHandle | null = null;

      try {
        // Prepara a promessa para aguardar o deep link
        const sessionPromise = new Promise<any>((resolve, reject) => {
          deepLinkListener = App.addListener('appUrlOpen', async (data) => {
            console.log('📬 [2] Deep link recebido:', data.url);
            if (data.url.includes('access_token') && data.url.includes('refresh_token')) {
              console.log('✨ [3] URL contém tokens, tentando estabelecer sessão...');

              const hash = data.url.split('#')[1];
              if (hash) {
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                  console.log('🔧 [4] Configurando sessão manualmente com tokens recebidos.');
                  const { error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                  });

                  if (sessionError) {
                    console.error('❌ [5] Erro ao configurar sessão com tokens:', sessionError);
                    reject(sessionError);
                  } else {
                    console.log('✅ [5] Sessão configurada com sucesso via deep link!');
                    const { data: sessionData } = await supabase.auth.getSession();
                    resolve(sessionData);
                  }
                }
              }
            }
          });
        });

        console.log('🚀 [1] Abrindo browser nativo com a URL OAuth...');
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url: finalUrl, windowName: '_self' });

        // Aguarda a sessão ser estabelecida pelo listener ou um timeout
        const sessionData = await Promise.race([
          sessionPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de 20s esperando pelo login')), 20000))
        ]);

        if (sessionData) {
          console.log('✅ [6] Sessão obtida com sucesso!');
          return { data: sessionData, error: null };
        } else {
          // Este caso não deve acontecer devido ao Promise.race rejeitar no timeout
          throw new Error('Login não concluído.');
        }
      } finally {
        // Garante que o listener seja removido em todos os cenários
        if (deepLinkListener) {
          console.log('🧹 Limpando listener de deep link.');
          deepLinkListener.remove();
        }
      }
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
