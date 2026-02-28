import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function DividendosAções() {
  const [investimento, setInvestimento] = useState<string>("");
  const [dyAnual, setDyAnual] = useState<string>("6");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const valor = parseFloat(investimento);
    const dy = parseFloat(dyAnual);
    if (!valor || !dy) return;

    const anual = valor * (dy / 100);
    const mensal = anual / 12;

    // Simulação crescimento 10 anos (reinvestindo dividendos + aporte)
    const anos = [1, 5, 10, 15, 20];
    const crescimentoDY = 0.05; // DY cresce 5% a.a.
    const projecoes = anos.map(ano => {
      let patrimônio = valor;
      let dyAtual = dy;
      for (let i = 0; i < ano; i++) {
        const dividendos = patrimônio * (dyAtual / 100);
        patrimônio += dividendos; // reinveste
        dyAtual *= (1 + crescimentoDY); // empresas aumentam dividendos
      }
      return {
        ano,
        patrimônio,
        dividendoAnual: patrimônio * (dyAtual / 100),
        dividendoMensal: (patrimônio * (dyAtual / 100)) / 12
      };
    });

    setResult({ valor, dy, anual, mensal, projecoes });
  };

  const topDividendos = [
    { ticker: "TAEE11", setor: "Energia", dy: "9,2%", histórico: "Consistente há 10+ anos" },
    { ticker: "BBAS3", setor: "Bancos", dy: "8,5%", histórico: "Banco do Brasil, estatal" },
    { ticker: "PETR4", setor: "Petroleo", dy: "14%", histórico: "Volatil, depende do petroleo" },
    { ticker: "VALE3", setor: "Mineracao", dy: "10%", histórico: "Ciclica, depende commodities" },
    { ticker: "BBSE3", setor: "Seguros", dy: "7%", histórico: "BB Seguridade, consistente" },
    { ticker: "ITSA4", setor: "Holdings", dy: "6%", histórico: "Holding da Itau, estavel" },
    { ticker: "CPLE6", setor: "Energia", dy: "8%", histórico: "Copel, boa pagadora" },
    { ticker: "EGIE3", setor: "Energia", dy: "5%", histórico: "Engie, crescimento + dividendos" }
  ];

  return (
    <ArticleLayout
      title="Dividendos de Ações: Guia Completo para Renda Passiva"
      description="Aprenda a investir em ações que pagam dividendos. Melhores pagadoras 2026, estratégias, calculadora de renda passiva é tributacao."
      keywords={["dividendos ações", "renda passiva ações", "melhores dividendos", "viver de dividendos", "ações pagadoras"]}
      publishedDate="2026-01-18"
      modifiedDate="2026-01-20"
      author="Stater"
      category="Investimentos"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">O Que Sao Dividendos?</h2>
          <p className="text-lg mb-4">
            Dividendos sao a parte do lucro que as empresas distribuem aos acionistas. Quando você 
            compra ações, você se torna socio da empresa é tem direito a receber parte dos lucros.
          </p>
      <QuickSummary 
        variant="green"
        items={[
          { label: 'O que', value: 'Parte do lucro da empresa pago aos acionistas', icon: 'money' },
          { label: 'Boas', value: 'TAEE11, BBAS3, ITSA4 - histórico de pagamentos', icon: 'star' },
          { label: 'Yield', value: 'Dividend Yield acima de 6% é considerado bom', icon: 'target' },
          { label: 'Dica', value: 'Reinvista os dividendos para crescimento exponencial', icon: 'lightbulb' },
        ]}
      />

          
          <div className="bg-emerald-500/20 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black mb-2">VANTAGEM TRIBUTARIA</h3>
            <p>Dividendos de ações brasileiras sao ISENTOS de Imposto de Renda para pessoa fisica. Você recebe o valor líquido na conta.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Indicadores Importantes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-black p-4 bg-slate-800 text-white">
              <h3 className="font-black text-lg">Dividend Yield (DY)</h3>
              <p className="text-sm mb-2">Dividendo anual dividido pelo preço da acao</p>
              <div className="bg-gray-100 p-2 font-mono text-center">
                DY = (Dividendos 12 meses / Preco) x 100
              </div>
              <p className="text-sm mt-2 text-gray-600">Ex: Ação a R$20 que paga R$1,40/ano = 7% DY</p>
            </div>
            <div className="border-4 border-black p-4 bg-slate-800 text-white">
              <h3 className="font-black text-lg">Payout</h3>
              <p className="text-sm mb-2">Percentual do lucro distribuido</p>
              <div className="bg-gray-100 p-2 font-mono text-center">
                Payout = (Dividendos / Lucro) x 100
              </div>
              <p className="text-sm mt-2 text-gray-600">Payout muito alto (acima de 90%) pode ser insustentavel</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-green-100 to-yellow-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4">Calculadora de Dividendos</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Valor Investido (R$)</label>
              <input
                type="number"
                value={investimento}
                onChange={(e) => setInvestimento(e.target.value)}
                placeholder="Ex: 100000"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Dividend Yield Medio (%)</label>
              <input
                type="number"
                value={dyAnual}
                onChange={(e) => setDyAnual(e.target.value)}
                placeholder="Ex: 6"
                className="w-full p-3 border-4 border-black"
              />
            </div>
          </div>

          <button
            onClick={calcular}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 transition-colors"
          >
            CALCULAR DIVIDENDOS
          </button>

          {result && (
            <div className="bg-slate-800 text-white border-4 border-black p-4 mt-4">
              <h3 className="font-black text-xl mb-4">Sua Renda de Dividendos</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-200 p-4 border-2 border-black text-center">
                  <p className="text-sm">Dividendos por Ano</p>
                  <p className="text-3xl font-black">R$ {result.anual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="bg-yellow-200 p-4 border-2 border-black text-center">
                  <p className="text-sm">Dividendos por Mes</p>
                  <p className="text-3xl font-black">R$ {result.mensal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              <h4 className="font-bold mb-2">Projeção com Reinvestimento de Dividendos:</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-2 border-black text-sm">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-2">Anos</th>
                      <th className="p-2">Patrimônio</th>
                      <th className="p-2">Dividendo/Ano</th>
                      <th className="p-2">Dividendo/Mes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.projecoes.map((p: any) => (
                      <tr key={p.ano} className="border-t-2 border-black">
                        <td className="p-2 font-bold text-center">{p.ano}</td>
                        <td className="p-2 text-center">R$ {p.patrimônio.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                        <td className="p-2 text-center text-green-700 font-bold">R$ {p.dividendoAnual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                        <td className="p-2 text-center text-green-700 font-bold">R$ {p.dividendoMensal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">*Simulação considera reinvestimento total + crescimento de 5% a.a. nos dividendos</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Top Pagadoras de Dividendos 2026</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {topDividendos.map((acao, i) => (
              <div key={i} className="border-4 border-black p-4 bg-slate-800 text-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-xl">{acao.ticker}</h3>
                    <p className="text-sm text-gray-600">{acao.setor}</p>
                  </div>
                  <span className="bg-green-400 px-3 py-1 font-black border-2 border-black">{acao.dy}</span>
                </div>
                <p className="text-sm mt-2">{acao.histórico}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">*DY baseado nos ultimos 12 meses. Rentabilidade passada não garante futura.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Estratégias de Dividendos</h2>
          
          <div className="space-y-4">
            <div className="border-4 border-blue-500 p-4 bg-blue-500/10 text-white">
              <h3 className="font-black text-lg">1. Buy and Hold (Comprar é Segurar)</h3>
              <p>Compre ações de boas empresas é segure por anos. Não venda nas quedas. Reinvista os dividendos.</p>
              <p className="text-sm text-gray-600 mt-2">Ideal para: Longo prazo, aposentadoria</p>
            </div>
            
            <div className="border-4 border-purple-500 p-4 bg-purple-500/10 text-white">
              <h3 className="font-black text-lg">2. Dividend Growth (Crescimento de Dividendos)</h3>
              <p>Foque em empresas que AUMENTAM dividendos todo ano, mesmo que o DY inicial seja menor.</p>
              <p className="text-sm text-gray-600 mt-2">Ideal para: Construcao de patrimônio, 10+ anos</p>
            </div>
            
            <div className="border-4 border-orange-500 p-4 bg-orange-500/10">
              <h3 className="font-black text-lg">3. High Yield (Alto Rendimento)</h3>
              <p>Priorize ações com maior DY atual. Mais risco pois DY alto pode indicar problemas.</p>
              <p className="text-sm text-gray-600 mt-2">Ideal para: Quem já precisa da renda, mais experientes</p>
            </div>
            
            <div className="border-4 border-green-500 p-4 bg-emerald-500/10 text-white">
              <h3 className="font-black text-lg">4. Carteira Balanceada</h3>
              <p>Mix de ações de dividendos + FIIs + renda fixa. Diversificacao é chave.</p>
              <p className="text-sm text-gray-600 mt-2">Ideal para: Maioria dos investidores</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Quanto Investir para Viver de Dividendos?</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3">Renda Desejada</th>
                  <th className="p-3">DY 5%</th>
                  <th className="p-3">DY 7%</th>
                  <th className="p-3">DY 10%</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { renda: "R$ 2.000/mes", dy5: "R$ 480.000", dy7: "R$ 343.000", dy10: "R$ 240.000" },
                  { renda: "R$ 5.000/mes", dy5: "R$ 1.200.000", dy7: "R$ 857.000", dy10: "R$ 600.000" },
                  { renda: "R$ 10.000/mes", dy5: "R$ 2.400.000", dy7: "R$ 1.714.000", dy10: "R$ 1.200.000" },
                  { renda: "R$ 20.000/mes", dy5: "R$ 4.800.000", dy7: "R$ 3.428.000", dy10: "R$ 2.400.000" }
                ].map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold border-r-2 border-black">{r.renda}</td>
                    <td className="p-3 text-center border-r-2 border-black">{r.dy5}</td>
                    <td className="p-3 text-center border-r-2 border-black">{r.dy7}</td>
                    <td className="p-3 text-center">{r.dy10}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Calendário de Dividendos</h2>
          <div className="border-4 border-black p-4 bg-yellow-500/10 text-white">
            <h3 className="font-bold mb-3">Datas Importantes:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Data COM</p>
                <p className="text-sm">Ultimo dia para comprar é ter direito ao dividendo</p>
              </div>
              <div>
                <p className="font-bold">Data EX</p>
                <p className="text-sm">Primeiro dia que a ação negocia SEM direito ao dividendo</p>
              </div>
              <div>
                <p className="font-bold">Data de Pagamento</p>
                <p className="text-sm">Dia que o dinheiro cai na conta da corretora</p>
              </div>
              <div>
                <p className="font-bold">Record Date</p>
                <p className="text-sm">Data em que a empresa verifica quem sao os acionistas</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Dividendos vs JCP</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-green-500 p-4 bg-emerald-500/10 text-white">
              <h3 className="font-black">Dividendos</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Isentos de IR para PF</li>
                <li>Pagos do lucro líquido</li>
                <li>Não dedutivel para empresa</li>
              </ul>
            </div>
            <div className="border-4 border-blue-500 p-4 bg-blue-500/10 text-white">
              <h3 className="font-black">JCP (Juros s/ Capital)</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>15% de IR retido na fonte</li>
                <li>Dedutivel para empresa</li>
                <li>Muitas empresas preferem JCP</li>
              </ul>
            </div>
          </div>
          <p className="text-sm mt-2 text-gray-600">Na prática: Mesmo com IR, JCP pode ser vantajoso pois a empresa paga mais.</p>
        </section>

        <section className="bg-red-500/10 text-white border-4 border-red-500 p-6">
          <h2 className="text-2xl font-black mb-4 text-red-800">Armadilhas de Dividendos</h2>
          <div className="space-y-3">
            {[
              { armadilha: "DY muito alto", explicacao: "Pode indicar queda de preço ou dividendo insustentavel" },
              { armadilha: "Empresa sem lucro pagando dividendos", explicacao: "Pode estar usando reservas - não é sustentavel" },
              { armadilha: "Comprar só pelo dividendo", explicacao: "Fundamentos ruins = queda de preço maior que dividendo" },
              { armadilha: "Não diversificar setores", explicacao: "Crise no setor afeta todas as empresas de uma vez" }
            ].map((item, i) => (
              <div key={i} className="bg-slate-800 text-white p-3 border-2 border-red-300">
                <p className="font-bold text-red-700">{item.armadilha}</p>
                <p className="text-sm">{item.explicacao}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Comece sua Carteira de Dividendos</h2>
          <ol className="space-y-2">
            <li>1. Defina quanto pode investir por mes</li>
            <li>2. Escolha 5-10 empresas de setores diferentes</li>
            <li>3. Priorize empresas com histórico de pagamentos</li>
            <li>4. Reinvista 100% dos dividendos no início</li>
            <li>5. Acompanhe os resultados trimestrais das empresas</li>
            <li>6. Tenha paciência - dividendos sao para longo prazo</li>
          </ol>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "O que são dividendos?",
                      "answer": "Dividendos são parte dos lucros que as empresas distribuem aos acionistas. No Brasil, são isentos de Imposto de Renda."
              },
              {
                      "question": "Quanto posso ganhar com dividendos?",
                      "answer": "Depende do investimento. Um bom dividend yield está entre 4-8% ao ano. Com R$ 100.000, você receberia R$ 4.000-8.000/ano."
              },
              {
                      "question": "Quais ações pagam mais dividendos?",
                      "answer": "Setores tradicionalmente bons pagadores: energia elétrica, bancos, seguradoras, telecomunicações é fundos imobiliários."
              },
              {
                      "question": "Quando recebo os dividendos?",
                      "answer": "As empresas anunciam a data ex (limite para ter direito) é a data de pagamento. Geralmente leva 15-30 dias após a data ex."
              }
      ]} />
    </ArticleLayout>
  );
}