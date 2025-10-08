import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { saveUser, clearUserData, getCurrentUser } from '@/utils/localStorage';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

// 🔧 CORREÇÃO CRÍTICA: Importação dinâmica do googleAuth para evitar tela azul
// Não importar estaticamente para evitar execução de código no load inicial

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔧 CORREÇÃO: Função para limpar URL após processamento de tokens OAuth
const cleanUrlAfterAuth = () => {
  if (window.location.hash) {
    const fragment = window.location.hash;
    if (fragment.includes('access_token=') || 
        fragment.includes('refresh_token=') ||
        fragment.includes('error=') ||
        fragment.includes('type=')) {
      
      console.log('🔧 [AUTH] OAuth processado - limpando tokens da URL imediatamente.');
      
      try {
        const cleanUrl = window.location.href.split('#')[0];
        window.history.replaceState({}, document.title, cleanUrl);
        console.log('🔧 [AUTH] URL limpa:', window.location.href);
      } catch (error) {
        console.error('🔧 [AUTH] Erro ao limpar URL:', error);
      }
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const { toast } = useToast();

  // 🔧 CORREÇÃO: Limpar o 'manual_logout' no início para evitar loops
  useEffect(() => {
    if (localStorage.getItem('manual_logout')) {
      console.log('🔧 [AUTH] Limpando flag de logout manual antiga.');
      localStorage.removeItem('manual_logout');
    }
  }, []);

  // 🔧 CORREÇÃO: Função para processar mudanças de auth sem loops
  const processAuthChange = useCallback((session: Session | null) => {
    if (isProcessingAuth) {
      console.log('🔧 [AUTH] Já processando autenticação - ignorando');
      return;
    }
    
    setIsProcessingAuth(true);
    
    try {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('🔧 [AUTH] Usuário autenticado:', session.user.id);
        
        // Salvar dados do usuário localmente
        saveUser({
          id: session.user.id,
          username: session.user.user_metadata.username || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
        });
        
        // Limpar fragments OAuth da URL
        cleanUrlAfterAuth();
      } else {
        console.log('🔧 [AUTH] Usuário deslogado - limpando dados locais');
        clearUserData();
      }
    } catch (error) {
      console.error('🔧 [AUTH] Erro ao processar mudança de auth:', error);
    } finally {
      setIsProcessingAuth(false);
      setLoading(false);
    }
  }, [isProcessingAuth]);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 AuthContext: Inicializando...');
      
      try {
        // Limpar fragments vazios imediatamente
        if (window.location.hash === '#' || window.location.hash === '#/') {
          const cleanUrl = window.location.href.split('#')[0];
          window.history.replaceState({}, document.title, cleanUrl);
          console.log('🔧 [AUTH] Fragment vazio removido');
        }
        
        // 🔧 CORREÇÃO: NÃO inicializar Google Auth automaticamente
        // Causa erro "message port closed" e tela azul
        // Google Auth só deve ser inicializado quando usuário clicar no botão
        console.log('✅ [AUTH] Google Auth será inicializado sob demanda (não automaticamente)');
        
        // Get initial session - sempre executar
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao carregar sessão:', error);
        } else {
          console.log('🔐 AuthContext: Sessão inicial:', session ? '✅ Logado' : '❌ Não logado');
        }
        
        processAuthChange(session);
        
      } catch (error: any) {
        console.error('❌ Erro crítico na inicialização:', error);
        // Mesmo com erro, liberar o loading
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      console.log('🔐 AuthContext: Mudança de estado:', event, session ? '✅ Logado' : '❌ Deslogado');
      
      // Processar mudança de forma controlada
      processAuthChange(session);
    });

    // 📱 Listen for deep links (mobile OAuth redirect)
    let appUrlListener: any = null;
    if (Capacitor.isNativePlatform()) {
      appUrlListener = App.addListener('appUrlOpen', async ({ url }) => {
        console.log('🔗 Deep link recebido:', url);
        
        // Ignorar deep links se login nativo está em progresso
        const nativeLoginInProgress = localStorage.getItem('native_login_in_progress');
        if (nativeLoginInProgress === 'true') {
          console.log('⏭️ [AUTH] Ignorando deep link - login nativo em progresso');
          return;
        }
        
        // ✅ IGNORAR DEEP LINKS POR 3 SEGUNDOS APÓS LOGIN NATIVO COMPLETO
        const nativeLoginCompleted = localStorage.getItem('native_login_completed');
        if (nativeLoginCompleted === 'true') {
          console.log('🚫 [AUTH] Ignorando deep link - login nativo recém completado');
          // Limpar flag após 3 segundos
          setTimeout(() => {
            localStorage.removeItem('native_login_completed');
          }, 3000);
          return;
        }
        
        // � CORREÇÃO DEFINITIVA: Processar corretamente os tokens OAuth
        if (url.includes('callback')) {
          try {
            // Extrair parâmetros da URL do deep link
            const urlParts = url.split('#');
            if (urlParts.length > 1) {
              const hashFragment = urlParts[1];
              const params = new URLSearchParams(hashFragment);
              
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              console.log('🔐 Tokens encontrados:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
              
              if (accessToken) {
                // Estabelecer sessão com os tokens recebidos
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || ''
                });
                
                if (error) {
                  console.error('❌ Erro ao estabelecer sessão:', error);
                } else {
                  console.log('✅ Sessão OAuth estabelecida com sucesso via deep link!');
                  processAuthChange(data.session);
                }
              }
            }
          } catch (error) {
            console.error('❌ Erro ao processar deep link OAuth:', error);
          }
        }
      });
    }

    return () => {
      console.log('🔐 AuthContext: Cleanup...');
      subscription.unsubscribe();
      if (appUrlListener) {
        appUrlListener.remove();
      }
    };
  }, [processAuthChange]);

  const signOut = async () => {
    try {
      console.log('🔐 AuthContext: Fazendo logout...');
      
      // Marcar logout manual
      localStorage.setItem('manual_logout', 'true');
      
      // 🔧 CORREÇÃO: Fazer logout direto do Supabase (não chamar signOutGoogle que já chama signOut)
      // Isso evita loop/deadlock
      await supabase.auth.signOut();
      
      // Limpar URL após logout
      const cleanUrl = window.location.href.split('#')[0];
      window.history.replaceState({}, document.title, cleanUrl);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao desconectar",
        variant: "destructive",
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('[AUTH] Iniciando login com Google');
      
      // Remover flag de logout manual
      localStorage.removeItem('manual_logout');
      
      // 🔧 CORREÇÃO: Importação dinâmica para evitar tela azul no APK
      const { signInWithGoogle: hybridGoogleSignIn } = await import('@/utils/googleAuth');
      
      // Usar implementação híbrida (web + mobile)
      await hybridGoogleSignIn();
      console.log('[AUTH] Login com Google processado');
      
    } catch (error: any) {
      console.error('[AUTH] Erro no login Google:', error);
      
      // 🔧 CORREÇÃO: NÃO quebrar app se Google falhar
      // Apenas mostrar mensagem amigável
      if (error?.message !== 'popup_closed_by_user') {
        toast({
          title: "Erro no login",
          description: "Não foi possível conectar com Google. Tente fazer login com email.",
          variant: "destructive",
        });
      }

      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Fazendo login...');
      
      // Remover flag de logout manual
      localStorage.removeItem('manual_logout');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Login realizado",
        description: "Bem-vindo de volta!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Fazendo cadastro...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar a conta",
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao criar conta",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
