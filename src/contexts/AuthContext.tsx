
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Store user in local storage for offline access
        saveUser({
          id: session.user.id,
          username: session.user.user_metadata.username || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
        });
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
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Criar perfil no banco de dados
      const { error: profileError } = await supabase.from('profiles').insert([
        { 
          id: (await supabase.auth.getUser()).data.user?.id,
          username, 
          email 
        }
      ]);
      
      if (profileError) {
        console.error("Erro ao criar perfil:", profileError);
      }
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar sua conta"
      });
    } catch (error: any) {
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
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Se não houver URL, algo deu errado
      if (!data.url) {
        toast({
          title: "Erro ao fazer login com Google",
          description: "Não foi possível iniciar o processo de autenticação",
          variant: "destructive"
        });
      }
      
      // Redirecionar para o URL de autorização do Google
      window.location.href = data.url;
    } catch (error: any) {
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
    setLoading(true);
    await supabase.auth.signOut();
    clearUserData();
    setLoading(false);
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta"
    });
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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
