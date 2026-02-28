import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function SeguroViagem() {
  const [destino, setDestino] = useState<string>("");
  const [dias, setDias] = useState<string>("");
  const [idade, setIdade] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const d = parseInt(dias) || 0;
    const i = parseInt(idade) || 30;
    
    if (!destino || !d) return;

    // Valores base por destino (por dia)
    const valoresDia: Record<string, number> = {
      "america_sul": 8,
      "america_norte": 15,
      "europa": 12,
      "asia": 14,
      "africa": 16,
      "nacional": 5
    };

    let valorDia = valoresDia[destino] || 10;
    
    // Ajuste por idade
    if (i >= 60 && i < 70) valorDia *= 1.5;
    else if (i >= 70) valorDia *= 2.2;

    const básico = valorDia * d;
    const completo = básico * 1.8;
    const premium = básico * 2.5;

    setResult({
      destino,
      dias: d,
      idade: i,
      básico: Math.round(básico),
      completo: Math.round(completo),
      premium: Math.round(premium),
      coberturaMedica: {
        básico: destino === "europa" ? 30000 : 15000,
        completo: destino === "europa" ? 60000 : 40000,
        premium: destino === "europa" ? 150000 : 100000
      }
    });
  };

  const coberturas = [
    { nome: "Despesas Medicas", básico: "USD 15-30k", completo: "USD 40-60k", premium: "USD 100-150k" },
    { nome: "Bagagem Extraviada", básico: "USD 500", completo: "USD 1.200", premium: "USD 2.500" },
    { nome: "Cancelamento Viagem", básico: "NAO", completo: "USD 1.500", premium: "USD 5.000" },
    { nome: "Atraso de Voo", básico: "NAO", completo: "USD 200", premium: "USD 400" },
    { nome: "Assistencia Odontologica", básico: "USD 200", completo: "USD 500", premium: "USD 1.000" },
    { nome: "Repatriacao", básico: "SIM", completo: "SIM", premium: "SIM + Família" },
    { nome: "Covid-19", básico: "NAO", completo: "SIM", premium: "SIM + Quarentena" },
    { nome: "Esportes Radicais", básico: "NAO", completo: "NAO", premium: "SIM" }
  ];

  const dicas = [
    {
      título: "Europa Exige Seguro",
      texto: "Paises do Tratado de Schengen exigem cobertura mínima de 30.000 euros para despesas medicas.",
      icone: ""
    },
    {
      título: "Cartao Pode Oferecer",
      texto: "Cartoes de crédito platinum é black geralmente incluem seguro viagem. Verifique com seu banco.",
      icone: ""
    },
    {
      título: "Doencas Pre-Existentes",
      texto: "Declare doencas pre-existentes. Não declarar pode invalidar a cobertura.",
      icone: ""
    },
    {
      título: "Gestantes é Idosos",
      texto: "Verifique idade limite é cobertura para gestantes. Algumas empresas não cobrem após 28 semanas.",
      icone: ""
    }
  ];

  return (
    <ArticleLayout
      title="Seguro Viagem: Guia Completo + Simulador de Precos"
      description="Entenda tudo sobre seguro viagem internacional é nacional. Simulador de precos, coberturas, quando contratar é dicas para economizar."
      keywords={["seguro viagem", "seguro viagem internacional", "quanto custa seguro viagem", "seguro viagem europa", "cobertura seguro viagem"]}
      publishedDate="2026-01-21"
      modifiedDate="2026-01-21"
      author="Stater"
      category="Viagens"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Por que Contratar Seguro Viagem?</h2>
          <p className="text-lg mb-4">
            Uma emergência medica no exterior pode custar <strong>dezenas de milhares de dolares</strong>. 
            O seguro viagem garante atendimento sem preocupacao com custos absurdos.
          </p>
      <QuickSummary 
        variant="blue"
        items={[
          { label: 'Europa', value: 'OBRIGATÓRIO para Schengen - mínimo 30.000', icon: 'alert' },
          { label: 'Cobre', value: 'Saúde, extravio de bagagem, cancelamento', icon: 'shield' },
          { label: 'Preço', value: 'R$10-30/dia - muito barato pelo que oferece', icon: 'money' },
          { label: 'Dica', value: 'Cartão de crédito pode incluir - verifique condições', icon: 'lightbulb' },
        ]}
      />

          <div className="bg-red-500/20 border-4 border-red-500 p-4 mb-4">
            <p className="font-bold text-red-700">
              ALERTA: Uma apendicite nos EUA custa em média USD 33.000. 
              Uma diaria de UTI pode passar de USD 10.000!
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-100 to-green-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4">Simulador de Seguro Viagem</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Destino:</label>
              <select
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full p-3 border-4 border-black"
              >
                <option value="">Selecione</option>
                <option value="nacional">Brasil (Nacional)</option>
                <option value="america_sul">America do Sul</option>
                <option value="america_norte">America do Norte</option>
                <option value="europa">Europa</option>
                <option value="asia">Asia/Oceania</option>
                <option value="africa">Africa/Oriente Medio</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-2">Dias de Viagem:</label>
              <input
                type="number"
                value={dias}
                onChange={(e) => setDias(e.target.value)}
                placeholder="Ex: 15"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Sua Idade:</label>
              <input
                type="number"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="Ex: 35"
                className="w-full p-3 border-4 border-black"
              />
            </div>
          </div>

          <button
            onClick={calcular}
            disabled={!destino || !dias}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            SIMULAR PRECOS
          </button>

          {result && (
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-800 text-white border-4 border-black p-4">
                <h3 className="font-black text-lg mb-2">Plano Básico</h3>
                <p className="text-3xl font-black text-green-600 mb-2">R$ {result.básico}</p>
                <p className="text-sm mb-2">Cobertura Medica: USD {result.coberturaMedica.básico.toLocaleString()}</p>
                <ul className="text-xs space-y-1">
                  <li> Despesas medicas</li>
                  <li> Bagagem extraviada</li>
                  <li> Repatriacao</li>
                  <li> Cancelamento</li>
                </ul>
              </div>
              
              <div className="bg-yellow-500/20 border-4 border-black p-4 transform scale-105">
                <div className="bg-black text-white text-xs font-bold px-2 py-1 inline-block mb-2">MAIS ESCOLHIDO</div>
                <h3 className="font-black text-lg mb-2">Plano Completo</h3>
                <p className="text-3xl font-black text-green-600 mb-2">R$ {result.completo}</p>
                <p className="text-sm mb-2">Cobertura Medica: USD {result.coberturaMedica.completo.toLocaleString()}</p>
                <ul className="text-xs space-y-1">
                  <li> Tudo do básico</li>
                  <li> Cancelamento viagem</li>
                  <li> Atraso de voo</li>
                  <li> Covid-19</li>
                </ul>
              </div>
              
              <div className="bg-slate-800 text-white border-4 border-black p-4">
                <h3 className="font-black text-lg mb-2">Plano Premium</h3>
                <p className="text-3xl font-black text-green-600 mb-2">R$ {result.premium}</p>
                <p className="text-sm mb-2">Cobertura Medica: USD {result.coberturaMedica.premium.toLocaleString()}</p>
                <ul className="text-xs space-y-1">
                  <li> Tudo do completo</li>
                  <li> Esportes radicais</li>
                  <li> Quarentena Covid</li>
                  <li> Cobertura família</li>
                </ul>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4">*Valores estimados para referência. Compare em sites especializados para valores reais.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Comparativo de Coberturas</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Cobertura</th>
                  <th className="p-3 text-center">Básico</th>
                  <th className="p-3 text-center">Completo</th>
                  <th className="p-3 text-center">Premium</th>
                </tr>
              </thead>
              <tbody>
                {coberturas.map((c, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold border-r-2 border-black">{c.nome}</td>
                    <td className="p-3 text-center border-r-2 border-black">{c.básico}</td>
                    <td className="p-3 text-center border-r-2 border-black">{c.completo}</td>
                    <td className="p-3 text-center">{c.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Dicas Importantes</h2>
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

        <section className="bg-yellow-500/20 border-4 border-black p-6">
          <h2 className="text-2xl font-black mb-4">Melhores Sites para Comparar</h2>
          <ul className="space-y-2">
            <li className="font-bold">1. Seguros Promo - Maior comparador do Brasil</li>
            <li className="font-bold">2. Real Seguro Viagem - Atendimento em portugues</li>
            <li className="font-bold">3. Comparar Seguro Viagem - Multiplas seguradoras</li>
            <li className="font-bold">4. Assistente de Viagem - Opcoes economicas</li>
          </ul>
          <p className="text-sm mt-4 text-gray-600">
            Dica: Compare sempre em pelo menos 2 sites é use cupons de desconto!
          </p>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Checklist Antes de Viajar</h2>
          <ul className="space-y-2">
            <li> Contratar seguro com antecedencia</li>
            <li> Salvar número de emergência no celular</li>
            <li> Levar copia da apolice impressa</li>
            <li> Verificar cobertura para atividades planejadas</li>
            <li> Conferir franquias é limitações</li>
            <li> Guardar todos os recibos medicos</li>
          </ul>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Seguro viagem é obrigatório?",
                      "answer": "Para Europa (Espaço Schengen) é obrigatório com cobertura mínima de 30.000 euros. Para outros destinos é opcional mas recomendado."
              },
              {
                      "question": "Quanto custa um seguro viagem?",
                      "answer": "Depende do destino é duração. Uma semana na Europa custa entre R$ 100-300. EUA pode ser mais caro por causa dos custos médicos."
              },
              {
                      "question": "O que o seguro viagem cobre?",
                      "answer": "Cobertura básica: despesas médicas é hospitalares, repatriação, extravio de bagagem. Adicionais: cancelamento, atraso de voo, esportes."
              },
              {
                      "question": "Cartão de crédito não cobre viagem?",
                      "answer": "Alguns cartões premium oferecem seguro, mas geralmente com coberturas limitadas. Verifique os valores é compare com seguros específicos."
              }
      ]} />
    </ArticleLayout>
  );
}