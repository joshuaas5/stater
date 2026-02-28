import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import QuickSummary from '@/components/QuickSummary';
import FAQSchema from '@/components/FAQSchema';

const CLTvsPJGuia: React.FC = () => {
  return (
    <ArticleLayout 
      title="CLT vs PJ: Guia Completo para Decidir" 
      description="Comparação detalhada entre CLT é PJ. Qual compensa mais? Veja os pros, contras é quando cada modalidade vale a pena." 
      canonical="/blog/clt-vs-pj" 
      keywords="CLT ou PJ, diferença CLT PJ, vale a pena ser PJ, trabalhar como PJ, comparação CLT PJ" 
      date="6 de Fevereiro de 2026" 
      readTime="12 min" 
      relatedArticles={[
        { title: 'Calculadora CLT vs PJ', slug: 'calculadora-clt-pj' }, 
        { title: 'Imposto de Renda 2026', slug: 'imposto-de-renda' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">A eterna duvida de quem recebe proposta PJ: <strong className="text-yellow-400">compensa ou é cilada?</strong> A resposta depende de vários fatores que vamos analisar aqui.</p>
      <QuickSummary 
        variant="purple"
        items={[
          { label: 'CLT', value: '13º, férias, FGTS, INSS - segurança mas salário menor', icon: 'shield' },
          { label: 'PJ', value: 'Salário maior mas sem benefícios - precisa de reserva', icon: 'money' },
          { label: 'Conta', value: 'PJ geralmente vale se pagar 40%+ a mais que CLT', icon: 'target' },
          { label: 'Dica', value: 'Use nossa calculadora para comparar valores reais', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-gradient-to-r from-blue-600/30 to-emerald-600/30 border-2 border-blue-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Regra de Ouro</h3>
        <p className="text-white/70">
          Para compensar virar PJ, a oferta deve ser pelo menos <strong className="text-emerald-400">40% a 70% maior</strong> que o salário CLT equivalente. Menos que isso, você provavelmente está perdendo dinheiro.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">O que você perde saindo da CLT</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="border border-white/20 p-3 text-left">Benefício CLT</th>
              <th className="border border-white/20 p-3 text-center">Valor Aproximado/Ano</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            <tr><td className="border border-white/20 p-3">13o salário</td><td className="border border-white/20 p-3 text-center">1 salário</td></tr>
            <tr><td className="border border-white/20 p-3">Ferias + 1/3</td><td className="border border-white/20 p-3 text-center">1,33 salário</td></tr>
            <tr><td className="border border-white/20 p-3">FGTS (8% mes)</td><td className="border border-white/20 p-3 text-center">0,96 salário</td></tr>
            <tr><td className="border border-white/20 p-3">Multa 40% FGTS (demissão)</td><td className="border border-white/20 p-3 text-center">~0,4 salário</td></tr>
            <tr><td className="border border-white/20 p-3">INSS pago pelo empregador</td><td className="border border-white/20 p-3 text-center">~20% do salário</td></tr>
            <tr><td className="border border-white/20 p-3">VR/VA (se aplicavel)</td><td className="border border-white/20 p-3 text-center">~R$600/mes = R$7.200</td></tr>
            <tr><td className="border border-white/20 p-3">Plano de saude</td><td className="border border-white/20 p-3 text-center">~R$500/mes = R$6.000</td></tr>
            <tr className="bg-red-500/10 text-white/20">
              <td className="border border-white/20 p-3 font-bold text-red-400">TOTAL BENEFICIOS</td>
              <td className="border border-white/20 p-3 text-center font-bold text-red-400">~3,7 salários + benefícios</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Vantagens CLT</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-500/10 text-white border-2 border-blue-500 rounded-xl p-4">
          <p className="font-bold text-blue-400">Estabilidade</p>
          <p className="text-white/60 text-sm">So pode ser demitido com aviso previo é direitos pagos.</p>
        </div>
        <div className="bg-blue-500/10 text-white border-2 border-blue-500 rounded-xl p-4">
          <p className="font-bold text-blue-400">INSS automático</p>
          <p className="text-white/60 text-sm">Contribuição já descontada, garantindo aposentadoria.</p>
        </div>
        <div className="bg-blue-500/10 text-white border-2 border-blue-500 rounded-xl p-4">
          <p className="font-bold text-blue-400">Benefícios</p>
          <p className="text-white/60 text-sm">VR, VA, plano de saude, seguro de vida, PLR...</p>
        </div>
        <div className="bg-blue-500/10 text-white border-2 border-blue-500 rounded-xl p-4">
          <p className="font-bold text-blue-400">Direitos trabalhistas</p>
          <p className="text-white/60 text-sm">Licenca maternidade/paternidade, auxílio doenca, etc.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Vantagens PJ</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Salário líquido maior</p>
          <p className="text-white/60 text-sm">Menos descontos na fonte, mais dinheiro no bolso.</p>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Impostos menores</p>
          <p className="text-white/60 text-sm">Simples Nacional pode ser 6% a 15% vs até 27,5% CLT.</p>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Flexibilidade</p>
          <p className="text-white/60 text-sm">Pode prestar serviço para multiplas empresas.</p>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Deduções</p>
          <p className="text-white/60 text-sm">Despesas da empresa podem ser abatidas.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Desvantagens PJ</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Sem FGTS nem 13o</p>
          <p className="text-white/60 text-sm">Você precisa se planejar para férias é reservas.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">INSS por conta própria</p>
          <p className="text-white/60 text-sm">Se esquecer de pagar, fica sem aposentadoria.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Instabilidade</p>
          <p className="text-white/60 text-sm">Contrato pode ser encerrado a qualquer momento.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Custos extras</p>
          <p className="text-white/60 text-sm">Contador, taxas, plano de saude particular.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Simples Nacional: Quanto paga de imposto?</h2>
      <div className="bg-slate-800 text-white border-2 border-white/20 rounded-2xl p-6 mb-8">
        <p className="text-white/70 mb-4">Para prestadores de serviço (Anexo III ou V):</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-2 text-white/60">Faturamento Anual</th>
                <th className="text-center p-2 text-white/60">Alíquota</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              <tr className="border-b border-white/10"><td className="p-2">Até R$180.000</td><td className="text-center">6%</td></tr>
              <tr className="border-b border-white/10"><td className="p-2">R$180k a R$360k</td><td className="text-center">11,2%</td></tr>
              <tr className="border-b border-white/10"><td className="p-2">R$360k a R$720k</td><td className="text-center">13,5%</td></tr>
              <tr className="border-b border-white/10"><td className="p-2">R$720k a R$1.8M</td><td className="text-center">16%</td></tr>
              <tr><td className="p-2">R$1.8M a R$3.6M</td><td className="text-center">21%</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-yellow-400 text-sm mt-4">Obs: Anexo V (mais caro) aplica se folha de pagamento for menor que 28% do faturamento.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Quando CLT compensa mais?</h2>
      <div className="bg-blue-500/10 text-white border-2 border-blue-500 rounded-xl p-5 mb-8">
        <ul className="text-white/70 space-y-2">
          <li>- Você valoriza estabilidade acima de tudo</li>
          <li>- A empresa oferece bons benefícios (plano top, PLR alto)</li>
          <li>- Você não tem disciplina para guardar dinheiro</li>
          <li>- Está planejando licença maternidade/paternidade</li>
          <li>- O salário PJ oferecido é menos de 40% maior</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Quando PJ compensa mais?</h2>
      <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-5 mb-8">
        <ul className="text-white/70 space-y-2">
          <li>- O salário PJ é pelo menos 60-70% maior que CLT</li>
          <li>- Você tem disciplina para guardar reservas</li>
          <li>- Já tem plano de saude por outro meio</li>
          <li>- Pode pegar multiplos clientes</li>
          <li>- Está em area de alta demanda (TI, por exemplo)</li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border-2 border-yellow-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-yellow-400 mb-3">Dica Final</h3>
        <p className="text-white/70">
          Use nossa <a href="/ferramentas/calculadora-clt-pj" className="text-emerald-400 underline">Calculadora CLT vs PJ</a> para comparar os números exatos da sua situação. Não tome essa decisão no chute - faça as contas!
        </p>
      </div>
    
      <FAQSchema 
        faqs={[
          {
            question: "CLT ou PJ: qual paga menos imposto?",
            answer: "Depende do valor. Ate R$ 5.000, CLT é PJ pagam pouco imposto. Acima de R$ 10.000, PJ costuma pagar menos. Use nossa calculadora para simular seu caso."
          },
          {
            question: "PJ pode ter férias é 13o?",
            answer: "Nao automaticamente. Como PJ, você precisa se organizar para guardar o equivalente a férias (8,3%) é 13o (8,3%) todo mes, além de FGTS (8%)."
          },
          {
            question: "Quanto um PJ precisa ganhar para compensar?",
            answer: "Regra geral: o PJ precisa ganhar pelo menos 40% a mais que o salário CLT para ter o mesmo padrao, considerando todos os beneficios."
          },
          {
            question: "PJ pode ter plano de saude é vale?",
            answer: "Sim! PJ pode contratar plano de saude empresarial (mais barato) é até deduzir como despesa. Tambem pode ter cartao alimentacao corporativo."
          },
          {
            question: "Qual o risco de ser PJ?",
            answer: "Os principais riscos sao: instabilidade de renda, sem seguro desemprego, responsabilidade de guardar para aposentadoria, é possivel vinculo empregaticio se trabalhar só para uma empresa."
          }
        ]}
      />
    </ArticleLayout>
  );
};

export default CLTvsPJGuia;