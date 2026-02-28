import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";

export default function CalculadoraAluguel() {
  const [valorImóvel, setValorImóvel] = useState<string>("");
  const [aluguel, setAluguel] = useState<string>("");
  const [condominio, setCondominio] = useState<string>("");
  const [iptu, setIptu] = useState<string>("");
  const [manutenção, setManutenção] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const imóvel = parseFloat(valorImóvel) || 0;
    const alg = parseFloat(aluguel) || 0;
    const cond = parseFloat(condominio) || 0;
    const iptuMensal = (parseFloat(iptu) || 0) / 12;
    const manut = parseFloat(manutenção) || 0;

    if (!imóvel || !alg) return;

    // Cálculos para proprietário
    const receitaBruta = alg * 12;
    const despesasAnuais = (cond + iptuMensal + manut) * 12;
    const vacância = receitaBruta * 0.083; // 1 mês de vacância
    const receitaLiquida = receitaBruta - despesasAnuais - vacância;
    const rentabilidadeBruta = (receitaBruta / imóvel) * 100;
    const rentabilidadeLiquida = (receitaLiquida / imóvel) * 100;

    // Comparação com outros investimentos
    const cdi = 0.12; // 12% a.a.
    const fii = 0.10; // 10% a.a.
    const rendaCDI = imóvel * cdi;
    const rendaFII = imóvel * fii;

    // Cálculo para inquilino - regra dos 30%
    const salárioIdeal = alg / 0.3;
    const custoTotalInquilino = alg + cond + iptuMensal;

    setResult({
      proprietário: {
        receitaBruta,
        despesasAnuais,
        vacância,
        receitaLiquida,
        rentabilidadeBruta,
        rentabilidadeLiquida,
        rendaCDI,
        rendaFII,
        valorImóvel: imóvel
      },
      inquilino: {
        aluguel: alg,
        custoTotal: custoTotalInquilino,
        salárioIdeal,
        percentualRenda30: alg,
        anual: custoTotalInquilino * 12
      }
    });
  };

  return (
    <ArticleLayout
      title="Calculadora de Aluguel: Rentabilidade é Custo Real"
      description="Calcule a rentabilidade real do seu imóvel alugado ou descubra quanto pode pagar de aluguel. Análise completa para proprietários é inquilinos."
      keywords={["calculadora aluguel", "rentabilidade aluguel", "quanto pagar aluguel", "investimento imóvel", "aluguel vs comprar"]}
      publishedDate="2026-01-19"
      modifiedDate="2026-01-20"
      author="Stater"
      category="Imóveis"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Para Que Serve Está Calculadora?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-blue-500 p-4 bg-blue-900/300/10 text-white">
              <h3 className="font-black text-lg">Para Proprietários</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Rentabilidade real do imóvel</li>
                <li>Comparação com outros investimentos</li>
                <li>Análise de custos ocultos</li>
              </ul>
            </div>
            <div className="border-4 border-green-500 p-4 bg-emerald-900/300/10 text-white">
              <h3 className="font-black text-lg">Para Inquilinos</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Custo total real do aluguel</li>
                <li>Salário ideal para o aluguel</li>
                <li>Planejamento financeiro</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-100 to-green-100 border-4 border-slate-600 p-6 shadow-lg">
          <h2 className="text-2xl font-black mb-4">Calculadora Completa de Aluguel</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Valor do Imóvel (R$)</label>
              <input
                type="number"
                value={valorImóvel}
                onChange={(e) => setValorImóvel(e.target.value)}
                placeholder="Ex: 500000"
                className="w-full p-3 border-4 border-slate-600"
              />
              <p className="text-xs text-white/70 mt-1">Valor de mercado atual</p>
            </div>
            <div>
              <label className="block font-bold mb-2">Aluguel Mensal (R$)</label>
              <input
                type="number"
                value={aluguel}
                onChange={(e) => setAluguel(e.target.value)}
                placeholder="Ex: 2500"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Condominio (R$)</label>
              <input
                type="number"
                value={condominio}
                onChange={(e) => setCondominio(e.target.value)}
                placeholder="Ex: 600"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">IPTU Anual (R$)</label>
              <input
                type="number"
                value={iptu}
                onChange={(e) => setIptu(e.target.value)}
                placeholder="Ex: 3600"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Manutenção Mensal (R$)</label>
              <input
                type="number"
                value={manutenção}
                onChange={(e) => setManutenção(e.target.value)}
                placeholder="Ex: 200"
                className="w-full p-3 border-4 border-slate-600"
              />
              <p className="text-xs text-white/70 mt-1">Média de reparos, pintura, etc</p>
            </div>
          </div>

          <button
            onClick={calcular}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 transition-colors"
          >
            CALCULAR ANALISE COMPLETA
          </button>

          {result && (
            <div className="mt-6 space-y-6">
              {/* Resultado Proprietário */}
              <div className="bg-slate-800 text-white border-4 border-blue-500 p-4">
                <h3 className="font-black text-xl mb-4 text-blue-800">Análise para Proprietário</h3>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-1">
                      <span>Receita Bruta Anual:</span>
                      <span className="font-bold">R$ {result.proprietário.receitaBruta.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1 text-red-600">
                      <span>(-) Despesas Anuais:</span>
                      <span className="font-bold">R$ {result.proprietário.despesasAnuais.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1 text-red-600">
                      <span>(-) Vacancia (1 mes):</span>
                      <span className="font-bold">R$ {result.proprietário.vacância.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-green-700 font-black text-lg">
                      <span>= Receita Liquida:</span>
                      <span>R$ {result.proprietário.receitaLiquida.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-amber-900/300/20 p-3 border-2 border-slate-600 text-center">
                      <p className="text-sm">Rentabilidade Bruta</p>
                      <p className="text-2xl font-black">{result.proprietário.rentabilidadeBruta.toFixed(2)}% a.a.</p>
                    </div>
                    <div className={`p-3 border-2 border-slate-600 text-center ${result.proprietário.rentabilidadeLiquida < 5 ? "bg-red-900/300/20" : "bg-emerald-900/300/20"}`}>
                      <p className="text-sm">Rentabilidade Liquida</p>
                      <p className="text-2xl font-black">{result.proprietário.rentabilidadeLiquida.toFixed(2)}% a.a.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 p-4 border-2 border-slate-600">
                  <h4 className="font-bold mb-2">Comparação com Outros Investimentos</h4>
                  <p className="text-sm mb-3">Se você vendesse o imóvel é investisse os R$ {result.proprietário.valorImóvel.toLocaleString("pt-BR")}:</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-800 text-white p-2 border border-slate-600">
                      <p className="text-xs">Imóvel</p>
                      <p className="font-black">R$ {result.proprietário.receitaLiquida.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/ano</p>
                    </div>
                    <div className="bg-slate-800 text-white p-2 border border-slate-600">
                      <p className="text-xs">CDI 12%</p>
                      <p className="font-black">R$ {result.proprietário.rendaCDI.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/ano</p>
                    </div>
                    <div className="bg-slate-800 text-white p-2 border border-slate-600">
                      <p className="text-xs">FIIs 10%</p>
                      <p className="font-black">R$ {result.proprietário.rendaFII.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/ano</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultado Inquilino */}
              <div className="bg-slate-800 text-white border-4 border-green-500 p-4">
                <h3 className="font-black text-xl mb-4 text-green-800">Análise para Inquilino</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between border-b pb-1">
                      <span>Aluguel:</span>
                      <span className="font-bold">R$ {result.inquilino.aluguel.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>+ Condominio + IPTU:</span>
                      <span className="font-bold">R$ {(result.inquilino.custoTotal - result.inquilino.aluguel).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-red-700 font-black text-lg">
                      <span>= Custo Total Mensal:</span>
                      <span>R$ {result.inquilino.custoTotal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custo Anual:</span>
                      <span className="font-bold">R$ {result.inquilino.anual.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-900/300/20 p-4 border-2 border-slate-600">
                    <h4 className="font-bold mb-2">Regra dos 30%</h4>
                    <p className="text-sm mb-2">Para este aluguel não comprometer suas financas:</p>
                    <p className="text-2xl font-black">Renda mínima: R$ {result.inquilino.salárioIdeal.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-white/70 mt-2">*Considerando apenas o aluguel, sem condominio</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Referencia de Rentabilidade</h2>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { faixa: "Abaixo de 0,3%", status: "PESSIMO", cor: "bg-red-400", desc: "Imóvel é prejuízo" },
              { faixa: "0,3% a 0,4%", status: "RUIM", cor: "bg-orange-400", desc: "Abaixo do mercado" },
              { faixa: "0,4% a 0,5%", status: "MEDIO", cor: "bg-yellow-400", desc: "Na média do mercado" },
              { faixa: "Acima de 0,5%", status: "BOM", cor: "bg-green-400", desc: "Bom investimento" }
            ].map((r, i) => (
              <div key={i} className={`${r.cor} border-4 border-slate-600 p-3 text-center`}>
                <p className="font-black text-lg">{r.status}</p>
                <p className="font-bold">{r.faixa} a.m.</p>
                <p className="text-xs">{r.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-white/70 mt-2">*Rentabilidade mensal = Aluguel / Valor do Imóvel</p>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Custos Ocultos do Aluguel</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-red-500 p-4 bg-red-900/300/10 text-white">
              <h3 className="font-black">Para o Proprietário</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Vacancia (imóvel vazio)</li>
                <li>Manutenção estrutural</li>
                <li>IPTU (se não repassar)</li>
                <li>Taxa administração imobiliária (8-10%)</li>
                <li>IR sobre aluguel (0-27,5%)</li>
                <li>Depreciação do imóvel</li>
                <li>Seguro incendio</li>
              </ul>
            </div>
            <div className="border-4 border-orange-500 p-4 bg-orange-900/300/10">
              <h3 className="font-black">Para o Inquilino</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>Condominio</li>
                <li>IPTU (geralmente repassado)</li>
                <li>Seguro fianca ou caucao</li>
                <li>Taxa de vistoria</li>
                <li>Pintura na saida</li>
                <li>Reajuste anual (IGP-M ou IPCA)</li>
                <li>Luz, agua, gas</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Aluguel vs Comprar</h2>
          <div className="bg-slate-800 border-4 border-slate-600 p-4">
            <p className="font-bold mb-3">Quando alugar faz mais sentido:</p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">+</span>
                <span>Mobilidade profissional (pode mudar de cidade)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">+</span>
                <span>Aluguel menor que 0,4% do valor do imóvel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">+</span>
                <span>Investir a diferença em ativos melhores</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">+</span>
                <span>Sem dinheiro para entrada (20%+)</span>
              </li>
            </ul>
            
            <p className="font-bold mb-3">Quando comprar faz mais sentido:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">+</span>
                <span>Estabilidade na cidade por 5+ anos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">+</span>
                <span>Parcela similar ou menor que aluguel+custos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">+</span>
                <span>Imóvel em regiao com valorização</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">+</span>
                <span>Disciplina para pagar financiamento</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Dicas Finais</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Para Proprietários</h3>
              <ul className="space-y-1 text-sm">
                <li>Compare rentabilidade com FIIs</li>
                <li>Considere vender imóveis ruins</li>
                <li>Mantenha reserva para manutenção</li>
                <li>Faça contrato detalhado</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">Para Inquilinos</h3>
              <ul className="space-y-1 text-sm">
                <li>Não gaste mais de 30% da renda</li>
                <li>Negocie reajustes abusivos</li>
                <li>Documente estado do imóvel</li>
                <li>Invista a diferença se não comprar</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </ArticleLayout>
  );
}
