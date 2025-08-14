import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vxlwwhxjqlhdmokqvqol.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4bHd3aHhqcWxoZG1va3F2cW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMjY1MDYsImV4cCI6MjA1MTkwMjUwNn0.Hhp__h4t1W_8LnKUoQDaTEIGpJNnTAp6YSkgC0_dS9w';
const supabase = createClient(supabaseUrl, supabaseKey);

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot'>('login');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [forgotData, setForgotData] = useState({
    email: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (error) {
        console.error('Erro no login:', error);
        setErrors({ 
          loginEmail: error.message.includes('email') ? error.message : '',
          loginPassword: error.message.includes('password') ? error.message : ''
        });
      } else {
        localStorage.setItem('user', JSON.stringify({
          ...data.user,
          plan: 'FREE',
          usage: { reports: 0 }
        }));
        navigate('/painel');
      }
    } catch (error: any) {
      console.error('Erro geral:', error);
      setErrors({ loginEmail: 'Erro ao fazer login. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (registerData.password !== registerData.confirmPassword) {
      setErrors({ registerConfirmPassword: 'As senhas não coincidem' });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            name: registerData.name,
            plan: 'FREE'
          }
        }
      });

      if (error) {
        console.error('Erro no registro:', error);
        setErrors({
          registerEmail: error.message
        });
      } else {
        setSuccessMessage('Conta criada! Verifique seu email.');
        setCurrentView('login');
      }
    } catch (error: any) {
      console.error('Erro geral:', error);
      setErrors({ registerEmail: 'Erro ao criar conta. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setErrors({ forgotEmail: error.message });
      } else {
        setSuccessMessage('Link de recuperação enviado para seu email!');
        setCurrentView('login');
      }
    } catch (error: any) {
      setErrors({ forgotEmail: 'Erro ao enviar email. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/painel`
        }
      });

      if (error) {
        console.error('Erro Google:', error);
        setErrors({ loginEmail: 'Erro ao conectar com Google' });
      }
    } catch (error) {
      console.error('Erro geral Google:', error);
    }
  };

  return (
    <div className="homepage-container stable-height relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 login-container-mobile">
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
      
      {/* Main Content - otimizado para mobile */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Logo Section - compacta */}
        <div className="text-center mb-4 no-flicker">
          <div className="flex justify-center mb-3">
            <img 
              src="/stater-logo-512.png" 
              alt="STATER Logo" 
              className="login-logo-mobile object-contain stable-logo"
            />
          </div>
          <h1 
            className="login-title-mobile font-bold text-white uppercase tracking-wide stable-text-shadow no-flicker"
            style={{
              fontFamily: '"Fredoka One", "Comic Sans MS", Poppins, sans-serif',
              letterSpacing: '2px',
              textShadow: 'rgb(59, 130, 246) 2px 2px 0px, rgb(29, 78, 216) 4px 4px 0px',
            }}
          >
            STATER
          </h1>
          <p className="login-subtitle-mobile text-blue-200 font-medium">Inteligência para prosperar</p>
        </div>

        {/* Login Card - compacto */}
        <div className="login-card-mobile stable-backdrop no-flicker">
          {/* Title */}
          <div className="text-center">
            <h2 className="login-card-title-mobile font-bold text-white">
              {currentView === 'login' ? 'Entrar' : 
               currentView === 'register' ? 'Criar Conta' : 
               'Recuperar Senha'}
            </h2>
            <p className="login-card-subtitle-mobile text-blue-200">
              {currentView === 'login' ? 'Acesse sua conta' : 
               currentView === 'register' ? 'Comece sua jornada financeira' : 
               'Redefinir sua senha'}
            </p>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-3 rounded-xl mb-4 animate-fadeIn text-sm">
              {successMessage}
            </div>
          )}

          {/* Login Form */}
          {currentView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="login-input-mobile w-full bg-white/5 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                  {errors.loginEmail && (
                    <p className="text-red-400 text-xs mt-1">{errors.loginEmail}</p>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="login-input-mobile w-full bg-white/5 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                  {errors.loginPassword && (
                    <p className="text-red-400 text-xs mt-1">{errors.loginPassword}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="login-button-mobile w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>

              <div className="login-divider-fixed text-center">
                <span className="login-or-text">ou</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="login-google-mobile google-login-safe-area w-full bg-white/5 border border-white/20 text-white font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentView('forgot')}
                  className="login-link-mobile text-blue-300 hover:text-blue-200 transition-colors duration-300"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <div className="text-center">
                <span className="text-white/60 text-xs">Não tem conta? </span>
                <button
                  type="button"
                  onClick={() => setCurrentView('register')}
                  className="login-link-mobile text-blue-300 hover:text-blue-200 transition-colors duration-300"
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
                className="w-full bg-white/5 border border-white/20 text-white py-4 px-6 rounded-2xl font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Cadastrar com Google
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
  );
};

export default Login;
