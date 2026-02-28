import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function MEIGuiaCompleto() {
  const [faturamentoMensal, setFaturamentoMensal] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("comercio");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const fat = parseFloat(faturamentoMensal) || 0;
    const fatAnual = fat * 12;

    const dasMEI: Record<string, number> = {
      comercio: 71.60,
      industria: 71.60,
      servicos: 75.60,
      comercio_servicos: 76.60
    };

    const das = dasMEI[categoria];
    const dasAnual = das * 12;
    const limiteMEI = 81000;
    const excedeu = fatAnual > limiteMEI;
    const percentualLimite = (fatAnual / limiteMEI) * 100;

    // Aposentadoria
    const contribuicaoINSS = das * 0.05 / 0.0555; // aproximação

    setResult({
      faturamentoMensal: fat,
      faturamentoAnual: fatAnual,
      das,
      dasAnual,
      excedeu,
      percentualLimite,
      folga: limiteMEI - fatAnual,
      limiteMEI
    });
  };

  const benefícios = [
    { nome: "Auxílio-doença", carencia: "12 contribuições", valor: "1 salário mínimo" },
    { nome: "Aposentadoria por idade", carencia: "180 contribuições (15 anos)", valor: "1 salário mínimo" },
    { nome: "Aposentadoria por invalidez", carencia: "12 contribuições", valor: "1 salário mínimo" },
    { nome: "Salário-maternidade", carencia: "10 contribuições", valor: "1 salário mínimo" },
    { nome: "Pensão por morte", carencia: "24 contribuições", valor: "Para dependentes" },
    { nome: "Auxílio-reclusão", carencia: "24 contribuições", valor: "Para dependentes" }
  ];

  const atividadesMEI = [
    "Cabeleireiro", "Manicure", "Eletricista", "Encanador", "Pintor",
    "Pedreiro", "Fotógrafo", "Editor de vídeo", "Programador", "Designer",
    "Vendedor ambulante", "Dono de food truck", "Cozinheiro", "Confeiteiro",
    "Costureiro", "Artesão", "Professor particular", "Personal trainer",
    "Motorista de app", "Entregador", "Jardineiro", "Faxineiro"
  ];

  return (
    <ArticleLayout
      title="MEI 2026: Guia Completo do Microempreendedor Individual"
      description="Tudo sobre MEI: como abrir, quanto custa, limite de faturamento, benefícios INSS é obrigações. Guia atualizado 2026."
      keywords={["MEI", "microempreendedor individual", "abrir MEI", "limite MEI 2026", "DAS MEI"]}
      publishedDate="2026-02-04"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Empreendedorismo"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">O Que é MEI?</h2>
          <p className="text-lg mb-4">
            O <strong>Microempreendedor Individual (MEI)</strong> é um tipo simplificado de empresa 
            para quem fatura até <strong>R$ 81.000/ano</strong> (R$ 6.750/mês em média).
          </p>
      <QuickSummary 
        variant="purple"
        items={[
          { label: 'Limite', value: 'Faturamento até R$81.000/ano (R$6.750/mês)', icon: 'money' },
          { label: 'Imposto', value: 'DAS fixo ~R$70/mês (INSS + ISS ou ICMS)', icon: 'check' },
          { label: 'Benefícios', value: 'CNPJ, nota fiscal, aposentadoria, auxílios', icon: 'star' },
          { label: 'Abrir', value: 'Portal do Empreendedor - grátis é em 5 minutos', icon: 'lightbulb' },
        ]}
      />

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-emerald-500/20 border-4 border-green-500 p-4 text-center">
              <span className="text-3xl"></span>
              <p className="font-bold mt-2">CNPJ próprio</p>
            </div>
            <div className="bg-blue-500/20 border-4 border-blue-500 p-4 text-center">
              <span className="text-3xl"></span>
              <p className="font-bold mt-2">Imposto fixo</p>
            </div>
            <div className="bg-yellow-500/20 border-4 border-yellow-500 p-4 text-center">
              <span className="text-3xl"></span>
              <p className="font-bold mt-2">Benefícios INSS</p>
            </div>
            <div className="bg-purple-500/20 border-4 border-purple-500 p-4 text-center">
              <span className="text-3xl"></span>
              <p className="font-bold mt-2">Emite NF</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-green-100 to-blue-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4"> Simulador MEI</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Faturamento Mensal Médio (R$)</label>
              <input
                type="number"
                value={faturamentoMensal}
                onChange={(e) => setFaturamentoMensal(e.target.value)}
                placeholder="Ex: 5000"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full p-3 border-4 border-black"
              >
                <option value="comercio">Comércio</option>
                <option value="industria">Indústria</option>
                <option value="servicos">Serviços</option>
                <option value="comercio_servicos">Comércio é Serviços</option>
              </select>
            </div>
          </div>

          <button
            onClick={calcular}
            disabled={!faturamentoMensal}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            SIMULAR
          </button>

          {result && (
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800 text-white border-4 border-blue-500 p-4">
                <h3 className="font-black text-xl mb-3"> Custos MEI</h3>
                <p>DAS mensal: <strong className="text-xl text-blue-600">R$ {result.das.toFixed(2)}</strong></p>
                <p>DAS anual: <strong>R$ {result.dasAnual.toFixed(2)}</strong></p>
                <p className="text-sm text-gray-600 mt-2">Inclui INSS + ISS/ICMS</p>
              </div>
              
              <div className={`bg-slate-800 text-white border-4 p-4 ${result.excedeu ? "border-red-500" : "border-green-500"}`}>
                <h3 className="font-black text-xl mb-3"> Limite de Faturamento</h3>
                <p>Faturamento anual: <strong>R$ {result.faturamentoAnual.toLocaleString("pt-BR")}</strong></p>
                <p>Limite MEI: <strong>R$ {result.limiteMEI.toLocaleString("pt-BR")}</strong></p>
                <p>Uso do limite: <strong className={result.excedeu ? "text-red-600" : "text-green-600"}>{result.percentualLimite.toFixed(1)}%</strong></p>
                {!result.excedeu && (
                  <p className="text-green-600">Folga: R$ {result.folga.toLocaleString("pt-BR")}</p>
                )}
                {result.excedeu && (
                  <p className="text-red-600 font-bold"> Excedeu o limite! Precisa virar ME</p>
                )}
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Valores DAS MEI 2026</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-500/20 border-4 border-blue-500 p-4 text-center">
              <h3 className="font-bold">Comércio/Indústria</h3>
              <p className="text-2xl font-black mt-2">R$ 71,60</p>
              <p className="text-sm">INSS + ICMS</p>
            </div>
            <div className="bg-emerald-500/20 border-4 border-green-500 p-4 text-center">
              <h3 className="font-bold">Serviços</h3>
              <p className="text-2xl font-black mt-2">R$ 75,60</p>
              <p className="text-sm">INSS + ISS</p>
            </div>
            <div className="bg-purple-500/20 border-4 border-purple-500 p-4 text-center">
              <h3 className="font-bold">Comércio + Serviços</h3>
              <p className="text-2xl font-black mt-2">R$ 76,60</p>
              <p className="text-sm">INSS + ICMS + ISS</p>
            </div>
            <div className="bg-yellow-500/20 border-4 border-yellow-500 p-4 text-center">
              <h3 className="font-bold">MEI Caminhoneiro</h3>
              <p className="text-2xl font-black mt-2">R$ 174,44</p>
              <p className="text-sm">Limite: R$ 251.600</p>
            </div>
          </div>
        </section>

        <section className="bg-blue-500/10 text-white border-4 border-blue-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Benefícios do INSS para MEI</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-black">
              <thead className="bg-blue-500/10 text-white">
                <tr>
                  <th className="p-2">Benefício</th>
                  <th className="p-2">Carência</th>
                  <th className="p-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {beneficios.map((b, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-slate-800 text-white" : "bg-blue-500/10 text-white"}>
                    <td className="p-2 font-medium">{b.nome}</td>
                    <td className="p-2">{b.carencia}</td>
                    <td className="p-2">{b.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Atividades Permitidas no MEI</h2>
          <div className="flex flex-wrap gap-2">
            {atividadesMEI.map((at, i) => (
              <span key={i} className="bg-gray-100 border-2 border-black px-3 py-1 text-sm">
                {at}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            São mais de 460 atividades permitidas. Consulte a lista completa no Portal do Empreendedor.
          </p>
        </section>

        <section className="bg-emerald-500/10 text-white border-4 border-green-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Como Abrir MEI (Passo a Passo)</h2>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="bg-emerald-500/10 text-white w-8 h-8 flex items-center justify-center font-black">1</span>
              <span>Acesse <strong>gov.br/mei</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="bg-emerald-500/10 text-white w-8 h-8 flex items-center justify-center font-black">2</span>
              <span>Faça login com conta <strong>gov.br</strong> (nível prata ou ouro)</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-emerald-500/10 text-white w-8 h-8 flex items-center justify-center font-black">3</span>
              <span>Preencha seus dados pessoais</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-emerald-500/10 text-white w-8 h-8 flex items-center justify-center font-black">4</span>
              <span>Escolha suas atividades (até 15 ocupações)</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-emerald-500/10 text-white w-8 h-8 flex items-center justify-center font-black">5</span>
              <span>Defina endereço comercial (pode ser sua casa)</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-emerald-500/10 text-white w-8 h-8 flex items-center justify-center font-black">6</span>
              <span>Pronto! CNPJ gerado na hora, <strong>sem custo</strong></span>
            </li>
          </ol>
        </section>

        <section className="bg-red-500/10 text-white border-4 border-red-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Obrigações do MEI</h2>
          <ul className="space-y-2">
            <li> <strong>DAS mensal</strong> - pagar até dia 20 de cada mês</li>
            <li> <strong>DASN-SIMEI</strong> - declaração anual até 31 de maio</li>
            <li> <strong>Controle de faturamento</strong> - guardar notas é recibos</li>
            <li> <strong>Emitir NF</strong> - obrigatório para vendas para empresas</li>
            <li> Pode ter <strong>no máximo 1 funcionário</strong></li>
          </ul>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Excedeu o Limite? E Agora?</h2>
          <div className="space-y-3">
            <p><strong>Até 20% acima (R$ 97.200):</strong> Paga diferença de imposto é vira ME no ano seguinte</p>
            <p><strong>Mais de 20% acima:</strong> Desenquadramento retroativo, paga como ME desde janeiro</p>
            <p className="text-yellow-400 font-bold mt-4">
               Dica: Acompanhe seu faturamento mensalmente para não ter surpresas!
            </p>
          </div>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Quanto custa abrir um MEI em 2024?",
                      "answer": "Abrir um MEI é totalmente gratuito. Você só paga a contribuição mensal (DAS) de R$ 71,60 (comércio/indústria), R$ 75,60 (serviços) ou R$ 76,60 (ambos)."
              },
              {
                      "question": "Qual o limite de faturamento do MEI?",
                      "answer": "O limite anual é de R$ 81.000,00 (ou R$ 6.750 por mês em média). Se ultrapassar, você precisa migrar para Microempresa (ME)."
              },
              {
                      "question": "MEI pode ter funcionário?",
                      "answer": "Sim, o MEI pode contratar 1 funcionário que receba até 1 salário mínimo ou o piso da categoria."
              },
              {
                      "question": "Quanto tempo leva para abrir um MEI?",
                      "answer": "O processo é online é leva cerca de 15 minutos pelo Portal do Empreendedor (gov.br/mei). O CNPJ é gerado na hora."
              }
      ]} />
    </ArticleLayout>
  );
}