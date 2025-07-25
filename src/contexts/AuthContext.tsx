import * as React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔐 AuthContext: Inicializando...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 AuthContext: Sessão inicial:', session ? '✅ Logado' : '❌ Não logado');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error: any) => {
      console.error('❌ Erro ao carregar sessão:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      console.log('🔐 AuthContext: Mudança de estado:', event, session ? '✅ Logado' : '❌ Deslogado');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('🔐 AuthContext: Cleanup...');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('🔐 AuthContext: Fazendo logout...');
      await supabase.auth.signOut();
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

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Fazendo login...');
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
