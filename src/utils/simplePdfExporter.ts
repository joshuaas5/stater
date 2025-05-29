import { Transaction, Bill } from '@/types';
import jsPDF from 'jspdf';
// Importação explícita do plugin jspdf-autotable
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

// Função para formatar valores monetários
const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Função para formatar datas (dd/mm/yyyy)
const formatDate = (dateInput: Date | string): string => {
  if (!dateInput) return '';
  let date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('pt-BR');
};

// Função principal de exportação para PDF
export const generatePDF = (data: ReportData): Blob => {
  // Criar nova instância do jsPDF
  const doc = new jsPDF();
  
  // Cores
  const colorText = '#374151';
  const colorPrimary = '#4F87FF';
  const colorPositive = '#2DE370';
  const colorNegative = '#FF4F56';
  
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
  
  // Período
  doc.setFontSize(12);
  doc.setTextColor(colorText);
  doc.text(`Período: ${data.period}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;
  
  // Resumo financeiro
  doc.setFontSize(14);
  doc.setTextColor(colorPrimary);
  doc.text('Resumo Financeiro', margin, yPos);
  yPos += 10;
  
  // Tabela de resumo
  const summaryData = [
    ['Receitas', formatCurrency(data.incomeTotal)],
    ['Despesas', formatCurrency(data.expenseTotal)],
    ['Saldo', formatCurrency(data.balance)]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Tipo', 'Valor']],
    body: summaryData,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: '#F8FAFC',
      textColor: colorText,
      fontStyle: 'bold'
    },
    bodyStyles: {
      textColor: colorText
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'right', cellWidth: 'auto' }
    }
  });
  
  // Atualizar posição após a tabela
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Contas
  doc.setFontSize(14);
  doc.setTextColor(colorPrimary);
  doc.text('Contas', margin, yPos);
  yPos += 10;
  
  if (data.bills.length > 0) {
    const billsTableData = data.bills.map(b => {
      // Formatar informação de parcelas
      const installmentInfo = b.totalInstallments && b.currentInstallment 
        ? `${b.currentInstallment}/${b.totalInstallments}` 
        : b.isRecurring ? 'Recorrente' : '-';
      
      return [
        formatDate(b.dueDate),
        b.title,
        b.category,
        b.isPaid ? 'Paga' : 'Pendente',
        installmentInfo,
        formatCurrency(b.amount)
      ];
    });
    
    doc.autoTable({
      startY: yPos,
      head: [['Vencimento', 'Descrição', 'Categoria', 'Status', 'Parcelas', 'Valor']],
      body: billsTableData,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: '#F8FAFC',
        textColor: colorText,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'right' }
      }
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(colorText);
    doc.text('Nenhuma conta no período.', margin, yPos);
  }
  
  // Retornar o documento como blob
  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
};
