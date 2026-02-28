import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";

export default function CalculadoraIR() {
  const [rendaMensal, setRendaMensal] = useState<string>("");
  const [dependentes, setDependentes] = useState<string>("0");
  const [previdencia, setPrevidencia] = useState<string>("0");
  const [pensaoAlimenticia, setPensaoAlimenticia] = useState<string>("0");
  const [result, setResult] = useState<any>(null);

  // Tabela IRPF 2026 - Nova faixa de isenção até R$ 5.000
  // Lei aprovada em 2025, vigente a partir de 2026
  const tabelaIR2026 = [
    { limite: 5000.00, aliquota: 0, deducao: 0 },           // Isento até R$ 5.000
    { limite: 6500.00, aliquota: 7.5, deducao: 375.00 },    // 7,5%
    { limite: 8500.00, aliquota: 15, deducao: 862.50 },     // 15%
    { limite: 10500.00, aliquota: 22.5, deducao: 1500.00 }, // 22,5%
    { limite: Infinity, aliquota: 27.5, deducao: 2025.00 }  // 27,5%
  ];

  // Dedução por dependente 2026
  const deducaoDependente = 189.59;

  const calcular = () => {
    const renda = parseFloat(rendaMensal) || 0;
    const numDependentes = parseInt(dependentes) || 0;
    const prevPrivada = parseFloat(previdencia) || 0;
    const pensão = parseFloat(pensaoAlimenticia) || 0;

    if (!renda) return;

    // Deduções
    const deducaoDeps = numDependentes * deducaoDependente;
    const totalDeducoes = deducaoDeps + prevPrivada + pensao;

    // Base de cálculo
    const baseCalculo = Math.max(0, renda - totalDeducoes);

    // Encontrar faixa é calcular IR
    let ir = 0;
    let aliquotaEfetiva = 0;
    let faixaAplicada = tabelaIR2026[0];

    for (const faixa of tabelaIR2026) {
      if (baseCalculo <= faixa.limite) {
        faixaAplicada = faixa;
        ir = (baseCalculo * faixa.aliquota / 100) - faixa.deducao;
        ir = Math.max(0, ir);
        break;
      }
    }

    aliquotaEfetiva = renda > 0 ? (ir / renda) * 100 : 0;

    // IR anual
    const irAnual = ir * 12;
    const rendaAnual = renda * 12;

    setResult({
      rendaMensal: renda,
      rendaAnual,
      baseCalculo,
      totalDeducoes,
      deducaoDeps,
      irMensal: ir,
      irAnual,
      aliquotaNominal: faixaAplicada.aliquota,
      aliquotaEfetiva,
      faixa: faixaAplicada.aliquota === 0 ? "Isento" : `${faixaAplicada.aliquota}%`,
      liquido: renda - ir
    });
  };

  return (
    <ArticleLayout
      title="Calculadora de Imposto de Renda 2026 - Nova Tabela"
      description="Calcule seu IRPF 2026 com a nova faixa de isenção de R$ 5.000. Tabela atualizada, deduções é alíquotas."
      keywords={["calculadora IRPF 2026", "imposto de renda 2026", "nova tabela IR", "isenção 5000 reais", "calcular imposto de renda"]}
      publishedDate="2026-02-04"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Impostos"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Nova Tabela do IR 2026</h2>
          <div className="bg-emerald-900/300/20 border-4 border-green-500 p-4 mb-4">
            <p className="font-bold text-lg text-green-800">
               NOVIDADE: A partir de 2026, quem ganha até <strong>R$ 5.000/mês</strong> está isento de IR!
            </p>
            <p className="text-sm text-green-700 mt-2">
              Lei aprovada em 2025 ampliou a faixa de isenção, beneficiando milhões de brasileiros.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-100 to-green-100 border-4 border-slate-600 p-6 shadow-lg">
          <h2 className="text-2xl font-black mb-4"> Calculadora IRPF 2026</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Renda Mensal Bruta (R$)</label>
              <input
                type="number"
                value={rendaMensal}
                onChange={(e) => setRendaMensal(e.target.value)}
                placeholder="Ex: 6000"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Número de Dependentes</label>
              <input
                type="number"
                value={dependentes}
                onChange={(e) => setDependentes(e.target.value)}
                placeholder="0"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Previdência Privada (R$/mês)</label>
              <input
                type="number"
                value={previdencia}
                onChange={(e) => setPrevidencia(e.target.value)}
                placeholder="0"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Pensão Alimentícia (R$/mês)</label>
              <input
                type="number"
                value={pensaoAlimenticia}
                onChange={(e) => setPensaoAlimenticia(e.target.value)}
                placeholder="0"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
          </div>

          <button
            onClick={calcular}
            disabled={!rendaMensal}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            CALCULAR IMPOSTO DE RENDA
          </button>

          {result && (
            <div className="mt-6 bg-slate-800 text-white border-4 border-slate-600 p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p>Renda mensal bruta: <strong>R$ {result.rendaMensal.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong></p>
                  <p>Total de deduções: <strong>R$ {result.totalDeducoes.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong></p>
                  <p>Base de cálculo: <strong>R$ {result.baseCalculo.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong></p>
                  <p>Faixa: <strong className={result.aliquotaNominal === 0 ? "text-green-600" : "text-blue-600"}>{result.faixa}</strong></p>
                </div>
                
                <div className={`p-4 border-4 ${result.irMensal === 0 ? "bg-emerald-900/300/20 border-green-500" : "bg-blue-900/300/20 border-blue-500"}`}>
                  <p className="text-sm">IR Mensal:</p>
                  <p className="text-3xl font-black">{result.irMensal === 0 ? "ISENTO" : `R$ ${result.irMensal.toLocaleString("pt-BR", {minimumFractionDigits: 2})}`}</p>
                  
                  {result.irMensal > 0 && (
                    <>
                      <p className="text-sm mt-2">IR Anual: R$ {result.irAnual.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</p>
                      <p className="text-sm">Alíquota efetiva: {result.aliquotaEfetiva.toFixed(2)}%</p>
                    </>
                  )}
                  
                  <hr className="my-2 border-slate-600" />
                  <p className="font-bold">Salário líquido: R$ {result.liquido.toLocaleString("pt-BR", {minimumFractionDigits: 2})}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Tabela IRPF 2026 - Valores Mensais</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-slate-600">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Base de Cálculo</th>
                  <th className="p-3 text-center">Alíquota</th>
                  <th className="p-3 text-right">Dedução</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-emerald-900/300/20">
                  <td className="p-3 font-bold">Até R$ 5.000,00</td>
                  <td className="p-3 text-center font-black text-green-600">ISENTO</td>
                  <td className="p-3 text-right">-</td>
                </tr>
                <tr className="bg-slate-800 text-white">
                  <td className="p-3">De R$ 5.000,01 até R$ 6.500,00</td>
                  <td className="p-3 text-center font-bold">7,5%</td>
                  <td className="p-3 text-right">R$ 375,00</td>
                </tr>
                <tr className="bg-slate-800">
                  <td className="p-3">De R$ 6.500,01 até R$ 8.500,00</td>
                  <td className="p-3 text-center font-bold">15%</td>
                  <td className="p-3 text-right">R$ 862,50</td>
                </tr>
                <tr className="bg-slate-800 text-white">
                  <td className="p-3">De R$ 8.500,01 até R$ 10.500,00</td>
                  <td className="p-3 text-center font-bold">22,5%</td>
                  <td className="p-3 text-right">R$ 1.500,00</td>
                </tr>
                <tr className="bg-red-900/300/20">
                  <td className="p-3">Acima de R$ 10.500,00</td>
                  <td className="p-3 text-center font-bold text-red-600">27,5%</td>
                  <td className="p-3 text-right">R$ 2.025,00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-amber-900/300/20 border-4 border-yellow-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Deduções Permitidas 2026</h2>
          <ul className="space-y-2">
            <li> <strong>Dependentes:</strong> R$ 189,59 por dependente/mês</li>
            <li> <strong>Previdência Privada (PGBL):</strong> Até 12% da renda bruta anual</li>
            <li> <strong>Pensão Alimentícia:</strong> Valor integral pago judicialmente</li>
            <li> <strong>Despesas Médicas:</strong> Sem limite (na declaração anual)</li>
            <li> <strong>Educação:</strong> Até R$ 3.561,50/ano por pessoa</li>
          </ul>
        </section>

        <section className="bg-blue-900/300/20 border-4 border-blue-500 p-6">
          <h2 className="text-2xl font-black mb-4">O Que Mudou em 2026?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800 text-white border-2 border-slate-600 p-3">
              <p className="font-bold text-red-600"> ANTES (2024)</p>
              <p>Isenção até R$ 2.824,00</p>
              <p className="text-sm text-white/70">Cerca de 2 salários mínimos</p>
            </div>
            <div className="bg-slate-800 text-white border-2 border-slate-600 p-3">
              <p className="font-bold text-green-600"> AGORA (2026)</p>
              <p>Isenção até R$ 5.000,00</p>
              <p className="text-sm text-white/70">Beneficia ~16 milhões de pessoas</p>
            </div>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Quem Precisa Declarar em 2026?</h2>
          <ul className="space-y-2">
            <li> Rendimentos tributáveis acima de R$ 33.888,00/ano</li>
            <li> Rendimentos isentos/não tributáveis acima de R$ 200.000,00</li>
            <li> Bens ou direitos acima de R$ 800.000,00</li>
            <li> Operações em bolsa de valores</li>
            <li> Receita bruta rural acima de R$ 169.440,00</li>
          </ul>
        </section>
      </div>
    </ArticleLayout>
  );
}
