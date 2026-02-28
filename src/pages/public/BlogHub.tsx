import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  BookOpen, ArrowLeft, TrendingUp, Star, Flame, Clock, 
  Search, Filter, Wallet, PiggyBank, CreditCard, Building2,
  Briefcase, Shield, Calculator, GraduationCap, Target, Zap,
  ChevronRight, Sparkles
} from 'lucide-react';

const BlogHub: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'investimentos', name: 'Investimentos', icon: TrendingUp, color: 'bg-emerald-500', count: 12 },
    { id: 'economia', name: 'Economia', icon: PiggyBank, color: 'bg-blue-500', count: 8 },
    { id: 'dividas', name: 'Dívidas', icon: CreditCard, color: 'bg-red-500', count: 6 },
    { id: 'planejamento', name: 'Planejamento', icon: Target, color: 'bg-purple-500', count: 10 },
    { id: 'renda', name: 'Renda Extra', icon: Zap, color: 'bg-orange-500', count: 5 },
    { id: 'impostos', name: 'Impostos', icon: Calculator, color: 'bg-amber-500', count: 4 },
  ];

  const featuredArticles = [
    {
      title: 'Como Juntar Dinheiro Rápido',
      description: '15 estratégias práticas e testadas para juntar dinheiro mesmo ganhando pouco. Método comprovado!',
      slug: 'como-juntar-dinheiro-rapido',
      category: 'economia',
      readTime: '8 min',
      tag: 'MAIS LIDO',
      color: 'from-emerald-400 to-teal-500',
      borderColor: 'border-emerald-400',
      icon: PiggyBank
    },
    {
      title: '20 Formas de Renda Extra em 2026',
      description: 'Ideias testadas e aprovadas para ganhar dinheiro extra ainda este mês. Com valores reais!',
      slug: 'renda-extra-20-formas',
      category: 'renda',
      readTime: '12 min',
      tag: 'ATUALIZADO',
      color: 'from-orange-400 to-red-500',
      borderColor: 'border-orange-400',
      icon: Zap
    }
  ];

  const allArticles = [
    { title: 'Regra 50-30-20', description: 'O método mais simples para organizar seu orçamento mensal sem complicação.', slug: 'regra-50-30-20', category: 'planejamento', readTime: '5 min', icon: Target },
    { title: 'Como Sair das Dívidas', description: 'Guia definitivo para quitar dívidas e limpar o nome. Passo a passo completo.', slug: 'como-sair-das-dividas', category: 'dividas', readTime: '10 min', icon: CreditCard },
    { title: 'Investir com Pouco Dinheiro', description: 'Comece a investir com apenas R$30 por mês e veja seu dinheiro crescer.', slug: 'investir-com-pouco-dinheiro', category: 'investimentos', readTime: '7 min', icon: TrendingUp },
    { title: 'Reserva de Emergência', description: 'Quanto guardar e onde deixar seu fundo de emergência para máxima segurança.', slug: 'reserva-de-emergencia', category: 'planejamento', readTime: '6 min', icon: Shield },
    { title: 'Cartão de Crédito: Vilão ou Aliado?', description: 'Como usar o cartão a seu favor sem cair em armadilhas. Dicas práticas!', slug: 'cartao-credito-vilao-aliado', category: 'dividas', readTime: '8 min', icon: CreditCard },
    { title: 'Metas Financeiras', description: 'Aprenda a definir e alcançar seus objetivos de dinheiro com método SMART.', slug: 'metas-financeiras', category: 'planejamento', readTime: '6 min', icon: Target },
    { title: 'Educação Financeira para Crianças', description: 'Como ensinar seus filhos a lidar com dinheiro desde cedo.', slug: 'educacao-financeira-criancas', category: 'planejamento', readTime: '9 min', icon: GraduationCap },
    { title: 'CDI, Selic e IPCA Explicados', description: 'Entenda de uma vez esses indicadores que afetam seus investimentos.', slug: 'cdi-selic-ipca', category: 'investimentos', readTime: '7 min', icon: TrendingUp },
    { title: 'Como Investir com R$100', description: 'Guia completo para dar os primeiros passos nos investimentos com pouco.', slug: 'como-investir-100-reais', category: 'investimentos', readTime: '8 min', icon: Wallet },
    { title: 'Tesouro Direto para Iniciantes', description: 'Tudo sobre o investimento mais seguro do Brasil. Simulador incluso!', slug: 'tesouro-direto-iniciantes', category: 'investimentos', readTime: '10 min', icon: Building2 },
    { title: '10 Apps de Controle Financeiro', description: 'Os melhores apps para organizar suas finanças em 2026. Análise completa.', slug: 'apps-controle-financeiro', category: 'planejamento', readTime: '8 min', icon: Sparkles },
    { title: 'Como Negociar Dívidas', description: 'Scripts e táticas para conseguir até 90% de desconto nas negociações.', slug: 'como-negociar-dividas', category: 'dividas', readTime: '9 min', icon: CreditCard },
    { title: 'Score de Crédito', description: 'Como funciona e 10 formas comprovadas de aumentar sua pontuação.', slug: 'score-credito', category: 'dividas', readTime: '7 min', icon: Star },
    { title: 'Orçamento Familiar', description: 'Como organizar as finanças do lar e dividir gastos sem brigas.', slug: 'orcamento-familiar', category: 'planejamento', readTime: '8 min', icon: Building2 },
    { title: 'PIX: Guia Completo', description: 'Tudo sobre PIX: limites, segurança, golpes e novidades de 2026.', slug: 'pix-guia-completo', category: 'economia', readTime: '6 min', icon: Zap },
    { title: 'Independência Financeira (FIRE)', description: 'Como viver de renda e se aposentar cedo. Simulador de patrimônio incluso!', slug: 'independencia-financeira', category: 'investimentos', readTime: '12 min', icon: Flame },
    { title: 'Imposto de Renda 2026', description: 'Guia completo para declarar IR sem cair na malha fina. Atualizado!', slug: 'imposto-de-renda', category: 'impostos', readTime: '15 min', icon: Calculator },
    { title: 'Fundos Imobiliários (FIIs)', description: 'Como investir em FIIs e receber dividendos mensais isentos de IR.', slug: 'fundos-imobiliarios', category: 'investimentos', readTime: '11 min', icon: Building2 },
    { title: 'Finanças para Casais', description: 'Como organizar o dinheiro a dois sem brigas. 4 modelos de gestão testados.', slug: 'financas-para-casais', category: 'planejamento', readTime: '9 min', icon: Target },
    { title: 'Previdência Privada', description: 'PGBL vs VGBL: qual escolher? Simulador de aposentadoria incluso!', slug: 'previdencia-privada', category: 'investimentos', readTime: '10 min', icon: Shield },
    { title: 'Primeiro Imóvel', description: 'Guia completo para comprar seu primeiro imóvel. Financiamento explicado!', slug: 'primeiro-imovel', category: 'planejamento', readTime: '14 min', icon: Building2 },
    { title: 'Economia no Supermercado', description: '30 dicas testadas para economizar até 40% nas compras do mês.', slug: 'economia-supermercado', category: 'economia', readTime: '7 min', icon: PiggyBank },
    { title: 'CLT vs PJ', description: 'Compare salários CLT e PJ com calculadora. Descubra qual vale mais!', slug: 'clt-vs-pj', category: 'renda', readTime: '9 min', icon: Briefcase },
    { title: 'Seguro de Vida', description: 'Vale a pena? Quanto custa? Guia completo com simulador de valores.', slug: 'seguro-de-vida', category: 'planejamento', readTime: '8 min', icon: Shield },
    { title: 'Consórcio Vale a Pena?', description: 'Análise completa: prós, contras e quando vale a pena fazer consórcio.', slug: 'consorcio-vale-a-pena', category: 'planejamento', readTime: '8 min', icon: Building2 },
    { title: 'Black Friday: 15 Dicas', description: 'Como aproveitar de verdade sem cair em falsas promoções.', slug: 'black-friday-dicas', category: 'economia', readTime: '6 min', icon: Zap },
    { title: 'Golpes Financeiros', description: '10 golpes mais comuns de 2026 e como se proteger de cada um.', slug: 'golpes-financeiros', category: 'economia', readTime: '9 min', icon: Shield },
    { title: 'Investimentos Iniciantes', description: 'Guia do zero ao primeiro investimento. Sem termos complicados!', slug: 'investimentos-iniciantes', category: 'investimentos', readTime: '10 min', icon: TrendingUp },
    { title: 'Economizar Energia', description: '25 dicas práticas para reduzir a conta de luz em até 30%.', slug: 'economizar-energia', category: 'economia', readTime: '6 min', icon: Zap },
    { title: 'Aposentadoria INSS', description: 'Novas regras 2026, calculadora e como aumentar seu benefício.', slug: 'aposentadoria-inss', category: 'planejamento', readTime: '12 min', icon: Shield },
    { title: 'Dividendos de Ações', description: 'Como viver de dividendos. Melhores ações pagadoras de 2026.', slug: 'dividendos-acoes', category: 'investimentos', readTime: '11 min', icon: TrendingUp },
    { title: 'Planejamento Financeiro Anual', description: 'Calendário financeiro mês a mês. Nunca mais seja pego de surpresa!', slug: 'planejamento-financeiro-anual', category: 'planejamento', readTime: '10 min', icon: Target },
    { title: 'Criptomoedas Iniciantes', description: 'Bitcoin, Ethereum e mais. Como comprar, guardar e riscos reais.', slug: 'criptomoedas-iniciantes', category: 'investimentos', readTime: '12 min', icon: Sparkles },
    { title: 'Finanças para Freelancers', description: 'Precificação, impostos, reservas e como sobreviver meses sem cliente.', slug: 'freelancer-financas', category: 'renda', readTime: '11 min', icon: Briefcase },
    { title: 'Motoristas de App', description: 'Uber, 99, iFood: quanto dá pra ganhar? Custos reais e melhores horários.', slug: 'carteira-motoristas-app', category: 'renda', readTime: '10 min', icon: Zap },
    { title: 'Mini Contratos B3', description: 'Mini índice e mini dólar explicados. Riscos reais e como começar.', slug: 'mini-contratos-b3', category: 'investimentos', readTime: '9 min', icon: TrendingUp },
    { title: 'Seguro Viagem', description: 'Quanto custa, coberturas e simulador. Obrigatório para Europa!', slug: 'seguro-viagem', category: 'planejamento', readTime: '7 min', icon: Shield },
    { title: 'IRPF 2026 Guia', description: 'Guia completo com calculadora. Deduções, erros e como pagar menos.', slug: 'imposto-renda-guia', category: 'impostos', readTime: '15 min', icon: Calculator },
    { title: 'Milhas Aéreas', description: 'Guia completo para viajar de graça. Programas, cartões e simulador.', slug: 'milhas-aereas', category: 'economia', readTime: '10 min', icon: Sparkles },
    { title: 'Finanças Após Aposentadoria', description: 'Como viver bem com INSS. Orçamento, golpes a evitar e seus direitos.', slug: 'financas-apos-aposentadoria', category: 'planejamento', readTime: '9 min', icon: Shield },
    { title: 'Contas Digitais 2026', description: 'Nubank, Inter, C6, PicPay: qual a melhor? Comparativo completo.', slug: 'conta-digital-comparativo', category: 'economia', readTime: '8 min', icon: Wallet },
    { title: 'Bolsa de Valores', description: 'Como começar a investir em ações. Guia completo para iniciantes.', slug: 'bolsa-valores-iniciantes', category: 'investimentos', readTime: '12 min', icon: TrendingUp },
    { title: 'Bolsa Família 2026', description: 'Quem tem direito, valores, como se cadastrar. Guia atualizado.', slug: 'bolsa-familia-guia', category: 'renda', readTime: '7 min', icon: Wallet },
    { title: 'CDB vs Tesouro vs LCI', description: 'Comparativo completo: qual rende mais? Simulador incluso.', slug: 'cdb-vs-tesouro-vs-lci', category: 'investimentos', readTime: '9 min', icon: TrendingUp },
    { title: 'MEI Guia Completo', description: 'Como abrir, impostos, limite de faturamento. Tudo sobre MEI 2026.', slug: 'mei-guia-completo', category: 'renda', readTime: '11 min', icon: Briefcase },
    { title: 'Comprar ou Alugar Casa?', description: 'Análise financeira completa. Calculadora para sua decisão.', slug: 'comprar-casa-ou-alugar', category: 'planejamento', readTime: '10 min', icon: Building2 },
    { title: 'Educação Financeira Filhos', description: 'Como ensinar crianças sobre dinheiro por idade. Atividades práticas.', slug: 'educacao-financeira-filhos', category: 'planejamento', readTime: '8 min', icon: GraduationCap },
  ];

  const filteredArticles = allArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  return (
    <>
      <Helmet>
        <title>Blog de Finanças Pessoais | Dicas para Organizar seu Dinheiro | Stater</title>
        <meta name="description" content="Artigos práticos sobre finanças pessoais: como juntar dinheiro, sair das dívidas, investir e organizar seu orçamento. Conteúdo 100% gratuito!" />
        <link rel="canonical" href="https://stater.app/blog" />
      </Helmet>
      
      <div className="min-h-screen bg-slate-950">
        {/* Header Neobrutalist */}
        <header className="bg-slate-900 border-b-4 border-yellow-400 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/stater-logo-96.webp" alt="Stater" className="w-10 h-10 rounded-xl" />
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
              <Link to="/ferramentas" className="text-white/60 hover:text-white font-bold transition-colors hidden sm:block">
                Ferramentas
              </Link>
              <Link 
                to="/login?view=register" 
                className="bg-yellow-400 text-slate-900 font-black px-4 py-2 border-4 border-slate-900 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all"
              >
                Criar Conta
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section - Neobrutalist */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          {/* Pattern Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white rotate-12"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-24 h-24 border-4 border-white rotate-45"></div>
            <div className="absolute bottom-10 right-1/3 w-12 h-12 bg-yellow-400"></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-block bg-yellow-400 text-slate-900 font-black text-sm px-6 py-2 mb-6 border-4 border-slate-900 shadow-[4px_4px_0px_0px_#000] rotate-[-2deg]">
               BLOG DE FINANÇAS
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Aprenda a <span className="text-yellow-400 underline decoration-4 decoration-wavy">dominar</span> seu dinheiro
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Artigos práticos, sem enrolação. <strong className="text-yellow-400">100% gratuito.</strong>
            </p>
            
            {/* Search Bar - Neobrutalist */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg font-bold text-slate-900 bg-white border-4 border-slate-900 shadow-[6px_6px_0px_0px_#000] focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[2px] focus:translate-y-[2px] transition-all"
              />
            </div>
          </div>
        </section>

        {/* Categories - Neobrutalist Pills */}
        <section className="py-8 px-4 bg-slate-900 border-b-4 border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2 font-black text-sm border-4 border-slate-900 transition-all ${
                  !selectedCategory 
                    ? 'bg-yellow-400 text-slate-900 shadow-[4px_4px_0px_0px_#000]' 
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                TODOS
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`px-5 py-2 font-black text-sm border-4 border-slate-900 transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id 
                      ? `${cat.color} text-white shadow-[4px_4px_0px_0px_#000]` 
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Articles - Big Cards */}
        <section className="py-12 px-4 bg-slate-950">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <span className="bg-orange-500 p-2 border-4 border-slate-900 shadow-[4px_4px_0px_0px_#000]">
                <Flame className="w-6 h-6 text-white" />
              </span>
              EM DESTAQUE
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => {
                const catInfo = getCategoryInfo(article.category);
                return (
                  <Link
                    key={article.slug}
                    to={`/blog/${article.slug}`}
                    className={`group bg-white border-4 border-slate-900 p-6 shadow-[8px_8px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className={`bg-gradient-to-r ${article.color} text-white text-xs font-black px-3 py-1 border-2 border-slate-900`}>
                        {article.tag}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 text-sm font-bold">
                        <Clock className="w-4 h-4" /> {article.readTime}
                      </span>
                    </div>
                    
                    <div className={`w-14 h-14 ${catInfo?.color || 'bg-slate-500'} border-4 border-slate-900 flex items-center justify-center mb-4`}>
                      <article.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${catInfo?.color || 'bg-slate-500'} text-white px-2 py-1`}>
                        {catInfo?.name.toUpperCase()}
                      </span>
                      <span className="text-blue-600 font-black flex items-center gap-1 group-hover:gap-2 transition-all">
                        LER ARTIGO <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* All Articles Grid - Neobrutalist Cards */}
        <section className="py-12 px-4 bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <span className="bg-pink-500 p-2 border-4 border-slate-900 shadow-[4px_4px_0px_0px_#000]">
                <BookOpen className="w-6 h-6 text-white" />
              </span>
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name.toUpperCase() : 'TODOS OS ARTIGOS'}
              <span className="ml-auto text-sm text-slate-400 font-normal">
                {filteredArticles.length} artigos
              </span>
            </h2>
            
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/60 text-lg">Nenhum artigo encontrado.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory(null); }}
                  className="mt-4 text-yellow-400 font-bold hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredArticles.map((article) => {
                  const catInfo = getCategoryInfo(article.category);
                  return (
                    <Link
                      key={article.slug}
                      to={`/blog/${article.slug}`}
                      className="group bg-slate-800 border-4 border-slate-700 p-5 hover:border-yellow-400 hover:bg-slate-800/80 transition-all hover:translate-y-[-4px] hover:shadow-[0_8px_0px_0px_#000]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 ${catInfo?.color || 'bg-slate-500'} border-2 border-slate-900 flex items-center justify-center`}>
                          <article.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                          <Clock className="w-3 h-3" /> {article.readTime}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-black text-white mb-2 group-hover:text-yellow-400 transition-colors leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        {article.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                        <span className={`text-xs font-black ${catInfo?.color || 'bg-slate-500'} text-white px-2 py-0.5`}>
                          {catInfo?.name.toUpperCase()}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section - Neobrutalist */}
        <section className="py-16 px-4 bg-yellow-400 border-y-4 border-slate-900">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block bg-slate-900 text-yellow-400 font-black text-sm px-4 py-2 mb-6 border-4 border-slate-900 rotate-[2deg]">
               COLOQUE EM PRÁTICA
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
              Chegou a hora de agir!
            </h2>
            <p className="text-xl text-slate-700 mb-8">
              O <strong>Stater</strong> te ajuda a aplicar tudo que você aprendeu. 
              Organize suas finanças com inteligência artificial.
            </p>
            <Link 
              to="/login?view=register" 
              className="inline-flex items-center gap-2 bg-slate-900 text-yellow-400 font-black text-lg px-8 py-4 border-4 border-slate-900 shadow-[6px_6px_0px_0px_#475569] hover:shadow-[3px_3px_0px_0px_#475569] hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              CRIAR CONTA GRÁTIS <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Footer - Clean */}
        <footer className="py-8 px-4 bg-slate-900 border-t-4 border-slate-800">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/stater-logo-96.webp" alt="Stater" className="w-8 h-8 rounded-lg" />
              <span className="text-white/60"> 2026 Stater. Todos os direitos reservados.</span>
            </div>
            <div className="flex gap-6">
              <Link to="/" className="text-white/60 hover:text-white text-sm font-bold">Início</Link>
              <Link to="/ferramentas" className="text-white/60 hover:text-white text-sm font-bold">Ferramentas</Link>
              <Link to="/privacy" className="text-white/60 hover:text-white text-sm font-bold">Privacidade</Link>
              <Link to="/terms" className="text-white/60 hover:text-white text-sm font-bold">Termos</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default BlogHub;
