import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const SeguroDeVida: React.FC = () => {
  return (
    <ArticleLayout 
      title="Seguro de Vida: Vale a Pena? Guia Completo 2026" 
      description="Tudo sobre seguro de vida: tipos, coberturas, quanto custa é quando realmente vale a pena contratar. Proteja sua família." 
      canonical="/blog/seguro-de-vida" 
      keywords="seguro de vida, vale a pena seguro vida, tipos seguro vida, quanto custa seguro vida, melhor seguro vida" 
      date="6 de Fevereiro de 2026" 
      readTime="11 min" 
      relatedArticles={[
        { title: 'Previdência Privada', slug: 'previdência-privada' }, 
        { title: 'Reserva de Emergência', slug: 'reserva-de-emergência' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Seguro de vida não é sobre você - é sobre <strong className="text-emerald-400">quem depende de voce</strong>. Se você tem filhos, conjuge ou pais idosos, pode ser essencial.</p>
      <QuickSummary 
        variant="blue"
        items={[
          { label: 'Quem', value: 'Essencial se tem dependentes financeiros', icon: 'target' },
          { label: 'Valor', value: 'Cobertura de 5-10x sua renda anual', icon: 'money' },
          { label: 'Tipos', value: 'Temporário (mais barato) ou vitalício', icon: 'check' },
          { label: 'Dica', value: 'Empresa pode oferecer - verifique benefícios', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-blue-500/10 text-white border-2 border-blue-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-blue-400 mb-3">Quem PRECISA de seguro de vida?</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-emerald-400 mb-2">Precisa:</p>
            <ul className="text-white/70 text-sm space-y-1">
              <li>- Tem filhos pequenos</li>
              <li>- Conjuge não trabalha ou ganha pouco</li>
              <li>- Pais idosos que dependem de voce</li>
              <li>- Tem dividas (financiamento, etc)</li>
              <li>- E a principal fonte de renda da casa</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-red-400 mb-2">Talvez não precise:</p>
            <ul className="text-white/70 text-sm space-y-1">
              <li>- Solteiro sem dependentes</li>
              <li>- Casal sem filhos, ambos trabalham</li>
              <li>- Já tem patrimônio para deixar</li>
              <li>- Filhos adultos independentes</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Tipos de Seguro de Vida</h2>
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800 text-white border-2 border-white/20 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-2">Seguro de Vida Tradicional</h4>
          <p className="text-white/60 text-sm mb-2">Paga indenizacao em caso de morte. O mais comum é barato.</p>
          <p className="text-white/40 text-xs">Custo médio: R$30 a R$100/mes para cobertura de R$200-500 mil</p>
        </div>
        
        <div className="bg-slate-800 text-white border-2 border-white/20 rounded-xl p-5">
          <h4 className="font-bold text-blue-400 mb-2">Seguro de Vida com Invalidez (IPA)</h4>
          <p className="text-white/60 text-sm mb-2">Além de morte, cobre invalidez permanente por acidente.</p>
          <p className="text-white/40 text-xs">Custo médio: R$50 a R$150/mes</p>
        </div>
        
        <div className="bg-slate-800 text-white border-2 border-white/20 rounded-xl p-5">
          <h4 className="font-bold text-purple-400 mb-2">Seguro DIT (Diaria por Incapacidade Temporaria)</h4>
          <p className="text-white/60 text-sm mb-2">Paga uma diaria se você ficar afastado do trabalho por doenca/acidente.</p>
          <p className="text-white/40 text-xs">Bom para autônomos que não tem INSS forte</p>
        </div>
        
        <div className="bg-slate-800 text-white border-2 border-white/20 rounded-xl p-5">
          <h4 className="font-bold text-orange-400 mb-2">Seguro de Vida Resgatavel</h4>
          <p className="text-white/60 text-sm mb-2">Parte do que você paga pode ser resgatada no futuro. Funciona como poupança.</p>
          <p className="text-white/40 text-xs">Geralmente mais caro é rende menos que investir separado</p>
        </div>
        
        <div className="bg-slate-800 text-white border-2 border-white/20 rounded-xl p-5">
          <h4 className="font-bold text-pink-400 mb-2">Seguro de Doencas Graves</h4>
          <p className="text-white/60 text-sm mb-2">Paga indenizacao se você for diagnosticado com cancer, infarto, AVC, etc.</p>
          <p className="text-white/40 text-xs">Você recebe em vida para tratamento</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Quanto de cobertura preciso?</h2>
      <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-6 mb-8">
        <p className="text-white/70 mb-4">Regra prática: cobertura deve ser suficiente para:</p>
        <ul className="text-white/70 space-y-2">
          <li>- Quitar todas as dividas (financiamento, carro, cartao)</li>
          <li>- Manter a família por 5-10 anos sem sua renda</li>
          <li>- Cobrir educação dos filhos</li>
          <li>- Cobrir custos do funeral</li>
        </ul>
        <div className="mt-4 p-4 bg-black/30 rounded-xl">
          <p className="text-emerald-400 font-bold">Formula simplificada:</p>
          <p className="text-white/70">Cobertura = (Renda anual x 5) + Dividas + Educação filhos</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Quanto custa?</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="border border-white/20 p-3 text-left">Perfil</th>
              <th className="border border-white/20 p-3 text-center">Cobertura</th>
              <th className="border border-white/20 p-3 text-center">Mensalidade</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            <tr><td className="border border-white/20 p-3">Homem, 30 anos, não fumante</td><td className="border border-white/20 p-3 text-center">R$300.000</td><td className="border border-white/20 p-3 text-center">R$40-70</td></tr>
            <tr><td className="border border-white/20 p-3">Mulher, 30 anos, não fumante</td><td className="border border-white/20 p-3 text-center">R$300.000</td><td className="border border-white/20 p-3 text-center">R$30-50</td></tr>
            <tr><td className="border border-white/20 p-3">Homem, 45 anos, não fumante</td><td className="border border-white/20 p-3 text-center">R$500.000</td><td className="border border-white/20 p-3 text-center">R$150-250</td></tr>
            <tr><td className="border border-white/20 p-3">Homem, 45 anos, fumante</td><td className="border border-white/20 p-3 text-center">R$500.000</td><td className="border border-white/20 p-3 text-center">R$300-500</td></tr>
          </tbody>
        </table>
      </div>

      <div className="bg-yellow-500/10 text-white border-2 border-yellow-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-yellow-400 mb-3">Fatores que encarecem o seguro</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-white/70 text-sm">
          <ul className="space-y-1">
            <li>- Idade avancada</li>
            <li>- Fumante</li>
            <li>- Obesidade</li>
            <li>- Doencas pre-existentes</li>
          </ul>
          <ul className="space-y-1">
            <li>- Profissao de risco</li>
            <li>- Esportes radicais</li>
            <li>- Historico famíliar de doencas</li>
            <li>- Cobertura muito alta</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">O que verificar antes de contratar</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
          <div>
            <p className="font-bold text-white">Carencia</p>
            <p className="text-white/60 text-sm">Quanto tempo até a cobertura começar a valer (geralmente 30-60 dias).</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
          <div>
            <p className="font-bold text-white">Exclusoes</p>
            <p className="text-white/60 text-sm">O que NAO é coberto: suicidio nos primeiros 2 anos, guerra, etc.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
          <div>
            <p className="font-bold text-white">Reajuste</p>
            <p className="text-white/60 text-sm">Como o preço aumenta ao longo dos anos (por idade ou inflação).</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">4</span>
          <div>
            <p className="font-bold text-white">Beneficiarios</p>
            <p className="text-white/60 text-sm">Quem vai receber. Pode indicar qualquer pessoa, não precisa ser família.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">5</span>
          <div>
            <p className="font-bold text-white">Portabilidade</p>
            <p className="text-white/60 text-sm">Se pode trocar de seguradora mantendo condicoes.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Seguro vida pelo trabalho vale?</h2>
      <div className="bg-slate-800 text-white border-2 border-white/20 rounded-xl p-5 mb-8">
        <p className="text-white/70 mb-4">Muitas empresas oferecem seguro de vida como benefício. Pontos de atencao:</p>
        <ul className="text-white/60 text-sm space-y-2">
          <li>- Geralmente tem cobertura baixa (1-2x salário apenas)</li>
          <li>- Você perde ao sair da empresa</li>
          <li>- E um BONUS, não substitui seguro individual se você precisa de mais cobertura</li>
          <li>- Aproveite enquanto é gratis, mas tenha o seu próprio tambem</li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border-2 border-emerald-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3">Veredicto</h3>
        <p className="text-white/70">
          Seguro de vida é <strong className="text-emerald-400">essencial</strong> para quem tem dependentes financeiros. O custo é baixo comparado a proteção que oferece. Faça cotações em pelo menos 3 seguradoras é escolha a que oferece melhor custo-benefício para seu perfil.
        </p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Quanto custa um seguro de vida?",
                      "answer": "Um seguro básico de R$ 100.000 de cobertura pode custar a partir de R$ 30-50/mês para jovens saudáveis."
              },
              {
                      "question": "Seguro de vida vale a pena?",
                      "answer": "Vale se você tem dependentes financeiros (filhos, cônjuge, pais idosos). Menos essencial para solteiros sem dependentes."
              },
              {
                      "question": "O que o seguro de vida cobre?",
                      "answer": "Cobertura básica: morte. Adicionais: invalidez, doenças graves, diária por internação, assistência funeral."
              },
              {
                      "question": "Qual valor de cobertura ideal?",
                      "answer": "Uma regra é ter 5-10x sua renda anual. Se ganha R$ 5.000/mês, busque R$ 300.000-600.000."
              }
      ]} />
    </ArticleLayout>
  );
};

export default SeguroDeVida;