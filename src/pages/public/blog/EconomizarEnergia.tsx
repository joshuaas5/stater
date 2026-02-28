import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function EconomizarEnergia() {
  const tips = [
    {
      category: "Iluminacao",
      items: [
        { tip: "Troque todas as lampadas por LED", savings: "Até 80% na iluminacao", investment: "R$15-30 por lampada" },
        { tip: "Aproveite luz natural ao máximo", savings: "4-6h sem luz artificial", investment: "Gratis" },
        { tip: "Instale sensores de presença", savings: "30% em areas comuns", investment: "R$30-80" },
        { tip: "Pinte paredes de cores claras", savings: "Menos lampadas necessárias", investment: "R$200-500 por comodo" }
      ]
    },
    {
      category: "Ar Condicionado",
      items: [
        { tip: "Mantenha em 23-24 graus", savings: "Cada grau a menos = +8% consumo", investment: "Gratis" },
        { tip: "Limpe filtros mensalmente", savings: "Até 15% de economia", investment: "Gratis" },
        { tip: "Feche portas é janelas", savings: "Evita desperdicio total", investment: "Gratis" },
        { tip: "Prefira modelos Inverter", savings: "40-60% vs convencional", investment: "R$1.500-4.000" },
        { tip: "Use ventilador junto", savings: "Ar em 25 graus + ventilador = conforto", investment: "R$100-300" }
      ]
    },
    {
      category: "Geladeira",
      items: [
        { tip: "Não coloque alimentos quentes", savings: "Motor trabalha menos", investment: "Gratis" },
        { tip: "Verifique borracha de vedacao", savings: "Evita escape de ar frio", investment: "R$50-150 troca" },
        { tip: "Mantenha 2/3 preenchida", savings: "Eficiencia termica ideal", investment: "Gratis" },
        { tip: "Descongele regularmente", savings: "Até 30% de economia", investment: "Gratis" },
        { tip: "Afaste 15cm da parede", savings: "Ventilacao adequada", investment: "Gratis" }
      ]
    },
    {
      category: "Chuveiro Eletrico",
      items: [
        { tip: "Banhos de até 8 minutos", savings: "R$30-50/mes", investment: "Disciplina" },
        { tip: "Use modo verao quando possível", savings: "30% menos energia", investment: "Gratis" },
        { tip: "Considere aquecedor solar", savings: "Até 80% no chuveiro", investment: "R$2.000-5.000" },
        { tip: "Considere aquecedor a gas", savings: "50-70% vs elétrico", investment: "R$800-2.000" }
      ]
    },
    {
      category: "Eletrodomésticos",
      items: [
        { tip: "Tire aparelhos da tomada", savings: "Standby consome 12% da conta", investment: "Gratis" },
        { tip: "Use maquina de lavar cheia", savings: "Mesma energia, mais roupas", investment: "Gratis" },
        { tip: "Passe roupa de uma vez", savings: "Esquentar ferro é o que mais gasta", investment: "Gratis" },
        { tip: "Compre selo Procel A", savings: "30-50% mais eficientes", investment: "Variaval" }
      ]
    },
    {
      category: "Energia Solar",
      items: [
        { tip: "Avalie viabilidade na sua regiao", savings: "Até 95% da conta", investment: "R$15.000-40.000" },
        { tip: "Pesquise financiamentos", savings: "Parcela menor que economia", investment: "Entrada + parcelas" },
        { tip: "Considere cooperativas solares", savings: "Sem instalacao própria", investment: "Taxa mensal" }
      ]
    }
  ];

  const calculateSavings = (currentBill: number) => {
    return {
      led: currentBill * 0.15 * 0.8,
      ac: currentBill * 0.40 * 0.30,
      shower: currentBill * 0.25 * 0.20,
      standby: currentBill * 0.12,
      total: currentBill * 0.35
    };
  };

  const exampleSavings = calculateSavings(300);

  return (
    <ArticleLayout
      title="Como Economizar Energia: 25 Dicas que Funcionam"
      description="Reduza sua conta de luz em até 35% com estas dicas práticas. Economia de energia eletrica para residências com investimento baixo ou zero."
      keywords={["economizar energia", "reduzir conta de luz", "economia eletrica", "dicas energia", "casa eficiente"]}
      publishedDate="2026-01-16"
      modifiedDate="2026-01-20"
      author="Stater"
      category="Economia Domestica"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Quanto Você Pode Economizar?</h2>
          <p className="text-lg mb-4">
            Uma família brasileira média gasta R$250-400 por mês em energia eletrica. Com as dicas 
            certas, é possível reduzir esse valor em 30-40% - ou seja, R$75-160 por mês no bolso.
          </p>
      <QuickSummary 
        variant="yellow"
        items={[
          { label: 'Vilões', value: 'Chuveiro, ar-condicionado, geladeira velha', icon: 'alert' },
          { label: 'Fácil', value: 'Apagar luzes, desligar standby, banho mais curto', icon: 'check' },
          { label: 'Economia', value: 'Até 30% de redução com hábitos simples', icon: 'money' },
          { label: 'Dica', value: 'LED gasta 80% menos que incandescente - troque todas', icon: 'lightbulb' },
        ]}
      />

          
          <div className="bg-yellow-500/20 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black text-lg mb-2">Exemplo: Conta de R$300/mes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="bg-slate-800 text-white p-2 border-2 border-black">
                <p className="font-bold">LED</p>
                <p className="text-green-600 font-black">-R${exampleSavings.led.toFixed(0)}</p>
              </div>
              <div className="bg-slate-800 text-white p-2 border-2 border-black">
                <p className="font-bold">Ar-cond</p>
                <p className="text-green-600 font-black">-R${exampleSavings.ac.toFixed(0)}</p>
              </div>
              <div className="bg-slate-800 text-white p-2 border-2 border-black">
                <p className="font-bold">Chuveiro</p>
                <p className="text-green-600 font-black">-R${exampleSavings.shower.toFixed(0)}</p>
              </div>
              <div className="bg-slate-800 text-white p-2 border-2 border-black">
                <p className="font-bold">Standby</p>
                <p className="text-green-600 font-black">-R${exampleSavings.standby.toFixed(0)}</p>
              </div>
            </div>
            <p className="mt-3 font-black text-xl text-center">
              Economia potencial: R${exampleSavings.total.toFixed(0)}/mes = R${(exampleSavings.total * 12).toFixed(0)}/ano
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Viloes da Conta de Luz</h2>
          <div className="grid md:grid-cols-5 gap-3">
            {[
              { item: "Ar Condicionado", pct: "40%" },
              { item: "Chuveiro Eletrico", pct: "25%" },
              { item: "Geladeira", pct: "15%" },
              { item: "Iluminacao", pct: "8%" },
              { item: "Standby/Outros", pct: "12%" }
            ].map((v, i) => (
              <div key={i} className="bg-red-500/20 border-4 border-black p-3 text-center">
                <p className="font-black text-2xl">{v.pct}</p>
                <p className="text-sm font-bold">{v.item}</p>
              </div>
            ))}
          </div>
        </section>

        {tips.map((category, idx) => (
          <section key={idx}>
            <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">{category.category}</h2>
            <div className="space-y-3">
              {category.items.map((item, i) => (
                <div key={i} className="border-4 border-black p-4 bg-slate-800 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-black text-lg">{item.tip}</h3>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="bg-green-200 px-3 py-1 border-2 border-black font-bold">{item.savings}</span>
                      <span className="bg-blue-200 px-3 py-1 border-2 border-black">{item.investment}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Horário de Ponta: Quando Evitar</h2>
          <div className="bg-orange-500/20 border-4 border-black p-4">
            <p className="font-bold mb-2">Se você tem tarifa branca ou horosazonol:</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-200 p-3 border-2 border-black text-center">
                <p className="font-black">FORA PONTA</p>
                <p>22h - 17h</p>
                <p className="text-sm">Tarifa mais barata</p>
              </div>
              <div className="bg-yellow-200 p-3 border-2 border-black text-center">
                <p className="font-black">INTERMEDIARIO</p>
                <p>17h - 18h é 21h - 22h</p>
                <p className="text-sm">Tarifa média</p>
              </div>
              <div className="bg-red-200 p-3 border-2 border-black text-center">
                <p className="font-black">PONTA</p>
                <p>18h - 21h</p>
                <p className="text-sm">Tarifa mais cara</p>
              </div>
            </div>
            <p className="mt-3 text-sm">
              <strong>Dica:</strong> Use maquina de lavar, ferro é outros aparelhos de alto consumo fora do horário de ponta.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Bandeiras Tarifarias</h2>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { cor: "Verde", adicional: "R$0", bg: "bg-green-400" },
              { cor: "Amarela", adicional: "+R$1,88/100kWh", bg: "bg-yellow-400" },
              { cor: "Vermelha 1", adicional: "+R$4,46/100kWh", bg: "bg-red-400" },
              { cor: "Vermelha 2", adicional: "+R$7,87/100kWh", bg: "bg-red-600 text-white" }
            ].map((b, i) => (
              <div key={i} className={`${b.bg} p-4 border-4 border-black text-center`}>
                <p className="font-black text-lg">{b.cor}</p>
                <p className="font-bold">{b.adicional}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Em bandeira vermelha 2, redobre a economia! Uma conta de R$300 pode subir R$24 só pela bandeira.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Investimentos que se Pagam</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Investimento</th>
                  <th className="p-3 text-left">Custo</th>
                  <th className="p-3 text-left">Economia/mes</th>
                  <th className="p-3 text-left">Payback</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { item: "10 lampadas LED", custo: "R$200", economia: "R$30", payback: "7 meses" },
                  { item: "Ar Inverter", custo: "R$2.500", economia: "R$80", payback: "31 meses" },
                  { item: "Aquecedor Solar", custo: "R$3.500", economia: "R$60", payback: "58 meses" },
                  { item: "Energia Solar 3kWp", custo: "R$18.000", economia: "R$250", payback: "72 meses" }
                ].map((i, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold border-r-2 border-black">{i.item}</td>
                    <td className="p-3 border-r-2 border-black">{i.custo}</td>
                    <td className="p-3 border-r-2 border-black text-green-600 font-bold">{i.economia}</td>
                    <td className="p-3">{i.payback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Checklist Rápido</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">HOJE (Gratis)</h3>
              <ul className="space-y-1 text-sm">
                <li>[ ] Tirar aparelhos da tomada</li>
                <li>[ ] Ajustar ar para 23-24 graus</li>
                <li>[ ] Banhos de 8 minutos</li>
                <li>[ ] Apagar luzes ao sair</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">ESTE MES (Baixo custo)</h3>
              <ul className="space-y-1 text-sm">
                <li>[ ] Trocar lampadas por LED</li>
                <li>[ ] Limpar filtro do ar</li>
                <li>[ ] Verificar vedacao geladeira</li>
                <li>[ ] Instalar timer em boiler</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Como reduzir a conta de luz?",
                      "answer": "Troque lâmpadas por LED, desligue aparelhos da tomada, use ar-condicionado a 23°C, aproveite luz natural é evite banho quente demorado."
              },
              {
                      "question": "Qual eletrodoméstico gasta mais energia?",
                      "answer": "Chuveiro elétrico é ar-condicionado são os campeões. Geladeira antiga também pesa. Veja o selo Procel ao comprar novos."
              },
              {
                      "question": "Energia solar vale a pena?",
                      "answer": "Depende do consumo. Geralmente se paga em 4-7 anos é dura 25+ anos. Pesquise financiamentos é compare propostas."
              },
              {
                      "question": "Bandeira vermelha afeta muito a conta?",
                      "answer": "Sim, pode aumentar 50-100% o custo do kWh. Reduza consumo especialmente quando a bandeira está vermelha."
              }
      ]} />
    </ArticleLayout>
  );
}