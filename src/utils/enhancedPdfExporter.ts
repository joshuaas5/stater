import jsPDF from 'jspdf';
import { Transaction, Bill } from '@/types';

// Função para formatar moeda
function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para formatar data
function formatDateBR(date: string | Date) {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
}

// Função para formatar percentual
function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`;
}

// Interface para os dados do relatório
interface ReportData {
  userName: string;
  startDate: Date;
  endDate: Date;
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  incomeTransactions: Transaction[];
  expenseTransactions: Transaction[];
  bills: Bill[];
  financialTip: string;
}

// Função para calcular a distribuição por categoria
function calculateCategoryDistribution(transactions: Transaction[]) {
  const categories: { [key: string]: number } = {};
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Agrupar por categoria
  transactions.forEach(t => {
    const category = t.category || 'Sem categoria';
    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category] += t.amount;
  });
  
  // Converter para array e calcular percentagens
  const distribution = Object.entries(categories).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0
  }));
  
  // Ordenar por valor (maior para menor)
  return distribution.sort((a, b) => b.amount - a.amount);
}

// Função auxiliar para desenhar tabela simples
function drawTable(doc: any, headers: string[], data: string[][], startY: number, margin: number, options: {
  headerBgColor?: [number, number, number],
  headerTextColor?: [number, number, number],
  columnWidths?: number[],
  cellHeight?: number,
  fontSize?: number,
  highlightCols?: {[key: number]: [number, number, number]},
  onCellDraw?: (doc: any, rowIndex: number, colIndex: number, text: string) => boolean
}) {
  const {
    headerBgColor = [220, 220, 220],
    headerTextColor = [0, 0, 0],
    columnWidths,
    cellHeight = 10,
    fontSize = 10,
    highlightCols = {},
    onCellDraw
  } = options;
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const tableWidth = pageWidth - 2 * margin;
  
  // Calcular larguras das colunas se não forem fornecidas
  const colWidths = columnWidths || headers.map(() => tableWidth / headers.length);
  
  // Configurar fonte
  doc.setFontSize(fontSize);
  
  // Desenhar cabeçalho
  doc.setFillColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]);
  doc.setDrawColor(0);
  doc.setTextColor(headerTextColor[0], headerTextColor[1], headerTextColor[2]);
  doc.setFont('helvetica', 'bold');
  
  let x = margin;
  let y = startY;
  
  // Desenhar células de cabeçalho
  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], cellHeight, 'FD');
    doc.text(header, x + colWidths[i]/2, y + cellHeight/2, { align: 'center', baseline: 'middle' });
    x += colWidths[i];
  });
  
  y += cellHeight;
  
  // Desenhar linhas de dados
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  data.forEach((row, rowIndex) => {
    // Verificar se precisa adicionar uma nova página
    if (y > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
      
      // Redesenhar cabeçalho na nova página
      x = margin;
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]);
      
      headers.forEach((header, i) => {
        doc.rect(x, y, colWidths[i], cellHeight, 'FD');
        doc.text(header, x + colWidths[i]/2, y + cellHeight/2, { align: 'center', baseline: 'middle' });
        x += colWidths[i];
      });
      
      y += cellHeight;
      doc.setFont('helvetica', 'normal');
    }
    
    // Fundo zebrado para linhas alternadas
    if (rowIndex % 2 === 1) {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, tableWidth, cellHeight, 'F');
    }
    
    x = margin;
    row.forEach((cell, j) => {
      // Verificar se temos callback para colorização personalizada
      let customColorApplied = false;
      if (onCellDraw) {
        customColorApplied = onCellDraw(doc, rowIndex, j, cell);
      }
      
      // Se não tiver aplicado cor personalizada, verificar se a coluna tem cor destacada
      if (!customColorApplied) {
        if (highlightCols[j]) {
          const color = highlightCols[j];
          doc.setTextColor(color[0], color[1], color[2]);
        } else {
          doc.setTextColor(0, 0, 0);
        }
      }
      
      // Alinhar texto à direita para colunas numéricas (como valores)
      const align = j === row.length - 1 ? 'right' : 'left';
      const xPos = align === 'right' ? x + colWidths[j] - 2 : x + 2;
      
      doc.text(cell, xPos, y + cellHeight/2, { align, baseline: 'middle' });
      x += colWidths[j];
    });
    
    y += cellHeight;
  });
  
  // Retornar a posição Y final
  return y;
}

export function generateEnhancedPDF(data: ReportData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // Cores
  const primaryColor = [65, 105, 225]; // Azul
  const textColor = [0, 0, 0]; // Preto
  const positiveColor = [0, 128, 0]; // Verde
  const negativeColor = [255, 0, 0]; // Vermelho

  // Cabeçalho
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Relatório Financeiro', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Período: ${formatDateBR(data.startDate)} a ${formatDateBR(data.endDate)}`, pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.text(`Usuário: ${data.userName || ''}`, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // 1. Seção: Resumo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('RESUMO', margin, y);
  y += 10;

  // Dados da tabela de resumo
  const resumoData = [
    ['Total Entradas', formatCurrency(data.incomeTotal)],
    ['Total Saídas', formatCurrency(data.expenseTotal)],
    ['Saldo Final', formatCurrency(data.balance)]
  ];

  // Configurar colunas para tabela de resumo
  const resumoColWidths = [80, 60];
  
  // Criar cores destacadas para valores
  const resumoHighlightCols: {[key: number]: [number, number, number]} = {
    1: [0, 128, 0] // Verde para valores positivos (coluna 1)
  };
  
  // Iterar pelos dados para desenhar a tabela manualmente
  let resumoY = y;
  
  resumoData.forEach((row, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(row[0], margin, resumoY + 6);
    
    // Ajustar a cor com base no tipo de valor
    if (idx === 0) { // Entradas
      doc.setTextColor(positiveColor[0], positiveColor[1], positiveColor[2]);
    } else if (idx === 1) { // Saídas
      doc.setTextColor(negativeColor[0], negativeColor[1], negativeColor[2]);
    } else { // Saldo
      if (row[1].includes('-')) {
        doc.setTextColor(negativeColor[0], negativeColor[1], negativeColor[2]);
      } else {
        doc.setTextColor(positiveColor[0], positiveColor[1], positiveColor[2]);
      }
    }
    
    doc.text(row[1], margin + resumoColWidths[0] + resumoColWidths[1] - 2, resumoY + 6, { align: 'right' });
    resumoY += 10;
  });
  
  y = resumoY + 5;

  // 2. Seção: Entradas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('ENTRADAS', margin, y);
  y += 10;

  // Tabela de entradas
  const entradasHeaders = ['Data', 'Descrição', 'Categoria', 'Valor'];
  
  // Dados da tabela de entradas
  const entradasData = data.incomeTransactions.map(t => [
    formatDateBR(t.date),
    t.title,
    t.category || 'Sem categoria',
    formatCurrency(t.amount)
  ]);

  // Adicionar linha de total
  entradasData.push(['', '', 'TOTAL', formatCurrency(data.incomeTotal)]);

  // Definir larguras das colunas
  const entradasColWidths = [25, pageWidth - 2 * margin - 25 - 60 - 45, 60, 45];
  
  // Definir cores destacadas para valores
  const entradasHighlightCols: {[key: number]: [number, number, number]} = {
    3: [0, 128, 0] // Verde para valores na coluna 3 (Valor)
  };
  
  // Renderizar tabela de entradas usando nossa função personalizada
  if (entradasData.length > 0) {
    y = drawTable(doc, entradasHeaders, entradasData, y, margin, {
      columnWidths: entradasColWidths,
      highlightCols: entradasHighlightCols,
      cellHeight: 10,
      fontSize: 10
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Nenhuma entrada no período.', margin, y + 10);
    y += 20;
  }
  
  y += 15;

  // 3. Seção: Distribuição de Entradas por Categoria
  // Verificar se precisa adicionar nova página
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DISTRIBUIÇÃO DE ENTRADAS POR CATEGORIA', margin, y);
  y += 10;

  // Calcular distribuição por categoria para entradas
  const incomeDistribution = calculateCategoryDistribution(data.incomeTransactions);
  
  // Tabela de distribuição de entradas
  const incomeCategoryHeaders = ['Categoria', 'Valor', '% do Total'];
  
  // Dados da tabela de distribuição de entradas
  const incomeCategoryData = incomeDistribution.map(item => [
    item.category,
    formatCurrency(item.amount),
    formatPercentage(item.percentage)
  ]);

  // Definir larguras das colunas para distribuição
  const distributionColWidths = [(pageWidth - 2 * margin) * 0.6, (pageWidth - 2 * margin) * 0.2, (pageWidth - 2 * margin) * 0.2];
  
  // Renderizar tabela de distribuição de entradas
  if (incomeCategoryData.length > 0) {
    y = drawTable(doc, incomeCategoryHeaders, incomeCategoryData, y, margin, {
      columnWidths: distributionColWidths,
      cellHeight: 10,
      fontSize: 10
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Nenhuma entrada no período.', margin, y + 10);
    y += 20;
  }
  
  y += 15;

  // 4. Seção: Saídas
  // Verificar se precisa adicionar nova página
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SAÍDAS', margin, y);
  y += 10;

  // Tabela de saídas
  const saidasHeaders = ['Data', 'Descrição', 'Categoria', 'Valor'];
  
  // Dados da tabela de saídas
  const saidasData = data.expenseTransactions.map(t => [
    formatDateBR(t.date),
    t.title,
    t.category || 'Sem categoria',
    formatCurrency(t.amount)
  ]);

  // Adicionar linha de total
  saidasData.push(['', '', 'TOTAL', formatCurrency(data.expenseTotal)]);

  // Definir larguras das colunas (mesmas do que para entradas)
  const saidasColWidths = [25, pageWidth - 2 * margin - 25 - 60 - 45, 60, 45];
  
  // Definir cores destacadas para valores
  const saidasHighlightCols: {[key: number]: [number, number, number]} = {
    3: [255, 0, 0] // Vermelho para valores na coluna 3 (Valor)
  };
  
  // Renderizar tabela de saídas usando nossa função personalizada
  if (saidasData.length > 0) {
    y = drawTable(doc, saidasHeaders, saidasData, y, margin, {
      columnWidths: saidasColWidths,
      highlightCols: saidasHighlightCols,
      cellHeight: 10,
      fontSize: 10
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Nenhuma saída no período.', margin, y + 10);
    y += 20;
  }
  
  y += 15;

  // 5. Seção: Distribuição de Saídas por Categoria
  // Verificar se precisa adicionar nova página
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DISTRIBUIÇÃO DE SAÍDAS POR CATEGORIA', margin, y);
  y += 10;

  // Calcular distribuição por categoria para saídas
  const expenseDistribution = calculateCategoryDistribution(data.expenseTransactions);
  
  // Tabela de distribuição de saídas
  const expenseCategoryHeaders = ['Categoria', 'Valor', '% do Total'];
  
  // Dados da tabela de distribuição de saídas
  const expenseCategoryData = expenseDistribution.map(item => [
    item.category,
    formatCurrency(item.amount),
    formatPercentage(item.percentage)
  ]);

  // Definir larguras das colunas para distribuição (mesmas de antes)
  const expenseDistributionColWidths = [(pageWidth - 2 * margin) * 0.6, (pageWidth - 2 * margin) * 0.2, (pageWidth - 2 * margin) * 0.2];
  
  // Renderizar tabela de distribuição de saídas
  if (expenseCategoryData.length > 0) {
    y = drawTable(doc, expenseCategoryHeaders, expenseCategoryData, y, margin, {
      columnWidths: expenseDistributionColWidths,
      cellHeight: 10,
      fontSize: 10
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Nenhuma saída no período.', margin, y + 10);
    y += 20;
  }
  
  y += 15;

  // 6. Seção: Contas
  // Verificar se precisa adicionar nova página
  if (y > 240) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CONTAS', margin, y);
  y += 10;

  // Tabela de contas
  const contasHeaders = ['Vencimento', 'Descrição', 'Categoria', 'Status', 'Parcelas', 'Valor'];
  
  // Dados da tabela de contas
  const contasData = data.bills.map(b => {
    // Formatar informação de parcelas
    const installmentInfo = b.totalInstallments && b.currentInstallment 
      ? `${b.currentInstallment}/${b.totalInstallments}` 
      : b.isRecurring ? 'Recorrente' : '-';
    
    return [
      formatDateBR(b.dueDate),
      b.title,
      b.category || 'Sem categoria',
      b.isPaid ? 'Paga' : 'Pendente',
      installmentInfo,
      formatCurrency(b.amount)
    ];
  });

  // Definir larguras das colunas para contas
  const contasColWidths = [25, (pageWidth - 2 * margin - 25 - 50 - 50 - 40 - 50), 50, 50, 40, 50];
  
  // Função para personalizar cores (será usada durante o desenho)
  const colorizeStatusCell = (doc: any, rowIndex: number, colIndex: number, text: string) => {
    if (colIndex === 3) { // Coluna Status
      const isPaid = text === 'Paga';
      doc.setTextColor(
        isPaid ? positiveColor[0] : negativeColor[0],
        isPaid ? positiveColor[1] : negativeColor[1],
        isPaid ? positiveColor[2] : negativeColor[2]
      );
      return true; // Indica que aplicamos uma cor personalizada
    }
    return false; // Não aplicamos cor personalizada
  };
  
  // Renderizar tabela de contas
  if (contasData.length > 0) {
    y = drawTable(doc, contasHeaders, contasData, y, margin, {
      columnWidths: contasColWidths,
      cellHeight: 10,
      fontSize: 10,
      onCellDraw: colorizeStatusCell
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Nenhuma conta no período.', margin, y + 10);
    y += 20;
  }
  
  y += 15;

  // 7. Seção: Dica Financeira
  // Verificar se precisa adicionar nova página
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DICA FINANCEIRA', margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  // Quebrar texto da dica financeira em múltiplas linhas se necessário
  const splitText = doc.splitTextToSize(data.financialTip, pageWidth - 2 * margin);
  doc.text(splitText, margin, y);

  // Rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Página ${i} de ${pageCount} - ICTUS`, pageWidth / 2, 290, { align: 'center' });
  }

  return doc.output('blob');
}
