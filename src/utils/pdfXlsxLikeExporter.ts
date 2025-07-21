import jsPDF from 'jspdf';

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

// Tipos
interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: string | Date;
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
  bills: Bill[];
}

export function generateXlsxLikePDF(data: ReportData): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Logo Stater
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(65, 105, 225);
  doc.text('Stater - Inteligência para prosperar', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Cabeçalho azul
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(65, 105, 225);
  doc.text('Relatório Financeiro', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Período: ${formatDateBR(data.startDate)} a ${formatDateBR(data.endDate)}`, pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.text(`Usuário: ${data.userName || ''}`, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Resumo financeiro
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(65, 105, 225);
  doc.text('Resumo Financeiro', 15, y);
  y += 7;

  // Tabela de resumo
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo', 18, y);
  doc.text('Valor', 60, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('Receitas', 18, y);
  doc.setTextColor(0, 128, 0);
  doc.text(formatCurrency(data.incomeTotal), 60, y);
  y += 6;
  doc.setTextColor(0, 0, 0);
  doc.text('Despesas', 18, y);
  doc.setTextColor(255, 0, 0);
  doc.text(formatCurrency(data.expenseTotal), 60, y);
  y += 6;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Saldo', 18, y);
  doc.setTextColor(data.balance >= 0 ? 0 : 255, data.balance >= 0 ? 128 : 0, 0);
  doc.text(formatCurrency(data.balance), 60, y);
  y += 10;
  doc.setTextColor(0, 0, 0);

  // Tabela de contas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(65, 105, 225);
  doc.text('Contas', 15, y);
  y += 7;

  // Cabeçalho da tabela
  const headers = ['Vencimento', 'Descrição', 'Status', 'Valor'];
  const colX = [15, 50, 120, 160];
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  headers.forEach((h, i) => doc.text(h, colX[i], y));
  y += 5;
  doc.setFont('helvetica', 'normal');

  // Linhas da tabela
  data.bills.forEach((bill) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      headers.forEach((h, i) => doc.text(h, colX[i], y));
      y += 5;
      doc.setFont('helvetica', 'normal');
    }
    doc.setTextColor(0, 0, 0);
    doc.text(formatDateBR(bill.dueDate), colX[0], y);
    let desc = bill.description || '';
    if (desc.length > 25) desc = desc.substring(0, 22) + '...';
    doc.text(desc, colX[1], y);
    // Status
    if (bill.isPaid) {
      doc.setTextColor(0, 128, 0);
      doc.text('Pago', colX[2], y);
    } else {
      doc.setTextColor(255, 0, 0);
      doc.text('Pendente', colX[2], y);
    }
    doc.setTextColor(0, 0, 0);
    doc.text(formatCurrency(bill.amount), colX[3], y, { align: 'right' });
    y += 6;
  });

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
