import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from "@/components/FAQSchema";

export default function ImpostoRenda() {
  const [rendaTributavel, setRendaTributavel] = useState<string>("");
  const [deducoes, setDeducoes] = useState<string>("");
  const [irRetido, setIrRetido] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calcularIR = () => {
    const renda = parseFloat(rendaTributavel) || 0;
    const ded = parseFloat(deducoes) || 0;
    const retido = parseFloat(irRetido) || 0;

    if (!renda) return;

    const baseCalculo = Math.max(0, renda - ded);
    
    // Tabela IRPF 2026 - NOVA LEI: Isencao até R$ 5.000/mes (R$ 60.000/ano)
    let imposto = 0;

    if (baseCalculo <= 60000) {
      imposto = 0; // Isento
    } else if (baseCalculo <= 78000) {
      imposto = (baseCalculo - 60000) * 0.075;
    } else if (baseCalculo <= 102000) {
      imposto = 1350 + (baseCalculo - 78000) * 0.15;
    } else if (baseCalculo <= 126000) {
      imposto = 4950 + (baseCalculo - 102000) * 0.225;
    } else {
      imposto = 10350 + (baseCalculo - 126000) * 0.275;
    }

    const aliquotaEfetiva = renda > 0 ? (imposto / renda) * 100 : 0;
    const diferença = imposto - retido;

    setResult({
      rendaBruta: renda,
      deducoes: ded,
      baseCalculo,
      impostoDevido: Math.max(0, imposto),
      irRetido: retido,
      diferenca,
      restituir: diferença < 0,
      aliquotaEfetiva
    });
  };

  const tabelaIR = [
    { faixa: "Ate R$ 5.000,00/mes", aliquota: "ISENTO", deducao: "-" },
    { faixa: "R$ 5.000,01 a R$ 6.500,00", aliquota: "7,5%", deducao: "R$ 375,00" },
    { faixa: "R$ 6.500,01 a R$ 8.500,00", aliquota: "15%", deducao: "R$ 862,50" },
    { faixa: "R$ 8.500,01 a R$ 10.500,00", aliquota: "22,5%", deducao: "R$ 1.500,00" },
    { faixa: "Acima de R$ 10.500,00", aliquota: "27,5%", deducao: "R$ 2.025,00" }
  ];

  const deducoesPermitidas = [
    { item: "Dependente", valor: "R$ 189,59/mes cada (R$ 2.275,08/ano)" },
    { item: "Educacao", valor: "Ate R$ 3.561,50/ano por pessoa" },
    { item: "Saude", valor: "Sem limite (com comprovante)" },
    { item: "Previdencia Privada (PGBL)", valor: "Ate 12% da renda bruta" },
    { item: "Pensao Alimenticia", valor: "Valor total pago" },
    { item: "Livro-Caixa (autonomo)", valor: "Despesas necessarias" }
  ];

  const errosComuns = [
    { erro: "Esquecer rendimentos", desc: "Incluir todos: salario, aluguel, freelances, acoes" },
    { erro: "Nao declarar dependente corretamente", desc: "Verificar renda do dependente" },
    { erro: "Deduzir educação invalida", desc: "Cursos livres é idiomas NAO sao dedutiveis" },
    { erro: "Nao informar bens", desc: "Declarar imóveis, carros é investimentos" },
    { erro: "CPF errado", desc: "Conferir CPF de medicos, dentistas é escolas" },
    { erro: "Perder prazo", desc: "Multa minima de R$ 165,74 por atraso" }
  ];

  return (
    <ArticleLayout
      title="Imposto de Renda 2026: Guia Completo - Nova Isencao R$ 5.000"
      description="Tudo sobre IRPF 2026 com a NOVA ISENCAO de R$ 5.000: quem deve declarar, como calcular, deducoes permitidas. Lei atualizada!"
      keywords={["imposto de renda 2026", "IRPF", "nova isencao IR 5000", "declaracao imposto de renda", "como declarar IR"]}
      publishedDate="2026-01-21"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Impostos"
    >
      <div className="space-y-8">
        <section className="bg-emerald-500/20 border-4 border-green-500 p-6">
          <h2 className="text-2xl font-black mb-4 text-green-800">NOVIDADE 2026: Isencao Ampliada!</h2>
          <p className="text-lg">
            A partir de 2026, quem ganha até <strong className="text-green-700">R$ 5.000/mes</strong> está ISENTO de Imposto de Renda!
            Cerca de 16 milhoes de brasileiros serão beneficiados.
          </p>
      <QuickSummary 
        variant="yellow"
        items={[
          { label: 'Quem', value: 'Rendeu acima de ~R$30mil no ano ou tem bens > R$300mil', icon: 'target' },
          { label: 'Prazo', value: 'Março a maio - não deixe para última hora', icon: 'clock' },
          { label: 'Dedução', value: 'Saúde, educação, previdência, dependentes', icon: 'money' },
          { label: 'Dica', value: 'Use declaração pré-preenchida - muito mais fácil', icon: 'lightbulb' },
        ]}
      />

        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Quem Deve Declarar em 2026?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-500/20 border-4 border-red-500 p-4">
              <h3 className="font-black mb-2">Obrigado a Declarar</h3>
              <ul className="text-sm space-y-1">
                <li>Rendimentos tributaveis acima de R$ 33.888,00/ano</li>
                <li>Rendimentos isentos acima de R$ 200.000</li>
                <li>Ganho de capital na venda de bens</li>
                <li>Operacoes em bolsa de valores</li>
                <li>Bens acima de R$ 800.000</li>
                <li>Receita rural acima de R$ 169.440,00</li>
              </ul>
            </div>
            <div className="bg-emerald-500/20 border-4 border-green-500 p-4">
              <h3 className="font-black mb-2">Isento de Declarar</h3>
              <ul className="text-sm space-y-1">
                <li>Renda abaixo dos limites</li>
                <li>Dependente em outra declaracao</li>
                <li>Rendimentos exclusivamente isentos</li>
                <li>Aposentado por doença grave</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-green-100 to-blue-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4">Calculadora de IR 2026 (Nova Tabela)</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Renda Tributavel Anual (R$)</label>
              <input
                type="number"
                value={rendaTributavel}
                onChange={(e) => setRendaTributavel(e.target.value)}
                placeholder="Ex: 80000"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Total de Deducoes (R$)</label>
              <input
                type="number"
                value={deducoes}
                onChange={(e) => setDeducoes(e.target.value)}
                placeholder="Ex: 15000"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">IR Retido na Fonte (R$)</label>
              <input
                type="number"
                value={irRetido}
                onChange={(e) => setIrRetido(e.target.value)}
                placeholder="Ex: 5000"
                className="w-full p-3 border-4 border-black"
              />
            </div>
          </div>

          <button
            onClick={calcularIR}
            disabled={!rendaTributavel}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400"
          >
            CALCULAR IMPOSTO
          </button>

          {result && (
            <div className="bg-slate-800 text-white border-4 border-black p-4 mt-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <p>Renda Bruta: <strong>R$ {result.rendaBruta.toLocaleString("pt-BR")}</strong></p>
                  <p>Deducoes: <strong className="text-green-600">-R$ {result.deducoes.toLocaleString("pt-BR")}</strong></p>
                  <p>Base de Calculo: <strong>R$ {result.baseCalculo.toLocaleString("pt-BR")}</strong></p>
                </div>
                <div className="space-y-1">
                  <p>Imposto Devido: <strong>R$ {result.impostoDevido.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</strong></p>
                  <p>IR Retido: <strong>R$ {result.irRetido.toLocaleString("pt-BR")}</strong></p>
                  <p>Aliquota Efetiva: <strong>{result.aliquotaEfetiva.toFixed(1)}%</strong></p>
                </div>
              </div>

              <div className={`p-4 border-2 border-black ${result.restituir ? "bg-green-200" : result.diferenca > 0 ? "bg-red-200" : "bg-gray-200"}`}>
                <p className="font-black text-xl text-center">
                  {result.impostoDevido === 0 
                    ? "ISENTO DE IMPOSTO!"
                    : result.restituir 
                      ? `RESTITUICAO: R$ ${Math.abs(result.diferenca).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`
                      : result.diferenca > 0
                        ? `A PAGAR: R$ ${result.diferenca.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`
                        : "ZERADO"
                  }
                </p>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Nova Tabela IRPF 2026 (Mensal)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Faixa de Renda</th>
                  <th className="p-3 text-center">Aliquota</th>
                  <th className="p-3 text-center">Deducao</th>
                </tr>
              </thead>
              <tbody>
                {tabelaIR.map((faixa, i) => (
                  <tr key={i} className={i === 0 ? "bg-emerald-500/20" : i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3">{faixa.faixa}</td>
                    <td className={`p-3 text-center font-bold ${i === 0 ? "text-green-600" : ""}`}>{faixa.aliquota}</td>
                    <td className="p-3 text-center">{faixa.deducao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-yellow-500/20 border-4 border-yellow-500 p-6">
          <h2 className="text-2xl font-black mb-4">Comparativo: Antes x Depois</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800 text-white border-2 border-black p-4">
              <p className="font-bold text-red-600">ANTES (2024)</p>
              <p>Isencao até R$ 2.824,00/mes</p>
              <p className="text-sm text-gray-600">Cerca de 2 salários minimos</p>
            </div>
            <div className="bg-slate-800 text-white border-2 border-black p-4">
              <p className="font-bold text-green-600">AGORA (2026)</p>
              <p>Isencao até R$ 5.000,00/mes</p>
              <p className="text-sm text-gray-600">Beneficia ~16 milhoes de pessoas</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Deducoes Permitidas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {deducoesPermitidas.map((d, i) => (
              <div key={i} className="bg-emerald-500/10 text-white border-4 border-green-500 p-4">
                <h3 className="font-black">{d.item}</h3>
                <p className="text-sm">{d.valor}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-red-500/20 border-4 border-black p-6">
          <h2 className="text-2xl font-black mb-4">Erros Comuns (EVITE!)</h2>
          <div className="space-y-3">
            {errosComuns.map((e, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-red-600 text-xl">X</span>
                <div>
                  <p className="font-bold">{e.erro}</p>
                  <p className="text-sm text-gray-600">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Calendario IRPF 2026</h2>
          <ul className="space-y-2">
            <li><strong>15 de marco:</strong> Inicio das declaracoes</li>
            <li><strong>31 de maio:</strong> Fim do prazo (evite multa!)</li>
            <li><strong>Maio a setembro:</strong> Lotes de restituicao</li>
            <li><strong>Prioridade:</strong> Idosos, professores, declaração pre-preenchida</li>
          </ul>
        </section>

        <FAQSchema 
          faqs={[
            {
              question: "Quem está isento de IR em 2026?",
              answer: "Com a nova lei, quem ganha até R$ 5.000 por mês (R$ 60.000 por ano) está ISENTO de Imposto de Renda. Isso beneficia cerca de 16 milhoes de brasileiros."
            },
            {
              question: "Qual o prazo para declarar IR em 2026?",
              answer: "O prazo vai de 15 de marco até 31 de maio de 2026. Quem perder o prazo paga multa minima de R$ 165,74."
            },
            {
              question: "Como saber se preciso declarar IR?",
              answer: "Voce deve declarar se: teve rendimentos tributaveis acima de R$ 33.888/ano, rendimentos isentos acima de R$ 200.000, bens acima de R$ 800.000, ou operou em bolsa."
            },
            {
              question: "O que posso deduzir do IR?",
              answer: "Voce pode deduzir: gastos com saude (sem limite), educação (ate R$ 3.561,50/pessoa), dependentes (R$ 2.275,08/ano cada), PGBL (ate 12% da renda) é pensão alimenticia."
            },
            {
              question: "Como receber restituicao mais rapido?",
              answer: "Use a declaração pre-preenchida, informe chave Pix CPF para receber, entregue no início do prazo é não cometa erros que levem a malha fina."
            }
          ]}
        />

      </div>
    </ArticleLayout>
  );
}