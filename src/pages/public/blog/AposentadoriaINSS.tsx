import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function AposentadoriaINSS() {
  const [idade, setIdade] = useState<string>("");
  const [contribuicoes, setContribuicoes] = useState<string>("");
  const [sexo, setSexo] = useState<string>("masculino");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const idadeAtual = parseInt(idade);
    const tempoContrib = parseInt(contribuicoes);
    if (!idadeAtual || !tempoContrib) return;

    // Regras 2026 após Reforma da Previdência
    const idadeMinima = sexo === "masculino" ? 65 : 62;
    const contribuiçãoMinima = 15; // anos
    
    // Regra de transicao por pontos
    const pontosNecessários = sexo === "masculino" ? 101 : 91; // 2026
    const pontosAtuais = idadeAtual + tempoContrib;
    
    // Cálculo do benefício (média simplificada)
    // 60% + 2% por ano além de 20 (homem) ou 15 (mulher)
    const anosAlém = sexo === "masculino" ? Math.max(0, tempoContrib - 20) : Math.max(0, tempoContrib - 15);
    const percentualBenefício = Math.min(100, 60 + (anosAlém * 2));

    const anosParaIdade = Math.max(0, idadeMinima - idadeAtual);
    const anosParaContribuição = Math.max(0, contribuiçãoMinima - tempoContrib);
    const anosParaPontos = pontosAtuais >= pontosNecessários ? 0 : Math.ceil((pontosNecessários - pontosAtuais) / 2);

    const menorTempo = Math.max(anosParaIdade, anosParaContribuição, anosParaPontos);

    setResult({
      idadeAtual,
      tempoContrib,
      idadeMinima,
      contribuiçãoMinima,
      pontosNecessários,
      pontosAtuais,
      percentualBenefício,
      anosParaIdade,
      anosParaContribuição,
      anosParaPontos,
      menorTempo,
      idadeAposentadoria: idadeAtual + menorTempo,
      podeAposentar: anosParaIdade <= 0 && anosParaContribuição <= 0
    });
  };

  return (
    <ArticleLayout
      title="Aposentadoria pelo INSS 2026: Guia Completo + Calculadora"
      description="Entenda todas as regras de aposentadoria do INSS após a reforma. Calculadora de tempo, regras de transicao, como aumentar o benefício."
      keywords={["aposentadoria INSS", "reforma previdência", "tempo aposentadoria", "regras INSS 2026", "calculadora aposentadoria INSS"]}
      publishedDate="2026-01-17"
      modifiedDate="2026-01-20"
      author="Stater"
      category="Previdência"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Regras Atuais (2026)</h2>
          <p className="text-lg mb-4">
            Após a Reforma da Previdência de 2019, as regras mudaram significativamente. Entenda 
            cada modalidade é descubra qual se aplica ao seu caso.
          </p>
      <QuickSummary 
        variant="blue"
        items={[
          { label: 'Regras 2026', value: 'Idade mínima 65 (homem) é 62 (mulher) + tempo de contribuição', icon: 'target' },
          { label: 'Valor', value: 'Cálculo baseado na média de todos os salários desde 1994', icon: 'money' },
          { label: 'Documentos', value: 'CNIS, RG, CPF, comprovante de residência, carteira de trabalho', icon: 'check' },
          { label: 'Dica', value: 'Simule no Meu INSS antes de pedir - pode haver tempo faltando', icon: 'lightbulb' },
        ]}
      />

          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-blue-500 p-4 bg-blue-500/10 text-white">
              <h3 className="font-black text-lg text-blue-800">HOMENS</h3>
              <ul className="mt-2 space-y-1">
                <li>Idade mínima: 65 anos</li>
                <li>Contribuição mínima: 15 anos</li>
                <li>Pontos (2026): 101</li>
              </ul>
            </div>
            <div className="border-4 border-pink-500 p-4 bg-pink-500/10">
              <h3 className="font-black text-lg text-pink-800">MULHERES</h3>
              <ul className="mt-2 space-y-1">
                <li>Idade mínima: 62 anos</li>
                <li>Contribuição mínima: 15 anos</li>
                <li>Pontos (2026): 91</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-green-100 to-blue-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4">Calculadora de Aposentadoria INSS</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Sua Idade Atual</label>
              <input
                type="number"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="Ex: 45"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Anos de Contribuição</label>
              <input
                type="number"
                value={contribuicoes}
                onChange={(e) => setContribuicoes(e.target.value)}
                placeholder="Ex: 20"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Sexo</label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                className="w-full p-3 border-4 border-black"
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>
          </div>

          <button
            onClick={calcular}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 transition-colors"
          >
            CALCULAR APOSENTADORIA
          </button>

          {result && (
            <div className="bg-slate-800 text-white border-4 border-black p-4 mt-4">
              <h3 className="font-black text-xl mb-4">Resultado da Análise</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-100 p-3 border-2 border-black">
                  <p className="text-sm">Idade Atual</p>
                  <p className="text-2xl font-black">{result.idadeAtual} anos</p>
                </div>
                <div className="bg-gray-100 p-3 border-2 border-black">
                  <p className="text-sm">Tempo de Contribuição</p>
                  <p className="text-2xl font-black">{result.tempoContrib} anos</p>
                </div>
                <div className="bg-gray-100 p-3 border-2 border-black">
                  <p className="text-sm">Pontos Atuais</p>
                  <p className="text-2xl font-black">{result.pontosAtuais} pontos</p>
                </div>
                <div className="bg-gray-100 p-3 border-2 border-black">
                  <p className="text-sm">Pontos Necessários</p>
                  <p className="text-2xl font-black">{result.pontosNecessários} pontos</p>
                </div>
              </div>

              {result.podeAposentar ? (
                <div className="bg-green-200 p-4 border-2 border-green-600 mb-4">
                  <p className="font-black text-green-800 text-lg">VOCE JA PODE SE APOSENTAR!</p>
                  <p>Você cumpre os requisitos mínimos de idade é contribuição.</p>
                </div>
              ) : (
                <div className="bg-yellow-200 p-4 border-2 border-yellow-600 mb-4">
                  <p className="font-black text-yellow-800 text-lg">FALTAM APROXIMADAMENTE {result.menorTempo} ANOS</p>
                  <p>Você podera se aposentar com aproximadamente {result.idadeAposentadoria} anos de idade.</p>
                  <ul className="mt-2 text-sm">
                    {result.anosParaIdade > 0 && <li>Faltam {result.anosParaIdade} anos para idade mínima</li>}
                    {result.anosParaContribuição > 0 && <li>Faltam {result.anosParaContribuição} anos de contribuição</li>}
                    {result.anosParaPontos > 0 && <li>Faltam {result.anosParaPontos} anos pela regra de pontos</li>}
                  </ul>
                </div>
              )}

              <div className="bg-blue-500/20 p-4 border-2 border-blue-600">
                <p className="font-bold">Percentual Estimado do Benefício</p>
                <p className="text-3xl font-black text-blue-800">{result.percentualBenefício}%</p>
                <p className="text-sm text-gray-600">da média de todos os salários de contribuição</p>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Tipos de Aposentadoria</h2>
          
          <div className="space-y-4">
            <div className="border-4 border-black p-4 bg-slate-800 text-white">
              <h3 className="font-black text-lg bg-black text-white px-3 py-1 inline-block mb-2">Por Idade</h3>
              <p><strong>Requisitos:</strong> 65 anos (homem) ou 62 anos (mulher) + 15 anos de contribuição</p>
              <p><strong>Benefício:</strong> 60% + 2% por ano além de 20 (H) ou 15 (M) anos</p>
            </div>

            <div className="border-4 border-black p-4 bg-slate-800 text-white">
              <h3 className="font-black text-lg bg-black text-white px-3 py-1 inline-block mb-2">Por Tempo de Contribuição (Transicao)</h3>
              <p><strong>Pedido de Pontos 2026:</strong> 101 pontos (homem) ou 91 pontos (mulher)</p>
              <p><strong>Como calcular:</strong> Idade + Tempo de Contribuição = Pontos</p>
              <p><strong>Exemplo:</strong> 58 anos + 35 de contribuição = 93 pontos</p>
            </div>

            <div className="border-4 border-black p-4 bg-slate-800 text-white">
              <h3 className="font-black text-lg bg-black text-white px-3 py-1 inline-block mb-2">Por Invalidez</h3>
              <p><strong>Requisito:</strong> Incapacidade total é permanente comprovada por pericia</p>
              <p><strong>Benefício:</strong> 60% + 2% por ano de contribuição acima de 20 anos</p>
              <p><strong>Excecao:</strong> 100% se invalidez por acidente ou doença profissional</p>
            </div>

            <div className="border-4 border-black p-4 bg-slate-800 text-white">
              <h3 className="font-black text-lg bg-black text-white px-3 py-1 inline-block mb-2">Especial (Atividades Nocivas)</h3>
              <p><strong>Requisitos:</strong> 15, 20 ou 25 anos em atividade nociva + idade mínima</p>
              <p><strong>Atividades:</strong> Mineracao, exposicao a agentes quimicos, eletricidade alta tensao</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Como Aumentar seu Benefício</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { dica: "Contribua por mais tempo", detalhe: "Cada ano após 20 (H) ou 15 (M) = +2% no benefício" },
              { dica: "Contribua sobre o teto", detalhe: "Quanto maior a média, maior o benefício (limite: teto INSS)" },
              { dica: "Regularize contribuições antigas", detalhe: "Trabalhou sem carteira? Pode regularizar com provas" },
              { dica: "Inclua períodos especiais", detalhe: "Atividade insalubre pode ser convertida (1,4x para homem)" },
              { dica: "Planeje a data de pedido", detalhe: "Esperar mais meses pode aumentar a média" },
              { dica: "Considere previdência privada", detalhe: "PGBL/VGBL complementam o INSS" }
            ].map((item, i) => (
              <div key={i} className="border-4 border-green-500 p-4 bg-emerald-500/10 text-white">
                <h4 className="font-black">{item.dica}</h4>
                <p className="text-sm text-gray-700">{item.detalhe}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Tabela de Pontos por Ano</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-2">Ano</th>
                  <th className="p-2">Homens</th>
                  <th className="p-2">Mulheres</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ano: "2024", h: 99, m: 89 },
                  { ano: "2025", h: 100, m: 90 },
                  { ano: "2026", h: 101, m: 91 },
                  { ano: "2027", h: 102, m: 92 },
                  { ano: "2028", h: 103, m: 93 },
                  { ano: "2029", h: 104, m: 94 },
                  { ano: "2030", h: 105, m: 95 },
                  { ano: "2031+", h: 105, m: 100 }
                ].map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-2 font-bold border-r-2 border-black text-center">{r.ano}</td>
                    <td className="p-2 text-center border-r-2 border-black">{r.h} pontos</td>
                    <td className="p-2 text-center">{r.m} pontos</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Valores 2026</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-4 border-black p-4 bg-emerald-500/20 text-center">
              <p className="text-sm">Salário Mínimo</p>
              <p className="text-2xl font-black">R$ 1.518</p>
              <p className="text-xs">Piso dos benefícios</p>
            </div>
            <div className="border-4 border-black p-4 bg-blue-500/20 text-center">
              <p className="text-sm">Teto INSS</p>
              <p className="text-2xl font-black">R$ 8.157,41</p>
              <p className="text-xs">Máximo de benefício</p>
            </div>
            <div className="border-4 border-black p-4 bg-yellow-500/20 text-center">
              <p className="text-sm">Contribuição MEI</p>
              <p className="text-2xl font-black">R$ 75,90</p>
              <p className="text-xs">5% do salário mínimo</p>
            </div>
          </div>
        </section>

        <section className="bg-red-500/10 text-white border-4 border-red-500 p-6">
          <h2 className="text-2xl font-black mb-4 text-red-800">Cuidado com Erros Comuns</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-black">X</span>
              <span>Pedir aposentadoria sem analisar todas as regras de transicao</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-black">X</span>
              <span>Não incluir todos os vinculos é períodos (CNIS pode ter erros)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-black">X</span>
              <span>Deixar de regularizar períodos trabalhados informalmente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-black">X</span>
              <span>Não considerar conversao de tempo especial</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-black">X</span>
              <span>Pedir sem simulação no Meu INSS</span>
            </li>
          </ul>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Proximos Passos</h2>
          <ol className="space-y-2">
            <li>1. Acesse o Meu INSS é baixe seu CNIS (extrato de contribuicoes)</li>
            <li>2. Verifique se todos os vinculos estão corretos</li>
            <li>3. Simule sua aposentadoria no sistema oficial</li>
            <li>4. Se houver divergencias, procure um advogado previdênciario</li>
            <li>5. Planeje: as vezes esperar alguns meses aumenta muito o benefício</li>
          </ol>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Qual a idade mínima para aposentar pelo INSS?",
                      "answer": "Após a reforma: homens 65 anos é mulheres 62 anos, com tempo mínimo de contribuição de 15-20 anos."
              },
              {
                      "question": "Como calcular quanto vou receber?",
                      "answer": "O cálculo considera a média de todas as contribuições desde 1994. Você recebe 60% + 2% por ano que exceder 15/20 anos."
              },
              {
                      "question": "MEI tem direito a aposentadoria?",
                      "answer": "Sim, MEI contribui com 5% do salário mínimo é tem direito a aposentadoria por idade (1 salário mínimo)."
              },
              {
                      "question": "Vale a pena contribuir como autônomo?",
                      "answer": "Sim, garante aposentadoria, auxílio-doença é outros benefícios. Opções: 11% ou 20% sobre o valor de referência."
              }
      ]} />
    </ArticleLayout>
  );
}
