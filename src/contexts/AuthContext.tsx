import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { saveUser, clearUserData, getCurrentUser } from '@/utils/localStorage';
import { BiometricService } from '@/services/BiometricService';

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
    
    // Verificar se é logout manual
    const isManualLogout = localStorage.getItem('manual_logout') === 'true';
    if (isManualLogout && !session) {
      console.log('🔧 [AUTH] Logout manual detectado - não processar');
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }
    
    setIsProcessingAuth(true);
    
    try {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('🔧 [AUTH] Usuário autenticado:', session.user.id);
        
        // Limpar flag de logout manual se login bem-sucedido
        localStorage.removeItem('manual_logout');
        
        // Store user in local storage for offline access
        saveUser({
          id: session.user.id,
          username: session.user.user_metadata.username || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
        });
        
        // Limpar URL de tokens depois que o login for processado
        cleanUrlAfterAuth(800);
      } else {
        // Sem sessão - limpar dados apenas se não foi logout manual
        if (!isManualLogout) {
          clearUserData();
        }
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
    
    // Verificar se é logout manual
    const isManualLogout = localStorage.getItem('manual_logout') === 'true';
    if (isManualLogout) {
      console.log('🔧 [AUTH] Logout manual detectado - não restaurar sessão');
      setLoading(false);
      return;
    }
    
    // Limpar fragments vazios imediatamente
    if (window.location.hash === '#' || window.location.hash === '#/') {
      const cleanUrl = window.location.href.split('#')[0];
      window.history.replaceState({}, document.title, cleanUrl);
      console.log('🔧 [AUTH] Fragment vazio removido na inicialização');
    }
    
    // Tentar restaurar sessão do localStorage primeiro (para rapidez)
    const savedUser = getCurrentUser();
    if (savedUser) {
      console.log('🔧 [AUTH] Usuário encontrado no localStorage:', savedUser.email);
    }
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔧 [AUTH] Sessão inicial verificada:', session ? 'Ativa' : 'Inativa');
      processLogin(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔧 [AUTH] Evento de autenticação:', event);
      
      processLogin(session);
      
      // 🔧 LIMPAR fragment após processamento de tokens do Supabase - mantido por compatibilidade
      if (event === 'SIGNED_IN' && window.location.hash) {
        const fragment = window.location.hash;
        if (fragment.includes('access_token=') || 
            fragment.includes('refresh_token=') ||
            fragment.includes('error=') ||
            fragment.includes('type=')) {
          console.log('🔧 [AUTH] Login processado - limpando tokens da URL');
          setTimeout(() => {
            const cleanUrl = window.location.href.split('#')[0];
            window.history.replaceState({}, document.title, cleanUrl);
            console.log('🔧 [AUTH] URL limpa após login:', window.location.href);
          }, 1000); // Aguardar 1 segundo para garantir que tudo foi processado
        }
      }
      
      if (session?.user) {
        // Store user in local storage for offline access
        saveUser({
          id: session.user.id,
          username: session.user.user_metadata.username || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
        });
        
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
                console.error("Erro ao criar perfil automaticamente:", profileError);
              } else {
                console.log("Perfil criado automaticamente para usuário:", session.user.email);
              }
            }
          } catch (error) {
            console.error("Erro ao verificar/criar perfil:", error);
          }
        }
      } else {
        // Só limpar dados se não foi logout manual
        const isManualLogout = localStorage.getItem('manual_logout') === 'true';
        if (!isManualLogout) {
          clearUserData();
        }
      }
      
      setLoading(false);
    });

    return () => {
      console.log('🔧 [AUTH] Limpando subscription de auth');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta"
      });
    } catch (error: any) {
      console.error("Erro no login:", error);
      
      let errorMessage = "Erro ao fazer login";
      let shouldRetry = false;
      
      // Traduzir mensagens de erro do Supabase
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos. Verifique suas credenciais e tente novamente.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Email não confirmado. Verifique sua caixa de entrada para confirmar sua conta.";
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "Email inválido. Por favor, insira um email válido.";
      } else if (error.status === 429 || error.message?.includes("Too many requests") || error.message?.includes("rate limit")) {
        errorMessage = "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.";
        shouldRetry = true;
      } else if (error.message?.includes("Network") || error.message?.includes("fetch")) {
        errorMessage = "Problema de conexão. Verifique sua internet e tente novamente.";
        shouldRetry = true;
      } else if (error.status >= 500) {
        errorMessage = "Erro temporário do servidor. Tente novamente em alguns minutos.";
        shouldRetry = true;
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage + (shouldRetry ? " Você pode tentar novamente." : ""),
        variant: "destructive",
        duration: shouldRetry ? 8000 : 5000
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      
      // VERIFICAÇÃO PRÉVIA MAIS ROBUSTA
      try {
        // 1. Verificar na tabela profiles primeiro (mais confiável)
        const { data: existingUsers } = await supabase
          .from('profiles')
          .select('email, auth_provider')
          .eq('email', email);
        
        if (existingUsers && existingUsers.length > 0) {
          const existingUser = existingUsers[0];
          const provider = existingUser.auth_provider || 'desconhecido';
          
          let message = "Este email já possui uma conta";
          if (provider === 'google') {
            message += " criada com Google. Use 'Entrar com Google' para fazer login.";
          } else if (provider === 'email') {
            message += ". Faça login normalmente ou recupere sua senha se necessário.";
          } else {
            message += ". Faça login ou recupere sua senha se necessário.";
          }
          
          toast({
            title: "Email já registrado",
            description: message,
            variant: "destructive",
            duration: 8000
          });
          return; // IMPORTANTE: sair da função aqui
        }
        
        // 2. Tentar função RPC como backup
        try {
          const { data: emailExists, error: rpcError } = await supabase.rpc('email_exists', {
            email_input: email
          });
          
          if (!rpcError && emailExists === true) {
            toast({
              title: "Email já registrado",
              description: "Este email já possui uma conta. Faça login ou recupere sua senha se necessário.",
              variant: "destructive",
              duration: 8000
            });
            return; // IMPORTANTE: sair da função aqui
          }
        } catch (rpcError) {
          console.log("Função RPC email_exists não disponível, continuando...");
        }
        
      } catch (verificationError) {
        console.log("Erro na verificação prévia, continuando com signup:", verificationError);
      }
      
      // Tentar criar nova conta diretamente
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username,
            auth_provider: 'email'
          },
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`
        }
      });
      
      if (error) {
        // Tratar erros específicos do Supabase
        if (error.message?.includes("User already registered") || 
            error.message?.includes("already been registered") ||
            error.message?.includes("already exists")) {
          toast({
            title: "Email já registrado",
            description: "Este email já possui uma conta. Faça login ou recupere sua senha se necessário.",
            variant: "destructive",
            duration: 8000
          });
          return; // IMPORTANTE: sair da função aqui em vez de ir para verificação de email
        }
        
        // Outros erros
        throw error;
      }
      
      // Se chegou aqui, verificar se realmente criou o usuário ou se já existia
      if (data.user && !data.session) {
        // Usuário criado, aguardando confirmação
        const { error: profileError } = await supabase.from('profiles').insert([
          { 
            id: data.user.id,
            username, 
            email,
            auth_provider: 'email'
          }
        ]);
        
        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
        }
        
        toast({
          title: "Confirmação enviada",
          description: `Enviamos um email de confirmação para ${email}. Verifique sua caixa de entrada e, se necessário, a pasta de spam.`,
          duration: 8000
        });
        return;
      }
      
      // Se o usuário foi criado e já está autenticado (confirmação desabilitada)
      if (data.user && data.session) {
        const { error: profileError } = await supabase.from('profiles').insert([
          { 
            id: data.user.id,
            username, 
            email,
            auth_provider: 'email'
          }
        ]);
        
        if (profileError) {
          console.error("Erro ao criar perfil:", profileError);
        }
        
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Bem-vindo ao Stater!"
        });
      }
      
      // Se não criou usuário nem sessão, pode ser email já existente
      if (!data.user && !data.session) {
        toast({
          title: "Email já registrado",
          description: "Este email já possui uma conta. Faça login ou recupere sua senha se necessário.",
          variant: "destructive",
          duration: 8000
        });
        return;
      }
      
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      
      let errorMessage = "Erro ao criar conta";
      let shouldRetry = false;
      
      // Verificar se é um erro de rate limit
      if (error.status === 429 || error.message?.includes("rate limit") || error.message?.includes("Too many requests")) {
        errorMessage = "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.";
        shouldRetry = true;
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "Por favor, insira um email válido";
      } else if (error.message?.includes("Password")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres";
      } else if (error.message?.includes("already registered")) {
        errorMessage = "Este email já está registrado. Faça login ou recupere sua senha.";
      } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
        shouldRetry = true;
      } else if (error.status >= 500) {
        errorMessage = "Erro temporário do servidor. Tente novamente em alguns minutos.";
        shouldRetry = true;
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage + (shouldRetry ? " Você pode tentar novamente." : ""),
        variant: "destructive",
        duration: shouldRetry ? 8000 : 5000
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // Fixed the Google authentication redirect URL to use the current origin
      const redirectTo = `${window.location.origin}/dashboard`;
      console.log("Google redirect URL:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error("Google auth error:", error);
        throw error;
      }
      
      // Se não houver URL, algo deu errado
      if (!data.url) {
        toast({
          title: "Erro ao fazer login com Google",
          description: "Não foi possível iniciar o processo de autenticação",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Redirecting to Google auth URL:", data.url);
      // Redirecionar para o URL de autorização do Google
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Google auth exception:", error);
      toast({
        title: "Erro ao fazer login com Google",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signInWithBiometrics = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Verificar identidade biométrica
      const isVerified = await BiometricService.verifyIdentity();
      
      if (!isVerified) {
        toast({
          title: "Autenticação biométrica falhou",
          description: "Não foi possível verificar sua identidade",
          variant: "destructive"
        });
        return false;
      }
      
      // Obter credenciais salvas
      const credentials = await BiometricService.getCredentials();
      
      if (!credentials) {
        toast({
          title: "Credenciais não encontradas",
          description: "Configure a biometria nas configurações de segurança",
          variant: "destructive"
        });
        return false;
      }
      
      // Login com as credenciais recuperadas
      await signIn(credentials.username, credentials.password);
      return true;
    } catch (error: any) {
      toast({
        title: "Erro na autenticação biométrica",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      // Limpar dados locais antes de fazer signOut no Supabase
      clearUserData();
      // Garantir que o estado do contexto seja limpo
      setUser(null);
      setSession(null);
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpar qualquer cache de autenticação que possa estar persistindo
      localStorage.removeItem('sb-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Limpar qualquer fragment da URL ao fazer logout
      if (window.location.hash) {
        try {
          console.log('🔧 [AUTH] Removendo fragments ao fazer logout');
          const cleanUrl = window.location.href.split('#')[0];
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (error) {
          console.error('🔧 [AUTH] Erro ao limpar URL no logout:', error);
        }
      }
      
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta"
      });
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para resetar senha
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      if (error) {
        throw error;
      }
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar credenciais biométricas
  const saveBiometricCredentials = async (email: string, password: string): Promise<boolean> => {
    return await BiometricService.saveCredentials(email, password);
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithBiometrics,
    signOut,
    resetPassword,
    saveBiometricCredentials
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
