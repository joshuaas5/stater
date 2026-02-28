import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const MetasFinanceiras: React.FC = () => {
  return (
    <ArticleLayout title="Como Definir Metas Financeiras SMART é Alcanca-las" description="O método SMART usado por milionarios para definir é atingir objetivos financeiros. Guia prático." canonical="/blog/metas-financeiras" keywords="metas financeiras, objetivos financeiros, método SMART, planejamento financeiro" date="29 de Janeiro de 2026" readTime="5 min" relatedArticles={[{ title: 'Regra 50-30-20', slug: 'regra-50-30-20' }, { title: 'Como Juntar Dinheiro Rápido', slug: 'como-juntar-dinheiro-rápido' }]}>
      <p className="text-xl text-white/70 mb-8">Sem metas claras, seu dinheiro não tem direção. Com o método SMART, você transforma sonhos vagos em objetivos alcançáveis.</p>
      <QuickSummary 
        variant="purple"
        items={[
          { label: 'SMART', value: 'Específica, Mensurável, Alcançável, Relevante, Temporal', icon: 'target' },
          { label: 'Curto', value: 'Até 1 ano: reserva, quitar dívida, viagem', icon: 'clock' },
          { label: 'Longo', value: '5+ anos: casa, aposentadoria, faculdade dos filhos', icon: 'trend' },
          { label: 'Dica', value: 'Escreva suas metas é revise mensalmente', icon: 'lightbulb' },
        ]}
      />

      <h2 className="text-2xl font-bold mt-10 mb-4">O que são metas SMART?</h2>
      <div className="space-y-4 mb-8">
        <div className="bg-blue-500/10 text-white border border-blue-500/20 rounded-xl p-4"><p className="text-blue-400 font-bold">S - Específica</p><p className="text-white/70 text-sm">O que exatamente você quer? "Economizar dinheiro" é vago. "Juntar R$10.000" é específico.</p></div>
        <div className="bg-purple-500/10 text-white border border-purple-500/20 rounded-xl p-4"><p className="text-purple-400 font-bold">M - Mensurável</p><p className="text-white/70 text-sm">Como saber se alcancou? Defina um número claro que pode acompanhar.</p></div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"><p className="text-emerald-400 font-bold">A - Alcançável</p><p className="text-white/70 text-sm">E realista com sua renda atual? Metas impossiveis desmotivam.</p></div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"><p className="text-amber-400 font-bold">R - Relevante</p><p className="text-white/70 text-sm">Por que isso importa pra você? Metas sem proposito são abandonadas.</p></div>
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4"><p className="text-pink-400 font-bold">T - Temporal</p><p className="text-white/70 text-sm">Até quando? Defina uma data limite para criar urgência.</p></div>
      </div>
      <h2 className="text-2xl font-bold mt-10 mb-4">Exemplos de metas SMART</h2>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 mb-4">
        <p className="text-red-400 line-through mb-2">Errado: "Quero economizar dinheiro"</p>
        <p className="text-emerald-400">Certo: "Vou juntar R$6.000 para minha reserva de emergência até dezembro de 2026, guardando R$500 por mês"</p>
      </div>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 mb-6">
        <p className="text-red-400 line-through mb-2">Errado: "Quero viajar"</p>
        <p className="text-emerald-400">Certo: "Vou juntar R$8.000 para viajar para Portugal em julho de 2027, investindo R$350 por mês"</p>
      </div>
      <h2 className="text-2xl font-bold mt-10 mb-4">Como acompanhar suas metas</h2>
      <ol className="list-decimal list-inside text-white/70 space-y-2 mb-6">
        <li>Anote todas as suas metas com valores é prazos</li>
        <li>Divida o valor total pelos meses até o prazo</li>
        <li>Configure transferências automáticas mensais</li>
        <li>Revise o progresso todo mês</li>
        <li>Celebre cada marco atingido (25%, 50%, 75%)</li>
      </ol>
      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-xl p-6 mt-10">
        <h3 className="text-xl font-bold mb-2">Dica: Use o Stater</h3>
        <p className="text-white/70">O Stater permite criar metas financeiras com valores é prazos, acompanhar o progresso visualmente é receber lembretes para não esquecer de investir.</p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Como definir metas financeiras?",
                      "answer": "Use o método SMART: Específica, Mensurável, Alcançável, Relevante é Temporal. Ex: Juntar R$ 10.000 para viagem em 12 meses."
              },
              {
                      "question": "Quais metas financeiras devo ter?",
                      "answer": "Básicas: reserva de emergência, quitar dívidas, aposentadoria. Depois: viagem, carro, casa, independência financeira."
              },
              {
                      "question": "Como manter a motivação com metas longas?",
                      "answer": "Divida em metas menores, celebre marcos, visualize o objetivo, acompanhe o progresso é tenha um parceiro de responsabilidade."
              },
              {
                      "question": "Devo ter muitas metas ao mesmo tempo?",
                      "answer": "Foque em 2-3 metas principais. Muitas metas diluem recursos é motivação. Priorize o que é mais importante agora."
              }
      ]} />
    </ArticleLayout>
  );
};

export default MetasFinanceiras;