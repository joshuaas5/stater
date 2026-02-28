import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";

export default function CalculadoraIMC() {
  const [peso, setPeso] = useState<string>("");
  const [altura, setAltura] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const p = parseFloat(peso) || 0;
    const a = parseFloat(altura) || 0;

    if (!p || !a) return;

    const alturaM = a > 3 ? a / 100 : a; // Converte cm para m se necessário
    const imc = p / (alturaM * alturaM);

    let classificacao = "";
    let cor = "";
    let risco = "";
    let dicas: string[] = [];

    if (imc < 18.5) {
      classificacao = "Abaixo do peso";
      cor = "text-blue-600";
      risco = "Risco de desnutrição";
      dicas = ["Consulte um nutricionista", "Aumente a ingestão calórica de forma saudável", "Pratique musculação para ganhar massa"];
    } else if (imc < 25) {
      classificacao = "Peso normal";
      cor = "text-green-600";
      risco = "Baixo risco";
      dicas = ["Continue mantendo hábitos saudáveis", "Pratique exercícios regularmente", "Mantenha alimentação equilibrada"];
    } else if (imc < 30) {
      classificacao = "Sobrepeso";
      cor = "text-yellow-600";
      risco = "Risco moderado";
      dicas = ["Reduza consumo de açúcar é gorduras", "Aumente atividade física", "Consulte um profissional de saúde"];
    } else if (imc < 35) {
      classificacao = "Obesidade Grau I";
      cor = "text-orange-600";
      risco = "Risco aumentado";
      dicas = ["Procure acompanhamento médico", "Inicie programa de reeducação alimentar", "Exercícios moderados com orientação"];
    } else if (imc < 40) {
      classificacao = "Obesidade Grau II";
      cor = "text-red-600";
      risco = "Risco alto";
      dicas = ["Acompanhamento médico urgente", "Avaliação nutricional completa", "Tratamento multidisciplinar"];
    } else {
      classificacao = "Obesidade Grau III";
      cor = "text-red-800";
      risco = "Risco muito alto";
      dicas = ["Procure médico imediatamente", "Pode ser necessária cirurgia bariátrica", "Tratamento intensivo necessário"];
    }

    // Calcular peso ideal
    const pesoIdealMin = 18.5 * (alturaM * alturaM);
    const pesoIdealMax = 24.9 * (alturaM * alturaM);

    setResult({
      imc,
      classificacao,
      cor,
      risco,
      dicas,
      pesoIdealMin,
      pesoIdealMax,
      pesoAtual: p,
      diferenca: p < pesoIdealMin ? pesoIdealMin - p : (p > pesoIdealMax ? p - pesoIdealMax : 0)
    });
  };

  const tabelaIMC = [
    { faixa: "Abaixo de 18,5", classificacao: "Abaixo do peso", cor: "bg-blue-900/300/20" },
    { faixa: "18,5 - 24,9", classificacao: "Peso normal", cor: "bg-emerald-900/300/20" },
    { faixa: "25,0 - 29,9", classificacao: "Sobrepeso", cor: "bg-amber-900/300/20" },
    { faixa: "30,0 - 34,9", classificacao: "Obesidade Grau I", cor: "bg-orange-900/300/20" },
    { faixa: "35,0 - 39,9", classificacao: "Obesidade Grau II", cor: "bg-red-900/300/20" },
    { faixa: "40,0 ou mais", classificacao: "Obesidade Grau III", cor: "bg-red-200" }
  ];

  return (
    <ArticleLayout
      title="Calculadora de IMC: Descubra Seu Peso Ideal"
      description="Calcule seu Índice de Massa Corporal (IMC) é descubra se está no peso ideal. Tabela completa é dicas de saúde."
      keywords={["calculadora IMC", "índice de massa corporal", "peso ideal", "calcular IMC", "tabela IMC"]}
      publishedDate="2026-02-04"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Saúde"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">O Que é o IMC?</h2>
          <p className="text-lg mb-4">
            O <strong>Índice de Massa Corporal (IMC)</strong> é uma medida usada pela OMS para 
            avaliar se uma pessoa está no peso ideal para sua altura.
          </p>
          <div className="bg-blue-900/300/20 border-4 border-blue-500 p-4 text-center">
            <p className="font-bold text-lg mb-2">Fórmula do IMC:</p>
            <p className="text-2xl font-black">IMC = Peso (kg)  Altura² (m)</p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 border-4 border-slate-600 p-6 shadow-lg">
          <h2 className="text-2xl font-black mb-4"> Calculadora de IMC</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Seu Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ex: 70"
                className="w-full p-3 border-4 border-slate-600 text-xl"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Sua Altura (m ou cm)</label>
              <input
                type="number"
                step="0.01"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                placeholder="Ex: 1.75 ou 175"
                className="w-full p-3 border-4 border-slate-600 text-xl"
              />
            </div>
          </div>

          <button
            onClick={calcular}
            disabled={!peso || !altura}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            CALCULAR MEU IMC
          </button>

          {result && (
            <div className="mt-6 bg-slate-800 text-white border-4 border-slate-600 p-4">
              <div className="text-center mb-4">
                <p className="text-lg">Seu IMC é:</p>
                <p className={`text-5xl font-black ${result.cor}`}>{result.imc.toFixed(1)}</p>
                <p className={`text-2xl font-bold ${result.cor}`}>{result.classificacao}</p>
                <p className="text-white/70">{result.risco}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-800 border-2 border-slate-600 p-3">
                  <p className="font-bold">Peso ideal para sua altura:</p>
                  <p className="text-xl">{result.pesoIdealMin.toFixed(1)} - {result.pesoIdealMax.toFixed(1)} kg</p>
                  {result.diferenca > 0 && (
                    <p className="text-sm text-red-600">
                      {result.pesoAtual < result.pesoIdealMin 
                        ? `Você precisa ganhar ~${result.diferenca.toFixed(1)}kg`
                        : `Você precisa perder ~${result.diferenca.toFixed(1)}kg`
                      }
                    </p>
                  )}
                </div>
                <div className="bg-emerald-900/300/10 text-white border-2 border-green-500 p-3">
                  <p className="font-bold text-green-700"> Dicas para você:</p>
                  <ul className="text-sm space-y-1">
                    {result.dicas.map((d: string, i: number) => (
                      <li key={i}> {d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Tabela de IMC (OMS)</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-slate-600">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3">IMC</th>
                  <th className="p-3">Classificação</th>
                </tr>
              </thead>
              <tbody>
                {tabelaIMC.map((item, i) => (
                  <tr key={i} className={item.cor}>
                    <td className="p-3 font-bold text-center">{item.faixa}</td>
                    <td className="p-3 text-center">{item.classificacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-amber-900/300/10 text-white border-4 border-yellow-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Limitações do IMC</h2>
          <p className="mb-4">O IMC é uma medida <strong>simples é aproximada</strong>. Não considera:</p>
          <ul className="space-y-2">
            <li> <strong>Composição corporal</strong> - Atletas podem ter IMC alto por causa de músculos</li>
            <li> <strong>Distribuição de gordura</strong> - Gordura abdominal é mais perigosa</li>
            <li> <strong>Idade é sexo</strong> - Padrões variam entre grupos</li>
            <li> <strong>Saúde geral</strong> - Exames são mais precisos</li>
          </ul>
          <p className="mt-4 font-bold text-yellow-700">
            Para uma avaliação completa, consulte um médico ou nutricionista!
          </p>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Dicas para Manter o Peso Ideal</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-lg mb-2"> Alimentação</h3>
              <ul className="text-sm space-y-1">
                <li> Coma mais frutas é vegetais</li>
                <li> Reduza açúcar é ultraprocessados</li>
                <li> Beba pelo menos 2L de água/dia</li>
                <li> Evite pular refeições</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2"> Exercícios</h3>
              <ul className="text-sm space-y-1">
                <li> 150 minutos de atividade/semana</li>
                <li> Combine cardio é musculação</li>
                <li> Caminhe sempre que possível</li>
                <li> Durma bem (7-9 horas)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </ArticleLayout>
  );
}
