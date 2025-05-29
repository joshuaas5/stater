import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './formatters';

// Definir tipos para os dados do relatu00f3rio
interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date | string;
  category?: string;
  type: 'income' | 'expense';
}

interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: Date | string;
  isPaid: boolean;
  category?: string;
  type: 'payable' | 'receivable';
}

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
  expensesByCategory: Record<string, number>;
  includeCharts?: boolean;
  financialTip?: string;
}

// Funu00e7u00e3o auxiliar para converter string para Date se necessu00e1rio
const ensureDate = (dateValue: Date | string): Date => {
  if (typeof dateValue === 'string') {
    return new Date(dateValue);
  }
  return dateValue;
};

/**
 * Gera um PDF usando apenas funu00e7u00f5es nativas do jsPDF, sem depender de plugins externos
 * como autoTable. Esta implementau00e7u00e3o u00e9 mais simples, mas garante compatibilidade.
 */
export const generatePurePDF = (data: ReportData): Blob => {
  // Criar uma nova instu00e2ncia do PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = 20; // Posiu00e7u00e3o vertical inicial
  
  // Funu00e7u00f5es auxiliares para desenhar no PDF
  const addTitle = (text: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102); // Azul escuro
    doc.text(text, margin, y);
    y += 10;
  };
  
  const addSubtitle = (text: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102); // Azul escuro
    doc.text(text, margin, y);
    y += 7;
  };
  
  const addText = (text: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Preto
    doc.text(text, margin, y);
    y += 5;
  };
  
  const addSpacer = (height = 5) => {
    y += height;
  };
  
  const addLine = () => {
    doc.setDrawColor(200, 200, 200); // Cinza claro
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };
  
  // Adicionar cabeu00e7alho
  doc.setFillColor(0, 51, 102); // Azul escuro
  doc.rect(0, 0, pageWidth, 15, 'F');
  doc.setTextColor(255, 255, 255); // Branco
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatu00f3rio Financeiro', pageWidth / 2, 10, { align: 'center' });
  y = 25;
  
  // Informau00e7u00f5es do usuu00e1rio e peru00edodo
  addText(`Usuu00e1rio: ${data.userName}`);
  addText(`Peru00edodo: ${formatDate(data.startDate)} a ${formatDate(data.endDate)}`);
  addText(`Data de gerau00e7u00e3o: ${formatDate(new Date())}`);
  addSpacer();
  addLine();
  
  // Resumo financeiro
  addTitle('Resumo Financeiro');
  addText(`Receitas: ${formatCurrency(data.incomeTotal)}`);
  addText(`Despesas: ${formatCurrency(data.expenseTotal)}`);
  addSpacer(2);
  doc.setFont('helvetica', 'bold');
  if (data.balance >= 0) {
    doc.setTextColor(0, 128, 0); // Verde
    addText(`Saldo: ${formatCurrency(data.balance)}`);
  } else {
    doc.setTextColor(255, 0, 0); // Vermelho
    addText(`Saldo: ${formatCurrency(data.balance)}`);
  }
  doc.setTextColor(0, 0, 0); // Voltar para preto
  doc.setFont('helvetica', 'normal');
  addSpacer();
  addLine();
  
  // Verificar se precisa adicionar uma nova pu00e1gina
  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      
      // Adicionar cabeu00e7alho na nova pu00e1gina
      doc.setFillColor(0, 51, 102);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatu00f3rio Financeiro (continuau00e7u00e3o)', pageWidth / 2, 10, { align: 'center' });
      
      y = 25; // Resetar posiu00e7u00e3o vertical
    }
  };
  
  // Distribuiu00e7u00e3o de despesas por categoria
  checkPageBreak(60); // Verificar se hu00e1 espau00e7o para esta seu00e7u00e3o
  addTitle('Distribuiu00e7u00e3o de Despesas por Categoria');
  
  const categories = Object.entries(data.expensesByCategory)
    .sort((a, b) => b[1] - a[1]); // Ordenar por valor (maior para menor)
  
  if (categories.length > 0) {
    categories.forEach(([category, amount]) => {
      const percentage = (amount / data.expenseTotal * 100).toFixed(1);
      addText(`${category}: ${formatCurrency(amount)} (${percentage}%)`);
    });
  } else {
    addText('Nenhuma despesa registrada no peru00edodo.');
  }
  
  addSpacer();
  addLine();
  
  // Transau00e7u00f5es de entrada
  if (data.incomeTransactions.length > 0) {
    checkPageBreak(40 + data.incomeTransactions.length * 5); // Estimar espau00e7o necessu00e1rio
    addTitle('Receitas');
    
    // Cabeu00e7alho da tabela simplificada
    doc.setFont('helvetica', 'bold');
    doc.text('Data', margin, y);
    doc.text('Descriu00e7u00e3o', margin + 25, y);
    doc.text('Categoria', margin + 90, y);
    doc.text('Valor', pageWidth - margin - 20, y, { align: 'right' });
    y += 5;
    addLine();
    
    // Dados da tabela
    doc.setFont('helvetica', 'normal');
    data.incomeTransactions.forEach(transaction => {
      checkPageBreak(5); // Verificar quebra de pu00e1gina para cada linha
      
      // Converter para Date se for string
      const transactionDate = ensureDate(transaction.date);
      doc.text(formatDate(transactionDate), margin, y);
      
      // Limitar o tamanho da descriu00e7u00e3o
      let description = transaction.description;
      if (description.length > 30) {
        description = description.substring(0, 27) + '...';
      }
      doc.text(description, margin + 25, y);
      
      // Categoria
      doc.text(transaction.category || 'Sem categoria', margin + 90, y);
      
      // Valor
      doc.text(formatCurrency(transaction.amount), pageWidth - margin - 20, y, { align: 'right' });
      
      y += 5;
    });
    
    addSpacer();
    addLine();
  }
  
  // Transau00e7u00f5es de sau00edda
  if (data.expenseTransactions.length > 0) {
    checkPageBreak(40 + data.expenseTransactions.length * 5); // Estimar espau00e7o necessu00e1rio
    addTitle('Despesas');
    
    // Cabeu00e7alho da tabela simplificada
    doc.setFont('helvetica', 'bold');
    doc.text('Data', margin, y);
    doc.text('Descriu00e7u00e3o', margin + 25, y);
    doc.text('Categoria', margin + 90, y);
    doc.text('Valor', pageWidth - margin - 20, y, { align: 'right' });
    y += 5;
    addLine();
    
    // Dados da tabela
    doc.setFont('helvetica', 'normal');
    data.expenseTransactions.forEach(transaction => {
      checkPageBreak(5); // Verificar quebra de pu00e1gina para cada linha
      
      // Converter para Date se for string
      const transactionDate = ensureDate(transaction.date);
      doc.text(formatDate(transactionDate), margin, y);
      
      // Limitar o tamanho da descriu00e7u00e3o
      let description = transaction.description;
      if (description.length > 30) {
        description = description.substring(0, 27) + '...';
      }
      doc.text(description, margin + 25, y);
      
      // Categoria
      doc.text(transaction.category || 'Sem categoria', margin + 90, y);
      
      // Valor
      doc.setTextColor(255, 0, 0); // Vermelho para despesas
      doc.text(formatCurrency(transaction.amount), pageWidth - margin - 20, y, { align: 'right' });
      doc.setTextColor(0, 0, 0); // Voltar para preto
      
      y += 5;
    });
    
    addSpacer();
    addLine();
  }
  
  // Contas a pagar/receber
  if (data.bills.length > 0) {
    checkPageBreak(40 + data.bills.length * 5); // Estimar espau00e7o necessu00e1rio
    addTitle('Contas a Pagar/Receber');
    
    // Cabeu00e7alho da tabela simplificada
    doc.setFont('helvetica', 'bold');
    doc.text('Vencimento', margin, y);
    doc.text('Descriu00e7u00e3o', margin + 30, y);
    doc.text('Tipo', margin + 90, y);
    doc.text('Status', margin + 115, y);
    doc.text('Valor', pageWidth - margin - 20, y, { align: 'right' });
    y += 5;
    addLine();
    
    // Dados da tabela
    doc.setFont('helvetica', 'normal');
    data.bills.forEach(bill => {
      checkPageBreak(5); // Verificar quebra de pu00e1gina para cada linha
      
      // Converter para Date se for string
      const billDueDate = ensureDate(bill.dueDate);
      doc.text(formatDate(billDueDate), margin, y);
      
      // Limitar o tamanho da descriu00e7u00e3o
      let description = bill.description;
      if (description.length > 25) {
        description = description.substring(0, 22) + '...';
      }
      doc.text(description, margin + 30, y);
      
      // Tipo
      const billType = bill.type === 'payable' ? 'A pagar' : 'A receber';
      doc.text(billType, margin + 90, y);
      
      // Status
      const status = bill.isPaid ? 'Pago' : 'Pendente';
      doc.text(status, margin + 115, y);
      
      // Valor
      if (bill.type === 'payable') {
        doc.setTextColor(255, 0, 0); // Vermelho para contas a pagar
      } else {
        doc.setTextColor(0, 128, 0); // Verde para contas a receber
      }
      doc.text(formatCurrency(bill.amount), pageWidth - margin - 20, y, { align: 'right' });
      doc.setTextColor(0, 0, 0); // Voltar para preto
      
      y += 5;
    });
    
    addSpacer();
    addLine();
  }
  
  // Dica financeira
  if (data.financialTip) {
    checkPageBreak(30);
    addTitle('Dica Financeira');
    
    // Quebrar a dica em mu00faltiplas linhas se necessu00e1rio
    const tipLines = doc.splitTextToSize(data.financialTip, contentWidth);
    doc.setFont('helvetica', 'italic');
    doc.text(tipLines, margin, y);
    y += tipLines.length * 6;
    
    addSpacer();
    addLine();
  }
  
  // Rodapu00e9
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Pu00e1gina ${i} de ${pageCount}`, pageWidth / 2, footerY, { align: 'center' });
    doc.text('Gerado por ICTUS - Sistema de Gestu00e3o Financeira Pessoal', pageWidth / 2, footerY + 5, { align: 'center' });
  }
  
  // Retornar o PDF como Blob
  return doc.output('blob');
};
