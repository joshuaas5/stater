import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Smartphone, Users, BarChart3, Zap, MessageCircle, Camera, Mic, Brain } from 'lucide-react';

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
            <img 
              src="/stater-logo-192.png" 
              alt="Stater Logo" 
              className="h-12 w-12 object-contain drop-shadow-lg"
            />
            <h1 
              className="text-2xl font-bold text-white"
              style={{
                fontFamily: '"Fredoka One", "Comic Sans MS", Poppins, sans-serif',
                textShadow: 'rgb(59, 130, 246) 1px 1px 0px, rgb(29, 78, 216) 2px 2px 0px, rgba(59, 130, 246, 0.5) 0px 0px 10px',
                filter: 'drop-shadow(rgba(0, 0, 0, 0.3) 0px 2px 4px)'
              }}
            >
              STATER
            </h1>
          </Link>
          <div className="flex space-x-4">
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
                Cadastrar
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                variant="outline" 
                className="hidden sm:flex bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Entrar
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
                <img 
                  src="/stater-logo-512.png" 
                  alt="Stater - Assistente Financeiro IA" 
                  className="h-32 w-32 md:h-40 md:w-40 object-contain drop-shadow-2xl"
                />
                {/* Glow effect */}
                <div className="absolute inset-0 h-32 w-32 md:h-40 md:w-40 bg-blue-500/30 rounded-full blur-2xl animate-pulse-slow"></div>
              </div>
            </div>
            
            {/* Título com fonte especial */}
            <div className="mb-8 animate-slide-in">
              <h1 
                className="text-5xl md:text-7xl font-bold text-white mb-4 uppercase tracking-wide"
                style={{
                  fontFamily: '"Fredoka One", "Comic Sans MS", Poppins, sans-serif',
                  letterSpacing: '2px',
                  textShadow: 'rgb(59, 130, 246) 3px 3px 0px, rgb(29, 78, 216) 6px 6px 0px, rgba(59, 130, 246, 0.8) 0px 0px 30px, rgba(0, 0, 0, 0.6) 0px 3px 10px',
                  filter: 'drop-shadow(rgba(0, 0, 0, 0.5) 0px 4px 8px)'
                }}
              >
                STATER
              </h1>
              <p className="text-blue-200 text-xl md:text-2xl font-medium mb-2">
                Inteligência para prosperar
              </p>
            </div>
            
            <div className="animate-slide-in">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                Finanças inteligentes
                <span className="text-blue-300 block mt-2">para pessoas inteligentes</span>
              </h2>
              <p className="text-xl text-blue-100 mb-6 max-w-4xl mx-auto leading-relaxed">
                Transforme a forma como você gerencia suas finanças com tecnologia de ponta. 
                Controle completo, insights poderosos e automação que realmente funciona.
              </p>
              <p className="text-lg text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                O Stater combina <strong>inteligência artificial</strong> com <strong>interfaces naturais</strong> 
                para criar a experiência financeira mais avançada e acessível do mercado.
              </p>
              
              {/* Principais funcionalidades */}
              <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-4xl mx-auto">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">🤖 Inteligência Artificial</h3>
                  <p className="text-blue-100 text-sm">
                    Registre gastos por <strong>áudio, foto ou texto</strong>. Nossa IA entende 
                    contexto e categoriza automaticamente com precisão.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">� Múltiplas Interfaces</h3>
                  <p className="text-blue-100 text-sm">
                    Use no <strong>web, mobile, Telegram ou WhatsApp</strong>. Seus dados 
                    sincronizam em tempo real, onde você estiver.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">📊 Análises Avançadas</h3>
                  <p className="text-blue-100 text-sm">
                    Dashboards interativos, relatórios personalizados e <strong>insights 
                    acionáveis</strong> que realmente impactam suas decisões.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">🔒 Segurança Total</h3>
                  <p className="text-blue-100 text-sm">
                    Criptografia de ponta, backup automático e controle total dos seus 
                    dados financeiros com <strong>máxima privacidade</strong>.
                  </p>
                </div>
              </div>
              
              <p className="text-2xl text-blue-200 font-bold mb-10">
                Simplifique. Automatize. Prospere.
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

          {/* Principais Recursos */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-blue-400/30">
                <MessageCircle className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Telegram + WhatsApp
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Registre gastos enviando <strong>áudios</strong> ou <strong>mensagens</strong> direto no Telegram. 
                Em breve no WhatsApp também. Simples como conversar.
              </p>
            </div>

            <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-blue-400/30">
                <Camera className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Reconhecimento Visual
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Tire fotos de <strong>extratos, notas fiscais e faturas</strong>. 
                Nossa IA lê e organiza automaticamente todos os dados financeiros.
              </p>
            </div>

            <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-blue-400/30">
                <Brain className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                IA Inteligente
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Categorização automática, análises personalizadas e insights que realmente 
                <strong> ajudam você a economizar</strong> e prosperar.
              </p>
            </div>
          </div>

          {/* Recursos Avançados */}
          <div className="mb-20">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                Tecnologia que se adapta ao seu estilo
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-blue-300 mb-4">🎯 Recursos Principais:</h4>
                  <div className="space-y-3">
                    <p className="text-blue-100 flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Registro por áudio, foto ou texto - você escolhe
                    </p>
                    <p className="text-blue-100 flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Sincronização em tempo real entre todos os dispositivos
                    </p>
                    <p className="text-blue-100 flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Análises automáticas e insights personalizados
                    </p>
                    <p className="text-blue-100 flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      Interface intuitiva e experiência premium
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-green-300 mb-4">🚀 Benefícios Únicos:</h4>
                  <div className="space-y-3">
                    <p className="text-blue-100 flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Economize até 90% do tempo com organização financeira
                    </p>
                    <p className="text-blue-100 flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Tome decisões baseadas em dados reais e atualizados
                    </p>
                    <p className="text-blue-100 flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Identifique oportunidades de economia automaticamente
                    </p>
                    <p className="text-blue-100 flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Mantenha controle total sem perder praticidade
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recursos Exclusivos */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-blue-400/30">
                  <BarChart3 className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Relatórios Inteligentes</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Transforme seus dados financeiros em insights valiosos com visualizações claras e análises personalizadas.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-blue-400/30">
                  <Zap className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Automação Inteligente</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Deixe a IA categorizar seus gastos, identificar padrões e sugerir otimizações financeiras automaticamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Missão e Visão */}
          <div className="mb-20">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Nossa Missão
              </h3>
              <p className="text-blue-100 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
                Democratizar o acesso à inteligência financeira, proporcionando ferramentas simples e poderosas 
                para que cada pessoa possa tomar decisões financeiras mais conscientes e prósperas.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
                    <Shield className="h-8 w-8 text-blue-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Transparência</h4>
                  <p className="text-blue-100 text-sm">Dados claros e análises honestas</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
                    <TrendingUp className="h-8 w-8 text-blue-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Crescimento</h4>
                  <p className="text-blue-100 text-sm">Evolução constante e aprendizado</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
                    <Users className="h-8 w-8 text-blue-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">Acessibilidade</h4>
                  <p className="text-blue-100 text-sm">Tecnologia ao alcance de todos</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Sua vida financeira está fugindo do controle?
            </h3>
            <p className="text-blue-100 text-lg mb-6 max-w-3xl mx-auto">
              <strong>Pare de perder tempo e dinheiro.</strong> Enquanto você organiza planilhas manualmente, 
              suas oportunidades de economia estão passando despercebidas.
            </p>
            <p className="text-blue-200 text-xl font-bold mb-8 max-w-2xl mx-auto">
              O Stater transforma sua rotina financeira em segundos, não em horas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-4 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                >
                  Experimentar agora
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-12 py-4 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Já tenho conta
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
            <img 
              src="/stater-logo-192.png" 
              alt="Stater Logo" 
              className="h-12 w-12 object-contain drop-shadow-lg"
            />
            <span 
              className="text-2xl font-bold text-white"
              style={{
                fontFamily: '"Fredoka One", "Comic Sans MS", Poppins, sans-serif',
                textShadow: 'rgb(59, 130, 246) 1px 1px 0px, rgb(29, 78, 216) 2px 2px 0px, rgba(59, 130, 246, 0.5) 0px 0px 10px',
                filter: 'drop-shadow(rgba(0, 0, 0, 0.3) 0px 2px 4px)'
              }}
            >
              Stater
            </span>
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
            <a 
              href="mailto:staterbills@gmail.com?subject=Suporte%20Stater&body=Olá,%20preciso%20de%20ajuda%20com..." 
              className="text-blue-300 hover:text-blue-200 transition-colors text-sm"
            >
              Suporte
            </a>
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
