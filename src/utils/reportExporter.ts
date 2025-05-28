import { Transaction, Bill } from '@/types';
import { getTransactions, getBills, getCurrentUser } from './localStorage';

// Interface para a configurau00e7u00e3o de exportau00e7u00e3o
export interface ExportConfig {
  startDate: Date;
  endDate: Date;
  includeTransactions: boolean;
  includeBills: boolean;
  includeCharts?: boolean;
}

// Funções auxiliares de formatação para não depender de bibliotecas externas
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Funu00e7u00e3o principal para exportar dados
export const exportFinancialReport = async (config: ExportConfig): Promise<string> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Usuu00e1rio nu00e3o autenticado');
  }

  // Obter os dados do relatu00f3rio
  const reportData = await getReportData(config);

  // Exportar para CSV
  return exportToCSV(reportData);
};

// Interface para os dados do relatu00f3rio
interface ReportData {
  transactions: Transaction[];
  bills: Bill[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    pendingBills: number;
    paidBills: number;
    periodStart: Date;
    periodEnd: Date;
  };
  user: {
    name: string;
    email: string;
  };
}

// Obter os dados para o relatu00f3rio
const getReportData = async (config: ExportConfig): Promise<ReportData> => {
  // Obter transau00e7u00f5es e contas no peru00edodo especificado
  const allTransactions = getTransactions();
  const allBills = getBills();
  const user = getCurrentUser()!;

  // Filtrar por data
  const transactions = config.includeTransactions 
    ? allTransactions.filter(t => {
        const date = new Date(t.date);
        return date >= config.startDate && date <= config.endDate;
      })
    : [];

  const bills = config.includeBills 
    ? allBills.filter(b => {
        const date = new Date(b.dueDate);
        return date >= config.startDate && date <= config.endDate;
      })
    : [];

  // Calcular resumo
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const pendingBills = bills
    .filter(b => !b.isPaid)
    .reduce((sum, b) => sum + b.amount, 0);

  const paidBills = bills
    .filter(b => b.isPaid)
    .reduce((sum, b) => sum + b.amount, 0);

  return {
    transactions,
    bills,
    summary: {
      totalIncome,
      totalExpenses,
      balance,
      pendingBills,
      paidBills,
      periodStart: config.startDate,
      periodEnd: config.endDate
    },
    user: {
      name: user.username,
      email: user.email
    }
  };
};

// Exportar para CSV
const exportToCSV = (data: ReportData): string => {
  // Criar conu00eauner para as linhas do CSV
  const csvContent: string[] = [];

  // Cabeu00e7alho do relatu00f3rio
  csvContent.push('"RELATu00d3RIO FINANCEIRO ICTUS"');
  csvContent.push(`"Usuu00e1rio: ${data.user.name} (${data.user.email})"`);
  csvContent.push(`"Peru00edodo: ${formatDate(data.summary.periodStart)} a ${formatDate(data.summary.periodEnd)}"`);
  csvContent.push('""');

  // Resumo financeiro
  csvContent.push('"RESUMO FINANCEIRO"');
  csvContent.push(`"Total de Receitas","${formatCurrency(data.summary.totalIncome)}"`);
  csvContent.push(`"Total de Despesas","${formatCurrency(data.summary.totalExpenses)}"`);
  csvContent.push(`"Saldo","${formatCurrency(data.summary.balance)}"`);
  csvContent.push(`"Contas a Pagar","${formatCurrency(data.summary.pendingBills)}"`);
  csvContent.push(`"Contas Pagas","${formatCurrency(data.summary.paidBills)}"`);
  csvContent.push('""');

  // Transau00e7u00f5es
  if (data.transactions.length > 0) {
    csvContent.push('"TRANSAu00c7u00d5ES"');
    csvContent.push('"Data","Descriu00e7u00e3o","Categoria","Tipo","Valor"');
    
    data.transactions.forEach(transaction => {
      const date = formatDate(new Date(transaction.date));
      const type = transaction.type === 'income' ? 'Receita' : 'Despesa';
      csvContent.push(
        `"${date}","${transaction.title}","${transaction.category}","${type}","${formatCurrency(transaction.amount)}"`
      );
    });
    
    csvContent.push('""');
  }

  // Contas
  if (data.bills.length > 0) {
    csvContent.push('"CONTAS"');
    csvContent.push('"Vencimento","Descriu00e7u00e3o","Categoria","Status","Valor"');
    
    data.bills.forEach(bill => {
      const dueDate = formatDate(new Date(bill.dueDate));
      const status = bill.isPaid ? 'Paga' : 'Pendente';
      csvContent.push(
        `"${dueDate}","${bill.title}","${bill.category}","${status}","${formatCurrency(bill.amount)}"`
      );
    });
  }

  // Juntar todas as linhas com quebras de linha
  return csvContent.join('\n');
};
