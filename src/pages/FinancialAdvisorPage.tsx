
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { isLoggedIn } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '@/hooks/use-translation';
import { fetchGeminiFlashLite } from '@/utils/gemini';

import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const IA_AVATAR = '/ia-avatar.svg'; // Coloque um SVG bonito na public/

const FinancialAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      text: `Olá! Eu sou o Consultor IA 🤖. Pergunte sobre finanças ou registre receitas/despesas. Tudo será confirmado antes de registrar!`,
      sender: "ia",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<null | { tipo: string, dados: any }>(null);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
    setShowSuggestions(false);
  };
  
  // Detectar intenção de registro na resposta da IA
  function parseConfirmationIntent(text: string) {
    // Simples: IA sempre diz "Confirma o registro de ...?"
    const match = text.match(/Confirma o registro de (uma|um)?\s?([\w\W]+?)\?/i);
    if (match) {
      // Exemplo: "uma saída de R$50 em mercado"
      return match[2];
    }
    return null;
  }

  // Função para enviar mensagem para Gemini 2.0 Flash Lite
  import { fetchGeminiFlashLite } from '@/utils/gemini';
  const getGeminiResponse = async (prompt: string): Promise<string> => {
    try {
      const response = await fetchGeminiFlashLite(prompt);
      if (!response || response.length < 5) {
        return 'Desculpe, não consegui encontrar uma resposta adequada. Pode reformular sua pergunta?';
      }
      return response;
    } catch (e: any) {
      return 'Houve um erro ao acessar a IA. Tente novamente em instantes.';
    }
  };

  const handleSendMessage = async (message: string) => {
  const lowerMsg = message.trim().toLowerCase();

  // Se aguardando confirmação e usuário diz sim
  if (waitingConfirmation && pendingAction && lowerMsg.startsWith('sim')) {
    setLoading(true);
    setError("");
    // Exemplo: pendingAction.tipo = 'saida', dados = { valor, categoria, ... }
    try {
      // Aqui você pode adaptar para entrada/saída/conta conforme seu schema
      if (pendingAction.tipo === 'entrada' || pendingAction.tipo === 'saída' || pendingAction.tipo === 'saida') {
        const { valor, categoria, descricao } = pendingAction.dados;
        await supabase.from('transactions').insert([
          {
            type: pendingAction.tipo === 'entrada' ? 'income' : 'expense',
            amount: valor,
            category: categoria,
            title: descricao || categoria,
            created_at: new Date().toISOString(),
            // Adicione outros campos necessários
          }
        ]);
        setMessages((msgs) => ([
          ...msgs,
          { id: uuidv4(), text: '✅ Registro efetuado com sucesso!', sender: 'ia', timestamp: new Date() }
        ]));
      } else if (pendingAction.tipo === 'conta') {
        // Exemplo para contas
        const { valor, descricao, vencimento } = pendingAction.dados;
        await supabase.from('bills').insert([
          {
            amount: valor,
            title: descricao,
            due_date: vencimento,
            created_at: new Date().toISOString(),
            // Outros campos
          }
        ]);
        setMessages((msgs) => ([
          ...msgs,
          { id: uuidv4(), text: '✅ Conta registrada com sucesso!', sender: 'ia', timestamp: new Date() }
        ]));
      }
      setPendingAction(null);
      setWaitingConfirmation(false);
    } catch (e) {
      setError('Erro ao registrar no banco.');
    } finally {
      setLoading(false);
    }
    return;
  }

  // Se aguardando confirmação e usuário diz não
  if (waitingConfirmation && lowerMsg.startsWith('não') || lowerMsg.startsWith('nao')) {
    setMessages((msgs) => ([
      ...msgs,
      { id: uuidv4(), text: 'Registro cancelado.', sender: 'ia', timestamp: new Date() }
    ]));
    setPendingAction(null);
    setWaitingConfirmation(false);
    return;
  }

  // Enviar mensagem para IA normalmente
  setLoading(true);
  setError("");
  setMessages((msgs) => ([...msgs, { id: uuidv4(), text: message, sender: 'user', timestamp: new Date() }]));
  // Envio para Gemini via API
  try {
    setLoading(true);
    setError("");
    const respostaIA = await getGeminiResponse(message);
    setLoading(false);

    // Se Gemini pedir confirmação
    const intent = parseConfirmationIntent(respostaIA);
    if (intent) {
      setMessages((prevMessages: ChatMessage[]) => [
        ...prevMessages,
        {
          id: uuidv4(),
          text: respostaIA,
          sender: "ia",
          timestamp: new Date()
        }
      ]);
      // Exemplo de parsing: "uma saída de R$50 em mercado" => { tipo: 'saída', valor: 50, categoria: 'mercado' }
      // Aqui simplificamos: Gemini deve retornar JSON ou string fácil de parsear
      // Suponha que Gemini retorna: "Confirma o registro de uma saída de R$50 em mercado? {\"tipo\":\"saída\",\"valor\":50,\"categoria\":\"mercado\"}"
      let dados: any = {};
      try {
        const jsonMatch = respostaIA.match(/\{.*\}$/);
        if (jsonMatch) {
          dados = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // fallback: não conseguiu parsear JSON
      }
      setPendingAction({ tipo: dados.tipo || 'saída', dados });
      setWaitingConfirmation(true);
      return;
    }
    // Resposta normal da IA
    setMessages((prevMessages: ChatMessage[]) => [
      ...prevMessages,
      {
        id: uuidv4(),
        text: respostaIA,
        sender: "ia",
        timestamp: new Date()
      }
    ]);
  } catch (e) {
    setError('Erro ao se comunicar com a IA.');
    setLoading(false);
  }

    // 3. Como criar um orçamento?
    if (
      lowerMsg.includes("criar um orçamento") ||
      lowerMsg.includes("montar orçamento") ||
      lowerMsg.includes("planejar orçamento") ||
      lowerMsg.match(/como (faço|fazer) um orçamento/) ||
      lowerMsg.match(/dicas.*orçamento/)
    ) {
      getDataUtils().then(({ transactions, calculateBalance, formatCurrency }) => {
        const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        let resp = "Para criar um orçamento eficiente:\n";
        resp += "1. Liste todas as suas receitas e despesas mensais.\n";
        resp += `2. Sua receita mensal registrada: ${formatCurrency(totalIncome)}.\n`;
        resp += "3. Defina limites para cada categoria.\n5. Monitore seus gastos e ajuste quando necessário.";
        const advisorResponse: ChatMessage = {
          id: uuidv4(),
          text: resp,
          sender: "system",
          timestamp: new Date()
        };
        setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      });
      return;
    }

    // 4. Devo investir ou pagar dívidas?
    if (
      lowerMsg.includes("investir ou pagar dívidas") ||
      lowerMsg.includes("investir ou pagar dividas") ||
      lowerMsg.includes("priorizar dívidas ou investimentos") ||
      lowerMsg.match(/(quitar|pagar) dívidas.*investir/) ||
      lowerMsg.match(/investimento.*dívida/)
    ) {
      let resp = "Se você possui dívidas com juros altos (ex: cartão de crédito), priorize quitá-las antes de investir. Após quitar dívidas caras, comece a investir para construir patrimônio.";
      resp += "\nAvalie sempre a taxa de juros das suas dívidas versus o rendimento esperado dos investimentos.";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }

    // 5. Como reduzir gastos com alimentação?
    if (
      lowerMsg.includes("reduzir gastos com alimentação") ||
      lowerMsg.includes("gasto com comida") ||
      lowerMsg.includes("gasto com restaurante") ||
      lowerMsg.match(/como economizar.*alimentação/) ||
      lowerMsg.match(/dicas.*supermercado/)
    ) {
      let resp = "Algumas dicas para reduzir gastos com alimentação:\n";
      resp += "• Planeje suas refeições e faça compras com lista.\n";
      resp += "• Prefira cozinhar em casa ao invés de pedir comida pronta.\n";
      resp += "• Evite desperdícios, aproveite sobras.\n";
      resp += "• Compare preços entre mercados e busque promoções.";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }

    // 6. Quanto devo guardar por mês?
    if (
      lowerMsg.includes("quanto devo guardar") ||
      lowerMsg.includes("quanto guardar todo mês") ||
      lowerMsg.includes("quanto economizar mensalmente") ||
      lowerMsg.match(/quanto.*guardar.*(mês|mensal)/) ||
      lowerMsg.match(/quanto.*poupar/)
    ) {
      getDataUtils().then(({ transactions, calculateBalance, formatCurrency }) => {
        const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        let suggested = totalIncome * 0.2;
        let resp = "O ideal é guardar cerca de 20% da sua renda mensal.\n";
        if (totalIncome > 0) {
          resp += `Com base na sua receita registrada (${formatCurrency(totalIncome)}), tente guardar ao menos ${formatCurrency(suggested)} por mês.`;
        } else {
          resp += "Registre suas receitas para obter uma sugestão personalizada.";
        }
        const advisorResponse: ChatMessage = {
          id: uuidv4(),
          text: resp,
          sender: "system",
          timestamp: new Date()
        };
        setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      });
      return;
    }

    // --- INTELIGÊNCIA EXPANDIDA: Respostas para dezenas de temas financeiros ---
    // Investimentos
    if (
      lowerMsg.includes("investir em renda fixa") ||
      lowerMsg.includes("investir em renda variável") ||
      lowerMsg.includes("tesouro direto") ||
      lowerMsg.match(/investir em (ações|fundos|cdb|lci|lca|tesouro|cripto)/) ||
      lowerMsg.match(/melhor investimento/) ||
      lowerMsg.match(/onde investir/)
    ) {
      let resp = "Investir depende do seu perfil e objetivos. Renda fixa (Tesouro Direto, CDB, LCI/LCA) é indicada para quem busca segurança. Renda variável (ações, fundos imobiliários, ETFs) oferece maior potencial de retorno, mas também mais risco. Diversifique e nunca invista sem conhecer o produto! Quer uma explicação sobre algum investimento específico?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Cartão de crédito
    if (
      lowerMsg.includes("cartão de crédito") ||
      lowerMsg.includes("fatura do cartão") ||
      lowerMsg.includes("melhor cartão") ||
      lowerMsg.match(/dicas.*cartão/) ||
      lowerMsg.match(/controle.*cartão/)
    ) {
      let resp = "Dica: sempre pague o valor total da fatura do cartão de crédito para evitar juros altos. Use o cartão como aliado, nunca como extensão da sua renda. Controle os gastos e evite parcelar compras desnecessárias. Quer dicas para escolher um cartão ou controlar melhor sua fatura?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // PIX, transferências e bancos digitais
    if (
      lowerMsg.includes("pix") ||
      lowerMsg.includes("transferência instantânea") ||
      lowerMsg.match(/como usar o pix/) ||
      lowerMsg.match(/banco digital/)
    ) {
      let resp = "O PIX revolucionou as transferências: é rápido, gratuito e funciona 24h. Bancos digitais oferecem praticidade e menos tarifas. Sempre confira os dados antes de transferir e evite cair em golpes! Quer saber como cadastrar uma chave PIX ou dicas de segurança?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Impostos e declaração de renda
    if (
      lowerMsg.includes("imposto de renda") ||
      lowerMsg.includes("declaração de imposto") ||
      lowerMsg.match(/como declarar/) ||
      lowerMsg.match(/preciso declarar/)
    ) {
      let resp = "O Imposto de Renda deve ser declarado anualmente por quem atingiu certos limites de renda, bens ou investimentos. Organize seus comprovantes, baixe o programa da Receita Federal e preencha com atenção. Dúvidas sobre deduções ou quem precisa declarar? Pergunte!";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Aposentadoria e INSS
    if (
      lowerMsg.includes("aposentadoria") ||
      lowerMsg.includes("inss") ||
      lowerMsg.match(/como me aposentar/) ||
      lowerMsg.match(/quanto vou receber de aposentadoria/)
    ) {
      let resp = "A aposentadoria depende do tempo de contribuição e valor recolhido ao INSS. Planeje-se cedo, contribua regularmente e avalie opções como previdência privada para complementar a renda. Quer simular sua aposentadoria ou entender as regras atuais?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Inflação, câmbio e economia
    if (
      lowerMsg.includes("inflação") ||
      lowerMsg.includes("câmbio") ||
      lowerMsg.includes("dólar") ||
      lowerMsg.includes("euro") ||
      lowerMsg.match(/como funciona a inflação/) ||
      lowerMsg.match(/por que o dólar sobe/)
    ) {
      let resp = "Inflação é o aumento generalizado dos preços, reduzindo o poder de compra. O câmbio (dólar, euro) varia conforme oferta, demanda e cenário global. Diversifique seus investimentos para se proteger da inflação e acompanhe indicadores econômicos! Quer saber como a inflação afeta seu dinheiro?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Renda extra e empreendedorismo
    if (
      lowerMsg.includes("renda extra") ||
      lowerMsg.includes("ganhar dinheiro") ||
      lowerMsg.includes("empreender") ||
      lowerMsg.match(/como fazer renda extra/) ||
      lowerMsg.match(/ideias para ganhar dinheiro/)
    ) {
      let resp = "Renda extra pode vir de freelas, vendas, ensino, economia colaborativa ou investimentos. Identifique suas habilidades e oportunidades no seu contexto. Empreender exige planejamento, pesquisa e controle financeiro. Quer dicas de renda extra ou abrir seu próprio negócio?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Educação financeira e hábitos
    if (
      lowerMsg.includes("educação financeira") ||
      lowerMsg.includes("organizar finanças") ||
      lowerMsg.includes("controle financeiro") ||
      lowerMsg.match(/como aprender finanças/) ||
      lowerMsg.match(/dicas de educação financeira/)
    ) {
      let resp = "Educação financeira é essencial para conquistar objetivos. Estude sobre orçamento, investimentos, dívidas e planejamento. O primeiro passo é registrar tudo o que entra e sai. Quer recomendações de livros, cursos ou canais sobre finanças?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Perguntas sobre salário, FGTS, direitos trabalhistas
    if (
      lowerMsg.includes("salário") ||
      lowerMsg.includes("fgts") ||
      lowerMsg.includes("direitos trabalhistas") ||
      lowerMsg.match(/como calcular salário/) ||
      lowerMsg.match(/13º salário/) ||
      lowerMsg.match(/férias proporcionais/)
    ) {
      let resp = "Salário, FGTS e direitos trabalhistas são garantidos por lei. O FGTS é depositado mensalmente pelo empregador e pode ser sacado em situações específicas. O 13º salário é pago no fim do ano. Tem dúvidas sobre descontos, férias ou rescisão? Pergunte!";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Consultas de saldo, extrato, histórico
    if (
      lowerMsg.match(/quanto tenho de saldo/) ||
      lowerMsg.match(/meu saldo/) ||
      lowerMsg.match(/meu extrato/) ||
      lowerMsg.match(/histórico de transações/) ||
      lowerMsg.match(/quanto gastei (este mês|no mês|essa semana|hoje)/)
    ) {
      getDataUtils().then(({ transactions, formatCurrency, calculateBalance }: { transactions: any[], formatCurrency: (value: number) => string, calculateBalance: (transactions: any[]) => number }) => {
        const saldo = calculateBalance(transactions);
        let resp = `Seu saldo atual é: ${formatCurrency(saldo)}.`;
        setMessages((prevMessages: ChatMessage[]) => [...prevMessages, {
          id: uuidv4(),
          text: resp,
          sender: "system",
          timestamp: new Date()
        }]);
      });
      return;
    }
    // Perguntas sobre boletos, contas a pagar, vencimentos
    if (
      lowerMsg.includes("conta a pagar") ||
      lowerMsg.includes("boleto") ||
      lowerMsg.includes("vencimento") ||
      lowerMsg.match(/próximas contas/) ||
      lowerMsg.match(/contas vencidas/)
    ) {
      const getBills = async () => {
        const { getBills } = await import('@/utils/localStorage');
        const { formatCurrency } = await import('@/utils/dataProcessing');
        const bills = getBills();
        if (!bills || bills.length === 0) {
          setMessages(prevMessages => [...prevMessages, {
            id: uuidv4(),
            text: "Você não possui contas a pagar registradas.",
            sender: "system",
            timestamp: new Date()
          }]);
          return;
        }
        const vencidas = bills.filter(b => !b.isPaid && new Date(b.dueDate) < new Date());
        const proximas = bills.filter(b => !b.isPaid && new Date(b.dueDate) >= new Date());
        let resp = '';
        if (vencidas.length > 0) {
          resp += `Contas vencidas:\n` + vencidas.map(b => `• ${b.title} (${formatCurrency(b.amount)}) - Venceu em ${new Date(b.dueDate).toLocaleDateString('pt-BR')}`).join('\n') + '\n';
        }
        if (proximas.length > 0) {
          resp += `Próximas contas:\n` + proximas.map(b => `• ${b.title} (${formatCurrency(b.amount)}) - Vence em ${new Date(b.dueDate).toLocaleDateString('pt-BR')}`).join('\n');
        }
        setMessages((prevMessages: ChatMessage[]) => [...prevMessages, {
          id: uuidv4(),
          text: resp,
          sender: "system",
          timestamp: new Date()
        }]);
      };
      getBills();
      return;
    }
    // Perguntas sobre parcelamentos
    if (
      lowerMsg.includes("parcelamento") ||
      lowerMsg.match(/parcelado/) ||
      lowerMsg.match(/quantas parcelas/)
    ) {
      let resp = "Compras parceladas devem ser planejadas! Sempre avalie o valor total (incluindo juros), o impacto nas próximas faturas e se a parcela cabe no seu orçamento. Quer ajuda para calcular ou controlar parcelas?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Perguntas sobre reserva de emergência
    if (
      lowerMsg.includes("reserva de emergência") ||
      lowerMsg.match(/quanto devo ter de reserva/) ||
      lowerMsg.match(/reserva financeira/)
    ) {
      let resp = "Sua reserva de emergência deve cobrir de 3 a 6 meses dos seus custos fixos. Mantenha esse valor em aplicações seguras e de alta liquidez, como Tesouro Selic ou CDB com liquidez diária. Quer ajuda para calcular sua reserva?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Perguntas sobre dívidas, renegociação, nome sujo
    if (
      lowerMsg.includes("nome sujo") ||
      lowerMsg.includes("serasa") ||
      lowerMsg.includes("negativado") ||
      lowerMsg.match(/como limpar meu nome/) ||
      lowerMsg.match(/renegociar dívida/)
    ) {
      let resp = "Se está negativado ou com o nome sujo, o primeiro passo é levantar todas as dívidas, priorizar as mais caras e buscar renegociação. Feirões do Serasa e bancos costumam oferecer descontos. Nunca aceite acordos que não cabem no seu orçamento! Precisa de um passo a passo para renegociar?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Perguntas sobre seguros (vida, carro, residência)
    if (
      lowerMsg.includes("seguro de vida") ||
      lowerMsg.includes("seguro de carro") ||
      lowerMsg.includes("seguro residencial") ||
      lowerMsg.match(/vale a pena seguro/)
    ) {
      let resp = "Seguros protegem seu patrimônio e sua família. Analise as coberturas, franquias e reputação da seguradora. Seguro de vida é importante se você tem dependentes. Seguro auto/residencial protege contra imprevistos. Quer ajuda para escolher um seguro?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Perguntas sobre planejamento familiar, filhos, educação
    if (
      lowerMsg.includes("planejamento familiar") ||
      lowerMsg.includes("filhos") ||
      lowerMsg.includes("poupança para filhos") ||
      lowerMsg.match(/como planejar família/) ||
      lowerMsg.match(/educação dos filhos/)
    ) {
      let resp = "Planejamento familiar envolve ajustar o orçamento, prever gastos com filhos e investir em educação. Comece a poupar cedo para garantir o futuro dos pequenos. Quer dicas para montar uma poupança para filhos ou planejar educação?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // Perguntas sobre doações, voluntariado, impacto social
    if (
      lowerMsg.includes("doação") ||
      lowerMsg.includes("voluntariado") ||
      lowerMsg.includes("impacto social") ||
      lowerMsg.match(/como doar/) ||
      lowerMsg.match(/ajudar o próximo/)
    ) {
      let resp = "Doar e praticar voluntariado faz bem para quem recebe e para quem doa! Planeje suas doações, escolha causas confiáveis e, se possível, dedique tempo também. Algumas doações podem ser deduzidas do Imposto de Renda. Quer saber como doar de forma segura?";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    // --- IA BÁSICA: Resposta automática para qualquer questão ---
    // 1. Tentar identificar palavras-chave financeiras
    const financialKeywords = [
      "gasto", "despesa", "receita", "investimento", "economizar", "guardar", "orçamento", "dívida", "cartão", "fatura", "poupança", "renda", "salário", "dinheiro", "juros", "pix", "imposto", "aposentadoria", "inflação", "câmbio", "fgts", "boleto", "parcelamento", "reserva", "seguro", "doação", "empreender", "educação financeira", "controle", "extrato", "saldo", "conta", "renda extra", "planejamento", "filhos", "doar", "voluntariado", "impacto social"];
    const educationKeywords = [
      "explica", "o que é", "como funciona", "significa", "diferença entre", "exemplo de", "exemplo", "exemplos", "detalhe", "detalhes"];
    const motivationalKeywords = [
      "motivar", "desanimado", "cansado", "difícil", "ajuda", "conselho", "dica de vida", "inspirar", "desistir", "ânimo", "motivação", "força"];

    // 2. Respostas automáticas baseadas em intenção
    if (financialKeywords.some(k => lowerMsg.includes(k))) {
      const resp =
        "Ótima pergunta! Gerenciar suas finanças é fundamental. Use as ferramentas do app para registrar receitas e despesas, acompanhar suas categorias de gasto, definir metas e buscar conhecimento. Se quiser uma análise personalizada, registre suas movimentações!";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    if (educationKeywords.some(k => lowerMsg.includes(k))) {
      const resp =
        "Claro! Sempre que quiser saber o significado de um termo ou conceito financeiro, é só perguntar. Por exemplo: orçamento é o planejamento dos seus ganhos e gastos. Se quiser uma explicação específica, detalhe sua dúvida!";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }
    if (motivationalKeywords.some(k => lowerMsg.includes(k))) {
      const resp =
        "Lembre-se: cuidar da sua vida financeira é um passo importante para realizar sonhos! Persistência e organização fazem toda a diferença. Conte comigo para te ajudar nessa jornada! 💪";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
      return;
    }

    // 3. Fallback: resposta com IA real (Hugging Face)
    const thinkingMsg: ChatMessage = {
      id: uuidv4(),
      text: "Pensando...",
      sender: "system",
      timestamp: new Date()
    };
    setMessages((prevMessages: ChatMessage[]) => [...prevMessages, thinkingMsg]);

    // Função antiga removida: integração agora é com Gemini 2.0 Flash Lite via fetchGeminiFlashLite.


    return (
      <div className="min-h-screen bg-galileo-background flex flex-col pb-16">
        {/* Header com design moderno e colorido */}
        <header className="sticky top-0 z-10 bg-galileo-accent text-white dark:bg-galileo-card dark:text-galileo-text shadow-md px-4 py-3 flex flex-col items-center mx-auto w-full border-b border-galileo-border">
          <div className="flex flex-row items-center gap-3 w-full max-w-xl justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
                <span className="text-white text-sm">💡</span>
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">Consultor IA</span>
                <span className="block text-xs text-blue-100">Assistente financeiro</span>
              </div>
            </div>
          </div>
        </header>

        {/* Container centralizado para o chat */}
        <main className="flex-1 w-full flex flex-col items-center px-3 sm:px-4 pt-4">
          <section className="w-full max-w-xl flex flex-col flex-1 bg-galileo-card rounded-xl shadow-lg overflow-hidden border border-galileo-border">
            <div className="flex-1 overflow-y-auto px-3 pt-3 pb-20" style={{ minHeight: '60vh' }}>
              <ChatMessages messages={messages} />
              {/* Loading animado */}
              {loading && (
                <div className="flex items-center gap-2 mt-2 animate-pulse">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={IA_AVATAR} alt="IA" />
                    <AvatarFallback>IA</AvatarFallback>
                  </Avatar>
                  <span className="text-galileo-text bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-2 rounded-2xl shadow-sm text-sm">Pensando...</span>
                  <Loader2 className="animate-spin text-blue-500" size={20} />
                </div>
              )}
              {/* Confirmação de registro */}
              {waitingConfirmation && pendingAction && (
                <div className="flex flex-col items-center mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={IA_AVATAR} alt="IA" />
                      <AvatarFallback>IA</AvatarFallback>
                    </Avatar>
                    <span className="text-sm bg-yellow-100 text-yellow-900 px-4 py-2 rounded-2xl border border-yellow-300 shadow-sm font-medium animate-fade-in">
                      Confirma o registro de <b>{pendingAction.dados?.descricao || pendingAction.dados?.categoria || 'transação'}</b>?
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold shadow transition-all"
                      onClick={() => handleSendMessage('sim')}
                      aria-label="Confirmar registro"
                    >Confirmar</button>
                    <button
                      className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold shadow transition-all"
                      onClick={() => handleSendMessage('não')}
                      aria-label="Cancelar registro"
                    >Cancelar</button>
                  </div>
                </div>
              )}
            </div>
            {/* Sugestões só aparecem se não estiver esperando confirmação ou loading */}
            {showSuggestions && !waitingConfirmation && !loading && (
              <div className="mb-3 px-3">
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="px-3 py-1.5 rounded-full bg-galileo-background hover:bg-galileo-accent text-galileo-text text-xs font-medium border border-galileo-border shadow-sm transition-all"
                      onClick={() => handleSuggestionClick(suggestion.text)}
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="sticky bottom-0 w-full bg-galileo-card pt-2 pb-3 px-3 border-t border-galileo-border z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
              <ChatInput onSubmit={(message: string) => handleSendMessage(message)} />
            </div>
          </section>
        </main>

        {/* NavBar fixa na parte inferior */}
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <NavBar />
        </div>
      </div>
    );
            </div>
          )}
          {/* Confirmação de registro */}
          {waitingConfirmation && pendingAction && (
            <div className="flex flex-col items-center mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={IA_AVATAR} alt="IA" />
                  <AvatarFallback>IA</AvatarFallback>
                </Avatar>
                <span className="text-sm bg-yellow-100 text-yellow-900 px-4 py-2 rounded-2xl border border-yellow-300 shadow-sm font-medium animate-fade-in">
                  Confirma o registro de <b>{pendingAction.dados?.descricao || pendingAction.dados?.categoria || 'transação'}</b>?
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold shadow transition-all"
                  onClick={() => handleSendMessage('sim')}
                  aria-label="Confirmar registro"
                >Confirmar</button>
                <button
                  className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold shadow transition-all"
                  onClick={() => handleSendMessage('não')}
                  aria-label="Cancelar registro"
                >Cancelar</button>
              </div>
            </div>
          )}
        </div>
        {/* Sugestões só aparecem se não estiver esperando confirmação ou loading */}
        {showSuggestions && !waitingConfirmation && !loading && (
          <div className="mb-3 px-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="px-3 py-1.5 rounded-full bg-galileo-background hover:bg-galileo-accent text-galileo-text text-xs font-medium border border-galileo-border shadow-sm transition-all"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="sticky bottom-0 w-full bg-galileo-card pt-2 pb-3 px-3 border-t border-galileo-border z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
          <ChatInput onSubmit={(message: string) => handleSendMessage(message)} />
        </div>
      </section>
    </main>

    {/* NavBar fixa na parte inferior */}
    <div className="fixed bottom-0 left-0 right-0 z-20">
      <NavBar />
    </div>
  </div>
);

// ... (rest of the code remains the same)
