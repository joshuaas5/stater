import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { saveUser, clearUserData, getCurrentUser } from '@/utils/localStorage';

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
    console.log('🔐 AuthContext: Inicializando com correções anti-loop...');
    
    // Limpar fragments vazios imediatamente
    if (window.location.hash === '#' || window.location.hash === '#/') {
      const cleanUrl = window.location.href.split('#')[0];
      window.history.replaceState({}, document.title, cleanUrl);
      console.log('🔧 [AUTH] Fragment vazio removido');
    }
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 AuthContext: Sessão inicial:', session ? '✅ Logado' : '❌ Não logado');
      processAuthChange(session);
    }).catch((error: any) => {
      console.error('❌ Erro ao carregar sessão:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      console.log('🔐 AuthContext: Mudança de estado:', event, session ? '✅ Logado' : '❌ Deslogado');
      
      // Processar mudança de forma controlada
      processAuthChange(session);
    });

    return () => {
      console.log('🔐 AuthContext: Cleanup...');
      subscription.unsubscribe();
    };
  }, [processAuthChange]);

  const signOut = async () => {
    try {
      console.log('🔐 AuthContext: Fazendo logout...');
      
      // Marcar logout manual
      localStorage.setItem('manual_logout', 'true');
      
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
      console.log('🔐 AuthContext: Iniciando login com Google...');
      
      // Remover flag de logout manual
      localStorage.removeItem('manual_logout');
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('❌ Erro no login com Google:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Erro ao conectar com Google",
        variant: "destructive",
      });
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
