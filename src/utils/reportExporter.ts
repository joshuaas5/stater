import { Transaction, Bill } from '@/types';
import { getTransactions, getBills, getCurrentUser } from './localStorage';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Importar o exportador de PDF premium
import { generateEnhancedPDF } from './enhancedPdfExporter';
// Importar branding centralizado
import { 
  BRAND_INFO, 
  BRAND_COLORS,
  formatCurrency, 
  formatDateBR as formatDate,
  getRandomFinancialTip 
} from './reportBranding';

// Interface para a configuração de exportação
export interface ExportConfig {
  startDate?: string | Date;
  endDate?: string | Date;
  includeTransactions?: boolean;
  includeBills?: boolean;
  format: 'xlsx' | 'pdf' | 'ofx' | 'csv';
}

// Interface para os dados do relatório
interface ReportData {
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
  userName?: string;
  startDate?: Date;
  endDate?: Date;
}

// Função para obter o resumo por categorias
const getCategorySummary = (transactions: Transaction[], type: 'income' | 'expense') => {
  const filteredTransactions = transactions.filter(t => t.type === type);
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const categoryMap = new Map<string, number>();
  filteredTransactions.forEach(t => {
    const currentAmount = categoryMap.get(t.category) || 0;
    categoryMap.set(t.category, currentAmount + t.amount);
  });
  
  const categorySummary = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
  
  return categorySummary;
};

// Função principal para buscar e preparar os dados do relatório
const getReportData = async (config: ExportConfig): Promise<ReportData> => {
  const currentUser = getCurrentUser();
  const transactions = getTransactions();
  const bills = getBills();

  let filteredTransactions = transactions;
  let filteredBills = bills;

  if (config.startDate) {
    const startDate = new Date(config.startDate);
    startDate.setHours(0, 0, 0, 0);
    filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startDate);
    filteredBills = filteredBills.filter(b => new Date(b.dueDate) >= startDate);
  }
  if (config.endDate) {
    const endDate = new Date(config.endDate);
    endDate.setHours(23, 59, 59, 999);
    filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= endDate);
    filteredBills = filteredBills.filter(b => new Date(b.dueDate) <= endDate);
  }

  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
  
  const incomeTotal = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = incomeTotal - expenseTotal;

  const incomeByCategoryData = getCategorySummary(filteredTransactions, 'income');
  const expenseByCategoryData = getCategorySummary(filteredTransactions, 'expense');

  let period = 'Completo';
  if (config.startDate && config.endDate) {
    period = `${formatDate(config.startDate)} - ${formatDate(config.endDate)}`;
  } else if (config.startDate) {
    period = `A partir de ${formatDate(config.startDate)}`;
  } else if (config.endDate) {
    period = `Até ${formatDate(config.endDate)}`;
  }

  return {
    incomeTransactions: config.includeTransactions ? incomeTransactions : [],
    expenseTransactions: config.includeTransactions ? expenseTransactions : [],
    incomeTotal,
    expenseTotal,
    balance,
    bills: config.includeBills ? filteredBills : [],
    user: currentUser ? { name: currentUser.username, email: currentUser.email } : null,
    period,
    categorySummary: {
      income: incomeByCategoryData,
      expense: expenseByCategoryData
    },
    userName: currentUser ? currentUser.username : '',
    startDate: config.startDate ? new Date(config.startDate) : new Date(0),
    endDate: config.endDate ? new Date(config.endDate) : new Date(0)
  };
};

// Exportar para CSV - Formato limpo e importável
const exportToCSV = (data: ReportData): Blob => {
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };
  
  const formatNumber = (value: number): string => {
    return value.toFixed(2).replace('.', ',');
  };
  
  let csvContent = "\uFEFF"; // BOM para UTF-8
  
  csvContent += `# STATER - ${BRAND_INFO.slogan}\n`;
  csvContent += `# Relatório Financeiro\n`;
  csvContent += `# Usuário: ${data.user?.name || 'N/A'}\n`;
  csvContent += `# Período: ${data.period}\n`;
  csvContent += `# Gerado em: ${formatDate(new Date())}\n`;
  csvContent += `# Site: ${BRAND_INFO.website}\n`;
  csvContent += `#\n`;
  
  csvContent += `\n# === RESUMO ===\n`;
  csvContent += `Descrição;Valor\n`;
  csvContent += `Total de Receitas;${formatNumber(data.incomeTotal)}\n`;
  csvContent += `Total de Despesas;${formatNumber(data.expenseTotal)}\n`;
  csvContent += `Saldo do Período;${formatNumber(data.balance)}\n`;
  
  csvContent += `\n# === TRANSAÇÕES ===\n`;
  csvContent += `Data;Tipo;Descrição;Categoria;Valor\n`;
  
  const allTransactions = [
    ...data.incomeTransactions.map(t => ({ ...t, typeLabel: 'Receita' as const })),
    ...data.expenseTransactions.map(t => ({ ...t, typeLabel: 'Despesa' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  allTransactions.forEach(t => {
    const valor = t.typeLabel === 'Despesa' ? -t.amount : t.amount;
    csvContent += `${formatDate(t.date)};${t.typeLabel};${escapeCSV(t.title)};${escapeCSV(t.category || 'Sem categoria')};${formatNumber(valor)}\n`;
  });
  
  if (data.categorySummary.income.length > 0) {
    csvContent += `\n# === RECEITAS POR CATEGORIA ===\n`;
    csvContent += `Categoria;Valor;Percentual\n`;
    data.categorySummary.income.forEach(item => {
      csvContent += `${escapeCSV(item.category)};${formatNumber(item.amount)};${item.percentage.toFixed(1)}%\n`;
    });
  }
  
  if (data.categorySummary.expense.length > 0) {
    csvContent += `\n# === DESPESAS POR CATEGORIA ===\n`;
    csvContent += `Categoria;Valor;Percentual\n`;
    data.categorySummary.expense.forEach(item => {
      csvContent += `${escapeCSV(item.category)};${formatNumber(item.amount)};${item.percentage.toFixed(1)}%\n`;
    });
  }
  
  if (data.bills.length > 0) {
    csvContent += `\n# === CONTAS ===\n`;
    csvContent += `Vencimento;Descrição;Categoria;Status;Parcela;Valor\n`;
    
    data.bills.forEach(b => {
      const installmentInfo = b.totalInstallments && b.currentInstallment 
        ? `${b.currentInstallment}/${b.totalInstallments}` 
        : b.isRecurring ? 'Recorrente' : '-';
      
      csvContent += `${formatDate(b.dueDate)};${escapeCSV(b.title)};${escapeCSV(b.category)};${b.isPaid ? 'Paga' : 'Pendente'};${installmentInfo};${formatNumber(b.amount)}\n`;
    });
  }
  
  csvContent += `\n# Gerado automaticamente por STATER - ${BRAND_INFO.website}\n`;
  
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

// Função para criar estilos de célula no XLSX
const getCellStyle = (type: 'header' | 'subheader' | 'total' | 'normal' | 'income' | 'expense' | 'balance' | 'paid' | 'unpaid'): Record<string, unknown> => {
  const styles: Record<string, Record<string, unknown>> = {
    header: {
      fill: { fgColor: { rgb: BRAND_COLORS.PRIMARY.replace('#', '') } },
      font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 14 },
      alignment: { horizontal: 'center', vertical: 'center' }
    },
    subheader: {
      fill: { fgColor: { rgb: BRAND_COLORS.TEXT_PRIMARY.replace('#', '') } },
      font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 12 },
      alignment: { horizontal: 'center', vertical: 'center' }
    },
    normal: {
      font: { color: { rgb: BRAND_COLORS.TEXT_PRIMARY.replace('#', '') }, sz: 11 },
      alignment: { horizontal: 'left', vertical: 'center' }
    },
    total: {
      fill: { fgColor: { rgb: BRAND_COLORS.BACKGROUND_CARD.replace('#', '') } },
      font: { color: { rgb: BRAND_COLORS.TEXT_PRIMARY.replace('#', '') }, bold: true, sz: 12 },
      alignment: { horizontal: 'right', vertical: 'center' }
    },
    income: {
      font: { color: { rgb: BRAND_COLORS.SUCCESS.replace('#', '') }, bold: true, sz: 12 },
      alignment: { horizontal: 'right', vertical: 'center' }
    },
    expense: {
      font: { color: { rgb: BRAND_COLORS.DANGER.replace('#', '') }, bold: true, sz: 12 },
      alignment: { horizontal: 'right', vertical: 'center' }
    },
    balance: {
      fill: { fgColor: { rgb: BRAND_COLORS.BACKGROUND_CARD.replace('#', '') } },
      font: { bold: true, sz: 12 },
      alignment: { horizontal: 'right', vertical: 'center' }
    },
    paid: {
      font: { color: { rgb: BRAND_COLORS.SUCCESS.replace('#', '') }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    },
    unpaid: {
      font: { color: { rgb: BRAND_COLORS.DANGER.replace('#', '') }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  };
  
  return styles[type];
};

// Exportar para XLSX
const exportToXLSX = (data: ReportData): Blob => {
  const wb = XLSX.utils.book_new();
  const financialTip = getRandomFinancialTip();
  
  const headerRows = [
    ['RELATÓRIO FINANCEIRO', '', '', '', '', ''],
    [`Usuário: ${data.user?.name || 'N/A'}`, '', '', '', '', ''],
    [`Período: ${data.period}`, '', '', '', '', ''],
    [`Gerado em: ${formatDate(new Date())}`, '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['RESUMO', '', '', '', '', ''],
    ['', 'Total Entradas', formatCurrency(data.incomeTotal), '', '', ''],
    ['', 'Total Saídas', formatCurrency(data.expenseTotal), '', '', ''],
    ['', 'Saldo Final', formatCurrency(data.balance), '', '', ''],
    ['', '', '', '', '', '']
  ];
  
  const incomeRows: string[][] = [
    ['ENTRADAS', '', '', '', '', ''],
    ['Data', 'Descrição', 'Categoria', 'Valor', '', ''],
  ];
  
  if (data.incomeTransactions.length > 0) {
    data.incomeTransactions.forEach(t => {
      incomeRows.push([formatDate(t.date), t.title, t.category, formatCurrency(t.amount), '', '']);
    });
  } else {
    incomeRows.push(['Nenhuma entrada no período', '', '', '', '', '']);
  }
  
  incomeRows.push(['', '', 'TOTAL', formatCurrency(data.incomeTotal), '', '']);
  incomeRows.push(['', '', '', '', '', '']);
  
  const incomeCategoryRows: string[][] = [];
  if (data.categorySummary.income.length > 0) {
    incomeCategoryRows.push(['DISTRIBUIÇÃO DE ENTRADAS POR CATEGORIA', '', '', '', '', '']);
    incomeCategoryRows.push(['Categoria', 'Valor', '% do Total', '', '', '']);
    
    data.categorySummary.income.forEach(item => {
      incomeCategoryRows.push([item.category, formatCurrency(item.amount), `${item.percentage.toFixed(1)}%`, '', '', '']);
    });
    
    incomeCategoryRows.push(['', '', '', '', '', '']);
  }
  
  const expenseRows: string[][] = [
    ['SAÍDAS', '', '', '', '', ''],
    ['Data', 'Descrição', 'Categoria', 'Valor', '', ''],
  ];
  
  if (data.expenseTransactions.length > 0) {
    data.expenseTransactions.forEach(t => {
      expenseRows.push([formatDate(t.date), t.title, t.category, formatCurrency(t.amount), '', '']);
    });
  } else {
    expenseRows.push(['Nenhuma saída no período', '', '', '', '', '']);
  }
  
  expenseRows.push(['', '', 'TOTAL', formatCurrency(data.expenseTotal), '', '']);
  expenseRows.push(['', '', '', '', '', '']);
  
  const expenseCategoryRows: string[][] = [];
  if (data.categorySummary.expense.length > 0) {
    expenseCategoryRows.push(['DISTRIBUIÇÃO DE SAÍDAS POR CATEGORIA', '', '', '', '', '']);
    expenseCategoryRows.push(['Categoria', 'Valor', '% do Total', '', '', '']);
    
    data.categorySummary.expense.forEach(item => {
      expenseCategoryRows.push([item.category, formatCurrency(item.amount), `${item.percentage.toFixed(1)}%`, '', '', '']);
    });
    
    expenseCategoryRows.push(['', '', '', '', '', '']);
  }
  
  const billRows: string[][] = [
    ['CONTAS', '', '', '', '', ''],
    ['Vencimento', 'Descrição', 'Categoria', 'Status', 'Parcelas', 'Valor'],
  ];
  
  if (data.bills.length > 0) {
    data.bills.forEach(b => {
      const installmentInfo = b.totalInstallments && b.currentInstallment 
        ? `${b.currentInstallment}/${b.totalInstallments}` 
        : b.isRecurring ? 'Recorrente' : '-';
      
      billRows.push([
        formatDate(b.dueDate), 
        b.title, 
        b.category, 
        b.isPaid ? 'Paga' : 'Pendente', 
        installmentInfo, 
        formatCurrency(b.amount)
      ]);
    });
  } else {
    billRows.push(['Nenhuma conta no período', '', '', '', '', '']);
  }
  
  billRows.push(['', '', '', '', '', '']);
  
  const tipRows = [
    ['DICA FINANCEIRA', '', '', '', '', ''],
    [financialTip, '', '', '', '', ''],
    ['', '', '', '', '', '']
  ];
  
  const allRows = [
    ...headerRows,
    ...incomeRows,
    ...incomeCategoryRows,
    ...expenseRows,
    ...expenseCategoryRows,
    ...billRows,
    ...tipRows
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  
  ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório Financeiro');
  
  const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

import { exportToOFX } from './ofxExporter';

// Função principal para exportar relatório
export const exportReport = async (config: ExportConfig): Promise<Blob> => {
  try {
    const reportData = await getReportData(config);
    
    switch (config.format) {
      case 'xlsx':
        return exportToXLSX(reportData);
      case 'pdf':
        console.log('Gerando PDF com o exportador aprimorado...');
        return generateEnhancedPDF({
          userName: reportData.user?.name || reportData.user?.email || 'Usuário',
          startDate: reportData.startDate || new Date(),
          endDate: reportData.endDate || new Date(),
          incomeTotal: reportData.incomeTotal,
          expenseTotal: reportData.expenseTotal,
          balance: reportData.balance,
          incomeTransactions: reportData.incomeTransactions,
          expenseTransactions: reportData.expenseTransactions,
          bills: reportData.bills,
          financialTip: getRandomFinancialTip()
        });
      case 'ofx':
        const allTransactions = [...reportData.incomeTransactions, ...reportData.expenseTransactions];
        return exportToOFX(allTransactions, reportData.user);
      case 'csv':
        return exportToCSV(reportData);
      default:
        throw new Error(`Formato não suportado: ${config.format}`);
    }
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    throw error;
  }
};
