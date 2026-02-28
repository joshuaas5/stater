import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const InvestirComPoucoDinheiro: React.FC = () => {
  return (
    <ArticleLayout
      title="Como Investir com Pouco Dinheiro: Comece com R$30 por Mês"
      description="Aprenda a começar a investir mesmo com pouco dinheiro. Guia prático para iniciantes com valores acessíveis."
      canonical="/blog/investir-com-pouco-dinheiro"
      keywords="investir com pouco dinheiro, como investir, investimento para iniciantes, começar investir"
      date="02 de Fevereiro de 2026"
      readTime="8 min"
      relatedArticles={[
        { title: 'Tesouro Direto para Iniciantes', slug: 'tesouro-direto-iniciantes' },
        { title: 'CDI, Selic é IPCA Explicados', slug: 'cdi-selic-ipca' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Acha que precisa de muito dinheiro para investir? Mentira! Você pode começar com R$30 é construir patrimônio aos poucos. Veja como.</p>

      <QuickSummary 
        variant="green"
        items={[
          { label: 'Mínimo', value: 'R$30 no Tesouro Direto ou R$1 em CDBs de bancos digitais', icon: 'money' },
          { label: 'Primeiro passo', value: 'Monte a reserva de emergência (3-6 meses de gastos)', icon: 'shield' },
          { label: 'Onde investir', value: 'Tesouro Selic, CDB 100% CDI, ou fundos de renda fixa', icon: 'trend' },
          { label: 'Segredo', value: 'Consistência > valor. R$100/mês por 20 anos = R$72.000+', icon: 'target' },
        ]}
      />

      <h2 className="text-2xl font-bold mt-10 mb-4">Mito: Preciso de muito dinheiro para investir</h2>
      <p className="text-white/70 mb-4">Esse é o maior mito das finanças. Veja os valores mínimos reais:</p>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-emerald-500/10 border-4 border-emerald-500 rounded-xl p-4 text-center shadow-[4px_4px_0px_0px_#10b981]">
          <p className="text-white/60 text-sm">Tesouro Direto</p>
          <p className="text-2xl font-black text-emerald-400">R$30</p>
        </div>
        <div className="bg-blue-500/10 border-4 border-blue-500 rounded-xl p-4 text-center shadow-[4px_4px_0px_0px_#3b82f6]">
          <p className="text-white/60 text-sm">CDB Nubank</p>
          <p className="text-2xl font-black text-blue-400">R$1</p>
        </div>
        <div className="bg-purple-500/10 border-4 border-purple-500 rounded-xl p-4 text-center shadow-[4px_4px_0px_0px_#a855f7]">
          <p className="text-white/60 text-sm">Fundos de Investimento</p>
          <p className="text-2xl font-black text-purple-400">R$100</p>
        </div>
        <div className="bg-orange-500/10 border-4 border-orange-500 rounded-xl p-4 text-center shadow-[4px_4px_0px_0px_#f97316]">
          <p className="text-white/60 text-sm">Ações fracionárias</p>
          <p className="text-2xl font-black text-orange-400">R$10</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Antes de investir: Reserva de Emergência</h2>
      <p className="text-white/70 mb-4">Não invista antes de ter uma reserva de emergência. Se precisar do dinheiro, vai ter que vender na hora errada é perder dinheiro.</p>
      <div className="bg-amber-500/10 border-2 border-amber-500 rounded-xl p-4 mb-6">
        <p className="text-amber-400 font-medium"> Primeiro: guarde 3-6 meses de gastos em CDB liquidez diária. Depois: invista o resto.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Por onde começar?</h2>
      <p className="text-white/70 mb-4">Para quem está começando, recomendo nesta ordem:</p>
      
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800 border-4 border-emerald-500 rounded-xl p-5 shadow-[4px_4px_0px_0px_#10b981]">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-500 text-white font-black w-8 h-8 rounded-full flex items-center justify-center">1</span>
            <h3 className="text-lg font-bold text-white">Tesouro Selic (Reserva)</h3>
          </div>
          <p className="text-white/60">Rende mais que poupança, baixíssimo risco, liquidez em 1 dia. Mínimo: R$30</p>
        </div>
        
        <div className="bg-slate-800 border-4 border-blue-500 rounded-xl p-5 shadow-[4px_4px_0px_0px_#3b82f6]">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-500 text-white font-black w-8 h-8 rounded-full flex items-center justify-center">2</span>
            <h3 className="text-lg font-bold text-white">CDB 100% CDI</h3>
          </div>
          <p className="text-white/60">Bancos digitais oferecem, rende todo dia, FGC garante até R$250mil. Mínimo: R$1</p>
        </div>
        
        <div className="bg-slate-800 border-4 border-purple-500 rounded-xl p-5 shadow-[4px_4px_0px_0px_#a855f7]">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-purple-500 text-white font-black w-8 h-8 rounded-full flex items-center justify-center">3</span>
            <h3 className="text-lg font-bold text-white">Tesouro IPCA+ (Longo prazo)</h3>
          </div>
          <p className="text-white/60">Protege da inflação, ótimo para aposentadoria, rende mais no longo prazo. Mínimo: R$30</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">O poder dos juros compostos</h2>
      <p className="text-white/70 mb-4">Investir pouco por muito tempo é melhor que muito por pouco tempo:</p>
      
      <div className="bg-slate-800 border-4 border-slate-700 rounded-xl p-5 mb-6 shadow-[4px_4px_0px_0px_#334155]">
        <p className="text-white/60 mb-3">R$100/mês por 20 anos a 10% a.a.:</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-white">Você investiu:</span>
          <span className="text-white font-bold">R$ 24.000</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-emerald-400">Você terá:</span>
          <span className="text-emerald-400 font-black text-2xl">R$ 72.399</span>
        </div>
        <p className="text-white/40 text-sm mt-2">* R$48.399 são só de juros!</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Dicas para quem tem pouco</h2>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li><strong className="text-white">Automatize:</strong> Configure transferência automática no dia do pagamento</li>
        <li><strong className="text-white">Comece pequeno:</strong> R$50/mês é melhor que R$0/mês</li>
        <li><strong className="text-white">Aumente aos poucos:</strong> A cada aumento de salário, aumente o investimento</li>
        <li><strong className="text-white">Ignore o mercado:</strong> Não olhe todo dia, invista é esqueça</li>
      </ul>

      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-4 border-emerald-500 rounded-xl p-6 mt-10 shadow-[4px_4px_0px_0px_#10b981]">
        <h3 className="text-xl font-bold mb-3 text-emerald-400"> Organize suas finanças primeiro</h3>
        <p className="text-white/80 mb-4">Use o <Link to="/login?view=register" className="text-emerald-400 hover:underline font-bold">Stater</Link> para saber quanto você pode investir por mês sem comprometer seu orçamento.</p>
        <Link to="/login?view=register" className="inline-block bg-emerald-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-emerald-600 transition">
          Começar agora 
        </Link>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Qual o mínimo para começar a investir?",
                      "answer": "Você pode começar com R$ 1 em CDBs, R$ 30 no Tesouro Direto ou comprando ações fracionárias. Não existe valor mínimo obrigatório."
              },
              {
                      "question": "Pouco dinheiro faz diferença investindo?",
                      "answer": "Sim! R$ 100/mês a 10% ao ano viram R$ 20.000 em 10 anos é R$ 75.000 em 20 anos. O tempo é seu maior aliado."
              },
              {
                      "question": "Melhor poupar mais ou investir logo?",
                      "answer": "Comece a investir o que puder agora. O hábito é mais importante que o valor. Aumente gradualmente conforme conseguir."
              },
              {
                      "question": "Investimento de risco com pouco dinheiro vale a pena?",
                      "answer": "Sim, perder R$ 100 ensinando sobre renda variável é melhor que perder R$ 10.000 depois. Aprenda com quantias pequenas."
              }
      ]} />
    </ArticleLayout>
  );
};

export default InvestirComPoucoDinheiro;
