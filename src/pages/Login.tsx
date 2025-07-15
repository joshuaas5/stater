
import React, { useEffect } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if there's an authentication flow in progress
    const handleAuthRedirect = async () => {
      // Verificar se o usuário acabou de fazer logout manualmente
      const isManualLogout = localStorage.getItem('manual_logout') === 'true';
      
      // Se for um logout manual, não redirecionar automaticamente
      if (isManualLogout) {
        return;
      }
      
      // Check URL for auth parameters
      const params = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      console.log("Auth redirect - URL params:", Object.fromEntries(params));
      console.log("Auth redirect - Hash params:", Object.fromEntries(hashParams));
      
      // Check for Supabase auth redirect (Google auth)
      if (params.get('provider') || hashParams.get('provider')) {
        const provider = params.get('provider') || hashParams.get('provider');
        
        toast({
          title: `Login com ${provider} concluído`,
          description: "Autenticação realizada com sucesso!",
        });
        
        // Redirect to dashboard after successful auth
        setTimeout(() => navigate('/dashboard'), 1000);
        return;
      }
      
      // Check if there's a session
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
    };
    
    handleAuthRedirect();
  }, [location, navigate, toast]);
  
  return (
    <div className="min-h-screen bg-galileo-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo em destaque */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <img 
                src="/stater-logo.png" 
                alt="Stater - Assistente Financeiro IA" 
                className="relative h-20 w-20 rounded-2xl shadow-2xl ring-4 ring-indigo-600/20 hover:ring-indigo-600/40 transition-all duration-300"
              />
            </div>
          </div>
          
          <h1 className="text-6xl font-space-grotesk font-bold text-galileo-text">Stater</h1>
          <p className="text-galileo-secondaryText mt-2 font-space-grotesk font-bold text-lg">Inteligência para prosperar</p>
        </div>
        
        <AuthForm />
      </div>
    </div>
  );
};

export default Login;
