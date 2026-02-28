import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";

export default function CalculadoraSalárioLíquido() {
  const [salárioBruto, setSalárioBruto] = useState<string>("");
  const [dependentes, setDependentes] = useState<string>("0");
  const [valeTransporte, setValeTransporte] = useState<boolean>(true);
  const [valeRefeicao, setValeRefeicao] = useState<string>("");
  const [planoSaude, setPlanoSaude] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const bruto = parseFloat(salárioBruto) || 0;
    const deps = parseInt(dependentes) || 0;
    const vr = parseFloat(valeRefeicao) || 0;
    const ps = parseFloat(planoSaude) || 0;

    if (!bruto) return;

    // INSS 2026
    let inss = 0;
    if (bruto <= 1412.00) {
      inss = bruto * 0.075;
    } else if (bruto <= 2666.68) {
      inss = 1412.00 * 0.075 + (bruto - 1412.00) * 0.09;
    } else if (bruto <= 4000.03) {
      inss = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (bruto - 2666.68) * 0.11;
    } else if (bruto <= 7786.02) {
      inss = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (4000.03 - 2666.68) * 0.11 + (bruto - 4000.03) * 0.14;
    } else {
      inss = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (4000.03 - 2666.68) * 0.11 + (7786.02 - 4000.03) * 0.14;
    }

    // Base IRRF
    const deduçãoDependente = deps * 189.59;
    const baseIRRF = bruto - inss - deduçãoDependente;

    // IRRF 2026
    let irrf = 0;
    if (baseIRRF <= 2259.20) {
      irrf = 0;
    } else if (baseIRRF <= 2826.65) {
      irrf = (baseIRRF * 0.075) - 169.44;
    } else if (baseIRRF <= 3751.05) {
      irrf = (baseIRRF * 0.15) - 381.44;
    } else if (baseIRRF <= 4664.68) {
      irrf = (baseIRRF * 0.225) - 662.77;
    } else {
      irrf = (baseIRRF * 0.275) - 896.00;
    }
    irrf = Math.max(0, irrf);

    // Vale Transporte (desconto max 6%)
    const descontoVT = valeTransporte ? Math.min(bruto * 0.06, 300) : 0;

    // Outros descontos
    const descontoVR = Math.min(vr * 0.2, vr); // Empresa pode descontar até 20%
    const descontoPS = ps;

    const totalDescontos = inss + irrf + descontoVT + descontoVR + descontoPS;
    const líquido = bruto - totalDescontos;

    // Benefícios recebidos
    const valorVT = valeTransporte ? 300 : 0; // Estimativa
    const valorVR = vr;

    setResult({
      bruto,
      inss,
      irrf,
      descontoVT,
      descontoVR,
      descontoPS,
      totalDescontos,
      líquido,
      valorVT,
      valorVR,
      totalBenefícios: valorVT + valorVR,
      rendaReal: líquido + valorVT + valorVR
    });
  };

  const tabelaINSS = [
    { faixa: "Até R$ 1.412,00", alíquota: "7,5%" },
    { faixa: "R$ 1.412,01 a R$ 2.666,68", alíquota: "9%" },
    { faixa: "R$ 2.666,69 a R$ 4.000,03", alíquota: "11%" },
    { faixa: "R$ 4.000,04 a R$ 7.786,02", alíquota: "14%" },
    { faixa: "Acima de R$ 7.786,02", alíquota: "Teto" }
  ];

  return (
    <ArticleLayout
      title="Calculadora de Salário Líquido CLT 2026"
      description="Calcule seu salário líquido exato. Desconto de INSS, IRRF, Vale Transporte, Vale Refeicao é Plano de Saude. Tabelas atualizadas 2026."
      keywords={["calculadora salário líquido", "calcular salário CLT", "desconto INSS", "desconto IRRF", "salário bruto líquido"]}
      publishedDate="2026-01-21"
      modifiedDate="2026-01-21"
      author="Stater"
      category="Ferramentas"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Calcule seu Salário Real</h2>
          <p className="text-lg mb-4">
            Descubra quanto você realmente recebe após todos os descontos obrigatórios 
            é opcionais do seu contracheque.
          </p>
        </section>

        <section className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border-4 border-slate-600 p-6 shadow-lg">
          <h2 className="text-2xl font-black mb-4">Calculadora Completa</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Salário Bruto (R$)</label>
              <input
                type="number"
                value={salárioBruto}
                onChange={(e) => setSalárioBruto(e.target.value)}
                placeholder="Ex: 5000"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Número de Dependentes</label>
              <select
                value={dependentes}
                onChange={(e) => setDependentes(e.target.value)}
                className="w-full p-3 border-4 border-slate-600"
              >
                {[0,1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? "dependente" : "dependentes"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold mb-2">Vale Refeicao/Alimentacao (R$)</label>
              <input
                type="number"
                value={valeRefeicao}
                onChange={(e) => setValeRefeicao(e.target.value)}
                placeholder="Ex: 600"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Plano de Saude (desconto)</label>
              <input
                type="number"
                value={planoSaude}
                onChange={(e) => setPlanoSaude(e.target.value)}
                placeholder="Ex: 200"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={valeTransporte}
              onChange={(e) => setValeTransporte(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="font-bold">Recebo Vale Transporte</span>
          </label>

          <button
            onClick={calcular}
            disabled={!salárioBruto}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            CALCULAR SALARIO LIQUIDO
          </button>

          {result && (
            <div className="bg-slate-800 text-white border-4 border-slate-600 p-4 mt-6">
              <h3 className="font-black text-lg mb-4">Detalhamento do Contracheque</h3>
              
              <div className="mb-4">
                <h4 className="font-bold text-green-700 mb-2">PROVENTOS</h4>
                <div className="flex justify-between border-b pb-1">
                  <span>Salário Bruto:</span>
                  <span className="font-bold">R$ {result.bruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-bold text-red-700 mb-2">DESCONTOS</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>INSS:</span>
                    <span className="text-red-600">-R$ {result.inss.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IRRF:</span>
                    <span className="text-red-600">-R$ {result.irrf.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {result.descontoVT > 0 && (
                    <div className="flex justify-between">
                      <span>Vale Transporte (6%):</span>
                      <span className="text-red-600">-R$ {result.descontoVT.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {result.descontoPS > 0 && (
                    <div className="flex justify-between">
                      <span>Plano de Saude:</span>
                      <span className="text-red-600">-R$ {result.descontoPS.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1 font-bold">
                    <span>Total Descontos:</span>
                    <span className="text-red-600">-R$ {result.totalDescontos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-200 p-4 border-2 border-slate-600 mb-4">
                <div className="flex justify-between">
                  <span className="font-black text-xl">SALARIO LIQUIDO:</span>
                  <span className="font-black text-2xl text-green-700">R$ {result.líquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {result.totalBenefícios > 0 && (
                <div className="bg-blue-900/300/20 p-3 border-2 border-slate-600">
                  <h4 className="font-bold mb-2">Benefícios Recebidos (nao cai na conta)</h4>
                  <div className="text-sm space-y-1">
                    {result.valorVT > 0 && <p>Vale Transporte: ~R$ {result.valorVT}</p>}
                    {result.valorVR > 0 && <p>Vale Refeicao: R$ {result.valorVR}</p>}
                  </div>
                  <p className="font-bold mt-2">Renda Real: R$ {result.rendaReal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Tabela INSS 2026</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-slate-600">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Faixa Salarial</th>
                  <th className="p-3 text-center">Alíquota</th>
                </tr>
              </thead>
              <tbody>
                {tabelaINSS.map((f, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-slate-800" : "bg-slate-800 text-white"}>
                    <td className="p-3">{f.faixa}</td>
                    <td className="p-3 text-center font-bold">{f.alíquota}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-white/60 mt-2">*INSS usa cálculo progressivo (nao é alíquota única)</p>
        </section>

        <section className="bg-amber-900/300/20 border-4 border-slate-600 p-6">
          <h2 className="text-2xl font-black mb-4">Dicas para Aumentar o Líquido</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-black">1.</span>
              <span>Declare dependentes corretamente (cada um reduz R$ 189,59 da base do IR)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-black">2.</span>
              <span>Contribua para PGBL (ate 12% do bruto é dedutivel no IR)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-black">3.</span>
              <span>Se não usa VT, não aceite - evita desconto de 6%</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-black">4.</span>
              <span>Negocie benefícios em vez de aumento (VR não tem desconto)</span>
            </li>
          </ul>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Entenda seu Contracheque</h2>
          <ul className="space-y-2">
            <li><strong>INSS:</strong> Contribuição obrigatória para aposentadoria</li>
            <li><strong>IRRF:</strong> Imposto de Renda Retido na Fonte</li>
            <li><strong>FGTS:</strong> 8% pago PELA empresa (nao desconta de voce)</li>
            <li><strong>VT:</strong> Desconto max de 6% do salário base</li>
            <li><strong>VR/VA:</strong> Empresa pode descontar até 20%</li>
          </ul>
        </section>
      </div>
    </ArticleLayout>
  );
}
