import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './formatters';

// Definir tipos para os dados do relatório
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

// Função auxiliar para converter string para Date se necessário
// com validação para evitar valores inválidos
const ensureDate = (dateValue: Date | string): Date => {
  if (typeof dateValue === 'string') {
    try {
      const date = new Date(dateValue);
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        console.warn('Data inválida detectada:', dateValue);
        return new Date(); // Retornar data atual como fallback
      }
      return date;
    } catch (error) {
      console.error('Erro ao converter data:', error);
      return new Date(); // Retornar data atual como fallback
    }
  }
  // Verificar se a data é válida mesmo sendo um objeto Date
  if (dateValue instanceof Date && isNaN(dateValue.getTime())) {
    console.warn('Objeto Date inválido detectado');
    return new Date(); // Retornar data atual como fallback
  }
  return dateValue;
};

/**
 * Gera um PDF usando apenas funções nativas do jsPDF, sem depender de plugins externos
 * como autoTable. Esta implementação é mais simples, mas garante compatibilidade.
 */
export const generatePurePDF = (data: ReportData): Blob => {
  try {
    // Criar uma nova instância do PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = 20; // Posição vertical inicial
    
    // Funções auxiliares para desenhar no PDF
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
    
    // Adicionar cabeçalho
    doc.setFillColor(0, 51, 102); // Azul escuro
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255); // Branco
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório Financeiro', pageWidth / 2, 10, { align: 'center' });
    y = 25;
    
    // Informações do usuário e período
    addText(`Usuário: ${data.userName}`);
    // Garantir que as datas sejam válidas
    const validStartDate = ensureDate(data.startDate);
    const validEndDate = ensureDate(data.endDate);
    addText(`Período: ${formatDate(validStartDate)} a ${formatDate(validEndDate)}`);
    addText(`Data de geração: ${formatDate(new Date())}`);
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
    
    // Verificar se precisa adicionar uma nova página
    const checkPageBreak = (requiredSpace: number) => {
      if (y + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        
        // Adicionar cabeçalho na nova página
        doc.setFillColor(0, 51, 102);
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Relatório Financeiro (continuação)', pageWidth / 2, 10, { align: 'center' });
        
        y = 25; // Resetar posição vertical
      }
    };
    
    // Distribuição de despesas por categoria
    checkPageBreak(60); // Verificar se há espaço para esta seção
    addTitle('Distribuição de Despesas por Categoria');
    
    const categories = Object.entries(data.expensesByCategory)
      .sort((a, b) => b[1] - a[1]); // Ordenar por valor (maior para menor)
    
    if (categories.length > 0) {
      categories.forEach(([category, amount]) => {
        const percentage = (amount / data.expenseTotal * 100).toFixed(1);
        addText(`${category}: ${formatCurrency(amount)} (${percentage}%)`);
      });
    } else {
      addText('Nenhuma despesa registrada no período.');
    }
    
    addSpacer();
    addLine();
    
    // Transações de entrada
    if (data.incomeTransactions.length > 0) {
      checkPageBreak(40 + data.incomeTransactions.length * 5); // Estimar espaço necessário
      addTitle('Receitas');
      
      // Cabeçalho da tabela simplificada
      doc.setFont('helvetica', 'bold');
      doc.text('Data', margin, y);
      doc.text('Descrição', margin + 25, y);
      doc.text('Categoria', margin + 90, y);
      doc.text('Valor', pageWidth - margin - 20, y, { align: 'right' });
      y += 5;
      addLine();
      
      // Dados da tabela
      doc.setFont('helvetica', 'normal');
      data.incomeTransactions.forEach(transaction => {
        try {
          checkPageBreak(5); // Verificar quebra de página para cada linha
          
          // Converter para Date se for string e garantir que é válida
          const transactionDate = ensureDate(transaction.date);
          doc.text(formatDate(transactionDate), margin, y);
          
          // Limitar o tamanho da descrição
          let description = transaction.description || 'Sem descrição';
          if (description.length > 30) {
            description = description.substring(0, 27) + '...';
          }
          doc.text(description, margin + 25, y);
          
          // Categoria
          doc.text(transaction.category || 'Sem categoria', margin + 90, y);
          
          // Valor
          doc.text(formatCurrency(transaction.amount), pageWidth - margin - 20, y, { align: 'right' });
          
          y += 5;
        } catch (error) {
          console.error('Erro ao processar transação:', error);
          // Continuar com a próxima transação
        }
      });
      
      addSpacer();
      addLine();
    }
    
    // Transações de saída
    if (data.expenseTransactions.length > 0) {
      checkPageBreak(40 + data.expenseTransactions.length * 5); // Estimar espaço necessário
      addTitle('Despesas');
      
      // Cabeçalho da tabela simplificada
      doc.setFont('helvetica', 'bold');
      doc.text('Data', margin, y);
      doc.text('Descrição', margin + 25, y);
      doc.text('Categoria', margin + 90, y);
      doc.text('Valor', pageWidth - margin - 20, y, { align: 'right' });
      y += 5;
      addLine();
      
      // Dados da tabela
      doc.setFont('helvetica', 'normal');
      data.expenseTransactions.forEach(transaction => {
        try {
          checkPageBreak(5); // Verificar quebra de página para cada linha
          
          // Converter para Date se for string
          const transactionDate = ensureDate(transaction.date);
          doc.text(formatDate(transactionDate), margin, y);
          
          // Limitar o tamanho da descrição
          let description = transaction.description || 'Sem descrição';
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
        } catch (error) {
          console.error('Erro ao processar despesa:', error);
          // Continuar com a próxima transação
        }
      });
      
      addSpacer();
      addLine();
    }
    
    // Contas a pagar/receber
    if (data.bills && data.bills.length > 0) {
      checkPageBreak(40 + data.bills.length * 5); // Estimar espaço necessário
      addTitle('Contas a Pagar/Receber');
      
      // Cabeçalho da tabela simplificada
      doc.setFont('helvetica', 'bold');
      doc.text('Vencimento', margin, y);
      doc.text('Descrição', margin + 30, y);
      doc.text('Tipo', margin + 90, y);
      doc.text('Status', margin + 115, y);
      doc.text('Valor', pageWidth - margin - 20, y, { align: 'right' });
      y += 5;
      addLine();
      
      // Dados da tabela
      doc.setFont('helvetica', 'normal');
      data.bills.forEach(bill => {
        try {
          checkPageBreak(5); // Verificar quebra de página para cada linha
          
          // Converter para Date se for string
          const billDueDate = ensureDate(bill.dueDate);
          doc.text(formatDate(billDueDate), margin, y);
          
          // Limitar o tamanho da descrição
          let description = bill.description || 'Sem descrição';
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
        } catch (error) {
          console.error('Erro ao processar conta:', error);
          // Continuar com a próxima conta
        }
      });
      
      addSpacer();
      addLine();
    }
    
    // Dica financeira
    if (data.financialTip) {
      checkPageBreak(30);
      addTitle('Dica Financeira');
      
      // Quebrar a dica em múltiplas linhas se necessário
      const tipLines = doc.splitTextToSize(data.financialTip, contentWidth);
      doc.setFont('helvetica', 'italic');
      doc.text(tipLines, margin, y);
      y += tipLines.length * 6;
      
      addSpacer();
      addLine();
    }
    
    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, footerY, { align: 'center' });
      doc.text('Gerado por ICTUS - Sistema de Gestão Financeira Pessoal', pageWidth / 2, footerY + 5, { align: 'center' });
    }
    
    // Retornar o PDF como Blob
    return doc.output('blob');
  } catch (error) {
    console.error('Erro ao gerar PDF puro:', error);
    throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
