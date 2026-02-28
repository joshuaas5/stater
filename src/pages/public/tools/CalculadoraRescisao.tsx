import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";

export default function CalculadoraRescisão() {
  const [tipoRescisão, setTipoRescisão] = useState<string>("");
  const [salário, setSalário] = useState<string>("");
  const [mesesTrabalhados, setMesesTrabalhados] = useState<string>("");
  const [diasFerias, setDiasFerias] = useState<string>("");
  const [fgts, setFgts] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const sal = parseFloat(salário) || 0;
    const meses = parseInt(mesesTrabalhados) || 0;
    const feriasPendentes = parseInt(diasFerias) || 0;
    const saldoFgts = parseFloat(fgts) || 0;

    if (!sal || !tipoRescisão) return;

    // Cálculos base
    const salárioDia = sal / 30;
    const feriasVencidas = (sal + sal / 3); // 1 mês + 1/3
    const feriasProporcionais = ((meses % 12) / 12) * sal + (((meses % 12) / 12) * sal / 3);
    const decimoTerceiroProporcional = (meses / 12) * sal;
    const avisoPrevio = sal + Math.floor(meses / 12) * 3 * salárioDia; // +3 dias por ano
    const multaFgts = saldoFgts * 0.4;

    let valores: any = {
      salário: sal,
      saldoSalário: (feriasPendentes > 0 ? feriasPendentes * salárioDia : sal),
      feriasVencidas: 0,
      feriasProporcionais: 0,
      decimoTerceiro: 0,
      avisoPrevio: 0,
      multaFgts: 0,
      saqueFgts: 0,
      total: 0
    };

    // Valores por tipo de rescisão
    switch (tipoRescisão) {
      case "demissão_sem_justa_causa":
        valores.feriasVencidas = feriasVencidas;
        valores.feriasProporcionais = feriasProporcionais;
        valores.decimoTerceiro = decimoTerceiroProporcional;
        valores.avisoPrevio = avisoPrevio;
        valores.multaFgts = multaFgts;
        valores.saqueFgts = saldoFgts + multaFgts;
        valores.seguroDesemprego = true;
        break;
      case "pedido_demissão":
        valores.feriasVencidas = feriasVencidas;
        valores.feriasProporcionais = feriasProporcionais;
        valores.decimoTerceiro = decimoTerceiroProporcional;
        valores.avisoPrevio = -avisoPrevio; // Pode ter que cumprir
        valores.saqueFgts = 0;
        valores.seguroDesemprego = false;
        break;
      case "acordo":
        valores.feriasVencidas = feriasVencidas;
        valores.feriasProporcionais = feriasProporcionais;
        valores.decimoTerceiro = decimoTerceiroProporcional;
        valores.avisoPrevio = avisoPrevio * 0.5;
        valores.multaFgts = multaFgts * 0.5;
        valores.saqueFgts = saldoFgts * 0.8;
        valores.seguroDesemprego = false;
        break;
      case "justa_causa":
        valores.saldoSalário = feriasPendentes * salárioDia;
        valores.feriasVencidas = feriasVencidas;
        valores.saqueFgts = 0;
        valores.seguroDesemprego = false;
        break;
    }

    valores.total = valores.saldoSalário + valores.feriasVencidas + valores.feriasProporcionais + 
                    valores.decimoTerceiro + Math.max(0, valores.avisoPrevio) + valores.saqueFgts;

    setResult(valores);
  };

  const tiposRescisão = [
    { id: "demissão_sem_justa_causa", nome: "Demissão sem Justa Causa", desc: "Empresa demite sem motivo" },
    { id: "pedido_demissão", nome: "Pedido de Demissão", desc: "Funcionário pede para sair" },
    { id: "acordo", nome: "Acordo (Art. 484-A)", desc: "Acordo entre as partes" },
    { id: "justa_causa", nome: "Demissão por Justa Causa", desc: "Demissão por falta grave" }
  ];

  return (
    <ArticleLayout
      title="Calculadora de Rescisão CLT: Calcule seus Direitos"
      description="Calcule o valor da sua rescisão trabalhista. Demissão sem justa causa, pedido de demissão, acordo ou justa causa. Valores exatos."
      keywords={["calculadora rescisão", "calcular acerto CLT", "rescisão trabalhista", "direitos demissão", "quanto vou receber"]}
      publishedDate="2026-01-21"
      modifiedDate="2026-01-21"
      author="Stater"
      category="Ferramentas"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Calcule sua Rescisão</h2>
          <p className="text-lg mb-4">
            Descubra quanto você tem direito a receber no seu acerto trabalhista, dependendo 
            do tipo de rescisão do contrato.
          </p>
        </section>

        <section className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-4 border-slate-600 p-6 shadow-lg">
          <h2 className="text-2xl font-black mb-4">Simulador de Rescisão</h2>
          
          <div className="mb-4">
            <label className="block font-bold mb-2">Tipo de Rescisão:</label>
            <div className="grid md:grid-cols-2 gap-3">
              {tiposRescisão.map(tipo => (
                <button
                  key={tipo.id}
                  onClick={() => setTipoRescisão(tipo.id)}
                  className={`p-3 border-4 border-slate-600 text-left transition-all ${
                    tipoRescisão === tipo.id 
                      ? "bg-black text-white" 
                      : "bg-slate-800 text-white hover:bg-slate-800"
                  }`}
                >
                  <span className="font-black block">{tipo.nome}</span>
                  <span className="text-sm">{tipo.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Salário Bruto (R$)</label>
              <input
                type="number"
                value={salário}
                onChange={(e) => setSalário(e.target.value)}
                placeholder="Ex: 3500"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Meses Trabalhados</label>
              <input
                type="number"
                value={mesesTrabalhados}
                onChange={(e) => setMesesTrabalhados(e.target.value)}
                placeholder="Ex: 24"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Dias Trabalhados no Mes</label>
              <input
                type="number"
                value={diasFerias}
                onChange={(e) => setDiasFerias(e.target.value)}
                placeholder="Ex: 15"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Saldo FGTS (R$)</label>
              <input
                type="number"
                value={fgts}
                onChange={(e) => setFgts(e.target.value)}
                placeholder="Ex: 8000"
                className="w-full p-3 border-4 border-slate-600"
              />
              <p className="text-xs text-white/70 mt-1">Consulte no app FGTS</p>
            </div>
          </div>

          <button
            onClick={calcular}
            disabled={!tipoRescisão || !salário}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            CALCULAR RESCISAO
          </button>

          {result && (
            <div className="bg-slate-800 text-white border-4 border-slate-600 p-4 mt-6">
              <h3 className="font-black text-xl mb-4">Detalhamento da Rescisão</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span>Saldo de Salário:</span>
                  <span className="font-bold text-green-600">R$ {result.saldoSalário.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span>
                </div>
                {result.feriasVencidas > 0 && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Ferias Vencidas + 1/3:</span>
                    <span className="font-bold text-green-600">R$ {result.feriasVencidas.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {result.feriasProporcionais > 0 && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Ferias Proporcionais + 1/3:</span>
                    <span className="font-bold text-green-600">R$ {result.feriasProporcionais.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {result.decimoTerceiro > 0 && (
                  <div className="flex justify-between border-b pb-1">
                    <span>13o Salário Proporcional:</span>
                    <span className="font-bold text-green-600">R$ {result.decimoTerceiro.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {result.avisoPrevio !== 0 && (
                  <div className="flex justify-between border-b pb-1">
                    <span>Aviso Previo {result.avisoPrevio < 0 ? "(a cumprir)" : "Indenizado"}:</span>
                    <span className={`font-bold ${result.avisoPrevio < 0 ? "text-red-600" : "text-green-600"}`}>
                      R$ {Math.abs(result.avisoPrevio).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {result.saqueFgts > 0 && (
                  <>
                    <div className="flex justify-between border-b pb-1">
                      <span>Saque FGTS:</span>
                      <span className="font-bold text-green-600">R$ {(result.saqueFgts - result.multaFgts).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span>
                    </div>
                    {result.multaFgts > 0 && (
                      <div className="flex justify-between border-b pb-1">
                        <span>Multa FGTS (40%):</span>
                        <span className="font-bold text-green-600">R$ {result.multaFgts.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="bg-yellow-200 p-4 border-2 border-slate-600 mt-4">
                <div className="flex justify-between">
                  <span className="font-black text-xl">TOTAL ESTIMADO:</span>
                  <span className="font-black text-2xl text-green-700">R$ {result.total.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-800 border-2 border-slate-600">
                <p className="font-bold">Seguro Desemprego: {result.seguroDesemprego ? "TEM DIREITO" : "NAO TEM DIREITO"}</p>
              </div>

              <p className="text-xs text-white/60 mt-2">*Valores estimados. Podem haver descontos de INSS, IR é adiantamentos. Consulte o RH para valores exatos.</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Direitos por Tipo de Rescisão</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-slate-600 text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Direito</th>
                  <th className="p-3 text-center">Sem Justa Causa</th>
                  <th className="p-3 text-center">Pedido Demissão</th>
                  <th className="p-3 text-center">Acordo</th>
                  <th className="p-3 text-center">Justa Causa</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { direito: "Saldo Salário", s: "SIM", p: "SIM", a: "SIM", j: "SIM" },
                  { direito: "Ferias + 1/3", s: "SIM", p: "SIM", a: "SIM", j: "So vencidas" },
                  { direito: "13o Proporcional", s: "SIM", p: "SIM", a: "SIM", j: "NAO" },
                  { direito: "Aviso Previo", s: "Indenizado", p: "Cumprir", a: "50%", j: "NAO" },
                  { direito: "Multa FGTS", s: "40%", p: "NAO", a: "20%", j: "NAO" },
                  { direito: "Saque FGTS", s: "100%", p: "NAO", a: "80%", j: "NAO" },
                  { direito: "Seguro Desemprego", s: "SIM", p: "NAO", a: "NAO", j: "NAO" }
                ].map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-slate-800" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold border-r-2 border-slate-600">{r.direito}</td>
                    <td className="p-3 text-center border-r-2 border-slate-600">{r.s}</td>
                    <td className="p-3 text-center border-r-2 border-slate-600">{r.p}</td>
                    <td className="p-3 text-center border-r-2 border-slate-600">{r.a}</td>
                    <td className="p-3 text-center">{r.j}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Dicas Importantes</h2>
          <ul className="space-y-2">
            <li>- Confira todos os valores no TRCT (Termo de Rescisão)</li>
            <li>- Empresa tem 10 dias para pagar após a demissão</li>
            <li>- Guarde holerites é contracheques</li>
            <li>- Em caso de duvidas, procure um advogado trabalhista</li>
            <li>- Não assine nada sem ler é entender</li>
          </ul>
        </section>
      </div>
    </ArticleLayout>
  );
}
