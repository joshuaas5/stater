import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";

export default function CalculadoraDividendos() {
  const [patrimônioAtual, setPatrimônioAtual] = useState<string>("");
  const [aporteMensal, setAporteMensal] = useState<string>("");
  const [dyMedio, setDyMedio] = useState<string>("6");
  const [anos, setAnos] = useState<string>("10");
  const [reinvestir, setReinvestir] = useState<boolean>(true);
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const patrimônio = parseFloat(patrimônioAtual) || 0;
    const aporte = parseFloat(aporteMensal) || 0;
    const dy = parseFloat(dyMedio) / 100;
    const período = parseInt(anos) || 10;

    if (dy <= 0) return;

    const meses = período * 12;
    let patrimônioAcumulado = patrimônio;
    let totalAportes = patrimônio;
    let totalDividendos = 0;
    const evolucao: any[] = [];

    for (let mês = 1; mês <= meses; mes++) {
      // Aporte mensal
      patrimônioAcumulado += aporte;
      totalAportes += aporte;

      // Dividendo mensal (DY anual / 12)
      const dividendoMensal = patrimônioAcumulado * (dy / 12);
      totalDividendos += dividendoMensal;

      // Reinvestir dividendos?
      if (reinvestir) {
        patrimônioAcumulado += dividendoMensal;
      }

      // Registrar evolucao anual
      if (mes % 12 === 0) {
        const ano = mês / 12;
        const dividendoAnual = patrimônioAcumulado * dy;
        evolucao.push({
          ano,
          patrimônio: patrimônioAcumulado,
          dividendoMensal: dividendoAnual / 12,
          dividendoAnual,
          yieldOnCost: ((dividendoAnual / totalAportes) * 100).toFixed(2)
        });
      }
    }

    // Renda passiva final
    const dividendoFinalMensal = patrimônioAcumulado * (dy / 12);
    const dividendoFinalAnual = patrimônioAcumulado * dy;

    setResult({
      patrimônioFinal: patrimônioAcumulado,
      totalAportes,
      totalDividendos,
      ganhoComJuros: patrimônioAcumulado - totalAportes,
      dividendoMensal: dividendoFinalMensal,
      dividendoAnual: dividendoFinalAnual,
      evolucao
    });
  };

  return (
    <ArticleLayout
      title="Calculadora de Dividendos: Projete sua Renda Passiva"
      description="Simule quanto você vai receber de dividendos no futuro. Calcule patrimônio, reinvestimento é renda passiva mensal de ações é FIIs."
      keywords={["calculadora dividendos", "renda passiva ações", "simulador FIIs", "quanto preciso para viver de dividendos", "projecao dividendos"]}
      publishedDate="2026-01-20"
      modifiedDate="2026-01-20"
      author="Stater"
      category="Ferramentas"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Como Funciona</h2>
          <p className="text-lg mb-4">
            Está calculadora projeta seu patrimônio é renda passiva de dividendos ao longo do tempo, 
            considerando aportes mensais é reinvestimento automático.
          </p>
        </section>

        <section className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border-4 border-slate-600 p-6 shadow-lg">
          <h2 className="text-2xl font-black mb-4">Simulador de Dividendos</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Patrimônio Atual (R$)</label>
              <input
                type="number"
                value={patrimônioAtual}
                onChange={(e) => setPatrimônioAtual(e.target.value)}
                placeholder="Ex: 50000"
                className="w-full p-3 border-4 border-slate-600"
              />
              <p className="text-xs text-white/70 mt-1">Quanto já tem investido</p>
            </div>
            <div>
              <label className="block font-bold mb-2">Aporte Mensal (R$)</label>
              <input
                type="number"
                value={aporteMensal}
                onChange={(e) => setAporteMensal(e.target.value)}
                placeholder="Ex: 1000"
                className="w-full p-3 border-4 border-slate-600"
              />
              <p className="text-xs text-white/70 mt-1">Quanto vai investir por mes</p>
            </div>
            <div>
              <label className="block font-bold mb-2">Dividend Yield Medio (% a.a.)</label>
              <input
                type="number"
                value={dyMedio}
                onChange={(e) => setDyMedio(e.target.value)}
                placeholder="Ex: 6"
                className="w-full p-3 border-4 border-slate-600"
              />
              <p className="text-xs text-white/70 mt-1">Média: Ações 5-8%, FIIs 8-12%</p>
            </div>
            <div>
              <label className="block font-bold mb-2">Período (anos)</label>
              <input
                type="number"
                value={anos}
                onChange={(e) => setAnos(e.target.value)}
                placeholder="Ex: 10"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reinvestir}
                onChange={(e) => setReinvestir(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-bold">Reinvestir dividendos automáticamente</span>
            </label>
            <p className="text-xs text-white/70 mt-1">Reinvestir acelera muito o crescimento (juros compostos)</p>
          </div>

          <button
            onClick={calcular}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 transition-colors"
          >
            CALCULAR PROJEÇÃO
          </button>

          {result && (
            <div className="bg-slate-800 text-white border-4 border-slate-600 p-4 mt-6">
              <h3 className="font-black text-xl mb-4">Resultado da Simulação</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-200 p-4 border-2 border-slate-600 text-center">
                  <p className="text-sm">Patrimônio Final</p>
                  <p className="text-3xl font-black">R$ {result.patrimônioFinal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="bg-yellow-200 p-4 border-2 border-slate-600 text-center">
                  <p className="text-sm">Total Investido</p>
                  <p className="text-3xl font-black">R$ {result.totalAportes.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="bg-blue-200 p-4 border-2 border-slate-600 text-center">
                  <p className="text-sm">Renda Mensal Final</p>
                  <p className="text-3xl font-black">R$ {result.dividendoMensal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="bg-purple-200 p-4 border-2 border-slate-600 text-center">
                  <p className="text-sm">Renda Anual Final</p>
                  <p className="text-3xl font-black">R$ {result.dividendoAnual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              <div className="bg-slate-800 p-3 border-2 border-slate-600 mb-4">
                <p><strong>Ganho com dividendos reinvestidos:</strong> R$ {result.ganhoComJuros.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                <p><strong>Total de dividendos recebidos:</strong> R$ {result.totalDividendos.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
              </div>

              <h4 className="font-bold mb-2">Evolucao Ano a Ano:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-2 border-slate-600 text-sm">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-2">Ano</th>
                      <th className="p-2">Patrimônio</th>
                      <th className="p-2">Dividendo/Mes</th>
                      <th className="p-2">Dividendo/Ano</th>
                      <th className="p-2">Yield on Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.evolucao.map((e: any) => (
                      <tr key={e.ano} className={e.ano % 2 === 0 ? "bg-slate-800" : "bg-slate-800 text-white"}>
                        <td className="p-2 text-center font-bold">{e.ano}</td>
                        <td className="p-2 text-center">R$ {e.patrimônio.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                        <td className="p-2 text-center text-green-700">R$ {e.dividendoMensal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                        <td className="p-2 text-center text-green-700">R$ {e.dividendoAnual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                        <td className="p-2 text-center">{e.yieldOnCost}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Tabela de Referencia: Quanto Investir</h2>
          <p className="mb-4">Para atingir uma renda mensal de dividendos, considerando DY de 6% a.a.:</p>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-slate-600">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3">Renda Desejada</th>
                  <th className="p-3">Patrimônio Necessário</th>
                  <th className="p-3">Se investir R$1.000/mes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { renda: "R$ 1.000/mes", patrimônio: "R$ 200.000", tempo: "~12 anos" },
                  { renda: "R$ 2.000/mes", patrimônio: "R$ 400.000", tempo: "~18 anos" },
                  { renda: "R$ 3.000/mes", patrimônio: "R$ 600.000", tempo: "~22 anos" },
                  { renda: "R$ 5.000/mes", patrimônio: "R$ 1.000.000", tempo: "~28 anos" },
                  { renda: "R$ 10.000/mes", patrimônio: "R$ 2.000.000", tempo: "~38 anos" }
                ].map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-slate-800" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold border-r-2 border-slate-600">{r.renda}</td>
                    <td className="p-3 border-r-2 border-slate-600">{r.patrimônio}</td>
                    <td className="p-3">{r.tempo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-white/60 mt-2">*Tempo estimado com reinvestimento de dividendos é DY constante de 6%</p>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Dicas para Maximizar Dividendos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { dica: "Reinvista 100% no início", desc: "So pare de reinvestir quando atingir sua meta" },
              { dica: "Diversifique entre setores", desc: "Energia, bancos, seguros, FIIs, etc." },
              { dica: "Priorize consistencia", desc: "Empresas que pagam há 10+ anos sem cortes" },
              { dica: "Aumente aportes anualmente", desc: "Acompanhe seus aumentos salariais" },
              { dica: "Evite DY muito alto", desc: "Acima de 12% pode indicar problema" },
              { dica: "Paciencia é tempo", desc: "Bola de neve demora para crescer" }
            ].map((d, i) => (
              <div key={i} className="border-4 border-green-500 p-4 bg-emerald-900/300/10 text-white">
                <h4 className="font-black">{d.dica}</h4>
                <p className="text-sm text-white/80">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">O Poder do Tempo</h2>
          <p className="mb-4">
            Exemplo real: R$500/mes investidos em ações com DY de 6% por 30 anos, reinvestindo tudo:
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-800 text-white p-3 rounded">
              <p className="text-sm">Investido</p>
              <p className="text-2xl font-black">R$ 180.000</p>
            </div>
            <div className="bg-slate-800 text-white p-3 rounded">
              <p className="text-sm">Patrimônio</p>
              <p className="text-2xl font-black text-green-400">R$ 502.000</p>
            </div>
            <div className="bg-slate-800 text-white p-3 rounded">
              <p className="text-sm">Renda/mes</p>
              <p className="text-2xl font-black text-yellow-400">R$ 2.510</p>
            </div>
          </div>
        </section>
      </div>
    </ArticleLayout>
  );
}
