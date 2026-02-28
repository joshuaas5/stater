import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";

export default function CalculadoraFGTS() {
  const [salario, setSalario] = useState<string>("");
  const [mesesTrabalhados, setMesesTrabalhados] = useState<string>("12");
  const [saldoAtual, setSaldoAtual] = useState<string>("");
  const [tipoSaque, setTipoSaque] = useState<string>("demissao");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const sal = parseFloat(salario) || 0;
    const meses = parseInt(mesesTrabalhados) || 12;
    const saldoFGTS = parseFloat(saldoAtual) || (sal * 0.08 * meses);

    // Depósito mensal (8% do salário)
    const depositoMensal = sal * 0.08;
    const depositoAnual = depositoMensal * 12;

    // Multa 40% sobre FGTS
    const multa40 = saldoFGTS * 0.40;

    // Saque Aniversário (tabela regressiva)
    let aliquotaSaque = 0.50;
    let parcelaAdicional = 0;
    if (saldoFGTS <= 500) { aliquotaSaque = 0.50; parcelaAdicional = 0; }
    else if (saldoFGTS <= 1000) { aliquotaSaque = 0.40; parcelaAdicional = 50; }
    else if (saldoFGTS <= 5000) { aliquotaSaque = 0.30; parcelaAdicional = 150; }
    else if (saldoFGTS <= 10000) { aliquotaSaque = 0.20; parcelaAdicional = 650; }
    else if (saldoFGTS <= 15000) { aliquotaSaque = 0.15; parcelaAdicional = 1150; }
    else if (saldoFGTS <= 20000) { aliquotaSaque = 0.10; parcelaAdicional = 1900; }
    else { aliquotaSaque = 0.05; parcelaAdicional = 2900; }

    const saqueAniversario = (saldoFGTS * aliquotaSaque) + parcelaAdicional;

    setResult({
      salario: sal,
      meses,
      depositoMensal,
      depositoAnual,
      saldoFGTS,
      multa40,
      totalDemissao: saldoFGTS + multa40,
      saqueAniversario,
      aliquotaSaque: aliquotaSaque * 100,
      parcelaAdicional
    });
  };

  const modalidadesSaque = [
    { nome: "Demissão sem justa causa", valor: "100% do FGTS + 40% de multa" },
    { nome: "Pedido de demissão", valor: "Não pode sacar" },
    { nome: "Acordo trabalhista (Art. 484-A)", valor: "80% do FGTS + 20% de multa" },
    { nome: "Aposentadoria", valor: "100% do FGTS" },
    { nome: "Compra de imóvel", valor: "100% do FGTS (primeira casa)" },
    { nome: "Saque-aniversário", valor: "Parte do saldo anualmente" },
    { nome: "Doença grave", valor: "100% do FGTS" },
    { nome: "3 anos sem carteira assinada", valor: "100% do FGTS" },
    { nome: "Falecimento (herdeiros)", valor: "100% do FGTS" }
  ];

  return (
    <ArticleLayout
      title="Calculadora FGTS 2026: Saldo, Multa 40% é Saque-Aniversário"
      description="Calcule seu FGTS, multa rescisória de 40%, saque-aniversário é entenda todas as modalidades de saque. Simulador completo."
      keywords={["calculadora FGTS", "saldo FGTS", "multa 40%", "saque-aniversário", "como sacar FGTS"]}
      publishedDate="2026-02-04"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Direitos Trabalhistas"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">O Que é o FGTS?</h2>
          <p className="text-lg mb-4">
            O <strong>Fundo de Garantia do Tempo de Serviço (FGTS)</strong> é um direito do trabalhador 
            CLT. Todo mês, o empregador deposita <strong>8% do seu salário</strong> em uma conta na Caixa.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-900/300/20 border-4 border-blue-500 p-4 text-center">
              <span className="text-3xl"></span>
              <p className="font-bold mt-2">8% do salário</p>
              <p className="text-sm">Depositado todo mês</p>
            </div>
            <div className="bg-emerald-900/300/20 border-4 border-green-500 p-4 text-center">
              <span className="text-3xl"></span>
              <p className="font-bold mt-2">TR + 3% ao ano</p>
              <p className="text-sm">Rendimento atual</p>
            </div>
            <div className="bg-amber-900/300/20 border-4 border-yellow-500 p-4 text-center">
              <span className="text-3xl"></span>
              <p className="font-bold mt-2">Saque restrito</p>
              <p className="text-sm">Condições específicas</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-orange-100 to-yellow-100 border-4 border-slate-600 p-6 shadow-lg">
          <h2 className="text-2xl font-black mb-4"> Calculadora de FGTS</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Salário Bruto (R$)</label>
              <input
                type="number"
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
                placeholder="Ex: 3000"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Meses Trabalhados</label>
              <input
                type="number"
                value={mesesTrabalhados}
                onChange={(e) => setMesesTrabalhados(e.target.value)}
                placeholder="12"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Saldo Atual (opcional)</label>
              <input
                type="number"
                value={saldoAtual}
                onChange={(e) => setSaldoAtual(e.target.value)}
                placeholder="Se souber"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Tipo de Saque</label>
              <select
                value={tipoSaque}
                onChange={(e) => setTipoSaque(e.target.value)}
                className="w-full p-3 border-4 border-slate-600"
              >
                <option value="demissao">Demissão sem justa causa</option>
                <option value="acordo">Acordo trabalhista</option>
                <option value="aniversario">Saque-aniversário</option>
              </select>
            </div>
          </div>

          <button
            onClick={calcular}
            disabled={!salario}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            CALCULAR FGTS
          </button>

          {result && (
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800 text-white border-4 border-blue-500 p-4">
                <h3 className="font-black text-xl mb-3"> Seu FGTS</h3>
                <div className="space-y-2">
                  <p>Depósito mensal: <strong>R$ {result.depositoMensal.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</strong></p>
                  <p>Depósito anual: <strong>R$ {result.depositoAnual.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</strong></p>
                  <p>Saldo estimado ({result.meses} meses): <strong className="text-xl text-blue-600">R$ {result.saldoFGTS.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</strong></p>
                </div>
              </div>

              <div className="bg-slate-800 text-white border-4 border-green-500 p-4">
                <h3 className="font-black text-xl mb-3"> Na Demissão</h3>
                <div className="space-y-2">
                  <p>FGTS acumulado: R$ {result.saldoFGTS.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                  <p>Multa 40%: <strong className="text-green-600">R$ {result.multa40.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</strong></p>
                  <hr className="border-slate-600" />
                  <p className="font-black text-xl">Total a receber: <span className="text-green-600">R$ {result.totalDemissao.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</span></p>
                </div>
              </div>

              <div className="bg-slate-800 text-white border-4 border-purple-500 p-4 md:col-span-2">
                <h3 className="font-black text-xl mb-3"> Saque-Aniversário</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm">Alíquota aplicada:</p>
                    <p className="font-bold text-lg">{result.aliquotaSaque}%</p>
                  </div>
                  <div>
                    <p className="text-sm">Parcela adicional:</p>
                    <p className="font-bold text-lg">R$ {result.parcelaAdicional.toLocaleString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-sm">Valor do saque:</p>
                    <p className="font-black text-xl text-purple-600">R$ {result.saqueAniversario.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Quando Posso Sacar o FGTS?</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-slate-600">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Situação</th>
                  <th className="p-3 text-left">Quanto pode sacar</th>
                </tr>
              </thead>
              <tbody>
                {modalidadesSaque.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-slate-800" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-medium">{item.nome}</td>
                    <td className="p-3">{item.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-red-900/300/10 text-white border-4 border-red-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Saque-Aniversário: Cuidado!</h2>
          <p className="mb-4">Antes de aderir ao saque-aniversário, saiba:</p>
          <ul className="space-y-2">
            <li> <strong>Perde direito</strong> ao saque total em caso de demissão</li>
            <li> Só pode voltar ao saque-rescisão após <strong>2 anos</strong></li>
            <li> Multa 40% vai para a conta, mas <strong>não pode sacar</strong></li>
            <li> Bom para quem tem <strong>estabilidade</strong> no emprego</li>
            <li> Bom para <strong>quitar dívidas caras</strong> ou investir</li>
          </ul>
        </section>

        <section className="bg-purple-900/300/20 border-4 border-purple-500 p-6">
          <h2 className="text-2xl font-black mb-4">Tabela Saque-Aniversário 2026</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-slate-600 text-sm">
              <thead className="bg-purple-900/300/10 text-white">
                <tr>
                  <th className="p-2">Faixa de Saldo</th>
                  <th className="p-2">Alíquota</th>
                  <th className="p-2">Parcela Adicional</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-800 text-white"><td className="p-2">Até R$ 500</td><td className="p-2">50%</td><td className="p-2">R$ 0</td></tr>
                <tr className="bg-slate-800"><td className="p-2">R$ 500,01 a R$ 1.000</td><td className="p-2">40%</td><td className="p-2">R$ 50</td></tr>
                <tr className="bg-slate-800 text-white"><td className="p-2">R$ 1.000,01 a R$ 5.000</td><td className="p-2">30%</td><td className="p-2">R$ 150</td></tr>
                <tr className="bg-slate-800"><td className="p-2">R$ 5.000,01 a R$ 10.000</td><td className="p-2">20%</td><td className="p-2">R$ 650</td></tr>
                <tr className="bg-slate-800 text-white"><td className="p-2">R$ 10.000,01 a R$ 15.000</td><td className="p-2">15%</td><td className="p-2">R$ 1.150</td></tr>
                <tr className="bg-slate-800"><td className="p-2">R$ 15.000,01 a R$ 20.000</td><td className="p-2">10%</td><td className="p-2">R$ 1.900</td></tr>
                <tr className="bg-slate-800 text-white"><td className="p-2">Acima de R$ 20.000</td><td className="p-2">5%</td><td className="p-2">R$ 2.900</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Como Consultar Seu FGTS</h2>
          <ul className="space-y-2">
            <li> <strong>App FGTS</strong> (Caixa) - mais completo</li>
            <li> <strong>App Caixa Trabalhador</strong></li>
            <li> Site da Caixa: caixa.gov.br/fgts</li>
            <li> Ligue 0800 726 0207</li>
            <li> Nas agências da Caixa</li>
          </ul>
        </section>
      </div>
    </ArticleLayout>
  );
}
