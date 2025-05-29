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

// Implementação do PDF no formato da planilha Excel
export const generateExcelLikePDF = (data: ReportData): Blob => {
  try {
    // Criar nova instância do jsPDF
    const doc = new jsPDF('portrait', 'pt', 'a4');
    
    // Cores
    const colorPrimary = '#4F87FF';
    const colorText = '#374151';
    const colorPositive = '#2DE370';   // Verde para valores positivos
    const colorNegative = '#FF4F56';   // Vermelho para valores negativos
    const colorHeader = '#F8FAFC';     // Cor de fundo do cabeçalho
    
    // Configurações de página
    const margin = 40;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;
    
    // Cabeçalho com data
    doc.setFontSize(10);
    doc.setTextColor(colorText);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPos);
    yPos += 30;
    
    // BLOCO DE RESUMO 
    doc.setFontSize(12);
    doc.setTextColor(colorText);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO', margin, yPos);
    yPos += 20;
    
    // Tabela de Resumo
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Cabeçalhos
    const col1Width = 150;
    doc.text('Total Entradas', margin, yPos);
    doc.text(formatCurrency(data.incomeTotal), margin + col1Width, yPos);
    yPos += 20;
    
    doc.text('Total Saídas', margin, yPos);
    doc.text(formatCurrency(data.expenseTotal), margin + col1Width, yPos);
    yPos += 20;
    
    // Saldo Final em negrito
    doc.setFont('helvetica', 'bold');
    doc.text('Saldo Final', margin, yPos);
    doc.setTextColor(data.balance >= 0 ? colorPositive : colorNegative);
    doc.text(formatCurrency(data.balance), margin + col1Width, yPos);
    doc.setTextColor(colorText);
    doc.setFont('helvetica', 'normal');
    yPos += 40;
    
    // BLOCO DE ENTRADAS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ENTRADAS', margin, yPos);
    yPos += 20;
    
    // Tabela de Entradas
    if (data.incomeTransactions && data.incomeTransactions.length > 0) {
      // Cabeçalho da tabela
      doc.setFontSize(10);
      const headerRow = ['Data', 'Descrição', 'Categoria', 'Valor'];
      const colWidths = [80, 160, 120, 80];
      
      let currentX = margin;
      headerRow.forEach((header, index) => {
        doc.text(header, currentX, yPos);
        currentX += colWidths[index];
      });
      yPos += 20;
      
      // Linhas de dados
      doc.setFont('helvetica', 'normal');
      data.incomeTransactions.forEach(transaction => {
        currentX = margin;
        
        // Data
        const dateStr = formatDate(transaction.date);
        doc.text(dateStr, currentX, yPos);
        currentX += colWidths[0];
        
        // Descrição/Título
        doc.text(transaction.title, currentX, yPos);
        currentX += colWidths[1];
        
        // Categoria
        doc.text(transaction.category || '', currentX, yPos);
        currentX += colWidths[2];
        
        // Valor
        doc.setTextColor(colorPositive);
        doc.text(formatCurrency(transaction.amount), currentX, yPos);
        doc.setTextColor(colorText);
        
        yPos += 20;
      });
      
      // Total das entradas
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL', margin, yPos);
      doc.setTextColor(colorPositive);
      doc.text(formatCurrency(data.incomeTotal), margin + colWidths[0] + colWidths[1] + colWidths[2], yPos);
      doc.setTextColor(colorText);
      doc.setFont('helvetica', 'normal');
      yPos += 30;
    } else {
      doc.text('Nenhuma entrada no período selecionado.', margin, yPos);
      yPos += 20;
    }
    
    // DISTRIBUIÇÃO DE ENTRADAS POR CATEGORIA
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DISTRIBUIÇÃO DE ENTRADAS POR CATEGORIA', margin, yPos);
    yPos += 20;
    
    if (data.categorySummary.income && data.categorySummary.income.length > 0) {
      // Cabeçalho
      doc.setFontSize(10);
      const catHeaderRow = ['Categoria', 'Valor', '% do Total'];
      const catColWidths = [120, 100, 80];
      
      let currentX = margin;
      catHeaderRow.forEach((header, index) => {
        doc.text(header, currentX, yPos);
        currentX += catColWidths[index];
      });
      yPos += 20;
      
      // Dados das categorias
      doc.setFont('helvetica', 'normal');
      data.categorySummary.income.forEach(cat => {
        currentX = margin;
        
        // Categoria
        doc.text(cat.category, currentX, yPos);
        currentX += catColWidths[0];
        
        // Valor
        doc.text(formatCurrency(cat.amount), currentX, yPos);
        currentX += catColWidths[1];
        
        // Percentual
        doc.text(`${cat.percentage.toFixed(1)}%`, currentX, yPos);
        
        yPos += 20;
      });
    } else {
      doc.text('Nenhuma categoria de entrada no período.', margin, yPos);
    }
    yPos += 30;
    
    // Se estivermos perto do fim da página, adicionar nova página
    if (yPos > doc.internal.pageSize.height - 100) {
      doc.addPage();
      yPos = margin;
    }
    
    // BLOCO DE SAÍDAS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('SAÍDAS', margin, yPos);
    yPos += 20;
    
    // Tabela de Saídas
    if (data.expenseTransactions && data.expenseTransactions.length > 0) {
      // Cabeçalho da tabela
      doc.setFontSize(10);
      const headerRow = ['Data', 'Descrição', 'Categoria', 'Valor'];
      const colWidths = [80, 160, 120, 80];
      
      let currentX = margin;
      headerRow.forEach((header, index) => {
        doc.text(header, currentX, yPos);
        currentX += colWidths[index];
      });
      yPos += 20;
      
      // Linhas de dados
      doc.setFont('helvetica', 'normal');
      data.expenseTransactions.forEach(transaction => {
        currentX = margin;
        
        // Data
        const dateStr = formatDate(transaction.date);
        doc.text(dateStr, currentX, yPos);
        currentX += colWidths[0];
        
        // Descrição/Título
        doc.text(transaction.title, currentX, yPos);
        currentX += colWidths[1];
        
        // Categoria
        doc.text(transaction.category || '', currentX, yPos);
        currentX += colWidths[2];
        
        // Valor
        doc.setTextColor(colorNegative);
        doc.text(formatCurrency(transaction.amount), currentX, yPos);
        doc.setTextColor(colorText);
        
        yPos += 20;
      });
      
      // Total das saídas
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL', margin, yPos);
      doc.setTextColor(colorNegative);
      doc.text(formatCurrency(data.expenseTotal), margin + colWidths[0] + colWidths[1] + colWidths[2], yPos);
      doc.setTextColor(colorText);
      doc.setFont('helvetica', 'normal');
      yPos += 30;
    } else {
      doc.text('Nenhuma saída no período selecionado.', margin, yPos);
      yPos += 20;
    }
    
    // DISTRIBUIÇÃO DE SAÍDAS POR CATEGORIA
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DISTRIBUIÇÃO DE SAÍDAS POR CATEGORIA', margin, yPos);
    yPos += 20;
    
    if (data.categorySummary.expense && data.categorySummary.expense.length > 0) {
      // Cabeçalho
      doc.setFontSize(10);
      const catHeaderRow = ['Categoria', 'Valor', '% do Total'];
      const catColWidths = [120, 100, 80];
      
      let currentX = margin;
      catHeaderRow.forEach((header, index) => {
        doc.text(header, currentX, yPos);
        currentX += catColWidths[index];
      });
      yPos += 20;
      
      // Dados das categorias
      doc.setFont('helvetica', 'normal');
      data.categorySummary.expense.forEach(cat => {
        currentX = margin;
        
        // Categoria
        doc.text(cat.category, currentX, yPos);
        currentX += catColWidths[0];
        
        // Valor
        doc.text(formatCurrency(cat.amount), currentX, yPos);
        currentX += catColWidths[1];
        
        // Percentual
        doc.text(`${cat.percentage.toFixed(1)}%`, currentX, yPos);
        
        yPos += 20;
      });
    } else {
      doc.text('Nenhuma categoria de saída no período.', margin, yPos);
    }
    yPos += 30;
    
    // Se estivermos perto do fim da página, adicionar nova página
    if (yPos > doc.internal.pageSize.height - 100) {
      doc.addPage();
      yPos = margin;
    }
    
    // CONTAS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CONTAS', margin, yPos);
    yPos += 20;
    
    if (data.bills && data.bills.length > 0) {
      // Cabeçalho da tabela
      doc.setFontSize(10);
      const headerRow = ['Vencimento', 'Descrição', 'Categoria', 'Status', 'Parcelas', 'Valor'];
      const colWidths = [80, 120, 80, 70, 70, 80];
      
      let currentX = margin;
      headerRow.forEach((header, index) => {
        doc.text(header, currentX, yPos);
        currentX += colWidths[index];
      });
      yPos += 20;
      
      // Linhas de dados
      doc.setFont('helvetica', 'normal');
      data.bills.forEach(bill => {
        currentX = margin;
        
        // Vencimento
        const dateStr = formatDate(bill.dueDate);
        doc.text(dateStr, currentX, yPos);
        currentX += colWidths[0];
        
        // Descrição/Título
        doc.text(bill.title, currentX, yPos);
        currentX += colWidths[1];
        
        // Categoria
        doc.text(bill.category || '', currentX, yPos);
        currentX += colWidths[2];
        
        // Status
        doc.setTextColor(bill.isPaid ? colorPositive : colorNegative);
        doc.text(bill.isPaid ? 'Paga' : 'Pendente', currentX, yPos);
        doc.setTextColor(colorText);
        currentX += colWidths[3];
        
        // Parcelas
        const installmentInfo = bill.totalInstallments && bill.currentInstallment
          ? `${bill.currentInstallment}/${bill.totalInstallments}`
          : bill.isRecurring ? 'Recorrente' : '-';
        doc.text(installmentInfo, currentX, yPos);
        currentX += colWidths[4];
        
        // Valor
        doc.text(formatCurrency(bill.amount), currentX, yPos);
        
        yPos += 20;
      });
      
      // Total das contas
      const totalBills = data.bills.reduce((sum, bill) => sum + bill.amount, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL', margin, yPos);
      doc.text(formatCurrency(totalBills), margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 30;
    } else {
      doc.text('Nenhuma conta no período selecionado.', margin, yPos);
      yPos += 20;
    }
    
    // DICA FINANCEIRA
    if (yPos > doc.internal.pageSize.height - 50) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DICA FINANCEIRA', margin, yPos);
    yPos += 20;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const tip = 'Poupe hoje para garantir seu futuro. Economizar mensalmente, mesmo que pouco, é o primeiro passo para a independência financeira.';
    doc.text(tip, margin, yPos, { maxWidth: pageWidth - margin * 2 });
    yPos += 25;
    
    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(colorText);
    doc.text('Relatório gerado por ICTUS - Seu aplicativo de gestão financeira', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    
    // Retornar o documento como blob
    return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  } catch (error) {
    console.error('Erro ao gerar PDF no formato Excel:', error);
    throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
