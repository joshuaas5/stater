import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from '@/components/ArticleLayout';
import QuickSummary from '@/components/QuickSummary';
import FAQSchema from '@/components/FAQSchema';

const ReservaDeEmergencia: React.FC = () => {
  return (
    <ArticleLayout
      title="Reserva de Emergência: Quanto Guardar é Onde Deixar seu Dinheiro"
      description="Aprenda a montar sua reserva de emergência: quanto guardar, onde investir é como calcular o valor ideal para sua segurança financeira."
      canonical="/blog/reserva-de-emergencia"
      keywords="reserva de emergência, fundo de emergência, quanto guardar, onde investir reserva"
      date="03 de Fevereiro de 2026"
      readTime="7 min"
      relatedArticles={[
        { title: 'Como Juntar Dinheiro Rápido', slug: 'como-juntar-dinheiro-rapido' },
        { title: 'Tesouro Direto para Iniciantes', slug: 'tesouro-direto-iniciantes' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">A reserva de emergência é o primeiro passo para qualquer pessoa que quer ter tranquilidade financeira. Sem ela, qualquer imprevisto vira uma bola de neve.</p>

      <QuickSummary 
        variant="blue"
        items={[
          { label: 'Quanto', value: '3 a 6 meses de gastos mensais (CLT) ou 12 meses (autônomo)', icon: 'money' },
          { label: 'Onde', value: 'CDB liquidez diária, Tesouro Selic ou conta que renda 100% CDI', icon: 'shield' },
          { label: 'Quando usar', value: 'SOMENTE emergências: saúde, desemprego, consertos urgentes', icon: 'alert' },
          { label: 'Prioridade', value: 'Monte ANTES de investir em renda variável ou objetivos', icon: 'target' },
        ]}
      />

      <h2 className="text-2xl font-bold mt-10 mb-4">O que é reserva de emergência?</h2>
      <p className="text-white/70 mb-4">É um dinheiro guardado para cobrir despesas inesperadas ou períodos sem renda. Funciona como um colchão de segurança entre você é os problemas da vida.</p>
      
      <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-4 mb-6">
        <p className="text-red-400 font-medium"> Sem reserva, qualquer imprevisto vira dívida: carro quebrou, perdeu emprego, problema de saúde = cartão de crédito = juros de 400% ao ano!</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Quanto guardar?</h2>
      <p className="text-white/70 mb-4">Depende da sua estabilidade de renda:</p>
      
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-500/10 border-4 border-blue-500 rounded-xl p-5 shadow-[4px_4px_0px_0px_#3b82f6]">
          <p className="text-blue-400 font-bold text-lg mb-2">CLT / Funcionário Público</p>
          <p className="text-3xl font-black text-white mb-2">3-6 meses</p>
          <p className="text-white/60 text-sm">de gastos mensais</p>
        </div>
        <div className="bg-orange-500/10 border-4 border-orange-500 rounded-xl p-5 shadow-[4px_4px_0px_0px_#f97316]">
          <p className="text-orange-400 font-bold text-lg mb-2">Autônomo / MEI / PJ</p>
          <p className="text-3xl font-black text-white mb-2">6-12 meses</p>
          <p className="text-white/60 text-sm">de gastos mensais</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Como calcular sua reserva</h2>
      <p className="text-white/70 mb-4">Some todos os seus gastos fixos mensais:</p>
      <div className="bg-slate-800 border-4 border-slate-700 rounded-xl p-5 mb-6 shadow-[4px_4px_0px_0px_#334155]">
        <ul className="text-white/70 space-y-2">
          <li>+ Aluguel/Financiamento: R$ ____</li>
          <li>+ Contas (luz, água, internet): R$ ____</li>
          <li>+ Alimentação: R$ ____</li>
          <li>+ Transporte: R$ ____</li>
          <li>+ Plano de saúde: R$ ____</li>
          <li className="border-t border-slate-600 pt-2 mt-2">
            <strong className="text-white">= Total mensal  6 = Sua reserva ideal</strong>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Onde deixar sua reserva?</h2>
      <p className="text-white/70 mb-4">A reserva precisa ter <strong className="text-emerald-400">liquidez diária</strong> (acesso imediato) é <strong className="text-emerald-400">baixo risco</strong>. Esqueça ações ou cripto para isso!</p>
      
      <div className="space-y-4 mb-8">
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4">
          <h3 className="text-emerald-400 font-bold mb-1"> CDB com Liquidez Diária (100% CDI)</h3>
          <p className="text-white/60 text-sm">Nubank, Inter, C6 - Rende todo dia é pode sacar quando quiser</p>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4">
          <h3 className="text-emerald-400 font-bold mb-1"> Tesouro Selic</h3>
          <p className="text-white/60 text-sm">Investimento mais seguro do Brasil, liquidez em 1 dia útil</p>
        </div>
        <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-4">
          <h3 className="text-white/60 font-bold mb-1"> Poupança (não recomendado)</h3>
          <p className="text-white/50 text-sm">Rende menos que a inflação, mas é melhor que nada</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Quando usar a reserva?</h2>
      <p className="text-white/70 mb-4">SOMENTE para emergências reais:</p>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li> Perda de emprego</li>
        <li> Problemas de saúde</li>
        <li> Consertos urgentes (carro, casa)</li>
        <li> Viagem de última hora</li>
        <li> Celular novo</li>
        <li> Promoção imperdível</li>
      </ul>

      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border-4 border-blue-500 rounded-xl p-6 mt-10 shadow-[4px_4px_0px_0px_#3b82f6]">
        <h3 className="text-xl font-bold mb-3 text-blue-400"> Acompanhe sua reserva</h3>
        <p className="text-white/80 mb-4">Use o <Link to="/login?view=register" className="text-blue-400 hover:underline font-bold">Stater</Link> para definir metas é acompanhar o progresso da sua reserva de emergência.</p>
        <Link to="/login?view=register" className="inline-block bg-blue-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-600 transition">
          Criar minha meta 
        </Link>
      </div>
    
      <FAQSchema 
        faqs={[
          {
            question: "Quanto devo ter de reserva de emergencia?",
            answer: "Se você é CLT ou funcionário publico, guarde de 3 a 6 meses de gastos. Se é autonomo, MEI ou PJ, guarde de 6 a 12 meses de gastos mensais."
          },
          {
            question: "Onde deixar minha reserva de emergencia?",
            answer: "Em investimentos com liquidez diaria é baixo risco: CDB 100% CDI (Nubank, Inter, C6), Tesouro Selic, ou contas que rendem automaticamente. NUNCA em ações ou cripto."
          },
          {
            question: "Posso usar a reserva para comprar algo?",
            answer: "NAO! A reserva é SOMENTE para emergencias reais: desemprego, problemas de saude, consertos urgentes. Para outros objetivos, crie uma poupança separada."
          },
          {
            question: "Como comecar a montar minha reserva?",
            answer: "Comece guardando qualquer valor, mesmo R$ 50 por mes. O importante é criar o habito. Use o Stater para separar automaticamente uma porcentagem da sua renda."
          }
        ]}
      />
    </ArticleLayout>
  );
};

export default ReservaDeEmergencia;
