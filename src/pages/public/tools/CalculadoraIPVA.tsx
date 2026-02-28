import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";

export default function CalculadoraIPVA() {
  const [valorVeiculo, setValorVeiculo] = useState<string>("");
  const [estado, setEstado] = useState<string>("SP");
  const [tipoVeiculo, setTipoVeiculo] = useState<string>("carro");
  const [result, setResult] = useState<any>(null);

  const aliquotas: Record<string, Record<string, number>> = {
    "AC": { carro: 2.0, moto: 1.0 },
    "AL": { carro: 3.0, moto: 2.75 },
    "AP": { carro: 3.0, moto: 1.5 },
    "AM": { carro: 3.0, moto: 2.0 },
    "BA": { carro: 2.5, moto: 2.5 },
    "CE": { carro: 3.0, moto: 2.0 },
    "DF": { carro: 3.5, moto: 2.0 },
    "ES": { carro: 2.0, moto: 1.0 },
    "GO": { carro: 3.75, moto: 3.0 },
    "MA": { carro: 2.5, moto: 1.0 },
    "MT": { carro: 3.0, moto: 1.0 },
    "MS": { carro: 3.5, moto: 2.0 },
    "MG": { carro: 4.0, moto: 2.0 },
    "PA": { carro: 2.5, moto: 1.0 },
    "PB": { carro: 2.5, moto: 2.5 },
    "PR": { carro: 3.5, moto: 3.5 },
    "PE": { carro: 3.0, moto: 2.5 },
    "PI": { carro: 2.5, moto: 2.0 },
    "RJ": { carro: 4.0, moto: 2.0 },
    "RN": { carro: 3.0, moto: 2.0 },
    "RS": { carro: 3.0, moto: 2.0 },
    "RO": { carro: 3.0, moto: 2.0 },
    "RR": { carro: 3.0, moto: 2.0 },
    "SC": { carro: 2.0, moto: 1.0 },
    "SP": { carro: 4.0, moto: 2.0 },
    "SE": { carro: 2.5, moto: 2.0 },
    "TO": { carro: 2.0, moto: 2.0 }
  };

  const calcular = () => {
    const valor = parseFloat(valorVeiculo) || 0;
    if (!valor) return;

    const aliquota = aliquotas[estado][tipoVeiculo];
    const ipva = valor * (aliquota / 100);
    
    const desconto3 = ipva * 0.03;
    const parcela3 = ipva / 3;

    setResult({
      valorVeiculo: valor,
      estado,
      aliquota,
      ipvaTotal: ipva,
      comDesconto: ipva - desconto3,
      desconto: desconto3,
      parcela3,
      tipoVeiculo
    });
  };

  const estadosNomes: Record<string, string> = {
    "AC": "Acre", "AL": "Alagoas", "AP": "Amapá", "AM": "Amazonas",
    "BA": "Bahia", "CE": "Ceará", "DF": "Distrito Federal", "ES": "Espírito Santo",
    "GO": "Goiás", "MA": "Maranhão", "MT": "Mato Grosso", "MS": "Mato Grosso do Sul",
    "MG": "Minas Gerais", "PA": "Pará", "PB": "Paraíba", "PR": "Paraná",
    "PE": "Pernambuco", "PI": "Piauí", "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte",
    "RS": "Rio Grande do Sul", "RO": "Rondônia", "RR": "Roraima", "SC": "Santa Catarina",
    "SP": "São Paulo", "SE": "Sergipe", "TO": "Tocantins"
  };

  return (
    <ArticleLayout
      title="Calculadora de IPVA 2026: Todos os Estados do Brasil"
      description="Calcule o valor do IPVA do seu veículo em qualquer estado brasileiro. Alíquotas atualizadas, descontos é parcelamento."
      keywords={["calculadora IPVA", "IPVA 2026", "alíquota IPVA estados", "desconto IPVA à vista", "parcelamento IPVA"]}
      publishedDate="2026-02-04"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Impostos"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">O Que é o IPVA?</h2>
          <p className="text-lg mb-4">
            O <strong>Imposto sobre Propriedade de Veículos Automotores (IPVA)</strong> é um imposto estadual 
            cobrado anualmente de proprietários de veículos. O valor é calculado sobre o valor venal 
            do veículo (tabela FIPE).
          </p>
          <div className="bg-amber-900/300/20 border-4 border-yellow-500 p-4">
            <p className="font-bold">
               O IPVA vence no início do ano (janeiro a março, dependendo do estado).
              Pagando à vista, você pode ter até 3% de desconto!
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-100 to-green-100 border-4 border-slate-600 p-6 shadow-lg">
          <h2 className="text-2xl font-black mb-4"> Calculadora de IPVA</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Valor do Veículo (FIPE)</label>
              <input
                type="number"
                value={valorVeiculo}
                onChange={(e) => setValorVeiculo(e.target.value)}
                placeholder="Ex: 50000"
                className="w-full p-3 border-4 border-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full p-3 border-4 border-slate-600"
              >
                {Object.entries(estadosNomes).map(([uf, nome]) => (
                  <option key={uf} value={uf}>{nome} ({uf})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold mb-2">Tipo de Veículo</label>
              <select
                value={tipoVeiculo}
                onChange={(e) => setTipoVeiculo(e.target.value)}
                className="w-full p-3 border-4 border-slate-600"
              >
                <option value="carro">Carro</option>
                <option value="moto">Moto</option>
              </select>
            </div>
          </div>

          <button
            onClick={calcular}
            disabled={!valorVeiculo}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            CALCULAR IPVA
          </button>

          {result && (
            <div className="mt-6 bg-slate-800 text-white border-4 border-slate-600 p-4">
              <h3 className="font-black text-xl mb-4">Resultado do IPVA - {estadosNomes[result.estado]}</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p>Valor do veículo: <strong>R$ {result.valorVeiculo.toLocaleString("pt-BR")}</strong></p>
                  <p>Alíquota {result.tipoVeiculo}: <strong>{result.aliquota}%</strong></p>
                  <p>IPVA Total: <strong className="text-2xl text-blue-600">R$ {result.ipvaTotal.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</strong></p>
                </div>
                
                <div className="bg-emerald-900/300/20 border-4 border-green-500 p-3">
                  <h4 className="font-bold text-green-700 mb-2"> Opções de Pagamento:</h4>
                  <p>À vista (3% desconto): <strong className="text-green-600">R$ {result.comDesconto.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</strong></p>
                  <p className="text-sm text-green-700">Economia: R$ {result.desconto.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</p>
                  <hr className="my-2 border-green-500" />
                  <p>Parcelado 3x: <strong>3x de R$ {result.parcela3.toLocaleString("pt-BR", {maximumFractionDigits: 2})}</strong></p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-slate-600 pb-2">Alíquotas de IPVA por Estado</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-slate-600">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-2 text-left">Estado</th>
                  <th className="p-2 text-center">Carro</th>
                  <th className="p-2 text-center">Moto</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(aliquotas).map(([uf, taxas], i) => (
                  <tr key={uf} className={i % 2 === 0 ? "bg-slate-800" : "bg-slate-800 text-white"}>
                    <td className="p-2 font-bold">{estadosNomes[uf]} ({uf})</td>
                    <td className="p-2 text-center">{taxas.carro}%</td>
                    <td className="p-2 text-center">{taxas.moto}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-red-900/300/10 text-white border-4 border-red-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Estados com IPVA Mais Caro</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800 text-white border-2 border-red-500 p-3 text-center">
              <span className="text-2xl"></span>
              <p className="font-bold">São Paulo é Minas Gerais</p>
              <p className="text-red-600 text-xl font-black">4% para carros</p>
            </div>
            <div className="bg-slate-800 text-white border-2 border-red-500 p-3 text-center">
              <span className="text-2xl"></span>
              <p className="font-bold">Rio de Janeiro</p>
              <p className="text-red-600 text-xl font-black">4% para carros</p>
            </div>
            <div className="bg-slate-800 text-white border-2 border-red-500 p-3 text-center">
              <span className="text-2xl"></span>
              <p className="font-bold">Goiás</p>
              <p className="text-red-600 text-xl font-black">3,75% para carros</p>
            </div>
          </div>
        </section>

        <section className="bg-emerald-900/300/10 text-white border-4 border-green-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Estados com IPVA Mais Barato</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800 text-white border-2 border-green-500 p-3 text-center">
              <span className="text-2xl"></span>
              <p className="font-bold">Espírito Santo é Santa Catarina</p>
              <p className="text-green-600 text-xl font-black">2% para carros</p>
            </div>
            <div className="bg-slate-800 text-white border-2 border-green-500 p-3 text-center">
              <span className="text-2xl"></span>
              <p className="font-bold">Acre é Tocantins</p>
              <p className="text-green-600 text-xl font-black">2% para carros</p>
            </div>
            <div className="bg-slate-800 text-white border-2 border-green-500 p-3 text-center">
              <span className="text-2xl"></span>
              <p className="font-bold">Piauí é Bahia</p>
              <p className="text-green-600 text-xl font-black">2,5% para carros</p>
            </div>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Isenções de IPVA</h2>
          <ul className="space-y-2">
            <li> Veículos com mais de 20 anos (varia por estado)</li>
            <li> Veículos de PCD (Pessoa com Deficiência)</li>
            <li> Táxis é veículos de transporte escolar</li>
            <li> Veículos elétricos ou híbridos (em alguns estados)</li>
            <li> Máquinas agrícolas</li>
          </ul>
        </section>
      </div>
    </ArticleLayout>
  );
}
