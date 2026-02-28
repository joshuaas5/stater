import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const ConsorcioValeAPena: React.FC = () => {
  return (
    <ArticleLayout 
      title="Consorcio Vale a Pena? Verdades que Ninguem Conta" 
      description="Análise honesta sobre consorcio: quando vale a pena, quando é furada, como funciona é comparação com financiamento." 
      canonical="/blog/consorcio-vale-a-pena" 
      keywords="consorcio vale a pena, consorcio ou financiamento, como funciona consorcio, taxas consorcio, consorcio imóvel carro" 
      date="6 de Fevereiro de 2026" 
      readTime="10 min" 
      relatedArticles={[
        { title: 'Primeiro Imóvel', slug: 'primeiro-imóvel' }, 
        { title: 'Calculadora de Emprestimo', slug: 'calculadora-emprestimo' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Consorcio é o <strong className="text-yellow-400">queridinho dos vendedores</strong>, mas será que realmente compensa? Vamos analisar friamente os números.</p>
      <QuickSummary 
        variant="yellow"
        items={[
          { label: 'Prós', value: 'Sem juros, disciplina forçada, planejamento longo prazo', icon: 'check' },
          { label: 'Contras', value: 'Taxa de administração, demora para contemplar, sem liquidez', icon: 'alert' },
          { label: 'Quando', value: 'Vale para quem não tem disciplina de poupar sozinho', icon: 'target' },
          { label: 'Dica', value: 'Compare com investir o valor da parcela por conta própria', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-red-500/10 text-white border-2 border-red-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-red-400 mb-3">A Verdade Incomoda</h3>
        <p className="text-white/70">
          Consorcio <strong className="text-white">nao</strong> é investimento. E uma forma de compra programada que <strong className="text-red-400">perde para investir é comprar a vista</strong> em quase todos os cenarios. Mas tem situações especificas onde pode fazer sentido.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Como funciona o consorcio</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <p className="font-bold text-white">1. Você entra num grupo</p>
          <p className="text-white/60 text-sm">Várias pessoas se juntam para formar um fundo comum.</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <p className="font-bold text-white">2. Todo mês tem sorteio</p>
          <p className="text-white/60 text-sm">Um ou mais participantes sao contemplados é recebem a carta de crédito.</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <p className="font-bold text-white">3. Pode dar lance</p>
          <p className="text-white/60 text-sm">Oferecer dinheiro extra para antecipar a contemplacao.</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <p className="font-bold text-white">4. Paga até o fim</p>
          <p className="text-white/60 text-sm">Mesmo contemplado, continua pagando até quitar todas as parcelas.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Custos do consorcio (que você não ve)</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="border border-white/20 p-3 text-left">Taxa</th>
              <th className="border border-white/20 p-3 text-center">Quanto custa</th>
              <th className="border border-white/20 p-3 text-left">O que e</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            <tr>
              <td className="border border-white/20 p-3 font-bold">Taxa de administracao</td>
              <td className="border border-white/20 p-3 text-center text-red-400">10% a 20%</td>
              <td className="border border-white/20 p-3">Paga para a administradora gerênciar o grupo</td>
            </tr>
            <tr>
              <td className="border border-white/20 p-3 font-bold">Fundo de reserva</td>
              <td className="border border-white/20 p-3 text-center">1% a 3%</td>
              <td className="border border-white/20 p-3">Cobre inadimplencia de outros participantes</td>
            </tr>
            <tr>
              <td className="border border-white/20 p-3 font-bold">Seguro</td>
              <td className="border border-white/20 p-3 text-center">Variavel</td>
              <td className="border border-white/20 p-3">Seguro de vida/prestamista</td>
            </tr>
            <tr className="bg-red-500/10 text-white/20">
              <td className="border border-white/20 p-3 font-bold text-red-400">Custo total</td>
              <td className="border border-white/20 p-3 text-center font-bold text-red-400">15% a 25%</td>
              <td className="border border-white/20 p-3 text-red-400">Isso é o que você paga a mais</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Consorcio vs Financiamento vs A vista</h2>
      <div className="bg-slate-800 text-white border-2 border-white/20 rounded-2xl p-6 mb-8">
        <p className="text-white/70 mb-4"><strong className="text-white">Cenario:</strong> Carro de R$60.000 em 60 meses</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-2 text-white/60">Opcao</th>
                <th className="text-right p-2 text-white/60">Parcela</th>
                <th className="text-right p-2 text-white/60">Total pago</th>
                <th className="text-right p-2 text-white/60">Custo extra</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              <tr className="border-b border-white/10">
                <td className="p-2">Consorcio (15% taxa)</td>
                <td className="text-right p-2">R$1.150</td>
                <td className="text-right p-2">R$69.000</td>
                <td className="text-right p-2 text-red-400">+R$9.000</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-2">Financiamento (1,5% a.m.)</td>
                <td className="text-right p-2">R$1.560</td>
                <td className="text-right p-2">R$93.600</td>
                <td className="text-right p-2 text-red-400">+R$33.600</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-emerald-400">Investir é comprar a vista</td>
                <td className="text-right p-2">R$1.000</td>
                <td className="text-right p-2">R$60.000</td>
                <td className="text-right p-2 text-emerald-400">R$0</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-yellow-400 text-sm mt-4">Se você investir R$1.000/mes a 1% a.m., em 48 meses tem os R$60.000.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Quando consorcio pode fazer sentido</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Você não tem disciplina</p>
          <p className="text-white/60 text-sm">Se sabe que vai gastar o dinheiro se ficar na conta, consorcio força a guardar.</p>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Não tem pressa</p>
          <p className="text-white/60 text-sm">Se pode esperar ser sorteado (média de 30-50% do prazo).</p>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Tem dinheiro para lance</p>
          <p className="text-white/60 text-sm">Se já tem reserva para dar lance alto é antecipar.</p>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Quer evitar financiamento</p>
          <p className="text-white/60 text-sm">Ainda assim, prefira se organizar é comprar a vista.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Quando consorcio NAO vale a pena</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Precisa do bem agora</p>
          <p className="text-white/60 text-sm">Pode levar anos para ser contemplado.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Vendedor pressiona para fechar</p>
          <p className="text-white/60 text-sm">Tecnica de venda agressiva é sinal de cilada.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Não leu o contrato</p>
          <p className="text-white/60 text-sm">Muita gente não sabe que paga taxa de administracao alta.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Acha que é investimento</p>
          <p className="text-white/60 text-sm">Consorcio não rende nada. Você paga é não ganha.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Cuidados antes de contratar</h2>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 mb-8">
        <ul className="text-white/70 space-y-2">
          <li><strong className="text-white">1.</strong> Verifique se a administradora é autorizada pelo Banco Central</li>
          <li><strong className="text-white">2.</strong> Leia TODAS as taxas no contrato</li>
          <li><strong className="text-white">3.</strong> Pergunte a taxa de contemplacao por sorteio do grupo</li>
          <li><strong className="text-white">4.</strong> Veja se pode usar FGTS para lance (imoveis)</li>
          <li><strong className="text-white">5.</strong> Simule quanto pagaria investindo o mesmo valor</li>
          <li><strong className="text-white">6.</strong> Não acredite em promessa de contemplacao rapida</li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border-2 border-yellow-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-yellow-400 mb-3">Veredicto Final</h3>
        <p className="text-white/70">
          Consorcio <strong className="text-white">nao é vilao</strong>, mas também <strong className="text-white">nao é a melhor opção</strong> na maioria dos casos. Se você tem disciplina para investir, vai chegar no bem mais rápido é pagando menos. Use consorcio apenas se realmente não conseguir guardar dinheiro sozinho.
        </p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Consórcio vale a pena?",
                      "answer": "Vale se você não tem disciplina para poupar sozinho é não tem pressa para receber o bem. Não vale se precisa do bem com urgência."
              },
              {
                      "question": "Consórcio tem juros?",
                      "answer": "Não há juros, mas há taxa de administração (10% a 20% do valor do bem diluída nas parcelas) é fundo de reserva."
              },
              {
                      "question": "Como ser contemplado mais rápido?",
                      "answer": "Opções: dar lances (usar FGTS é permitido em alguns), escolher grupos menores, entrar em grupos já em andamento."
              },
              {
                      "question": "Posso desistir do consórcio?",
                      "answer": "Sim, mas você só recebe o valor pago (com descontos) quando o grupo encerrar ou se for sorteado."
              }
      ]} />
    </ArticleLayout>
  );
};

export default ConsorcioValeAPena;