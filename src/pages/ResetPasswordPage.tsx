
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Verificar se temos um hash na URL (link de redefinição de senha)
    const getHashParams = () => {
      const hash = window.location.hash.substring(1);
      const params: Record<string, string> = {};
      
      if (!hash) return params;
      
      const hashParts = hash.split('&');
      
      hashParts.forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      });
      
      return params;
    };
    
    const params = getHashParams();
    
    if (!params['type'] || params['type'] !== 'recovery') {
      // Verificar se o usuário foi redirecionado por um token na URL
      const accessToken = new URLSearchParams(window.location.search).get('access_token');
      if (!accessToken) {
        toast({
          title: "Link inválido",
          description: "Este link de redefinição de senha é inválido ou expirou",
          variant: "destructive"
        });
        navigate('/login');
      }
    }
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
      
      // Verificar se há um token na URL (caso o usuário venha do email)
      const accessToken = new URLSearchParams(window.location.search).get('access_token');
      
      let error;
      
      if (accessToken) {
        // Use updateUser without the accessToken in the options object since it's not a valid property
        const { error: updateError } = await supabase.auth.updateUser({ password });
        error = updateError;
      } else {
        // Caso contrário, assume que o usuário já está autenticado
        const { error: updateError } = await supabase.auth.updateUser({ password });
        error = updateError;
      }
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Senha redefinida com sucesso",
        description: "Você pode fazer login com sua nova senha"
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message,
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
