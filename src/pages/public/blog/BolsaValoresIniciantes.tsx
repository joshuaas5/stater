import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function BolsaValoresIniciantes() {
  const [valorInvestir, setValorInvestir] = useState<string>("1000");
  const [perfilRisco, setPerfilRisco] = useState<string>("moderado");

  const perfis: Record<string, {nome: string; alocacao: Record<string, number>; descricao: string}> = {
    conservador: {
      nome: "Conservador",
      alocacao: { "Renda Fixa": 70, "FIIs": 20, "Ações": 10 },
      descricao: "Prioriza segurança. Cresce devagar, mas com menos risco."
    },
    moderado: {
      nome: "Moderado",
      alocacao: { "Renda Fixa": 50, "FIIs": 25, "Ações": 25 },
      descricao: "Equilíbrio entre segurança é rentabilidade."
    },
    arrojado: {
      nome: "Arrojado",
      alocacao: { "Renda Fixa": 30, "FIIs": 20, "Ações": 50 },
      descricao: "Busca maior rentabilidade, aceita mais volatilidade."
    }
  };

  const perfilAtual = perfis[perfilRisco];
  const valor = parseFloat(valorInvestir) || 1000;

  const termosBasicos = [
    { termo: "Ação", significado: "Pedaço de uma empresa. Você vira sócio." },
    { termo: "B3", significado: "Bolsa de Valores do Brasil (antiga Bovespa)." },
    { termo: "Dividendo", significado: "Parte do lucro que a empresa paga aos acionistas." },
    { termo: "Corretora", significado: "Intermediária para comprar é vender na Bolsa." },
    { termo: "Home Broker", significado: "Plataforma para negociar ações pela internet." },
    { termo: "FII", significado: "Fundo Imobiliário. Você investe em imóveis coletivamente." },
    { termo: "ETF", significado: "Fundo que replica um índice (ex: BOVA11 = Ibovespa)." },
    { termo: "Ibovespa", significado: "Principal índice da Bolsa brasileira." }
  ];

  const acoesFamosas = [
    { codigo: "PETR4", nome: "Petrobras", setor: "Petróleo", dividendos: "Alta" },
    { codigo: "VALE3", nome: "Vale", setor: "Mineração", dividendos: "Alta" },
    { codigo: "ITUB4", nome: "Itaú", setor: "Bancos", dividendos: "Média" },
    { codigo: "BBDC4", nome: "Bradesco", setor: "Bancos", dividendos: "Média" },
    { codigo: "WEGE3", nome: "WEG", setor: "Indústria", dividendos: "Baixa" },
    { codigo: "MGLU3", nome: "Magazine Luiza", setor: "Varejo", dividendos: "Baixa" }
  ];

  return (
    <ArticleLayout
      title="Bolsa de Valores para Iniciantes: Guia Completo 2026"
      description="Aprenda a investir na Bolsa de Valores do zero. Termos básicos, como escolher ações, perfil de investidor é primeiros passos."
      keywords={["bolsa de valores", "como investir em ações", "B3 para iniciantes", "comprar ações", "investir na bolsa"]}
      publishedDate="2026-02-04"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Investimentos"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">O Que é a Bolsa de Valores?</h2>
          <p className="text-lg mb-4">
            A Bolsa de Valores é um mercado onde se compram é vendem <strong>ações de empresas</strong>.
            Quando você compra uma ação, você se torna <strong>sócio</strong> daquela empresa.
          </p>
      <QuickSummary 
        variant="green"
        items={[
          { label: 'Mínimo', value: 'R$10 em ações fracionárias - não precisa de muito', icon: 'money' },
          { label: 'Primeiro', value: 'Abra conta em corretora gratuita (Clear, Rico, Nu)', icon: 'check' },
          { label: 'Risco', value: 'Só invista o que não precisa nos próximos 5 anos', icon: 'alert' },
          { label: 'Dica', value: 'Comece por ETFs como BOVA11 para diversificar fácil', icon: 'lightbulb' },
        ]}
      />

          <div className="bg-yellow-500/20 border-4 border-yellow-500 p-4">
            <p className="font-bold">
               No Brasil, a Bolsa se chama <strong>B3</strong> (Brasil, Bolsa, Balcão).
              Qualquer pessoa pode investir, mesmo com pouco dinheiro!
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Dicionário do Investidor</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {termosBasicos.map((t, i) => (
              <div key={i} className="bg-gray-100 border-2 border-black p-3">
                <span className="font-black text-blue-600">{t.termo}:</span>
                <span className="ml-2">{t.significado}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-100 to-green-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4"> Simulador de Alocação</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Quanto quer investir? (R$)</label>
              <input
                type="number"
                value={valorInvestir}
                onChange={(e) => setValorInvestir(e.target.value)}
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Seu Perfil de Risco</label>
              <select
                value={perfilRisco}
                onChange={(e) => setPerfilRisco(e.target.value)}
                className="w-full p-3 border-4 border-black"
              >
                <option value="conservador">Conservador</option>
                <option value="moderado">Moderado</option>
                <option value="arrojado">Arrojado</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-800 text-white border-4 border-black p-4">
            <h3 className="font-black text-xl mb-2">Perfil {perfilAtual.nome}</h3>
            <p className="text-gray-600 mb-4">{perfilAtual.descricao}</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(perfilAtual.alocacao).map(([tipo, pct]) => (
                <div key={tipo} className="bg-blue-500/10 text-white border-2 border-blue-500 p-3 text-center">
                  <p className="font-bold">{tipo}</p>
                  <p className="text-2xl font-black text-blue-600">{pct}%</p>
                  <p className="text-sm">R$ {((valor * pct) / 100).toLocaleString("pt-BR", {maximumFractionDigits: 0})}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Ações Mais Famosas da B3</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-2">Código</th>
                  <th className="p-2">Empresa</th>
                  <th className="p-2">Setor</th>
                  <th className="p-2">Dividendos</th>
                </tr>
              </thead>
              <tbody>
                {acoesFamosas.map((a, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-100" : "bg-slate-800 text-white"}>
                    <td className="p-2 font-mono font-bold">{a.codigo}</td>
                    <td className="p-2">{a.nome}</td>
                    <td className="p-2">{a.setor}</td>
                    <td className="p-2">{a.dividendos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-emerald-500/10 text-white border-4 border-green-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Como Começar a Investir</h2>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="bg-emerald-500/10 text-white w-8 h-8 flex items-center justify-center font-black shrink-0">1</span>
              <span><strong>Abra conta em uma corretora</strong> - Rico, XP, Clear, Nubank, etc. (grátis)</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-emerald-500/10 text-white w-8 h-8 flex items-center justify-center font-black shrink-0">2</span>
              <span><strong>Transfira dinheiro</strong> via TED ou PIX para a corretora</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-emerald-500/10 text-white w-8 h-8 flex items-center justify-center font-black shrink-0">3</span>
              <span><strong>Acesse o Home Broker</strong> é pesquise o código da ação (ex: PETR4)</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-emerald-500/10 text-white w-8 h-8 flex items-center justify-center font-black shrink-0">4</span>
              <span><strong>Envie ordem de compra</strong> com quantidade é preço</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-emerald-500/10 text-white w-8 h-8 flex items-center justify-center font-black shrink-0">5</span>
              <span><strong>Acompanhe seus investimentos</strong> é receba dividendos!</span>
            </li>
          </ol>
        </section>

        <section className="bg-red-500/10 text-white border-4 border-red-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Erros de Iniciante</h2>
          <ul className="space-y-2">
            <li> <strong>Investir sem reserva de emergência</strong> - Primeiro junte 6 meses de gastos</li>
            <li> <strong>Seguir "dicas quentes"</strong> - Estude antes de investir</li>
            <li> <strong>Olhar todo dia</strong> - Bolsa oscila, paciência é essencial</li>
            <li> <strong>Colocar tudo em uma ação</strong> - Diversifique sempre</li>
            <li> <strong>Vender no pânico</strong> - Quedas fazem parte do processo</li>
          </ul>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Custos para Investir na Bolsa</h2>
          <ul className="space-y-2">
            <li> <strong>Corretagem:</strong> Muitas corretoras cobram R$ 0 (zero)</li>
            <li> <strong>Custódia:</strong> Geralmente grátis nas corretoras digitais</li>
            <li> <strong>Emolumentos B3:</strong> ~0,03% sobre cada operação</li>
            <li> <strong>IR sobre lucro:</strong> 15% (day trade: 20%)</li>
            <li> <strong>Dividendos:</strong> Isentos de IR!</li>
          </ul>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Quanto preciso para começar na Bolsa?",
                      "answer": "Você pode começar com qualquer valor. Algumas ações custam menos de R$ 10 é há ETFs como BOVA11 por cerca de R$ 100."
              },
              {
                      "question": "Investir em ações é arriscado?",
                      "answer": "Ações têm mais volatilidade, mas no longo prazo (10+ anos) historicamente superam outros investimentos."
              },
              {
                      "question": "Como escolher boas ações?",
                      "answer": "Analise lucros consistentes, baixo endividamento, pagamento de dividendos é vantagens competitivas."
              },
              {
                      "question": "Pago imposto sobre lucro em ações?",
                      "answer": "Vendas até R$ 20.000/mês são isentas. Acima disso, paga-se 15% sobre o lucro. Dividendos são isentos."
              }
      ]} />
    </ArticleLayout>
  );
}