import { Transaction, Bill } from '@/types';
import { getTransactions, getBills, getCurrentUser } from './localStorage';
import * as XLSX from 'xlsx';

// Importamos apenas jsPDF sem dependências adicionais
import jsPDF from 'jspdf';

// Interface para a configuração de exportação
export interface ExportConfig {
  startDate?: string | Date;
  endDate?: string | Date;
  includeTransactions?: boolean;
  includeBills?: boolean;
  includeCharts?: boolean; // Embora não usado diretamente na exportação de tabela, mantido para consistência
  format: 'csv' | 'xlsx' | 'pdf';
}

// Interface para os dados do relatório - ajustada para separar entradas e saídas
interface ReportData {
  incomeTransactions: Transaction[];
  expenseTransactions: Transaction[];
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  bills: Bill[];
  user: { name?: string; email?: string } | null;
  period: string;
}

// Frases motivacionais sobre economia
const financialTips = [
  "Economize hoje para colher amanhã.",
  "Poupar não é deixar de viver, é garantir seu futuro.",
  "Dinheiro economizado é dinheiro ganho.",
  "Invista em você: o melhor investimento que existe.",
  "O segredo da independência financeira é gastar menos do que você ganha.",
  "Pequenas economias diárias trazem grandes resultados ao longo do tempo.",
  "Planeje suas finanças hoje para realizar seus sonhos amanhã.",
  "Seja o diretor financeiro da sua vida.",
  "Economizar é um hábito que se constrói dia após dia.",
  "A disciplina financeira de hoje é a liberdade de amanhã."
];

// Função para obter uma frase motivacional aleatória
const getRandomFinancialTip = (): string => {
  const randomIndex = Math.floor(Math.random() * financialTips.length);
  return financialTips[randomIndex];
};

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

  // Separar transações entre entradas e saídas
  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
  
  // Calcular totais
  const incomeTotal = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = incomeTotal - expenseTotal;

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
  };
};

// Exportar para CSV - Nova versão com layout padronizado
const exportToCSV = (data: ReportData): Blob => {
  // Obter dica financeira aleatória
  const financialTip = getRandomFinancialTip();
  
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Cabeçalho do relatório
  csvContent += `RELATÓRIO FINANCEIRO
`;
  csvContent += `Usuário: ${data.user?.name || 'N/A'}
`;
  csvContent += `Período: ${data.period}
`;
  csvContent += `
`;
  
  // Seção de ENTRADAS
  csvContent += `ENTRADAS
`;
  csvContent += `Data,Descrição,Categoria,Valor
`;
  
  if (data.incomeTransactions.length > 0) {
    data.incomeTransactions.forEach(t => {
      csvContent += `${formatDate(t.date)},${t.title},${t.category},${t.amount.toFixed(2)}
`;
    });
  } else {
    csvContent += `Nenhuma entrada no período
`;
  }
  
  // Total de ENTRADAS
  csvContent += `TOTAL DE ENTRADAS,,,${data.incomeTotal.toFixed(2)}
`;
  csvContent += `
`;
  
  // Seção de SAÍDAS
  csvContent += `SAÍDAS
`;
  csvContent += `Data,Descrição,Categoria,Valor
`;
  
  if (data.expenseTransactions.length > 0) {
    data.expenseTransactions.forEach(t => {
      csvContent += `${formatDate(t.date)},${t.title},${t.category},${t.amount.toFixed(2)}
`;
    });
  } else {
    csvContent += `Nenhuma saída no período
`;
  }
  
  // Total de SAÍDAS
  csvContent += `TOTAL DE SAÍDAS,,,${data.expenseTotal.toFixed(2)}
`;
  csvContent += `
`;
  
  // SALDO FINAL
  csvContent += `SALDO FINAL,,,${data.balance.toFixed(2)}
`;
  csvContent += `
`;
  
  // Seção de CONTAS
  csvContent += `CONTAS
`;
  csvContent += `Vencimento,Descrição,Categoria,Status,Valor
`;
  
  if (data.bills.length > 0) {
    data.bills.forEach(b => {
      csvContent += `${formatDate(b.dueDate)},${b.title},${b.category},${b.isPaid ? 'Paga' : 'Pendente'},${b.amount.toFixed(2)}
`;
    });
  } else {
    csvContent += `Nenhuma conta no período
`;
  }
  csvContent += `
`;
  
  // Dica financeira
  csvContent += `DICA FINANCEIRA: ${financialTip}
`;
  
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

// Exportar para XLSX - Nova versão com layout padronizado
const exportToXLSX = async (data: ReportData): Promise<Blob | null> => {
  if (!XLSX) {
    console.error('XLSX não está disponível');
    return null;
  }

  // Obter dica financeira aleatória
  const financialTip = getRandomFinancialTip();
  
  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Estilo para cabeçalhos
  const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "4C1D95" } }, font: { color: { rgb: "FFFFFF" } } };
  const subheaderStyle = { font: { bold: true } };
  const totalRowStyle = { font: { bold: true }, fill: { fgColor: { rgb: "E5E7EB" } } };

  // Função para aplicar estilos a uma planilha
  const applyStyles = (ws: any, styles: any) => {
    if (!ws['!rows']) ws['!rows'] = [];
    
    Object.keys(styles).forEach(ref => {
      if (!ws[ref]) return;
      if (!ws[ref].s) ws[ref].s = {};
      Object.assign(ws[ref].s, styles[ref]);
    });
  };

  // 1. Planilha principal - Resumo Financeiro
  const mainSheetData = [
    ['RELATÓRIO FINANCEIRO'], // A1
    [`Usuário: ${data.user?.name || 'N/A'}`], // A2
    [`Período: ${data.period}`], // A3
    [""], // A4 - linha em branco
    ['ENTRADAS'], // A5
    ['Data', 'Descrição', 'Categoria', 'Valor'] // A6-D6
  ];

  // Adicionar dados de entradas
  let currentRow = 7;
  if (data.incomeTransactions.length > 0) {
    data.incomeTransactions.forEach(t => {
      mainSheetData.push([
        formatDate(t.date),
        t.title,
        t.category,
        t.amount
      ]);
      currentRow++;
    });
  } else {
    mainSheetData.push(['Nenhuma entrada no período', '', '', '']);
    currentRow++;
  }

  // Total de entradas
  mainSheetData.push([
    'TOTAL DE ENTRADAS', '', '', data.incomeTotal
  ]);
  const incomeTotalRow = currentRow;
  currentRow++;

  // Linha em branco
  mainSheetData.push([""]);
  currentRow++;

  // Saídas
  mainSheetData.push(['SAÍDAS']);
  mainSheetData.push(['Data', 'Descrição', 'Categoria', 'Valor']);
  currentRow += 2;

  // Adicionar dados de saídas
  const expenseStartRow = currentRow;
  if (data.expenseTransactions.length > 0) {
    data.expenseTransactions.forEach(t => {
      mainSheetData.push([
        formatDate(t.date),
        t.title,
        t.category,
        t.amount
      ]);
      currentRow++;
    });
  } else {
    mainSheetData.push(['Nenhuma saída no período', '', '', '']);
    currentRow++;
  }

  // Total de saídas
  mainSheetData.push([
    'TOTAL DE SAÍDAS', '', '', data.expenseTotal
  ]);
  const expenseTotalRow = currentRow;
  currentRow++;

  // Linha em branco
  mainSheetData.push([""]);
  currentRow++;

  // Saldo final
  mainSheetData.push([
    'SALDO FINAL', '', '', data.balance
  ]);
  const balanceRow = currentRow;
  currentRow++;

  // Linha em branco
  mainSheetData.push([""]);
  currentRow++;

  // Contas
  mainSheetData.push(['CONTAS']);
  mainSheetData.push(['Vencimento', 'Descrição', 'Categoria', 'Status', 'Valor']);
  currentRow += 2;

  // Adicionar dados de contas
  if (data.bills.length > 0) {
    data.bills.forEach(b => {
      mainSheetData.push([
        formatDate(b.dueDate),
        b.title,
        b.category,
        b.isPaid ? 'Paga' : 'Pendente',
        b.amount
      ]);
      currentRow++;
    });
  } else {
    mainSheetData.push(['Nenhuma conta no período', '', '', '', '']);
    currentRow++;
  }

  // Linha em branco
  mainSheetData.push([""]);
  currentRow++;

  // Dica financeira
  mainSheetData.push([`DICA FINANCEIRA: ${financialTip}`]);

  // Criar planilha
  const ws = XLSX.utils.aoa_to_sheet(mainSheetData);

  // Definir largura das colunas
  ws['!cols'] = [
    { wch: 15 }, // A - Data
    { wch: 35 }, // B - Descrição
    { wch: 20 }, // C - Categoria
    { wch: 15 }, // D - Status (para contas)
    { wch: 15 }  // E - Valor
  ];

  // Preparar estilos
  const styles: any = {
    // Título e cabeçalho
    'A1': { font: { bold: true, sz: 16 } },
    'A2': { font: { bold: true } },
    'A3': { font: { bold: true } },
    
    // Seção de Entradas
    'A5': { font: { bold: true, sz: 14 }, fill: { fgColor: { rgb: "4C1D95" } }, font: { color: { rgb: "FFFFFF" } } },
    'A6': headerStyle, 'B6': headerStyle, 'C6': headerStyle, 'D6': headerStyle,
    
    // Total de Entradas
    [`A${incomeTotalRow}`]: totalRowStyle,
    [`B${incomeTotalRow}`]: totalRowStyle,
    [`C${incomeTotalRow}`]: totalRowStyle,
    [`D${incomeTotalRow}`]: totalRowStyle,
    
    // Seção de Saídas
    [`A${expenseStartRow-2}`]: { font: { bold: true, sz: 14 }, fill: { fgColor: { rgb: "4C1D95" } }, font: { color: { rgb: "FFFFFF" } } },
    [`A${expenseStartRow-1}`]: headerStyle, [`B${expenseStartRow-1}`]: headerStyle, [`C${expenseStartRow-1}`]: headerStyle, [`D${expenseStartRow-1}`]: headerStyle,
    
    // Total de Saídas
    [`A${expenseTotalRow}`]: totalRowStyle,
    [`B${expenseTotalRow}`]: totalRowStyle,
    [`C${expenseTotalRow}`]: totalRowStyle,
    [`D${expenseTotalRow}`]: totalRowStyle,
    
    // Saldo Final
    [`A${balanceRow}`]: { font: { bold: true }, fill: { fgColor: { rgb: "4C1D95" } }, font: { color: { rgb: "FFFFFF" } } },
    [`B${balanceRow}`]: { font: { bold: true }, fill: { fgColor: { rgb: "4C1D95" } }, font: { color: { rgb: "FFFFFF" } } },
    [`C${balanceRow}`]: { font: { bold: true }, fill: { fgColor: { rgb: "4C1D95" } }, font: { color: { rgb: "FFFFFF" } } },
    [`D${balanceRow}`]: { font: { bold: true }, fill: { fgColor: { rgb: "4C1D95" } }, font: { color: { rgb: "FFFFFF" } } },
  };

  // Aplicar estilos (obs: isso não funciona perfeitamente na versão atual do XLSX,
  // mas adicionamos para compatibilidade futura)
  applyStyles(ws, styles);

  // Formatar células de valor como moeda
  // Formato monetário para XLSX
  const currencyFormat = '"R$"#,##0.00';

  // Formatar valores de entradas
  if (data.incomeTransactions.length > 0) {
    data.incomeTransactions.forEach((_t, index) => {
      const cellRef = XLSX.utils.encode_cell({ c: 3, r: 6 + index });
      if (ws[cellRef]) {
        ws[cellRef].z = currencyFormat;
      }
    });
  }

  // Formatar total de entradas
  const incomeTotalRef = XLSX.utils.encode_cell({ c: 3, r: incomeTotalRow - 1 });
  if (ws[incomeTotalRef]) {
    ws[incomeTotalRef].z = currencyFormat;
  }

  // Formatar valores de saídas
  if (data.expenseTransactions.length > 0) {
    data.expenseTransactions.forEach((_t, index) => {
      const cellRef = XLSX.utils.encode_cell({ c: 3, r: expenseStartRow + index - 1 });
      if (ws[cellRef]) {
        ws[cellRef].z = currencyFormat;
      }
    });
  }

  // Formatar total de saídas
  const expenseTotalRef = XLSX.utils.encode_cell({ c: 3, r: expenseTotalRow - 1 });
  if (ws[expenseTotalRef]) {
    ws[expenseTotalRef].z = currencyFormat;
  }

  // Formatar saldo final
  const balanceRef = XLSX.utils.encode_cell({ c: 3, r: balanceRow - 1 });
  if (ws[balanceRef]) {
    ws[balanceRef].z = currencyFormat;
  }

  // Adicionar planilha ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório Financeiro');

  // Gerar arquivo XLSX
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Função auxiliar para desenhar tabela manualmente no PDF
const drawTable = (
  doc: jsPDF, 
  headers: string[], 
  rows: any[][], 
  startY: number, 
  config: any = {}
): number => {
  const margin = config.margin || { left: 14, right: 14 };
  const pageWidth = doc.internal.pageSize.width;
  const tableWidth = pageWidth - margin.left - margin.right;
  
  // Calcular largura das colunas (distribuição uniforme por padrão)
  const colWidths = config.colWidths || headers.map(() => tableWidth / headers.length);
  
  // Altura da linha
  const lineHeight = 10;
  let currentY = startY;
  
  // Estilo para cabeçalho
  doc.setFillColor(76, 29, 149); // Cor principal do app (roxo)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  
  // Desenhar cabeçalho
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
    
    // Verificar se precisa criar nova página
    if (currentY > doc.internal.pageSize.height - 20) {
      doc.addPage();
      currentY = 20;
      
      // Desenhar cabeçalho na nova página
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
  
  return currentY; // Retorna a posição Y após a tabela
};

// Função para desenhar linha total em uma tabela
const drawTotal = (
  doc: jsPDF, 
  label: string,
  value: string,
  startY: number,
  tableWidth: number,
  margin: {left: number, right: number},
  highlight: boolean = false
): number => {
  const lineHeight = 10;
  
  if (highlight) {
    doc.setFillColor(76, 29, 149); // Cor principal do app (roxo)
    doc.setTextColor(255, 255, 255);
  } else {
    doc.setFillColor(229, 231, 235); // Cinza claro
    doc.setTextColor(50, 50, 50);
  }
  
  doc.setFont('helvetica', 'bold');
  doc.rect(margin.left, startY, tableWidth, lineHeight, 'F');
  
  // Texto do rótulo (esquerda)
  doc.text(label, margin.left + 3, startY + lineHeight - 3);
  
  // Valor (direita)
  const valueWidth = doc.getStringUnitWidth(value) * doc.getFontSize() / doc.internal.scaleFactor;
  doc.text(value, margin.left + tableWidth - valueWidth - 3, startY + lineHeight - 3);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  
  return startY + lineHeight;
};

// Exportar para PDF - Nova versão com layout padronizado
const exportToPDF = async (data: ReportData): Promise<Blob | null> => {
  try {
    // Obter dica financeira aleatória
    const financialTip = getRandomFinancialTip();
    
    // Criar documento PDF
    const doc = new jsPDF();
    let finalY = 20; // Posição Y inicial para o conteúdo
    
    // Definições de margem e largura da tabela
    const margin = { left: 14, right: 14 };
    const pageWidth = doc.internal.pageSize.width;
    const tableWidth = pageWidth - margin.left - margin.right;

    // Título do Relatório
    doc.setFontSize(18);
    doc.setTextColor(76, 29, 149); // Cor principal do app (roxo)
    doc.text('RELATÓRIO FINANCEIRO', 14, finalY);
    finalY += 8;
    
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text(`Usuário: ${data.user?.name || 'N/A'}`, 14, finalY);
    finalY += 6;
    
    doc.setFontSize(10);
    doc.text(`Período: ${data.period}`, 14, finalY);
    finalY += 15;

    // 1. Seção de ENTRADAS
    doc.setFontSize(14);
    doc.setTextColor(76, 29, 149);
    doc.text('ENTRADAS', 14, finalY);
    finalY += 8;
    
    // Tabela de entradas
    if (data.incomeTransactions.length > 0) {
      finalY = drawTable(
        doc,
        ['Data', 'Descrição', 'Categoria', 'Valor'],
        data.incomeTransactions.map(t => [
          formatDate(t.date),
          t.title,
          t.category,
          formatCurrency(t.amount)
        ]),
        finalY,
        { colWidths: [30, 70, 50, 30] }
      );
    } else {
      finalY = drawTable(
        doc,
        ['Data', 'Descrição', 'Categoria', 'Valor'],
        [['Nenhuma entrada no período', '', '', '']],
        finalY,
        { colWidths: [30, 70, 50, 30] }
      );
    }
    
    // Total de entradas
    finalY = drawTotal(
      doc,
      'TOTAL DE ENTRADAS',
      formatCurrency(data.incomeTotal),
      finalY,
      tableWidth,
      margin
    );
    finalY += 10;
    
    // 2. Seção de SAÍDAS
    doc.setFontSize(14);
    doc.setTextColor(76, 29, 149);
    doc.text('SAÍDAS', 14, finalY);
    finalY += 8;
    
    // Tabela de saídas
    if (data.expenseTransactions.length > 0) {
      finalY = drawTable(
        doc,
        ['Data', 'Descrição', 'Categoria', 'Valor'],
        data.expenseTransactions.map(t => [
          formatDate(t.date),
          t.title,
          t.category,
          formatCurrency(t.amount)
        ]),
        finalY,
        { colWidths: [30, 70, 50, 30] }
      );
    } else {
      finalY = drawTable(
        doc,
        ['Data', 'Descrição', 'Categoria', 'Valor'],
        [['Nenhuma saída no período', '', '', '']],
        finalY,
        { colWidths: [30, 70, 50, 30] }
      );
    }
    
    // Total de saídas
    finalY = drawTotal(
      doc,
      'TOTAL DE SAÍDAS',
      formatCurrency(data.expenseTotal),
      finalY,
      tableWidth,
      margin
    );
    finalY += 10;
    
    // Saldo final
    finalY = drawTotal(
      doc,
      'SALDO FINAL',
      formatCurrency(data.balance),
      finalY,
      tableWidth,
      margin,
      true // Destacar com a cor principal
    );
    finalY += 15;
    
    // 3. Seção de CONTAS
    doc.setFontSize(14);
    doc.setTextColor(76, 29, 149);
    doc.text('CONTAS', 14, finalY);
    finalY += 8;
    
    // Tabela de contas
    if (data.bills.length > 0) {
      finalY = drawTable(
        doc,
        ['Vencimento', 'Descrição', 'Categoria', 'Status', 'Valor'],
        data.bills.map(b => [
          formatDate(b.dueDate),
          b.title,
          b.category,
          b.isPaid ? 'Paga' : 'Pendente',
          formatCurrency(b.amount)
        ]),
        finalY,
        { colWidths: [30, 60, 40, 30, 30] }
      );
    } else {
      finalY = drawTable(
        doc,
        ['Vencimento', 'Descrição', 'Categoria', 'Status', 'Valor'],
        [['Nenhuma conta no período', '', '', '', '']],
        finalY,
        { colWidths: [30, 60, 40, 30, 30] }
      );
    }
    finalY += 15;
    
    // Dica financeira
    doc.setFontSize(10);
    doc.setTextColor(76, 29, 149);
    doc.text('DICA FINANCEIRA:', 14, finalY);
    finalY += 5;
    
    doc.setTextColor(50, 50, 50);
    doc.text(financialTip, 14, finalY, { maxWidth: tableWidth });
    
    // Gerar o blob do PDF
    return doc.output('blob');
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return null;
  }
};

// Função auxiliar para formatar data para nome de arquivo (yyyymmdd)
const formatDateForFilename = (dateInput: Date | string): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// Função principal de exportação
export const exportFinancialReport = async (
  config: Omit<ExportConfig, 'format'>, 
  format: ExportFormat = 'csv'
): Promise<{ data: string | Blob | null; filename: string }> => {
  try {
    // Combinar os parâmetros em um único objeto de configuração
    const fullConfig: ExportConfig = {
      ...config,
      format,
      // Converter datas para strings se necessário
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
    console.error('Erro ao exportar relatório financeiro:', error);
    throw error; // Propagar o erro para ser tratado pelo chamador
  }
};
