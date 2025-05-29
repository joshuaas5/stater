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

// Implementação super básica sem usar autoTable
export const generateSimplePDF = (data: ReportData): Blob => {
  try {
    // Criar nova instância do jsPDF
    const doc = new jsPDF();
    
    // Cores
    const colorPrimary = '#4F87FF';
    const colorText = '#374151';
    
    // Configurações de página
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    let yPos = margin;
    
    // Título do relatório
    doc.setFontSize(18);
    doc.setTextColor(colorPrimary);
    doc.text('Relatório Financeiro', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Período
    doc.setFontSize(12);
    doc.setTextColor(colorText);
    doc.text(`Período: ${data.period}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Informações do usuário
    if (data.user) {
      const userName = data.user.name || data.user.email || 'Usuário';
      doc.setFontSize(10);
      doc.setTextColor(colorText);
      doc.text(`Usuário: ${userName}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      
      if (data.user.email) {
        doc.text(`Email: ${data.user.email}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 5;
      }
    }
    
    yPos += 10;
    
    // Resumo financeiro - SEM USAR AUTOTABLE
    doc.setFontSize(14);
    doc.setTextColor(colorPrimary);
    doc.text('Resumo Financeiro', margin, yPos);
    yPos += 10;
    
    // Desenhar linhas manualmente para a tabela de resumo
    doc.setDrawColor(200, 200, 200); // Cor cinza claro para as linhas
    doc.setFillColor(248, 250, 252); // Cor de fundo do cabeçalho
    doc.setTextColor(colorText);
    
    // Desenhar cabeçalho
    doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'FD'); // FD = Fill and Draw
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Tipo', margin + 5, yPos + 7);
    doc.text('Valor', pageWidth - margin - 20, yPos + 7, { align: 'right' });
    yPos += 10;
    
    // Desenhar linhas de dados
    doc.setFont('helvetica', 'normal');
    
    // Linha de receitas
    doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'S'); // S = Stroke
    doc.text('Receitas', margin + 5, yPos + 7);
    doc.setTextColor('#2DE370'); // Verde para valores positivos
    doc.text(formatCurrency(data.incomeTotal), pageWidth - margin - 20, yPos + 7, { align: 'right' });
    yPos += 10;
    
    // Linha de despesas
    doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'S'); // S = Stroke
    doc.setTextColor(colorText);
    doc.text('Despesas', margin + 5, yPos + 7);
    doc.setTextColor('#FF4F56'); // Vermelho para valores negativos
    doc.text(formatCurrency(data.expenseTotal), pageWidth - margin - 20, yPos + 7, { align: 'right' });
    yPos += 10;
    
    // Linha de saldo
    doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'S'); // S = Stroke
    doc.setTextColor(colorText);
    doc.text('Saldo', margin + 5, yPos + 7);
    doc.setTextColor(data.balance >= 0 ? '#2DE370' : '#FF4F56'); // Verde ou vermelho dependendo do saldo
    doc.text(formatCurrency(data.balance), pageWidth - margin - 20, yPos + 7, { align: 'right' });
    yPos += 20;
    
    // Contas
    doc.setFontSize(14);
    doc.setTextColor(colorPrimary);
    doc.text('Contas', margin, yPos);
    yPos += 10;
    
    if (data.bills && data.bills.length > 0) {
      // Desenhar cabeçalho das contas
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'FD');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorText);
      
      const colWidth = (pageWidth - margin * 2) / 4;
      doc.text('Vencimento', margin + 5, yPos + 7);
      doc.text('Descrição', margin + colWidth, yPos + 7);
      doc.text('Status', margin + colWidth * 2, yPos + 7);
      doc.text('Valor', margin + colWidth * 3, yPos + 7);
      yPos += 10;
      
      // Limitar o número de contas para evitar estourar a página
      const maxBills = Math.min(data.bills.length, 10);
      
      // Desenhar linhas de dados das contas
      doc.setFont('helvetica', 'normal');
      for (let i = 0; i < maxBills; i++) {
        const bill = data.bills[i];
        
        doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'S');
        doc.setTextColor(colorText);
        doc.text(formatDate(bill.dueDate), margin + 5, yPos + 7);
        
        // Limitar o comprimento do título para evitar overflow
        const title = bill.title.length > 15 ? bill.title.substring(0, 15) + '...' : bill.title;
        doc.text(title, margin + colWidth, yPos + 7);
        
        // Status com cor
        doc.setTextColor(bill.isPaid ? '#2DE370' : '#FF4F56');
        doc.text(bill.isPaid ? 'Paga' : 'Pendente', margin + colWidth * 2, yPos + 7);
        
        doc.setTextColor(colorText);
        doc.text(formatCurrency(bill.amount), margin + colWidth * 3, yPos + 7);
        
        yPos += 10;
        
        // Verificar se ainda há espaço na página
        if (yPos > doc.internal.pageSize.height - 20) {
          doc.addPage();
          yPos = margin;
        }
      }
      
      // Indicar se há mais contas
      if (data.bills.length > maxBills) {
        doc.setTextColor(colorText);
        doc.text(`... e mais ${data.bills.length - maxBills} conta(s).`, margin, yPos + 10);
      }
    } else {
      doc.setFontSize(10);
      doc.setTextColor(colorText);
      doc.text('Nenhuma conta no período.', margin, yPos + 7);
    }
    
    // Adicionar transações se houver e tiver espaço na página
    if (data.incomeTransactions && data.incomeTransactions.length > 0 && yPos < doc.internal.pageSize.height - 60) {
      // Adicionar nova página se estiver perto do fim
      if (yPos > doc.internal.pageSize.height - 100) {
        doc.addPage();
        yPos = margin;
      } else {
        yPos += 20;
      }
      
      // Título das transações
      doc.setFontSize(14);
      doc.setTextColor(colorPrimary);
      doc.text('Transações - Receitas', margin, yPos);
      yPos += 10;
      
      // Cabeçalho da tabela de transações
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'FD');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorText);
      
      // Colunas para transações
      const transColWidth = (pageWidth - margin * 2) / 4;
      doc.text('Data', margin + 5, yPos + 7);
      doc.text('Descrição', margin + transColWidth, yPos + 7);
      doc.text('Categoria', margin + transColWidth * 2, yPos + 7);
      doc.text('Valor', margin + transColWidth * 3, yPos + 7);
      yPos += 10;
      
      // Limitar o número de transações para evitar estourar a página
      const maxTransactions = Math.min(data.incomeTransactions.length, 5);
      
      // Desenhar linhas de dados das transações
      doc.setFont('helvetica', 'normal');
      for (let i = 0; i < maxTransactions; i++) {
        const transaction = data.incomeTransactions[i];
        
        doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'S');
        doc.setTextColor(colorText);
        doc.text(formatDate(transaction.date), margin + 5, yPos + 7);
        
        // Limitar o comprimento do título
        const title = transaction.title.length > 15 ? transaction.title.substring(0, 15) + '...' : transaction.title;
        doc.text(title, margin + transColWidth, yPos + 7);
        
        // Categoria
        doc.text(transaction.category || '-', margin + transColWidth * 2, yPos + 7);
        
        // Valor com cor verde para receitas
        doc.setTextColor('#2DE370');
        doc.text(formatCurrency(transaction.amount), margin + transColWidth * 3, yPos + 7);
        
        yPos += 10;
      }
      
      // Indicar se há mais transações
      if (data.incomeTransactions.length > maxTransactions) {
        doc.setTextColor(colorText);
        doc.text(`... e mais ${data.incomeTransactions.length - maxTransactions} transação(ões).`, margin, yPos + 7);
        yPos += 15;
      } else {
        yPos += 10;
      }
    }
    
    // Adicionar transações de despesa se houver e tiver espaço na página
    if (data.expenseTransactions && data.expenseTransactions.length > 0 && yPos < doc.internal.pageSize.height - 60) {
      // Adicionar nova página se estiver perto do fim
      if (yPos > doc.internal.pageSize.height - 100) {
        doc.addPage();
        yPos = margin;
      } else {
        yPos += 10;
      }
      
      // Título das transações de despesa
      doc.setFontSize(14);
      doc.setTextColor(colorPrimary);
      doc.text('Transações - Despesas', margin, yPos);
      yPos += 10;
      
      // Cabeçalho da tabela
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'FD');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(colorText);
      
      // Colunas para transações
      const transColWidth = (pageWidth - margin * 2) / 4;
      doc.text('Data', margin + 5, yPos + 7);
      doc.text('Descrição', margin + transColWidth, yPos + 7);
      doc.text('Categoria', margin + transColWidth * 2, yPos + 7);
      doc.text('Valor', margin + transColWidth * 3, yPos + 7);
      yPos += 10;
      
      // Limitar o número de transações
      const maxTransactions = Math.min(data.expenseTransactions.length, 5);
      
      // Desenhar linhas de dados das transações
      doc.setFont('helvetica', 'normal');
      for (let i = 0; i < maxTransactions; i++) {
        const transaction = data.expenseTransactions[i];
        
        doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'S');
        doc.setTextColor(colorText);
        doc.text(formatDate(transaction.date), margin + 5, yPos + 7);
        
        // Limitar o comprimento do título
        const title = transaction.title.length > 15 ? transaction.title.substring(0, 15) + '...' : transaction.title;
        doc.text(title, margin + transColWidth, yPos + 7);
        
        // Categoria
        doc.text(transaction.category || '-', margin + transColWidth * 2, yPos + 7);
        
        // Valor com cor vermelha para despesas
        doc.setTextColor('#FF4F56');
        doc.text(formatCurrency(transaction.amount), margin + transColWidth * 3, yPos + 7);
        
        yPos += 10;
      }
      
      // Indicar se há mais transações
      if (data.expenseTransactions.length > maxTransactions) {
        doc.setTextColor(colorText);
        doc.text(`... e mais ${data.expenseTransactions.length - maxTransactions} transação(ões).`, margin, yPos + 7);
        yPos += 15;
      } else {
        yPos += 10;
      }
    }
    
    // Adicionar categorias mais representativas se houver
    if ((data.categorySummary.income.length > 0 || data.categorySummary.expense.length > 0) && yPos < doc.internal.pageSize.height - 60) {
      // Adicionar nova página se estiver perto do fim
      if (yPos > doc.internal.pageSize.height - 100) {
        doc.addPage();
        yPos = margin;
      } else {
        yPos += 10;
      }
      
      // Título das categorias
      doc.setFontSize(14);
      doc.setTextColor(colorPrimary);
      doc.text('Resumo por Categorias', margin, yPos);
      yPos += 10;
      
      if (data.categorySummary.expense.length > 0) {
        // Cabeçalho da tabela de categorias de despesa
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'FD');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colorText);
        doc.text('Categorias de Despesa', margin + 5, yPos + 7);
        doc.text('Percentual', pageWidth - margin - 60, yPos + 7);
        doc.text('Valor', pageWidth - margin - 20, yPos + 7, { align: 'right' });
        yPos += 10;
        
        // Limitar o número de categorias
        const maxCategories = Math.min(data.categorySummary.expense.length, 5);
        
        // Desenhar linhas de dados das categorias
        doc.setFont('helvetica', 'normal');
        for (let i = 0; i < maxCategories; i++) {
          const category = data.categorySummary.expense[i];
          
          doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'S');
          doc.setTextColor(colorText);
          doc.text(category.category, margin + 5, yPos + 7);
          
          // Percentual
          doc.text(`${category.percentage.toFixed(1)}%`, pageWidth - margin - 60, yPos + 7);
          
          // Valor
          doc.setTextColor('#FF4F56');
          doc.text(formatCurrency(category.amount), pageWidth - margin - 20, yPos + 7, { align: 'right' });
          
          yPos += 10;
        }
        
        yPos += 5;
      }
    }
    
    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(colorText);
    doc.text('Relatório gerado por ICTUS - Seu aplicativo de gestão financeira', pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    
    // Retornar o documento como blob
    return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  } catch (error) {
    console.error('Erro ao gerar PDF básico:', error);
    throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
