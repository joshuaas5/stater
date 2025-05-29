import { Transaction, Bill } from '@/types';
import jsPDF from 'jspdf';
// Importar o plugin jspdf-autotable para tabelas mais bonitas
import 'jspdf-autotable';

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

// Implementação do PDF no formato da planilha Excel, mas com o design anterior
export const generateExcelLikePDF = (data: ReportData): Blob => {
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
    
    doc.autoTable({
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
      
      doc.autoTable({
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
    
    // DISTRIBUIÇÃO DE ENTRADAS POR CATEGORIA
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorPrimary);
    doc.text('DISTRIBUIÇÃO DE ENTRADAS POR CATEGORIA', margin, yPos);
    yPos += 10;
    
    // Tabela de distribuição de entradas
    if (data.categorySummary && data.categorySummary.income && data.categorySummary.income.length > 0) {
      const incomeCategoryData = data.categorySummary.income.map(cat => [
        cat.category,
        formatCurrency(cat.amount),
        `${cat.percentage.toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Categoria', 'Valor', 'Percentual']],
        body: incomeCategoryData,
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
          0: { cellWidth: 'auto' },
          1: { halign: 'right', cellWidth: 80 },
          2: { halign: 'right', cellWidth: 60 }
        },
        didDrawCell: (data: any) => {
          // Colorir os valores
          if (data.section === 'body' && data.column.index === 1) {
            doc.setTextColor(colorPositive);
            doc.text(
              incomeCategoryData[data.row.index][1],
              data.cell.x + data.cell.width - 2,
              data.cell.y + data.cell.height / 2 + 1,
              { align: 'right', baseline: 'middle' }
            );
          }
        }
      });
      
      // Atualizar posição após a tabela
      yPos = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(colorText);
      doc.text('Nenhuma categoria de entrada no período.', margin, yPos);
      yPos += 20;
    }
    
    // Se estivermos perto do fim da página, adicionar nova página
    if (yPos > doc.internal.pageSize.height - 100) {
      doc.addPage();
      yPos = margin;
    }
    
    // BLOCO DE SAÍDAS
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
      
      doc.autoTable({
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
    
    // DISTRIBUIÇÃO DE SAÍDAS POR CATEGORIA
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(colorPrimary);
    doc.text('DISTRIBUIÇÃO DE SAÍDAS POR CATEGORIA', margin, yPos);
    yPos += 10;
    
    if (data.categorySummary && data.categorySummary.expense && data.categorySummary.expense.length > 0) {
      const expenseCategoryData = data.categorySummary.expense.map(cat => [
        cat.category,
        formatCurrency(cat.amount),
        `${cat.percentage.toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Categoria', 'Valor', 'Percentual']],
        body: expenseCategoryData,
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
          0: { cellWidth: 'auto' },
          1: { halign: 'right', cellWidth: 80 },
          2: { halign: 'right', cellWidth: 60 }
        },
        didDrawCell: (data: any) => {
          // Colorir os valores
          if (data.section === 'body' && data.column.index === 1) {
            doc.setTextColor(colorNegative);
            doc.text(
              expenseCategoryData[data.row.index][1],
              data.cell.x + data.cell.width - 2,
              data.cell.y + data.cell.height / 2 + 1,
              { align: 'right', baseline: 'middle' }
            );
          }
        }
      });
      
      // Atualizar posição após a tabela
      yPos = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(colorText);
      doc.text('Nenhuma categoria de saída no período.', margin, yPos);
      yPos += 20;
    }
    
    // Se estivermos perto do fim da página, adicionar nova página
    if (yPos > doc.internal.pageSize.height - 100) {
      doc.addPage();
      yPos = margin;
    }
    
    // CONTAS
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
      
      doc.autoTable({
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
    console.error('Erro ao gerar PDF no formato Excel:', error);
    throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
