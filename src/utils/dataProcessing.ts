
import { Transaction, Bill, CardItem } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { saveTransaction, saveBill } from "./localStorage";

interface ParsedTransaction {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  dueDate?: Date;
  isRecurring?: boolean;
  totalInstallments?: number;
  isCardBill?: boolean;
}

// Função para processar o texto do chat e extrair transações
export const processChat = (text: string, userId: string): Transaction[] => {
  const lines = text.split(/[,.\n]/).filter(line => line.trim() !== '');
  const transactions: Transaction[] = [];

  lines.forEach(line => {
    const parsed = parseTransactionText(line.trim());
    if (parsed) {
      const transaction: Transaction = {
        id: uuidv4(),
        title: parsed.title,
        amount: parsed.amount,
        type: parsed.type,
        category: parsed.category,
        date: new Date(),
        userId,
        isRecurring: parsed.isRecurring,
        dueDate: parsed.dueDate,
        totalInstallments: parsed.totalInstallments,
        currentInstallment: parsed.totalInstallments ? 1 : undefined,
        isCardBill: parsed.isCardBill
      };
      
      transactions.push(transaction);
      saveTransaction(transaction);
      
      // Se for uma conta com vencimento, também salvar como Bill
      if (parsed.dueDate) {
        const bill: Bill = {
          id: uuidv4(),
          title: parsed.title,
          amount: parsed.amount,
          dueDate: parsed.dueDate,
          isRecurring: parsed.isRecurring || false,
          category: parsed.category,
          userId,
          isPaid: false,
          totalInstallments: parsed.totalInstallments,
          currentInstallment: parsed.totalInstallments ? 1 : undefined,
          notificationsEnabled: true,
          isCardBill: parsed.isCardBill
        };
        saveBill(bill);
      }
    }
  });

  return transactions;
};

// Função auxiliar para analisar o texto e extrair informações da transação
const parseTransactionText = (text: string): ParsedTransaction | null => {
  // Expressão regular para capturar valores monetários (com ou sem símbolo de moeda)
  const amountRegex = /\s?([0-9]+[,.][0-9]*|\s?[0-9]+)\s?(reais|real|r\$)?/i;
  
  // Expressão para detectar datas (dia/mês ou dia/mês/ano)
  const dateRegex = /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/;
  
  // Expressão para detectar parcelas (ex: 12x, 10 parcelas)
  const installmentRegex = /(\d+)(?:\s?x|\s?parcelas?)/i;
  
  // Lista de categorias comuns
  const categories = {
    income: ['salário', 'salario', 'receita', 'entrada', 'recebimento', 'ganho', 'rendimento', 'renda'],
    expense: {
      'alimentação': ['comida', 'mercado', 'restaurante', 'lanche', 'supermercado', 'feira'],
      'moradia': ['aluguel', 'apartamento', 'casa', 'condomínio', 'condominio', 'hipoteca', 'luz', 'água', 'agua', 'energia', 'gás', 'gas'],
      'transporte': ['uber', '99', 'táxi', 'taxi', 'ônibus', 'onibus', 'metrô', 'metro', 'combustível', 'combustivel', 'gasolina', 'transporte', 'estacionamento'],
      'lazer': ['cinema', 'teatro', 'show', 'festa', 'bar', 'viagem', 'passeio', 'diversão', 'diversao', 'entretenimento'],
      'saúde': ['médico', 'medico', 'consulta', 'remédio', 'remedio', 'farmácia', 'farmacia', 'hospital', 'plano de saúde', 'plano de saude'],
      'educação': ['escola', 'faculdade', 'curso', 'livro', 'material escolar', 'mensalidade', 'universidade', 'educação', 'educacao'],
      'vestuário': ['roupa', 'calçado', 'calcado', 'sapato', 'acessório', 'acessorio'],
      'dívidas': ['cartão de crédito', 'cartao de credito', 'cartao', 'cartão', 'empréstimo', 'emprestimo', 'financiamento', 'parcela'],
      'outros': []
    }
  };

  // Tentar encontrar um valor numérico no texto
  const amountMatch = text.match(amountRegex);
  if (!amountMatch) return null;

  // Limpar o valor para processamento (remover símbolos não numéricos)
  const rawAmount = amountMatch[1].replace(/[^\d,.]/g, '').replace(',', '.');
  const amount = parseFloat(rawAmount);
  
  if (isNaN(amount)) return null;
  
  // Resto do texto sem o valor
  let remainingText = text.replace(amountRegex, '').trim();
  
  // Verificar se há data de vencimento
  let dueDate: Date | undefined;
  const dateMatch = remainingText.match(dateRegex);
  if (dateMatch) {
    const dateParts = dateMatch[1].split('/');
    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Mês em JavaScript é 0-indexed
    
    const year = dateParts[2] 
      ? parseInt(dateParts[2]) 
      : (new Date().getFullYear() + (month < new Date().getMonth() ? 1 : 0));
    
    dueDate = new Date(year, month, day);
    remainingText = remainingText.replace(dateRegex, '').trim();
  }
  
  // Verificar se há informação de parcelas
  let totalInstallments: number | undefined;
  const installmentMatch = remainingText.match(installmentRegex);
  if (installmentMatch) {
    totalInstallments = parseInt(installmentMatch[1]);
    remainingText = remainingText.replace(installmentRegex, '').trim();
  }
  
  // Verificar se é recorrente
  const isRecurring = /mensal|recorrente|todo(s)?\s*(o|a)(s)?\s*(mês|mes|meses)/i.test(text);
  
  // Verificar se é fatura de cartão
  const isCardBill = /(cartão|cartao|fatura)\s*(de)?\s*(crédito|credito)/i.test(text);
  
  // Determinar se é receita ou despesa e a categoria
  let type: 'income' | 'expense' = 'expense';
  let category = 'outros';

  // Verificar se é receita
  const isIncome = categories.income.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  if (isIncome) {
    type = 'income';
    category = 'receita';
  } else {
    // Tentar identificar a categoria de despesa
    for (const [cat, keywords] of Object.entries(categories.expense)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        category = cat;
        break;
      }
    }
    
    // Se for cartão de crédito, atualizar a categoria
    if (isCardBill) {
      category = 'dívidas';
    }
  }
  
  // Determinar o título da transação
  let title = remainingText;
  if (!title || title.length < 2) {
    // Se não houver texto suficiente, usar a categoria como título
    title = category.charAt(0).toUpperCase() + category.slice(1);
    
    if (isCardBill) {
      title = "Fatura de Cartão de Crédito";
    }
  }

  return {
    title,
    amount,
    type,
    category,
    dueDate,
    isRecurring,
    totalInstallments,
    isCardBill
  };
};

// Calcular saldo total
export const calculateBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((total, transaction) => {
    if (transaction.type === 'income') {
      return total + transaction.amount;
    } else {
      return total - transaction.amount;
    }
  }, 0);
};

// Calcular valor total por categoria
export const calculateTotalByCategory = (transactions: Transaction[]): Record<string, number> => {
  const totals: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    if (!totals[transaction.category]) {
      totals[transaction.category] = 0;
    }
    
    if (transaction.type === 'income') {
      totals[transaction.category] += transaction.amount;
    } else {
      totals[transaction.category] -= transaction.amount;
    }
  });
  
  return totals;
};

// Calcular a porcentagem de mudança em relação ao período anterior
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

// Obter transações dos últimos N dias
export const getTransactionsFromLastDays = (transactions: Transaction[], days: number): Transaction[] => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate > date;
  });
};

// Obter contas que vencem nos próximos N dias
export const getBillsDueInNextDays = (bills: Bill[], days: number): Bill[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date();
  endDate.setDate(today.getDate() + days);
  endDate.setHours(23, 59, 59, 999);
  
  return bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    return !bill.isPaid && dueDate >= today && dueDate <= endDate;
  });
};

// Obter contas vencidas
export const getOverdueBills = (bills: Bill[]): Bill[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return !bill.isPaid && dueDate < today;
  });
};

// Formatar valor para exibição
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Adicionar item a uma fatura de cartão de crédito
export const addCardItem = (billId: string, cardItem: Omit<CardItem, 'id'>): CardItem => {
  const newItem: CardItem = {
    id: uuidv4(),
    ...cardItem
  };
  
  return newItem;
};
