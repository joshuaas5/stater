import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Mic, Camera, PieChart, Bell, Sparkles, Check, ArrowRight, Shield, Zap, 
  Smartphone, CreditCard, Lock, Calendar, Brain, TrendingUp, Bot, FileText,
  LayoutDashboard, ChevronRight, Star, Users, Clock, Infinity, MessageCircle
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'simples' | 'completo'>('completo');

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
      
      {/* ========== BACKGROUND EFFECTS ========== */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* ========== HEADER ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/stater-logo-96.png" alt="Stater" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl" />
            <div className="flex flex-col">
              <span className="font-bold text-xl sm:text-2xl tracking-tight leading-tight">Stater</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
            <Link to="/login?view=register">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 h-9 sm:h-10 px-4 sm:px-6 text-sm sm:text-base">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6 sm:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-300 text-xs sm:text-sm font-medium">+5.000 usuários organizando suas finanças</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 sm:mb-8 tracking-tight">
            Suas finanças no<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              piloto automático
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/60 mb-10 sm:mb-12 leading-relaxed max-w-2xl mx-auto">
            Controle gastos com <span className="text-white font-medium">inteligência artificial</span>, 
            receba lembretes de contas e visualize seu dinheiro com clareza.
            <span className="text-blue-400"> Simples ou completo — você escolhe.</span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/login?view=register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-white/90 font-bold h-14 px-8 rounded-xl shadow-2xl shadow-white/10 transition-all hover:-translate-y-0.5 text-base">
                Criar conta grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="#modos" className="w-full sm:w-auto">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto text-white/70 hover:text-white hover:bg-white/10 h-14 px-8 text-base">
                Ver como funciona
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-white/40">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Sem dados bancários</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>100% privado</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Grátis para começar</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========== MODOS DO APP - SHOWCASE ========== */}
      <section id="modos" className="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Dois modos. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Uma experiência.</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Escolha como quer usar. Mude quando quiser. Sem complicação.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-10 sm:mb-12">
            <div className="inline-flex bg-white/5 border border-white/10 rounded-xl p-1.5">
              <button
                onClick={() => setActiveMode('simples')}
                className={`px-6 sm:px-8 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                  activeMode === 'simples' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4 inline mr-2" />
                Modo Simples
              </button>
              <button
                onClick={() => setActiveMode('completo')}
                className={`px-6 sm:px-8 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                  activeMode === 'completo' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 inline mr-2" />
                Modo Completo
              </button>
            </div>
          </div>

          {/* Mode Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Description Side */}
            <div className={`transition-all duration-500 ${activeMode === 'simples' ? 'order-1' : 'order-1 lg:order-2'}`}>
              {activeMode === 'simples' ? (
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">Para quem quer simplicidade</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold leading-tight">
                    Interface limpa,<br />foco no essencial
                  </h3>
                  <p className="text-white/60 text-lg leading-relaxed">
                    Perfeito para quem quer apenas controlar gastos e contas sem complicação. 
                    Visual otimizado para celular, ações rápidas e intuitivas.
                  </p>
                  <ul className="space-y-4">
                    {[
                      { icon: <CreditCard className="w-5 h-5" />, text: 'Registro rápido de gastos' },
                      { icon: <Bell className="w-5 h-5" />, text: 'Lembretes de contas por email' },
                      { icon: <PieChart className="w-5 h-5" />, text: 'Gráficos simples e claros' },
                      { icon: <Mic className="w-5 h-5" />, text: 'Entrada por voz com IA' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-white/80">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5">
                    <LayoutDashboard className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm font-medium">Para quem quer controle total</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold leading-tight">
                    Dashboard completo,<br />visão 360° das finanças
                  </h3>
                  <p className="text-white/60 text-lg leading-relaxed">
                    Ideal para desktop. Sidebar com navegação, gráficos avançados, 
                    consultor financeiro IA e muito mais. Tudo em uma tela.
                  </p>
                  <ul className="space-y-4">
                    {[
                      { icon: <Brain className="w-5 h-5" />, text: 'Consultor financeiro com IA' },
                      { icon: <TrendingUp className="w-5 h-5" />, text: 'Projeções e metas financeiras' },
                      { icon: <Calendar className="w-5 h-5" />, text: 'Transações recorrentes automáticas' },
                      { icon: <PieChart className="w-5 h-5" />, text: 'Relatórios e análises detalhadas' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-white/80">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Visual Side - Mock Interface */}
            <div className={`transition-all duration-500 ${activeMode === 'simples' ? 'order-2' : 'order-2 lg:order-1'}`}>
              <div className="relative">
                <div className={`absolute -inset-4 rounded-3xl blur-3xl opacity-30 ${
                  activeMode === 'simples' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}></div>
                
                {activeMode === 'simples' ? (
                  /* Mobile Mock */
                  <div className="relative mx-auto w-[280px] sm:w-[320px]">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-[40px] p-3 border border-white/10 shadow-2xl">
                      <div className="bg-slate-950 rounded-[32px] overflow-hidden">
                        {/* Status Bar */}
                        <div className="h-8 bg-slate-900 flex items-center justify-center">
                          <div className="w-20 h-5 bg-slate-800 rounded-full"></div>
                        </div>
                        {/* App Content */}
                        <div className="p-4 space-y-4">
                          <div className="text-center py-4">
                            <p className="text-xs text-white/40 mb-1">Saldo do mês</p>
                            <p className="text-3xl font-bold text-white">R$ 2.450<span className="text-lg">,00</span></p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-emerald-500/20 rounded-xl p-3 text-center">
                              <p className="text-emerald-400 text-xs">Entradas</p>
                              <p className="text-emerald-300 font-bold">+ R$ 5.200</p>
                            </div>
                            <div className="bg-red-500/20 rounded-xl p-3 text-center">
                              <p className="text-red-400 text-xs">Saídas</p>
                              <p className="text-red-300 font-bold">- R$ 2.750</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {[
                              { name: 'Mercado', value: '-R$ 280', color: 'bg-orange-500' },
                              { name: 'Aluguel', value: '-R$ 1.500', color: 'bg-blue-500' },
                            ].map((item, i) => (
                              <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                <div className={`w-8 h-8 ${item.color} rounded-lg`}></div>
                                <span className="flex-1 text-sm text-white/80">{item.name}</span>
                                <span className="text-sm font-medium text-white">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Bottom Nav */}
                        <div className="h-16 bg-slate-900 border-t border-white/5 flex items-center justify-around px-6">
                          <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                            <span className="text-xl font-bold">+</span>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-white/20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Desktop Mock */
                  <div className="relative bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                    <div className="flex">
                      {/* Sidebar */}
                      <div className="w-16 sm:w-20 bg-slate-800/50 border-r border-white/5 py-4 flex flex-col items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-xl"></div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-lg"></div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-lg"></div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/10 rounded-lg"></div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/50 rounded-lg mt-auto"></div>
                      </div>
                      {/* Main Content */}
                      <div className="flex-1 p-4 sm:p-6">
                        <div className="flex gap-4 mb-4">
                          <div className="flex-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-white/10">
                            <p className="text-xs text-white/50 mb-1">Saldo Total</p>
                            <p className="text-xl sm:text-2xl font-bold">R$ 12.450,00</p>
                          </div>
                          <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10">
                            <p className="text-xs text-white/50 mb-1">Economia do Mês</p>
                            <p className="text-xl sm:text-2xl font-bold text-emerald-400">+18%</p>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium">Consultor IA</span>
                          </div>
                          <div className="bg-purple-500/10 rounded-lg p-3 text-sm text-white/70">
                            "Você economizou R$ 340 esse mês reduzindo gastos com delivery. Continue assim!"
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========== TODAS AS FUNCIONALIDADES ========== */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Funcionalidades pensadas para simplificar sua vida financeira
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {[
              { icon: <Bell />, title: 'Lembretes Inteligentes', desc: 'Nunca esqueça de pagar uma conta. Receba alertas por email.', color: 'from-blue-500 to-cyan-500' },
              { icon: <Mic />, title: 'Registro por Voz', desc: '"Gastei 50 reais no mercado" — a IA entende e registra.', color: 'from-purple-500 to-pink-500' },
              { icon: <Camera />, title: 'Scanner de Notas', desc: 'Tire foto do recibo e extraímos os dados automaticamente.', color: 'from-orange-500 to-red-500' },
              { icon: <Brain />, title: 'Consultor Financeiro IA', desc: 'Receba dicas personalizadas para economizar mais.', color: 'from-violet-500 to-purple-500' },
              { icon: <TrendingUp />, title: 'Projeções Futuras', desc: 'Veja como estará seu saldo nos próximos meses.', color: 'from-emerald-500 to-teal-500' },
              { icon: <Calendar />, title: 'Transações Recorrentes', desc: 'Configure uma vez, registra-se todo mês automaticamente.', color: 'from-blue-500 to-indigo-500' },
              { icon: <PieChart />, title: 'Gráficos Detalhados', desc: 'Visualize para onde seu dinheiro está indo.', color: 'from-pink-500 to-rose-500' },
              { icon: <Bot />, title: 'Bot Telegram', desc: 'Registre gastos direto pelo Telegram, sem abrir o app.', color: 'from-cyan-500 to-blue-500', pro: true },
              { icon: <FileText />, title: 'Leitura de PDFs', desc: 'Importe extratos bancários em PDF automaticamente.', color: 'from-amber-500 to-orange-500', pro: true },
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
              >
                {feature.pro && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    PRO
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  {React.cloneElement(feature.icon, { className: 'w-6 h-6 text-white' })}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
            
          </div>

        </div>
      </section>

      {/* ========== PRO SECTION ========== */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl blur-lg opacity-30"></div>
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-8 sm:p-12 overflow-hidden">
              
              {/* Sparkles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
              
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/40 rounded-full px-4 py-1.5 mb-6">
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <span className="text-purple-200 text-sm font-semibold">Stater PRO</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Desbloqueie todo o<br />poder da plataforma
                  </h2>
                  <p className="text-white/60 mb-6 leading-relaxed">
                    Para quem quer ir além. Mais mensagens IA, scanner de notas, 
                    bot Telegram, leitura de PDFs e muito mais.
                  </p>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-white/50 text-lg">R$</span>
                    <span className="text-5xl font-extrabold">14</span>
                    <span className="text-2xl font-bold">,90</span>
                    <span className="text-white/40 ml-1">/mês</span>
                  </div>

                  <Link to="/login?view=register">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-purple-500/25">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Começar com PRO
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {[
                    { icon: <Infinity />, text: '50 mensagens IA por dia' },
                    { icon: <Camera />, text: 'Scanner ilimitado de notas' },
                    { icon: <Bot />, text: 'Bot Telegram integrado' },
                    { icon: <FileText />, text: 'Leitura de PDFs e extratos' },
                    { icon: <TrendingUp />, text: 'Relatórios avançados' },
                    { icon: <MessageCircle />, text: 'Suporte prioritário' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-purple-300">
                        {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                      </div>
                      <span className="font-medium text-white/90">{item.text}</span>
                      <Check className="w-5 h-5 text-emerald-400 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </section>

      {/* ========== SOCIAL PROOF ========== */}
      <section className="relative z-10 py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-white/60 text-sm">Avaliação média dos nossos usuários</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Maria Silva', text: 'Finalmente consigo ver para onde vai meu dinheiro! A IA ajuda demais.', role: 'Empreendedora' },
              { name: 'João Pedro', text: 'O modo simples é perfeito pro dia a dia. Sem frescura, só funciona.', role: 'Desenvolvedor' },
              { name: 'Ana Costa', text: 'Nunca mais esqueci uma conta. Os lembretes por email salvaram minha vida.', role: 'Designer' },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/70 mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-white/40 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Pronto para organizar<br />suas finanças?
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
            Comece grátis agora mesmo. Sem cartão de crédito, sem compromisso.
          </p>
          <Link to="/login?view=register">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 font-bold h-14 px-10 rounded-xl shadow-2xl shadow-white/10 text-base">
              Criar minha conta grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-white/30 text-sm mt-6">
            Junte-se a mais de 5.000 pessoas organizando suas finanças
          </p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-10 py-10 sm:py-12 px-4 sm:px-6 border-t border-white/5 bg-slate-950/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <img src="/stater-logo-96.png" alt="Stater" className="w-8 h-8 rounded-lg" />
            <div>
              <span className="font-bold">Stater</span>
              <p className="text-white/40 text-xs">Inteligência para Prosperar</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/40">
            <Link to="/terms" className="hover:text-white transition-colors">Termos</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <a href="mailto:staterbills@gmail.com" className="hover:text-white transition-colors">Contato</a>
          </div>
          
          <div className="text-xs text-white/30">
            © 2025 Stater
          </div>
          
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
