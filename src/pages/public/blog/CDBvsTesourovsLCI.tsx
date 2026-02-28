import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function CDBvsTesourovsLCI() {
  const [valorInvestir, setValorInvestir] = useState<string>("10000");
  const [prazo, setPrazo] = useState<string>("24");
  const [cdiAtual, setCdiAtual] = useState<string>("14.9");
  const [percentualCDB, setPercentualCDB] = useState<string>("100");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const valor = parseFloat(valorInvestir) || 0;
    const meses = parseInt(prazo) || 24;
    const cdi = (parseFloat(cdiAtual) || 14.9) / 100;
    const pctCDB = (parseFloat(percentualCDB) || 100) / 100;

    if (!valor) return;

    // Alíquota IR baseada no prazo
    let aliquotaIR = 0.225;
    if (meses > 6 && meses <= 12) aliquotaIR = 0.20;
    else if (meses > 12 && meses <= 24) aliquotaIR = 0.175;
    else if (meses > 24) aliquotaIR = 0.15;

    // CDB
    const rendimentoBrutoCDB = valor * Math.pow(1 + (cdi * pctCDB / 12), meses) - valor;
    const irCDB = rendimentoBrutoCDB * aliquotaIR;
    const rendimentoLiquidoCDB = rendimentoBrutoCDB - irCDB;
    const totalCDB = valor + rendimentoLiquidoCDB;

    // Tesouro Selic (desconto de 0.20% a.a. de custódia)
    const taxaTesouro = cdi - 0.002;
    const rendimentoBrutoTesouro = valor * Math.pow(1 + (taxaTesouro / 12), meses) - valor;
    const irTesouro = rendimentoBrutoTesouro * aliquotaIR;
    const rendimentoLiquidoTesouro = rendimentoBrutoTesouro - irTesouro;
    const totalTesouro = valor + rendimentoLiquidoTesouro;

    // LCI/LCA (isento de IR, mas geralmente 90% CDI)
    const taxaLCI = cdi * 0.90;
    const rendimentoLCI = valor * Math.pow(1 + (taxaLCI / 12), meses) - valor;
    const totalLCI = valor + rendimentoLCI;

    // Poupança
    const taxaPoupanca = 0.005; // 0.5% ao mês quando Selic > 8.5%
    const rendimentoPoupanca = valor * Math.pow(1 + taxaPoupanca, meses) - valor;
    const totalPoupanca = valor + rendimentoPoupanca;

    setResult({
      valor,
      meses,
      aliquotaIR: aliquotaIR * 100,
      cdb: {
        bruto: rendimentoBrutoCDB,
        ir: irCDB,
        liquido: rendimentoLiquidoCDB,
        total: totalCDB,
        rentabilidadeMensal: (Math.pow(totalCDB / valor, 1/meses) - 1) * 100
      },
      tesouro: {
        bruto: rendimentoBrutoTesouro,
        ir: irTesouro,
        liquido: rendimentoLiquidoTesouro,
        total: totalTesouro,
        rentabilidadeMensal: (Math.pow(totalTesouro / valor, 1/meses) - 1) * 100
      },
      lci: {
        liquido: rendimentoLCI,
        total: totalLCI,
        rentabilidadeMensal: (Math.pow(totalLCI / valor, 1/meses) - 1) * 100
      },
      poupanca: {
        liquido: rendimentoPoupanca,
        total: totalPoupanca,
        rentabilidadeMensal: 0.5
      }
    });
  };

  const comparativo = [
    {
      produto: "CDB",
      liquidez: "D+0 a D+1 (com liquidez) ou vencimento",
      garantia: "FGC até R$ 250 mil",
      ir: "Sim (regressivo)",
      risco: "Baixo",
      minimo: "R$ 1 a R$ 1.000"
    },
    {
      produto: "Tesouro Selic",
      liquidez: "D+1 (venda antecipada possível)",
      garantia: "Governo Federal",
      ir: "Sim (regressivo)",
      risco: "Muito baixo",
      minimo: "R$ 30"
    },
    {
      produto: "LCI/LCA",
      liquidez: "90 dias a 2 anos (carência)",
      garantia: "FGC até R$ 250 mil",
      ir: "Isento",
      risco: "Baixo",
      minimo: "R$ 1.000 a R$ 5.000"
    },
    {
      produto: "Poupança",
      liquidez: "Imediata (D+0)",
      garantia: "FGC até R$ 250 mil",
      ir: "Isento",
      risco: "Muito baixo",
      minimo: "R$ 0,01"
    }
  ];

  return (
    <ArticleLayout
      title="CDB vs Tesouro Selic vs LCI: Comparativo Completo 2026"
      description="Compare CDB, Tesouro Selic, LCI/LCA é Poupança. Simulador de rendimentos, IR, liquidez é qual escolher para cada objetivo."
      keywords={["CDB ou Tesouro", "LCI LCA vale a pena", "melhor renda fixa", "comparar investimentos", "CDB vs Tesouro Selic"]}
      publishedDate="2026-02-04"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Investimentos"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">A Grande Dúvida da Renda Fixa</h2>
          <p className="text-lg mb-4">
            CDB, Tesouro Selic, LCI, LCA, Poupança... qual é o melhor para você? 
            A resposta depende de <strong>prazo, liquidez é valor a investir</strong>.
          </p>
      <QuickSummary 
        variant="blue"
        items={[
          { label: 'CDB', value: 'Rende mais que poupança, FGC garante até R$250mil', icon: 'shield' },
          { label: 'Tesouro', value: 'Mais seguro do Brasil, ideal para reserva é longo prazo', icon: 'star' },
          { label: 'LCI/LCA', value: 'Isento de IR, ótimo para valores maiores', icon: 'money' },
          { label: 'Dica', value: 'Para reserva: Tesouro Selic. Para 2+ anos: Tesouro IPCA+', icon: 'lightbulb' },
        ]}
      />

          <div className="bg-yellow-500/20 border-4 border-yellow-500 p-4">
            <p className="font-bold">
               Regra de ouro: para reserva de emergência, priorize Tesouro Selic ou CDB 
              com liquidez diária. Para prazos maiores, LCI/LCA podem render mais pela isenção de IR.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-100 to-purple-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4"> Simulador Comparativo</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Valor a Investir (R$)</label>
              <input
                type="number"
                value={valorInvestir}
                onChange={(e) => setValorInvestir(e.target.value)}
                placeholder="10000"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Prazo (meses)</label>
              <select
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="w-full p-3 border-4 border-black"
              >
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
                <option value="24">24 meses</option>
                <option value="36">36 meses</option>
                <option value="60">60 meses</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-2">CDI Atual (% a.a.)</label>
              <input
                type="number"
                step="0.01"
                value={cdiAtual}
                onChange={(e) => setCdiAtual(e.target.value)}
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">CDB (% do CDI)</label>
              <input
                type="number"
                value={percentualCDB}
                onChange={(e) => setPercentualCDB(e.target.value)}
                placeholder="100"
                className="w-full p-3 border-4 border-black"
              />
            </div>
          </div>

          <button
            onClick={calcular}
            disabled={!valorInvestir}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            COMPARAR RENDIMENTOS
          </button>

          {result && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-500/20 border-4 border-blue-500 p-4">
                <h3 className="font-black text-lg mb-2"> CDB {percentualCDB}%</h3>
                <p className="text-sm">Rendimento bruto: R$ {result.cdb.bruto.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                <p className="text-sm text-red-600">IR ({result.aliquotaIR}%): -R$ {result.cdb.ir.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                <p className="font-bold text-green-600">Líquido: R$ {result.cdb.liquido.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                <p className="font-black text-xl mt-2">Total: R$ {result.cdb.total.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
              </div>
              
              <div className="bg-emerald-500/20 border-4 border-green-500 p-4">
                <h3 className="font-black text-lg mb-2"> Tesouro Selic</h3>
                <p className="text-sm">Rendimento bruto: R$ {result.tesouro.bruto.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                <p className="text-sm text-red-600">IR ({result.aliquotaIR}%): -R$ {result.tesouro.ir.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                <p className="font-bold text-green-600">Líquido: R$ {result.tesouro.liquido.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                <p className="font-black text-xl mt-2">Total: R$ {result.tesouro.total.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
              </div>
              
              <div className="bg-purple-500/20 border-4 border-purple-500 p-4">
                <h3 className="font-black text-lg mb-2"> LCI/LCA 90%</h3>
                <p className="text-sm">Rendimento: R$ {result.lci.liquido.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                <p className="text-sm text-green-600">IR: Isento </p>
                <p className="font-bold text-green-600">Líquido: R$ {result.lci.liquido.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                <p className="font-black text-xl mt-2">Total: R$ {result.lci.total.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
              </div>
              
              <div className="bg-yellow-500/20 border-4 border-yellow-500 p-4">
                <h3 className="font-black text-lg mb-2"> Poupança</h3>
                <p className="text-sm">Rendimento: R$ {result.poupanca.liquido.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                <p className="text-sm text-green-600">IR: Isento </p>
                <p className="font-bold text-green-600">Líquido: R$ {result.poupanca.liquido.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                <p className="font-black text-xl mt-2">Total: R$ {result.poupanca.total.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Comparativo Detalhado</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-2">Produto</th>
                  <th className="p-2">Liquidez</th>
                  <th className="p-2">Garantia</th>
                  <th className="p-2">IR</th>
                  <th className="p-2">Risco</th>
                  <th className="p-2">Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {comparativo.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-100" : "bg-slate-800 text-white"}>
                    <td className="p-2 font-bold">{item.produto}</td>
                    <td className="p-2">{item.liquidez}</td>
                    <td className="p-2">{item.garantia}</td>
                    <td className="p-2">{item.ir}</td>
                    <td className="p-2">{item.risco}</td>
                    <td className="p-2">{item.minimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-gradient-to-r from-green-100 to-blue-100 border-4 border-black p-6">
          <h2 className="text-2xl font-black mb-4">Qual Escolher?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800 text-white border-4 border-green-500 p-4">
              <h3 className="font-bold text-lg mb-2"> Reserva de Emergência</h3>
              <p><strong>1º Tesouro Selic</strong> - Mais seguro, liquidez D+1</p>
              <p><strong>2º CDB Liquidez Diária</strong> - Pode render mais</p>
            </div>
            <div className="bg-slate-800 text-white border-4 border-blue-500 p-4">
              <h3 className="font-bold text-lg mb-2"> Prazo 6-12 meses</h3>
              <p><strong>CDB 100%+ CDI</strong> - Melhor rendimento</p>
              <p>LCI/LCA se encontrar boas taxas</p>
            </div>
            <div className="bg-slate-800 text-white border-4 border-purple-500 p-4">
              <h3 className="font-bold text-lg mb-2"> Prazo 1-2 anos</h3>
              <p><strong>LCI/LCA 90%+ CDI</strong> - Isenção compensa</p>
              <p>CDB 110%+ CDI como alternativa</p>
            </div>
            <div className="bg-slate-800 text-white border-4 border-yellow-500 p-4">
              <h3 className="font-bold text-lg mb-2"> Prazo 2+ anos</h3>
              <p><strong>LCI/LCA ou CDB</strong> - Ambos bons</p>
              <p>IR de 15% no CDB é menor</p>
            </div>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Tabela de IR sobre Renda Fixa</h2>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="bg-red-600 p-3">
              <p className="font-bold">Até 180 dias</p>
              <p className="text-2xl font-black">22,5%</p>
            </div>
            <div className="bg-orange-600 p-3">
              <p className="font-bold">181 a 360 dias</p>
              <p className="text-2xl font-black">20%</p>
            </div>
            <div className="bg-yellow-600 p-3">
              <p className="font-bold">361 a 720 dias</p>
              <p className="text-2xl font-black">17,5%</p>
            </div>
            <div className="bg-green-600 p-3">
              <p className="font-bold">Acima de 720 dias</p>
              <p className="text-2xl font-black">15%</p>
            </div>
          </div>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "CDB, Tesouro ou LCI: qual rende mais?",
                      "answer": "Depende do prazo é do seu IR. LCI/LCA são isentas de IR, então um LCI de 85% do CDI pode render mais que um CDB de 100%."
              },
              {
                      "question": "Qual é mais seguro?",
                      "answer": "Tesouro Direto é o mais seguro (garantido pelo governo). CDB é LCI têm garantia do FGC até R$ 250.000."
              },
              {
                      "question": "Qual a liquidez de cada investimento?",
                      "answer": "Tesouro Selic é CDB de liquidez diária: resgate imediato. LCI/LCA geralmente têm carência de 90+ dias."
              },
              {
                      "question": "Qual escolher para reserva de emergência?",
                      "answer": "Use Tesouro Selic ou CDB de liquidez diária que renda 100% do CDI. Evite LCI/LCA por causa da carência."
              }
      ]} />
    </ArticleLayout>
  );
}