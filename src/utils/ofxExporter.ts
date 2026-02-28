import { Transaction } from '@/types';
import { BRAND_INFO } from './reportBranding';

/**
 * Exportador OFX profissional para STATER
 * Compatível com bancos brasileiros e softwares financeiros
 */

// Função para formatar data no padrão OFX
const formatOFXDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}[-03:BRT]`;
};

// Função para limpar texto (remover caracteres especiais problemáticos)
const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>&"']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 32); // OFX tem limite de 32 caracteres para MEMO
};

// Função para gerar ID único para transação
const generateFitId = (transaction: Transaction, index: number): string => {
  const dateStr = new Date(transaction.date).toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
  return `STATER${dateStr}${String(index).padStart(4, '0')}`;
};

// Função para exportar transações para o formato OFX (Open Financial Exchange)
export const exportToOFX = (
  transactions: Transaction[], 
  user: { name?: string; email?: string } | null,
  options?: {
    startDate?: Date;
    endDate?: Date;
    accountName?: string;
  }
): Blob => {
  try {
    const today = new Date();
    const serverDate = formatOFXDate(today);
    
    // Calcular saldo
    const balance = transactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
    
    // Determinar período das transações
    let startDate = today;
    let endDate = today;
    
    if (transactions.length > 0) {
      const dates = transactions.map(t => new Date(t.date));
      startDate = new Date(Math.min(...dates.map(d => d.getTime())));
      endDate = new Date(Math.max(...dates.map(d => d.getTime())));
    }
    
    if (options?.startDate) startDate = options.startDate;
    if (options?.endDate) endDate = options.endDate;
    
    const accountName = options?.accountName || user?.name || 'STATER USER';
    
    // Cabeçalho OFX padrão
    let ofxContent = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:UTF-8
CHARSET:UTF-8
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:${generateFitId({ id: 'header', date: today, type: 'income', amount: 0, title: '', category: '' } as Transaction, 0)}

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
<MESSAGE>Exportado por ${BRAND_INFO.name}
</STATUS>
<DTSERVER>${serverDate}
<LANGUAGE>POR
<INTU.BID>00000
<INTU.USERID>${sanitizeText(accountName)}
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>STATER${Date.now()}
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>BRL
<BANKACCTFROM>
<BANKID>STATER
<BRANCHID>001
<ACCTID>${sanitizeText(accountName)}
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>${formatOFXDate(startDate)}
<DTEND>${formatOFXDate(endDate)}
`;
    
    // Ordenar transações por data
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Adicionar transações
    sortedTransactions.forEach((transaction, index) => {
      const txDate = formatOFXDate(new Date(transaction.date));
      const txAmount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      const txType = transaction.type === 'income' ? 'CREDIT' : 'DEBIT';
      
      // Criar descrição com categoria
      let memo = sanitizeText(transaction.title);
      if (transaction.category) {
        memo = `${memo} [${sanitizeText(transaction.category)}]`.substring(0, 32);
      }
      
      ofxContent += `<STMTTRN>
<TRNTYPE>${txType}
<DTPOSTED>${txDate}
<TRNAMT>${txAmount.toFixed(2)}
<FITID>${generateFitId(transaction, index)}
<NAME>${sanitizeText(transaction.title)}
<MEMO>${memo}
</STMTTRN>
`;
    });
    
    // Finalizar o arquivo OFX com saldo
    ofxContent += `</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>${balance.toFixed(2)}
<DTASOF>${serverDate}
</LEDGERBAL>
<AVAILBAL>
<BALAMT>${balance.toFixed(2)}
<DTASOF>${serverDate}
</AVAILBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;
    
    // Converter para Blob (UTF-8)
    return new Blob([ofxContent], { type: 'application/x-ofx;charset=utf-8' });
  } catch (error) {
    console.error('Erro ao gerar OFX:', error);
    throw new Error(`Falha ao gerar arquivo OFX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
