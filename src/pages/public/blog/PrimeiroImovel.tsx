import React, { useState } from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const PrimeiroImóvel: React.FC = () => {
  const [valorImóvel, setValorImóvel] = useState(400000);
  const [entrada, setEntrada] = useState(80000);
  const [prazo, setPrazo] = useState(360);
  const [taxa, setTaxa] = useState(9.5);
  
  const calcularParcela = () => {
    const financiamento = valorImóvel - entrada;
    const taxaMensal = taxa / 100 / 12;
    const parcela = financiamento * (taxaMensal * Math.pow(1 + taxaMensal, prazo)) / (Math.pow(1 + taxaMensal, prazo) - 1);
    return { financiamento, parcela, totalPago: parcela * prazo };
  };
  
  const resultado = calcularParcela();

  return (
    <ArticleLayout 
      title="Como Comprar o Primeiro Imóvel: Guia Completo 2026" 
      description="Passo a passo para comprar seu primeiro imóvel. Financiamento, entrada, documentacao, FGTS é tudo que você precisa saber." 
      canonical="/blog/primeiro-imóvel" 
      keywords="como comprar primeiro imóvel, financiamento imobiliário, usar FGTS imóvel, entrada imóvel, casa própria" 
      date="5 de Fevereiro de 2026" 
      readTime="15 min" 
      relatedArticles={[
        { title: 'Independência Financeira', slug: 'independência-financeira' }, 
        { title: 'Fundos Imobiliários', slug: 'fundos-imobiliários' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">O sonho da <strong className="text-emerald-400">casa própria</strong> é real, mas exige planejamento. Este guia vai te ajudar a entender <strong className="text-yellow-400">cada etapa</strong> para não cair em armadilhas.</p>
      <QuickSummary 
        variant="blue"
        items={[
          { label: 'Entrada', value: 'Mínimo 20% do valor - quanto mais, menos juros', icon: 'money' },
          { label: 'Parcela', value: 'Máximo 30% da renda - não comprometa demais', icon: 'target' },
          { label: 'FGTS', value: 'Use para entrada ou amortização - vale muito', icon: 'star' },
          { label: 'Dica', value: 'Simule em vários bancos - taxas variam muito', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-2 border-blue-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Simulador de Financiamento</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-white/60 text-sm">Valor do imóvel</label>
            <input type="number" value={valorImóvel} onChange={(e) => setValorImóvel(Number(e.target.value))} className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white" />
          </div>
          <div>
            <label className="text-white/60 text-sm">Entrada</label>
            <input type="number" value={entrada} onChange={(e) => setEntrada(Number(e.target.value))} className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white" />
          </div>
          <div>
            <label className="text-white/60 text-sm">Prazo (meses)</label>
            <input type="number" value={prazo} onChange={(e) => setPrazo(Number(e.target.value))} className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white" />
          </div>
          <div>
            <label className="text-white/60 text-sm">Taxa anual (%)</label>
            <input type="number" step="0.1" value={taxa} onChange={(e) => setTaxa(Number(e.target.value))} className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white" />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-slate-800 text-white rounded-xl p-4 text-center">
            <p className="text-white/60 text-sm">Financiamento</p>
            <p className="text-xl font-bold text-white">R$ {resultado.financiamento.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-blue-500/10 text-white/20 rounded-xl p-4 text-center">
            <p className="text-blue-400 text-sm">Parcela mensal</p>
            <p className="text-2xl font-black text-blue-400">R$ {resultado.parcela.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          </div>
          <div className="bg-red-500/10 text-white/20 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm">Total pago</p>
            <p className="text-xl font-bold text-red-400">R$ {resultado.totalPago.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo a Passo para Comprar</h2>
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800 text-white border-l-4 border-emerald-500 rounded-r-xl p-4">
          <p className="font-bold text-emerald-400">1. Organize suas financas</p>
          <p className="text-white/60 text-sm">Quite dividas, limpe nome é tenha pelo menos 20% do valor para entrada.</p>
        </div>
        <div className="bg-slate-800 text-white border-l-4 border-emerald-500 rounded-r-xl p-4">
          <p className="font-bold text-emerald-400">2. Defina seu orcamento</p>
          <p className="text-white/60 text-sm">Parcela não pode passar de 30% da renda. Some custos extras (ITBI, escritura, mudança).</p>
        </div>
        <div className="bg-slate-800 text-white border-l-4 border-emerald-500 rounded-r-xl p-4">
          <p className="font-bold text-emerald-400">3. Faça simulações</p>
          <p className="text-white/60 text-sm">Compare taxas entre Caixa, Itau, Bradesco, Santander. Pequenas diferenças = milhares a mais ou menos.</p>
        </div>
        <div className="bg-slate-800 text-white border-l-4 border-emerald-500 rounded-r-xl p-4">
          <p className="font-bold text-emerald-400">4. Busque o imóvel</p>
          <p className="text-white/60 text-sm">Visite várias vezes, em horários diferentes. Verifique vizinhanca, transporte, comercio.</p>
        </div>
        <div className="bg-slate-800 text-white border-l-4 border-emerald-500 rounded-r-xl p-4">
          <p className="font-bold text-emerald-400">5. Análise documental</p>
          <p className="text-white/60 text-sm">Verifique matricula, certidoes negativas, IPTU em dia, se não há pendencias judiciais.</p>
        </div>
        <div className="bg-slate-800 text-white border-l-4 border-emerald-500 rounded-r-xl p-4">
          <p className="font-bold text-emerald-400">6. Solicite financiamento</p>
          <p className="text-white/60 text-sm">Apresente documentos, aguarde análise de crédito é avaliacao do imóvel.</p>
        </div>
        <div className="bg-slate-800 text-white border-l-4 border-emerald-500 rounded-r-xl p-4">
          <p className="font-bold text-emerald-400">7. Assine contrato</p>
          <p className="text-white/60 text-sm">Registre em cartorio. Pronto, o imóvel é seu!</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Usando FGTS na Compra</h2>
      <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-emerald-400 mb-3">Regras para usar FGTS</h3>
        <ul className="text-white/70 space-y-2">
          <li>- Ter pelo menos 3 anos de carteira assinada (nao precisa ser consecutivo)</li>
          <li>- Não ter financiamento ativo no SFH</li>
          <li>- Não ser dono de outro imóvel na cidade</li>
          <li>- Imóvel deve valer até R$1,5 milhao</li>
          <li>- Imóvel deve ser residêncial é urbano</li>
          <li>- Você deve morar ou trabalhar na cidade do imóvel</li>
        </ul>
        <p className="text-emerald-400 font-bold mt-4">Pode usar para: entrada, amortizacao ou quitar parcelas</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Custos Extras que Ninguem Conta</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="border border-white/20 p-3 text-left">Custo</th>
              <th className="border border-white/20 p-3 text-center">Valor Aproximado</th>
              <th className="border border-white/20 p-3 text-left">Quando Pagar</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            <tr>
              <td className="border border-white/20 p-3">ITBI</td>
              <td className="border border-white/20 p-3 text-center">2-3% do imóvel</td>
              <td className="border border-white/20 p-3">Antes da escritura</td>
            </tr>
            <tr>
              <td className="border border-white/20 p-3">Escritura</td>
              <td className="border border-white/20 p-3 text-center">R$1.000 - R$5.000</td>
              <td className="border border-white/20 p-3">Na assinatura</td>
            </tr>
            <tr>
              <td className="border border-white/20 p-3">Registro</td>
              <td className="border border-white/20 p-3 text-center">R$500 - R$2.000</td>
              <td className="border border-white/20 p-3">Após escritura</td>
            </tr>
            <tr>
              <td className="border border-white/20 p-3">Avaliacao banco</td>
              <td className="border border-white/20 p-3 text-center">R$500 - R$3.000</td>
              <td className="border border-white/20 p-3">Na análise do financiamento</td>
            </tr>
            <tr>
              <td className="border border-white/20 p-3">Mudanca</td>
              <td className="border border-white/20 p-3 text-center">R$1.000 - R$5.000</td>
              <td className="border border-white/20 p-3">Ao receber chaves</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-yellow-500/10 text-white border-2 border-yellow-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-yellow-400 mb-3">Regra dos 30%</h3>
        <p className="text-white/70">
          A parcela do financiamento <strong className="text-white">nao pode ultrapassar 30%</strong> da sua renda famíliar mensal. Se sua renda é R$10.000, parcela máxima: R$3.000. Isso é regra do banco é também protege você de apertos financeiros.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">SAC vs PRICE: Qual Sistema?</h2>
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-500/10 text-white border-2 border-blue-500 rounded-xl p-5">
          <h4 className="font-bold text-blue-400 mb-3">SAC (Amortizacao Constante)</h4>
          <ul className="text-white/60 text-sm space-y-2">
            <li>Parcelas começam mais altas</li>
            <li>Diminuem ao longo do tempo</li>
            <li>Paga menos juros no total</li>
            <li className="text-emerald-400 font-bold">RECOMENDADO para maioria</li>
          </ul>
        </div>
        <div className="bg-purple-500/10 text-white border-2 border-purple-500 rounded-xl p-5">
          <h4 className="font-bold text-purple-400 mb-3">PRICE (Parcelas Fixas)</h4>
          <ul className="text-white/60 text-sm space-y-2">
            <li>Parcelas iguais do início ao fim</li>
            <li>Mais fácil de planejar</li>
            <li>Paga mais juros no total</li>
            <li>Bom se renda for apertada</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Erros para Evitar</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Não pesquisar taxas</p>
          <p className="text-white/60 text-sm">Diferença de 0,5% ao ano = dezenas de milhares a mais em 30 anos.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Comprometer toda a renda</p>
          <p className="text-white/60 text-sm">Parcela + condominio + IPTU + manutenção podem sufocar financas.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Ignorar custos extras</p>
          <p className="text-white/60 text-sm">ITBI, escritura, mudança podem somar 5-8% do valor do imóvel.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Não verificar documentacao</p>
          <p className="text-white/60 text-sm">Imóvel com pendencias pode virar pesadelo judicial.</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border-2 border-emerald-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3">Dica Final</h3>
        <p className="text-white/70">
          Não tenha pressa. O primeiro imóvel é uma das maiores decisoes financeiras da vida. Reserve <strong className="text-emerald-400">6 meses a 1 ano</strong> para planejar, juntar entrada é pesquisar. Um erro agora pode custar decadas de parcelas.
        </p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Quanto preciso de entrada para financiar um imóvel?",
                      "answer": "Geralmente você precisa de 20% a 30% do valor do imóvel como entrada. Programas como Minha Casa Minha Vida aceitam entradas menores."
              },
              {
                      "question": "Qual a renda mínima para financiar um imóvel?",
                      "answer": "A parcela não pode ultrapassar 30% da sua renda. Para R$ 200 mil em 30 anos, você precisa de renda de aproximadamente R$ 4.500."
              },
              {
                      "question": "Comprar ou alugar: o que vale mais a pena?",
                      "answer": "Depende do seu momento. Alugar pode valer mais se você precisa de mobilidade ou o aluguel é menor que 0,4% do valor do imóvel."
              },
              {
                      "question": "Como usar o FGTS para comprar imóvel?",
                      "answer": "Você pode usar o FGTS para entrada, amortização ou quitação. Requisitos: 3 anos de trabalho com FGTS é não ter outro financiamento ativo no SFH."
              }
      ]} />
    </ArticleLayout>
  );
};

export default PrimeiroImóvel;