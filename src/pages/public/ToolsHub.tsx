import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calculator, TrendingUp, Bitcoin, Percent, Target, PiggyBank, ArrowLeft, Home, Banknote, Gift, Plane, FileText, Wallet, Building } from 'lucide-react';

const ToolsHub: React.FC = () => {
  const tools = [
    {
      icon: Calculator,
      title: 'Calculadora de Juros Compostos',
      description: 'Descubra quanto seu dinheiro pode render com o poder dos juros sobre juros.',
      slug: 'calculadora-juros-compostos',
      color: 'from-blue-500 to-cyan-400',
      borderColor: 'border-blue-400',
      shadowColor: '#3B82F6'
    },
    {
      icon: Percent,
      title: 'Calculadora CDI',
      description: 'Simule investimentos em CDB, LCI, LCA e compare com a poupança.',
      slug: 'calculadora-cdi',
      color: 'from-emerald-500 to-teal-400',
      borderColor: 'border-emerald-400',
      shadowColor: '#10B981'
    },
    {
      icon: Bitcoin,
      title: 'Conversor de Criptomoedas',
      description: 'Cotação em tempo real de Bitcoin, Ethereum e outras criptos em Real.',
      slug: 'conversor-cripto',
      color: 'from-orange-500 to-yellow-400',
      borderColor: 'border-orange-400',
      shadowColor: '#F97316'
    },
    {
      icon: TrendingUp,
      title: 'Simulador de Investimentos',
      description: 'Compare rendimentos: Poupança vs CDB vs Tesouro vs LCI vs Fundos.',
      slug: 'simulador-investimentos',
      color: 'from-purple-500 to-pink-400',
      borderColor: 'border-purple-400',
      shadowColor: '#A855F7'
    },
    {
      icon: PiggyBank,
      title: 'Calculadora de Inflação',
      description: 'Veja quanto seu dinheiro perdeu valor com a inflação ao longo dos anos.',
      slug: 'calculadora-inflacao',
      color: 'from-red-500 to-rose-400',
      borderColor: 'border-red-400',
      shadowColor: '#EF4444'
    },
    {
      icon: Target,
      title: 'Calculadora de Metas',
      description: 'Quanto você precisa poupar por mês para alcançar seus objetivos?',
      slug: 'calculadora-metas',
      color: 'from-indigo-500 to-violet-400',
      borderColor: 'border-indigo-400',
      shadowColor: '#6366F1'
    },
    {
      icon: Home,
      title: 'Simulador de Financiamento',
      description: 'Calcule parcelas, juros totais e compare SAC vs PRICE para seu imóvel.',
      slug: 'simulador-financiamento',
      color: 'from-rose-500 to-pink-400',
      borderColor: 'border-rose-400',
      shadowColor: '#F43F5E'
    },
    {
      icon: Banknote,
      title: 'Calculadora CLT vs PJ',
      description: 'Compare salário CLT com PJ. Inclui INSS, IRRF e benefícios.',
      slug: 'calculadora-clt-pj',
      color: 'from-sky-500 to-blue-400',
      borderColor: 'border-sky-400',
      shadowColor: '#0EA5E9'
    },
    {
      icon: Gift,
      title: 'Calculadora 13º Salário',
      description: 'Quanto você vai receber de décimo terceiro? Calcule com INSS e IR.',
      slug: 'calculadora-13-salario',
      color: 'from-yellow-500 to-orange-400',
      borderColor: 'border-yellow-400',
      shadowColor: '#EAB308'
    },
    {
      icon: Plane,
      title: 'Calculadora de Férias',
      description: 'Calcule suas férias CLT com 1/3 constitucional e abono pecuniário.',
      slug: 'calculadora-ferias',
      color: 'from-teal-500 to-emerald-400',
      borderColor: 'border-teal-400',
      shadowColor: '#14B8A6'
    },
    {
      icon: Target,
      title: 'Calculadora de Dividendos',
      description: 'Projete sua renda passiva futura. Simule patrimonio e dividendos ao longo dos anos.',
      slug: 'calculadora-dividendos',
      color: 'from-emerald-500 to-green-400',
      borderColor: 'border-emerald-400',
      shadowColor: '#10B981'
    },
    {
      icon: FileText,
      title: 'Calculadora de IR',
      description: 'Calcule seu Imposto de Renda mensal e veja como pagar menos.',
      slug: 'calculadora-ir',
      color: 'from-red-500 to-orange-400',
      borderColor: 'border-red-400',
      shadowColor: '#EF4444'
    },
    {
      icon: Wallet,
      title: 'Calculadora FGTS',
      description: 'Simule acumulacao do FGTS e calcule saque-aniversario.',
      slug: 'calculadora-fgts',
      color: 'from-cyan-500 to-blue-400',
      borderColor: 'border-cyan-400',
      shadowColor: '#06B6D4'
    },
    {
      icon: Building,
      title: 'Calculadora de Emprestimo',
      description: 'Simule parcelas, juros totais e tabela de amortizacao.',
      slug: 'calculadora-emprestimo',
      color: 'from-violet-500 to-purple-400',
      borderColor: 'border-violet-400',
      shadowColor: '#8B5CF6'
    },
    {
      icon: Target,
      title: 'Calculadora de Aposentadoria',
      description: 'Descubra se voce vai conseguir se aposentar com conforto. Simule sua renda passiva.',
      slug: 'calculadora-aposentadoria',
      color: 'from-amber-500 to-orange-400',
      borderColor: 'border-amber-400',
      shadowColor: '#F59E0B'
    },
    {
      icon: Target,
      title: 'Calculadora de Aluguel',
      description: 'Rentabilidade para proprietarios e custo real para inquilinos. Analise completa.',
      slug: 'calculadora-aluguel',
      color: 'from-teal-500 to-cyan-400',
      borderColor: 'border-teal-400',
      shadowColor: '#14B8A6'
    },
    {
      icon: Target,
      title: 'Calculadora de Dividendos',
      description: 'Projete sua renda passiva futura. Simule patrimonio e dividendos ao longo dos anos.',
      slug: 'calculadora-dividendos',
      color: 'from-emerald-500 to-green-400',
      borderColor: 'border-emerald-400',
      shadowColor: '#10B981'
    },
  ];

  return (
    <>
      <Helmet>
        <title>Ferramentas Financeiras Gratuitas | Calculadoras e Simuladores | Stater</title>
        <meta name="description" content="Calculadoras financeiras gratuitas: juros compostos, CDI, inflação, metas, 13º salário, férias e simulador de investimentos. Tome decisões inteligentes." />
        <link rel="canonical" href="https://stater.app/ferramentas" />
      </Helmet>
      
      <div className="min-h-screen bg-slate-950">
        {/* Header Neobrutalist */}
        <header className="bg-slate-900 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/stater-logo-96.webp" alt="Stater" className="w-10 h-10 rounded-xl " />
              <span 
                className="text-2xl uppercase tracking-wider"
                style={{ 
                  fontFamily: "'Fredoka One', sans-serif",
                  color: '#fff',
                  textShadow: '#3B82F6 2px 2px 0px, #1D4ED8 4px 4px 0px'
                }}
              >
                Stater
              </span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-white/60 hover:text-white font-bold transition-colors flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Início
              </Link>
              <Link to="/blog" className="text-white/60 hover:text-white font-bold transition-colors">
                Blog
              </Link>
              <Link 
                to="/login?view=register" 
                className="bg-yellow-400 text-slate-900 font-black px-4 py-2 rounded-lg border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1e293b] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                Começar Grátis
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-yellow-400 text-slate-900 font-black text-sm px-4 py-1 rounded-full mb-6 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1e293b] rotate-[-2deg]">
               {tools.length} FERRAMENTAS GRATUITAS
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Ferramentas</span> Financeiras
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Calculadoras e simuladores gratuitos para você <strong className="text-white">tomar melhores decisões</strong> com seu dinheiro.
            </p>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-12 px-4 bg-slate-950">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Link
                    key={tool.slug}
                    to={`/ferramentas/${tool.slug}`}
                    className={`group bg-slate-900 border-4 ${tool.borderColor} rounded-2xl p-6 hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]`}
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tool.color} mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 group-hover:text-yellow-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-white/60 leading-relaxed">
                      {tool.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 border-t-4 border-b-4 border-slate-900">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              Organize suas finanças!
            </h2>
            <p className="text-xl text-slate-800 mb-8">
              O <strong>Stater</strong> vai além das calculadoras. Controle gastos, defina metas e receba dicas personalizadas com IA.
            </p>
            <Link 
              to="/login?view=register" 
              className="inline-flex items-center gap-2 bg-slate-900 text-yellow-400 font-black text-lg px-8 py-4 rounded-xl border-4 border-white shadow-[6px_6px_0px_0px_#fff] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all"
            >
               Criar Conta Grátis
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 bg-slate-900 border-t-2 border-white/10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/stater-logo-96.webp" alt="Stater" className="w-8 h-8 rounded-lg" />
              <span className="text-white/60"> 2026 Stater. Todos os direitos reservados.</span>
            </div>
            <div className="flex gap-6">
              <Link to="/" className="text-white/60 hover:text-white text-sm">Início</Link>
              <Link to="/blog" className="text-white/60 hover:text-white text-sm">Blog</Link>
              <Link to="/login" className="text-white/60 hover:text-white text-sm">Entrar</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ToolsHub;
