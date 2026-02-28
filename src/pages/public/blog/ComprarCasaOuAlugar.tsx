import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function ComprarCasaOuAlugar() {
  const [valorImóvel, setValorImóvel] = useState<string>("");
  const [aluguel, setAluguel] = useState<string>("");
  const [entrada, setEntrada] = useState<string>("");
  const [taxaJuros, setTaxaJuros] = useState<string>("9");
  const [prazo, setPrazo] = useState<string>("30");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const imóvel = parseFloat(valorImóvel) || 0;
    const alg = parseFloat(aluguel) || 0;
    const ent = parseFloat(entrada) || 0;
    const taxa = (parseFloat(taxaJuros) || 9) / 100 / 12;
    const meses = (parseInt(prazo) || 30) * 12;

    if (!imovel || !alg) return;

    const financiado = imóvel - ent;
    const parcela = financiado * (taxa * Math.pow(1 + taxa, meses)) / (Math.pow(1 + taxa, meses) - 1);
    const totalPago = parcela * meses + ent;
    const jurosTotal = totalPago - imóvel;

    const aluguelTotal = alg * meses;
    const aluguelCorrigido = alg * Math.pow(1.05, parseInt(prazo) || 30) * meses / 2;
    
    const investimentoEntrada = ent * Math.pow(1.12, parseInt(prazo) || 30);
    const diferencaMensal = parcela - alg;
    let investimentoDiferenca = 0;
    for (let i = 0; i < meses; i++) {
      investimentoDiferenca = (investimentoDiferenca + Math.max(0, diferencaMensal)) * (1 + 0.01);
    }

    setResult({
      financiamento: {
        parcela,
        totalPago,
        jurosTotal,
        entrada: ent,
        financiado,
        prazoAnos: parseInt(prazo) || 30
      },
      aluguel: {
        mensal: alg,
        totalSimples: aluguelTotal,
        totalCorrigido: aluguelCorrigido,
        investimentoEntrada,
        investimentoDiferenca,
        patrimonioFinal: investimentoEntrada + investimentoDiferenca
      },
      comparacao: {
        comprarMelhor: totalPago < (aluguelCorrigido + (investimentoEntrada + investimentoDiferenca - imóvel)),
        diferencaPatrimonio: imóvel - (investimentoEntrada + investimentoDiferenca)
      }
    });
  };

  const prosContras = {
    comprar: {
      pros: [
        "Patrimônio próprio que valoriza",
        "Estabilidade é segurança",
        "Liberdade para reformas",
        "Herança para filhos",
        "Fim das parcelas após quitação"
      ],
      contras: [
        "Entrada alta (20-30%)",
        "Juros elevados no Brasil",
        "Custos de manutenção",
        "Menos liquidez",
        "Compromisso de longo prazo"
      ]
    },
    alugar: {
      pros: [
        "Mobilidade é flexibilidade",
        "Menos compromisso inicial",
        "Manutenção é do proprietário",
        "Pode investir a diferença",
        "Mudar de bairro facilmente"
      ],
      contras: [
        "Dinheiro 'jogado fora'",
        "Reajustes anuais",
        "Instabilidade",
        "Restrições de uso",
        "Não constrói patrimônio imóvel"
      ]
    }
  };

  return (
    <ArticleLayout
      title="Comprar ou Alugar Imóvel: Simulador Completo 2026"
      description="Descubra se vale mais a pena comprar ou alugar um imóvel. Simulador financeiro completo, prós é contras, é análise de cenários."
      keywords={["comprar ou alugar", "financiamento imóvel", "vale a pena comprar casa", "alugar vs financiar", "simulador imóvel"]}
      publishedDate="2026-02-04"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Imóveis"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">A Grande Dúvida Financeira</h2>
          <p className="text-lg mb-4">
            Comprar ou alugar? Essa é uma das decisões financeiras mais importantes da vida.
            <strong> Não existe resposta única</strong> - depende da sua situação, objetivos é do mercado.
          </p>
      <QuickSummary 
        variant="purple"
        items={[
          { label: 'Comprar', value: 'Vale se for ficar 10+ anos no mesmo lugar', icon: 'target' },
          { label: 'Alugar', value: 'Mais flexível, sem IPTU/condomínio, sem manutenção', icon: 'check' },
          { label: 'Conta', value: 'Se aluguel < 0,5% do valor do imóvel, alugar é melhor', icon: 'money' },
          { label: 'Dica', value: 'Use nossa calculadora para sua situação específica', icon: 'lightbulb' },
        ]}
      />

          <div className="bg-yellow-500/20 border-4 border-yellow-500 p-4">
            <p className="font-bold">
              No Brasil, com juros altos (9-12% a.a.), alugar é investir a diferença 
              pode ser mais vantajoso do que comprar financiado em muitos casos.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-100 to-green-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4">Simulador: Comprar vs Alugar</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Valor do Imóvel (R$)</label>
              <input
                type="number"
                value={valorImóvel}
                onChange={(e) => setValorImóvel(e.target.value)}
                placeholder="Ex: 500000"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Aluguel Equivalente (R$)</label>
              <input
                type="number"
                value={aluguel}
                onChange={(e) => setAluguel(e.target.value)}
                placeholder="Ex: 2500"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Entrada Disponível (R$)</label>
              <input
                type="number"
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                placeholder="Ex: 100000"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Taxa de Juros (% a.a.)</label>
              <input
                type="number"
                value={taxaJuros}
                onChange={(e) => setTaxaJuros(e.target.value)}
                placeholder="Ex: 9"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Prazo (anos)</label>
              <select
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className="w-full p-3 border-4 border-black"
              >
                <option value="20">20 anos</option>
                <option value="25">25 anos</option>
                <option value="30">30 anos</option>
                <option value="35">35 anos</option>
              </select>
            </div>
          </div>

          <button
            onClick={calcular}
            disabled={!valorImóvel || !aluguel}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            COMPARAR CENÁRIOS
          </button>

          {result && (
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-500/20 border-4 border-blue-500 p-4">
                <h3 className="font-black text-xl mb-3"> COMPRAR</h3>
                <div className="space-y-2 text-sm">
                  <p>Entrada: <strong>R$ {result.financiamento.entrada.toLocaleString("pt-BR")}</strong></p>
                  <p>Financiado: <strong>R$ {result.financiamento.financiado.toLocaleString("pt-BR")}</strong></p>
                  <p>Parcela mensal: <strong>R$ {result.financiamento.parcela.toLocaleString("pt-BR", {maximumFractionDigits: 0})}</strong></p>
                  <p>Total pago em {result.financiamento.prazoAnos} anos: <strong className="text-red-600">R$ {result.financiamento.totalPago.toLocaleString("pt-BR", {maximumFractionDigits: 0})}</strong></p>
                  <p>Só em juros: <strong className="text-red-600">R$ {result.financiamento.jurosTotal.toLocaleString("pt-BR", {maximumFractionDigits: 0})}</strong></p>
                  <div className="bg-slate-800 text-white p-2 border-2 border-black mt-2">
                    <p className="font-black">Patrimônio final: imóvel de R$ {parseFloat(valorImóvel).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-emerald-500/20 border-4 border-green-500 p-4">
                <h3 className="font-black text-xl mb-3"> ALUGAR + INVESTIR</h3>
                <div className="space-y-2 text-sm">
                  <p>Aluguel mensal: <strong>R$ {result.aluguel.mensal.toLocaleString("pt-BR")}</strong></p>
                  <p>Total aluguel (corrigido 5%/ano): <strong>R$ {result.aluguel.totalCorrigido.toLocaleString("pt-BR", {maximumFractionDigits: 0})}</strong></p>
                  <p>Entrada investida (12% a.a.): <strong className="text-green-600">R$ {result.aluguel.investimentoEntrada.toLocaleString("pt-BR", {maximumFractionDigits: 0})}</strong></p>
                  <p>Diferença investida: <strong className="text-green-600">R$ {result.aluguel.investimentoDiferenca.toLocaleString("pt-BR", {maximumFractionDigits: 0})}</strong></p>
                  <div className="bg-slate-800 text-white p-2 border-2 border-black mt-2">
                    <p className="font-black">Patrimônio final: R$ {result.aluguel.patrimonioFinal.toLocaleString("pt-BR", {maximumFractionDigits: 0})}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Prós é Contras</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-black text-xl mb-3 text-blue-600">COMPRAR</h3>
              <div className="mb-3">
                <h4 className="font-bold text-green-600"> Vantagens:</h4>
                <ul className="text-sm space-y-1">
                  {prosContras.comprar.pros.map((p, i) => <li key={i}> {p}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-red-600"> Desvantagens:</h4>
                <ul className="text-sm space-y-1">
                  {prosContras.comprar.contras.map((c, i) => <li key={i}> {c}</li>)}
                </ul>
              </div>
            </div>
            
            <div>
              <h3 className="font-black text-xl mb-3 text-green-600">ALUGAR</h3>
              <div className="mb-3">
                <h4 className="font-bold text-green-600"> Vantagens:</h4>
                <ul className="text-sm space-y-1">
                  {prosContras.alugar.pros.map((p, i) => <li key={i}> {p}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-red-600"> Desvantagens:</h4>
                <ul className="text-sm space-y-1">
                  {prosContras.alugar.contras.map((c, i) => <li key={i}> {c}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-black p-6">
          <h2 className="text-2xl font-black mb-4">Quando Comprar Faz Sentido?</h2>
          <ul className="space-y-2">
            <li> Você tem pelo menos 20% de entrada</li>
            <li> A parcela não passa de 30% da sua renda</li>
            <li> Você pretende morar no imóvel por 7+ anos</li>
            <li> Tem estabilidade no emprego</li>
            <li> Já tem reserva de emergência</li>
            <li> A relação aluguel/valor do imóvel é maior que 0,5%</li>
          </ul>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Quando Alugar Faz Sentido?</h2>
          <ul className="space-y-2">
            <li> Você não tem entrada suficiente</li>
            <li> Pode mudar de cidade/emprego nos próximos anos</li>
            <li> A relação aluguel/valor é menor que 0,4%</li>
            <li> Juros estão muito altos (acima de 10% a.a.)</li>
            <li> Você consegue investir a diferença com disciplina</li>
            <li> Quer flexibilidade para mudar de bairro</li>
          </ul>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Comprar ou alugar: o que é melhor?",
                      "answer": "Depende. Regra do 0,4%: se o aluguel for menor que 0,4% do valor do imóvel, alugar compensa. Ex: imóvel de R$ 500.000, aluguel ideal até R$ 2.000."
              },
              {
                      "question": "Quando comprar casa vale a pena?",
                      "answer": "Se você pretende ficar 5+ anos no local, tem entrada (20-30%), consegue parcela menor que 30% da renda é quer estabilidade."
              },
              {
                      "question": "Quando alugar vale mais a pena?",
                      "answer": "Se precisa de mobilidade, o aluguel está barato comparado ao imóvel, ou você consegue investir a diferença com bom retorno."
              },
              {
                      "question": "O dinheiro do aluguel é jogado fora?",
                      "answer": "Não necessariamente. Se você investe a diferença entre aluguel é prestação, pode construir patrimônio equivalente ou maior."
              }
      ]} />
    </ArticleLayout>
  );
}