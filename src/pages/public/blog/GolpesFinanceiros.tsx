import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function GolpesFinanceiros() {
  const [tipoGolpe, setTipoGolpe] = useState<string>("pix");

  const golpes: Record<string, {
    nome: string;
    descricao: string;
    comoFunciona: string[];
    sinais: string[];
    comoEvitar: string[];
  }> = {
    pix: {
      nome: "Golpe do PIX",
      descricao: "Criminosos usam engenharia social para convencer vítimas a fazer transferências.",
      comoFunciona: [
        "Ligam fingindo ser do banco alertando sobre 'movimentação suspeita'",
        "Pedem para fazer PIX para 'conta segura' para proteger dinheiro",
        "Enviam link falso para 'cancelar' transação",
        "Clonam WhatsApp é pedem dinheiro para contatos"
      ],
      sinais: [
        "Banco NUNCA pede para fazer PIX por telefone",
        "Pressão para agir rápido, sem pensar",
        "Links por SMS ou WhatsApp",
        "Pedidos de senha ou código de segurança"
      ],
      comoEvitar: [
        "Desligue é ligue você mesmo para o banco",
        "Nunca faça PIX a pedido de ligação",
        "Ative verificação em duas etapas no WhatsApp",
        "Desconfie de urgência extrema"
      ]
    },
    investimento: {
      nome: "Pirâmide Financeira",
      descricao: "Promessas de rendimentos absurdos que pagam antigos investidores com dinheiro de novos.",
      comoFunciona: [
        "Prometem rendimentos de 2-10% ao mês, garantidos",
        "Pagam certinho no início para ganhar confiança",
        "Incentivam a trazer amigos é família",
        "Quando para de entrar dinheiro novo, colapsam"
      ],
      sinais: [
        "Rendimento muito acima do mercado (CDI está em ~13% ao ANO)",
        "Sem registro na CVM",
        "Empresa sem histórico ou sede física",
        "Pressão para investir rápido"
      ],
      comoEvitar: [
        "Se parece bom demais, é golpe",
        "Verifique registro na CVM",
        "Pesquise no Reclame Aqui",
        "Diversifique, nunca coloque tudo em um lugar"
      ]
    },
    cartao: {
      nome: "Golpe do Cartão",
      descricao: "Roubo de dados do cartão para fazer compras fraudulentas.",
      comoFunciona: [
        "Sites falsos que imitam lojas conhecidas",
        "Maquininhas adulteradas em comércios",
        "Ligações pedindo dados do cartão",
        "Phishing por e-mail com links maliciosos"
      ],
      sinais: [
        "Site sem HTTPS ou com URL estranha",
        "E-mails de bancos com erros de português",
        "Ofertas absurdamente baratas",
        "Pedidos de CVV por telefone"
      ],
      comoEvitar: [
        "Use cartão virtual para compras online",
        "Ative notificações de transações",
        "Não salve dados do cartão em sites",
        "Verifique a URL antes de comprar"
      ]
    },
    emprestimo: {
      nome: "Golpe do Empréstimo Fácil",
      descricao: "Pedem taxa antecipada para liberar empréstimo que nunca vem.",
      comoFunciona: [
        "Oferecem empréstimo para negativados sem consulta",
        "Pedem depósito antecipado para 'liberar' o crédito",
        "Usam nomes de bancos conhecidos",
        "Depois do pagamento, somem"
      ],
      sinais: [
        "Empréstimo sem análise de crédito",
        "Taxa antecipada obrigatória",
        "Contato apenas por WhatsApp",
        "CNPJ inexistente ou de outra empresa"
      ],
      comoEvitar: [
        "Banco NUNCA pede taxa antecipada",
        "Verifique CNPJ no site da Receita",
        "Procure a instituição nos canais oficiais",
        "Desconfie de aprovação instantânea"
      ]
    },
    boleto: {
      nome: "Golpe do Boleto Falso",
      descricao: "Boletos adulterados direcionam pagamento para conta de criminosos.",
      comoFunciona: [
        "Interceptam e-mail com boleto verdadeiro",
        "Alteram código de barras mantendo visual",
        "Enviam boleto falso de serviços como Netflix, internet",
        "Ligam fingindo ser empresa para 'corrigir' boleto"
      ],
      sinais: [
        "Dados do beneficiário diferentes",
        "E-mail remetente suspeito",
        "Código de barras que não funciona",
        "Urgência para pagar imediatamente"
      ],
      comoEvitar: [
        "Confira os 3 primeiros números (código do banco)",
        "Verifique o beneficiário antes de pagar",
        "Baixe boletos apenas do site oficial",
        "Use DDA (Débito Direto Autorizado)"
      ]
    }
  };

  const estatisticas = [
    { dado: "R$ 2,5 bilhões", descricao: "Perdidos em golpes financeiros em 2023" },
    { dado: "1,8 milhão", descricao: "Tentativas de golpe por dia no Brasil" },
    { dado: "208%", descricao: "Aumento de golpes do PIX desde 2020" },
    { dado: "70%", descricao: "Das vítimas têm mais de 40 anos" }
  ];

  const golpeAtual = golpes[tipoGolpe];

  return (
    <ArticleLayout
      title="Golpes Financeiros 2026: Como Identificar é Se Proteger"
      description="Conheça os principais golpes financeiros do momento: PIX, pirâmide, cartão, empréstimo falso. Aprenda a se proteger."
      keywords={["golpes financeiros", "golpe do PIX", "pirâmide financeira", "como evitar golpes", "fraude bancária"]}
      publishedDate="2026-02-04"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Segurança"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Epidemia de Golpes no Brasil</h2>
          <p className="text-lg mb-4">
            O Brasil é um dos países com <strong>mais golpes financeiros</strong> do mundo. 
            Em 2023, foram <strong>bilhões perdidos</strong> por brasileiros em fraudes.
          </p>
      <QuickSummary 
        variant="red"
        items={[
          { label: 'Comum', value: 'Falso funcionário de banco, PIX errado, link falso', icon: 'alert' },
          { label: 'Regra', value: 'Banco NUNCA pede senha, código ou transferência', icon: 'shield' },
          { label: 'Cheque', value: 'Na dúvida, desligue é ligue VOCÊ para o banco', icon: 'check' },
          { label: 'Dica', value: 'Desconfie de urgência é ofertas boas demais', icon: 'lightbulb' },
        ]}
      />

          <div className="grid md:grid-cols-4 gap-4">
            {estatisticas.map((e, i) => (
              <div key={i} className="bg-red-500/20 border-4 border-red-500 p-4 text-center">
                <p className="text-2xl font-black text-red-600">{e.dado}</p>
                <p className="text-sm">{e.descricao}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-gray-100 to-gray-200 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4"> Tipos de Golpes</h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(golpes).map(([key, g]) => (
              <button
                key={key}
                onClick={() => setTipoGolpe(key)}
                className={`px-4 py-2 border-4 border-black font-bold transition-all ${
                  tipoGolpe === key 
                    ? "bg-red-500 text-white" 
                    : "bg-slate-800 text-white hover:bg-gray-100"
                }`}
              >
                {g.nome}
              </button>
            ))}
          </div>

          <div className="bg-slate-800 text-white border-4 border-black p-4">
            <h3 className="font-black text-2xl mb-2 text-red-600">{golpeAtual.nome}</h3>
            <p className="text-lg mb-4">{golpeAtual.descricao}</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-yellow-500/10 text-white border-2 border-yellow-500 p-3">
                <h4 className="font-bold text-yellow-700 mb-2"> Como Funciona:</h4>
                <ul className="text-sm space-y-1">
                  {golpeAtual.comoFunciona.map((c, i) => (
                    <li key={i}> {c}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-red-500/10 text-white border-2 border-red-500 p-3">
                <h4 className="font-bold text-red-700 mb-2"> Sinais de Alerta:</h4>
                <ul className="text-sm space-y-1">
                  {golpeAtual.sinais.map((s, i) => (
                    <li key={i}> {s}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-emerald-500/10 text-white border-2 border-green-500 p-3">
                <h4 className="font-bold text-green-700 mb-2"> Como se Proteger:</h4>
                <ul className="text-sm space-y-1">
                  {golpeAtual.comoEvitar.map((e, i) => (
                    <li key={i}> {e}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-500/20 border-4 border-blue-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Regras de Ouro Anti-Golpe</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800 text-white border-2 border-black p-3">
              <p className="font-bold">1. DESCONFIE SEMPRE</p>
              <p className="text-sm">Se parece bom demais para ser verdade, provavelmente é golpe</p>
            </div>
            <div className="bg-slate-800 text-white border-2 border-black p-3">
              <p className="font-bold">2. NUNCA TENHA PRESSA</p>
              <p className="text-sm">Golpistas criam urgência para você não pensar</p>
            </div>
            <div className="bg-slate-800 text-white border-2 border-black p-3">
              <p className="font-bold">3. VERIFIQUE POR OUTRO CANAL</p>
              <p className="text-sm">Recebeu ligação do banco? Desligue é ligue você</p>
            </div>
            <div className="bg-slate-800 text-white border-2 border-black p-3">
              <p className="font-bold">4. NUNCA PASSE SENHAS</p>
              <p className="text-sm">Nenhuma instituição pede senha por telefone</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Caí em um Golpe. E Agora?</h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <span className="bg-red-500/10 text-white w-10 h-10 flex items-center justify-center font-black text-xl shrink-0">1</span>
              <div>
                <p className="font-bold">Bloqueie tudo imediatamente</p>
                <p className="text-sm">Cartões, contas, acesso ao app do banco</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="bg-red-500/10 text-white w-10 h-10 flex items-center justify-center font-black text-xl shrink-0">2</span>
              <div>
                <p className="font-bold">Faça Boletim de Ocorrência</p>
                <p className="text-sm">Pode ser online na Delegacia Virtual do seu estado</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="bg-red-500/10 text-white w-10 h-10 flex items-center justify-center font-black text-xl shrink-0">3</span>
              <div>
                <p className="font-bold">Contate o banco em até 24h</p>
                <p className="text-sm">Para PIX, existe o MED (Mecanismo Especial de Devolução)</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="bg-red-500/10 text-white w-10 h-10 flex items-center justify-center font-black text-xl shrink-0">4</span>
              <div>
                <p className="font-bold">Registre no Banco Central</p>
                <p className="text-sm">bcb.gov.br - ajuda a rastrear os golpistas</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span className="bg-red-500/10 text-white w-10 h-10 flex items-center justify-center font-black text-xl shrink-0">5</span>
              <div>
                <p className="font-bold">Avise familiares é amigos</p>
                <p className="text-sm">Golpistas podem usar seus dados para atacar seus contatos</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4"> Canais de Denúncia</h2>
          <ul className="space-y-2">
            <li> <strong>Seu banco:</strong> SAC ou canal de fraudes</li>
            <li> <strong>Delegacia Virtual:</strong> delegaciavirtual.sinesp.gov.br</li>
            <li> <strong>Banco Central:</strong> bcb.gov.br/meubc</li>
            <li> <strong>Procon:</strong> Do seu estado</li>
            <li> <strong>SaferNet:</strong> denunciar golpes online</li>
          </ul>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Como identificar um golpe financeiro?",
                      "answer": "Sinais de alerta: promessas de retornos muito acima do mercado, pressão para decidir rápido, pedidos de senhas ou dados pessoais."
              },
              {
                      "question": "O que fazer se cair em um golpe?",
                      "answer": "1) Registre boletim de ocorrência. 2) Contate seu banco. 3) Bloqueie cartões. 4) Mude senhas. 5) Denuncie no consumidor.gov.br."
              },
              {
                      "question": "Como recuperar dinheiro de golpe do PIX?",
                      "answer": "Acione o MED (Mecanismo Especial de Devolução) pelo seu banco em até 80 dias."
              },
              {
                      "question": "Quais os golpes mais comuns em 2024?",
                      "answer": "Golpe do PIX falso, phishing por WhatsApp/SMS, falso funcionário do banco, pirâmides financeiras, boletos falsos."
              }
      ]} />
    </ArticleLayout>
  );
}