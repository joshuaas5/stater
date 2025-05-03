
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { BiometricService } from '@/services/BiometricService';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'reset';

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [googleAuthInProgress, setGoogleAuthInProgress] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, signInWithBiometrics, resetPassword, loading, saveBiometricCredentials } = useAuth();
  const { t } = useTranslation();
  
  useEffect(() => {
    // Verificar se a biometria está disponível
    const checkBiometrics = async () => {
      try {
        const available = await BiometricService.isBiometricsAvailable();
        setIsBiometricsAvailable(available);
      } catch (error) {
        console.error("Error checking biometrics availability:", error);
        setIsBiometricsAvailable(false);
      }
    };
    
    checkBiometrics();
    
    // Verificar se o usuário foi redirecionado após um login com Google
    const params = new URLSearchParams(window.location.search);
    if (params.has('provider') && params.get('provider') === 'google') {
      toast({
        title: "Login com Google",
        description: "Autenticação com Google bem-sucedida!",
      });
    }
  }, [toast]);
  
  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setEmailSent(false);
    // Limpar os campos ao alternar entre modos
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'register') {
        // Validar os campos de registro
        if (!username || !email || !password || !confirmPassword) {
          toast({
            title: t('allFieldsRequired'),
            variant: "destructive"
          });
          return;
        }
        
        if (password !== confirmPassword) {
          toast({
            title: t('passwordsDontMatch'),
            variant: "destructive"
          });
          return;
        }
        
        await signUp(email, password, username);
        setEmailSent(true);
        
      } else if (mode === 'login') {
        // Validar campos de login
        if (!email || !password) {
          toast({
            title: t('pleaseFillAllFields'),
            variant: "destructive"
          });
          return;
        }
        
        await signIn(email, password);
        
        // Perguntar se deseja salvar as credenciais para login biométrico
        if (isBiometricsAvailable) {
          setTimeout(() => {
            const wantToSave = window.confirm("Deseja salvar suas credenciais para login biométrico?");
            if (wantToSave) {
              saveBiometricCredentials(email, password);
              toast({
                title: "Biometria configurada",
                description: "Você poderá fazer login com sua biometria a partir de agora"
              });
            }
          }, 1000);
        }
        
        navigate('/');
        
      } else if (mode === 'reset') {
        if (!email) {
          toast({
            title: t('emailRequired'),
            variant: "destructive"
          });
          return;
        }
        
        await resetPassword(email);
        setEmailSent(true);
      }
    } catch (error) {
      // Errors are handled in the auth context
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      setGoogleAuthInProgress(true);
      await signInWithGoogle();
      // Não é necessário navegar aqui, pois signInWithGoogle já redireciona para o Google
    } catch (error) {
      setGoogleAuthInProgress(false);
      // Error is handled in the auth context
    }
  };
  
  const handleBiometricSignIn = async () => {
    try {
      const success = await signInWithBiometrics();
      if (success) {
        navigate('/');
      }
    } catch (error) {
      // Error is handled in the auth context
    }
  };
  
  // Renderizar mensagem de confirmação quando o email for enviado
  if (emailSent) {
    return (
      <div className="p-6 bg-galileo-card rounded-lg shadow-lg max-w-md w-full mx-auto animate-scale-in">
        <div className="text-center">
          <Info size={48} className="mx-auto text-galileo-accent mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-galileo-text">
            {mode === 'register' ? "Verifique seu email" : "Email enviado"}
          </h2>
          <p className="text-galileo-secondaryText mb-6">
            {mode === 'register' 
              ? "Enviamos um email para você confirmar sua conta. Por favor, verifique sua caixa de entrada e siga as instruções." 
              : "Enviamos um link para redefinição de senha para seu email. Por favor, verifique sua caixa de entrada e siga as instruções para criar uma nova senha."
            }
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-galileo-accent hover:bg-galileo-secondaryText text-galileo-text"
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-galileo-card rounded-lg shadow-lg max-w-md w-full mx-auto animate-scale-in">
      <h2 className="text-2xl font-bold mb-6 text-center text-galileo-text">
        {mode === 'login' ? t('login') : mode === 'register' ? t('createAccount') : t('resetPassword')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <Label htmlFor="username" className="block text-sm font-medium text-galileo-secondaryText mb-1">
              {t('username')}
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-galileo-background text-galileo-text border-galileo-border"
              placeholder={t('yourUsername')}
            />
          </div>
        )}
        
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-galileo-secondaryText mb-1">
            {t('email')}
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-galileo-background text-galileo-text border-galileo-border"
            placeholder={t('emailPlaceholder')}
          />
        </div>
        
        {mode !== 'reset' && (
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-galileo-secondaryText mb-1">
              {t('password')}
            </Label>
            <div className="relative">
              <Input
                id="password"
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
        )}
        
        {mode === 'register' && (
          <div>
            <Label htmlFor="confirm-password" className="block text-sm font-medium text-galileo-secondaryText mb-1">
              {t('confirmPassword')}
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-galileo-background text-galileo-text border-galileo-border pr-10"
                placeholder="********"
              />
            </div>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-galileo-accent hover:bg-galileo-secondaryText text-galileo-text"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'login' ? t('login') : mode === 'register' ? t('register') : t('sendResetLink')}
        </Button>
      </form>
      
      {mode === 'login' && isBiometricsAvailable && (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full border border-galileo-border hover:bg-galileo-accent/20 flex items-center justify-center gap-2"
            onClick={handleBiometricSignIn}
            disabled={loading}
          >
            <Fingerprint size={18} />
            Entrar com Biometria
          </Button>
        </div>
      )}
      
      {mode !== 'reset' && (
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-galileo-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-galileo-card px-2 text-galileo-secondaryText">
                {t('orContinueWith')}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full border border-galileo-border hover:bg-galileo-accent/20"
              onClick={handleGoogleSignIn}
              disabled={loading || googleAuthInProgress}
            >
              {googleAuthInProgress ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {googleAuthInProgress ? "Autenticando..." : "Google"}
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-center space-y-2">
        {mode === 'login' && (
          <>
            <button 
              onClick={() => toggleMode('register')}
              type="button"
              className="text-galileo-secondaryText hover:text-galileo-text text-sm"
            >
              {t('noAccount')}
            </button>
            <div>
              <button 
                onClick={() => toggleMode('reset')}
                type="button"
                className="text-galileo-secondaryText hover:text-galileo-text text-sm"
              >
                {t('forgotPassword')}
              </button>
            </div>
          </>
        )}
        
        {mode === 'register' && (
          <button 
            onClick={() => toggleMode('login')}
            type="button"
            className="text-galileo-secondaryText hover:text-galileo-text text-sm"
          >
            {t('alreadyHaveAccount')}
          </button>
        )}
        
        {mode === 'reset' && (
          <button 
            onClick={() => toggleMode('login')}
            type="button"
            className="text-galileo-secondaryText hover:text-galileo-text text-sm"
          >
            {t('backToLogin')}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
