import { Transaction, Bill } from '@/types';
import jsPDF from 'jspdf';

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

// Função para formatar valores monetários com proteção contra undefined
const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null) {
    return 'R$ 0,00';
  }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Função para formatar datas (dd/mm/yyyy)
const formatDate = (dateInput: Date | string): string => {
  if (!dateInput) return '';
  try {
    let date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return '';
  }
};

// Cores para o gráfico de pizza
const CHART_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#FF595E',
  '#8F2D56', '#218380', '#73D2DE', '#D90368', '#826AED'
];

// Implementação do PDF com gráfico de pizza sem usar autoTable
export const generateSimplePDFWithChart = (data: ReportData): Blob => {
  try {
    // Criar nova instância do jsPDF
    const doc = new jsPDF();
    
    // Cores
    const colorPrimary = '#4F87FF';  // Azul principal
    const colorText = '#374151';     // Texto escuro
    const colorPositive = '#2DE370'; // Verde para valores positivos
    const colorNegative = '#FF4F56'; // Vermelho para valores negativos
    const colorHeader = '#F8FAFC';   // Cor de fundo do cabeçalho
    
    // Configurações de página
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;
    
    // Título do relatório
    doc.setFontSize(18);
    doc.setTextColor(colorPrimary);
    doc.text('Relatório Financeiro', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Período e data de geração
    doc.setFontSize(12);
    doc.setTextColor(colorText);
    doc.text(`Período: ${data.period}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // BLOCO DE RESUMO 
    doc.setFontSize(14);
    doc.setTextColor(colorPrimary);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO', margin, yPos);
    yPos += 10;
    
    // Função para desenhar tabela simples
    const drawTable = (headers: string[], rows: string[][], startY: number, colWidths: number[]) => {
      let y = startY;
      const rowHeight = 8;
      
      // Desenhar fundo do cabeçalho
      doc.setFillColor(colorHeader);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
      
      // Desenhar cabeçalho
      doc.setTextColor(colorText);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      
      let x = margin;
      headers.forEach((header, index) => {
        doc.text(header, x + 2, y + 5);
        x += colWidths[index];
      });
      
      y += rowHeight;
      
      // Desenhar linhas de dados
      doc.setFont('helvetica', 'normal');
      
      rows.forEach((row, rowIndex) => {
        // Desenhar linha alternada em cinza claro
        if (rowIndex % 2 === 1) {
          doc.setFillColor('#F9FAFB');
          doc.rect(margin, y, contentWidth, rowHeight, 'F');
        }
        
        x = margin;
        row.forEach((cell, cellIndex) => {
          if (cellIndex === row.length - 1 && colWidths[cellIndex] > 0) {
            // Alinhar à direita para a última coluna se for valor
            const textWidth = doc.getTextWidth(cell);
            doc.text(cell, x + colWidths[cellIndex] - textWidth - 2, y + 5);
          } else {
            doc.text(cell, x + 2, y + 5);
          }
          x += colWidths[cellIndex];
        });
        
        y += rowHeight;
      });
      
      return y;
    };
    
    // Tabela de Resumo
    const summaryHeaders = ['Tipo', 'Valor'];
    const summaryRows = [
      ['Total Entradas', formatCurrency(data.incomeTotal)],
      ['Total Saídas', formatCurrency(data.expenseTotal)],
      ['Saldo Final', formatCurrency(data.balance)]
    ];
    
    // Definir cores para valores
    doc.setTextColor(colorPositive);
    doc.text(formatCurrency(data.incomeTotal), margin + 50 - doc.getTextWidth(formatCurrency(data.incomeTotal)) - 2, yPos + 13);
    
    doc.setTextColor(colorNegative);
    doc.text(formatCurrency(data.expenseTotal), margin + 50 - doc.getTextWidth(formatCurrency(data.expenseTotal)) - 2, yPos + 21);
    
    if (data.balance >= 0) {
      doc.setTextColor(colorPositive);
    } else {
      doc.setTextColor(colorNegative);
    }
    doc.text(formatCurrency(data.balance), margin + 50 - doc.getTextWidth(formatCurrency(data.balance)) - 2, yPos + 29);
    
    // Resetar cor
    doc.setTextColor(colorText);
    
    // Desenhar tabela simples
    yPos = drawTable(summaryHeaders, summaryRows, yPos, [50, contentWidth - 50]);
    yPos += 15;
    
    // GRÁFICO DE DESPESAS POR CATEGORIA
    if (data.categorySummary && data.categorySummary.expense && data.categorySummary.expense.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(colorPrimary);
      doc.setFont('helvetica', 'bold');
      doc.text('DISTRIBUIÇÃO DE GASTOS', margin, yPos);
      yPos += 10;
      
      // Preparar dados para a tabela de legenda
      const legendHeaders = ['', 'Categoria', 'Valor', 'Percentual'];
      const legendRows = data.categorySummary.expense.map((cat, index) => [
        ' ', // Espaço para o quadrado colorido
        cat.category,
        formatCurrency(cat.amount),
        `${cat.percentage.toFixed(1)}%`
      ]);
      
      // Incluir total na legenda
      legendRows.push([' ', 'TOTAL', formatCurrency(data.expenseTotal), '100%']);
      
      // Desenhar a tabela de legenda
      const legendStartY = yPos;
      yPos = drawTable(legendHeaders, legendRows, yPos, [10, contentWidth - 120, 60, 50]);
      
      // Desenhar quadrados coloridos na primeira coluna
      let legendY = legendStartY + 8; // Ajustar para a primeira linha de dados
      data.categorySummary.expense.forEach((cat, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        doc.setFillColor(color);
        doc.rect(margin + 2, legendY - 5, 6, 6, 'F');
        legendY += 8; // Altura da linha
      });
      
      // Colorir valores negativos na tabela
      doc.setTextColor(colorNegative);
      legendY = legendStartY + 8;
      data.categorySummary.expense.forEach((cat) => {
        const valueText = formatCurrency(cat.amount);
        const valueWidth = doc.getTextWidth(valueText);
        doc.text(valueText, margin + 10 + (contentWidth - 120) + 60 - valueWidth - 2, legendY);
        legendY += 8;
      });
      
      // Resetar cor
      doc.setTextColor(colorText);
      
      yPos += 10;
      
      // Desenhar gráfico de pizza
      const centerX = pageWidth / 2;
      const centerY = yPos + 40;
      const radius = 30;
      
      let startAngle = 0;
      data.categorySummary.expense.forEach((cat, index) => {
        const angle = (cat.percentage / 100) * 360;
        const endAngle = startAngle + angle;
        
        // Converter ângulos para radianos
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        // Definir cor para esta fatia
        const color = CHART_COLORS[index % CHART_COLORS.length];
        doc.setFillColor(color);
        
        // Desenhar fatia do gráfico
        doc.setLineWidth(0.1);
        doc.setDrawColor(255, 255, 255); // Borda branca
        
        // Começar caminho para a fatia
        doc.path([
          // Mover para o centro
          ['m', centerX, centerY],
          // Linha para o início da borda
          ['l', centerX + radius * Math.cos(startRad), centerY + radius * Math.sin(startRad)],
          // Arco para o fim da borda
          ['a', radius, radius, 0, angle > 180 ? 1 : 0, 1, 
             centerX + radius * Math.cos(endRad), centerY + radius * Math.sin(endRad)],
          // Linha de volta para o centro
          ['l', centerX, centerY],
          // Fechar caminho
          ['h']
        ], 'F');
        
        startAngle = endAngle;
      });
      
      // Avançar posição após o gráfico
      yPos += 90;
    }
    
    // BLOCO DE ENTRADAS
    if (yPos > doc.internal.pageSize.height - 80) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorPrimary);
    doc.text('ENTRADAS', margin, yPos);
    yPos += 10;
    
    // Tabela de Entradas
    if (data.incomeTransactions && data.incomeTransactions.length > 0) {
      const incomeHeaders = ['Data', 'Descrição', 'Categoria', 'Valor'];
      const incomeRows = data.incomeTransactions.map(transaction => [
        formatDate(transaction.date),
        transaction.title,
        transaction.category || '',
        formatCurrency(transaction.amount)
      ]);
      
      // Adicionar linha de total
      incomeRows.push(['', '', 'TOTAL', formatCurrency(data.incomeTotal)]);
      
      // Desenhar a tabela
      const incomeStartY = yPos;
      yPos = drawTable(incomeHeaders, incomeRows, yPos, [25, contentWidth - 145, 60, 60]);
      
      // Colorir valores positivos na tabela
      doc.setTextColor(colorPositive);
      let incomeY = incomeStartY + 8;
      data.incomeTransactions.forEach(() => {
        const valueText = formatCurrency(data.incomeTotal); // Usar como referência para largura
        const valueWidth = doc.getTextWidth(valueText);
        doc.text(formatCurrency(data.incomeTotal), margin + 25 + (contentWidth - 145) + 60 - valueWidth - 2, incomeY);
        incomeY += 8;
      });
      
      // Total em negrito
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(data.incomeTotal), margin + 25 + (contentWidth - 145) + 60 - doc.getTextWidth(formatCurrency(data.incomeTotal)) - 2, incomeY);
      
      // Resetar cor
      doc.setTextColor(colorText);
      doc.setFont('helvetica', 'normal');
      
      yPos += 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(colorText);
      doc.text('Nenhuma entrada no período.', margin, yPos);
      yPos += 20;
    }
    
    // BLOCO DE SAÍDAS
    if (yPos > doc.internal.pageSize.height - 80) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorPrimary);
    doc.text('SAÍDAS', margin, yPos);
    yPos += 10;
    
    // Tabela de Saídas
    if (data.expenseTransactions && data.expenseTransactions.length > 0) {
      const expenseHeaders = ['Data', 'Descrição', 'Categoria', 'Valor'];
      const expenseRows = data.expenseTransactions.map(transaction => [
        formatDate(transaction.date),
        transaction.title,
        transaction.category || '',
        formatCurrency(transaction.amount)
      ]);
      
      // Adicionar linha de total
      expenseRows.push(['', '', 'TOTAL', formatCurrency(data.expenseTotal)]);
      
      // Desenhar a tabela
      const expenseStartY = yPos;
      yPos = drawTable(expenseHeaders, expenseRows, yPos, [25, contentWidth - 145, 60, 60]);
      
      // Colorir valores negativos na tabela
      doc.setTextColor(colorNegative);
      let expenseY = expenseStartY + 8;
      data.expenseTransactions.forEach(() => {
        const valueText = formatCurrency(data.expenseTotal); // Usar como referência para largura
        const valueWidth = doc.getTextWidth(valueText);
        doc.text(formatCurrency(data.expenseTotal), margin + 25 + (contentWidth - 145) + 60 - valueWidth - 2, expenseY);
        expenseY += 8;
      });
      
      // Total em negrito
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(data.expenseTotal), margin + 25 + (contentWidth - 145) + 60 - doc.getTextWidth(formatCurrency(data.expenseTotal)) - 2, expenseY);
      
      // Resetar cor
      doc.setTextColor(colorText);
      doc.setFont('helvetica', 'normal');
      
      yPos += 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(colorText);
      doc.text('Nenhuma saída no período.', margin, yPos);
      yPos += 20;
    }
    
    // CONTAS
    if (yPos > doc.internal.pageSize.height - 80) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorPrimary);
    doc.text('CONTAS', margin, yPos);
    yPos += 10;
    
    if (data.bills && data.bills.length > 0) {
      const billHeaders = ['Vencimento', 'Descrição', 'Categoria', 'Status', 'Parcelas', 'Valor'];
      const billRows = data.bills.map(bill => {
        // Formatar informação de parcelas
        const installmentInfo = bill.totalInstallments && bill.currentInstallment 
          ? `${bill.currentInstallment}/${bill.totalInstallments}` 
          : bill.isRecurring ? 'Recorrente' : '-';
        
        return [
          formatDate(bill.dueDate),
          bill.title,
          bill.category || '',
          bill.isPaid ? 'Paga' : 'Pendente',
          installmentInfo,
          formatCurrency(bill.amount)
        ];
      });
      
      // Adicionar linha de total
      const totalBills = data.bills.reduce((sum, bill) => sum + bill.amount, 0);
      billRows.push(['', '', '', '', 'TOTAL', formatCurrency(totalBills)]);
      
      // Distribuir larguras das colunas
      const billWidths = [25, contentWidth - 235, 40, 40, 40, 50];
      
      // Desenhar a tabela
      const billStartY = yPos;
      yPos = drawTable(billHeaders, billRows, yPos, billWidths);
      
      // Colorir status (Paga/Pendente) e valores
      let billY = billStartY + 8;
      data.bills.forEach((bill) => {
        if (bill.isPaid) {
          doc.setTextColor(colorPositive);
        } else {
          doc.setTextColor(colorNegative);
        }
        
        // Posição do status
        const statusX = margin + billWidths[0] + billWidths[1] + billWidths[2] - 30;
        const statusText = bill.isPaid ? 'Paga' : 'Pendente';
        doc.text(statusText, statusX, billY);
        
        // Valor
        doc.setTextColor(colorText);
        const valueText = formatCurrency(bill.amount);
        const valueX = margin + billWidths[0] + billWidths[1] + billWidths[2] + billWidths[3] + billWidths[4] + billWidths[5] - doc.getTextWidth(valueText) - 2;
        doc.text(valueText, valueX, billY);
        
        billY += 8;
      });
      
      // Total em negrito
      doc.setFont('helvetica', 'bold');
      const totalX = margin + billWidths[0] + billWidths[1] + billWidths[2] + billWidths[3] + billWidths[4] + billWidths[5] - doc.getTextWidth(formatCurrency(totalBills)) - 2;
      doc.text(formatCurrency(totalBills), totalX, billY);
      
      // Resetar estilo
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colorText);
      
      yPos += 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(colorText);
      doc.text('Nenhuma conta no período.', margin, yPos);
      yPos += 20;
    }
    
    // DICA FINANCEIRA
    if (yPos > doc.internal.pageSize.height - 70) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorPrimary);
    doc.text('DICA FINANCEIRA', margin, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(colorText);
    
    // Caixa destacada para a dica
    const tipBoxWidth = contentWidth;
    const tipBoxHeight = 40;
    const tipBoxX = margin;
    const tipBoxY = yPos;
    
    // Desenhar caixa com borda azul clara
    doc.setDrawColor(colorPrimary);
    doc.setFillColor('#F0F5FF'); // Azul muito claro como fundo
    doc.setLineWidth(0.5);
    doc.roundedRect(tipBoxX, tipBoxY, tipBoxWidth, tipBoxHeight, 3, 3, 'FD');
    
    const tip = 'Poupe hoje para garantir seu futuro. Economizar mensalmente, mesmo que pouco, é o primeiro passo para a independência financeira.';
    doc.text(tip, margin + 5, yPos + 15, { maxWidth: contentWidth - 10 });
    yPos += tipBoxHeight + 15;
    
    // Rodapé estilizado
    doc.setFillColor(colorPrimary);
    doc.rect(0, doc.internal.pageSize.height - 25, pageWidth, 25, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor('#FFFFFF'); // Branco para o texto do rodapé
    doc.text('Relatório gerado por ICTUS - Seu aplicativo de gestão financeira', pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' });
    
    // Retornar o documento como blob
    return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  } catch (error) {
    console.error('Erro ao gerar PDF simples com gráfico:', error);
    throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
