import { Transaction } from '@/types';

// Função para exportar transações para o formato OFX (Open Financial Exchange)
export const exportToOFX = (transactions: Transaction[], user: { name?: string; email?: string } | null): Blob => {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().replace(/[-:]/g, '').split('.')[0] + '[0:GMT]';
    
    // Cabeçalho OFX
    let ofxContent = `OFXHEADER:100\n` +
      `DATA:OFXSGML\n` +
      `VERSION:102\n` +
      `SECURITY:NONE\n` +
      `ENCODING:USASCII\n` +
      `CHARSET:1252\n` +
      `COMPRESSION:NONE\n` +
      `OLDFILEUID:NONE\n` +
      `NEWFILEUID:NONE\n\n` +
      `<OFX>\n` +
      `<SIGNONMSGSRSV1>\n` +
      `<SONRS>\n` +
      `<STATUS>\n` +
      `<CODE>0\n` +
      `<SEVERITY>INFO\n` +
      `</STATUS>\n` +
      `<DTSERVER>${formattedDate}\n` +
      `<LANGUAGE>POR\n` +
      `<INTU.BID>00000\n` +
      `</SONRS>\n` +
      `</SIGNONMSGSRSV1>\n` +
      `<BANKMSGSRSV1>\n` +
      `<STMTTRNRS>\n` +
      `<TRNUID>1001\n` +
      `<STATUS>\n` +
      `<CODE>0\n` +
      `<SEVERITY>INFO\n` +
      `</STATUS>\n` +
      `<STMTRS>\n` +
      `<CURDEF>BRL\n` +
      `<BANKACCTFROM>\n` +
      `<BANKID>000\n` +
      `<ACCTID>${user?.name || 'ICTUS USER'}\n` +
      `<ACCTTYPE>CHECKING\n` +
      `</BANKACCTFROM>\n` +
      `<BANKTRANLIST>\n` +
      `<DTSTART>${formattedDate}\n` +
      `<DTEND>${formattedDate}\n`;
    
    // Adicionar transações
    transactions.forEach((transaction, index) => {
      const txDate = new Date(transaction.date).toISOString().replace(/[-:]/g, '').split('.')[0] + '[0:GMT]';
      const txAmount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      
      ofxContent += `<STMTTRN>\n` +
        `<TRNTYPE>${transaction.type === 'income' ? 'CREDIT' : 'DEBIT'}\n` +
        `<DTPOSTED>${txDate}\n` +
        `<TRNAMT>${txAmount.toFixed(2)}\n` +
        `<FITID>ICTUS${index}\n` +
        `<CHECKNUM>${transaction.id.substring(0, 8)}\n` +
        `<MEMO>${transaction.title}\n` +
        `</STMTTRN>\n`;
    });
    
    // Finalizar o arquivo OFX
    ofxContent += `</BANKTRANLIST>\n` +
      `<LEDGERBAL>\n` +
      `<BALAMT>0.00\n` +
      `<DTASOF>${formattedDate}\n` +
      `</LEDGERBAL>\n` +
      `</STMTRS>\n` +
      `</STMTTRNRS>\n` +
      `</BANKMSGSRSV1>\n` +
      `</OFX>`;
    
    // Converter para Blob
    return new Blob([ofxContent], { type: 'application/x-ofx' });
  } catch (error) {
    console.error('Erro ao gerar OFX:', error);
    throw new Error(`Falha ao gerar arquivo OFX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
