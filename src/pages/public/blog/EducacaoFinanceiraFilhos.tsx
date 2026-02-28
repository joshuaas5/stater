import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function EducacaoFinanceiraFilhos() {
  const [idadeFilho, setIdadeFilho] = useState<string>("5");
  
  const licoesIdade: Record<string, {titulo: string; licoes: string[]; atividades: string[]}> = {
    "3-5": {
      titulo: "3 a 5 anos - Primeiros Conceitos",
      licoes: [
        "Dinheiro serve para trocar por coisas",
        "Esperar para ganhar algo (gratificação adiada)",
        "Diferença entre necessidades é desejos",
        "Moedas é notas têm valores diferentes"
      ],
      atividades: [
        "Cofrinho transparente para ver o dinheiro crescer",
        "Brincadeira de mercadinho em casa",
        "Deixar escolher entre duas opções no supermercado",
        "Contar moedinhas juntos"
      ]
    },
    "6-9": {
      titulo: "6 a 9 anos - Conceitos Básicos",
      licoes: [
        "Como os pais ganham dinheiro (trabalho)",
        "Poupar para objetivos específicos",
        "Troco é operações matemáticas com dinheiro",
        "Comparar preços entre produtos"
      ],
      atividades: [
        "Mesada semanal com planejamento",
        "Meta de economia para um brinquedo",
        "Participar das compras do supermercado",
        "Jogos de tabuleiro com dinheiro (Banco Imobiliário)"
      ]
    },
    "10-13": {
      titulo: "10 a 13 anos - Planejamento",
      licoes: [
        "Orçamento mensal da mesada",
        "Juros compostos (mostrar na prática)",
        "Diferença entre preço à vista é parcelado",
        "Publicidade é consumismo"
      ],
      atividades: [
        "Mesada mensal com responsabilidades",
        "Planilha simples de gastos",
        "Conta poupança no nome do filho",
        "Pesquisar preços online antes de comprar"
      ]
    },
    "14-17": {
      titulo: "14 a 17 anos - Finanças Reais",
      licoes: [
        "Como funciona cartão de crédito",
        "Impostos é salário líquido vs bruto",
        "Investimentos básicos (poupança, CDB, Tesouro)",
        "Dívidas é suas consequências"
      ],
      atividades: [
        "Primeiro emprego ou freela",
        "Cartão de débito próprio (com limites)",
        "Simulações de investimentos",
        "Participar de decisões financeiras da família"
      ]
    }
  };

  const errosComuns = [
    {
      erro: "Dar tudo que o filho pede",
      consequencia: "Não aprende a lidar com frustração nem a valorizar dinheiro",
      solucao: "Estabeleça limites claros é ensine a esperar"
    },
    {
      erro: "Esconder a situação financeira da família",
      consequencia: "Filho cresce sem noção da realidade",
      solucao: "Converse abertamente (adequado à idade) sobre finanças"
    },
    {
      erro: "Usar dinheiro como recompensa emocional",
      consequencia: "Associa dinheiro a afeto é aprovação",
      solucao: "Demonstre amor de outras formas, não com presentes"
    },
    {
      erro: "Não dar mesada",
      consequencia: "Perde oportunidade de ensinar gestão",
      solucao: "Mesada com responsabilidades é uma ferramenta educativa"
    },
    {
      erro: "Pagar todas as dívidas do filho",
      consequencia: "Não aprende consequências de más decisões",
      solucao: "Ajude a criar plano de pagamento, não pague por ele"
    }
  ];

  return (
    <ArticleLayout
      title="Educação Financeira para Filhos: Guia Completo por Idade"
      description="Aprenda a ensinar finanças para crianças é adolescentes. Dicas práticas por faixa etária, atividades educativas é erros a evitar."
      keywords={["educação financeira filhos", "mesada crianças", "ensinar dinheiro criança", "finanças para adolescentes", "como dar mesada"]}
      publishedDate="2026-02-04"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Educação Financeira"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Por Que Ensinar Finanças Desde Cedo?</h2>
          <p className="text-lg mb-4">
            Crianças que aprendem educação financeira desde cedo têm <strong>3x mais chance</strong> 
            de se tornarem adultos financeiramente saudáveis, segundo estudos da OCDE.
          </p>
      <QuickSummary 
        variant="purple"
        items={[
          { label: 'Mesada', value: 'Comece aos 6 anos com valor fixo semanal', icon: 'money' },
          { label: 'Divisão', value: 'Ensine: 50% gastar, 30% guardar, 20% doar', icon: 'target' },
          { label: 'Erros', value: 'Deixe errar com valores pequenos - é aprendizado', icon: 'check' },
          { label: 'Dica', value: 'Inclua nas decisões de compra da família', icon: 'lightbulb' },
        ]}
      />

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/20 border-4 border-green-500 p-4 text-center">
              <span className="text-4xl"></span>
              <p className="font-bold mt-2">Menos dívidas na vida adulta</p>
            </div>
            <div className="bg-blue-500/20 border-4 border-blue-500 p-4 text-center">
              <span className="text-4xl"></span>
              <p className="font-bold mt-2">Melhores decisões de consumo</p>
            </div>
            <div className="bg-yellow-500/20 border-4 border-yellow-500 p-4 text-center">
              <span className="text-4xl"></span>
              <p className="font-bold mt-2">Independência financeira mais cedo</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4">Selecione a Idade do seu Filho</h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.keys(licoesIdade).map((faixa) => (
              <button
                key={faixa}
                onClick={() => setIdadeFilho(faixa)}
                className={`px-4 py-2 border-4 border-black font-bold transition-all ${
                  idadeFilho === faixa 
                    ? "bg-black text-white" 
                    : "bg-slate-800 text-white hover:bg-gray-100"
                }`}
              >
                {faixa} anos
              </button>
            ))}
          </div>

          {idadeFilho && licoesIdade[idadeFilho] && (
            <div className="bg-slate-800 text-white border-4 border-black p-4">
              <h3 className="font-black text-xl mb-4">{licoesIdade[idadeFilho].titulo}</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-lg mb-2 text-blue-600"> O que ensinar:</h4>
                  <ul className="space-y-2">
                    {licoesIdade[idadeFilho].licoes.map((l, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500"></span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-lg mb-2 text-purple-600"> Atividades práticas:</h4>
                  <ul className="space-y-2">
                    {licoesIdade[idadeFilho].atividades.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-yellow-500"></span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Como Definir a Mesada</h2>
          
          <div className="bg-blue-500/10 text-white border-4 border-blue-500 p-4 mb-4">
            <h3 className="font-bold text-lg mb-2">Regra Prática: R$ 1 por ano de idade por semana</h3>
            <p>Ex: Criança de 8 anos = R$ 8/semana ou R$ 32/mês</p>
            <p className="text-sm text-gray-600 mt-2">Ajuste conforme sua realidade financeira!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-green-500 p-4">
              <h4 className="font-bold text-green-600 mb-2"> Mesada SIM vinculada a:</h4>
              <ul className="text-sm space-y-1">
                <li> Responsabilidades básicas (arrumar quarto, etc.)</li>
                <li> Respeitar regras da casa</li>
                <li> Comportamento adequado</li>
              </ul>
            </div>
            <div className="border-4 border-red-500 p-4">
              <h4 className="font-bold text-red-600 mb-2"> Mesada NÃO vinculada a:</h4>
              <ul className="text-sm space-y-1">
                <li> Notas escolares (usar outros incentivos)</li>
                <li> Tarefas domésticas extras (pagar à parte)</li>
                <li> Bom comportamento momentâneo</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-red-500/10 text-white border-4 border-red-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Erros Comuns dos Pais</h2>
          <div className="space-y-4">
            {errosComuns.map((item, i) => (
              <div key={i} className="bg-slate-800 text-white border-2 border-black p-3">
                <p className="font-bold text-red-600">Erro: {item.erro}</p>
                <p className="text-sm text-gray-600">Consequência: {item.consequencia}</p>
                <p className="text-sm text-green-600 font-medium">Solução: {item.solucao}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-green-100 to-blue-100 border-4 border-black p-6">
          <h2 className="text-2xl font-black mb-4">O Método dos 3 Potes</h2>
          <p className="mb-4">Ensine seu filho a dividir a mesada em três partes:</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800 text-white border-4 border-yellow-500 p-4 text-center">
              <span className="text-4xl"></span>
              <h4 className="font-bold mt-2">POUPAR (30%)</h4>
              <p className="text-sm">Para objetivos futuros</p>
            </div>
            <div className="bg-slate-800 text-white border-4 border-green-500 p-4 text-center">
              <span className="text-4xl"></span>
              <h4 className="font-bold mt-2">GASTAR (60%)</h4>
              <p className="text-sm">Uso livre do dinheiro</p>
            </div>
            <div className="bg-slate-800 text-white border-4 border-pink-500 p-4 text-center">
              <span className="text-4xl"></span>
              <h4 className="font-bold mt-2">DOAR (10%)</h4>
              <p className="text-sm">Ajudar quem precisa</p>
            </div>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Dica de Ouro</h2>
          <p className="text-lg">
            O melhor ensinamento é o <strong>exemplo</strong>. Crianças aprendem muito mais 
            observando como os pais lidam com dinheiro do que ouvindo palestras.
            Seja transparente, mostre suas decisões financeiras é explique seu raciocínio.
          </p>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Com que idade começar a ensinar sobre dinheiro?",
                      "answer": "A partir dos 3-4 anos já é possível introduzir conceitos básicos. Aos 6-7 anos, a criança pode começar a receber mesada é aprender a poupar."
              },
              {
                      "question": "Qual o valor ideal de mesada por idade?",
                      "answer": "Uma referência é R$ 1 por semana para cada ano de idade (7 anos = R$ 7/semana). Adapte à realidade familiar."
              },
              {
                      "question": "Mesada deve ser vinculada a tarefas?",
                      "answer": "Tarefas básicas (arrumar quarto) são obrigação sem pagamento; tarefas extras (lavar carro) podem gerar renda adicional."
              },
              {
                      "question": "Como ensinar criança a poupar?",
                      "answer": "Use cofrinhos transparentes, defina metas visuais, comemore conquistas é dê o exemplo poupando também."
              }
      ]} />
    </ArticleLayout>
  );
}