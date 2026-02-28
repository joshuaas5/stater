import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";

export default function InvestimentosIniciantes() {
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [monthlyAmount, setMonthlyAmount] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const profiles = [
    { id: "conservador", name: "Conservador", description: "Prioriza segurança sobre rentabilidade", allocation: { rf: 80, rv: 15, cripto: 5 } },
    { id: "moderado", name: "Moderado", description: "Equilíbrio entre risco é retorno", allocation: { rf: 50, rv: 40, cripto: 10 } },
    { id: "arrojado", name: "Arrojado", description: "Busca maiores retornos aceitando riscos", allocation: { rf: 20, rv: 60, cripto: 20 } }
  ];

  const calculate = () => {
    const amount = parseFloat(monthlyAmount);
    const profile = profiles.find(p => p.id === selectedProfile);
    if (!amount || !profile) return;

    const rfAmount = amount * (profile.allocation.rf / 100);
    const rvAmount = amount * (profile.allocation.rv / 100);
    const criptoAmount = amount * (profile.allocation.cripto / 100);

    // Projeção 5 anos (taxas anuais estimadas)
    const rfRate = 0.12; // 12% a.a. renda fixa
    const rvRate = 0.15; // 15% a.a. renda variavel
    const criptoRate = 0.25; // 25% a.a. cripto (alta volatilidade)

    const months = 60;
    let rfTotal = 0, rvTotal = 0, criptoTotal = 0;
    
    for (let i = 0; i < months; i++) {
      rfTotal = (rfTotal + rfAmount) * (1 + rfRate/12);
      rvTotal = (rvTotal + rvAmount) * (1 + rvRate/12);
      criptoTotal = (criptoTotal + criptoAmount) * (1 + criptoRate/12);
    }

    setResult({
      profile: profile.name,
      monthly: { rf: rfAmount, rv: rvAmount, cripto: criptoAmount },
      projected: { rf: rfTotal, rv: rvTotal, cripto: criptoTotal, total: rfTotal + rvTotal + criptoTotal },
      invested: amount * months
    });
  };

  return (
    <ArticleLayout
      title="Investimentos para Iniciantes: Guia Completo 2026"
      description="Aprenda a investir do zero. Guia prático com passo a passo, tipos de investimentos, perfis de investidor é simulador de carteira."
      keywords={["investimentos para iniciantes", "como começar investir", "guia investimentos", "primeiro investimento", "carteira investimentos"]}
      publishedDate="2026-01-15"
      modifiedDate="2026-01-20"
      author="Stater"
      category="Investimentos"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Por Que Investir?</h2>
          <p className="text-lg mb-4">
            Deixar dinheiro parado na poupança é perder dinheiro para a inflação. Em 2025, a poupança 
            rendeu cerca de 7% enquanto a inflação foi de 4,5%. Parece lucro, mas outros investimentos 
            tao seguros quanto renderiam 12% ou mais.
          </p>
      <QuickSummary 
        variant="green"
        items={[
          { label: 'Ordem', value: '1º Reserva, 2º Renda fixa, 3º Variável', icon: 'target' },
          { label: 'Risco', value: 'Tesouro = baixo, FIIs = médio, Ações = alto', icon: 'alert' },
          { label: 'Tempo', value: 'Curto prazo = RF, Longo prazo = pode ter RV', icon: 'clock' },
          { label: 'Dica', value: 'Comece com Tesouro Selic - simples é seguro', icon: 'lightbulb' },
        ]}
      />

          <div className="bg-yellow-500/20 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold">FATO: R$10.000 na poupança em 2015 valem hoje menos de R$7.000 em poder de compra real.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Passo a Passo para Começar</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: "Monte sua Reserva de Emergência", desc: "Guarde 6 meses de gastos em investimentos de alta liquidez (Tesouro Selic, CDB liquidez diaria)" },
              { step: 2, title: "Quite Dividas Caras", desc: "Pague cartao de crédito é cheque especial antes de investir. Juros de 400% a.a. não há investimento que cubra" },
              { step: 3, title: "Descubra seu Perfil", desc: "Conservador, moderado ou arrojado? Isso define sua carteira ideal" },
              { step: 4, title: "Abra Conta em Corretora", desc: "Escolha corretoras com taxa zero: Rico, Clear, NuInvest, XP, BTG" },
              { step: 5, title: "Comece Pequeno", desc: "Não precisa de muito. Tesouro Direto aceita a partir de R$30" },
              { step: 6, title: "Invista Todo Mes", desc: "Consistencia vence timing. Aporte mensal fixo, não importa o cenario" }
            ].map(item => (
              <div key={item.step} className="border-4 border-black p-4 bg-slate-800 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-start gap-4">
                  <span className="bg-black text-white text-xl font-black w-10 h-10 flex items-center justify-center flex-shrink-0">{item.step}</span>
                  <div>
                    <h3 className="font-black text-lg">{item.title}</h3>
                    <p className="text-gray-700">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Tipos de Investimentos</h2>
          
          <h3 className="text-xl font-bold mt-6 mb-3">Renda Fixa (Menor Risco)</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              { name: "Tesouro Selic", risk: "Muito Baixo", return: "~12% a.a.", min: "R$30", liquidity: "D+1" },
              { name: "CDB", risk: "Baixo", return: "100-120% CDI", min: "R$1", liquidity: "Varia" },
              { name: "LCI/LCA", risk: "Baixo", return: "90-100% CDI", min: "R$1.000", liquidity: "90+ dias" },
              { name: "Tesouro IPCA+", risk: "Baixo", return: "IPCA + 6%", min: "R$30", liquidity: "D+1" }
            ].map(inv => (
              <div key={inv.name} className="border-4 border-black p-4 bg-emerald-500/10 text-white">
                <h4 className="font-black">{inv.name}</h4>
                <p className="text-sm">Risco: {inv.risk}</p>
                <p className="text-sm">Retorno: {inv.return}</p>
                <p className="text-sm">Mínimo: {inv.min}</p>
                <p className="text-sm">Liquidez: {inv.liquidity}</p>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-bold mt-6 mb-3">Renda Variavel (Maior Risco/Retorno)</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              { name: "Ações", risk: "Alto", return: "Variavel", min: "~R$10", desc: "Pedacos de empresas" },
              { name: "FIIs", risk: "Medio", return: "8-12% a.a. + valorizacao", min: "~R$10", desc: "Imóveis sem burocracia" },
              { name: "ETFs", risk: "Medio", return: "Segue índice", min: "~R$10", desc: "Diversificacao automática" },
              { name: "BDRs", risk: "Alto", return: "Variavel", min: "~R$10", desc: "Ações estrangeiras" }
            ].map(inv => (
              <div key={inv.name} className="border-4 border-black p-4 bg-blue-500/10 text-white">
                <h4 className="font-black">{inv.name}</h4>
                <p className="text-sm">Risco: {inv.risk}</p>
                <p className="text-sm">Retorno: {inv.return}</p>
                <p className="text-sm">Mínimo: {inv.min}</p>
                <p className="text-sm text-gray-600">{inv.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4">Simulador de Carteira Iniciante</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block font-bold mb-2">Seu Perfil de Investidor:</label>
              <div className="grid md:grid-cols-3 gap-3">
                {profiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile.id)}
                    className={`p-3 border-4 border-black text-left transition-all ${
                      selectedProfile === profile.id 
                        ? "bg-black text-white" 
                        : "bg-slate-800 text-white hover:bg-gray-100"
                    }`}
                  >
                    <span className="font-black block">{profile.name}</span>
                    <span className="text-sm">{profile.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2">Quanto pode investir por mes?</label>
              <input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                placeholder="Ex: 500"
                className="w-full p-3 border-4 border-black text-lg"
              />
            </div>

            <button
              onClick={calculate}
              disabled={!selectedProfile || !monthlyAmount}
              className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              SIMULAR CARTEIRA
            </button>

            {result && (
              <div className="bg-slate-800 text-white border-4 border-black p-4 mt-4">
                <h3 className="font-black text-xl mb-4">Sua Carteira {result.profile}</h3>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-emerald-500/20 p-3 border-2 border-black">
                    <p className="font-bold">Renda Fixa</p>
                    <p className="text-lg font-black">R$ {result.monthly.rf.toFixed(2)}/mes</p>
                  </div>
                  <div className="bg-blue-500/20 p-3 border-2 border-black">
                    <p className="font-bold">Renda Variavel</p>
                    <p className="text-lg font-black">R$ {result.monthly.rv.toFixed(2)}/mes</p>
                  </div>
                  <div className="bg-orange-500/20 p-3 border-2 border-black">
                    <p className="font-bold">Cripto</p>
                    <p className="text-lg font-black">R$ {result.monthly.cripto.toFixed(2)}/mes</p>
                  </div>
                </div>

                <div className="bg-yellow-200 p-4 border-2 border-black">
                  <p className="font-bold">Projeção em 5 Anos:</p>
                  <p className="text-2xl font-black">R$ {result.projected.total.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                  <p className="text-sm text-gray-700">Investido: R$ {result.invested.toLocaleString("pt-BR")}</p>
                  <p className="text-sm text-gray-700">Rendimento estimado: R$ {(result.projected.total - result.invested).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                </div>

                <p className="text-xs text-gray-500 mt-2">*Simulação ilustrativa. Rentabilidade passada não garante futura. Renda variavel tem riscos.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Erros de Iniciante para Evitar</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { erro: "Investir sem reserva de emergência", solucao: "Monte 6 meses de gastos antes de arriscar" },
              { erro: "Seguir dicas de influencers", solucao: "Estude é entenda onde está colocando seu dinheiro" },
              { erro: "Colocar tudo em um ativo so", solucao: "Diversifique sempre, mesmo com pouco dinheiro" },
              { erro: "Vender no panico", solucao: "Mercado cai, mas historicamente sempre se recupera" },
              { erro: "Buscar lucro rápido", solucao: "Investimento é maratona, não corrida de 100m" },
              { erro: "Ignorar taxas é impostos", solucao: "Compare custos entre corretoras é produtos" }
            ].map((item, i) => (
              <div key={i} className="border-4 border-red-500 p-4 bg-red-500/10 text-white">
                <p className="font-black text-red-700">ERRO: {item.erro}</p>
                <p className="text-green-700 mt-2">SOLUCAO: {item.solucao}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Melhores Corretoras 2026</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Corretora</th>
                  <th className="p-3 text-left">Taxa Ações</th>
                  <th className="p-3 text-left">Tesouro</th>
                  <th className="p-3 text-left">Destaque</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "NuInvest", ações: "Zero", tesouro: "Zero", destaque: "Integrado ao Nubank" },
                  { name: "Rico", ações: "Zero", tesouro: "Zero", destaque: "Melhor para iniciantes" },
                  { name: "Clear", ações: "Zero", tesouro: "Zero", destaque: "Plataforma simples" },
                  { name: "XP", ações: "R$4,90", tesouro: "Zero", destaque: "Maior variedade" },
                  { name: "BTG", ações: "Zero", tesouro: "Zero", destaque: "Cashback em fundos" }
                ].map((c, i) => (
                  <tr key={c.name} className={i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold border-r-2 border-black">{c.name}</td>
                    <td className="p-3 border-r-2 border-black">{c.ações}</td>
                    <td className="p-3 border-r-2 border-black">{c.tesouro}</td>
                    <td className="p-3">{c.destaque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Comece HOJE</h2>
          <p className="text-lg mb-4">
            O melhor momento para começar a investir foi há 10 anos. O segundo melhor momento é AGORA.
          </p>
          <div className="bg-yellow-400 text-black p-4 font-bold">
            <p>Ação imédiata: Abra uma conta em corretora gratuita é faça seu primeiro aporte no Tesouro Selic, mesmo que seja R$30. O habito é mais importante que o valor.</p>
          </div>
        </section>
      </div>
    
      <FAQSchema 
        faqs={[
          {
            question: "Quanto preciso para comecar a investir?",
            answer: "Voce pode comecar com apenas R$ 30 no Tesouro Direto ou R$ 1 em alguns CDBs. O importante é comecar, não o valor inicial."
          },
          {
            question: "Qual o melhor investimento para iniciantes?",
            answer: "Comece pela renda fixa: Tesouro Selic, CDB de bancos digitais ou fundos DI. Sao seguros é rendem mais que a poupanca."
          },
          {
            question: "Investir é arriscado?",
            answer: "Depende do tipo. Renda fixa (Tesouro, CDB) tem risco baixissimo. Acoes é cripto tem risco alto. Iniciantes devem focar em renda fixa primeiro."
          },
          {
            question: "Preciso de corretora para investir?",
            answer: "Sim, mas hoje é muito facil. Apps como Nubank, Inter, Rico é XP permitem investir pelo celular em minutos. Muitas não cobram taxa."
          }
        ]}
      />
    </ArticleLayout>
  );
}