import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { saveUser, clearUserData, getCurrentUser } from '@/utils/localStorage';
import { BiometricService } from '@/services/BiometricService';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithBiometrics: () => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  saveBiometricCredentials: (email: string, password: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔧 CORREÇÃO: Função para limpar URL após processamento de tokens
const cleanUrlAfterAuth = (delay = 500) => {
  // Verificar se há fragmentos na URL
  if (window.location.hash) {
    const fragment = window.location.hash;
    if (fragment.includes('access_token=') || 
        fragment.includes('refresh_token=') ||
        fragment.includes('error=') ||
        fragment.includes('type=')) {
      
      console.log('🔧 [AUTH] Login processado - limpando tokens da URL');
      
      // Aguardar para garantir que tudo foi processado pelo Supabase
      setTimeout(() => {
        try {
          const cleanUrl = window.location.href.split('#')[0]; // Remove tudo após #
          window.history.replaceState({}, document.title, cleanUrl);
          console.log('🔧 [AUTH] URL limpa após login:', window.location.href);
        } catch (error) {
          console.error('🔧 [AUTH] Erro ao limpar URL:', error);
        }
      }, delay);
    } else if (fragment === '#' || fragment === '#/') {
      // Fragment vazio - remover imediatamente
      try {
        const cleanUrl = window.location.href.split('#')[0]; // Remove tudo após #
        window.history.replaceState({}, document.title, cleanUrl);
        console.log('🔧 [AUTH] Fragment vazio removido:', window.location.href);
      } catch (error) {
        console.error('🔧 [AUTH] Erro ao remover fragment vazio:', error);
      }
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // 🔧 CORREÇÃO: Manter controle de login para evitar recargas duplicadas
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  
  // 🔧 CORREÇÃO: Função para processar login de forma segura
  const processLogin = useCallback((session: Session | null) => {
    if (isProcessingAuth) {
      console.log('🔧 [AUTH] Já está processando autenticação - ignorando');
      return;
    }
    
    setIsProcessingAuth(true);
    
    try {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('🔧 [AUTH] Usuário autenticado:', session.user.id);
        
        // Salvar no localStorage para acesso offline
        saveUser({
          id: session.user.id,
          username: session.user.user_metadata.username || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
        });
        
        // Limpar URL de tokens depois que o login for processado
        cleanUrlAfterAuth(800);
      }
    } catch (error) {
      console.error('🔧 [AUTH] Erro ao processar login:', error);
    } finally {
      setIsProcessingAuth(false);
      setLoading(false);
    }
  }, [isProcessingAuth]);

  useEffect(() => {
    console.log('🔧 [AUTH] Inicializando AuthProvider');
    
    // Limpar fragments vazios imediatamente
    if (window.location.hash === '#' || window.location.hash === '#/') {
      const cleanUrl = window.location.href.split('#')[0];
      window.history.replaceState({}, document.title, cleanUrl);
      console.log('🔧 [AUTH] Fragment vazio removido na inicialização');
    }
    
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔧 [AUTH] Sessão inicial verificada');
      processLogin(session);
    });

    // Escutar por mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔧 [AUTH] Evento de autenticação:', event);
      
      processLogin(session);
      
      if (session?.user) {
        // Se é um novo login via Google ou email confirmado, garantir que o perfil existe
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (!existingProfile) {
              // Determinar o auth_provider baseado no provider do usuário
              const authProvider = session.user.app_metadata.provider || 'email';
              
              // Criar perfil se não existir
              const { error: profileError } = await supabase.from('profiles').insert([
                { 
                  id: session.user.id,
                  username: session.user.user_metadata.username || session.user.email?.split('@')[0] || '',
                  email: session.user.email || '',
                  auth_provider: authProvider
                }
              ]);
              
              if (profileError) {
                console.error("🔧 [AUTH] Erro ao criar perfil automaticamente:", profileError);
              } else {
                console.log("🔧 [AUTH] Perfil criado automaticamente");
              }
            }
          } catch (error) {
            console.error("🔧 [AUTH] Erro ao verificar/criar perfil:", error);
          }
        }
      }
    });

    return () => {
      console.log('🔧 [AUTH] Limpando subscription de auth');
      subscription.unsubscribe();
    };
  }, [processLogin]);

  // Restante do código do AuthProvider...

  // Mantenha o restante do código como está, apenas acrescentando logs de debug onde apropriado

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn: async (email, password) => {
          try {
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (error) throw error;
          } catch (error: any) {
            toast({
              title: "Erro ao fazer login",
              description: error.message,
              variant: "destructive",
            });
            throw error;
          }
        },
        signUp: async (email, password, username) => {
          try {
            const { error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  username,
                },
              },
            });
            if (error) throw error;
            toast({
              title: "Cadastro realizado!",
              description: "Verifique seu email para confirmar a conta.",
            });
          } catch (error: any) {
            toast({
              title: "Erro no cadastro",
              description: error.message,
              variant: "destructive",
            });
            throw error;
          }
        },
        signInWithGoogle: async () => {
          try {
            console.log('🔧 [AUTH] Iniciando login com Google');
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: window.location.origin,
              },
            });
            if (error) throw error;
          } catch (error: any) {
            console.error('🔧 [AUTH] Erro no login com Google:', error);
            toast({
              title: "Erro no login com Google",
              description: error.message,
              variant: "destructive",
            });
            throw error;
          }
        },
        signInWithBiometrics: async () => {
          try {
            const bioService = new BiometricService();
            const savedUser = getCurrentUser();
            if (!savedUser || !savedUser.email) {
              toast({
                title: "Erro de biometria",
                description: "Nenhum usuário encontrado para autenticação biométrica",
                variant: "destructive",
              });
              return false;
            }
            
            const result = await bioService.authenticate(savedUser.email);
            if (!result.success) {
              toast({
                title: "Erro de biometria",
                description: result.error || "Falha na autenticação biométrica",
                variant: "destructive",
              });
              return false;
            }
            
            // Use as credenciais recuperadas
            const { email, password } = result.credentials;
            if (!email || !password) {
              toast({
                title: "Erro de biometria",
                description: "Credenciais incompletas",
                variant: "destructive",
              });
              return false;
            }
            
            // Login com as credenciais recuperadas
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (error) {
              toast({
                title: "Erro no login",
                description: error.message,
                variant: "destructive",
              });
              return false;
            }
            
            return true;
          } catch (error: any) {
            toast({
              title: "Erro de biometria",
              description: error.message || "Ocorreu um erro na autenticação biométrica",
              variant: "destructive",
            });
            return false;
          }
        },
        signOut: async () => {
          try {
            console.log('🔧 [AUTH] Iniciando logout');
            clearUserData();
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            // Remover qualquer fragment da URL ao fazer logout
            const cleanUrl = window.location.href.split('#')[0];
            window.history.replaceState({}, document.title, cleanUrl);
          } catch (error: any) {
            console.error('🔧 [AUTH] Erro ao fazer logout:', error);
            toast({
              title: "Erro ao sair",
              description: error.message,
              variant: "destructive",
            });
            throw error;
          }
        },
        resetPassword: async (email) => {
          try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            toast({
              title: "Email enviado",
              description: "Verifique sua caixa de entrada para redefinir sua senha.",
            });
          } catch (error: any) {
            toast({
              title: "Erro ao enviar email",
              description: error.message,
              variant: "destructive",
            });
            throw error;
          }
        },
        saveBiometricCredentials: async (email, password) => {
          try {
            const bioService = new BiometricService();
            const result = await bioService.saveBiometricCredential(email, password);
            
            if (!result.success) {
              toast({
                title: "Erro ao salvar biometria",
                description: result.error || "Não foi possível configurar a biometria",
                variant: "destructive",
              });
              return false;
            }
            
            toast({
              title: "Biometria configurada",
              description: "Agora você pode fazer login com sua biometria",
            });
            
            return true;
          } catch (error: any) {
            toast({
              title: "Erro de biometria",
              description: error.message || "Ocorreu um erro ao configurar a biometria",
              variant: "destructive",
            });
            return false;
          }
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
