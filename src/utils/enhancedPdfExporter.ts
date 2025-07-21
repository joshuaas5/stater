import jsPDF from 'jspdf';
import { Transaction, Bill } from '@/types';

// Função para formatar moeda
function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para formatar data
function formatDateBR(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
}

// Função para formatar percentual
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Interface para os dados do relatório (mantida)
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

// Função para calcular a distribuição por categoria (mantida)
function calculateCategoryDistribution(transactions: Transaction[]): Array<{ category: string; amount: number; percentage: number }> {
  const categories: { [key: string]: number } = {};
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  transactions.forEach(t => {
    const category = t.category || 'Sem categoria';
    categories[category] = (categories[category] || 0) + t.amount;
  });

  const distribution = Object.entries(categories).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0
  }));

  return distribution.sort((a, b) => b.amount - a.amount);
}

// Nova Função auxiliar para desenhar tabelas
function drawSimpleTable(
  doc: any,
  headers: string[],
  dataRows: string[][],
  startY: number,
  columnWidths: number[],
  options?: {
    rowHeight?: number;
    fontSize?: number;
    headerFillColor?: [number, number, number];
    headerFontColor?: [number, number, number];
    cellFontColor?: [number, number, number];
    borderColor?: [number, number, number];
    alternateRowFillColor?: [number, number, number] | null;
    isTotalRow?: (rowIndex: number, rowData: string[]) => boolean;
    columnAlignments?: Array<'left' | 'center' | 'right'>;
    margin?: number;
  }
): number {
  const margin = options?.margin ?? 15;
  const rowHeight = options?.rowHeight ?? 8;
  const fontSize = options?.fontSize ?? 9;
  const headerFillColor = options?.headerFillColor ?? [230, 230, 230]; // Cinza claro
  const headerFontColor = options?.headerFontColor ?? [0, 0, 0]; // Preto
  const cellFontColor = options?.cellFontColor ?? [0, 0, 0]; // Preto
  const borderColor = options?.borderColor ?? [0, 0, 0]; // Preto
  const alternateRowFillColor = options?.alternateRowFillColor ?? null; // Sem zebra por padrão
  const isTotalRow = options?.isTotalRow ?? (() => false);
  const columnAlignments = options?.columnAlignments ?? headers.map(() => 'left');

  let currentY = startY;
  const tableWidth = columnWidths.reduce((sum, w) => sum + w, 0);
  const pageHeight = doc.internal.pageSize.getHeight();

  const drawPageHeader = () => {
    let currentX = margin;
    headers.forEach((header, i) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'bold');

      // Define explicitamente as cores para o preenchimento do retângulo do cabeçalho
      doc.setFillColor(headerFillColor[0], headerFillColor[1], headerFillColor[2]);
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(0.1);
      doc.rect(currentX, currentY, columnWidths[i], rowHeight, 'FD');

      // Define explicitamente a cor para o texto do cabeçalho
      doc.setTextColor(headerFontColor[0], headerFontColor[1], headerFontColor[2]);
      doc.text(header, currentX + columnWidths[i] / 2, currentY + rowHeight / 2, { align: 'center', baseline: 'middle' });
      currentX += columnWidths[i];
    });
    currentY += rowHeight;
  };

  // Desenhar cabeçalho da tabela
  if (currentY + rowHeight > pageHeight - margin) {
    doc.addPage();
    currentY = margin;
  }
  drawPageHeader();

  // Desenhar linhas de dados
  dataRows.forEach((row, rowIndex) => {
    if (currentY + rowHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      drawPageHeader(); // Redesenhar cabeçalho na nova página
    }

    doc.setFontSize(fontSize);
    const isBoldRow = isTotalRow(rowIndex, row);
    doc.setFont('helvetica', isBoldRow ? 'bold' : 'normal');
    doc.setTextColor(...cellFontColor);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.1);

    let currentX = margin;

    // Fundo alternado (opcional)
    if (alternateRowFillColor && rowIndex % 2 !== 0) {
      doc.setFillColor(...alternateRowFillColor);
      doc.rect(currentX, currentY, tableWidth, rowHeight, 'F');
    }

    row.forEach((cellText, colIndex) => {
      doc.rect(currentX, currentY, columnWidths[colIndex], rowHeight, 'S'); // Apenas borda
      let xPos;
      const align = columnAlignments[colIndex] || 'left';
      if (align === 'right') {
        xPos = currentX + columnWidths[colIndex] - 2; // padding direito
      } else if (align === 'center') {
        xPos = currentX + columnWidths[colIndex] / 2;
      } else {
        xPos = currentX + 2; // padding esquerdo
      }
      doc.text(String(cellText ?? ''), xPos, currentY + rowHeight / 2, { align, baseline: 'middle' });
      currentX += columnWidths[colIndex];
    });
    currentY += rowHeight;
  });

  return currentY;
}

// Função principal para gerar o PDF
export function generateEnhancedPDF(data: ReportData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  const defaultTextColor: [number, number, number] = [0, 0, 0];
  const sectionTitleFontSize = 16;
  const defaultFontSize = 9;
  const tableHeaderBgColor: [number, number, number] = [230, 230, 230]; // Cinza claro
  const tableBorderColor: [number, number, number] = [50, 50, 50]; // Cinza escuro para bordas

  // Função para adicionar nova página se necessário
  const checkAndAddPage = (currentY: number, requiredSpace: number = 3 * 8) => {
    if (currentY + requiredSpace > pageHeight - margin) {
      doc.addPage();
      return margin;
    }
    return currentY;
  };

  // Função para desenhar título da seção
  const drawSectionTitle = (title: string, currentY: number): number => {
    currentY = checkAndAddPage(currentY, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(sectionTitleFontSize);
    doc.setTextColor(...defaultTextColor);
    doc.text(title.toUpperCase(), margin, currentY);
    return currentY + 8;
  };

  // Cabeçalho do Relatório
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...defaultTextColor);
  doc.text('RELATÓRIO FINANCEIRO', pageWidth / 2, y, { align: 'center' });
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Período: ${formatDateBR(data.startDate)} a ${formatDateBR(data.endDate)}`, pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.text(`Usuário: ${data.userName || 'N/A'}`, pageWidth / 2, y, { align: 'center' });
  y += 12;

  // 1. Seção: Resumo
  y = drawSectionTitle('RESUMO', y);
  const resumoData = [
    { label: 'Total Entradas:', value: formatCurrency(data.incomeTotal) },
    { label: 'Total Saídas:', value: formatCurrency(data.expenseTotal) },
    { label: 'Saldo Final:', value: formatCurrency(data.balance) }
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(defaultFontSize + 1); // Um pouco maior para o resumo
  resumoData.forEach(item => {
    y = checkAndAddPage(y, 8);
    doc.text(item.label, margin, y);
    doc.text(item.value, margin + 60, y, { align: 'left' });
    y += 7;
  });
  y += 5;

  const tableOptions = {
    fontSize: defaultFontSize,
    headerFillColor: tableHeaderBgColor,
    borderColor: tableBorderColor,
    margin: margin,
    rowHeight: 8,
    // alternateRowFillColor: [245, 245, 245] as [number, number, number] // Zebra sutil opcional
  };

  // 2. Seção: Entradas
  y = drawSectionTitle('ENTRADAS', y);
  const entradasHeaders = ['Data', 'Descrição', 'Categoria', 'Valor'];
  const entradasTableData = data.incomeTransactions.map(t => [
    formatDateBR(t.date),
    t.title,
    t.category || 'Sem categoria',
    formatCurrency(t.amount)
  ]);
  entradasTableData.push(['', '', 'TOTAL', formatCurrency(data.incomeTotal)]);
  const entradasColWidths = [25, pageWidth - margin * 2 - 25 - 45 - 35, 45, 35];
  const entradasAlignments: Array<'left' | 'center' | 'right'> = ['left', 'left', 'left', 'right'];
  y = drawSimpleTable(doc, entradasHeaders, entradasTableData, y, entradasColWidths, {
    ...tableOptions,
    columnAlignments: entradasAlignments,
    isTotalRow: (rowIndex) => rowIndex === entradasTableData.length - 1
  });
  y += 10;

  // 3. Seção: Distribuição de Entradas por Categoria
  y = drawSectionTitle('DISTRIBUIÇÃO DE ENTRADAS POR CATEGORIA', y);
  const incomeDistribution = calculateCategoryDistribution(data.incomeTransactions);
  const incomeCategoryHeaders = ['Categoria', 'Valor', '% do Total'];
  const incomeCategoryData = incomeDistribution.map(item => [
    item.category,
    formatCurrency(item.amount),
    formatPercentage(item.percentage)
  ]);
  const incomeDistColWidths = [(pageWidth - margin * 2) * 0.5, (pageWidth - margin * 2) * 0.25, (pageWidth - margin * 2) * 0.25];
  const incomeDistAlignments: Array<'left' | 'center' | 'right'> = ['left', 'right', 'right'];
  if (incomeCategoryData.length > 0) {
    y = drawSimpleTable(doc, incomeCategoryHeaders, incomeCategoryData, y, incomeDistColWidths, { ...tableOptions, columnAlignments: incomeDistAlignments });
  } else {
    y = checkAndAddPage(y, 8);
    doc.setFont('helvetica', 'italic').setFontSize(defaultFontSize).text('Nenhuma entrada para distribuir.', margin, y); y+=8;
  }
  y += 10;

  // 4. Seção: Saídas
  y = drawSectionTitle('SAÍDAS', y);
  const saidasHeaders = ['Data', 'Descrição', 'Categoria', 'Valor'];
  const saidasTableData = data.expenseTransactions.map(t => [
    formatDateBR(t.date),
    t.title,
    t.category || 'Sem categoria',
    formatCurrency(t.amount)
  ]);
  saidasTableData.push(['', '', 'TOTAL', formatCurrency(data.expenseTotal)]);
  const saidasColWidths = [25, pageWidth - margin * 2 - 25 - 45 - 35, 45, 35];
  const saidasAlignments: Array<'left' | 'center' | 'right'> = ['left', 'left', 'left', 'right'];
  y = drawSimpleTable(doc, saidasHeaders, saidasTableData, y, saidasColWidths, {
    ...tableOptions,
    columnAlignments: saidasAlignments,
    isTotalRow: (rowIndex) => rowIndex === saidasTableData.length - 1
  });
  y += 10;

  // 5. Seção: Distribuição de Saídas por Categoria
  y = drawSectionTitle('DISTRIBUIÇÃO DE SAÍDAS POR CATEGORIA', y);
  const expenseDistribution = calculateCategoryDistribution(data.expenseTransactions);
  const expenseCategoryHeaders = ['Categoria', 'Valor', '% do Total'];
  const expenseCategoryData = expenseDistribution.map(item => [
    item.category,
    formatCurrency(item.amount),
    formatPercentage(item.percentage)
  ]);
  const expenseDistColWidths = [(pageWidth - margin * 2) * 0.5, (pageWidth - margin * 2) * 0.25, (pageWidth - margin * 2) * 0.25];
  const expenseDistAlignments: Array<'left' | 'center' | 'right'> = ['left', 'right', 'right'];
  if (expenseCategoryData.length > 0) {
    y = drawSimpleTable(doc, expenseCategoryHeaders, expenseCategoryData, y, expenseDistColWidths, { ...tableOptions, columnAlignments: expenseDistAlignments });
  } else {
    y = checkAndAddPage(y, 8);
    doc.setFont('helvetica', 'italic').setFontSize(defaultFontSize).text('Nenhuma saída para distribuir.', margin, y); y+=8;
  }
  y += 10;

  // As seções Contas e Dica Financeira foram removidas conforme solicitado.

  // Rodapé em todas as páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150); // Cinza claro para rodapé
    doc.text(`Página ${i} de ${pageCount} - STATER`, pageWidth / 2, pageHeight - 7, { align: 'center' });
  }

  return doc.output('blob');
}
