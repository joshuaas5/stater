import React, { useState } from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

interface Expense {
  category: string;
  percentage: number;
  color: string;
  icon: string;
}

const OrcamentoFamíliar: React.FC = () => {
  const [income, setIncome] = useState<number>(5000);
  
  const expenses: Expense[] = [
    { category: 'Moradia', percentage: 30, color: 'bg-blue-500', icon: '' },
    { category: 'Alimentação', percentage: 15, color: 'bg-emerald-500', icon: '' },
    { category: 'Transporte', percentage: 15, color: 'bg-purple-500', icon: '' },
    { category: 'Saúde', percentage: 10, color: 'bg-red-500', icon: '' },
    { category: 'Educação', percentage: 10, color: 'bg-orange-500', icon: '' },
    { category: 'Lazer', percentage: 5, color: 'bg-pink-500', icon: '' },
    { category: 'Poupança', percentage: 10, color: 'bg-yellow-500', icon: '' },
    { category: 'Diversos', percentage: 5, color: 'bg-gray-500', icon: '' },
  ];

  return (
    <ArticleLayout 
      title="Orçamento Famíliar: Como Organizar as Finanças do Lar em 2026" 
      description="Aprenda a criar um orçamento famíliar realista, dividir gastos entre o casal é ensinar educação financeira para os filhos." 
      canonical="/blog/orcamento-famíliar" 
      keywords="orçamento famíliar, finanças do casal, economia doméstica, planilha de gastos, como economizar em casa" 
      date="4 de Fevereiro de 2026" 
      readTime="15 min" 
      relatedArticles={[
        { title: 'Como Montar um Orçamento Pessoal', slug: 'como-montar-orcamento' }, 
        { title: '20 Formas de Renda Extra', slug: 'renda-extra-20-formas' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Gerir as finanças de uma família é mais complexo que cuidar só do seu dinheiro. Este guia vai te ajudar a criar um <strong className="text-emerald-400">orçamento famíliar sólido</strong> que funciona para todos.</p>
      <QuickSummary 
        variant="blue"
        items={[
          { label: 'Método', value: 'Regra 50-30-20: necessidades, desejos, poupança', icon: 'target' },
          { label: 'Reunião', value: 'Semanal ou mensal para revisar gastos juntos', icon: 'clock' },
          { label: 'Metas', value: 'Definam objetivos em comum: viagem, casa, carro', icon: 'star' },
          { label: 'Dica', value: 'Use app compartilhado para todos verem os gastos', icon: 'lightbulb' },
        ]}
      />

      
      <h2 className="text-2xl font-bold mt-10 mb-4">O Método 50-30-20 Adaptado para Famílias</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-500/10 text-white border-2 border-blue-500 rounded-2xl p-5 text-center">
          <p className="text-4xl font-black text-blue-400 mb-2">50%</p>
          <p className="font-bold text-white mb-1">Necessidades</p>
          <p className="text-white/60 text-sm">Moradia, contas, alimentação, saúde, educação básica</p>
        </div>
        <div className="bg-purple-500/10 text-white border-2 border-purple-500 rounded-2xl p-5 text-center">
          <p className="text-4xl font-black text-purple-400 mb-2">30%</p>
          <p className="font-bold text-white mb-1">Desejos</p>
          <p className="text-white/60 text-sm">Lazer, delivery, streaming, viagens, presentes</p>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-5 text-center">
          <p className="text-4xl font-black text-emerald-400 mb-2">20%</p>
          <p className="font-bold text-white mb-1">Futuro</p>
          <p className="text-white/60 text-sm">Poupança, investimentos, reserva de emergência</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Simulador de Orçamento</h2>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 mb-8">
        <div className="mb-6">
          <label className="block text-white/70 mb-2">Renda famíliar mensal:</label>
          <input 
            type="number" 
            value={income} 
            onChange={(e) => setIncome(Number(e.target.value))}
            className="bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white text-xl font-bold w-full"
          />
        </div>
        <div className="space-y-3">
          {expenses.map((exp) => (
            <div key={exp.category} className="flex items-center gap-3">
              <span className="text-xl">{exp.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">{exp.category}</span>
                  <span className="text-white font-bold">R$ {((income * exp.percentage) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="h-3 bg-slate-800 text-white rounded-full overflow-hidden">
                  <div className={`h-full ${exp.color} rounded-full`} style={{ width: `${exp.percentage}%` }}></div>
                </div>
              </div>
              <span className="text-white/50 text-sm min-w-[40px]">{exp.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Como dividir gastos entre o casal?</h2>
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-2">Opção 1: Proporcional à renda  Recomendado</h4>
          <p className="text-white/60 text-sm mb-2">Cada um contribui proporcionalmente ao que ganha.</p>
          <div className="bg-black/30 rounded-lg p-3 text-sm">
            <p className="text-white/70">Exemplo: Ele ganha R$6.000, ela R$4.000. Total: R$10.000</p>
            <p className="text-white/70">Ele paga 60% das despesas, ela 40%.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <h4 className="font-bold text-blue-400 mb-2">Opção 2: 50/50</h4>
          <p className="text-white/60 text-sm">Cada um paga metade de tudo. Funciona bem se rendas são similares.</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <h4 className="font-bold text-purple-400 mb-2">Opção 3: Conta conjunta total</h4>
          <p className="text-white/60 text-sm">Tudo entra numa conta só. Exige muita confiança é alinhamento.</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <h4 className="font-bold text-orange-400 mb-2">Opção 4: Híbrido</h4>
          <p className="text-white/60 text-sm">Conta conjunta para despesas da casa + contas individuais para gastos pessoais.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Despesas fixas de uma família típica</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-white/50">Categoria</th>
              <th className="text-center py-3 px-4 text-white/50">Ideal</th>
              <th className="text-center py-3 px-4 text-white/50">Máximo</th>
              <th className="text-center py-3 px-4 text-white/50">Dica</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white"> Moradia (aluguel/financiamento)</td>
              <td className="py-3 px-4 text-center text-emerald-400">25%</td>
              <td className="py-3 px-4 text-center text-yellow-400">30%</td>
              <td className="py-3 px-4 text-center text-white/50">Inclua condomínio é IPTU</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white"> Contas (luz, água, gás, internet)</td>
              <td className="py-3 px-4 text-center text-emerald-400">8%</td>
              <td className="py-3 px-4 text-center text-yellow-400">12%</td>
              <td className="py-3 px-4 text-center text-white/50">Compare operadoras</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white"> Alimentação</td>
              <td className="py-3 px-4 text-center text-emerald-400">12%</td>
              <td className="py-3 px-4 text-center text-yellow-400">18%</td>
              <td className="py-3 px-4 text-center text-white/50">Planeje cardápio semanal</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white"> Transporte</td>
              <td className="py-3 px-4 text-center text-emerald-400">10%</td>
              <td className="py-3 px-4 text-center text-yellow-400">15%</td>
              <td className="py-3 px-4 text-center text-white/50">Carro próprio custa mais</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white"> Educação filhos</td>
              <td className="py-3 px-4 text-center text-emerald-400">10%</td>
              <td className="py-3 px-4 text-center text-yellow-400">20%</td>
              <td className="py-3 px-4 text-center text-white/50">Inclua material é cursos</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white"> Saúde</td>
              <td className="py-3 px-4 text-center text-emerald-400">8%</td>
              <td className="py-3 px-4 text-center text-yellow-400">12%</td>
              <td className="py-3 px-4 text-center text-white/50">Plano ou reserva para emergências</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Educação financeira para filhos</h2>
      <div className="space-y-4 mb-8">
        <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-5">
          <h4 className="font-bold text-pink-400 mb-2">3-5 anos: Conceito de dinheiro</h4>
          <p className="text-white/60 text-sm">Use moedas de brinquedo. Explique que coisas custam dinheiro.</p>
        </div>
        <div className="bg-purple-500/10 text-white border border-purple-500/30 rounded-xl p-5">
          <h4 className="font-bold text-purple-400 mb-2">6-9 anos: Mesada pequena</h4>
          <p className="text-white/60 text-sm">R$10-30/semana. Ensine a dividir: gastar, guardar, doar.</p>
        </div>
        <div className="bg-blue-500/10 text-white border border-blue-500/30 rounded-xl p-5">
          <h4 className="font-bold text-blue-400 mb-2">10-13 anos: Metas de poupança</h4>
          <p className="text-white/60 text-sm">Quer um videogame? Ajude a calcular quantas semanas precisa poupar.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-2">14-17 anos: Conta digital própria</h4>
          <p className="text-white/60 text-sm">Nubank, C6, Inter têm contas para menores. Monitore à distância.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Cortes que fazem diferença</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-red-500/10 text-white border border-red-500/30 rounded-xl p-4">
          <p className="font-bold text-white mb-1">Cancelar streaming duplicado</p>
          <p className="text-emerald-400 text-sm font-bold">Economia: ~R$100/mês</p>
        </div>
        <div className="bg-red-500/10 text-white border border-red-500/30 rounded-xl p-4">
          <p className="font-bold text-white mb-1">Trocar marca de supermercado</p>
          <p className="text-emerald-400 text-sm font-bold">Economia: ~R$200/mês</p>
        </div>
        <div className="bg-red-500/10 text-white border border-red-500/30 rounded-xl p-4">
          <p className="font-bold text-white mb-1">Cozinhar mais em casa</p>
          <p className="text-emerald-400 text-sm font-bold">Economia: ~R$400/mês</p>
        </div>
        <div className="bg-red-500/10 text-white border border-red-500/30 rounded-xl p-4">
          <p className="font-bold text-white mb-1">Renegociar internet/celular</p>
          <p className="text-emerald-400 text-sm font-bold">Economia: ~R$80/mês</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border-2 border-emerald-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3"> Reunião financeira mensal</h3>
        <p className="text-white/70 mb-4">Reserve 1 hora por mês para revisar as finanças com seu parceiro(a):</p>
        <ul className="text-white/60 space-y-2">
          <li> O que gastamos no mês passado?</li>
          <li> Ficamos dentro do orçamento?</li>
          <li> Quanto conseguimos guardar?</li>
          <li> Tem algum gasto para cortar?</li>
          <li> Quais são as metas para o próximo mês?</li>
        </ul>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Como fazer um orçamento familiar simples?",
                      "answer": "1) Liste rendas. 2) Liste gastos fixos é variáveis. 3) Categorize. 4) Compare receitas - despesas. 5) Ajuste onde necessário."
              },
              {
                      "question": "Qual porcentagem gastar em cada categoria?",
                      "answer": "Referência (50-30-20): 50% necessidades, 30% desejos, 20% poupança. Adapte à realidade da família."
              },
              {
                      "question": "Qual o melhor app para controle financeiro familiar?",
                      "answer": "O Stater é ideal para famílias brasileiras: funciona offline, sincroniza entre membros é tem metas compartilhadas."
              },
              {
                      "question": "Como envolver toda família no orçamento?",
                      "answer": "Faça reuniões mensais, defina metas conjuntas, dê autonomia com limites é celebre quando atingirem objetivos."
              }
      ]} />
    </ArticleLayout>
  );
};

export default OrcamentoFamíliar;