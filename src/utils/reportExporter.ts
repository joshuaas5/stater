import { Transaction, Bill } from '@/types';
import { getTransactions, getBills, getCurrentUser } from './localStorage';
import * as XLSX from 'xlsx';
// @ts-ignore
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Interface para a configuração de exportação
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

const formatCurrencyPlain = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

const formatDateShort = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getFullYear()}`;
};

// Tipo para o formato de exportação
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// Função principal para exportar dados
export const exportFinancialReport = async (config: ExportConfig, format: ExportFormat = 'csv'): Promise<{ data: string | Blob | null; filename: string }> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  // Obter os dados do relatório
  const reportData = await getReportData(config);
  const dateRange = `${formatDateShort(config.startDate)}_${formatDateShort(config.endDate)}`;
  
  // Exportar no formato solicitado
  switch (format) {
    case 'xlsx':
      return {
        data: await exportToXLSX(reportData),
        filename: `ICTUS_Financeiro_${dateRange}.xlsx`
      };
    case 'pdf':
      return {
        data: await exportToPDF(reportData),
        filename: `ICTUS_Financeiro_${dateRange}.pdf`
      };
    case 'csv':
    default:
      return {
        data: exportToCSV(reportData),
        filename: `ICTUS_Financeiro_${dateRange}.csv`
      };
  }
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

// Obter os dados para o relatório
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
  // Criar container para as linhas do CSV
  const csvContent: string[] = [];

  // Cabeçalho do relatório
  csvContent.push('"RELATÓRIO FINANCEIRO ICTUS"');
  csvContent.push(`"Usuário: ${data.user.name} (${data.user.email})"`);
  csvContent.push(`"Período: ${formatDate(data.summary.periodStart)} a ${formatDate(data.summary.periodEnd)}"`);
  csvContent.push('""');

  // Resumo financeiro
  csvContent.push('"RESUMO FINANCEIRO"');
  csvContent.push(`"Total de Receitas","${formatCurrency(data.summary.totalIncome)}"`);
  csvContent.push(`"Total de Despesas","${formatCurrency(data.summary.totalExpenses)}"`);
  csvContent.push(`"Saldo","${formatCurrency(data.summary.balance)}"`);
  csvContent.push(`"Contas a Pagar","${formatCurrency(data.summary.pendingBills)}"`);
  csvContent.push(`"Contas Pagas","${formatCurrency(data.summary.paidBills)}"`);
  csvContent.push('""');

  // Transações
  if (data.transactions.length > 0) {
    csvContent.push('"TRANSAÇÕES"');
    csvContent.push('"Data","Descrição","Categoria","Tipo","Valor"');
    
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
    csvContent.push('"Vencimento","Descrição","Categoria","Status","Valor"');
    
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

// Exportar para XLSX
const exportToXLSX = async (data: ReportData): Promise<Blob | null> => {
  if (!XLSX) {
    console.error('XLSX não está disponível');
    return null;
  }

  // Criar folhas de trabalho
  const workbook = XLSX.utils.book_new();
  
  // Dados de cabeçalho
  const headerData = [
    ['PLANILHA DE CONTROLE FINANCEIRO PESSOAL | ICTUS'],
    [],
    [`Usuário: ${data.user.name} (${data.user.email})`],
    [`Período: ${formatDate(data.summary.periodStart)} a ${formatDate(data.summary.periodEnd)}`],
    []
  ];
  
  // Dados do resumo
  const summaryData = [
    ['RESUMO FINANCEIRO'],
    ['Descrição', 'Valor'],
    ['Total de Receitas', formatCurrencyPlain(data.summary.totalIncome)],
    ['Total de Despesas', formatCurrencyPlain(data.summary.totalExpenses)],
    ['Saldo', formatCurrencyPlain(data.summary.balance)],
    ['Contas a Pagar', formatCurrencyPlain(data.summary.pendingBills)],
    ['Contas Pagas', formatCurrencyPlain(data.summary.paidBills)],
    []
  ];
  
  // Dados de transações
  const transactionsData = data.transactions.length > 0 ? [
    ['TRANSAÇÕES'],
    ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'],
    ...data.transactions.map(t => [
      formatDate(new Date(t.date)),
      t.title,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      formatCurrencyPlain(t.amount)
    ]),
    []
  ] : [];
  
  // Dados de contas
  const billsData = data.bills.length > 0 ? [
    ['CONTAS'],
    ['Vencimento', 'Descrição', 'Categoria', 'Status', 'Valor'],
    ...data.bills.map(b => [
      formatDate(new Date(b.dueDate)),
      b.title,
      b.category,
      b.isPaid ? 'Paga' : 'Pendente',
      formatCurrencyPlain(b.amount)
    ])
  ] : [];
  
  // Combinar todos os dados
  const combinedData = [...headerData, ...summaryData, ...transactionsData, ...billsData];
  
  // Criar planilha
  const worksheet = XLSX.utils.aoa_to_sheet(combinedData);
  
  // Estilização da planilha (básica)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!worksheet[address]) continue;
    worksheet[address].s = { font: { bold: true } };
  }
  
  // Adicionar planilha ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório Financeiro');
  
  // Gerar arquivo XLSX
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/octet-stream' });
};

// Exportar para PDF
const exportToPDF = async (data: ReportData): Promise<Blob | null> => {
  if (!jsPDF) {
    console.error('jsPDF não está disponível');
    return null;
  }

  // Criar documento PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Configurar fontes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  
  // Adicionar cabeçalho
  doc.setTextColor(76, 29, 149); // Cor roxa similar ao tema
  doc.text('PLANILHA DE CONTROLE FINANCEIRO PESSOAL | ICTUS', 10, 15, { align: 'left' });
  
  // Informações do usuário e período
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Usuário: ${data.user.name} (${data.user.email})`, 10, 25);
  doc.text(`Período: ${formatDate(data.summary.periodStart)} a ${formatDate(data.summary.periodEnd)}`, 10, 32);
  
  // Resumo financeiro
  doc.setFontSize(14);
  doc.setTextColor(76, 29, 149);
  doc.text('RESUMO FINANCEIRO', 10, 45);
  
  (doc as any).autoTable({
    startY: 50,
    head: [['Descrição', 'Valor']],
    body: [
      ['Total de Receitas', formatCurrency(data.summary.totalIncome)],
      ['Total de Despesas', formatCurrency(data.summary.totalExpenses)],
      ['Saldo', formatCurrency(data.summary.balance)],
      ['Contas a Pagar', formatCurrency(data.summary.pendingBills)],
      ['Contas Pagas', formatCurrency(data.summary.paidBills)]
    ],
    theme: 'grid',
    headStyles: { fillColor: [76, 29, 149], textColor: 255 },
    styles: { overflow: 'linebreak' },
    columnStyles: { 0: { cellWidth: 100 } }
  });
  
  // Seção de transações
  let finalY = (doc as any).lastAutoTable.finalY || 100;
  
  if (data.transactions.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(76, 29, 149);
    doc.text('TRANSAÇÕES', 10, finalY + 15);
    
    (doc as any).autoTable({
      startY: finalY + 20,
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: data.transactions.map(t => [
        formatDate(new Date(t.date)),
        t.title,
        t.category,
        t.type === 'income' ? 'Receita' : 'Despesa',
        formatCurrency(t.amount)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [76, 29, 149], textColor: 255 },
      styles: { overflow: 'linebreak' }
    });
    
    finalY = (doc as any).lastAutoTable.finalY || finalY + 40;
  }
  
  // Seção de contas
  if (data.bills.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(76, 29, 149);
    doc.text('CONTAS', 10, finalY + 15);
    
    (doc as any).autoTable({
      startY: finalY + 20,
      head: [['Vencimento', 'Descrição', 'Categoria', 'Status', 'Valor']],
      body: data.bills.map(b => [
        formatDate(new Date(b.dueDate)),
        b.title,
        b.category,
        b.isPaid ? 'Paga' : 'Pendente',
        formatCurrency(b.amount)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [76, 29, 149], textColor: 255 },
      styles: { overflow: 'linebreak' }
    });
  }
  
  // Gerar o PDF como blob
  return doc.output('blob');
};
