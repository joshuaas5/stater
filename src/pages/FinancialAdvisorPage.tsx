
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

const FinancialAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      text: `Olá! Eu sou o Consultor IA. Registre receitas e despesas aqui. Se quiser, pergunte sobre seu dinheiro.`,
      sender: "system",
      timestamp: new Date()
    }
  ]);
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
    setShowSuggestions(false);
  };
  
  const handleSendMessage = async (message: string) => {
  const lowerMsg = message.trim().toLowerCase();

  // 1. Tentar registrar transação a partir do texto
  try {
    const { getCurrentUser } = await import('@/utils/localStorage');
    const { processChat } = await import('@/utils/dataProcessing');
    const user = getCurrentUser();
    if (user) {
      const transactions = processChat(message, user.id);
      if (transactions.length > 0) {
        // Montar resposta amigável para cada transação registrada
        const { formatCurrency } = await import('@/utils/dataProcessing');
        const summaries = transactions.map(tx => {
          const tipo = tx.type === 'income' ? 'entrada' : 'saída';
          return `✔️ ${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada: ${tx.title} - ${formatCurrency(tx.amount)} (${tx.category})`;
        }).join('\n');
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: uuidv4(),
            text: message,
            sender: "user",
            timestamp: new Date()
          },
          {
            id: uuidv4(),
            text: summaries,
            sender: "system",
            timestamp: new Date()
          }
        ]);
        return;
      }
    }
  } catch (e) {
    // Se der erro, segue fluxo normal
  }

  // Respostas personalizadas para identidade e sugestões
  if (["qual é o seu nome", "qual seu nome", "quem é você", "quem é vc", "quem é voce", "quem é vc?", "quem é você?", "quem é voce?", "seu nome", "o que você faz", "o que vc faz", "quem é o consultor ia", "quem é o consultor"].some(q => lowerMsg.includes(q))) {
    const advisorResponse: ChatMessage = {
      id: uuidv4(),
      text: "Eu sou o Consultor IA 🤖! Fui criado para te ajudar a organizar suas finanças, responder dúvidas, dar dicas e motivar você a conquistar seus objetivos financeiros.",
      sender: "system",
      timestamp: new Date()
    };
    setMessages(prevMessages => [...prevMessages, {
      id: uuidv4(),
      text: message,
      sender: "user",
      timestamp: new Date()
    }, advisorResponse]);
    return;
  }
  if (["dicas do que te perguntar", "exemplos de perguntas", "o que posso perguntar", "o que perguntar", "sugestão de pergunta", "sugestoes de perguntas", "dica de pergunta", "dicas de pergunta"].some(q => lowerMsg.includes(q))) {
    const advisorResponse: ChatMessage = {
      id: uuidv4(),
      text: `Aqui estão exemplos de perguntas e comandos que posso responder:\n
• Como posso economizar mais?\n• Quais são meus maiores gastos?\n• Como criar um orçamento?\n• Devo investir ou pagar dívidas?\n• Quanto devo guardar por mês?\n• O que é Tesouro Direto?\n• Como funciona o PIX?\n• Mostre meu saldo ou extrato\n• Dicas para ganhar renda extra\n\nMas minha principal recomendação é: registre suas receitas e despesas diretamente aqui no chat, de forma rápida e fácil! Basta digitar frases como \'gastei 50 reais no mercado\' ou \'recebi 1000 de salário\' e eu registro para você, tornando seu controle financeiro muito mais prático!\n\nAlém disso, posso tirar dúvidas, dar dicas e motivar você a conquistar sua saúde financeira.`,
      sender: "system",
      timestamp: new Date()
    };
    setMessages(prevMessages => [...prevMessages, {
      id: uuidv4(),
      text: message,
      sender: "user",
      timestamp: new Date()
    }, advisorResponse]);
    return;
  }
  const userMessage: ChatMessage = {
    id: uuidv4(),
    text: message,
    sender: "user",
    timestamp: new Date()
  };

  setMessages(prevMessages => [...prevMessages, userMessage]);

  setTimeout(() => {
    const lowerMsg = message.toLowerCase();

    // Função para buscar transações e utilidades
    const getDataUtils = async () => {
      const { getTransactions } = await import("@/utils/localStorage");
      const { calculateTotalByCategory, formatCurrency, calculateBalance } = await import("@/utils/dataProcessing");
      const transactions = getTransactions();
      return { transactions, calculateTotalByCategory, formatCurrency, calculateBalance };
    };

    // 1. Maiores gastos
    if (
      lowerMsg.includes("maiores gastos") ||
      lowerMsg.includes("gasto mais alto") ||
      lowerMsg.includes("top gastos") ||
      lowerMsg.includes("gasto principal") ||
      lowerMsg.match(/maior gasto (do mês|da semana|do dia)?/) ||
      lowerMsg.match(/gastei mais com/) ||
      lowerMsg.match(/gasto elevado/)
    ) {
      getDataUtils().then(({ transactions, calculateTotalByCategory, formatCurrency }) => {
        const expenses = transactions.filter((t: any) => t.type === 'expense');
        const totals = calculateTotalByCategory(expenses);
        const sorted = Object.entries(totals)
          .filter(([_, value]) => value < 0)
          .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
          .slice(0, 3);
        let resp = "Aqui estão suas maiores categorias de gasto:";
        if (sorted.length === 0) {
          resp = "Não encontrei despesas registradas para analisar.";
        } else {
          resp += "\n" + sorted.map(([cat, value]) => `• ${cat}: ${formatCurrency(Math.abs(value))}`).join("\n");
        }
        const advisorResponse: ChatMessage = {
          id: uuidv4(),
          text: resp,
          sender: "system",
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, advisorResponse]);
      });
      return;
    }

    // 2. Como posso economizar mais?
    if (
      lowerMsg.includes("como posso economizar") ||
      lowerMsg.includes("dicas para economizar") ||
      lowerMsg.includes("como gastar menos") ||
      lowerMsg.includes("como reduzir despesas") ||
      lowerMsg.includes("como cortar gastos") ||
      lowerMsg.match(/economizar (dinheiro|mais)/) ||
      lowerMsg.match(/reduzir (gastos|despesas)/)
    ) {
      getDataUtils().then(({ transactions, calculateTotalByCategory, formatCurrency }) => {
        const expenses = transactions.filter((t: any) => t.type === 'expense');
        const totals = calculateTotalByCategory(expenses);
        const sorted = Object.entries(totals)
          .filter(([_, value]) => value < 0)
          .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
          .slice(0, 2);
        let resp = "Aqui vão algumas dicas para economizar mais:\n";
        if (sorted.length > 0) {
          resp += sorted
            .map(([cat]) => `• Revise seus gastos em ${cat}. Às vezes, pequenas mudanças em categorias frequentes trazem grande economia.`)
            .join("\n");
        } else {
          resp += "• Registre suas despesas para receber dicas personalizadas.";
        }
        resp += "\n• Estabeleça metas de economia mensais.\n• Evite compras por impulso e revise assinaturas recorrentes.";
        const advisorResponse: ChatMessage = {
          id: uuidv4(),
          text: resp,
          sender: "system",
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, advisorResponse]);
      });
      return;
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
        setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
        setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      getDataUtils().then(({ transactions, formatCurrency, calculateBalance }) => {
        const saldo = calculateBalance(transactions);
        let resp = `Seu saldo atual é: ${formatCurrency(saldo)}.`;
        setMessages(prevMessages => [...prevMessages, {
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
        setMessages(prevMessages => [...prevMessages, {
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
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
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
      return;
    }

    // 3. Fallback: resposta com IA real (Hugging Face)
    const thinkingMsg: ChatMessage = {
      id: uuidv4(),
      text: "Pensando...",
      sender: "system",
      timestamp: new Date()
    };
    setMessages(prevMessages => [...prevMessages, thinkingMsg]);

    async function getHuggingFaceResponse(prompt: string): Promise<string> {
      try {
        const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-small", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: prompt })
        });
        const data = await response.json();
        let answer = "";
        if (Array.isArray(data) && data[0]?.generated_text) {
          answer = data[0].generated_text.trim();
        } else if (typeof data === 'object' && data.generated_text) {
          answer = data.generated_text.trim();
        }
        // Se a resposta for vazia ou "desculpe", gere uma resposta positiva
        if (
          !answer ||
          answer.length < 5 ||
          /desculpe|não consegui|não posso|não tenho|não sei|não posso responder|não entendi|não foi possível/i.test(answer)
        ) {
          // Respostas alternativas
          const alternatives = [
            "Não tenho uma resposta exata para isso agora, mas posso te ajudar a encontrar soluções financeiras criativas! Quer uma dica de economia ou investimento?",
            "Às vezes, o segredo está em dar o primeiro passo. Que tal revisar seus gastos ou definir uma nova meta financeira hoje?",
            "Ótima pergunta! Se quiser, posso sugerir livros, vídeos ou ferramentas para aprofundar seu conhecimento financeiro.",
            "Se estiver com dúvidas, registre suas receitas e despesas para receber dicas personalizadas! Basta digitar aqui no chat, por exemplo: 'gastei 80 reais no mercado' ou 'recebi 500 de salário', e eu registro para você.",
            "Lembre-se: cada dúvida financeira é uma oportunidade de aprender e evoluir. Posso te ajudar com planejamento, investimentos ou controle de gastos!",
            "Motivação do dia: pequenas mudanças constroem grandes resultados. Continue buscando conhecimento!",
            "Se quiser, posso explicar conceitos como orçamento, investimentos, dívidas ou metas financeiras. É só pedir!",
            "Não tenho uma resposta exata, mas posso te motivar: a organização financeira é o primeiro passo para conquistar seus sonhos! E lembre-se: registrar receitas e despesas aqui no chat é rápido, fácil e faz toda a diferença!"
          ];
          return alternatives[Math.floor(Math.random() * alternatives.length)];
        }
        return answer;
      } catch (e) {
        // Em caso de erro de conexão, também retorna uma alternativa positiva
        const alternatives = [
          "Não consegui acessar a IA agora, mas posso te ajudar com dicas de finanças, motivação ou organização. Pergunte algo como: 'Como economizar mais?' ou 'Como investir melhor?'",
          "Mesmo sem acesso à IA, posso sugerir: revise seus gastos, defina metas e busque conhecimento financeiro sempre!",
          "Estou offline no momento, mas sigo aqui para te motivar: a persistência financeira vale a pena!"
        ];
        return alternatives[Math.floor(Math.random() * alternatives.length)];
      }
    }

    getHuggingFaceResponse(message).then((hfResp) => {
      setMessages(prevMessages => [
        ...prevMessages.filter(m => m.id !== thinkingMsg.id),
        {
          id: uuidv4(),
          text: hfResp,
          sender: "system",
          timestamp: new Date()
        }
      ]);
    });
  }, 1000);
};
  
  const suggestions = [
    { key: "howToSaveMore", text: t("howToSaveMore") },
    { key: "biggestExpenses", text: t("biggestExpenses") },
    { key: "createBudget", text: t("createBudget") },
    { key: "investOrPayDebt", text: t("investOrPayDebt") },
    { key: "reduceFoodExpenses", text: t("reduceFoodExpenses") },
    { key: "howMuchToSave", text: t("howMuchToSave") }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex flex-col pb-16">
      {/* Header com design moderno e colorido */}
      <header className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md px-4 py-3 flex flex-col items-center mx-auto w-full">
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
        <section className="w-full max-w-xl flex flex-col flex-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-indigo-100">
          <div className="flex-1 overflow-y-auto px-3 pt-3 pb-20" style={{ minHeight: '60vh' }}>
            <ChatMessages messages={messages} />
          </div>
          
          {showSuggestions && (
            <div className="mb-3 px-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-indigo-700 text-xs font-medium border border-indigo-200 shadow-sm transition-all"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="sticky bottom-0 w-full bg-white/90 backdrop-blur-sm pt-2 pb-3 px-3 border-t border-indigo-100 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
            <ChatInput onSubmit={handleSendMessage} />
          </div>
        </section>
      </main>
      
      {/* NavBar fixa na parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <NavBar />
      </div>
    </div>
  );
};

export default FinancialAdvisorPage;
