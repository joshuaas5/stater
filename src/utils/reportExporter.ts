import { Transaction, Bill, CardItem } from '@/types';
import { getTransactions, getBills, getCurrentUser } from './localStorage';
import * as XLSX from 'xlsx';
// Importar jsPDF e o plugin autoTable
import jsPDF from 'jspdf';
// Importar o plugin jspdf-autotable para habilitar a função autoTable
import 'jspdf-autotable';

// Interface para a configurau00e7u00e3o de exportau00e7u00e3o
export interface ExportConfig {
  startDate?: string | Date;
  endDate?: string | Date;
  includeTransactions?: boolean;
  includeBills?: boolean;
  includeCharts?: boolean;
  format: 'csv' | 'xlsx' | 'pdf';
}

// Interface para os dados do relatu00f3rio
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
}

// Frases motivacionais sobre economia
const financialTips = [
  "Economize hoje para colher amahu00e3.",
  "Poupar nu00e3o u00e9 deixar de viver, u00e9 garantir seu futuro.",
  "Dinheiro economizado u00e9 dinheiro ganho.",
  "Invista em vocu00ea: o melhor investimento que existe.",
  "O segredo da independu00eancia financeira u00e9 gastar menos do que vocu00ea ganha.",
  "Pequenas economias diu00e1rias trazem grandes resultados ao longo do tempo.",
  "Planeje suas finanu00e7as hoje para realizar seus sonhos amahu00e3.",
  "Seja o diretor financeiro da sua vida.",
  "Economizar u00e9 um hu00e1bito que se constru00f3i dia apu00f3s dia.",
  "A disciplina financeira de hoje u00e9 a liberdade de amahu00e3."
];

// Funu00e7u00e3o para obter uma frase motivacional aleatu00f3ria
const getRandomFinancialTip = (): string => {
  const randomIndex = Math.floor(Math.random() * financialTips.length);
  return financialTips[randomIndex];
};

// Cores do tema Galileo (baseadas no CSS do aplicativo)
const COLORS = {
  // Cor principal do app (azul)
  PRIMARY: '#4F87FF',        // --galileo-accent no modo claro (convertido de HSL)
  PRIMARY_DARK: '#2D3849',   // --galileo-accent no modo escuro (convertido de HSL)
  
  // Cores de texto
  TEXT: '#374151',           // --galileo-text no modo claro (convertido de HSL)
  TEXT_SECONDARY: '#6B7280', // --galileo-secondaryText no modo claro (convertido de HSL)
  
  // Cores de fundo
  BACKGROUND: '#FFFFFF',     // --galileo-background no modo claro
  CARD: '#F8FAFC',           // --galileo-card no modo claro (convertido de HSL)
  
  // Cores semu00e2nticas
  POSITIVE: '#2DE370',       // --galileo-positive (convertido de HSL)
  NEGATIVE: '#FF4F56',       // --galileo-negative (convertido de HSL)
  
  // Cor de borda
  BORDER: '#D1DBE8',         // --galileo-border no modo claro (convertido de HSL)
  
  // Cores adicionais para gru00e1ficos
  CHART_COLORS: [
    '#4F87FF', '#FF4F56', '#2DE370', '#FFB84F', '#8B5CF6', 
    '#EC4899', '#14B8A6', '#F97316', '#A3E635', '#FCD34D'
  ]
};

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

// Funu00e7u00e3o para obter o resumo por categorias
const getCategorySummary = (transactions: Transaction[], type: 'income' | 'expense') => {
  const filteredTransactions = transactions.filter(t => t.type === type);
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Agrupar por categoria
  const categoryMap = new Map<string, number>();
  filteredTransactions.forEach(t => {
    const currentAmount = categoryMap.get(t.category) || 0;
    categoryMap.set(t.category, currentAmount + t.amount);
  });
  
  // Converter para array e calcular percentagens
  const categorySummary = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount); // Ordenar por valor (maior para menor)
  
  return categorySummary;
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

  // Separar transau00e7u00f5es entre entradas e sau00eddas
  const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
  const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
  
  // Calcular totais
  const incomeTotal = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = incomeTotal - expenseTotal;

  // Obter resumo por categorias
  const incomeByCategoryData = getCategorySummary(filteredTransactions, 'income');
  const expenseByCategoryData = getCategorySummary(filteredTransactions, 'expense');

  let period = 'Completo';
  if (config.startDate && config.endDate) {
    period = `${formatDate(config.startDate)} - ${formatDate(config.endDate)}`;
  } else if (config.startDate) {
    period = `A partir de ${formatDate(config.startDate)}`;
  } else if (config.endDate) {
    period = `Atu00e9 ${formatDate(config.endDate)}`;
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
    }
  };
};

// Funu00e7u00e3o para gerar um gru00e1fico de pizza para o PDF
const drawPieChart = (
  doc: jsPDF,
  data: { label: string; value: number; color: string }[],
  centerX: number,
  centerY: number,
  radius: number,
  title: string,
  showLegend: boolean = true
): void => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) return;
  
  // Desenhar tu00edtulo
  doc.setFontSize(12);
  doc.setTextColor(COLORS.TEXT);
  doc.text(title, centerX - (doc.getStringUnitWidth(title) * 12 / 2 / doc.internal.scaleFactor), centerY - radius - 10);
  
  // Desenhar o gru00e1fico de pizza
  let startAngle = 0;
  const legendItems: string[] = [];
  
  data.forEach((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 2 * Math.PI;
    
    // Adicionar legenda
    if (showLegend) {
      const percentageText = `${(percentage * 100).toFixed(1)}%`;
      legendItems.push(`${item.label}: ${percentageText} (${formatCurrency(item.value)})`);
    }
    
    // Desenhar segmento
    doc.setFillColor(item.color);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    
    // Desenhar setor circular
    doc.ellipse(centerX, centerY, radius, radius, 'F');
    doc.setFillColor(255, 255, 255);
    
    // Cortar setor para formar a pizza
    doc.saveGraphicsState();
    doc.moveTo(centerX, centerY);
    doc.lineTo(centerX + Math.cos(startAngle) * radius, centerY + Math.sin(startAngle) * radius);
    doc.arc(centerX, centerY, radius, startAngle, startAngle + angle, false);
    doc.lineTo(centerX, centerY);
    doc.clip();
    doc.setFillColor(item.color);
    doc.ellipse(centerX, centerY, radius, radius, 'F');
    doc.restoreGraphicsState();
    
    startAngle += angle;
  });
  
  // Desenhar legenda
  if (showLegend) {
    doc.setFontSize(8);
    doc.setTextColor(COLORS.TEXT);
    
    let legendY = centerY + radius + 10;
    legendItems.forEach((text, index) => {
      const color = data[index].color;
      
      // Desenhar quadrado colorido
      doc.setFillColor(color);
      doc.rect(centerX - radius, legendY, 5, 5, 'F');
      
      // Desenhar texto
      doc.setTextColor(COLORS.TEXT);
      doc.text(text, centerX - radius + 8, legendY + 4);
      
      legendY += 10;
    });
  }
};

// Funu00e7u00e3o para gerar os dados do gru00e1fico a partir do resumo por categorias
const generateChartData = (categorySummary: { category: string; amount: number; percentage: number }[]) => {
  return categorySummary.map((item, index) => ({
    label: item.category,
    value: item.amount,
    color: COLORS.CHART_COLORS[index % COLORS.CHART_COLORS.length]
  }));
};

// Funu00e7u00e3o para criar uma representau00e7u00e3o ASCII de um gru00e1fico para CSV
const generateAsciiChart = (data: { category: string; amount: number; percentage: number }[]): string => {
  if (data.length === 0) return "Sem dados para exibir gru00e1fico";
  
  let chart = "Gru00e1fico de distribuiu00e7u00e3o:\n";
  
  data.forEach(item => {
    // Limitar o tamanho da barra a 50 caracteres
    const barLength = Math.round(item.percentage / 2);
    const bar = '#'.repeat(barLength);
    chart += `${item.category.padEnd(20)} ${formatCurrency(item.amount).padEnd(15)} ${item.percentage.toFixed(1)}% ${bar}\n`;
  });
  
  return chart;
};

// Exportar para CSV - Com gráficos ASCII e exibição clara de parcelas
const exportToCSV = (data: ReportData): Blob => {
  // Obter dica financeira aleatória
  const financialTip = getRandomFinancialTip();
  
  let csvContent = "";
  
  // Cabeçalho do relatório com borda superior
  csvContent += `==================================================\n`;
  csvContent += `             RELATÓRIO FINANCEIRO              \n`;
  csvContent += `==================================================\n`;
  csvContent += `Usuário: ${data.user?.name || 'N/A'}\n`;
  csvContent += `Período: ${data.period}\n`;
  csvContent += `Gerado em: ${formatDate(new Date())}\n`;
  csvContent += `==================================================\n\n`;
  
  // RESUMO GERAL
  csvContent += `+-----------------+----------------------+\n`;
  csvContent += `|      RESUMO     |        VALOR         |\n`;
  csvContent += `+-----------------+----------------------+\n`;
  csvContent += `| Total Entradas  | ${formatCurrency(data.incomeTotal).padStart(20)} |\n`;
  csvContent += `| Total Saídas    | ${formatCurrency(data.expenseTotal).padStart(20)} |\n`;
  csvContent += `| Saldo Final     | ${formatCurrency(data.balance).padStart(20)} |\n`;
  csvContent += `+-----------------+----------------------+\n\n`;
  
  // Seção de ENTRADAS
  csvContent += `==================================================\n`;
  csvContent += `                    ENTRADAS                    \n`;
  csvContent += `==================================================\n`;
  csvContent += `Data,Descrição,Categoria,Valor\n`;
  
  if (data.incomeTransactions.length > 0) {
    data.incomeTransactions.forEach(t => {
      csvContent += `${formatDate(t.date)},${t.title},${t.category},${formatCurrency(t.amount)}\n`;
    });
  } else {
    csvContent += `Nenhuma entrada no período\n`;
  }
  
  // Total de ENTRADAS
  csvContent += `TOTAL DE ENTRADAS,,,${formatCurrency(data.incomeTotal)}\n\n`;
  
  // Gráfico de entradas por categoria
  if (data.categorySummary.income.length > 0) {
    csvContent += `--------------------------------------------------\n`;
    csvContent += `         DISTRIBUIÇÃO DE ENTRADAS POR CATEGORIA        \n`;
    csvContent += `--------------------------------------------------\n`;
    csvContent += generateAsciiChart(data.categorySummary.income);
    csvContent += `\n`;
  }
  
  // Seção de SAÍDAS
  csvContent += `==================================================\n`;
  csvContent += `                     SAÍDAS                     \n`;
  csvContent += `==================================================\n`;
  csvContent += `Data,Descrição,Categoria,Valor\n`;
  
  if (data.expenseTransactions.length > 0) {
    data.expenseTransactions.forEach(t => {
      csvContent += `${formatDate(t.date)},${t.title},${t.category},${formatCurrency(t.amount)}\n`;
    });
  } else {
    csvContent += `Nenhuma saída no período\n`;
  }
  
  // Total de SAÍDAS
  csvContent += `TOTAL DE SAÍDAS,,,${formatCurrency(data.expenseTotal)}\n\n`;
  
  // Gráfico de saídas por categoria
  if (data.categorySummary.expense.length > 0) {
    csvContent += `--------------------------------------------------\n`;
    csvContent += `         DISTRIBUIÇÃO DE SAÍDAS POR CATEGORIA        \n`;
    csvContent += `--------------------------------------------------\n`;
    csvContent += generateAsciiChart(data.categorySummary.expense);
    csvContent += `\n`;
  }
  
  // Seção de CONTAS
  csvContent += `==================================================\n`;
  csvContent += `                     CONTAS                     \n`;
  csvContent += `==================================================\n`;
  csvContent += `Vencimento,Descrição,Categoria,Status,Parcelas,Valor\n`;
  
  if (data.bills.length > 0) {
    data.bills.forEach(b => {
      // Formatar informação de parcelas
      const installmentInfo = b.totalInstallments && b.currentInstallment 
        ? `${b.currentInstallment}/${b.totalInstallments}` 
        : b.isRecurring ? 'Recorrente' : '-';
      
      csvContent += `${formatDate(b.dueDate)},${b.title},${b.category},${b.isPaid ? 'Paga' : 'Pendente'},${installmentInfo},${formatCurrency(b.amount)}\n`;
    });
  } else {
    csvContent += `Nenhuma conta no período\n`;
  }
  csvContent += `\n`;
  
  // Dica financeira
  csvContent += `==================================================\n`;
  csvContent += `DICA FINANCEIRA: ${financialTip}\n`;
  csvContent += `==================================================\n`;
  
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

// Função para criar um estilo personalizado para células no XLSX
const getCellStyle = (type: 'header' | 'subheader' | 'total' | 'normal' | 'income' | 'expense' | 'balance' | 'paid' | 'unpaid'): any => {
  // Estilos base
  const styles: Record<string, any> = {
    header: {
      fill: { fgColor: { rgb: COLORS.PRIMARY.replace('#', '') } },
      font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 14 },
      alignment: { horizontal: 'center', vertical: 'center' }
    },
    subheader: {
      fill: { fgColor: { rgb: COLORS.TEXT.replace('#', '') } },
      font: { color: { rgb: 'FFFFFF' }, bold: true, sz: 12 },
      alignment: { horizontal: 'center', vertical: 'center' }
    },
    normal: {
      font: { color: { rgb: COLORS.TEXT.replace('#', '') }, sz: 11 },
      alignment: { horizontal: 'left', vertical: 'center' }
    },
    total: {
      fill: { fgColor: { rgb: COLORS.CARD.replace('#', '') } },
      font: { color: { rgb: COLORS.TEXT.replace('#', '') }, bold: true, sz: 12 },
      alignment: { horizontal: 'right', vertical: 'center' }
    },
    income: {
      font: { color: { rgb: COLORS.POSITIVE.replace('#', '') }, bold: true, sz: 12 },
      alignment: { horizontal: 'right', vertical: 'center' }
    },
    expense: {
      font: { color: { rgb: COLORS.NEGATIVE.replace('#', '') }, bold: true, sz: 12 },
      alignment: { horizontal: 'right', vertical: 'center' }
    },
    balance: {
      fill: { fgColor: { rgb: COLORS.CARD.replace('#', '') } },
      font: { bold: true, sz: 12 },
      alignment: { horizontal: 'right', vertical: 'center' }
    },
    paid: {
      font: { color: { rgb: COLORS.POSITIVE.replace('#', '') }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    },
    unpaid: {
      font: { color: { rgb: COLORS.NEGATIVE.replace('#', '') }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  };
  
  return styles[type];
};

// Exportar para XLSX - Com gráficos e estilo aprimorado
const exportToXLSX = (data: ReportData): Blob => {
  // Criar nova planilha
  const wb = XLSX.utils.book_new();
  
  // Obter dica financeira aleatória
  const financialTip = getRandomFinancialTip();
  
  // Array de linhas para a planilha
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
  
  // Seção de ENTRADAS
  const incomeRows = [
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
  
  // Seção de distribuição de entradas (resumo por categoria)
  const incomeCategoryRows = [];
  if (data.categorySummary.income.length > 0) {
    incomeCategoryRows.push(['DISTRIBUIÇÃO DE ENTRADAS POR CATEGORIA', '', '', '', '', '']);
    incomeCategoryRows.push(['Categoria', 'Valor', '% do Total', '', '', '']);
    
    data.categorySummary.income.forEach(item => {
      incomeCategoryRows.push([item.category, formatCurrency(item.amount), `${item.percentage.toFixed(1)}%`, '', '', '']);
    });
    
    incomeCategoryRows.push(['', '', '', '', '', '']);
  }
  
  // Seção de SAÍDAS
  const expenseRows = [
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
  
  // Seção de distribuição de saídas (resumo por categoria)
  const expenseCategoryRows = [];
  if (data.categorySummary.expense.length > 0) {
    expenseCategoryRows.push(['DISTRIBUIÇÃO DE SAÍDAS POR CATEGORIA', '', '', '', '', '']);
    expenseCategoryRows.push(['Categoria', 'Valor', '% do Total', '', '', '']);
    
    data.categorySummary.expense.forEach(item => {
      expenseCategoryRows.push([item.category, formatCurrency(item.amount), `${item.percentage.toFixed(1)}%`, '', '', '']);
    });
    
    expenseCategoryRows.push(['', '', '', '', '', '']);
  }
  
  // Seção de CONTAS
  const billRows = [
    ['CONTAS', '', '', '', '', ''],
    ['Vencimento', 'Descrição', 'Categoria', 'Status', 'Parcelas', 'Valor'],
  ];
  
  if (data.bills.length > 0) {
    data.bills.forEach(b => {
      // Formatar informação de parcelas
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
  
  // Adicionar dica financeira
  const tipRows = [
    ['DICA FINANCEIRA', '', '', '', '', ''],
    [financialTip, '', '', '', '', ''],
    ['', '', '', '', '', '']
  ];
  
  // Combinar todas as seções
  const allRows = [
    ...headerRows,
    ...incomeRows,
    ...incomeCategoryRows,
    ...expenseRows,
    ...expenseCategoryRows,
    ...billRows,
    ...tipRows
  ];
  
  // Criar planilha a partir das linhas
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  
  // Configurar estilos para células específicas
  const mergeCells: any[] = [];
  
  // Estilizar e mesclar células
  if (!ws['!cols']) ws['!cols'] = [];
  ws['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  
  // Função para aplicar estilo a uma célula
  const setCellStyle = (addr: string, style: any) => {
    if (!ws[addr]) return;
    if (!ws[addr].s) ws[addr].s = {};
    Object.assign(ws[addr].s, style);
  };
  
  // Aplicar estilos ao cabeçalho principal
  setCellStyle('A1', getCellStyle('header'));
  mergeCells.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });
  
  // Aplicar estilos aos subcabeçalhos
  for (let i = 1; i < 4; i++) {
    setCellStyle(`A${i+1}`, getCellStyle('normal'));
    mergeCells.push({ s: { r: i, c: 0 }, e: { r: i, c: 5 } });
  }
  
  // Aplicar estilos ao resumo
  setCellStyle('A6', getCellStyle('subheader'));
  mergeCells.push({ s: { r: 5, c: 0 }, e: { r: 5, c: 5 } });
  
  for (let i = 6; i < 9; i++) {
    setCellStyle(`B${i+1}`, getCellStyle('normal'));
    setCellStyle(`C${i+1}`, i === 6 ? getCellStyle('income') : i === 7 ? getCellStyle('expense') : getCellStyle('balance'));
  }
  
  // Função para encontrar o índice da linha com um texto específico
  const findRowIndex = (text: string, startIndex: number = 0): number => {
    for (let i = startIndex; i < allRows.length; i++) {
      if (allRows[i][0] === text) return i;
    }
    return -1;
  };
  
  // Índices para cada seção
  const incomeIndex = findRowIndex('ENTRADAS');
  const incomeCategoryIndex = findRowIndex('DISTRIBUIÇÃO DE ENTRADAS POR CATEGORIA');
  const expenseIndex = findRowIndex('SAÍDAS', incomeCategoryIndex + 1);
  const expenseCategoryIndex = findRowIndex('DISTRIBUIÇÃO DE SAÍDAS POR CATEGORIA', expenseIndex + 1);
  const billsIndex = findRowIndex('CONTAS', expenseCategoryIndex + 1);
  const tipIndex = findRowIndex('DICA FINANCEIRA', billsIndex + 1);
  
  // Aplicar estilos às seções
  if (incomeIndex >= 0) {
    setCellStyle(`A${incomeIndex+1}`, getCellStyle('subheader'));
    mergeCells.push({ s: { r: incomeIndex, c: 0 }, e: { r: incomeIndex, c: 5 } });
    
    // Cabeçalhos da tabela
    for (let i = 0; i < 4; i++) {
      setCellStyle(`${String.fromCharCode(65 + i)}${incomeIndex+2}`, getCellStyle('total'));
    }
  }
  
  if (incomeCategoryIndex >= 0) {
    setCellStyle(`A${incomeCategoryIndex+1}`, getCellStyle('subheader'));
    mergeCells.push({ s: { r: incomeCategoryIndex, c: 0 }, e: { r: incomeCategoryIndex, c: 5 } });
    
    // Cabeçalhos da tabela
    for (let i = 0; i < 3; i++) {
      setCellStyle(`${String.fromCharCode(65 + i)}${incomeCategoryIndex+2}`, getCellStyle('total'));
    }
  }
  
  if (expenseIndex >= 0) {
    setCellStyle(`A${expenseIndex+1}`, getCellStyle('subheader'));
    mergeCells.push({ s: { r: expenseIndex, c: 0 }, e: { r: expenseIndex, c: 5 } });
    
    // Cabeçalhos da tabela
    for (let i = 0; i < 4; i++) {
      setCellStyle(`${String.fromCharCode(65 + i)}${expenseIndex+2}`, getCellStyle('total'));
    }
  }
  
  if (expenseCategoryIndex >= 0) {
    setCellStyle(`A${expenseCategoryIndex+1}`, getCellStyle('subheader'));
    mergeCells.push({ s: { r: expenseCategoryIndex, c: 0 }, e: { r: expenseCategoryIndex, c: 5 } });
    
    // Cabeçalhos da tabela
    for (let i = 0; i < 3; i++) {
      setCellStyle(`${String.fromCharCode(65 + i)}${expenseCategoryIndex+2}`, getCellStyle('total'));
    }
  }
  
  if (billsIndex >= 0) {
    setCellStyle(`A${billsIndex+1}`, getCellStyle('subheader'));
    mergeCells.push({ s: { r: billsIndex, c: 0 }, e: { r: billsIndex, c: 5 } });
    
    // Cabeçalhos da tabela
    for (let i = 0; i < 6; i++) {
      setCellStyle(`${String.fromCharCode(65 + i)}${billsIndex+2}`, getCellStyle('total'));
    }
    
    // Aplicar estilos aos status das contas
    if (data.bills.length > 0) {
      for (let i = 0; i < data.bills.length; i++) {
        const rowIndex = billsIndex + 2 + i + 1; // +1 para o cabeçalho da tabela
        setCellStyle(`D${rowIndex}`, data.bills[i].isPaid ? getCellStyle('paid') : getCellStyle('unpaid'));
      }
    }
  }
  
  if (tipIndex >= 0) {
    setCellStyle(`A${tipIndex+1}`, getCellStyle('subheader'));
    mergeCells.push({ s: { r: tipIndex, c: 0 }, e: { r: tipIndex, c: 5 } });
    setCellStyle(`A${tipIndex+2}`, getCellStyle('normal'));
    mergeCells.push({ s: { r: tipIndex+1, c: 0 }, e: { r: tipIndex+1, c: 5 } });
  }
  
  // Aplicar mesclagens
  if (mergeCells.length > 0) {
    ws['!merges'] = mergeCells;
  }
  
  // Adicionar planilha ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório Financeiro');
  
  // Gerar arquivo
  const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Exportar para PDF - Com gráficos e design aprimorado
const exportToPDF = (data: ReportData): Blob => {
  // Criar documento PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Definir margens
  const margin = 15;
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - 2 * margin;
  
  // Definir cores
  const colorPrimary = COLORS.PRIMARY;
  const colorText = COLORS.TEXT;
  const colorPositive = COLORS.POSITIVE;
  const colorNegative = COLORS.NEGATIVE;
  
  // Obter dica financeira aleatória
  const financialTip = getRandomFinancialTip();
  
  // Posição vertical atual
  let yPos = margin;
  
  // Função para adicionar título
  const addTitle = (title: string, fontSize: number = 16) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(colorPrimary);
    doc.setFont('helvetica', 'bold');
    
    const titleWidth = doc.getStringUnitWidth(title) * fontSize / doc.internal.scaleFactor;
    doc.text(title, (pageWidth - titleWidth) / 2, yPos);
    yPos += 10;
  };
  
  // Função para adicionar linha
  const addLine = (y: number) => {
    doc.setDrawColor(COLORS.BORDER);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
  };
  
  // Função para adicionar seção
  const addSection = (title: string) => {
    yPos += 5;
    addLine(yPos - 2);
    
    doc.setFillColor(colorPrimary);
    doc.setDrawColor(colorPrimary);
    doc.roundedRect(margin, yPos, contentWidth, 8, 1, 1, 'F');
    
    doc.setTextColor(255, 255, 255); // Branco
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 5, yPos + 5.5);
    
    yPos += 12;
  };
  
  // Função para verificar espaço e adicionar nova página se necessário
  const checkAndAddPage = (requiredSpace: number) => {
    const pageHeight = doc.internal.pageSize.height;
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };
  
  // Adicionar cabeçalho
  addTitle('RELATÓRIO FINANCEIRO');
  
  // Adicionar informações do usuário
  doc.setFontSize(10);
  doc.setTextColor(colorText);
  doc.setFont('helvetica', 'normal');
  doc.text(`Usuário: ${data.user?.name || 'N/A'}`, margin, yPos);
  yPos += 5;
  doc.text(`Período: ${data.period}`, margin, yPos);
  yPos += 5;
  doc.text(`Gerado em: ${formatDate(new Date())}`, margin, yPos);
  yPos += 10;
  
  // Adicionar resumo
  addSection('RESUMO');
  
  // Tabela de resumo
  const tableData = [
    ['Total Entradas', formatCurrency(data.incomeTotal)],
    ['Total Saídas', formatCurrency(data.expenseTotal)],
    ['Saldo Final', formatCurrency(data.balance)]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Descrição', 'Valor']],
    body: tableData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: COLORS.CARD,
      textColor: colorText,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      textColor: colorText
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right', cellWidth: 'auto' }
    },
    didDrawCell: (data: { section: string; column: { index: number }; row: { index: number } }) => {
        // Colorir valores positivos e negativos
        if (data.section === 'body' && data.column.index === 1) {
        const row = data.row.index;
        if (row === 0) { // Entradas
          doc.setTextColor(colorPositive);
        } else if (row === 1) { // Saídas
          doc.setTextColor(colorNegative);
{{ ... }}
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right', cellWidth: 'auto' }
    },
      didDrawCell: (data: { section: string; column: { index: number }; row: { index: number } }) => {
        // Colorir valores positivos e negativos
        if (data.section === 'body' && data.column.index === 1) {
        const row = data.row.index;
        if (row === 0) { // Entradas
        } else if (row === 2) { // Saldo
          if (tableData[row][1].includes('-')) {
            doc.setTextColor(colorNegative);
          } else {
            doc.setTextColor(colorPositive);
          }
        }
        
        doc.text(
          tableData[row][1],
          data.cell.x + data.cell.width - 2,
          data.cell.y + data.cell.height / 2 + 1,
          { align: 'right', baseline: 'middle' }
        );
      }
    }
  });
  
  // Atualizar posição após a tabela
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Verificar espaço para os gráficos
  checkAndAddPage(80);
  
  // Adicionar gráficos de resumo por categoria (se houver dados)
  if (data.categorySummary.income.length > 0 || data.categorySummary.expense.length > 0) {
    const incomeChartData = generateChartData(data.categorySummary.income);
    const expenseChartData = generateChartData(data.categorySummary.expense);
    
    // Desenhar gráficos lado a lado
    if (incomeChartData.length > 0 && expenseChartData.length > 0) {
      const chartRadius = 25;
      const chartCenterY = yPos + chartRadius + 5;
      
      // Título dos gráficos
      doc.setFontSize(12);
      doc.setTextColor(colorText);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribuição por Categoria', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      
      // Gráfico de entradas
      drawPieChart(
        doc,
        incomeChartData,
        margin + contentWidth * 0.25,
        chartCenterY,
        chartRadius,
        'Entradas',
        true
      );
      
      // Gráfico de saídas
      drawPieChart(
        doc,
        expenseChartData,
        margin + contentWidth * 0.75,
        chartCenterY,
        chartRadius,
        'Saídas',
        true
      );
      
      // Atualizar posição após os gráficos
      yPos = chartCenterY + chartRadius + 30; // Espaço extra para legendas
    } else if (incomeChartData.length > 0) {
      const chartRadius = 30;
      const chartCenterY = yPos + chartRadius + 5;
      
      drawPieChart(
        doc,
        incomeChartData,
        pageWidth / 2,
        chartCenterY,
        chartRadius,
        'Distribuição de Entradas por Categoria',
        true
      );
      
      yPos = chartCenterY + chartRadius + 30;
    } else if (expenseChartData.length > 0) {
      const chartRadius = 30;
      const chartCenterY = yPos + chartRadius + 5;
      
      drawPieChart(
        doc,
        expenseChartData,
        pageWidth / 2,
        chartCenterY,
        chartRadius,
        'Distribuição de Saídas por Categoria',
        true
      );
      
      yPos = chartCenterY + chartRadius + 30;
    }
  }
  
  // ENTRADAS
  checkAndAddPage(60); // Verificar se há espaço suficiente para a seção
  
  addSection('ENTRADAS');
  
  if (data.incomeTransactions.length > 0) {
    const incomeTableData = data.incomeTransactions.map(t => [
      formatDate(t.date),
      t.title,
      t.category,
      formatCurrency(t.amount)
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Data', 'Descrição', 'Categoria', 'Valor']],
      body: incomeTableData,
      foot: [['', '', 'TOTAL', formatCurrency(data.incomeTotal)]],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: COLORS.CARD,
        textColor: colorText,
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: COLORS.CARD,
        textColor: colorPositive,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        3: { halign: 'right' }
      },
      didDrawCell: (data: any) => {
        // Colorir valores de receitas
        if (data.section === 'body' && data.column.index === 3) {
          doc.setTextColor(colorPositive);
          doc.text(
            incomeTableData[data.row.index][3],
            data.cell.x + data.cell.width - 2,
            data.cell.y + data.cell.height / 2 + 1,
            { align: 'right', baseline: 'middle' }
          );
        }
      }
    });
    
    // Atualizar posição após a tabela
    yPos = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(colorText);
    doc.text('Nenhuma entrada no período.', margin, yPos);
    yPos += 10;
  }
  
  // SAÍDAS
  checkAndAddPage(60);
  
  addSection('SAÍDAS');
  
  if (data.expenseTransactions.length > 0) {
    const expenseTableData = data.expenseTransactions.map(t => [
      formatDate(t.date),
      t.title,
      t.category,
      formatCurrency(t.amount)
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Data', 'Descrição', 'Categoria', 'Valor']],
      body: expenseTableData,
      foot: [['', '', 'TOTAL', formatCurrency(data.expenseTotal)]],
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: COLORS.CARD,
        textColor: colorText,
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: COLORS.CARD,
        textColor: colorNegative,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        3: { halign: 'right' }
      },
      didDrawCell: (data: any) => {
        // Colorir valores de despesas
        if (data.section === 'body' && data.column.index === 3) {
          doc.setTextColor(colorNegative);
          doc.text(
            expenseTableData[data.row.index][3],
            data.cell.x + data.cell.width - 2,
            data.cell.y + data.cell.height / 2 + 1,
            { align: 'right', baseline: 'middle' }
          );
        }
      }
    });
    
    // Atualizar posição após a tabela
    yPos = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(colorText);
    doc.text('Nenhuma saída no período.', margin, yPos);
    yPos += 10;
  }
  
  // CONTAS
  checkAndAddPage(60);
  
  addSection('CONTAS');
  
  if (data.bills.length > 0) {
    const billsTableData = data.bills.map(b => {
      // Formatar informação de parcelas
      const installmentInfo = b.totalInstallments && b.currentInstallment 
        ? `${b.currentInstallment}/${b.totalInstallments}` 
        : b.isRecurring ? 'Recorrente' : '-';
      
      return [
        formatDate(b.dueDate),
        b.title,
        b.category,
        b.isPaid ? 'Paga' : 'Pendente',
        installmentInfo,
        formatCurrency(b.amount)
      ];
    });
    
    doc.autoTable({
      startY: yPos,
      head: [['Vencimento', 'Descrição', 'Categoria', 'Status', 'Parcelas', 'Valor']],
      body: billsTableData,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: COLORS.CARD,
        textColor: colorText,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'right' }
      },
      didDrawCell: (data: any) => {
        if (data.section === 'body') {
          // Colorir status
          if (data.column.index === 3) {
            const isPaid = billsTableData[data.row.index][3] === 'Paga';
            doc.setTextColor(isPaid ? colorPositive : colorNegative);
            doc.setFont('helvetica', isPaid ? 'normal' : 'bold');
            doc.text(
              billsTableData[data.row.index][3],
              data.cell.x + data.cell.width / 2,
              data.cell.y + data.cell.height / 2 + 1,
              { align: 'center', baseline: 'middle' }
            );
          }
          // Formatação do valor
          else if (data.column.index === 5) {
            doc.setTextColor(colorText);
            doc.setFont('helvetica', 'normal');
            doc.text(
              billsTableData[data.row.index][5],
              data.cell.x + data.cell.width - 2,
              data.cell.y + data.cell.height / 2 + 1,
              { align: 'right', baseline: 'middle' }
            );
          }
        }
      }
    });
    
    // Atualizar posição após a tabela
    yPos = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(colorText);
    doc.text('Nenhuma conta no período.', margin, yPos);
    yPos += 10;
  }
  
  // Adicionar dica financeira no final
  checkAndAddPage(20);
  
  yPos += 5;
  doc.setFillColor(COLORS.CARD);
  doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(colorPrimary);
  doc.setFont('helvetica', 'bold');
  doc.text('DICA FINANCEIRA:', margin + 5, yPos + 7);
  
  doc.setTextColor(colorText);
  doc.setFont('helvetica', 'normal');
  doc.text(financialTip, margin + 5, yPos + 15, {
    maxWidth: contentWidth - 10
  });
  
  // Retornar o documento como blob
  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
};

// Função principal para exportar relatório - unifica todas as outras
export const exportReport = async (config: ExportConfig): Promise<Blob> => {
  try {
    // Obter dados para o relatório
    const reportData = await getReportData(config);
    
    // Exportar de acordo com o formato solicitado
    switch (config.format) {
      case 'csv':
        return exportToCSV(reportData);
      case 'xlsx':
        return exportToXLSX(reportData);
      case 'pdf':
        return exportToPDF(reportData);
      default:
        throw new Error(`Formato não suportado: ${config.format}`);
    }
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    throw error;
  }
};

