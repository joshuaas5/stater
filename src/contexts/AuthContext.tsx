import React, { createContext, useState, useContext, useEffect } from 'react';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Store user in local storage for offline access
        saveUser({
          id: session.user.id,
          username: session.user.user_metadata.username || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
        });
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
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
        clearUserData();
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      
      // Primeiro, verificar se o usuário já existe no sistema
      const { data: existingUsers, error: queryError } = await supabase
        .from('profiles')
        .select('email, auth_provider')
        .eq('email', email);
      
      if (queryError) {
        console.error("Erro ao verificar usuário existente:", queryError);
      }
      
      // Se encontrou usuário, verificar como ele foi criado
      if (existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        
        // Se foi criado via Google OAuth
        if (existingUser.auth_provider === 'google') {
          toast({
            title: "📧 Email já registrado",
            description: "Este email já possui uma conta criada via Google. Use o botão 'Continuar com Google' para fazer login.",
            variant: "destructive",
            duration: 6000
          });
          return;
        }
        
        // Se foi criado via email mas não confirmado, pode tentar reenviar
        toast({
          title: "📧 Email já registrado",
          description: "Este email já possui uma conta. Faça login ou recupere sua senha se não lembrar.",
          variant: "destructive",
          duration: 6000
        });
        return;
      }
      
      // Tentar criar nova conta
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
        if (error.message?.includes("User already registered")) {
          toast({
            title: "📧 Email já registrado",
            description: "Este email já possui uma conta. Verifique sua caixa de entrada para emails de confirmação anteriores ou faça login.",
            variant: "destructive",
            duration: 6000
          });
          return;
        }
        throw error;
      }
      
      // Se o usuário foi criado mas precisa de confirmação
      if (data.user && !data.session) {
        // Tentar criar perfil mesmo sem confirmação (para preparar)
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
          // Não falhar por causa disso, perfil será criado na confirmação
        }
        
        toast({
          title: "Quase lá! 📧",
          description: "Enviamos um email de confirmação para " + email + ". Verifique sua caixa de entrada e spam.",
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
      
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      
      let errorMessage = "Erro ao criar conta";
      
      if (error.message?.includes("Invalid email")) {
        errorMessage = "Por favor, insira um email válido";
      } else if (error.message?.includes("Password")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres";
      } else if (error.message?.includes("already registered")) {
        errorMessage = "Este email já está registrado. Faça login ou recupere sua senha.";
      }
      
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
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
