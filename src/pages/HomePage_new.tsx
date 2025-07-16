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
                Sua IA financeira pessoal
              </p>
            </div>
            
            <div className="animate-slide-in">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                Você gasta 3 horas por semana
                <span className="text-blue-300 block mt-2">organizando finanças?</span>
              </h2>
              <p className="text-xl text-blue-100 mb-6 max-w-4xl mx-auto leading-relaxed">
                Imagine se você pudesse falar "<strong>gastei 50 reais no supermercado</strong>" 
                no seu celular e tudo fosse organizado automaticamente.
              </p>
              <p className="text-lg text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                O Stater usa <strong>inteligência artificial</strong> para transformar sua voz 
                em relatórios financeiros completos. Sem planilhas. Sem complicação.
              </p>
              
              {/* Principais funcionalidades */}
              <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-4xl mx-auto">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">🎤 Fale e Pronto</h3>
                  <p className="text-blue-100 text-sm">
                    "<strong>Gastei 80 reais no posto</strong>" - nossa IA ouve, entende e 
                    categoriza automaticamente. Mais rápido que digitar.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">📸 Tire Foto, Esqueça</h3>
                  <p className="text-blue-100 text-sm">
                    Fotografe qualquer <strong>nota fiscal ou extrato</strong>. A IA lê tudo e 
                    organiza seus gastos sem você mexer um dedo.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">📊 Relatórios Automáticos</h3>
                  <p className="text-blue-100 text-sm">
                    Descubra exatamente <strong>onde vai seu dinheiro</strong> com gráficos 
                    simples que até sua avó entende.
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-3">💡 Insights Reais</h3>
                  <p className="text-blue-100 text-sm">
                    "Você gastou 30% mais em delivery este mês" - avisos que realmente 
                    <strong>fazem diferença no seu bolso</strong>.
                  </p>
                </div>
              </div>
              
              <p className="text-2xl text-blue-200 font-bold mb-10">
                Chega de planilhas. Chegou a hora da IA.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                  >
                    Baixar grátis
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
                <Mic className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Comando de Voz
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Fale naturalmente: "<strong>Almoço 25 reais</strong>" ou "<strong>Gasolina 200</strong>". 
                Nossa IA entende e categoriza tudo automaticamente.
              </p>
            </div>

            <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-blue-400/30">
                <Camera className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Leitura Automática
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Tire uma foto do <strong>extrato bancário</strong>, <strong>nota fiscal</strong> ou 
                <strong>comprovante</strong>. A IA digitaliza tudo em segundos.
              </p>
            </div>

            <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-blue-400/30">
                <Brain className="h-10 w-10 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Inteligência Real
              </h3>
              <p className="text-blue-100 leading-relaxed">
                A IA aprende seus hábitos e avisa: "<strong>Você gastou R$ 400 a mais em restaurantes este mês</strong>". 
                Insights que economizam dinheiro de verdade.
              </p>
            </div>
          </div>

          {/* Prova Social */}
          <div className="mb-20">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                Por que as pessoas estão abandonando as planilhas?
              </h3>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-red-300 mb-4">❌ Realidade sem o Stater:</h4>
                  <div className="space-y-4">
                    <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                      <p className="text-red-100 text-sm">
                        "Eu esquecia de anotar os gastos e no final do mês não sabia onde tinha gasto meu dinheiro."
                      </p>
                    </div>
                    <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                      <p className="text-red-100 text-sm">
                        "Passava horas organizando planilhas que ninguém conseguia entender."
                      </p>
                    </div>
                    <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                      <p className="text-red-100 text-sm">
                        "Demorava para perceber que estava gastando demais em algumas categorias."
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-green-300 mb-4">✅ Vida com o Stater:</h4>
                  <div className="space-y-4">
                    <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                      <p className="text-green-100 text-sm">
                        "Agora eu falo no celular e pronto. Tudo organizado automaticamente."
                      </p>
                    </div>
                    <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                      <p className="text-green-100 text-sm">
                        "Economizo 3 horas por semana que antes gastava com planilhas."
                      </p>
                    </div>
                    <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                      <p className="text-green-100 text-sm">
                        "O app me avisou que eu estava gastando R$ 300 a mais com delivery. Consegui cortar."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Como funciona */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-blue-400/30">
                  <MessageCircle className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Telegram + WhatsApp</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Mande mensagens ou áudios direto no seu app favorito. 
                    <strong>Funciona como se fosse um amigo</strong> que anota tudo para você.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-blue-400/30">
                  <Smartphone className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">App Completo</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Relatórios lindos, gráficos interativos e insights poderosos. 
                    <strong>Tudo sincronizado</strong> em tempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Final */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Teste grátis por 30 dias
            </h3>
            <p className="text-blue-100 text-lg mb-6 max-w-3xl mx-auto">
              Não precisa de cartão de crédito. Instale agora e veja como <strong>3 minutos por dia</strong> 
              podem transformar sua vida financeira para sempre.
            </p>
            <p className="text-blue-200 text-xl font-bold mb-8 max-w-2xl mx-auto">
              Mais de 10.000 pessoas já organizaram suas finanças com o Stater.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-4 text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                >
                  Começar agora - É grátis
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
              ✅ Grátis para sempre &nbsp;&nbsp; ✅ Sem pegadinhas &nbsp;&nbsp; ✅ Dados seguros
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
              Sua IA financeira pessoal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
