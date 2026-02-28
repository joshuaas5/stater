import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import QuickSummary from '@/components/QuickSummary';
import FAQSchema from '@/components/FAQSchema';

const CartaoCréditoVilaOuAliado: React.FC = () => {
  return (
    <ArticleLayout 
      title="Cartão de Crédito: Vilão ou Aliado das suas Finanças em 2026?" 
      description="Aprenda a usar o cartão de crédito a seu favor. Dicas para não cair no rotativo, acumular milhas é ter cashback sem dor de cabeça." 
      canonical="/blog/cartao-de-crédito-vilao-ou-aliado" 
      keywords="cartão de crédito, como usar cartão, rotativo cartão, milhas, cashback, limite cartão, fatura" 
      date="4 de Fevereiro de 2026" 
      readTime="10 min" 
      relatedArticles={[
        { title: 'Score de Crédito: Como Aumentar', slug: 'score-crédito' }, 
        { title: 'Como Negociar Dívidas', slug: 'como-negociar-dividas' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">O cartão de crédito pode ser seu <strong className="text-red-400">pior inimigo</strong> (rotativo de 450% ao ano) ou seu <strong className="text-emerald-400">melhor amigo</strong> (milhas, cashback, parcelamento sem juros). A diferença está em como você usa.</p>
      <QuickSummary 
        variant="orange"
        items={[
          { label: 'Regra', value: 'SEMPRE pague 100% da fatura - nunca o mínimo', icon: 'alert' },
          { label: 'Juros', value: 'Rotativo cobra até 400% ao ano - evite a todo custo', icon: 'money' },
          { label: 'Benefícios', value: 'Cashback, milhas, proteção de compra, parcelamento 0%', icon: 'star' },
          { label: 'Dica', value: 'Use limite de até 30% da sua renda como teto', icon: 'lightbulb' },
        ]}
      />

      
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-red-500/10 text-white border-2 border-red-500 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-red-400 mb-3"> Quando é VILÃO</h3>
          <ul className="text-white/70 space-y-2">
            <li> Pagar só o mínimo da fatura</li>
            <li> Usar para comprar o que não pode</li>
            <li> Entrar no rotativo</li>
            <li> Ter limite maior que a renda</li>
            <li> Perder controle dos gastos</li>
          </ul>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-emerald-400 mb-3"> Quando é ALIADO</h3>
          <ul className="text-white/70 space-y-2">
            <li> Pagar fatura integral todo mês</li>
            <li> Usar apenas para gastos planejados</li>
            <li> Acumular milhas/cashback</li>
            <li> Aproveitar parcelamento 0%</li>
            <li> Centralizar gastos para controle</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> O terror do crédito rotativo</h2>
      <div className="bg-red-500/10 text-white border border-red-500/30 rounded-xl p-5 mb-6">
        <p className="text-white/70 mb-4">Quando você paga menos que o total da fatura, o restante vira <strong className="text-red-400">crédito rotativo</strong> - a modalidade com os maiores juros do Brasil.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="text-center bg-black/30 rounded-xl p-4">
            <p className="text-3xl font-black text-red-400">450%</p>
            <p className="text-white/50 text-sm">Juros médios ao ano</p>
          </div>
          <div className="text-center bg-black/30 rounded-xl p-4">
            <p className="text-3xl font-black text-red-400">15%</p>
            <p className="text-white/50 text-sm">Juros médios ao mês</p>
          </div>
          <div className="text-center bg-black/30 rounded-xl p-4">
            <p className="text-3xl font-black text-red-400">2x</p>
            <p className="text-white/50 text-sm">Dívida dobra em 5 meses</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/10 text-white border border-yellow-500/30 rounded-xl p-5 mb-8">
        <h4 className="font-bold text-yellow-400 mb-2"> Exemplo real</h4>
        <p className="text-white/70 text-sm">
          Fatura de R$1.000, pagou só R$150 (mínimo). Os R$850 restantes viram rotativo.<br/>
          <strong>Mês seguinte:</strong> R$850 + 15% = R$977,50 de dívida + a nova fatura.<br/>
          <strong>Bola de neve!</strong>
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Melhores cartões por categoria (2026)</h2>
      
      <h3 className="text-lg font-bold text-purple-400 mt-6 mb-3">Para acumular milhas </h3>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <p className="font-bold text-white">Itaú Personnalité Visa Infinite</p>
          <p className="text-white/50 text-sm">2.5 pontos/dólar  Salas VIP  Sem limite de pontos</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <p className="font-bold text-white">Bradesco Aeternum</p>
          <p className="text-white/50 text-sm">3 pontos/dólar  Concierge  Seguros premium</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-emerald-400 mt-6 mb-3">Para cashback </h3>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <p className="font-bold text-white">Inter Black</p>
          <p className="text-white/50 text-sm">1.5% cashback  Sem anuidade  Sem mínimo</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <p className="font-bold text-white">C6 Carbon</p>
          <p className="text-white/50 text-sm">2% em categorias  Atomos  Global</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-blue-400 mt-6 mb-3">Sem anuidade (entrada) </h3>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <p className="font-bold text-white">Nubank</p>
          <p className="text-white/50 text-sm">Sem anuidade  Fácil aprovação  App excelente</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <p className="font-bold text-white">Neon</p>
          <p className="text-white/50 text-sm">Sem anuidade  Cashback  Pagamentos em dia = mais limite</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">7 regras de ouro do cartão</h2>
      <div className="space-y-3 mb-8">
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-emerald-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">1</span>
          <div>
            <p className="font-bold text-white">SEMPRE pague o total da fatura</p>
            <p className="text-white/50 text-sm">Nunca o mínimo. Se não tem o total, não gaste.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-emerald-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">2</span>
          <div>
            <p className="font-bold text-white">Use no máximo 30% do limite</p>
            <p className="text-white/50 text-sm">Bom para seu score é para não se enrolar.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-emerald-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">3</span>
          <div>
            <p className="font-bold text-white">Anote TUDO na hora</p>
            <p className="text-white/50 text-sm">Use o app do cartão ou uma planilha. Não deixe acumular.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-emerald-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">4</span>
          <div>
            <p className="font-bold text-white">Evite parcelar em mais de 3x</p>
            <p className="text-white/50 text-sm">Parcelas longas comprometem o orçamento futuro.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-emerald-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">5</span>
          <div>
            <p className="font-bold text-white">Tenha no máximo 2 cartões</p>
            <p className="text-white/50 text-sm">Mais que isso é difícil de controlar.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-emerald-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">6</span>
          <div>
            <p className="font-bold text-white">Escolha data de vencimento estratégica</p>
            <p className="text-white/50 text-sm">5 dias após receber o salário é ideal.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-emerald-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">7</span>
          <div>
            <p className="font-bold text-white">Ative alertas de gastos</p>
            <p className="text-white/50 text-sm">Notificação a cada compra = controle total.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Como maximizar benefícios</h2>
      <div className="bg-purple-500/10 text-white border border-purple-500/30 rounded-xl p-5 mb-8">
        <h4 className="font-bold text-purple-400 mb-3">Estratégia de milhas</h4>
        <ol className="text-white/70 space-y-2 text-sm">
          <li><strong>1.</strong> Concentre TODOS os gastos no cartão (até supermercado é farmácia)</li>
          <li><strong>2.</strong> Pague a fatura com PIX para não perder os pontos</li>
          <li><strong>3.</strong> Transfira pontos para Smiles/Livelo em promoções (bônus de 50-100%)</li>
          <li><strong>4.</strong> Resgate milhas em promoções de passagens</li>
          <li><strong>5.</strong> R$3.000/mês gastos = ~1 passagem nacional/ano</li>
        </ol>
      </div>

      <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-2 border-blue-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3"> Teste: Você está usando certo?</h3>
        <div className="space-y-2 text-white/70">
          <p> Paga fatura integral todo mês?</p>
          <p> Sabe exatamente quanto gastou esse mês?</p>
          <p> Usa menos de 30% do limite?</p>
          <p> Não tem parcelas "infinitas"?</p>
          <p className="font-bold text-emerald-400 mt-3">4 SIMs = Você é um expert! Continue assim.</p>
          <p className="font-bold text-yellow-400">2-3 SIMs = Atenção. Revise seus hábitos.</p>
          <p className="font-bold text-red-400">0-1 SIM = Perigo! O cartão está te prejudicando.</p>
        </div>
      </div>
    
      <FAQSchema 
        faqs={[
          {
            question: "Cartao de crédito é bom ou ruim?",
            answer: "Depende de como você usa. Pago em dia é integralmente, é otimo: da cashback, milhas é prazo. No rotativo, é pessimo: juros de 400% ao ano!"
          },
          {
            question: "Devo pagar o mínimo da fatura?",
            answer: "NUNCA! Pagar o mínimo ativa o rotativo com juros absurdos. Se não pode pagar tudo, parcele a fatura (juros menores) ou pegue emprestimo pessoal."
          },
          {
            question: "Quantos cartoes devo ter?",
            answer: "Idealmente 1 ou 2. Mais cartoes = mais tentacao de gastar é mais dificil controlar. Escolha um com bons benefícios para seu perfil."
          },
          {
            question: "Como usar cartao de crédito corretamente?",
            answer: "Regras: 1) Gaste só o que pode pagar no mes. 2) Pague SEMPRE a fatura total. 3) Aproveite os benefícios (cashback, milhas). 4) Acompanhe gastos em tempo real."
          }
        ]}
      />
    </ArticleLayout>
  );
};

export default CartaoCréditoVilaOuAliado;