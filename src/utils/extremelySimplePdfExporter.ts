import jsPDF from 'jspdf';
import { formatCurrency } from './formatters';

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

/**
 * Gera um PDF extremamente simples sem usar datas que possam causar problemas.
 * Esta u00e9 uma versnu00e3o ultra bu00e1sica que prioriza funcionamento sobre apresentau00e7u00e3o.
 */
export const generateExtremelySafePDF = (data: ReportData): Blob => {
  try {
    // Criar uma nova instu00e2ncia do PDF
    const doc = new jsPDF();
    let y = 20; // Posiu00e7u00e3o vertical inicial
    const margin = 20;
    
    // Adicionar texto
    const addText = (text: string) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Preto
      doc.text(text, margin, y);
      y += 6;
      
      // Adicionar nova pu00e1gina se necessario
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    };
    
    // Adicionar tu00edtulo
    const addTitle = (text: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto
      doc.text(text.toUpperCase(), margin, y);
      y += 10;
    };
    
    // Texto do relatório financeiro (sem formatar datas que podem causar problemas)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('RELATU00d3RIO FINANCEIRO', 105, 20, { align: 'center' });
    y = 30;
    
    // Informau00e7u00f5es Bu00e1sicas
    addTitle('INFORMAU00c7U00d5ES BU00c1SICAS');
    addText(`Usuu00e1rio: ${data.userName || 'Usuário'}`);
    addText('Perído: Conforme selecionado');
    addText(`Data de gerau00e7u00e3o: ${new Date().toLocaleDateString()}`);
    y += 5;
    
    // Resumo financeiro
    addTitle('RESUMO FINANCEIRO');
    addText(`Receitas: ${formatCurrency(data.incomeTotal)}`);
    addText(`Despesas: ${formatCurrency(data.expenseTotal)}`);
    addText(`Saldo: ${formatCurrency(data.balance)}`);
    y += 5;
    
    // Distribuiu00e7u00e3o de despesas por categoria
    addTitle('DISTRIBUIU00c7U00c3O DE DESPESAS POR CATEGORIA');
    
    const categories = Object.entries(data.expensesByCategory || {})
      .sort((a, b) => b[1] - a[1]); // Ordenar por valor (maior para menor)
    
    if (categories.length > 0) {
      categories.forEach(([category, amount]) => {
        try {
          const percentage = data.expenseTotal ? (amount / data.expenseTotal * 100).toFixed(1) : '0.0';
          addText(`${category || 'Sem categoria'}: ${formatCurrency(amount)} (${percentage}%)`);
        } catch (e) {
          addText(`${category || 'Sem categoria'}: ${formatCurrency(amount)}`);
        }
      });
    } else {
      addText('Nenhuma despesa registrada no periu00f3odo.');
    }
    y += 5;
    
    // Transau00e7u00f5es de entrada - Apenas totais sem datas
    addTitle('RECEITAS');
    addText(`Total de entradas: ${data.incomeTransactions?.length || 0} transações`);
    addText(`Valor total: ${formatCurrency(data.incomeTotal)}`);
    y += 5;
    
    // Transau00e7u00f5es de sau00edda - Apenas totais sem datas
    addTitle('DESPESAS');
    addText(`Total de saídas: ${data.expenseTransactions?.length || 0} transações`);
    addText(`Valor total: ${formatCurrency(data.expenseTotal)}`);
    y += 5;
    
    // Contas a pagar/receber - Apenas totais sem datas
    const billsPayable = data.bills?.filter(b => b.type === 'payable') || [];
    const billsReceivable = data.bills?.filter(b => b.type === 'receivable') || [];
    
    addTitle('CONTAS A PAGAR/RECEBER');
    addText(`Total de contas a pagar: ${billsPayable.length}`);
    addText(`Total de contas a receber: ${billsReceivable.length}`);
    y += 5;
    
    // Dica financeira
    if (data.financialTip) {
      addTitle('DICA FINANCEIRA');
      
      // Quebrar a dica em mu00faltiplas linhas se necessáro
      const splitSize = 80; // Tamanho mu00e1ximo da linha
      const words = data.financialTip.split(' ');
      let line = '';
      
      words.forEach(word => {
        if ((line + word).length > splitSize) {
          addText(line);
          line = word + ' ';
        } else {
          line += word + ' ';
        }
      });
      
      if (line) {
        addText(line);
      }
    }
    
    // Rodapu00e9 simples
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount} - STATER - Inteligência para prosperar`, 105, 290, { align: 'center' });
    }
    
    // Retornar o PDF como Blob
    return doc.output('blob');
  } catch (error) {
    console.error('Erro ao gerar PDF ultra simples:', error);
    // Criu00e1vel até a opção mais básica possível - apenas texto
    const doc = new jsPDF();
    doc.text('RELATU00d3RIO FINANCEIRO', 105, 20, { align: 'center' });
    doc.text('Não foi possível gerar o relatório detalhado.', 20, 40);
    doc.text(`Receitas: ${formatCurrency(data.incomeTotal)}`, 20, 60);
    doc.text(`Despesas: ${formatCurrency(data.expenseTotal)}`, 20, 70);
    doc.text(`Saldo: ${formatCurrency(data.balance)}`, 20, 80);
    return doc.output('blob');
  }
};
