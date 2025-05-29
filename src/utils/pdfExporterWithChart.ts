import { Transaction, Bill } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

// Implementação do PDF com gráfico de pizza
export const generatePDFWithChart = (data: ReportData): Blob => {
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
    
    // Tabela de Resumo com autoTable
    const summaryData = [
      ['Total Entradas', formatCurrency(data.incomeTotal)],
      ['Total Saídas', formatCurrency(data.expenseTotal)],
      ['Saldo Final', formatCurrency(data.balance)]
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [['Tipo', 'Valor']],
      body: summaryData,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: colorHeader,
        textColor: colorText,
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: colorText
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'right', cellWidth: 'auto' }
      },
      didDrawCell: (data: any) => {
        // Colorir valores positivos e negativos
        if (data.section === 'body' && data.column.index === 1) {
          const row = data.row.index;
          if (row === 0) { // Entradas
            doc.setTextColor(colorPositive);
          } else if (row === 1) { // Saídas
            doc.setTextColor(colorNegative);
          } else if (row === 2) { // Saldo
            if (summaryData[row][1].includes('-')) {
              doc.setTextColor(colorNegative);
            } else {
              doc.setTextColor(colorPositive);
            }
          }
          
          if (data.cell) {
            doc.text(
              summaryData[row][1],
              data.cell.x + data.cell.width - 2,
              data.cell.y + data.cell.height / 2 + 1,
              { align: 'right', baseline: 'middle' }
            );
          }
        }
      }
    });
    
    // Atualizar posição após a tabela
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // GRÁFICO DE DESPESAS POR CATEGORIA
    if (data.categorySummary && data.categorySummary.expense && data.categorySummary.expense.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(colorPrimary);
      doc.setFont('helvetica', 'bold');
      doc.text('DISTRIBUIÇÃO DE GASTOS', margin, yPos);
      yPos += 10;
      
      // Criar tabela de legenda para o gráfico
      const legendData = data.categorySummary.expense.map((cat, index) => [
        '', // Coluna para o quadrado colorido
        cat.category,
        formatCurrency(cat.amount),
        `${cat.percentage.toFixed(1)}%`
      ]);
      
      // Incluir total na legenda
      legendData.push([
        '',
        'TOTAL',
        formatCurrency(data.expenseTotal),
        '100%'
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['', 'Categoria', 'Valor', 'Percentual']],
        body: legendData,
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: colorHeader,
          textColor: colorText,
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: colorText
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 'auto' },
          2: { halign: 'right', cellWidth: 60 },
          3: { halign: 'right', cellWidth: 40 }
        },
        didDrawCell: (data: any) => {
          if (data.section === 'body') {
            // Desenhar quadrados coloridos na primeira coluna
            if (data.column.index === 0 && data.row.index < legendData.length - 1) {
              const color = CHART_COLORS[data.row.index % CHART_COLORS.length];
              doc.setFillColor(color);
              doc.rect(
                data.cell.x + 2,
                data.cell.y + 2,
                6,
                6,
                'F'
              );
            }
            
            // Destacar a linha de total
            if (data.row.index === legendData.length - 1) {
              doc.setFont('helvetica', 'bold');
              
              if (data.column.index === 1) {
                doc.setTextColor(colorText);
                doc.text(
                  'TOTAL',
                  data.cell.x + 2,
                  data.cell.y + data.cell.height / 2 + 1,
                  { baseline: 'middle' }
                );
              }
              
              if (data.column.index === 2) {
                doc.setTextColor(colorText);
                doc.text(
                  legendData[data.row.index][2],
                  data.cell.x + data.cell.width - 2,
                  data.cell.y + data.cell.height / 2 + 1,
                  { align: 'right', baseline: 'middle' }
                );
              }
            }
            // Valores normais
            else if (data.column.index === 2) {
              doc.setTextColor(colorNegative);
              doc.text(
                legendData[data.row.index][2],
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
      
      // Desenhar gráfico de pizza
      // Como não podemos usar o Recharts diretamente no PDF, vamos desenhar um gráfico simples
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorPrimary);
    doc.text('ENTRADAS', margin, yPos);
    yPos += 10;
    
    // Tabela de Entradas
    if (data.incomeTransactions && data.incomeTransactions.length > 0) {
      const incomeTableData = data.incomeTransactions.map(transaction => [
        formatDate(transaction.date),
        transaction.title,
        transaction.category || '',
        formatCurrency(transaction.amount)
      ]);
      
      // Adicionar linha de total
      incomeTableData.push([
        '',
        '',
        'TOTAL',
        formatCurrency(data.incomeTotal)
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Data', 'Descrição', 'Categoria', 'Valor']],
        body: incomeTableData,
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: colorHeader,
          textColor: colorText,
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: colorText
        },
        columnStyles: {
          0: { cellWidth: 25 },
          3: { halign: 'right' }
        },
        didDrawCell: (data: any) => {
          // Destacar os valores e a linha de total
          if (data.section === 'body') {
            const lastRow = incomeTableData.length - 1;
            
            // Linha de total em negrito
            if (data.row.index === lastRow) {
              doc.setFont('helvetica', 'bold');
              
              // Colorir o texto 'TOTAL'
              if (data.column.index === 2) {
                doc.setTextColor(colorText);
                doc.text(
                  'TOTAL',
                  data.cell.x + 2,
                  data.cell.y + data.cell.height / 2 + 1,
                  { baseline: 'middle' }
                );
              }
              
              // Colorir o valor total
              if (data.column.index === 3) {
                doc.setTextColor(colorPositive);
                doc.text(
                  incomeTableData[lastRow][3],
                  data.cell.x + data.cell.width - 2,
                  data.cell.y + data.cell.height / 2 + 1,
                  { align: 'right', baseline: 'middle' }
                );
              }
            }
            // Colorir os valores das transações
            else if (data.column.index === 3) {
              doc.setTextColor(colorPositive);
              doc.text(
                incomeTableData[data.row.index][3],
                data.cell.x + data.cell.width - 2,
                data.cell.y + data.cell.height / 2 + 1,
                { align: 'right', baseline: 'middle' }
              );
            }
          }
        }
      });
      
      // Atualizar posição após a tabela
      yPos = (doc as any).lastAutoTable.finalY + 15;
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
      const expenseTableData = data.expenseTransactions.map(transaction => [
        formatDate(transaction.date),
        transaction.title,
        transaction.category || '',
        formatCurrency(transaction.amount)
      ]);
      
      // Adicionar linha de total
      expenseTableData.push([
        '',
        '',
        'TOTAL',
        formatCurrency(data.expenseTotal)
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Data', 'Descrição', 'Categoria', 'Valor']],
        body: expenseTableData,
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: colorHeader,
          textColor: colorText,
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: colorText
        },
        columnStyles: {
          0: { cellWidth: 25 },
          3: { halign: 'right' }
        },
        didDrawCell: (data: any) => {
          // Destacar os valores e a linha de total
          if (data.section === 'body') {
            const lastRow = expenseTableData.length - 1;
            
            // Linha de total em negrito
            if (data.row.index === lastRow) {
              doc.setFont('helvetica', 'bold');
              
              // Colorir o texto 'TOTAL'
              if (data.column.index === 2) {
                doc.setTextColor(colorText);
                doc.text(
                  'TOTAL',
                  data.cell.x + 2,
                  data.cell.y + data.cell.height / 2 + 1,
                  { baseline: 'middle' }
                );
              }
              
              // Colorir o valor total
              if (data.column.index === 3) {
                doc.setTextColor(colorNegative);
                doc.text(
                  expenseTableData[lastRow][3],
                  data.cell.x + data.cell.width - 2,
                  data.cell.y + data.cell.height / 2 + 1,
                  { align: 'right', baseline: 'middle' }
                );
              }
            }
            // Colorir os valores das transações
            else if (data.column.index === 3) {
              doc.setTextColor(colorNegative);
              doc.text(
                expenseTableData[data.row.index][3],
                data.cell.x + data.cell.width - 2,
                data.cell.y + data.cell.height / 2 + 1,
                { align: 'right', baseline: 'middle' }
              );
            }
          }
        }
      });
      
      // Atualizar posição após a tabela
      yPos = (doc as any).lastAutoTable.finalY + 15;
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
      const billsTableData = data.bills.map(bill => {
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
      billsTableData.push([
        '',
        '',
        '',
        '',
        'TOTAL',
        formatCurrency(totalBills)
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Vencimento', 'Descrição', 'Categoria', 'Status', 'Parcelas', 'Valor']],
        body: billsTableData,
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: colorHeader,
          textColor: colorText,
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: colorText
        },
        columnStyles: {
          0: { cellWidth: 25 },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'right' }
        },
        didDrawCell: (data: any) => {
          if (data.section === 'body') {
            const lastRow = billsTableData.length - 1;
            
            // Linha de total
            if (data.row.index === lastRow) {
              doc.setFont('helvetica', 'bold');
              
              if (data.column.index === 4) {
                doc.setTextColor(colorText);
                doc.text(
                  'TOTAL',
                  data.cell.x + data.cell.width / 2,
                  data.cell.y + data.cell.height / 2 + 1,
                  { align: 'center', baseline: 'middle' }
                );
              }
              
              if (data.column.index === 5) {
                doc.setTextColor(colorText);
                doc.text(
                  billsTableData[lastRow][5],
                  data.cell.x + data.cell.width - 2,
                  data.cell.y + data.cell.height / 2 + 1,
                  { align: 'right', baseline: 'middle' }
                );
              }
            }
            // Colorir status
            else if (data.column.index === 3) {
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
            else if (data.column.index === 5 && data.row.index !== lastRow) {
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
      yPos = (doc as any).lastAutoTable.finalY + 15;
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
    console.error('Erro ao gerar PDF com gráfico:', error);
    throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
