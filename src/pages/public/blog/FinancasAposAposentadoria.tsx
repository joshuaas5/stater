import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function FinancasAposAposentadoria() {
  const [idade, setIdade] = useState<string>("");
  const [benefícioInss, setBenefícioInss] = useState<string>("");
  const [patrimônio, setPatrimônio] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const i = parseInt(idade) || 65;
    const inss = parseFloat(benefícioInss) || 0;
    const pat = parseFloat(patrimônio) || 0;

    const expectativaVida = 82; // Brasil
    const anosRestantes = Math.max(0, expectativaVida - i);
    
    // Renda de patrimônio (4% ao ano - regra dos 4%)
    const rendaPatrimônio = (pat * 0.04) / 12;
    const rendaTotal = inss + rendaPatrimônio;
    
    // Simulação de quanto dura o patrimônio
    const gastosMensaisEstimado = inss * 1.3; // 30% acima do INSS
    const deficitMensal = Math.max(0, gastosMensaisEstimado - inss);
    const mesesPatrimônioDura = deficitMensal > 0 ? pat / deficitMensal : Infinity;

    setResult({
      idade: i,
      anosRestantes,
      benefícioInss: inss,
      patrimônio: pat,
      rendaPatrimônio,
      rendaTotal,
      gastosSugeridos: rendaTotal * 0.9, // 90% da renda
      reservaEmergência: rendaTotal * 6,
      mesesPatrimônioDura: mesesPatrimônioDura === Infinity ? "Indefinido" : Math.floor(mesesPatrimônioDura)
    });
  };

  const gastosTipicos = [
    { item: "Saude (plano + remédios)", percent: "30-40%", valor: "R$ 800-2.000" },
    { item: "Alimentacao", percent: "20-25%", valor: "R$ 600-1.200" },
    { item: "Moradia (IPTU, condominio)", percent: "15-20%", valor: "R$ 400-1.000" },
    { item: "Transporte", percent: "5-10%", valor: "R$ 200-500" },
    { item: "Lazer é viagens", percent: "10-15%", valor: "R$ 300-700" },
    { item: "Reserva/Emergência", percent: "10%", valor: "Guardar sempre" }
  ];

  const dicas = [
    { título: "Saude é o maior gasto", texto: "Depois dos 60, gastos com saude triplicam. Mantenha um plano de saude ou reserve R$ 50-100 mil para emergências medicas.", icone: "" },
    { título: "Cuidado com emprestimos", texto: "Consignado come até 35% da aposentadoria. So use em EMERGENCIAS reais.", icone: "" },
    { título: "Investimentos conservadores", texto: "Na aposentadoria, priorize renda fixa: Tesouro Direto, CDB é Fundos DI.", icone: "" },
    { título: "Moradia própria = economia", texto: "Quem tem casa própria economiza R$ 1.500-3.000/mes em aluguel.", icone: "" },
    { título: "Revise seguros", texto: "Seguro de vida pode não fazer mais sentido. Seguro de assistencia funeral sim.", icone: "" },
    { título: "Aposentadoria não é o fim", texto: "Considere trabalhos part-time ou consultoria para complementar renda.", icone: "" }
  ];

  const golpesComuns = [
    "Ligações fingindo ser do INSS pedindo dados",
    "Emprestimo consignado não solicitado",
    "Golpe do falso advogado de revisão",
    "Vendas de planos de saude fraudulentos",
    "Parentes pedindo dinheiro emprestado",
    "Investimentos 'garantidos' com retorno alto"
  ];

  return (
    <ArticleLayout
      title="Financas Após a Aposentadoria: Como Viver Bem com INSS"
      description="Guia completo para aposentados: como administrar a aposentadoria, evitar golpes, controlar gastos é fazer o dinheiro durar. Simulador incluso."
      keywords={["financas aposentadoria", "aposentado INSS", "viver bem aposentado", "golpes aposentados", "como administrar aposentadoria"]}
      publishedDate="2026-01-21"
      modifiedDate="2026-01-21"
      author="Stater"
      category="Aposentadoria"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">O Desafio da Aposentadoria</h2>
          <p className="text-lg mb-4">
            A aposentadoria média do INSS é de <strong>R$ 1.800</strong>. Com gastos de saude 
            aumentando é inflação corroendo o poder de compra, planejar é essencial.
          </p>
      <QuickSummary 
        variant="blue"
        items={[
          { label: 'Renda', value: 'INSS + previdência privada + investimentos', icon: 'money' },
          { label: 'Gastos', value: 'Saúde aumenta, transporte é trabalho diminuem', icon: 'target' },
          { label: 'Golpes', value: 'Cuidado com empréstimo consignado é golpes por telefone', icon: 'alert' },
          { label: 'Dica', value: 'Mantenha reserva de 12 meses para emergências de saúde', icon: 'lightbulb' },
        ]}
      />

          <div className="bg-yellow-500/20 border-4 border-yellow-500 p-4">
            <p className="font-bold">
              70% dos aposentados brasileiros vivem exclusivamente do INSS. 
              Este guia é para ajuda-los a viver melhor com o que tem.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-green-100 to-blue-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4">Simulador de Renda na Aposentadoria</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Sua Idade</label>
              <input
                type="number"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="Ex: 65"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Benefício INSS (R$)</label>
              <input
                type="number"
                value={benefícioInss}
                onChange={(e) => setBenefícioInss(e.target.value)}
                placeholder="Ex: 2500"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Patrimônio Total (R$)</label>
              <input
                type="number"
                value={patrimônio}
                onChange={(e) => setPatrimônio(e.target.value)}
                placeholder="Ex: 200000"
                className="w-full p-3 border-4 border-black"
              />
              <p className="text-xs text-gray-500 mt-1">Investimentos + poupança</p>
            </div>
          </div>

          <button
            onClick={calcular}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 transition-colors"
          >
            SIMULAR RENDA
          </button>

          {result && (
            <div className="bg-slate-800 text-white border-4 border-black p-4 mt-6">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-500/20 p-4 border-2 border-black">
                  <p className="text-sm">Expectativa de Vida</p>
                  <p className="font-black text-2xl">{result.anosRestantes} anos</p>
                  <p className="text-xs">restantes (média brasileira)</p>
                </div>
                <div className="bg-emerald-500/20 p-4 border-2 border-black">
                  <p className="text-sm">Renda Total Mensal</p>
                  <p className="font-black text-2xl">R$ {result.rendaTotal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs">INSS + rendimentos</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span>Benefício INSS:</span>
                  <span className="font-bold">R$ {result.benefícioInss.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Renda do Patrimônio (4% a.a.):</span>
                  <span className="font-bold text-green-600">R$ {result.rendaPatrimônio.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Gastos Mensais Sugeridos:</span>
                  <span className="font-bold">R$ {result.gastosSugeridos.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reserva Emergência Ideal:</span>
                  <span className="font-bold">R$ {result.reservaEmergência.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Distribuicao Tipica de Gastos</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Categoria</th>
                  <th className="p-3 text-center">% do Orcamento</th>
                  <th className="p-3 text-center">Valor Medio</th>
                </tr>
              </thead>
              <tbody>
                {gastosTipicos.map((g, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold">{g.item}</td>
                    <td className="p-3 text-center">{g.percent}</td>
                    <td className="p-3 text-center">{g.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Dicas Essenciais</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {dicas.map((dica, i) => (
              <div key={i} className="bg-slate-800 text-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-3xl mb-2">{dica.icone}</div>
                <h3 className="font-black text-lg mb-2">{dica.título}</h3>
                <p className="text-sm">{dica.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-red-500/20 border-4 border-red-500 p-6">
          <h2 className="text-2xl font-black mb-4 text-red-700">CUIDADO: Golpes Contra Aposentados</h2>
          <ul className="space-y-2">
            {golpesComuns.map((golpe, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-600"></span>
                <span className="font-bold">{golpe}</span>
              </li>
            ))}
          </ul>
          <div className="bg-slate-800 text-white p-3 border-2 border-black mt-4">
            <p className="font-bold">REGRA DE OURO: INSS nunca liga pedindo dados. Bancos nunca pedem senha por telefone.</p>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Direitos do Aposentado</h2>
          <ul className="space-y-2">
            <li> 13o salário (pago em agosto é dezembro)</li>
            <li> Revisao de benefício a qualquer tempo</li>
            <li> Prioridade em filas é atendimentos</li>
            <li> Isencao de IPTU (em algumas cidades)</li>
            <li> Desconto de 50% em eventos culturais</li>
            <li> Passe livre ou meia em transporte público</li>
          </ul>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Quanto preciso para me aposentar?",
                      "answer": "Regra dos 4%: tenha 25x seus gastos anuais investidos. Se gasta R$ 5.000/mês, precisa de R$ 1,5 milhão para viver de renda."
              },
              {
                      "question": "Como proteger dinheiro na aposentadoria?",
                      "answer": "Diversifique entre renda fixa (Tesouro IPCA+), fundos imobiliários, ações de dividendos é reserva em liquidez para emergências."
              },
              {
                      "question": "Aposentado deve investir em renda variável?",
                      "answer": "Com moderação. Manter 20-40% em ativos de crescimento ajuda a vencer a inflação, mas priorize segurança é renda previsível."
              },
              {
                      "question": "Qual a ordem de saque na aposentadoria?",
                      "answer": "Primeiro: previdência privada (tabela regressiva favorece). Depois: investimentos tributados. Por último: reservas de emergência."
              }
      ]} />
    </ArticleLayout>
  );
}