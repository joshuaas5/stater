import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Smartphone, Users, BarChart3, Zap, MessageCircle, Camera, Mic, Brain, Bell } from 'lucide-react';
import { SuperwallPlugin } from '@/plugins/superwall';
import { StaterPaywallSystem } from '@/plugins/superwall-professional';

const HomePage: React.FC = () => {
  
  const detectPlatform = () => {
    if (typeof window === 'undefined') return 'server';
    if (window.navigator.userAgent.includes('iPhone') || window.navigator.userAgent.includes('iPad')) return 'ios';
    if (window.navigator.userAgent.includes('Android')) return 'android';
    return 'web';
  };

  const testSuperwall = async (paywallName: string) => {
    const platform = detectPlatform();
    
    try {
      console.log(`🧪 Testando paywall profissional: ${paywallName} na plataforma: ${platform}`);
      
      if (platform === 'web') {
        // Usar sistema profissional Stater
        await StaterPaywallSystem.initialize();
        await StaterPaywallSystem.setUserAttributes({
          user_id: 'web_user_' + Date.now(),
          platform: 'web',
          plan: 'free',
          usage: 'high',
          experiment: 'professional_paywalls_v1',
          paywall_trigger: paywallName
        });
        
        // Apresentar paywall profissional
        await StaterPaywallSystem.presentPaywall(paywallName, {
          source: 'homepage_test',
          experiment: 'professional_system'
        });
        
      } else {
        // Usar versão nativa (Android/iOS)
        await SuperwallPlugin.setUserAttributes({
          attributes: {
            user_id: 'mobile_user_' + Date.now(),
            platform: platform,
            plan: 'free',
            usage: 'high',
            experiment: 'professional_native_v1',
            paywall_trigger: paywallName
          }
        });
        await SuperwallPlugin.presentPaywall({ name: paywallName });
      }
      
      console.log(`✅ Paywall profissional ${paywallName} apresentado com sucesso na ${platform}`);
      
    } catch (error) {
      console.error(`❌ Erro ao apresentar paywall ${paywallName}:`, error);
      alert(`Erro: ${error}`);
    }
  };
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Partículas flutuantes */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      
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
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
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
            {/* Logo Principal */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img 
                  src="/stater-logo-512.png" 
                  alt="Stater - Assistente Financeiro IA" 
                  className="h-32 w-32 md:h-40 md:w-40 object-contain drop-shadow-2xl"
                />
                {/* Glow effect */}
                <div className="absolute inset-0 h-32 w-32 md:h-40 md:w-40 bg-blue-500/30 rounded-full blur-2xl"></div>
              </div>
            </div>
            
            {/* Título com fonte especial */}
            <div className="mb-8">
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
                Assistente Financeiro Inteligente
              </p>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                Você gasta horas por semana
                <span className="text-blue-300 block mt-2">organizando finanças?</span>
              </h2>
              <p className="text-xl text-blue-100 mb-6 max-w-4xl mx-auto leading-relaxed">
                Imagine se você pudesse simplesmente enviar uma <strong>foto de uma nota fiscal</strong> ou gravar um 
                <strong> áudio dizendo quanto gastou no mercado</strong> e tudo fosse organizado automaticamente.
              </p>
              <p className="text-lg text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                O Stater usa <strong>inteligência artificial</strong> para transformar suas informações em 
                <strong> relatórios completos</strong>, gráficos interativos e insights que ajudam você a 
                <strong> acompanhar e controlar suas finanças</strong> de forma inteligente.
              </p>
              
              {/* Principais funcionalidades */}
              <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-4xl mx-auto">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">🎙️ Comando de Voz</h3>
                  <p className="text-blue-100 text-sm">
                    Fale naturalmente: <strong>"Gastei 200 reais abastecendo o carro"</strong> - nossa IA 
                    ouve, identifica a categoria e organiza automaticamente.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">📄 Leitura Inteligente</h3>
                  <p className="text-blue-100 text-sm">
                    Fotografe qualquer <strong>nota fiscal</strong>, <strong>extrato</strong> ou 
                    <strong> comprovante</strong>. A IA digitaliza e organiza tudo em segundos.
                  </p>
                </div>
              </div>
              
              <p className="text-2xl text-blue-200 font-bold mb-10">
                Inteligência financeira ao seu alcance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                  >
                    Começar Agora
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

          {/* Prova Social */}
          <div className="mb-20">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                Transforme sua relação com o dinheiro
              </h3>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-2xl border border-red-400/30 mb-4 backdrop-blur-sm">
                      <div className="w-12 h-12 bg-red-500/40 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-red-300 rounded-full border-dashed animate-spin"></div>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-red-300">Situação Atual</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-red-900/10 border border-red-400/20 rounded-2xl p-6 backdrop-blur-sm">
                      <p className="text-red-100 text-center leading-relaxed">
                        <strong>"Eu esquecia de anotar os gastos"</strong><br/>
                        <span className="text-red-200 text-sm">No final do mês não sabia onde tinha gasto meu dinheiro</span>
                      </p>
                    </div>
                    <div className="bg-red-900/10 border border-red-400/20 rounded-2xl p-6 backdrop-blur-sm">
                      <p className="text-red-100 text-center leading-relaxed">
                        <strong>"Horas organizando planilhas"</strong><br/>
                        <span className="text-red-200 text-sm">Tempo perdido que poderia estar aproveitando a vida</span>
                      </p>
                    </div>
                    <div className="bg-red-900/10 border border-red-400/20 rounded-2xl p-6 backdrop-blur-sm">
                      <p className="text-red-100 text-center leading-relaxed">
                        <strong>"Descobria os gastos excessivos tarde demais"</strong><br/>
                        <span className="text-red-200 text-sm">Dinheiro que já tinha ido embora</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-600/30 rounded-2xl border border-green-400/30 mb-4 backdrop-blur-sm">
                      <div className="w-12 h-12 bg-green-500/40 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-green-300">Com o Stater</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-green-900/10 border border-green-400/20 rounded-2xl p-6 backdrop-blur-sm">
                      <p className="text-green-100 text-center leading-relaxed">
                        <strong>"Falo no celular e pronto"</strong><br/>
                        <span className="text-green-200 text-sm">Tudo organizado automaticamente, sem esforço</span>
                      </p>
                    </div>
                    <div className="bg-green-900/10 border border-green-400/20 rounded-2xl p-6 backdrop-blur-sm">
                      <p className="text-green-100 text-center leading-relaxed">
                        <strong>"Economizo horas toda semana"</strong><br/>
                        <span className="text-green-200 text-sm">Tempo que agora uso para o que realmente importa</span>
                      </p>
                    </div>
                    <div className="bg-green-900/10 border border-green-400/20 rounded-2xl p-6 backdrop-blur-sm">
                      <p className="text-green-100 text-center leading-relaxed">
                        <strong>"Alertas em tempo real me salvaram R$ 500"</strong><br/>
                        <span className="text-green-200 text-sm">Controle inteligente que protege meu dinheiro</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Como funciona */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 mb-20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Como usar o Stater
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-blue-400/30">
                  <MessageCircle className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-3">Telegram</h4>
                  <p className="text-blue-100 leading-relaxed">
                    Use o <strong>Telegram agora mesmo</strong> para enviar mensagens ou áudios. 
                    Funciona como conversar com um amigo.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-blue-400/30">
                  <Smartphone className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-3">App Completo</h4>
                  <p className="text-blue-100 leading-relaxed">
                    Relatórios completos, gráficos interativos e insights poderosos. 
                    <strong>Tudo sincronizado</strong> em tempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Final */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Comece usando agora
            </h3>
            <p className="text-blue-100 text-lg mb-6 max-w-3xl mx-auto">
              Transforme sua vida financeira em poucos minutos. O Stater está disponível 
              agora e <strong>oferece recursos que vão mudar sua vida</strong>.
            </p>
            <p className="text-blue-200 text-xl font-bold mb-8 max-w-2xl mx-auto">
              Transforme sua relação com o dinheiro usando inteligência artificial.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-4 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                >
                  Começar agora
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

            <div className="mt-8 text-blue-300 text-sm">
              ✅ Recursos gratuitos &nbsp;&nbsp; ✅ Instalação simples &nbsp;&nbsp; ✅ Dados seguros
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-12 px-4 border-t border-white/10 bg-black/20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo e Nome */}
          <div className="flex items-center justify-center space-x-3 mb-8">
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
              STATER
            </span>
          </div>
          
          {/* Links de navegação */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-8">
            <Link 
              to="/terms" 
              className="text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium"
            >
              Termos de Uso
            </Link>
            <Link 
              to="/privacy" 
              className="text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium"
            >
              Política de Privacidade
            </Link>
            <a 
              href="mailto:staterbills@gmail.com?subject=Suporte%20Stater&body=Olá,%20preciso%20de%20ajuda%20com..." 
              className="text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium"
            >
              Suporte
            </a>
          </div>
          
          {/* Seção de Teste Superwall (Desenvolvimento) */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                🚀 Paywalls Profissionais Stater - {detectPlatform().toUpperCase()}
              </h3>
              <div className="text-center mb-4">
                <span className="text-white/80 text-sm">
                  Sistema: <strong className="text-green-300">Professional Stater System</strong>
                  {detectPlatform() === 'web' ? ' (Standalone)' : ' (Híbrido)'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => testSuperwall('onboarding')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  🚀 Onboarding
                </button>
                
                <button 
                  onClick={() => testSuperwall('super_promo')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  🔥 Super Promo
                </button>
                
                <button 
                  onClick={() => testSuperwall('limit_reached')}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  ⚠️ Limite
                </button>
                
                <button 
                  onClick={() => testSuperwall('premium_upgrade')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  👑 Premium
                </button>
              </div>
              <p className="text-white/60 text-xs text-center mt-3">
                * Sistema Stater Profissional com copy CMO-level | 4 paywalls com conversão máxima
              </p>
            </div>
          </div>

          {/* Informações finais */}
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
