import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function ContaBancariaDigital() {
  const bancos = [
    {
      nome: "Nubank",
      tipo: "Digital puro",
      taxaManutenção: "Gratis",
      rendimento: "100% CDI",
      pix: "Ilimitado gratis",
      ted: "Gratis",
      cartaoCrédito: "Sim, sem anuidade",
      cashback: "Até 1% no crédito",
      investimentos: "CDB, Fundos, Cripto",
      emprestimo: "Sim",
      atendimento: "Chat 24h",
      nota: 4.7
    },
    {
      nome: "Inter",
      tipo: "Digital completo",
      taxaManutenção: "Gratis",
      rendimento: "100% CDI",
      pix: "Ilimitado gratis",
      ted: "Gratis",
      cartaoCrédito: "Sim, sem anuidade",
      cashback: "Até 1.5% + shopping",
      investimentos: "CDB, LCI, Ações, FIIs, Cripto",
      emprestimo: "Sim + consignado",
      atendimento: "Chat é telefone",
      nota: 4.5
    },
    {
      nome: "C6 Bank",
      tipo: "Digital premium",
      taxaManutenção: "Gratis",
      rendimento: "102% CDI",
      pix: "Ilimitado gratis",
      ted: "Gratis",
      cartaoCrédito: "Sim, sem anuidade",
      cashback: "Atoms (pontos)",
      investimentos: "CDB, LCI, Fundos",
      emprestimo: "Sim",
      atendimento: "Chat é telefone",
      nota: 4.4
    },
    {
      nome: "PagBank",
      tipo: "Digital + maquininha",
      taxaManutenção: "Gratis",
      rendimento: "100% CDI",
      pix: "Ilimitado gratis",
      ted: "Gratis",
      cartaoCrédito: "Sim, sem anuidade",
      cashback: "Até 10% parceiros",
      investimentos: "CDB, Tesouro",
      emprestimo: "Sim",
      atendimento: "Chat",
      nota: 4.3
    },
    {
      nome: "Neon",
      tipo: "Digital jovem",
      taxaManutenção: "Gratis",
      rendimento: "100% CDI",
      pix: "Ilimitado gratis",
      ted: "Gratis",
      cartaoCrédito: "Sim, sem anuidade",
      cashback: "Recompensas",
      investimentos: "CDB",
      emprestimo: "Sim",
      atendimento: "Chat",
      nota: 4.2
    }
  ];

  const vantagens = [
    { título: "Sem taxa de manutenção", texto: "Bancos tradicionais cobram R$ 30-80/mes. Digitais sao gratis." },
    { título: "Rendimento automático", texto: "Seu dinheiro rende 100% CDI ou mais todo dia, sem fazer nada." },
    { título: "Cartao sem anuidade", texto: "Crédito é débito gratuitos, alguns com cashback." },
    { título: "PIX é TED gratis", texto: "Transferencias ilimitadas sem custo adicional." },
    { título: "Abertura em minutos", texto: "Abre conta pelo celular sem ir a agência." },
    { título: "Investimentos integrados", texto: "Acesso a CDB, Tesouro, ações é fundos no mesmo app." }
  ];

  const cuidados = [
    "Verifique se o banco tem Fundo Garantidor (FGC) - protege até R$ 250 mil",
    "Alguns serviços premium podem ter custo (cartao metal, limites maiores)",
    "Atendimento pode ser mais lento que bancos tradicionais",
    "Nem todos oferecem cheque especial (pode ser bom ou ruim)",
    "Cuidado com emprestimos pre-aprovados tentadores no app"
  ];

  return (
    <ArticleLayout
      title="Melhores Contas Digitais 2026: Comparativo Completo"
      description="Compare Nubank, Inter, C6, PagBank é outros bancos digitais. Taxas, rendimento, cartao, cashback é investimentos. Qual o melhor para voce?"
      keywords={["conta digital", "melhor banco digital", "Nubank", "Inter", "C6 Bank", "banco sem taxa", "conta gratis"]}
      publishedDate="2026-01-21"
      modifiedDate="2026-01-21"
      author="Stater"
      category="Bancos"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Por que Trocar para Conta Digital?</h2>
          <p className="text-lg mb-4">
            Bancos digitais não cobram taxa de manutenção, oferecem rendimento automático é 
            cartoes sem anuidade. <strong>Você pode economizar R$ 500-1.000/ano</strong> só trocando de banco!
          </p>
      <QuickSummary 
        variant="purple"
        items={[
          { label: 'Top', value: 'Nubank, Inter, C6 Bank - sem taxas, app completo', icon: 'star' },
          { label: 'Vantagens', value: 'Sem anuidade, Pix ilimitado, CDB automático', icon: 'check' },
          { label: 'Cartão', value: 'Débito é crédito sem anuidade na maioria', icon: 'money' },
          { label: 'Dica', value: 'Mantenha conta em banco tradicional como backup', icon: 'lightbulb' },
        ]}
      />

          <div className="bg-emerald-500/20 border-4 border-green-500 p-4">
            <p className="font-bold text-green-700">
              85% dos brasileiros já usam pelo menos 1 banco digital. 
              Se você ainda paga taxa, está perdendo dinheiro!
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">6 Vantagens dos Bancos Digitais</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {vantagens.map((v, i) => (
              <div key={i} className="bg-slate-800 text-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-black text-lg mb-2"> {v.título}</h3>
                <p className="text-sm">{v.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Comparativo dos Melhores Bancos</h2>
          <div className="space-y-6">
            {bancos.map((banco, i) => (
              <div key={i} className="bg-slate-800 text-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-xl">{banco.nome}</h3>
                    <p className="text-sm text-gray-600">{banco.tipo}</p>
                  </div>
                  <div className="bg-yellow-300 border-2 border-black px-3 py-1">
                    <span className="font-black">{banco.nota}/5</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 border border-black">
                    <p className="font-bold">Taxa Manutenção</p>
                    <p className="text-green-600 font-bold">{banco.taxaManutenção}</p>
                  </div>
                  <div className="bg-gray-50 p-2 border border-black">
                    <p className="font-bold">Rendimento Conta</p>
                    <p className="text-green-600 font-bold">{banco.rendimento}</p>
                  </div>
                  <div className="bg-gray-50 p-2 border border-black">
                    <p className="font-bold">Cartao Crédito</p>
                    <p>{banco.cartaoCrédito}</p>
                  </div>
                  <div className="bg-gray-50 p-2 border border-black">
                    <p className="font-bold">PIX</p>
                    <p>{banco.pix}</p>
                  </div>
                  <div className="bg-gray-50 p-2 border border-black">
                    <p className="font-bold">Cashback</p>
                    <p>{banco.cashback}</p>
                  </div>
                  <div className="bg-gray-50 p-2 border border-black">
                    <p className="font-bold">Investimentos</p>
                    <p className="text-xs">{banco.investimentos}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-black p-6">
          <h2 className="text-2xl font-black mb-4">Qual Banco Escolher?</h2>
          <div className="space-y-3">
            <div className="bg-slate-800 text-white p-3 border-2 border-black">
              <p className="font-black">Para o dia a dia simples:</p>
              <p className="text-sm">Nubank - O mais intuitivo é confiavel</p>
            </div>
            <div className="bg-slate-800 text-white p-3 border-2 border-black">
              <p className="font-black">Para investir pelo celular:</p>
              <p className="text-sm">Inter - Maior variedade de investimentos</p>
            </div>
            <div className="bg-slate-800 text-white p-3 border-2 border-black">
              <p className="font-black">Para melhor rendimento:</p>
              <p className="text-sm">C6 Bank - Rende 102% CDI automático</p>
            </div>
            <div className="bg-slate-800 text-white p-3 border-2 border-black">
              <p className="font-black">Para MEI/Autônomo:</p>
              <p className="text-sm">PagBank - Integra com maquininha é vendas</p>
            </div>
          </div>
        </section>

        <section className="bg-yellow-500/20 border-4 border-black p-6">
          <h2 className="text-2xl font-black mb-4">Cuidados ao Escolher</h2>
          <ul className="space-y-2">
            {cuidados.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-yellow-700 font-bold"></span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Como Abrir Conta Digital</h2>
          <ol className="space-y-2">
            <li><strong>1.</strong> Baixe o app do banco escolhido</li>
            <li><strong>2.</strong> Informe CPF é dados pessoais</li>
            <li><strong>3.</strong> Tire foto do RG/CNH é uma selfie</li>
            <li><strong>4.</strong> Aguarde aprovacao (minutos a 24h)</li>
            <li><strong>5.</strong> Pronto! Conta aberta sem sair de casa</li>
          </ol>
          <p className="mt-4 text-sm text-gray-300">
            Dica: Abra conta em 2-3 bancos. Cada um tem vantagens diferentes é você pode 
            aproveitar o melhor de cada.
          </p>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Banco digital é seguro?",
                      "answer": "Sim, bancos digitais autorizados pelo Banco Central têm a mesma segurança é garantia FGC (até R$ 250.000) dos bancos tradicionais."
              },
              {
                      "question": "Qual o melhor banco digital?",
                      "answer": "Depende do seu perfil. Nubank é Inter são bons para conta gratuita. C6 é BTG para investimentos. Compare taxas é benefícios."
              },
              {
                      "question": "Banco digital cobra taxa?",
                      "answer": "A maioria oferece conta gratuita, cartão sem anuidade é transferências ilimitadas. Alguns serviços premium podem ter custo."
              },
              {
                      "question": "Posso ter conta em vários bancos digitais?",
                      "answer": "Sim, não há limite. Muitos usam múltiplas contas para organizar finanças (uma para gastos, outra para reserva, outra para investir)."
              }
      ]} />
    </ArticleLayout>
  );
}