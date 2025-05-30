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

// Funu00e7u00e3o auxiliar para converter string para Date de forma segura
const safeDateFormat = (dateValue: Date | string): string => {
  try {
    if (typeof dateValue === 'string') {
      // Tentar converter para Date e formatar
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'Data invau00e1lida';
      }
      return date.toLocaleDateString('pt-BR');
    }
    
    // Verificar se a data u00e9 vu00e1lida
    if (isNaN(dateValue.getTime())) {
      return 'Data invau00e1lida';
    }
    
    return dateValue.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data invau00e1lida';
  }
};

/**
 * Gera um PDF bem formatado visualmente com tabelas e estilo profissional,
 * mas com tratamento seguro para datas e valores que possam causar problemas.
 */
export const generateStyledPDF = (data: ReportData): Blob => {
  try {
    // Criar uma nova instu00e2ncia do PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20; // Posiu00e7u00e3o vertical inicial
    
    // Cores para o PDF
    const colors = {
      primary: [65, 105, 225], // Azul royal
      secondary: [220, 220, 220], // Cinza claro
      success: [46, 204, 113], // Verde
      danger: [231, 76, 60], // Vermelho
      text: [0, 0, 0], // Preto
      lightText: [100, 100, 100] // Cinza para textos secundu00e1rios
    };

    // Funu00e7u00f5es para desenhar elementos comuns
    const drawHeader = () => {
      // Retangulo de fundo azul claro no topo
      doc.setFillColor(240, 248, 255); // Azul muito claro
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Tu00edtulo centralizado
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(65, 105, 225); // Azul royal
      doc.text('Relatu00f3rio Financeiro', pageWidth / 2, 20, { align: 'center' });
      
      // Linha divisu00f3ria
      doc.setDrawColor(65, 105, 225);
      doc.setLineWidth(0.5);
      doc.line(50, 25, pageWidth - 50, 25);
      
      return 40; // Retorna a altura do header
    };
    
    // Desenhar cau00e7alho do documento
    y = drawHeader();
    
    // Informau00e7u00f5es do usuu00e1rio e peru00edodo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Datas de inu00edcio e fim formatadas de forma segura
    let startDateStr = 'Data invu00e1lida';
    let endDateStr = 'Data invu00e1lida';
    
    try {
      startDateStr = safeDateFormat(data.startDate);
      endDateStr = safeDateFormat(data.endDate);
    } catch (e) {
      console.error('Erro ao formatar datas do peru00edodo:', e);
    }
    
    doc.text(`Peru00edodo: ${startDateStr} a ${endDateStr}`, pageWidth / 2, y, { align: 'center' });
    y += 10;
    
    doc.text(`Usuu00e1rio: ${data.userName || 'Usuu00e1rio'}`, pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    // Resumo Financeiro (Tabela)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(65, 105, 225);
    doc.text('Resumo Financeiro', 15, y);
    y += 10;
    
    // Desenhar tabela de resumo
    const drawTable = (headers: string[], rows: string[][], startY: number, colWidths: number[]) => {
      let currentY = startY;
      const lineHeight = 10;
      const tableX = 15;
      
      // Cau00e7alho da tabela
      doc.setFillColor(240, 248, 255); // Azul muito claro
      doc.rect(tableX, currentY - 7, colWidths.reduce((a, b) => a + b, 0), lineHeight, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(65, 105, 225);
      
      let currentX = tableX;
      headers.forEach((header, i) => {
        const x = currentX + (i > 0 ? 5 : 0); // Adiciona um pouco de padding u00e0 esquerda, exceto no primeiro
        const align = i === headers.length - 1 ? 'right' : 'left';
        const xPos = align === 'right' ? currentX + colWidths[i] - 5 : x;
        
        doc.text(header, xPos, currentY, { align });
        currentX += colWidths[i];
      });
      
      currentY += lineHeight;
      
      // Linhas da tabela
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(tableX, currentY - 5, tableX + colWidths.reduce((a, b) => a + b, 0), currentY - 5);
      
      // Dados da tabela
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      rows.forEach((row, rowIndex) => {
        // Alternar cores de fundo das linhas
        if (rowIndex % 2 === 1) {
          doc.setFillColor(248, 249, 250); // Cinza muito claro
          doc.rect(tableX, currentY - 7, colWidths.reduce((a, b) => a + b, 0), lineHeight, 'F');
        }
        
        currentX = tableX;
        row.forEach((cell, i) => {
          const x = currentX + (i > 0 ? 5 : 0);
          const align = i === row.length - 1 ? 'right' : 'left';
          const xPos = align === 'right' ? currentX + colWidths[i] - 5 : x;
          
          // Definir cor para valores monetu00e1rios
          if (i === row.length - 1 && rowIndex < rows.length - 1) {
            if (rowIndex === 0) doc.setTextColor(0, 128, 0); // Verde para receitas
            else if (rowIndex === 1) doc.setTextColor(255, 0, 0); // Vermelho para despesas
            else doc.setTextColor(0, 0, 255); // Azul para saldo
          } else if (i === row.length - 1 && rowIndex === rows.length - 1) {
            // u00daltima linha (Saldo) em negrito
            doc.setFont('helvetica', 'bold');
            // Cor baseada no valor (positivo=verde, negativo=vermelho)
            if (cell.includes('-')) {
              doc.setTextColor(255, 0, 0);
            } else {
              doc.setTextColor(0, 128, 0);
            }
          }
          
          doc.text(cell, xPos, currentY, { align });
          doc.setTextColor(0, 0, 0); // Resetar cor
          doc.setFont('helvetica', 'normal'); // Resetar fonte
          currentX += colWidths[i];
        });
        
        currentY += lineHeight;
        
        // Adicionar linha divisu00f3ria apu00f3s cada linha, exceto a u00faltima
        if (rowIndex < rows.length - 1) {
          doc.setDrawColor(220, 220, 220);
          doc.line(tableX, currentY - 5, tableX + colWidths.reduce((a, b) => a + b, 0), currentY - 5);
        }
      });
      
      // Linha mais forte no final da tabela
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.line(tableX, currentY - 5, tableX + colWidths.reduce((a, b) => a + b, 0), currentY - 5);
      
      return currentY + 5; // Retorna a nova posiu00e7u00e3o Y aps a tabela
    };
    
    // Dados para a tabela de resumo
    const resumoHeaders = ['Tipo', 'Valor'];
    const resumoRows = [
      ['Receitas', formatCurrency(data.incomeTotal)],
      ['Despesas', formatCurrency(data.expenseTotal)],
      ['Saldo', formatCurrency(data.balance)]
    ];
    
    // Desenhar a tabela de resumo
    y = drawTable(resumoHeaders, resumoRows, y, [pageWidth - 100, 85]);
    y += 20;
    
    // Seou00e7u00e3o de Contas
    if (data.bills && data.bills.length > 0) {
      // Verificar se precisamos adicionar uma nova pu00e1gina
      if (y > pageHeight - 100) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(65, 105, 225);
      doc.text('Contas', 15, y);
      y += 10;
      
      // Cau00e7alho da tabela de contas
      const contasHeaders = ['Vencimento', 'Descriu00e7u00e3o', 'Status', 'Valor'];
      
      // Filtrar apenas as contas dentro do peru00edodo selecionado e ordenar por data
      const filteredBills = data.bills
        .filter(bill => {
          try {
            // Tentativa segura de verificar se a data estu00e1 dentro do peru00edodo
            const dueDate = typeof bill.dueDate === 'string' ? new Date(bill.dueDate) : bill.dueDate;
            if (isNaN(dueDate.getTime())) return true; // Incluir datas invu00e1lidas por seguranu00e7a
            
            return true; // Incluir todas as contas por enquanto
          } catch (e) {
            return true; // Em caso de erro, incluir a conta
          }
        })
        .sort((a, b) => {
          try {
            const dateA = typeof a.dueDate === 'string' ? new Date(a.dueDate) : a.dueDate;
            const dateB = typeof b.dueDate === 'string' ? new Date(b.dueDate) : b.dueDate;
            
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
            return dateA.getTime() - dateB.getTime();
          } catch (e) {
            return 0;
          }
        });
      
      // Limitar a 15 contas por pu00e1gina para evitar overflow
      const contasToShow = filteredBills.slice(0, 15);
      
      // Preparar dados da tabela de contas
      const contasRows = contasToShow.map(bill => {
        // Formatar a data de vencimento de forma segura
        const vencimento = safeDateFormat(bill.dueDate);
        
        // Limitar tamanho da descriu00e7u00e3o
        let desc = bill.description || 'Sem descriu00e7u00e3o';
        if (desc.length > 20) desc = desc.substring(0, 17) + '...';
        
        // Status formatado
        const status = bill.isPaid ? 'Pago' : 'Pendente';
        
        // Valor formatado
        const valor = formatCurrency(bill.amount);
        
        return [vencimento, desc, status, valor];
      });
      
      // Desenhar a tabela de contas
      y = drawTable(contasHeaders, contasRows, y, [60, 60, 50, 50]);
      
      // Se houver mais contas, adicionar indicador
      if (filteredBills.length > 15) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`...e mais ${filteredBills.length - 15} conta(s) no peru00edodo selecionado.`, 15, y);
        y += 10;
      }
    }
    
    // Rodapu00e9
    const drawFooter = (pageNum: number, totalPages: number) => {
      const footerY = pageHeight - 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Pu00e1gina ${pageNum} de ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
      doc.text('Gerado por ICTUS - Sistema de Gestu00e3o Financeira Pessoal', pageWidth / 2, footerY + 5, { align: 'center' });
    };
    
    // Aplicar rodapu00e9 em todas as pu00e1ginas
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(i, totalPages);
    }
    
    // Retornar o PDF como Blob
    return doc.output('blob');
  } catch (error) {
    console.error('Erro ao gerar PDF estilizado:', error);
    
    // Criu00e1vel de segurana - PDF extremamente bu00e1sico em caso de falha
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('RELATU00d3RIO FINANCEIRO', 105, 20, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Receitas: ${formatCurrency(data.incomeTotal)}`, 20, 40);
      doc.text(`Despesas: ${formatCurrency(data.expenseTotal)}`, 20, 50);
      doc.text(`Saldo: ${formatCurrency(data.balance)}`, 20, 60);
      return doc.output('blob');
    } catch (finalError) {
      // Se atu00e9 mesmo o PDF bu00e1sico falhar, criar um PDF vazio com mensagem de erro
      const doc = new jsPDF();
      doc.text('Erro ao gerar relatu00f3rio. Tente novamente.', 20, 20);
      return doc.output('blob');
    }
  }
};
