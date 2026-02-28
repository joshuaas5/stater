import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function PlanejamentoFinanceiroAnual() {
  const months = [
    { mes: "Janeiro", foco: "Planejamento é IPVA/IPTU", dicas: ["Monte orcamento anual", "Provisione IPVA é IPTU", "Defina metas do ano", "Revise assinaturas"] },
    { mes: "Fevereiro", foco: "Carnaval é reserva", dicas: ["Não gaste demais no Carnaval", "Reforce reserva de emergência", "Avalie plano de saude", "Negocie reajuste aluguel"] },
    { mes: "Marco", foco: "Imposto de Renda", dicas: ["Organize documentos IR", "Simule restituicao", "Antecipe declaração", "Aproveite deduções"] },
    { mes: "Abril", foco: "Pascoa é escola", dicas: ["Planeje gastos Pascoa", "Reserve matricula escolar", "Revise seguro auto", "Faça checkup financeiro Q1"] },
    { mes: "Maio", foco: "Dia das Maes", dicas: ["Presente consciente", "Avalie mudar de banco", "Renegocie dividas", "Análise investimentos"] },
    { mes: "Junho", foco: "Ferias escolares", dicas: ["Planeje viagem com antecedencia", "Compare preços passagens", "Reserve para ferias", "Avalie trabalho extra"] },
    { mes: "Julho", foco: "Ferias é meio do ano", dicas: ["Checkup financeiro semestral", "Ajuste orcamento se necessário", "Avalie trocar de emprego", "Aproveite promoções inverno"] },
    { mes: "Agosto", foco: "Dia dos Pais", dicas: ["Presente consciente", "Comece guardar para fim de ano", "Revise previdência privada", "Análise performance investimentos"] },
    { mes: "Setembro", foco: "Primavera é renovacao", dicas: ["Limpe financas", "Cancele serviços não usados", "Renegocie contratos", "Prepare para Black Friday"] },
    { mes: "Outubro", foco: "Dia das Crianças", dicas: ["Presente consciente", "Pesquise preços Black Friday", "Monte lista de compras", "Evite parcelas longas"] },
    { mes: "Novembro", foco: "Black Friday", dicas: ["Compre só o planejado", "Compare preços históricos", "Cuidado com golpes", "Priorize a vista"] },
    { mes: "Dezembro", foco: "Natal é 13o", dicas: ["Use 13o com sabedoria", "Evite exageros Natal", "Planeje reveillon", "Faça balanco do ano"] }
  ];

  return (
    <ArticleLayout
      title="Planejamento Financeiro Anual: Guia Mes a Mes"
      description="Organize suas financas o ano todo. Calendário financeiro com dicas para cada mes, datas importantes é como se preparar para gastos sazonais."
      keywords={["planejamento financeiro anual", "calendário financeiro", "organizar dinheiro ano", "gastos sazonais", "financas mês a mes"]}
      publishedDate="2026-01-19"
      modifiedDate="2026-01-20"
      author="Stater"
      category="Planejamento"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Por Que Planejar o Ano Todo?</h2>
          <p className="text-lg mb-4">
            A maioria das pessoas só pensa em dinheiro quando a conta aperta. Com planejamento anual, 
            você se antecipa aos gastos sazonais, evita dividas é ainda sobra para investir.
          </p>
      <QuickSummary 
        variant="blue"
        items={[
          { label: 'Janeiro', value: 'IPVA, IPTU, material escolar - provisione', icon: 'alert' },
          { label: 'Meio', value: 'Férias, Dia das Mães/Pais, aniversários', icon: 'clock' },
          { label: 'Final', value: '13º para dívidas ou investir, Black Friday', icon: 'money' },
          { label: 'Dica', value: 'Divida gastos anuais por 12 é guarde todo mês', icon: 'lightbulb' },
        ]}
      />

          <div className="bg-yellow-500/20 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold">GASTOS SAZONAIS ANUAIS MEDIOS:</p>
            <ul className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <li>IPVA/IPTU: R$3.000-8.000</li>
              <li>Material Escolar: R$500-2.000</li>
              <li>Presentes Datas: R$1.000-3.000</li>
              <li>Ferias: R$2.000-10.000</li>
            </ul>
            <p className="mt-3 font-black">Total que pega de surpresa: R$6.500-23.000/ano</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Calendário Financeiro 2026</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {months.map((m, idx) => (
              <div key={idx} className="border-4 border-black p-4 bg-slate-800 text-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-lg">{m.mes}</h3>
                  <span className="bg-black text-white text-xs px-2 py-1">{String(idx + 1).padStart(2, "0")}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-bold">{m.foco}</p>
                <ul className="text-sm space-y-1">
                  {m.dicas.map((d, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-green-600">-</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Datas de Pagamento Importantes</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Compromisso</th>
                  <th className="p-3 text-left">Quando</th>
                  <th className="p-3 text-left">Como se Preparar</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { item: "IPVA", quando: "Janeiro-Marco", prep: "Guarde 1/12 por mês ou pague a vista com desconto" },
                  { item: "IPTU", quando: "Janeiro-Fevereiro", prep: "Desconto de 5-10% a vista. Provisione mensalmente" },
                  { item: "Declaração IR", quando: "Marco-Maio", prep: "Organize documentos desde janeiro" },
                  { item: "Material Escolar", quando: "Janeiro", prep: "Compre em dezembro/janeiro com promocoes" },
                  { item: "Seguro Auto", quando: "Aniversario apolice", prep: "Cote 30 dias antes, negocie renovacao" },
                  { item: "Plano de Saude", quando: "Aniversario contrato", prep: "Pesquise opções 60 dias antes" },
                  { item: "13o Salário", quando: "Nov-Dez", prep: "Já tenha destino definido antes de receber" }
                ].map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold border-r-2 border-black">{r.item}</td>
                    <td className="p-3 border-r-2 border-black">{r.quando}</td>
                    <td className="p-3">{r.prep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Como Montar seu Planejamento</h2>
          <div className="space-y-4">
            {[
              { passo: 1, título: "Liste Todos os Gastos Anuais", desc: "IPVA, IPTU, seguros, matriculas, presentes, ferias, manutenção do carro, etc." },
              { passo: 2, título: "Some é Divida por 12", desc: "Esse é o valor que você precisa guardar todo mês para não ser pego de surpresa." },
              { passo: 3, título: "Crie uma Conta Separada", desc: "Deixe esse dinheiro rendendo em CDB ou Tesouro Selic até a hora de usar." },
              { passo: 4, título: "Automatize Transferencias", desc: "Configure transferência automática no dia do salário." },
              { passo: 5, título: "Revise Trimestralmente", desc: "Ajuste valores se necessário, adicione novos gastos previstos." }
            ].map(p => (
              <div key={p.passo} className="border-4 border-black p-4 bg-slate-800 text-white flex items-start gap-4">
                <span className="bg-black text-white text-xl font-black w-10 h-10 flex items-center justify-center flex-shrink-0">{p.passo}</span>
                <div>
                  <h3 className="font-black text-lg">{p.título}</h3>
                  <p className="text-gray-700">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Destino Ideal do 13o Salário</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-4 border-red-500 p-4 bg-red-500/10 text-white text-center">
              <p className="text-3xl font-black">50%</p>
              <p className="font-bold">Dividas é IPVA/IPTU</p>
              <p className="text-sm text-gray-600">Quite dividas caras primeiro</p>
            </div>
            <div className="border-4 border-blue-500 p-4 bg-blue-500/10 text-white text-center">
              <p className="text-3xl font-black">30%</p>
              <p className="font-bold">Reserva é Investimentos</p>
              <p className="text-sm text-gray-600">Faça seu dinheiro trabalhar</p>
            </div>
            <div className="border-4 border-green-500 p-4 bg-emerald-500/10 text-white text-center">
              <p className="text-3xl font-black">20%</p>
              <p className="font-bold">Presentes é Lazer</p>
              <p className="text-sm text-gray-600">Aproveite com consciencia</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Checklist de Fim de Ano</h2>
          <div className="bg-gray-100 border-4 border-black p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">DEZEMBRO</h3>
                <ul className="space-y-1 text-sm">
                  <li>[ ] Definir destino do 13o</li>
                  <li>[ ] Fazer lista presentes Natal</li>
                  <li>[ ] Pesquisar preços antes</li>
                  <li>[ ] Planejar ceia sem exageros</li>
                  <li>[ ] Revisar metas do ano</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2">JANEIRO</h3>
                <ul className="space-y-1 text-sm">
                  <li>[ ] Pagar IPVA a vista?</li>
                  <li>[ ] Pagar IPTU a vista?</li>
                  <li>[ ] Definir metas ano novo</li>
                  <li>[ ] Montar orcamento anual</li>
                  <li>[ ] Revisar investimentos</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Comece Agora</h2>
          <p className="mb-4">
            Não importa em que mês estamos. O melhor momento para começar a planejar é HOJE.
          </p>
          <div className="bg-yellow-400 text-black p-4 font-bold">
            <p>Ação imédiata: Abra uma planilha é liste todos os gastos previstos até o fim do ano. Divida pelo número de meses restantes. Esse é o valor para guardar por mes.</p>
          </div>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Quando fazer planejamento financeiro anual?",
                      "answer": "Idealmente em dezembro para o ano seguinte, ou janeiro. Revise trimestralmente para ajustar às mudanças."
              },
              {
                      "question": "O que incluir no planejamento anual?",
                      "answer": "Metas do ano, orçamento mensal estimado, gastos sazonais (IPTU, férias, presentes), reserva para emergências é investimentos."
              },
              {
                      "question": "Como prever gastos do ano todo?",
                      "answer": "Use o ano anterior como base, adicione inflação esperada (5-10%), inclua gastos conhecidos (matrícula, impostos) é reserva para imprevistos."
              },
              {
                      "question": "E se os planos mudarem no meio do ano?",
                      "answer": "É normal. Revise o planejamento a cada 3 meses, ajuste metas se necessário é não se culpe por mudanças - adapte-se."
              }
      ]} />
    </ArticleLayout>
  );
}