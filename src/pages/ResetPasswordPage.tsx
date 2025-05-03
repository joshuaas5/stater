
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const checkSession = async () => {
      console.log("Current URL:", window.location.href);
      
      // Get session to check if user is already logged in
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        console.log("User already has a session");
        setHasSession(true);
        return;
      }
      
      // Parse hash parameters from URL (Supabase adds them after # for security)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      console.log("Hash params:", { accessToken, type });
      
      if (accessToken && type === 'recovery') {
        // Save the token for later use with updateUser
        setToken(accessToken);
        
        // Set the session using the recovery token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });
        
        if (error) {
          console.error("Error setting session:", error);
          toast({
            title: "Link inválido",
            description: "Este link de redefinição de senha é inválido ou expirou",
            variant: "destructive"
          });
          navigate('/login');
        }
      } else {
        // Check for URL parameters (older approach)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const urlType = urlParams.get('type');
        
        console.log("URL params:", { urlToken, urlType });
        
        if (!urlToken || urlType !== 'recovery') {
          toast({
            title: "Link inválido",
            description: "Este link de redefinição de senha é inválido ou expirou",
            variant: "destructive"
          });
          navigate('/login');
        }
      }
    };
    
    checkSession();
  }, [navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: t('passwordsDontMatch'),
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      console.log("Updating password...");
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      });
      
      if (error) {
        console.error("Error updating password:", error);
        throw error;
      }
      
      console.log("Password reset successful");
      toast({
        title: "Senha redefinida com sucesso",
        description: "Você pode fazer login com sua nova senha"
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error("Exception in password reset:", error);
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Ocorreu um erro ao redefinir sua senha",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-galileo-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-galileo-text">Sprout</h1>
          <p className="text-galileo-secondaryText mt-2">
            {t('resetPassword')}
          </p>
        </div>
        
        <div className="p-6 bg-galileo-card rounded-lg shadow-lg max-w-md w-full mx-auto animate-scale-in">
          <h2 className="text-2xl font-bold mb-6 text-center text-galileo-text flex items-center justify-center gap-2">
            <KeyRound size={20} />
            {t('resetPassword')}
          </h2>
          
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="new-password" className="block text-sm font-medium text-galileo-secondaryText mb-1">
                {t('password')}
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-galileo-background text-galileo-text border-galileo-border pr-10"
                  placeholder="********"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirm-new-password" className="block text-sm font-medium text-galileo-secondaryText mb-1">
                {t('confirmPassword')}
              </Label>
              <Input
                id="confirm-new-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-galileo-background text-galileo-text border-galileo-border"
                placeholder="********"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-galileo-accent hover:bg-galileo-secondaryText text-galileo-text"
              disabled={loading}
            >
              {loading ? "Processando..." : t('resetPassword')}
            </Button>
            
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="text-galileo-secondaryText hover:text-galileo-text text-sm"
              >
                {t('backToLogin')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
