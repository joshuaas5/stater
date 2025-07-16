import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Smartphone, Users, BarChart3, Lock, Zap, Star } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Partículas flutuantes */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      
      {/* Header */}
      <header className="relative z-10 w-full py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
              <img 
                src="/stater-logo.png" 
                alt="Stater Logo" 
                className="h-8 w-8 object-contain rounded-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-white">Stater</h1>
          </Link>
          <div className="flex space-x-4">
            <Link to="/login">
              <Button 
                variant="outline" 
                className="hidden sm:flex bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-20">
            {/* Logo Principal com animação */}
            <div className="flex justify-center mb-8">
              <div className="relative animate-bounce-in">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
                  <img 
                    src="/stater-logo.png" 
                    alt="Stater - Assistente Financeiro IA" 
                    className="h-20 w-20 md:h-24 md:w-24 object-contain rounded-full"
                  />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 bg-blue-500/30 rounded-full blur-2xl animate-pulse-slow"></div>
              </div>
            </div>
            
            {/* Título com fonte especial */}
            <div className="mb-8 animate-slide-in">
              <h1 
                className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-wide"
                style={{
                  fontFamily: '"Fredoka One", "Comic Sans MS", Poppins, sans-serif',
                  letterSpacing: '1px',
                  textShadow: 'rgb(59, 130, 246) 2px 2px 0px, rgb(29, 78, 216) 4px 4px 0px, rgba(59, 130, 246, 0.8) 0px 0px 20px, rgba(0, 0, 0, 0.6) 0px 2px 8px',
                  filter: 'drop-shadow(rgba(0, 0, 0, 0.5) 0px 3px 6px)'
                }}
              >
                ANÁLISE FINANCEIRA
              </h1>
              <p className="text-blue-200 text-xl md:text-2xl font-medium mb-2">
                Inteligência para prosperar
              </p>
            </div>
            
            <div className="animate-slide-in">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                Controle suas finanças com
                <span className="text-blue-300 block mt-2">inteligência artificial</span>
              </h2>
              <p className="text-xl text-blue-100 mb-4 max-w-4xl mx-auto leading-relaxed">
                O Stater é seu assistente financeiro pessoal que ajuda você a organizar gastos, 
                analisar extratos bancários e tomar decisões financeiras mais inteligentes.
              </p>
              <p className="text-lg text-blue-200 font-semibold mb-10">
                Transforme sua vida financeira hoje mesmo.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                  >
                    Começar gratuitamente
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-10 py-4 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Já tenho uma conta
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-blue-400/30">
                <TrendingUp className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Análise Inteligente
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Nossa IA analisa seus gastos e oferece insights personalizados para melhorar sua saúde financeira com precisão.
              </p>
            </div>

            <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-blue-400/30">
                <Shield className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Segurança Total
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Seus dados são protegidos com criptografia de ponta e nunca compartilhamos suas informações financeiras.
              </p>
            </div>

            <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-blue-400/30">
                <Smartphone className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Sempre Disponível
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Acesse de qualquer dispositivo, a qualquer hora. Funciona perfeitamente em celulares e computadores.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            <div className="text-center p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-blue-300 mb-2">10K+</div>
              <div className="text-blue-100 text-sm">Usuários Ativos</div>
            </div>
            <div className="text-center p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-blue-300 mb-2">R$ 50M+</div>
              <div className="text-blue-100 text-sm">Gerenciados</div>
            </div>
            <div className="text-center p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-blue-300 mb-2">99.9%</div>
              <div className="text-blue-100 text-sm">Uptime</div>
            </div>
            <div className="text-center p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-blue-300 mb-2">4.9/5</div>
              <div className="text-blue-100 text-sm">Avaliação</div>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-blue-400/30">
                  <BarChart3 className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Relatórios Avançados</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Receba relatórios detalhados sobre seus gastos, receitas e tendências financeiras com gráficos interativos.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-blue-400/30">
                  <Zap className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Automação Inteligente</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Automatize categorização de gastos, lembretes de contas e sugestões de economia baseadas em IA.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pronto para transformar suas finanças?
            </h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de pessoas que já estão prosperando com inteligência financeira.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-4 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                >
                  Criar conta gratuita
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-12 py-4 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Fazer login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-12 px-4 border-t border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
              <img 
                src="/stater-logo.png" 
                alt="Stater Logo" 
                className="h-8 w-8 object-contain rounded-full"
              />
            </div>
            <span className="text-2xl font-bold text-white">Stater</span>
          </div>
          <div className="flex justify-center space-x-8 mb-6">
            <Link 
              to="/terms" 
              className="text-blue-300 hover:text-blue-200 transition-colors text-sm"
            >
              Termos de Uso
            </Link>
            <Link 
              to="/privacy" 
              className="text-blue-300 hover:text-blue-200 transition-colors text-sm"
            >
              Política de Privacidade
            </Link>
            <Link 
              to="/support" 
              className="text-blue-300 hover:text-blue-200 transition-colors text-sm"
            >
              Suporte
            </Link>
          </div>
          <div className="text-white/80 space-y-2">
            <p className="text-sm">Stater - Todos os Direitos Reservados</p>
            <p className="text-xs">2025</p>
            <p className="text-xs text-blue-200 font-medium">
              Inteligência para prosperar
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
