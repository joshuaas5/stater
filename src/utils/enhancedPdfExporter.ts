import jsPDF from 'jspdf';
import 'jspdf-autotable';
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

  // Tabela de resumo
  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  // Cabeçalho da tabela de resumo (invisível)
  const resumoHeaders = [['', '']];
  
  // Dados da tabela de resumo
  const resumoData = [
    ['Total Entradas', formatCurrency(data.incomeTotal)],
    ['Total Saídas', formatCurrency(data.expenseTotal)],
    ['Saldo Final', formatCurrency(data.balance)]
  ];

  // Renderizar tabela de resumo
  (doc as any).autoTable({
    startY: y,
    head: resumoHeaders,
    body: resumoData,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', cellWidth: 'auto' }
    },
    didDrawCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 1) {
        const row = data.row.index;
        if (row === 0) { // Entradas
          doc.setTextColor(positiveColor[0], positiveColor[1], positiveColor[2]);
        } else if (row === 1) { // Saídas
          doc.setTextColor(negativeColor[0], negativeColor[1], negativeColor[2]);
        } else if (row === 2) { // Saldo
          const value = resumoData[row][1];
          if (value.includes('-')) {
            doc.setTextColor(negativeColor[0], negativeColor[1], negativeColor[2]);
          } else {
            doc.setTextColor(positiveColor[0], positiveColor[1], positiveColor[2]);
          }
        }
      }
    }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // 2. Seção: Entradas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('ENTRADAS', margin, y);
  y += 10;

  // Tabela de entradas
  const entradasHeaders = [['Data', 'Descrição', 'Categoria', 'Valor']];
  
  // Dados da tabela de entradas
  const entradasData = data.incomeTransactions.map(t => [
    formatDateBR(t.date),
    t.title,
    t.category || 'Sem categoria',
    formatCurrency(t.amount)
  ]);

  // Adicionar linha de total
  const totalRow = ['', '', 'TOTAL', formatCurrency(data.incomeTotal)];

  // Renderizar tabela de entradas
  (doc as any).autoTable({
    startY: y,
    head: entradasHeaders,
    body: entradasData,
    foot: [totalRow],
    theme: 'striped',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 25 },
      3: { halign: 'right' }
    },
    didDrawCell: (data: any) => {
      // Colorir valores de entradas
      if (data.section === 'body' && data.column.index === 3) {
        doc.setTextColor(positiveColor[0], positiveColor[1], positiveColor[2]);
      }
    }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

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
  const incomeCategoryHeaders = [['Categoria', 'Valor', '% do Total']];
  
  // Dados da tabela de distribuição de entradas
  const incomeCategoryData = incomeDistribution.map(item => [
    item.category,
    formatCurrency(item.amount),
    formatPercentage(item.percentage)
  ]);

  // Renderizar tabela de distribuição de entradas
  (doc as any).autoTable({
    startY: y,
    head: incomeCategoryHeaders,
    body: incomeCategoryData,
    theme: 'striped',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' }
    }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

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
  const saidasHeaders = [['Data', 'Descrição', 'Categoria', 'Valor']];
  
  // Dados da tabela de saídas
  const saidasData = data.expenseTransactions.map(t => [
    formatDateBR(t.date),
    t.title,
    t.category || 'Sem categoria',
    formatCurrency(t.amount)
  ]);

  // Adicionar linha de total
  const totalSaidasRow = ['', '', 'TOTAL', formatCurrency(data.expenseTotal)];

  // Renderizar tabela de saídas
  (doc as any).autoTable({
    startY: y,
    head: saidasHeaders,
    body: saidasData,
    foot: [totalSaidasRow],
    theme: 'striped',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 25 },
      3: { halign: 'right' }
    },
    didDrawCell: (data: any) => {
      // Colorir valores de saídas
      if (data.section === 'body' && data.column.index === 3) {
        doc.setTextColor(negativeColor[0], negativeColor[1], negativeColor[2]);
      }
    }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

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
  const expenseCategoryHeaders = [['Categoria', 'Valor', '% do Total']];
  
  // Dados da tabela de distribuição de saídas
  const expenseCategoryData = expenseDistribution.map(item => [
    item.category,
    formatCurrency(item.amount),
    formatPercentage(item.percentage)
  ]);

  // Renderizar tabela de distribuição de saídas
  (doc as any).autoTable({
    startY: y,
    head: expenseCategoryHeaders,
    body: expenseCategoryData,
    theme: 'striped',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' }
    }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

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
  const contasHeaders = [['Vencimento', 'Descrição', 'Categoria', 'Status', 'Parcelas', 'Valor']];
  
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

  // Renderizar tabela de contas
  (doc as any).autoTable({
    startY: y,
    head: contasHeaders,
    body: contasData,
    theme: 'striped',
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
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
          const isPaid = contasData[data.row.index][3] === 'Paga';
          doc.setTextColor(isPaid ? positiveColor[0] : negativeColor[0], 
                          isPaid ? positiveColor[1] : negativeColor[1], 
                          isPaid ? positiveColor[2] : negativeColor[2]);
        }
      }
    }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

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
