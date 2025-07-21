import { Transaction, Bill } from '@/types';

// Interface para os dados do relatório
export interface ReportData {
  incomeTransactions: Transaction[];
  expenseTransactions: Transaction[];
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  bills: Bill[];
  user: { name?: string; email?: string } | null;
  period: string;
  categorySummary: {
    income: { category: string; amount: number; percentage: number }[];
    expense: { category: string; amount: number; percentage: number }[];
  };
}

// Exportar para PDF usando apenas texto e sem nenhuma dependência de biblioteca
export const generateUltraSimplePDF = (data: ReportData): Blob => {
  try {
    // Formatar valores monetários
    const formatCurrency = (value: number): string => {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Formatar datas
    const formatDate = (dateStr: string | Date): string => {
      if (!dateStr) return '';
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
      return date.toLocaleDateString('pt-BR');
    };

    // Criar string com todo o conteúdo do relatório
    let pdfContent = `RELATÓRIO FINANCEIRO\n`;
    pdfContent += `Período: ${data.period}\n`;
    pdfContent += `Gerado em: ${new Date().toLocaleDateString('pt-BR')}\n\n`;

    // Seção de resumo
    pdfContent += `RESUMO\n`;
    pdfContent += `Total Entradas: ${formatCurrency(data.incomeTotal)}\n`;
    pdfContent += `Total Saídas: ${formatCurrency(data.expenseTotal)}\n`;
    pdfContent += `Saldo: ${formatCurrency(data.balance)}\n\n`;

    // Seção de entradas
    pdfContent += `ENTRADAS\n`;
    if (data.incomeTransactions && data.incomeTransactions.length > 0) {
      pdfContent += `Data | Descrição | Categoria | Valor\n`;
      data.incomeTransactions.forEach(t => {
        pdfContent += `${formatDate(t.date)} | ${t.title} | ${t.category || ''} | ${formatCurrency(t.amount)}\n`;
      });
      pdfContent += `TOTAL: ${formatCurrency(data.incomeTotal)}\n`;
    } else {
      pdfContent += `Nenhuma entrada no período.\n`;
    }
    pdfContent += `\n`;

    // Seção de saídas
    pdfContent += `SAÍDAS\n`;
    if (data.expenseTransactions && data.expenseTransactions.length > 0) {
      pdfContent += `Data | Descrição | Categoria | Valor\n`;
      data.expenseTransactions.forEach(t => {
        pdfContent += `${formatDate(t.date)} | ${t.title} | ${t.category || ''} | ${formatCurrency(t.amount)}\n`;
      });
      pdfContent += `TOTAL: ${formatCurrency(data.expenseTotal)}\n`;
    } else {
      pdfContent += `Nenhuma saída no período.\n`;
    }
    pdfContent += `\n`;

    // Distribuição por categoria (despesas)
    pdfContent += `DISTRIBUIÇÃO DE GASTOS POR CATEGORIA\n`;
    if (data.categorySummary && data.categorySummary.expense && data.categorySummary.expense.length > 0) {
      pdfContent += `Categoria | Valor | Percentual\n`;
      data.categorySummary.expense.forEach(cat => {
        pdfContent += `${cat.category} | ${formatCurrency(cat.amount)} | ${cat.percentage.toFixed(1)}%\n`;
      });
    } else {
      pdfContent += `Nenhuma categoria de saída no período.\n`;
    }
    pdfContent += `\n`;

    // Seção de contas
    pdfContent += `CONTAS\n`;
    if (data.bills && data.bills.length > 0) {
      pdfContent += `Vencimento | Descrição | Categoria | Status | Parcelas | Valor\n`;
      data.bills.forEach(b => {
        const installmentInfo = b.totalInstallments && b.currentInstallment 
          ? `${b.currentInstallment}/${b.totalInstallments}` 
          : b.isRecurring ? 'Recorrente' : '-';
        
        pdfContent += `${formatDate(b.dueDate)} | ${b.title} | ${b.category || ''} | ${b.isPaid ? 'Paga' : 'Pendente'} | ${installmentInfo} | ${formatCurrency(b.amount)}\n`;
      });
      const totalBills = data.bills.reduce((sum, bill) => sum + bill.amount, 0);
      pdfContent += `TOTAL: ${formatCurrency(totalBills)}\n`;
    } else {
      pdfContent += `Nenhuma conta no período.\n`;
    }
    pdfContent += `\n`;

    // Dica financeira
    pdfContent += `DICA FINANCEIRA\n`;
    pdfContent += `Poupe hoje para garantir seu futuro. Economizar mensalmente, mesmo que pouco, é o primeiro passo para a independência financeira.\n\n`;

    pdfContent += `Relatório gerado por STATER - Inteligência para prosperar`;

    // Converter texto em blob
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    
    return blob;
  } catch (error) {
    console.error('Erro ao gerar PDF ultra simples:', error);
    throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
