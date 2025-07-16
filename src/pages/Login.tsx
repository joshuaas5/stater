
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
          <div className="flex justify-center mb-4">
            <img 
              src="/stater-logo.png" 
              alt="Stater Logo" 
              className="h-16 w-16 md:h-20 md:w-20 object-contain"
            />
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
