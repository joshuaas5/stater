import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import QuickSummary from '@/components/QuickSummary';
import FAQSchema from '@/components/FAQSchema';

const FundosImobiliários: React.FC = () => {
  const fiis = [
    { ticker: 'MXRF11', tipo: 'Papel', dy: '1.1%', setor: 'CRIs', risco: 'Moderado' },
    { ticker: 'HGLG11', tipo: 'Logística', dy: '0.7%', setor: 'Galpões', risco: 'Baixo' },
    { ticker: 'XPML11', tipo: 'Shopping', dy: '0.8%', setor: 'Shoppings', risco: 'Moderado' },
    { ticker: 'KNRI11', tipo: 'Híbrido', dy: '0.6%', setor: 'Lajes+Galpões', risco: 'Baixo' },
    { ticker: 'VISC11', tipo: 'Shopping', dy: '0.9%', setor: 'Shoppings', risco: 'Moderado' },
    { ticker: 'BTLG11', tipo: 'Logística', dy: '0.7%', setor: 'Galpões', risco: 'Baixo' },
  ];

  return (
    <ArticleLayout 
      title="Fundos Imobiliários (FIIs): Guia Completo para Iniciantes 2026" 
      description="Aprenda a investir em FIIs, receber dividendos mensais isentos de IR é construir renda passiva com imóveis sem comprar um imóvel." 
      canonical="/blog/fundos-imobiliários" 
      keywords="fundos imobiliários, FIIs, dividendos mensais, renda passiva, como investir em FIIs, melhores FIIs" 
      date="4 de Fevereiro de 2026" 
      readTime="14 min" 
      relatedArticles={[
        { title: 'Tesouro Direto para Iniciantes', slug: 'tesouro-direto-iniciantes' }, 
        { title: 'Independência Financeira', slug: 'independência-financeira' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Imagine receber aluguel todo mês <strong className="text-emerald-400">sem ter que comprar um imóvel</strong>, sem inquilino, sem IPTU, sem reforma. Isso é o que os FIIs oferecem.</p>
      <QuickSummary 
        variant="green"
        items={[
          { label: 'O que', value: 'Invista em imóveis a partir de R$10 - receba aluguel', icon: 'money' },
          { label: 'Renda', value: 'Dividendos mensais isentos de IR para pessoa física', icon: 'star' },
          { label: 'Tipos', value: 'Tijolo (imóveis), papel (CRI), híbridos', icon: 'target' },
          { label: 'Dica', value: 'Diversifique em 5-10 FIIs de setores diferentes', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/10 border-2 border-blue-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-blue-400 mb-2"> O que são FIIs?</h3>
        <p className="text-white/80">Fundos Imobiliários são condomínios de investidores que juntam dinheiro para comprar ou financiar imóveis. Você compra cotas na bolsa é recebe parte dos aluguéis todo mês.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Vantagens dos FIIs</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1"> Dividendos isentos de IR</h4>
          <p className="text-white/60 text-sm">Pessoa física não paga imposto sobre os rendimentos mensais!</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1"> Renda mensal</h4>
          <p className="text-white/60 text-sm">Diferente de ações, FIIs pagam dividendos todo mês.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1"> Acessível</h4>
          <p className="text-white/60 text-sm">Cotas a partir de R$10. Não precisa de milhões para começar.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1"> Liquidez</h4>
          <p className="text-white/60 text-sm">Compra é vende em segundos pela bolsa. Imóvel real leva meses.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1"> Diversificação</h4>
          <p className="text-white/60 text-sm">Com R$500 você investe em shoppings, galpões é escritórios.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1"> Gestão profissional</h4>
          <p className="text-white/60 text-sm">Gestores cuidam de tudo: inquilinos, reformas, contratos.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Tipos de FIIs</h2>
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl"></span>
            <h4 className="font-bold text-white">FIIs de Tijolo (Imóveis físicos)</h4>
          </div>
          <p className="text-white/60 text-sm mb-2">Investem em imóveis reais é recebem aluguéis.</p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-500/10 text-white/20 text-blue-300 text-xs px-2 py-1 rounded">Shoppings</span>
            <span className="bg-blue-500/10 text-white/20 text-blue-300 text-xs px-2 py-1 rounded">Galpões</span>
            <span className="bg-blue-500/10 text-white/20 text-blue-300 text-xs px-2 py-1 rounded">Lajes corporativas</span>
            <span className="bg-blue-500/10 text-white/20 text-blue-300 text-xs px-2 py-1 rounded">Hospitais</span>
            <span className="bg-blue-500/10 text-white/20 text-blue-300 text-xs px-2 py-1 rounded">Educacionais</span>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl"></span>
            <h4 className="font-bold text-white">FIIs de Papel (Recebíveis)</h4>
          </div>
          <p className="text-white/60 text-sm mb-2">Investem em títulos de dívida imobiliária (CRIs, LCIs).</p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-purple-500/10 text-white/20 text-purple-300 text-xs px-2 py-1 rounded">CRIs</span>
            <span className="bg-purple-500/10 text-white/20 text-purple-300 text-xs px-2 py-1 rounded">LCIs</span>
            <span className="bg-purple-500/10 text-white/20 text-purple-300 text-xs px-2 py-1 rounded">LHs</span>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl"></span>
            <h4 className="font-bold text-white">FIIs Híbridos</h4>
          </div>
          <p className="text-white/60 text-sm">Misturam tijolo é papel. Mais diversificados.</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl"></span>
            <h4 className="font-bold text-white">FOFs (Fundos de Fundos)</h4>
          </div>
          <p className="text-white/60 text-sm">Investem em cotas de outros FIIs. Diversificação automática.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> FIIs populares para conhecer</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-3 text-white/50">Ticker</th>
              <th className="text-left py-3 px-3 text-white/50">Tipo</th>
              <th className="text-center py-3 px-3 text-white/50">DY/mês*</th>
              <th className="text-left py-3 px-3 text-white/50">Setor</th>
              <th className="text-center py-3 px-3 text-white/50">Risco</th>
            </tr>
          </thead>
          <tbody>
            {fiis.map((fii) => (
              <tr key={fii.ticker} className="border-b border-white/5">
                <td className="py-3 px-3 text-blue-400 font-bold">{fii.ticker}</td>
                <td className="py-3 px-3 text-white">{fii.tipo}</td>
                <td className="py-3 px-3 text-center text-emerald-400">{fii.dy}</td>
                <td className="py-3 px-3 text-white/60">{fii.setor}</td>
                <td className="py-3 px-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${fii.risco === 'Baixo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {fii.risco}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-white/40 text-xs mt-2">*DY = Dividend Yield. Valores aproximados, variam mensalmente.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Como analisar um FII</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-slate-800 text-white border-l-4 border-blue-500 rounded-r-xl p-4">
          <h4 className="font-bold text-blue-400 mb-1">P/VP (Preço/Valor Patrimonial)</h4>
          <p className="text-white/60 text-sm">Abaixo de 1 = "desconto". Acima de 1 = "prêmio". Nem sempre barato é bom.</p>
        </div>
        <div className="bg-slate-800 text-white border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">Dividend Yield (DY)</h4>
          <p className="text-white/60 text-sm">Rendimento mensal  preço da cota. Bom: 0.7-1%/mês. Muito alto pode ser insustentável.</p>
        </div>
        <div className="bg-slate-800 text-white border-l-4 border-purple-500 rounded-r-xl p-4">
          <h4 className="font-bold text-purple-400 mb-1">Vacância</h4>
          <p className="text-white/60 text-sm">% de imóveis vazios. Quanto menor, melhor. Acima de 10% é alerta.</p>
        </div>
        <div className="bg-slate-800 text-white border-l-4 border-orange-500 rounded-r-xl p-4">
          <h4 className="font-bold text-orange-400 mb-1">Liquidez</h4>
          <p className="text-white/60 text-sm">Volume negociado por dia. Acima de R$1 milhão/dia é confortável.</p>
        </div>
        <div className="bg-slate-800 text-white border-l-4 border-pink-500 rounded-r-xl p-4">
          <h4 className="font-bold text-pink-400 mb-1">Qualidade dos inquilinos</h4>
          <p className="text-white/60 text-sm">Grandes empresas = contratos mais seguros. Pessoa física = mais risco.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Riscos dos FIIs</h2>
      <div className="bg-red-500/10 text-white border border-red-500/30 rounded-xl p-5 mb-8">
        <ul className="text-white/70 space-y-2">
          <li> <strong>Vacância:</strong> Inquilinos saem, dividendos caem</li>
          <li> <strong>Risco de mercado:</strong> Cotas podem desvalorizar</li>
          <li> <strong>Concentração:</strong> Poucos imóveis = mais risco</li>
          <li> <strong>Juros altos:</strong> Selic alta compete com FIIs</li>
          <li> <strong>Gestão ruim:</strong> Gestores podem tomar decisões erradas</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Como começar a investir</h2>
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-4 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-blue-500/10 text-white text-lg font-black w-8 h-8 rounded-full flex items-center justify-center">1</span>
          <div>
            <p className="font-bold text-white">Abra conta em uma corretora</p>
            <p className="text-white/60 text-sm">XP, Rico, Clear, Nu Invest, BTG - todas são gratuitas.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-blue-500/10 text-white text-lg font-black w-8 h-8 rounded-full flex items-center justify-center">2</span>
          <div>
            <p className="font-bold text-white">Transfira dinheiro via PIX</p>
            <p className="text-white/60 text-sm">A maioria aceita PIX com liquidação imédiata.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-blue-500/10 text-white text-lg font-black w-8 h-8 rounded-full flex items-center justify-center">3</span>
          <div>
            <p className="font-bold text-white">Pesquise FIIs no home broker</p>
            <p className="text-white/60 text-sm">Use o ticker (ex: HGLG11) para buscar as cotas.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-blue-500/10 text-white text-lg font-black w-8 h-8 rounded-full flex items-center justify-center">4</span>
          <div>
            <p className="font-bold text-white">Compre suas primeiras cotas</p>
            <p className="text-white/60 text-sm">Comece pequeno: 5-10 cotas de 2-3 FIIs diferentes.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-blue-500/10 text-white text-lg font-black w-8 h-8 rounded-full flex items-center justify-center">5</span>
          <div>
            <p className="font-bold text-white">Receba dividendos todo mês</p>
            <p className="text-white/60 text-sm">Caem direto na conta da corretora. Reinvista!</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-2 border-blue-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3"> Quanto rende?</h3>
        <p className="text-white/70 mb-4">Exemplo com R$10.000 investidos em FIIs com DY médio de 0.8%/mês:</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-400">R$80</p>
            <p className="text-white/50 text-xs">por mês</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">R$960</p>
            <p className="text-white/50 text-xs">por ano</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">9.6%</p>
            <p className="text-white/50 text-xs">yield anual</p>
          </div>
        </div>
        <p className="text-white/40 text-xs text-center mt-3">Valores ilustrativos. Rendimentos podem variar.</p>
      </div>
    
      <FAQSchema 
        faqs={[
          {
            question: "O que sao fundos imobiliários (FIIs)?",
            answer: "Sao fundos que investem em imóveis (shoppings, escritorios, galpoes) é distribuem os alugueis como dividendos mensais. Voce vira socio de imóveis sem comprar um."
          },
          {
            question: "Quanto rendem os FIIs?",
            answer: "Em media, os FIIs pagam entre 0,7% é 1,2% ao mês em dividendos, que sao ISENTOS de IR para pessoa fisica. Isso da 8-14% ao ano só em dividendos."
          },
          {
            question: "Qual o valor mínimo para investir em FIIs?",
            answer: "A maioria das cotas custa entre R$ 10 é R$ 150. Com R$ 100 você já consegue investir em varios fundos é receber dividendos mensais."
          },
          {
            question: "FIIs sao seguros?",
            answer: "Tem risco medio. Sao mais estaveis que acoes, mas a cota pode variar. Os dividendos costumam ser mais previsiveis. Diversifique entre varios FIIs."
          }
        ]}
      />
    </ArticleLayout>
  );
};

export default FundosImobiliários;