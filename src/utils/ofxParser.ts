// Parser de arquivos OFX (Open Financial Exchange)
// Suporta extratos bancários e faturas de cartão de crédito

export interface OFXTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  fitId?: string; // ID único da transação no banco
  memo?: string;
  checkNum?: string;
}

export interface OFXParseResult {
  success: boolean;
  transactions: OFXTransaction[];
  bankInfo?: {
    bankId?: string;
    accountId?: string;
    accountType?: string;
    currency?: string;
  };
  statementInfo?: {
    startDate?: string;
    endDate?: string;
    balance?: number;
  };
  error?: string;
}

// Função para extrair valor de uma tag OFX
const extractTagValue = (content: string, tagName: string): string | null => {
  // Formato SGML: <TAG>valor ou <TAG>valor</TAG>
  // O valor pode ter timezone como [-3:BRT]
  const patterns = [
    new RegExp(`<${tagName}>([^<\\n]+)`, 'i'),
    new RegExp(`<${tagName}>([^<]+)</${tagName}>`, 'i'),
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

// Função para parsear data OFX (suporta vários formatos)
const parseOFXDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  // Remover timezone se presente (ex: [-3:BRT] ou [0:GMT])
  const cleanDate = dateStr.replace(/\[.*?\]/g, '').trim();
  
  // Extrair apenas YYYYMMDD (primeiros 8 caracteres)
  const datePart = cleanDate.substring(0, 8);
  
  if (datePart.length >= 8) {
    const year = datePart.substring(0, 4);
    const month = datePart.substring(4, 6);
    const day = datePart.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  
  return new Date().toISOString().split('T')[0];
};

// Função para extrair todas as transações
const extractTransactions = (content: string): OFXTransaction[] => {
  const transactions: OFXTransaction[] = [];
  
  console.log('🔍 [OFX] Buscando transações no conteúdo...');
  
  // Encontrar todas as tags STMTTRN (transações bancárias e cartão de crédito)
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;
  
  while ((match = stmtTrnRegex.exec(content)) !== null) {
    const txContent = match[1];
    
    // Extrair campos da transação
    const trnType = extractTagValue(txContent, 'TRNTYPE');
    const dtPosted = extractTagValue(txContent, 'DTPOSTED');
    const trnAmt = extractTagValue(txContent, 'TRNAMT');
    const fitId = extractTagValue(txContent, 'FITID');
    const memo = extractTagValue(txContent, 'MEMO') || extractTagValue(txContent, 'NAME');
    const checkNum = extractTagValue(txContent, 'CHECKNUM') || extractTagValue(txContent, 'REFNUM');
    
    console.log('🔍 [OFX] Transação encontrada:', { trnType, dtPosted, trnAmt, memo });
    
    if (trnAmt && dtPosted) {
      const amount = parseFloat(trnAmt.replace(',', '.'));
      const isIncome = amount > 0 || trnType?.toUpperCase() === 'CREDIT';
      
      // Usar nova função de parse de data
      const isoDate = parseOFXDate(dtPosted);
      
      transactions.push({
        id: fitId || `ofx-${Date.now()}-${transactions.length}`,
        description: memo || 'Transação importada',
        amount: Math.abs(amount),
        type: isIncome ? 'income' : 'expense',
        category: inferCategory(memo || '', isIncome),
        date: isoDate,
        fitId,
        memo,
        checkNum,
      });
    }
  }
  
  console.log(`✅ [OFX] Total de transações extraídas: ${transactions.length}`);
  return transactions;
};

// Função para inferir categoria baseado na descrição
const inferCategory = (description: string, isIncome: boolean): string => {
  const desc = description.toLowerCase();
  
  if (isIncome) {
    if (desc.includes('salario') || desc.includes('salário') || desc.includes('pagamento recebido')) return 'Salário';
    if (desc.includes('pix') && desc.includes('recebido')) return 'Transferências';
    if (desc.includes('transferencia') || desc.includes('ted') || desc.includes('doc')) return 'Transferências';
    if (desc.includes('rendimento') || desc.includes('juros') || desc.includes('cdb')) return 'Investimentos';
    if (desc.includes('aluguel')) return 'Renda Extra';
    if (desc.includes('estorno')) return 'Estornos';
    return 'Outros';
  } else {
    // Despesas
    // Transporte
    if (desc.includes('uber') || desc.includes('99') || desc.includes('taxi') || desc.includes('combustivel') || desc.includes('gasolina') || desc.includes('posto') || desc.includes('schmithausen')) return 'Transporte';
    
    // Alimentação
    if (desc.includes('ifood') || desc.includes('rappi') || desc.includes('restaurante') || desc.includes('lanchonete') || desc.includes('padaria') || desc.includes('mercado') || desc.includes('supermercado') || desc.includes('atacadao') || desc.includes('atacadista') || desc.includes('fort atacadista') || desc.includes('koch') || desc.includes('burger') || desc.includes('chocolates')) return 'Alimentação';
    
    // Assinaturas
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('disney') || desc.includes('hbo') || desc.includes('prime') || desc.includes('youtube') || desc.includes('vivo easy')) return 'Assinaturas';
    
    // Utilidades
    if (desc.includes('luz') || desc.includes('energia') || desc.includes('cemig') || desc.includes('enel') || desc.includes('cpfl')) return 'Utilidades';
    if (desc.includes('agua') || desc.includes('saneamento') || desc.includes('copasa') || desc.includes('sabesp')) return 'Utilidades';
    if (desc.includes('internet') || desc.includes('vivo') || desc.includes('claro') || desc.includes('tim') || desc.includes('oi')) return 'Utilidades';
    
    // Moradia
    if (desc.includes('aluguel') || desc.includes('condominio') || desc.includes('iptu') || desc.includes('havan')) return 'Casa';
    
    // Saúde
    if (desc.includes('farmacia') || desc.includes('drogaria') || desc.includes('hospital') || desc.includes('clinica') || desc.includes('medic') || desc.includes('saude') || desc.includes('rdsaude') || desc.includes('genera')) return 'Saúde';
    if (desc.includes('academia') || desc.includes('smart fit') || desc.includes('gympass')) return 'Saúde';
    
    // Pet
    if (desc.includes('pet') || desc.includes('animal') || desc.includes('veterinar') || desc.includes('vita') || desc.includes('hiperxdog')) return 'Pet';
    
    // Educação
    if (desc.includes('escola') || desc.includes('faculdade') || desc.includes('curso') || desc.includes('udemy') || desc.includes('alura')) return 'Educação';
    
    // Compras online
    if (desc.includes('aliexpress') || desc.includes('alipay') || desc.includes('amazon') || desc.includes('mercado livre') || desc.includes('americanas') || desc.includes('efacil')) return 'Compras';
    if (desc.includes('shopping') || desc.includes('loja') || desc.includes('magalu')) return 'Compras';
    
    // Transferências
    if (desc.includes('pix') || desc.includes('transferencia') || desc.includes('ted') || desc.includes('doc')) return 'Transferências';
    
    // Cartões/Parcelamentos
    if (desc.includes('cartao') || desc.includes('fatura') || desc.includes('nubank') || desc.includes('inter') || desc.includes('c6') || desc.includes('parcela')) return 'Parcelamentos';
    
    // Dinheiro
    if (desc.includes('saque') || desc.includes('caixa')) return 'Dinheiro';
    
    // Automóvel
    if (desc.includes('autocenter') || desc.includes('muniz') || desc.includes('mecanica') || desc.includes('oficina') || desc.includes('pneu')) return 'Veículo';
    
    return 'Outros';
  }
};

// Função para extrair informações do banco
const extractBankInfo = (content: string) => {
  return {
    bankId: extractTagValue(content, 'BANKID'),
    accountId: extractTagValue(content, 'ACCTID'),
    accountType: extractTagValue(content, 'ACCTTYPE'),
    currency: extractTagValue(content, 'CURDEF') || 'BRL',
  };
};

// Função para extrair informações do extrato
const extractStatementInfo = (content: string) => {
  const startDate = extractTagValue(content, 'DTSTART');
  const endDate = extractTagValue(content, 'DTEND');
  const balance = extractTagValue(content, 'BALAMT');
  
  return {
    startDate: startDate ? parseOFXDate(startDate) : undefined,
    endDate: endDate ? parseOFXDate(endDate) : undefined,
    balance: balance ? parseFloat(balance.replace(',', '.')) : undefined,
  };
};

// Função principal para parsear arquivo OFX
export const parseOFX = (content: string): OFXParseResult => {
  try {
    console.log('🔍 [OFX_PARSER] Iniciando parse do arquivo OFX...');
    
    // Verificar se é um arquivo OFX válido
    if (!content.includes('OFXHEADER') && !content.includes('<OFX>') && !content.includes('<ofx>')) {
      return {
        success: false,
        transactions: [],
        error: 'Arquivo não parece ser um OFX válido',
      };
    }
    
    // Extrair transações
    const transactions = extractTransactions(content);
    
    if (transactions.length === 0) {
      return {
        success: false,
        transactions: [],
        error: 'Nenhuma transação encontrada no arquivo OFX',
      };
    }
    
    // Extrair informações adicionais
    const bankInfo = extractBankInfo(content);
    const statementInfo = extractStatementInfo(content);
    
    console.log(`✅ [OFX_PARSER] ${transactions.length} transações encontradas`);
    
    return {
      success: true,
      transactions,
      bankInfo,
      statementInfo,
    };
    
  } catch (error) {
    console.error('❌ [OFX_PARSER] Erro ao parsear OFX:', error);
    return {
      success: false,
      transactions: [],
      error: error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo',
    };
  }
};

// Função para ler arquivo OFX do input file
export const readOFXFile = (file: File): Promise<OFXParseResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        resolve(parseOFX(content));
      } else {
        resolve({
          success: false,
          transactions: [],
          error: 'Não foi possível ler o conteúdo do arquivo',
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        transactions: [],
        error: 'Erro ao ler o arquivo',
      });
    };
    
    // Tentar ler como texto com diferentes encodings
    reader.readAsText(file, 'ISO-8859-1'); // OFX geralmente usa este encoding
  });
};
