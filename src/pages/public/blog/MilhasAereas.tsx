import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function MilhasAéreas() {
  const [gastoMensal, setGastoMensal] = useState<string>("");
  const [milhasPorReal, setMilhasPorReal] = useState<string>("1.5");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const gasto = parseFloat(gastoMensal) || 0;
    const taxa = parseFloat(milhasPorReal) || 1.5;
    
    if (!gasto) return;

    const milhasMes = gasto * taxa;
    const milhasAno = milhasMes * 12;
    
    // Destinos aproximados
    const destinos = [
      { nome: "Sao Paulo  Rio", milhas: 8000, tipo: "ida" },
      { nome: "Sao Paulo  Salvador", milhas: 15000, tipo: "ida" },
      { nome: "Sao Paulo  Miami", milhas: 35000, tipo: "ida" },
      { nome: "Sao Paulo  Lisboa", milhas: 45000, tipo: "ida" },
      { nome: "Sao Paulo  Paris", milhas: 55000, tipo: "ida" }
    ];

    const destinosPossiveis = destinos.map(d => ({
      ...d,
      mesesNecessários: Math.ceil(d.milhas / milhasMes),
      possível: milhasAno >= d.milhas
    }));

    setResult({
      milhasMes,
      milhasAno,
      valorMilhas: milhasAno * 0.02, // R$0.02 por milha em média
      destinos: destinosPossiveis
    });
  };

  const programas = [
    { nome: "LATAM Pass", pontosPorReal: "1.5-3.0", parceiros: "Itau, Bradesco, Santander", destaque: "Maior malha Brasil" },
    { nome: "Smiles (GOL)", pontosPorReal: "1.0-2.5", parceiros: "Banco do Brasil, Bradesco", destaque: "Promocoes agressivas" },
    { nome: "Azul Fidelidade", pontosPorReal: "1.0-2.0", parceiros: "Porto Seguro, XP", destaque: "Maior cobertura cidades" },
    { nome: "Livelo", pontosPorReal: "1.0-2.0", parceiros: "BB, Bradesco, Santander", destaque: "Transfere para todos" },
    { nome: "Esfera Santander", pontosPorReal: "1.0-3.0", parceiros: "So Santander", destaque: "Bonus alta renda" }
  ];

  const dicas = [
    { título: "Concentre gastos em 1 cartao", texto: "Quanto mais você gasta, mais pontos acumula. Evite dividir em vários cartoes." },
    { título: "Aproveite bonus de adesao", texto: "Novos clientes geralmente ganham milhares de milhas de boas-vindas." },
    { título: "Transferencias com bonus", texto: "Aguarde promoções de transferência com 50-100% de bonus." },
    { título: "Compre nas lojas parceiras", texto: "Shopping de milhas oferece 3-20 milhas por real em lojas online." },
    { título: "Não deixe expirar", texto: "Milhas tem validade. Faça pequenos resgates para renovar." },
    { título: "Emita com antecedencia", texto: "Disponibilidade de assentos award é maior com 6+ meses." }
  ];

  return (
    <ArticleLayout
      title="Milhas Aéreas: Guia Completo para Viajar de Graca"
      description="Aprenda a acumular milhas aéreas é viajar sem pagar passagem. Programas de fidelidade, cartoes, dicas é simulador de milhas."
      keywords={["milhas aéreas", "programa de milhas", "viajar de graca", "LATAM Pass", "Smiles", "acumular milhas"]}
      publishedDate="2026-01-21"
      modifiedDate="2026-01-21"
      author="Stater"
      category="Viagens"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">O que sao Milhas Aéreas?</h2>
          <p className="text-lg mb-4">
            Milhas sao pontos que você acumula ao usar cartao de crédito, fazer compras em parceiros 
            ou voar. <strong>Esses pontos viram passagens aéreas gratuitas!</strong>
          </p>
      <QuickSummary 
        variant="blue"
        items={[
          { label: 'Acumular', value: 'Cartões de crédito, compras em parceiros, promoções', icon: 'star' },
          { label: 'Usar', value: 'Passagens, upgrades, produtos - passagens rendem mais', icon: 'target' },
          { label: 'Programas', value: 'Smiles, Latam Pass, TudoAzul - cada um tem vantagens', icon: 'check' },
          { label: 'Dica', value: 'Nunca deixe milhas expirarem - use ou transfira', icon: 'lightbulb' },
        ]}
      />

          <div className="bg-emerald-500/20 border-4 border-green-500 p-4">
            <p className="font-bold text-green-700">
              Brasileiro viaja em média 2x por ano. Com milhas, você pode viajar 4-6x 
              gastando o mesmo dinheiro!
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-100 to-purple-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4">Simulador de Milhas</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Gasto Mensal no Cartao (R$)</label>
              <input
                type="number"
                value={gastoMensal}
                onChange={(e) => setGastoMensal(e.target.value)}
                placeholder="Ex: 3000"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Milhas por Real</label>
              <select
                value={milhasPorReal}
                onChange={(e) => setMilhasPorReal(e.target.value)}
                className="w-full p-3 border-4 border-black"
              >
                <option value="1.0">1.0 (Cartao básico)</option>
                <option value="1.5">1.5 (Cartao intermédiario)</option>
                <option value="2.0">2.0 (Cartao premium)</option>
                <option value="2.5">2.5 (Cartao Black)</option>
                <option value="3.0">3.0 (Black + bonus)</option>
              </select>
            </div>
          </div>

          <button
            onClick={calcular}
            disabled={!gastoMensal}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            CALCULAR MILHAS
          </button>

          {result && (
            <div className="bg-slate-800 text-white border-4 border-black p-4 mt-6">
              <div className="grid md:grid-cols-3 gap-4 mb-4 text-center">
                <div className="bg-blue-500/20 p-3 border-2 border-black">
                  <p className="text-sm">Por Mes</p>
                  <p className="font-black text-2xl">{result.milhasMes.toLocaleString()}</p>
                  <p className="text-xs">milhas</p>
                </div>
                <div className="bg-emerald-500/20 p-3 border-2 border-black">
                  <p className="text-sm">Por Ano</p>
                  <p className="font-black text-2xl">{result.milhasAno.toLocaleString()}</p>
                  <p className="text-xs">milhas</p>
                </div>
                <div className="bg-yellow-500/20 p-3 border-2 border-black">
                  <p className="text-sm">Valor Estimado</p>
                  <p className="font-black text-2xl">R$ {result.valorMilhas.toLocaleString()}</p>
                  <p className="text-xs">em passagens</p>
                </div>
              </div>

              <h3 className="font-black mb-3">Destinos que você pode alcancar:</h3>
              <div className="space-y-2">
                {result.destinos.map((d: any, i: number) => (
                  <div key={i} className={`flex justify-between items-center p-2 border-2 ${d.possível ? "border-green-500 bg-emerald-500/10 text-white" : "border-gray-300"}`}>
                    <span className="font-bold">{d.nome}</span>
                    <span className="text-sm">{d.milhas.toLocaleString()} milhas</span>
                    <span className={`text-sm font-bold ${d.possível ? "text-green-600" : "text-gray-500"}`}>
                      {d.mesesNecessários} {d.mesesNecessários === 1 ? "mes" : "meses"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Principais Programas de Milhas</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Programa</th>
                  <th className="p-3 text-center">Pontos/R$</th>
                  <th className="p-3 text-center">Parceiros</th>
                  <th className="p-3 text-center">Destaque</th>
                </tr>
              </thead>
              <tbody>
                {programas.map((p, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold">{p.nome}</td>
                    <td className="p-3 text-center">{p.pontosPorReal}</td>
                    <td className="p-3 text-center text-xs">{p.parceiros}</td>
                    <td className="p-3 text-center text-xs">{p.destaque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">6 Dicas para Maximizar Milhas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {dicas.map((dica, i) => (
              <div key={i} className="bg-slate-800 text-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-black text-lg mb-2">{i+1}. {dica.título}</h3>
                <p className="text-sm">{dica.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-yellow-500/20 border-4 border-black p-6">
          <h2 className="text-2xl font-black mb-4">Melhores Cartoes para Milhas</h2>
          <div className="space-y-3">
            <div className="bg-slate-800 text-white p-3 border-2 border-black">
              <p className="font-black">Itau Personnalite Black</p>
              <p className="text-sm">2.5 pontos/dolar, 1.5 ponto/real, lounge VIP</p>
            </div>
            <div className="bg-slate-800 text-white p-3 border-2 border-black">
              <p className="font-black">BB Ourocard Nanquim</p>
              <p className="text-sm">3.0 pontos/dolar, transfere para Smiles é Livelo</p>
            </div>
            <div className="bg-slate-800 text-white p-3 border-2 border-black">
              <p className="font-black">XP Visa Infinite</p>
              <p className="text-sm">Sem anuidade*, 1.0 ponto/real, cashback em milhas</p>
            </div>
            <div className="bg-slate-800 text-white p-3 border-2 border-black">
              <p className="font-black">Nubank Ultravioleta</p>
              <p className="text-sm">1.0 ponto/real em USD, acumula em Smiles</p>
            </div>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Erros que Desperdicam Milhas</h2>
          <ul className="space-y-2">
            <li> Deixar milhas expirarem sem usar</li>
            <li> Transferir sem bonus promocional</li>
            <li> Comprar milhas pelo preço cheio</li>
            <li> Emitir passagem em cima da hora</li>
            <li> Ignorar taxas de embarque (pode ser cara!)</li>
            <li> Espalhar pontos em vários programas</li>
          </ul>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Como acumular milhas rápido?",
                      "answer": "Use cartões de crédito que dão milhas, transfira para programas com bônus, aproveite promoções é concentre voos numa única companhia."
              },
              {
                      "question": "Quantas milhas preciso para uma passagem?",
                      "answer": "Varia muito. Voos nacionais: 10.000-25.000 milhas. Internacionais: 40.000-150.000. Executiva/primeira classe: muito mais."
              },
              {
                      "question": "Milhas expiram?",
                      "answer": "Sim, geralmente em 24-36 meses sem movimentação. Mantenha atividade na conta (acumular ou resgatar) para não perder."
              },
              {
                      "question": "Vale a pena comprar milhas?",
                      "answer": "Às vezes. Compare o preço por milheiro com o valor da passagem que quer emitir. Em promoções, pode valer a pena."
              }
      ]} />
    </ArticleLayout>
  );
}