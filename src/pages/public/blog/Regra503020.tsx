import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from '@/components/ArticleLayout';
import QuickSummary from '@/components/QuickSummary';
import FAQSchema from '@/components/FAQSchema';

const Regra503020: React.FC = () => {
  return (
    <ArticleLayout
      title="Regra 50-30-20: O Método Mais Simples para Organizar seu Dinheiro"
      description="Aprenda a dividir seu salário de forma inteligente usando a regra 50-30-20 é nunca mais fique no vermelho."
      canonical="/blog/regra-50-30-20"
      keywords="regra 50 30 20, como dividir salário, orçamento pessoal, organizar dinheiro"
      date="03 de Fevereiro de 2026"
      readTime="6 min"
      relatedArticles={[
        { title: 'Como Juntar Dinheiro Rápido', slug: 'como-juntar-dinheiro-rapido' },
        { title: 'Metas Financeiras SMART', slug: 'metas-financeiras' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">A regra 50-30-20 é o método mais simples é eficiente para organizar seu orçamento. Criada pela senadora americana Elizabeth Warren, ela divide sua renda em três categorias fáceis de entender.</p>

      <QuickSummary 
        variant="blue"
        items={[
          { label: '50%', value: 'Necessidades: aluguel, contas, alimentação, transporte', icon: 'shield' },
          { label: '30%', value: 'Desejos: lazer, streaming, restaurantes, hobbies', icon: 'star' },
          { label: '20%', value: 'Poupança: investimentos, reserva de emergência, futuro', icon: 'trend' },
          { label: 'Dica', value: 'Comece adaptando para sua realidade (pode ser 60-20-20)', icon: 'lightbulb' },
        ]}
      />

      <h2 className="text-2xl font-bold mt-10 mb-4">Como funciona a regra 50-30-20?</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-500/10 border-4 border-blue-500 rounded-xl p-4 text-center shadow-[4px_4px_0px_0px_#3b82f6]">
          <p className="text-4xl font-black text-blue-400 mb-2">50%</p>
          <p className="text-white font-bold">Necessidades</p>
          <p className="text-white/50 text-sm">Gastos essenciais</p>
        </div>
        <div className="bg-purple-500/10 border-4 border-purple-500 rounded-xl p-4 text-center shadow-[4px_4px_0px_0px_#a855f7]">
          <p className="text-4xl font-black text-purple-400 mb-2">30%</p>
          <p className="text-white font-bold">Desejos</p>
          <p className="text-white/50 text-sm">Lazer é conforto</p>
        </div>
        <div className="bg-emerald-500/10 border-4 border-emerald-500 rounded-xl p-4 text-center shadow-[4px_4px_0px_0px_#10b981]">
          <p className="text-4xl font-black text-emerald-400 mb-2">20%</p>
          <p className="text-white font-bold">Poupança</p>
          <p className="text-white/50 text-sm">Futuro é investimentos</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">50% - Necessidades (Gastos Essenciais)</h2>
      <p className="text-white/70 mb-4">São os gastos que você PRECISA pagar para viver. Se você não pagar, terá problemas sérios.</p>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li>Aluguel ou financiamento da casa</li>
        <li>Contas de luz, água, gás é internet</li>
        <li>Alimentação básica (supermercado)</li>
        <li>Transporte para trabalho</li>
        <li>Plano de saúde</li>
        <li>Educação dos filhos</li>
      </ul>
      <div className="bg-amber-500/10 border-2 border-amber-500 rounded-xl p-4 mb-6">
        <p className="text-amber-400 font-medium"> Atenção: Se suas necessidades passam de 50%, você precisa revisar seu padrão de vida ou aumentar sua renda.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">30% - Desejos (Qualidade de Vida)</h2>
      <p className="text-white/70 mb-4">São gastos que melhoram sua vida, mas que você sobreviveria sem eles.</p>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li>Netflix, Spotify, streaming</li>
        <li>Restaurantes é delivery</li>
        <li>Shopping é roupas novas</li>
        <li>Academia é hobbies</li>
        <li>Viagens é passeios</li>
        <li>Eletrônicos é gadgets</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">20% - Poupança (Seu Futuro)</h2>
      <p className="text-white/70 mb-4">Esta é a parte mais importante! É o que vai garantir sua tranquilidade no futuro.</p>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li>Reserva de emergência (3-6 meses de gastos)</li>
        <li>Investimentos (Tesouro, CDB, ações)</li>
        <li>Previdência privada</li>
        <li>Quitação de dívidas extras</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">Exemplo Prático: Salário de R$3.000</h2>
      <div className="bg-slate-800 border-4 border-slate-700 rounded-xl p-6 mb-6 shadow-[4px_4px_0px_0px_#334155]">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-blue-400 font-bold">50% Necessidades</span>
            <span className="text-white font-black">R$ 1.500</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-purple-400 font-bold">30% Desejos</span>
            <span className="text-white font-black">R$ 900</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 font-bold">20% Poupança</span>
            <span className="text-white font-black">R$ 600</span>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Adapte para sua realidade</h2>
      <p className="text-white/70 mb-4">A regra 50-30-20 é um guia, não uma lei. Se você ganha pouco, pode ser 70-20-10. Se ganha muito, pode ser 40-20-40. O importante é ter um sistema.</p>

      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/10 border-4 border-blue-500 rounded-xl p-6 mt-10 shadow-[4px_4px_0px_0px_#3b82f6]">
        <h3 className="text-xl font-bold mb-3 text-blue-400"> Comece agora!</h3>
        <p className="text-white/80 mb-4">Use o <Link to="/login?view=register" className="text-blue-400 hover:underline font-bold">Stater</Link> para aplicar a regra 50-30-20 automaticamente nos seus gastos.</p>
        <Link to="/login?view=register" className="inline-block bg-blue-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-600 transition">
          Organizar minhas finanças 
        </Link>
      </div>
    
      <FAQSchema 
        faqs={[
          {
            question: "O que é a regra 50-30-20?",
            answer: "E um metodo de orcamento que divide sua renda em: 50% para necessidades (moradia, contas), 30% para desejos (lazer, compras) é 20% para poupança é investimentos."
          },
          {
            question: "A regra 50-30-20 funciona no Brasil?",
            answer: "Sim, mas pode precisar de ajustes. Em cidades caras como SP, os 50% para necessidades podem não ser suficientes. Adapte para sua realidade."
          },
          {
            question: "E se eu não consigo guardar 20%?",
            answer: "Comece com o que conseguir, mesmo 5% ou 10%. O importante é criar o habito. Conforme aumentar renda ou reduzir gastos, aumente a porcentagem."
          },
          {
            question: "Como comecar a usar a regra 50-30-20?",
            answer: "1) Calcule sua renda liquida. 2) Separe 50% para contas fixas. 3) Defina limite de 30% para gastos variaveis. 4) Automatize os 20% para investimentos."
          }
        ]}
      />
    </ArticleLayout>
  );
};

export default Regra503020;
