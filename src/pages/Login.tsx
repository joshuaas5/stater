
import React, { useEffect, useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useStableHeight } from '@/hooks/useStableHeight';
import '@/styles/anti-flicker.css';
import '@/styles/mobile-login-compact.css';

const Login: React.FC = () => {
  // Hook para altura estável em mobile
  useStableHeight();
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estados do formulário
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [forgotData, setForgotData] = useState({ email: '' });
  
  useEffect(() => {
    // Determinar a view baseada na URL
    const path = location.pathname;
    if (path === '/register') {
      setCurrentView('register');
    } else if (path === '/login') {
      setCurrentView('login');
    }
    
    // 🔧 CORREÇÃO: Melhor tratamento de redirects OAuth
    const handleAuthRedirect = async () => {
      try {
        // Verificar se o usuário acabou de fazer logout manualmente
        const isManualLogout = localStorage.getItem('manual_logout') === 'true';
        
        // Se for um logout manual, não redirecionar automaticamente
        if (isManualLogout) {
          console.log('🔒 [LOGIN] Logout manual detectado - não redirecionando');
          return;
        }
        
        // Verificar fragmentos OAuth na URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = new URLSearchParams(location.search);
        
        console.log("🔒 [LOGIN] Auth redirect - URL params:", Object.fromEntries(urlParams));
        console.log("🔒 [LOGIN] Auth redirect - Hash params:", Object.fromEntries(hashParams));
        
        // Se há tokens OAuth na URL, aguardar o processamento pelo AuthContext
        if (hashParams.get('access_token') || hashParams.get('refresh_token')) {
          console.log('🔒 [LOGIN] Tokens OAuth detectados - aguardando processamento...');
          
          // Aguardar o AuthContext processar os tokens
          setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
              console.log('🔒 [LOGIN] Sessão OAuth confirmada - redirecionando para dashboard');
              navigate('/dashboard', { replace: true });
            }
          }, 1500);
          return;
        }
        
        // Check for provider redirect
        const provider = urlParams.get('provider') || hashParams.get('provider');
        if (provider) {
          console.log(`🔒 [LOGIN] Redirect de ${provider} detectado`);
          
          // Aguardar sessão ser estabelecida
          setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
              toast({
                title: `Login com ${provider} concluído`,
                description: "Autenticação realizada com sucesso!",
              });
              navigate('/dashboard', { replace: true });
            }
          }, 1000);
          return;
        }
        
        // Verificar se já há uma sessão válida
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('🔒 [LOGIN] Sessão existente detectada - redirecionando');
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('🔒 [LOGIN] Erro no handleAuthRedirect:', error);
      }
    };
    
    // Executar verificação de redirect
    handleAuthRedirect();
  }, [location, navigate, toast]);

  const clearErrors = () => {
    setErrors({});
    setSuccessMessage('');
  };

  const showError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    let hasError = false;
    
    if (!validateEmail(loginData.email)) {
      showError('loginEmail', 'Email inválido');
      hasError = true;
    }
    
    if (!validatePassword(loginData.password)) {
      showError('loginPassword', 'Senha deve ter pelo menos 6 caracteres');
      hasError = true;
    }
    
    if (hasError) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          showError('loginPassword', 'Email ou senha incorretos');
        } else {
          showError('loginEmail', 'Erro no servidor. Tente novamente.');
        }
      } else {
        setSuccessMessage('Login realizado com sucesso!');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      showError('loginEmail', 'Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    let hasError = false;
    
    if (registerData.name.length < 2) {
      showError('registerName', 'Nome deve ter pelo menos 2 caracteres');
      hasError = true;
    }
    
    if (!validateEmail(registerData.email)) {
      showError('registerEmail', 'Email inválido');
      hasError = true;
    }
    
    if (!validatePassword(registerData.password)) {
      showError('registerPassword', 'Senha deve ter pelo menos 6 caracteres');
      hasError = true;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      showError('registerConfirmPassword', 'Senhas não coincidem');
      hasError = true;
    }
    
    if (hasError) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
          },
        },
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          showError('registerEmail', 'Email já está cadastrado');
        } else {
          showError('registerEmail', 'Erro no servidor. Tente novamente.');
        }
      } else {
        setSuccessMessage('Conta criada com sucesso! Verifique seu email.');
      }
    } catch (error) {
      showError('registerEmail', 'Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (!validateEmail(forgotData.email)) {
      showError('forgotEmail', 'Email inválido');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        showError('forgotEmail', 'Erro ao enviar email. Tente novamente.');
      } else {
        setSuccessMessage('Email de recuperação enviado!');
      }
    } catch (error) {
      showError('forgotEmail', 'Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            prompt: 'select_account', // 🔥 FORÇA SELEÇÃO DE CONTA
            access_type: 'offline',
          },
        },
      });
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao conectar com Google",
          variant: "destructive",
        });
        setIsGoogleLoading(false);
      }
      // Se não há erro, mantém loading até o redirect
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="edge-to-edge-page">
      {/* Partículas flutuantes - otimizadas */}
      <div className="absolute inset-0 overflow-hidden stable-particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/15 rounded-full no-flicker"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Background Effects - otimizados */}
      <div className="absolute inset-0 bg-black/20 no-flicker" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl stable-blur" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl stable-blur" />
      
      {/* Main Content - otimizado com safe area */}
      <div className="relative z-10 safe-area-content flex items-center justify-center no-flicker">
        <div className="w-full max-w-md mx-auto">
          {/* Logo Section - otimizada */}
          <div className="text-center mb-8 no-flicker">
            <div className="flex justify-center mb-6">
              <img 
                src="/stater-logo-512.png" 
                alt="STATER Logo" 
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain stable-logo"
              />
            </div>
            <h1 
              className="text-3xl sm:text-5xl font-bold text-white mb-2 uppercase tracking-wide stable-text-shadow no-flicker"
              style={{
                fontFamily: '"Fredoka One", "Comic Sans MS", Poppins, sans-serif',
                letterSpacing: '2px',
                textShadow: 'rgb(59, 130, 246) 2px 2px 0px, rgb(29, 78, 216) 4px 4px 0px',
              }}
            >
              STATER
            </h1>
            <p className="text-blue-200 text-base sm:text-lg font-medium">Inteligência para prosperar</p>
          </div>

          {/* Login Card - otimizado */}
          <div className="bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 mx-4 sm:mx-0 stable-backdrop no-flicker">
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentView === 'login' ? 'Entrar' : 
                 currentView === 'register' ? 'Criar Conta' : 
                 'Recuperar Senha'}
              </h2>
              <p className="text-blue-200 text-sm">
                {currentView === 'login' ? 'Acesse sua conta' : 
                 currentView === 'register' ? 'Comece sua jornada financeira' : 
                 'Redefinir sua senha'}
              </p>
            </div>
            
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-2xl mb-6 animate-fadeIn">
                {successMessage}
              </div>
            )}

            {/* Login Form */}
            {currentView === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                    {errors.loginEmail && (
                      <p className="text-red-400 text-sm mt-2">{errors.loginEmail}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Senha"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                    {errors.loginPassword && (
                      <p className="text-red-400 text-sm mt-2">{errors.loginPassword}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/60">ou</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full bg-white/5 border border-white/20 text-white py-4 px-6 rounded-2xl font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuar com Google
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setCurrentView('forgot')}
                    className="text-blue-300 hover:text-blue-200 transition-colors duration-300 text-sm"
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                <div className="text-center">
                  <span className="text-white/60 text-sm">Não tem conta? </span>
                  <button
                    type="button"
                    onClick={() => setCurrentView('register')}
                    className="text-blue-300 hover:text-blue-200 transition-colors duration-300 text-sm"
                  >
                    Cadastre-se
                  </button>
                </div>
              </form>
            )}

            {/* Register Form */}
            {currentView === 'register' && (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                    {errors.registerName && (
                      <p className="text-red-400 text-sm mt-2">{errors.registerName}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                    {errors.registerEmail && (
                      <p className="text-red-400 text-sm mt-2">{errors.registerEmail}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Senha"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                    {errors.registerPassword && (
                      <p className="text-red-400 text-sm mt-2">{errors.registerPassword}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Confirmar senha"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                    {errors.registerConfirmPassword && (
                      <p className="text-red-400 text-sm mt-2">{errors.registerConfirmPassword}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Criando...
                    </div>
                  ) : (
                    'Criar conta'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-transparent text-white/60">ou</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full bg-white/5 border border-white/20 text-white py-4 px-6 rounded-2xl font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Cadastrar com Google
                    </>
                  )}
                </button>

                <div className="text-center">
                  <span className="text-white/60 text-sm">Já tem conta? </span>
                  <button
                    type="button"
                    onClick={() => setCurrentView('login')}
                    className="text-blue-300 hover:text-blue-200 transition-colors duration-300 text-sm"
                  >
                    Faça login
                  </button>
                </div>
              </form>
            )}

            {/* Forgot Password Form */}
            {currentView === 'forgot' && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">Esqueceu a senha?</h3>
                  <p className="text-white/60">Digite seu email para receber um link de recuperação</p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <input
                      type="email"
                      placeholder="Seu email"
                      value={forgotData.email}
                      onChange={(e) => setForgotData({...forgotData, email: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                    {errors.forgotEmail && (
                      <p className="text-red-400 text-sm mt-2">{errors.forgotEmail}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      'Enviar link de recuperação'
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setCurrentView('login')}
                      className="text-blue-300 hover:text-blue-200 transition-colors duration-300 text-sm"
                    >
                      Voltar ao login
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-white/60">
            <p className="text-sm">Stater - Todos os Direitos Reservados</p>
            <p className="text-xs mt-1">2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
