import jsPDF from 'jspdf';
import { Transaction, Bill } from '@/types';
import { 
  BRAND_COLORS, 
  BRAND_INFO, 
  STATER_LOGO_BASE64,
  REPORT_FOOTER,
  REPORT_SECTIONS,
  formatCurrency, 
  formatDateBR,
  formatDateFull,
  formatPercentage,
  getRandomFinancialTip,
  hexToRGB
} from './reportBranding';

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
function calculateCategoryDistribution(
  transactions: Transaction[]
): Array<{ category: string; amount: number; percentage: number; color: string }> {
  const categories: { [key: string]: number } = {};
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  transactions.forEach(t => {
    const category = t.category || 'Sem categoria';
    categories[category] = (categories[category] || 0) + t.amount;
  });

  const distribution = Object.entries(categories).map(([category, amount], index) => ({
    category,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
    color: BRAND_COLORS.CHART_PALETTE[index % BRAND_COLORS.CHART_PALETTE.length]
  }));

  return distribution.sort((a, b) => b.amount - a.amount);
}

// Desenhar legenda do gráfico com barras visuais
function drawChartBars(
  doc: jsPDF,
  data: Array<{ category: string; amount: number; percentage: number; color: string }>,
  startX: number,
  startY: number,
  maxWidth: number
): number {
  let y = startY;
  const itemHeight = 8;
  const barHeight = 4;
  const barMaxWidth = 60;
  
  data.slice(0, 5).forEach((item) => {
    const rgb = hexToRGB(item.color);
    
    // Nome da categoria
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRGB(BRAND_COLORS.TEXT_PRIMARY));
    
    let categoryText = item.category;
    if (categoryText.length > 18) {
      categoryText = categoryText.substring(0, 17) + '...';
    }
    doc.text(categoryText, startX, y);
    
    // Barra de progresso
    const barWidth = (item.percentage / 100) * barMaxWidth;
    doc.setFillColor(...hexToRGB(BRAND_COLORS.BACKGROUND_CARD));
    doc.roundedRect(startX + 50, y - 3, barMaxWidth, barHeight, 1, 1, 'F');
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.roundedRect(startX + 50, y - 3, barWidth, barHeight, 1, 1, 'F');
    
    // Percentual e valor
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(formatPercentage(item.percentage), startX + 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(formatCurrency(item.amount), startX + maxWidth - 5, y, { align: 'right' });
    
    y += itemHeight;
  });
  
  return y;
}

// Desenhar tabela elegante
function drawTable(
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  startY: number,
  columnWidths: number[],
  options: {
    margin?: number;
    headerColor?: [number, number, number];
    alternateRows?: boolean;
    highlightLastRow?: boolean;
    columnAlignments?: Array<'left' | 'center' | 'right'>;
    valueColumnIndex?: number;
    isExpense?: boolean;
  } = {}
): number {
  const margin = options.margin ?? 15;
  const headerColor = options.headerColor ?? hexToRGB(BRAND_COLORS.PRIMARY);
  const alternateRows = options.alternateRows ?? true;
  const highlightLastRow = options.highlightLastRow ?? false;
  const columnAlignments = options.columnAlignments ?? headers.map(() => 'left');
  const valueColumnIndex = options.valueColumnIndex;
  const isExpense = options.isExpense ?? false;
  
  const rowHeight = 7;
  const fontSize = 8;
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
  
  let y = startY;
  
  // Função para desenhar cabeçalhos
  const drawHeaders = (): void => {
    doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.roundedRect(margin, y, totalWidth, rowHeight + 1, 1, 1, 'F');
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    
    let x = margin;
    headers.forEach((header, i) => {
      const align = columnAlignments[i];
      let textX = x + 2;
      if (align === 'center') textX = x + columnWidths[i] / 2;
      if (align === 'right') textX = x + columnWidths[i] - 2;
      
      doc.text(header, textX, y + rowHeight - 1.5, { 
        align: align === 'left' ? undefined : align 
      });
      x += columnWidths[i];
    });
    
    y += rowHeight + 1;
  };
  
  // Função para verificar e adicionar nova página
  const checkPage = (): boolean => {
    if (y + rowHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
      drawHeaders();
      return true;
    }
    return false;
  };
  
  // Desenhar cabeçalhos
  drawHeaders();
  
  // Desenhar linhas de dados
  rows.forEach((row, rowIndex) => {
    checkPage();
    
    const isLastRow = rowIndex === rows.length - 1 && highlightLastRow;
    const isAlternate = alternateRows && rowIndex % 2 === 1;
    
    // Fundo da linha
    if (isLastRow) {
      doc.setFillColor(...hexToRGB(BRAND_COLORS.BACKGROUND_CARD));
      doc.rect(margin, y, totalWidth, rowHeight, 'F');
    } else if (isAlternate) {
      doc.setFillColor(...hexToRGB(BRAND_COLORS.BACKGROUND_ALT));
      doc.rect(margin, y, totalWidth, rowHeight, 'F');
    }
    
    // Texto da linha
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isLastRow ? 'bold' : 'normal');
    
    let x = margin;
    row.forEach((cell, colIndex) => {
      // Cor do texto
      if (valueColumnIndex !== undefined && colIndex === valueColumnIndex) {
        if (isExpense) {
          doc.setTextColor(...hexToRGB(BRAND_COLORS.DANGER));
        } else {
          doc.setTextColor(...hexToRGB(BRAND_COLORS.SUCCESS));
        }
      } else {
        doc.setTextColor(...hexToRGB(BRAND_COLORS.TEXT_PRIMARY));
      }
      
      const align = columnAlignments[colIndex];
      let textX = x + 2;
      if (align === 'center') textX = x + columnWidths[colIndex] / 2;
      if (align === 'right') textX = x + columnWidths[colIndex] - 2;
      
      // Truncar texto se necessário
      let text = cell || '';
      const maxWidth = columnWidths[colIndex] - 4;
      while (doc.getTextWidth(text) > maxWidth && text.length > 3) {
        text = text.slice(0, -4) + '...';
      }
      
      doc.text(text, textX, y + rowHeight - 2, { 
        align: align === 'left' ? undefined : align 
      });
      x += columnWidths[colIndex];
    });
    
    y += rowHeight;
  });
  
  return y;
}

// Desenhar card de resumo com design moderno
function drawSummaryCard(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: [number, number, number]
): void {
  // Sombra sutil
  doc.setFillColor(0, 0, 0, 0.05);
  doc.roundedRect(x + 1, y + 1, width, height, 3, 3, 'F');
  
  // Fundo do card
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, width, height, 3, 3, 'F');
  
  // Borda colorida à esquerda
  doc.setFillColor(color[0], color[1], color[2]);
  doc.roundedRect(x, y, 4, height, 3, 3, 'F');
  doc.rect(x + 2, y, 2, height, 'F');
  
  // Label
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRGB(BRAND_COLORS.TEXT_SECONDARY));
  doc.text(label, x + 10, y + 10);
  
  // Valor
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(value, x + 10, y + 20);
}

// Função principal para gerar o PDF premium
export function generateEnhancedPDF(data: ReportData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ========== CABEÇALHO COM GRADIENTE ==========
  
  // Gradiente simulado no cabeçalho
  const headerHeight = 38;
  const gradientSteps = 30;
  for (let i = 0; i < gradientSteps; i++) {
    const ratio = i / gradientSteps;
    const r = Math.round(BRAND_COLORS.GRADIENT_PRIMARY.start[0] * (1 - ratio) + BRAND_COLORS.GRADIENT_PRIMARY.end[0] * ratio);
    const g = Math.round(BRAND_COLORS.GRADIENT_PRIMARY.start[1] * (1 - ratio) + BRAND_COLORS.GRADIENT_PRIMARY.end[1] * ratio);
    const b = Math.round(BRAND_COLORS.GRADIENT_PRIMARY.start[2] * (1 - ratio) + BRAND_COLORS.GRADIENT_PRIMARY.end[2] * ratio);
    doc.setFillColor(r, g, b);
    doc.rect(0, (headerHeight / gradientSteps) * i, pageWidth, headerHeight / gradientSteps + 0.5, 'F');
  }
  
  // Logo - apenas circulo branco (sem texto para evitar bugs de fonte)
  doc.setFillColor(255, 255, 255);
  doc.circle(margin + 10, 18, 9, 'F');
  
  // Titulo principal
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('RELATORIO FINANCEIRO', margin + 28, 16);
  
  // Subtitulo
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Stater - Inteligencia para prosperar', margin + 28, 24);
  
  // Informacoes do relatorio (lado direito)
  doc.setFontSize(8);
  const periodText = `${formatDateBR(data.startDate)} a ${formatDateBR(data.endDate)}`;
  doc.text(`Periodo: ${periodText}`, pageWidth - margin, 12, { align: 'right' });
  doc.text(`Usuario: ${data.userName || 'N/A'}`, pageWidth - margin, 19, { align: 'right' });
  doc.text(`Gerado: ${formatDateFull(new Date())}`, pageWidth - margin, 26, { align: 'right' });
  
  y = headerHeight + 10;
  
  // ========== CARDS DE RESUMO ==========
  
  const cardWidth = (contentWidth - 12) / 3;
  const cardHeight = 28;
  
  drawSummaryCard(
    doc, 'Receitas', formatCurrency(data.incomeTotal),
    margin, y, cardWidth, cardHeight,
    hexToRGB(BRAND_COLORS.SUCCESS)
  );
  
  drawSummaryCard(
    doc, 'Despesas', formatCurrency(data.expenseTotal),
    margin + cardWidth + 6, y, cardWidth, cardHeight,
    hexToRGB(BRAND_COLORS.DANGER)
  );
  
  drawSummaryCard(
    doc, 'Saldo', formatCurrency(data.balance),
    margin + (cardWidth + 6) * 2, y, cardWidth, cardHeight,
    data.balance >= 0 ? hexToRGB(BRAND_COLORS.PRIMARY) : hexToRGB(BRAND_COLORS.DANGER)
  );
  
  y += cardHeight + 12;
  
  // ========== SEÇÃO: RECEITAS ==========
  
  // Cabeçalho da seção com ícone
  doc.setFillColor(...hexToRGB(BRAND_COLORS.SUCCESS));
  doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(REPORT_SECTIONS.income, margin + 5, y + 6.5);
  y += 13;
  
  if (data.incomeTransactions.length > 0) {
    // Tabela de transações
    const incomeRows = data.incomeTransactions.map(t => [
      formatDateBR(t.date),
      t.title,
      t.category || 'Sem categoria',
      formatCurrency(t.amount)
    ]);
    incomeRows.push(['', '', 'TOTAL', formatCurrency(data.incomeTotal)]);
    
    const colWidths = [24, contentWidth - 24 - 38 - 34, 38, 34];
    y = drawTable(doc, ['Data', 'Descrição', 'Categoria', 'Valor'], incomeRows, y, colWidths, {
      margin,
      headerColor: hexToRGB(BRAND_COLORS.SUCCESS),
      highlightLastRow: true,
      columnAlignments: ['left', 'left', 'left', 'right'],
      valueColumnIndex: 3,
      isExpense: false
    });
    
    // Distribuicao por categoria
    const incomeDistribution = calculateCategoryDistribution(data.incomeTransactions);
    if (incomeDistribution.length > 0) {
      y += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRGB(BRAND_COLORS.TEXT_PRIMARY));
      doc.text(REPORT_SECTIONS.incomeByCategory, margin, y + 3);
      y += 8;
      y = drawChartBars(doc, incomeDistribution, margin, y, contentWidth);
    }
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...hexToRGB(BRAND_COLORS.TEXT_SECONDARY));
    doc.text('Nenhuma receita registrada no periodo.', margin, y + 4);
    y += 10;
  }
  
  y += 10;
  
  // ========== SECAO: DESPESAS ==========
  
  // Verificar espaco na pagina
  if (y + 60 > pageHeight - 30) {
    doc.addPage();
    y = margin;
  }
  
  doc.setFillColor(...hexToRGB(BRAND_COLORS.DANGER));
  doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(REPORT_SECTIONS.expenses, margin + 5, y + 6.5);
  y += 13;
  
  if (data.expenseTransactions.length > 0) {
    const expenseRows = data.expenseTransactions.map(t => [
      formatDateBR(t.date),
      t.title,
      t.category || 'Sem categoria',
      formatCurrency(t.amount)
    ]);
    expenseRows.push(['', '', 'TOTAL', formatCurrency(data.expenseTotal)]);
    
    const colWidths = [24, contentWidth - 24 - 38 - 34, 38, 34];
    y = drawTable(doc, ['Data', 'Descrição', 'Categoria', 'Valor'], expenseRows, y, colWidths, {
      margin,
      headerColor: hexToRGB(BRAND_COLORS.DANGER),
      highlightLastRow: true,
      columnAlignments: ['left', 'left', 'left', 'right'],
      valueColumnIndex: 3,
      isExpense: true
    });
    
    // Distribuicao por categoria
    const expenseDistribution = calculateCategoryDistribution(data.expenseTransactions);
    if (expenseDistribution.length > 0) {
      y += 6;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...hexToRGB(BRAND_COLORS.TEXT_PRIMARY));
      doc.text(REPORT_SECTIONS.expensesByCategory, margin, y + 3);
      y += 8;
      y = drawChartBars(doc, expenseDistribution, margin, y, contentWidth);
    }
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...hexToRGB(BRAND_COLORS.TEXT_SECONDARY));
    doc.text('Nenhuma despesa registrada no periodo.', margin, y + 4);
    y += 10;
  }
  
  y += 10;
  
  // ========== SEÇÃO: CONTAS ==========
  
  if (data.bills && data.bills.length > 0) {
    if (y + 50 > pageHeight - 30) {
      doc.addPage();
      y = margin;
    }
    
    doc.setFillColor(...hexToRGB(BRAND_COLORS.WARNING));
    doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(REPORT_SECTIONS.bills, margin + 5, y + 6.5);
    y += 13;
    
    const billRows = data.bills.map(b => {
      const installmentInfo = b.totalInstallments && b.currentInstallment 
        ? `${b.currentInstallment}/${b.totalInstallments}` 
        : b.isRecurring ? 'Rec.' : '-';
      
      return [
        formatDateBR(b.dueDate),
        b.title,
        b.isPaid ? 'Paga' : 'Pendente',
        installmentInfo,
        formatCurrency(b.amount)
      ];
    });
    
    const colWidths = [24, contentWidth - 24 - 30 - 22 - 32, 30, 22, 32];
    y = drawTable(doc, ['Vencimento', 'Descrição', 'Status', 'Parc.', 'Valor'], billRows, y, colWidths, {
      margin,
      headerColor: hexToRGB(BRAND_COLORS.WARNING),
      columnAlignments: ['left', 'left', 'center', 'center', 'right']
    });
    
    y += 10;
  }
  
  // ========== DICA FINANCEIRA ==========
  
  if (y + 28 > pageHeight - 25) {
    doc.addPage();
    y = margin;
  }
  
  const tip = data.financialTip || getRandomFinancialTip();
  
  // Card da dica com gradiente sutil
  doc.setFillColor(...hexToRGB(BRAND_COLORS.BACKGROUND_CARD));
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
  
  // Borda esquerda colorida
  doc.setFillColor(...hexToRGB(BRAND_COLORS.PRIMARY));
  doc.roundedRect(margin, y, 4, 24, 3, 3, 'F');
  doc.rect(margin + 2, y, 2, 24, 'F');
  
  // Titulo da dica
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...hexToRGB(BRAND_COLORS.PRIMARY));
  doc.text(REPORT_SECTIONS.tip, margin + 10, y + 10);
  
  // Texto da dica
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...hexToRGB(BRAND_COLORS.TEXT_PRIMARY));
  doc.text(`"${tip}"`, margin + 10, y + 18, { maxWidth: contentWidth - 20 });
  
  // ========== RODAPÉ EM TODAS AS PÁGINAS ==========
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Linha separadora
    doc.setDrawColor(...hexToRGB(BRAND_COLORS.BORDER));
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    
    // Rodapé
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRGB(BRAND_COLORS.TEXT_MUTED));
    
    // Esquerda
    doc.text(REPORT_FOOTER.generated, margin, pageHeight - 8);
    
    // Centro
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    
    // Direita - CTA
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRGB(BRAND_COLORS.PRIMARY));
    doc.text(BRAND_INFO.website, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  return doc.output('blob');
}
