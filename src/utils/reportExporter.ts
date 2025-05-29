import { Transaction, Bill } from '@/types';
import { getTransactions, getBills, getCurrentUser } from './localStorage';
import * as XLSX from 'xlsx';

// Importamos apenas jsPDF sem dependu00eancias adicionais
import jsPDF from 'jspdf';

// Interface para a configurau00e7u00e3o de exportau00e7u00e3o
export interface ExportConfig {
  startDate?: string | Date;
  endDate?: string | Date;
  includeTransactions?: boolean;
  includeBills?: boolean;
  includeCharts?: boolean; // Embora nu00e3o usado diretamente na exportau00e7u00e3o de tabela, mantido para consistu00eancia
  format: 'csv' | 'xlsx' | 'pdf';
}

// Interface para os dados do relatu00f3rio
interface ReportData {
  summary: Array<{ description: string; value: number }>;
  transactions: Transaction[];
  bills: Bill[];
  user: { name?: string; email?: string } | null;
  period: string;
}

// Funu00e7u00e3o para formatar valores monetu00e1rios
const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Funu00e7u00e3o para formatar datas (dd/mm/yyyy)
const formatDate = (dateInput: Date | string | undefined): string => {
  if (!dateInput) return '';
  let date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
  // Adiciona o fuso horu00e1rio para evitar problemas com datas UTC
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const correctedDate = new Date(date.getTime() + userTimezoneOffset);
  return correctedDate.toLocaleDateString('pt-BR');
};

// Funu00e7u00e3o principal para buscar e preparar os dados do relatu00f3rio
const getReportData = async (config: ExportConfig): Promise<ReportData> => {
  const currentUser = getCurrentUser();
  const transactions = getTransactions();
  const bills = getBills();

  let filteredTransactions = transactions;
  let filteredBills = bills;

  if (config.startDate) {
    const startDate = new Date(config.startDate);
    // Ajusta a data de inu00edcio para o comeu00e7o do dia
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
    period = `Atu00e9 ${formatDate(config.endDate)}`;
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
  csvContent += `Relatu00f3rio Financeiro - Usuu00e1rio: ${data.user?.name || 'N/A'} - Peru00edodo: ${data.period}\n\n`;

  // Resumo
  csvContent += 'Resumo Financeiro\n';
  csvContent += 'Descriu00e7u00e3o,Valor\n';
  data.summary.forEach(item => {
    csvContent += `${item.description},${item.value.toFixed(2)}\n`;
  });
  csvContent += '\n';

  // Transau00e7u00f5es
  if (data.transactions.length > 0) {
    csvContent += 'Transau00e7u00f5es\n';
    csvContent += 'Data,Descriu00e7u00e3o,Categoria,Tipo,Valor\n';
    data.transactions.forEach(t => {
      csvContent += `${formatDate(t.date)},${t.title},${t.category},${t.type === 'income' ? 'Receita' : 'Despesa'},${t.amount.toFixed(2)}\n`;
    });
    csvContent += '\n';
  }

  // Contas
  if (data.bills.length > 0) {
    csvContent += 'Contas\n';
    csvContent += 'Vencimento,Descriu00e7u00e3o,Categoria,Status,Valor\n';
    data.bills.forEach(b => {
      csvContent += `${formatDate(b.dueDate)},${b.title},${b.category},${b.isPaid ? 'Paga' : 'Pendente'},${b.amount.toFixed(2)}\n`;
    });
  }

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

// Exportar para XLSX
const exportToXLSX = async (data: ReportData): Promise<Blob | null> => {
  if (!XLSX) {
    console.error('XLSX nu00e3o estu00e1 disponu00edvel');
    return null;
  }

  const wb = XLSX.utils.book_new();

  // Estilo para cabeu00e7alhos
  const headerStyle = { font: { bold: true } };

  // Funu00e7u00e3o para adicionar uma planilha
  const addSheet = (sheetName: string, sheetData: any[][], columnWidths: {wch:number}[]) => {
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = columnWidths;
    // Aplicar estilo aos cabeu00e7alhos (primeira linha)
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
    ['Resumo Financeiro - Peru00edodo:', data.period],
    ['Usuu00e1rio:', data.user?.name || 'N/A'],
    [], // Linha em branco
    ['Descriu00e7u00e3o', 'Valor'],
    ...data.summary.map(item => [item.description, item.value]),
  ];
  addSheet('Resumo', summaryData, [{wch: 30}, {wch: 20}]);
  // Formatar cu00e9lulas de valor como moeda na planilha de resumo
  const summaryWs = wb.Sheets['Resumo'];
  data.summary.forEach((_item, index) => {
    const cellRef = XLSX.utils.encode_cell({ c: 1, r: index + 4 }); // +4 por causa dos cabeu00e7alhos e linha em branco
    if (summaryWs[cellRef]) {
      summaryWs[cellRef].t = 'n'; // number type
      summaryWs[cellRef].z = 'R$ #,##0.00'; // currency format
    }
  });

  // 2. Planilha de Transau00e7u00f5es
  if (data.transactions.length > 0) {
    const transactionsHeader = ['Data', 'Descriu00e7u00e3o', 'Categoria', 'Tipo', 'Valor'];
    const transactionsBody = data.transactions.map(t => [
      formatDate(t.date),
      t.title,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount,
    ]);
    addSheet('Transau00e7u00f5es', [transactionsHeader, ...transactionsBody], [{wch: 12}, {wch: 30}, {wch: 20}, {wch: 15}, {wch: 15}]);
    // Formatar cu00e9lulas de valor como moeda e data
    const transactionsWs = wb.Sheets['Transau00e7u00f5es'];
    data.transactions.forEach((_t, index) => {
        const dateCellRef = XLSX.utils.encode_cell({ c: 0, r: index + 1 });
        if (transactionsWs[dateCellRef]) {
            // A data ju00e1 estu00e1 formatada como string, se precisar como tipo data do Excel:
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
    const billsHeader = ['Vencimento', 'Descriu00e7u00e3o', 'Categoria', 'Status', 'Valor'];
    const billsBody = data.bills.map(b => [
      formatDate(b.dueDate),
      b.title,
      b.category,
      b.isPaid ? 'Paga' : 'Pendente',
      b.amount,
    ]);
    addSheet('Contas', [billsHeader, ...billsBody], [{wch: 12}, {wch: 30}, {wch: 20}, {wch: 15}, {wch: 15}]);
    // Formatar cu00e9lulas de valor como moeda e data
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

// Funu00e7u00e3o auxiliar para desenhar tabela manualmente no PDF (sem depender de autoTable)
const drawTable = (doc: jsPDF, headers: string[], rows: any[][], startY: number, config: any = {}) => {
  const margin = config.margin || { left: 14, right: 14 };
  const pageWidth = doc.internal.pageSize.width;
  const tableWidth = pageWidth - margin.left - margin.right;
  
  // Calcular largura das colunas (distribuiu00e7u00e3o uniforme por padru00e3o)
  const colWidths = config.colWidths || headers.map(() => tableWidth / headers.length);
  
  // Altura da linha
  const lineHeight = 10;
  let currentY = startY;
  
  // Estilo para cabeu00e7alho
  doc.setFillColor(76, 29, 149);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  
  // Desenhar cabeu00e7alho
  doc.rect(margin.left, currentY, tableWidth, lineHeight, 'F');
  let currentX = margin.left;
  headers.forEach((header, i) => {
    doc.text(header, currentX + 3, currentY + lineHeight - 3);
    currentX += colWidths[i];
  });
  currentY += lineHeight;
  
  // Estilo para corpo da tabela
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  
  // Desenhar linhas de dados
  let rowIndex = 0;
  for (const row of rows) {
    // Alternar cores de fundo para melhor legibilidade
    if (rowIndex % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin.left, currentY, tableWidth, lineHeight, 'F');
    }
    
    // Escrever dados da linha
    currentX = margin.left;
    row.forEach((cell, i) => {
      doc.text(String(cell).substring(0, 30), currentX + 3, currentY + lineHeight - 3);
      currentX += colWidths[i];
    });
    
    currentY += lineHeight;
    rowIndex++;
    
    // Verificar se precisa criar nova pu00e1gina
    if (currentY > doc.internal.pageSize.height - 20) {
      doc.addPage();
      currentY = 20;
      
      // Desenhar cabeu00e7alho na nova pu00e1gina
      doc.setFillColor(76, 29, 149);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      
      doc.rect(margin.left, currentY, tableWidth, lineHeight, 'F');
      currentX = margin.left;
      headers.forEach((header, i) => {
        doc.text(header, currentX + 3, currentY + lineHeight - 3);
        currentX += colWidths[i];
      });
      currentY += lineHeight;
      
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
    }
  }
  
  return currentY; // Retorna a posiu00e7u00e3o Y apu00f3s a tabela
};

// Exportar para PDF - implementau00e7u00e3o simplificada sem depender de autoTable
const exportToPDF = async (data: ReportData): Promise<Blob | null> => {
  try {
    // Criar documento PDF
    const doc = new jsPDF();
    let finalY = 20; // Posiu00e7u00e3o Y inicial para o conteu00fado

    // Tu00edtulo do Relatu00f3rio
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(`Relatu00f3rio Financeiro - ${data.user?.name || 'N/A'}`, 14, finalY);
    finalY += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Peru00edodo: ${data.period}`, 14, finalY);
    finalY += 15;

    // 1. Resumo Financeiro
    doc.setFontSize(14);
    doc.setTextColor(76, 29, 149);
    doc.text('Resumo Financeiro', 14, finalY);
    finalY += 8;

    // Desenhar tabela de resumo
    finalY = drawTable(
      doc, 
      ['Descriu00e7u00e3o', 'Valor'], 
      data.summary.map(item => [item.description, formatCurrency(item.value)]),
      finalY,
      { colWidths: [120, 60] }
    );
    finalY += 10; // Espau00e7o apu00f3s a tabela

    // 2. Transau00e7u00f5es
    if (data.transactions.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(76, 29, 149);
      doc.text('Transau00e7u00f5es', 14, finalY);
      finalY += 8;
      
      // Desenhar tabela de transau00e7u00f5es
      finalY = drawTable(
        doc, 
        ['Data', 'Descriu00e7u00e3o', 'Categoria', 'Tipo', 'Valor'], 
        data.transactions.map(t => [
          formatDate(t.date),
          t.title,
          t.category,
          t.type === 'income' ? 'Receita' : 'Despesa',
          formatCurrency(t.amount),
        ]),
        finalY,
        { colWidths: [30, 50, 40, 30, 30] }
      );
      finalY += 10;
    }

    // 3. Contas
    if (data.bills.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(76, 29, 149);
      doc.text('Contas', 14, finalY);
      finalY += 8;
      
      // Desenhar tabela de contas
      finalY = drawTable(
        doc, 
        ['Vencimento', 'Descriu00e7u00e3o', 'Categoria', 'Status', 'Valor'], 
        data.bills.map(b => [
          formatDate(b.dueDate),
          b.title,
          b.category,
          b.isPaid ? 'Paga' : 'Pendente',
          formatCurrency(b.amount),
        ]),
        finalY,
        { colWidths: [30, 50, 40, 30, 30] }
      );
    }
    
    // Gerar o blob do PDF
    return doc.output('blob');
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return null;
  }
};

// Exportar tipo de formato para uso externo
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// Funu00e7u00e3o auxiliar para formatar data para nome de arquivo (yyyymmdd)
const formatDateForFilename = (dateInput: Date | string): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// Funu00e7u00e3o principal de exportau00e7u00e3o
export const exportFinancialReport = async (
  config: Omit<ExportConfig, 'format'>, 
  format: ExportFormat = 'csv'
): Promise<{ data: string | Blob | null; filename: string }> => {
  try {
    // Combinar os paru00e2metros em um u00fanico objeto de configurau00e7u00e3o
    const fullConfig: ExportConfig = {
      ...config,
      format,
      // Converter datas para strings se necessu00e1rio
      startDate: config.startDate instanceof Date ? config.startDate.toISOString() : config.startDate,
      endDate: config.endDate instanceof Date ? config.endDate.toISOString() : config.endDate,
    };

    const reportData = await getReportData(fullConfig);
    
    // Gerar nome do arquivo com base nas datas
    const startDateStr = config.startDate ? formatDateForFilename(config.startDate) : 'inicio';
    const endDateStr = config.endDate ? formatDateForFilename(config.endDate) : 'atual';
    const dateRange = `${startDateStr}_${endDateStr}`;
    
    let result: Blob | null = null;
    
    if (format === 'csv') {
      result = exportToCSV(reportData);
    } else if (format === 'xlsx') {
      result = await exportToXLSX(reportData);
    } else if (format === 'pdf') {
      result = await exportToPDF(reportData);
    }
    
    return {
      data: result,
      filename: `ICTUS_Financeiro_${dateRange}.${format}`
    };
  } catch (error) {
    console.error('Erro ao exportar relatu00f3rio financeiro:', error);
    throw error; // Propagar o erro para ser tratado pelo chamador
  }
};
