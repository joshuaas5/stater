import { Transaction, Bill } from '@/types';
import { getTransactions, getBills, getCurrentUser } from './localStorage';
import * as XLSX from 'xlsx';
// @ts-ignore
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Interface para a configuração de exportação
export interface ExportConfig {
  startDate?: string;
  endDate?: string;
  includeTransactions?: boolean;
  includeBills?: boolean;
  includeCharts?: boolean; // Embora não usado diretamente na exportação de tabela, mantido para consistência
  format: 'csv' | 'xlsx' | 'pdf';
}

// Interface para os dados do relatório
interface ReportData {
  summary: Array<{ description: string; value: number }>;
  transactions: Transaction[];
  bills: Bill[];
  user: { name?: string; email?: string } | null;
  period: string;
}

// Função para formatar valores monetários
const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Função para formatar datas (dd/mm/yyyy)
const formatDate = (dateInput: Date | string | undefined): string => {
  if (!dateInput) return '';
  let date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  // Adiciona o fuso horário para evitar problemas com datas UTC
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const correctedDate = new Date(date.getTime() + userTimezoneOffset);
  return correctedDate.toLocaleDateString('pt-BR');
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
    // Ajusta a data de início para o começo do dia
    startDate.setHours(0, 0, 0, 0);
    filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startDate);
    filteredBills = filteredBills.filter(b => new Date(b.dueDate) >= startDate);
  }
  if (config.endDate) {
    const endDate = new Date(config.endDate);
    // Ajusta a data final para incluir todo o dia
    endDate.setHours(23, 59, 59, 999);
    filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= endDate);
    filteredBills = filteredBills.filter(b => new Date(b.dueDate) <= endDate);
  }

  const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expenses;

  const summary = [
    { description: 'Total de Receitas', value: income },
    { description: 'Total de Despesas', value: expenses },
    { description: 'Saldo Final', value: balance },
  ];
  
  let period = 'Completo';
  if (config.startDate && config.endDate) {
    period = `${formatDate(config.startDate)} - ${formatDate(config.endDate)}`;
  } else if (config.startDate) {
    period = `A partir de ${formatDate(config.startDate)}`;
  } else if (config.endDate) {
    period = `Até ${formatDate(config.endDate)}`;
  }

  return {
    summary,
    transactions: config.includeTransactions ? filteredTransactions : [],
    bills: config.includeBills ? filteredBills : [],
    user: currentUser ? { name: currentUser.username, email: currentUser.email } : null,
    period,
  };
};

// Exportar para CSV
const exportToCSV = (data: ReportData): Blob => {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += `Relatório Financeiro - Usuário: ${data.user?.name || 'N/A'} - Período: ${data.period}\n\n`;

  // Resumo
  csvContent += 'Resumo Financeiro\n';
  csvContent += 'Descrição,Valor\n';
  data.summary.forEach(item => {
    csvContent += `${item.description},${item.value.toFixed(2)}\n`;
  });
  csvContent += '\n';

  // Transações
  if (data.transactions.length > 0) {
    csvContent += 'Transações\n';
    csvContent += 'Data,Descrição,Categoria,Tipo,Valor\n';
    data.transactions.forEach(t => {
      csvContent += `${formatDate(t.date)},${t.title},${t.category},${t.type === 'income' ? 'Receita' : 'Despesa'},${t.amount.toFixed(2)}\n`;
    });
    csvContent += '\n';
  }

  // Contas
  if (data.bills.length > 0) {
    csvContent += 'Contas\n';
    csvContent += 'Vencimento,Descrição,Categoria,Status,Valor\n';
    data.bills.forEach(b => {
      csvContent += `${formatDate(b.dueDate)},${b.title},${b.category},${b.isPaid ? 'Paga' : 'Pendente'},${b.amount.toFixed(2)}\n`;
    });
  }

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

// Exportar para XLSX
const exportToXLSX = async (data: ReportData): Promise<Blob | null> => {
  if (!XLSX) {
    console.error('XLSX não está disponível');
    return null;
  }

  const wb = XLSX.utils.book_new();

  // Estilo para cabeçalhos
  const headerStyle = { font: { bold: true } };

  // Função para adicionar uma planilha
  const addSheet = (sheetName: string, sheetData: any[][], columnWidths: {wch:number}[]) => {
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = columnWidths;
    // Aplicar estilo aos cabeçalhos (primeira linha)
    if (sheetData.length > 0) {
        Object.keys(sheetData[0]).forEach((key, index) => {
            const cellRef = XLSX.utils.encode_cell({c:index, r:0});
            if(ws[cellRef]) {
                ws[cellRef].s = headerStyle;
            }
        });
    }
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  // 1. Planilha de Resumo
  const summaryData = [
    ['Resumo Financeiro - Período:', data.period],
    ['Usuário:', data.user?.name || 'N/A'],
    [], // Linha em branco
    ['Descrição', 'Valor'],
    ...data.summary.map(item => [item.description, item.value]),
  ];
  addSheet('Resumo', summaryData, [{wch: 30}, {wch: 20}]);
  // Formatar células de valor como moeda na planilha de resumo
  const summaryWs = wb.Sheets['Resumo'];
  data.summary.forEach((_item, index) => {
    const cellRef = XLSX.utils.encode_cell({ c: 1, r: index + 4 }); // +4 por causa dos cabeçalhos e linha em branco
    if (summaryWs[cellRef]) {
      summaryWs[cellRef].t = 'n'; // number type
      summaryWs[cellRef].z = 'R$ #,##0.00'; // currency format
    }
  });

  // 2. Planilha de Transações
  if (data.transactions.length > 0) {
    const transactionsHeader = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
    const transactionsBody = data.transactions.map(t => [
      formatDate(t.date),
      t.title,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount,
    ]);
    addSheet('Transações', [transactionsHeader, ...transactionsBody], [{wch: 12}, {wch: 30}, {wch: 20}, {wch: 15}, {wch: 15}]);
    // Formatar células de valor como moeda e data
    const transactionsWs = wb.Sheets['Transações'];
    data.transactions.forEach((_t, index) => {
        const dateCellRef = XLSX.utils.encode_cell({ c: 0, r: index + 1 });
        if (transactionsWs[dateCellRef]) {
            // A data já está formatada como string, se precisar como tipo data do Excel:
            // transactionsWs[dateCellRef].t = 'd'; 
            // transactionsWs[dateCellRef].z = 'dd/mm/yyyy';
        }
        const amountCellRef = XLSX.utils.encode_cell({ c: 4, r: index + 1 });
        if (transactionsWs[amountCellRef]) {
            transactionsWs[amountCellRef].t = 'n';
            transactionsWs[amountCellRef].z = 'R$ #,##0.00';
        }
    });
  }

  // 3. Planilha de Contas
  if (data.bills.length > 0) {
    const billsHeader = ['Vencimento', 'Descrição', 'Categoria', 'Status', 'Valor'];
    const billsBody = data.bills.map(b => [
      formatDate(b.dueDate),
      b.title,
      b.category,
      b.isPaid ? 'Paga' : 'Pendente',
      b.amount,
    ]);
    addSheet('Contas', [billsHeader, ...billsBody], [{wch: 12}, {wch: 30}, {wch: 20}, {wch: 15}, {wch: 15}]);
    // Formatar células de valor como moeda e data
    const billsWs = wb.Sheets['Contas'];
    data.bills.forEach((_b, index) => {
        const dateCellRef = XLSX.utils.encode_cell({ c: 0, r: index + 1 });
        if (billsWs[dateCellRef]) {
            // billsWs[dateCellRef].t = 'd';
            // billsWs[dateCellRef].z = 'dd/mm/yyyy';
        }
        const amountCellRef = XLSX.utils.encode_cell({ c: 4, r: index + 1 });
        if (billsWs[amountCellRef]) {
            billsWs[amountCellRef].t = 'n';
            billsWs[amountCellRef].z = 'R$ #,##0.00';
        }
    });
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Exportar para PDF
const exportToPDF = async (data: ReportData): Promise<Blob | null> => {
  if (!jsPDF) {
    console.error('jsPDF não está disponível');
    return null;
  }

  const doc = new jsPDF();
  let finalY = 20; // Posição Y inicial para o conteúdo

  // Título do Relatório
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(`Relatório Financeiro - ${data.user?.name || 'N/A'}`, 14, finalY);
  finalY += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Período: ${data.period}`, 14, finalY);
  finalY += 15;

  const tableConfig = {
    theme: 'striped' as const, // 'striped', 'grid', 'plain'
    headStyles: { fillColor: [76, 29, 149] as [number, number, number], textColor: 255, fontStyle: 'bold' as const },
    bodyStyles: { textColor: 50 },
    alternateRowStyles: { fillColor: [245, 245, 245] as [number, number, number] },
    startY: 0, // Será definido antes de cada tabela
    margin: { top: 10, right: 14, bottom: 10, left: 14 },
    tableWidth: 'auto' as const, // 'auto', 'wrap' or a number
  };

  // 1. Resumo Financeiro
  doc.setFontSize(14);
  doc.setTextColor(76, 29, 149);
  doc.text('Resumo Financeiro', 14, finalY);
  finalY += 8;
  (doc as any).autoTable({
    ...tableConfig,
    startY: finalY,
    head: [['Descrição', 'Valor']],
    body: data.summary.map(item => [item.description, formatCurrency(item.value)]),
    didDrawPage: (hookData: any) => { finalY = hookData.cursor.y; }
  });
  finalY += 10; // Espaço após a tabela

  // 2. Transações
  if (data.transactions.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(76, 29, 149);
    doc.text('Transações', 14, finalY);
    finalY += 8;
    (doc as any).autoTable({
      ...tableConfig,
      startY: finalY,
      head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: data.transactions.map(t => [
        formatDate(t.date),
        t.title,
        t.category,
        t.type === 'income' ? 'Receita' : 'Despesa',
        formatCurrency(t.amount),
      ]),
      didDrawPage: (hookData: any) => { finalY = hookData.cursor.y; }
    });
    finalY += 10;
  }

  // 3. Contas
  if (data.bills.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(76, 29, 149);
    doc.text('Contas', 14, finalY);
    finalY += 8;
    (doc as any).autoTable({
      ...tableConfig,
      startY: finalY,
      head: [['Vencimento', 'Descrição', 'Categoria', 'Status', 'Valor']],
      body: data.bills.map(b => [
        formatDate(b.dueDate),
        b.title,
        b.category,
        b.isPaid ? 'Paga' : 'Pendente',
        formatCurrency(b.amount),
      ]),
      didDrawPage: (hookData: any) => { finalY = hookData.cursor.y; }
    });
    // finalY += 10; // Não precisa de espaço extra se for a última tabela
  }
  
  try {
    return doc.output('blob');
  } catch (error) {
    console.error("Erro ao gerar PDF blob:", error);
    return null;
  }
};

// Função principal de exportação
export const exportFinancialReport = async (config: ExportConfig): Promise<Blob | null> => {
  try {
    const reportData = await getReportData(config);

    if (config.format === 'csv') {
      return exportToCSV(reportData);
    } else if (config.format === 'xlsx') {
      return await exportToXLSX(reportData);
    } else if (config.format === 'pdf') {
      return await exportToPDF(reportData);
    }
    return null;
  } catch (error) {
    console.error('Erro ao exportar relatório financeiro:', error);
    // Adicionar um alerta para o usuário pode ser útil aqui, dependendo da UI
    // alert('Ocorreu um erro ao gerar o relatório. Tente novamente.');
    return null;
  }
};
