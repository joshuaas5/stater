import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function FreelancerFinancas() {
  const categories = [
    {
      title: "Organização Básica",
      items: [
        { dica: "Separe conta PJ da PF", desc: "Use contas diferentes para não misturar dinheiro pessoal com do negócio" },
        { dica: "Defina um pro-labore", desc: "Pague-se um salário fixo mensal, não gaste tudo que entra" },
        { dica: "Reserve para impostos", desc: "Separe 6-15% de cada recebimento para pagar impostos" },
        { dica: "Controle todo recebimento", desc: "Anote cliente, valor, data, se foi pago, quando vence" }
      ]
    },
    {
      title: "Precificação",
      items: [
        { dica: "Calcule seu custo por hora", desc: "(Gastos mensais + lucro desejado) / horas trabalhadas" },
        { dica: "Inclua custos ocultos", desc: "Ferias, 13o, INSS, plano de saude, equipamentos, software" },
        { dica: "Não precifique por baixo", desc: "Clientes que pagam pouco geralmente dao mais trabalho" },
        { dica: "Reajuste anualmente", desc: "No mínimo acompanhe a inflação (IPCA)" }
      ]
    },
    {
      title: "Impostos é Formalização",
      items: [
        { dica: "MEI até R$81.000/ano", desc: "Paga apenas R$75,90/mes (2026). Mais simples é barato" },
        { dica: "Simples Nacional", desc: "Para faturamento maior. Alíquota de 6-15% dependendo do anexo" },
        { dica: "Emita nota fiscal", desc: "Protege você juridicamente é passa profissionalismo" },
        { dica: "Contribua para INSS", desc: "MEI contribui automáticamente. Outros regimes, faça como autônomo" }
      ]
    },
    {
      title: "Reservas Essenciais",
      items: [
        { dica: "Reserva de emergência maior", desc: "Mínimo 12 meses de gastos (o dobro de CLT) por instabilidade" },
        { dica: "Reserva de equipamentos", desc: "Notebook quebrou? Tenha reserva para repor rapidamente" },
        { dica: "Reserva de impostos", desc: "Não gaste esse dinheiro - ele não é seu" },
        { dica: "Reserva de ferias", desc: "Freelancer não tem férias pagas. Guarde para descansar" }
      ]
    },
    {
      title: "Contratos é Cobrança",
      items: [
        { dica: "Sempre faça contrato", desc: "Por escrito, mesmo que simples. Protege ambas as partes" },
        { dica: "Cobre adiantamento", desc: "50% no início para projetos grandes. Evita calote" },
        { dica: "Defina escopo claramente", desc: "O que está incluso é o que não esta. Evita trabalho extra gratis" },
        { dica: "Tenha politica de cancelamento", desc: "O que acontece se o cliente desistir no meio?" }
      ]
    }
  ];

  return (
    <ArticleLayout
      title="Financas para Freelancers: Guia Completo 2026"
      description="Organize suas financas como freelancer ou autônomo. Precificação, impostos, reservas, contratos é como não quebrar nos meses magros."
      keywords={["financas freelancer", "autônomo impostos", "precificacao serviços", "MEI financas", "organizar dinheiro freelancer"]}
      publishedDate="2026-01-20"
      modifiedDate="2026-01-20"
      author="Stater"
      category="Trabalho"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Desafios Financeiros do Freelancer</h2>
          <p className="text-lg mb-4">
            Ser freelancer é ter liberdade, mas também significa lidar com renda variavel, 
            impostos por conta própria é zero benefícios CLT. Este guia vai te ajudar a organizar tudo.
          </p>
      <QuickSummary 
        variant="orange"
        items={[
          { label: 'Reserva', value: 'Mínimo 6 meses de gastos - renda é instável', icon: 'shield' },
          { label: 'Imposto', value: 'Separe 15-27.5% de cada pagamento recebido', icon: 'alert' },
          { label: 'Preço', value: 'Hora = (Custo mensal  2)  horas trabalhadas', icon: 'money' },
          { label: 'MEI', value: 'Até R$81mil/ano - imposto fixo de ~R$70/mês', icon: 'lightbulb' },
        ]}
      />

          
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { problema: "Renda Variavel", icon: "~" },
              { problema: "Sem 13o/Ferias", icon: "X" },
              { problema: "Impostos Proprios", icon: "$" },
              { problema: "Sem FGTS", icon: "0" }
            ].map((p, i) => (
              <div key={i} className="bg-red-500/20 border-4 border-black p-3 text-center">
                <span className="text-2xl font-black">{p.icon}</span>
                <p className="font-bold text-sm mt-1">{p.problema}</p>
              </div>
            ))}
          </div>
        </section>

        {categories.map((cat, idx) => (
          <section key={idx}>
            <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">{cat.title}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {cat.items.map((item, i) => (
                <div key={i} className="border-4 border-black p-4 bg-slate-800 text-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                  <h3 className="font-black text-lg">{item.dica}</h3>
                  <p className="text-gray-700 text-sm mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Calculadora de Hora Minima</h2>
          <div className="bg-yellow-500/20 border-4 border-black p-4">
            <p className="font-bold mb-2">Formula:</p>
            <div className="bg-slate-800 text-white p-3 border-2 border-black font-mono text-center mb-4">
              Hora = (Gastos + Reservas + Impostos + Lucro) / Horas Produtivas
            </div>
            <p className="font-bold mb-2">Exemplo prático:</p>
            <ul className="space-y-1 text-sm">
              <li>Gastos pessoais: R$ 5.000/mes</li>
              <li>Reserva ferias/13o: R$ 835/mes (2 meses por ano)</li>
              <li>INSS/Impostos: R$ 500/mes</li>
              <li>Lucro/Investimentos: R$ 1.000/mes</li>
              <li><strong>Total necessário: R$ 7.335/mes</strong></li>
              <li>Horas produtivas: 120h/mes (6h/dia, 20 dias)</li>
              <li><strong>Hora mínima: R$ 61,13</strong></li>
            </ul>
            <p className="mt-3 text-xs text-gray-600">*Adicione margem para meses com menos projetos</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">MEI vs Simples vs Autônomo</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Regime</th>
                  <th className="p-3 text-left">Limite</th>
                  <th className="p-3 text-left">Imposto</th>
                  <th className="p-3 text-left">Para quem</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { regime: "MEI", limite: "R$ 81.000/ano", imposto: "R$ 75,90/mes fixo", para: "Iniciantes, baixo faturamento" },
                  { regime: "Simples Nacional", limite: "R$ 4,8mi/ano", imposto: "6-15,5% s/ fat.", para: "Faturamento médio/alto" },
                  { regime: "Autônomo (PF)", limite: "Sem limite", imposto: "Até 27,5% IR + INSS", para: "Serviços esporadicos" }
                ].map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold border-r-2 border-black">{r.regime}</td>
                    <td className="p-3 border-r-2 border-black">{r.limite}</td>
                    <td className="p-3 border-r-2 border-black">{r.imposto}</td>
                    <td className="p-3">{r.para}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Distribuicao Ideal da Receita</h2>
          <div className="grid md:grid-cols-5 gap-3">
            {[
              { pct: "50%", destino: "Custo de Vida", cor: "bg-blue-200" },
              { pct: "15%", destino: "Impostos", cor: "bg-red-200" },
              { pct: "15%", destino: "Reserva Emergência", cor: "bg-yellow-200" },
              { pct: "10%", destino: "Ferias/13o", cor: "bg-green-200" },
              { pct: "10%", destino: "Investimentos", cor: "bg-purple-200" }
            ].map((d, i) => (
              <div key={i} className={`${d.cor} border-4 border-black p-3 text-center`}>
                <p className="text-2xl font-black">{d.pct}</p>
                <p className="text-sm font-bold">{d.destino}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Meses Magros: Como Sobreviver</h2>
          <div className="space-y-3">
            {[
              { acao: "Use a reserva de emergência", desc: "Para isso ela existe. Reponha quando a renda normalizar" },
              { acao: "Reduza gastos variaveis", desc: "Corte assinaturas, delivery, lazer até a situação melhorar" },
              { acao: "Prospecte ativamente", desc: "Não espere projetos cairem do ceu. Va atras de clientes" },
              { acao: "Diversifique serviços", desc: "Ofereca serviços complementares para clientes existentes" },
              { acao: "Trabalhe em plataformas", desc: "Upwork, 99freelas, Workana para preencher lacunas" },
              { acao: "Negocie prazos com credores", desc: "Explique a situação é peça mais prazo se necessário" }
            ].map((a, i) => (
              <div key={i} className="border-4 border-orange-400 p-3 bg-orange-500/10">
                <h4 className="font-black">{a.acao}</h4>
                <p className="text-sm">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Checklist do Freelancer Organizado</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">TODO MES</h3>
              <ul className="space-y-1 text-sm">
                <li>[ ] Separar % para impostos</li>
                <li>[ ] Pagar pro-labore fixo</li>
                <li>[ ] Atualizar controle de recebidos</li>
                <li>[ ] Cobrar clientes inadimplentes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400 mb-2">TODO ANO</h3>
              <ul className="space-y-1 text-sm">
                <li>[ ] Revisar precificacao</li>
                <li>[ ] Declarar Imposto de Renda</li>
                <li>[ ] Avaliar regime tributário</li>
                <li>[ ] Planejar férias é descanso</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Como organizar finanças como freelancer?",
                      "answer": "Separe conta pessoal de profissional, guarde 30% para impostos, crie reserva de 6-12 meses é precifique considerando períodos sem trabalho."
              },
              {
                      "question": "Freelancer precisa pagar imposto?",
                      "answer": "Sim. Pode ser como pessoa física (carnê-leão até 27,5%) ou MEI (taxa fixa ~R$ 70/mês). MEI é mais vantajoso até R$ 81.000/ano."
              },
              {
                      "question": "Quanto cobrar como freelancer?",
                      "answer": "Some seus custos mensais + impostos + lucro desejado, divida pelas horas produtivas (geralmente 60-70% do total). Pesquise mercado também."
              },
              {
                      "question": "Freelancer pode se aposentar?",
                      "answer": "Sim, contribuindo para o INSS como autônomo ou MEI. MEI garante 1 salário mínimo. Para mais, contribua como autônomo (20%)."
              }
      ]} />
    </ArticleLayout>
  );
}