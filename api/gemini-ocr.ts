// API OCR funcional - baseada no teste que funcionou
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDTTPO0otruHVzh7bXsi7MCyG674P03758";

// Função para processar PDF com senha
async function processPdfWithPassword(pdfBase64: string, password?: string): Promise<string> {
  try {
    console.log('[OCR] Processando PDF, senha fornecida:', !!password);
    
    // Se não tem senha, tentar processar normalmente
    if (!password) {
      return pdfBase64;
    }

    // Importar pdf-lib dinamicamente
    const { PDFDocument } = await import('pdf-lib');
    
    // Converter base64 para buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    try {
      // Tentar carregar o PDF (pdf-lib não suporta senha diretamente)
      // Se der erro, é porque precisa de senha
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      // Se chegou aqui, não precisava de senha ou já estava desbloqueado
      console.log('[OCR] PDF carregado sem problemas');
      return pdfBase64;
      
    } catch (loadError: any) {
      console.log('[OCR] Erro ao carregar PDF:', loadError.message);
      
      // Se é erro relacionado a criptografia/senha
      if (loadError.message.includes('encrypt') || loadError.message.includes('password') || 
          loadError.message.includes('security') || loadError.message.includes('owner')) {
        throw new Error('SENHA_INCORRETA');
      }
      
      // Outros erros de PDF
      throw new Error('PDF_CORRUPTO');
    }
    
  } catch (error: any) {
    console.error('[OCR] Erro ao processar PDF com senha:', error.message);
    throw error;
  }
}

// Função para processar PDF protegido por senha
async function processProtectedPdf(pdfBase64: string, password: string): Promise<string> {
  try {
    console.log('[OCR] Tentando desbloquear PDF com senha...');
    
    // Converter base64 para buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    // Para PDFs protegidos por senha, vamos tentar uma abordagem mais simples
    // Primeiro, tentar verificar se o PDF é realmente protegido
    const pdfHeader = pdfBuffer.toString('ascii', 0, 100);
    
    if (pdfHeader.includes('Encrypt')) {
      console.log('[OCR] PDF protegido detectado, mas não conseguimos desbloquear no servidor');
      throw new Error('NEEDS_PASSWORD');
    }
    
    // Se chegou aqui, assumir que o PDF não é protegido ou já foi processado
    return pdfBase64;
    
  } catch (error: any) {
    console.error('[OCR] Erro ao processar PDF:', error.message);
    
    if (error.message === 'NEEDS_PASSWORD') {
      throw error;
    }
    
    throw new Error('PDF_PROCESSING_ERROR');
  }
}

// Função para processar arquivos de texto (CSV, TXT, Excel)
async function processTextFile(req: any, res: any, textContent: string, fileType: string, excelData?: string) {
  console.log('[TEXT] Processando arquivo de texto/planilha...');
  console.log('[TEXT] Tipo:', fileType);
  console.log('[TEXT] Tamanho do conteúdo texto:', textContent?.length || 0);
  console.log('[TEXT] Dados Excel presentes:', !!excelData);
  
  let finalTextContent = textContent;
  
  // Processar arquivo Excel se fornecido
  if (excelData && (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('xls'))) {
    try {
      console.log('[TEXT] Processando arquivo Excel...');
      
      // Importar XLSX dinamicamente
      const XLSX = await import('xlsx');
      
      // Converter base64 para buffer
      const buffer = Buffer.from(excelData, 'base64');
      
      // Ler workbook
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Pegar primeira planilha
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
        // Converter para CSV
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      console.log('[TEXT] Excel convertido para CSV, tamanho:', csvData.length);
      
      finalTextContent = csvData;
      
    } catch (excelError: any) {
      console.error('[TEXT] Erro ao processar Excel:', excelError.message);
      return res.status(400).json({ 
        error: 'Arquivo não foi lido corretamente',
        suggestions: [
          '📸 TIRE UMA FOTO da planilha na tela e envie',
          '📋 COPIE os dados da planilha e cole no chat',
          '💾 SALVE como PDF e envie'
        ],
        needsManualReview: true
      });
    }
  }
  
  if (!finalTextContent || finalTextContent.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Conteúdo do arquivo vazio',
      details: 'O arquivo não contém dados válidos para processamento.'
    });
  }  const prompt = `
VOCÊ É UM ESPECIALISTA EM ANÁLISE DE DADOS FINANCEIROS BRASILEIROS.

ANALISE ESTE CONTEÚDO DE ARQUIVO FINANCEIRO e extraia TODAS as transações com MÁXIMA PRECISÃO:

FORMATO DO ARQUIVO: ${fileType}
CONTEÚDO A ANALISAR:
${finalTextContent}

INSTRUÇÕES ESPECÍFICAS POR FORMATO:

🗂️ PARA CSV/EXCEL:
- Procure colunas com: Data, Descrição/Histórico, Valor/Débito/Crédito, Tipo
- IGNORE linhas de cabeçalho, totais, saldos, rodapés
- Valores sempre POSITIVOS no JSON (ex: -150.50 vira 150.50)
- Determine tipo pela coluna ou contexto da descrição
- Aceite separadores: vírgula (,) ou ponto e vírgula (;)
- Formatos de valor: "1234.56", "1.234,56", "R$ 1.234,56", "-1234,56"

📄 PARA ARQUIVOS TXT:
- Procure padrões: DD/MM/AAAA + DESCRIÇÃO + VALOR
- Valores com + ou sem sinal = ENTRADA (income)
- Valores com - = SAÍDA (expense)
- PIX enviado/TED = expense, PIX recebido = income
- Ignore linhas de "SALDO", "TOTAL", "ANTERIOR"

🏦 REGRAS PARA BANCOS BRASILEIROS:
- Banco do Brasil: (+) = income, (-) = expense
- Bradesco: DÉBITO/D = expense, CRÉDITO/C = income  
- Caixa: D = expense, C = income
- Nubank: "enviado"/"pago" = expense, "recebido" = income
- Itaú: (+) = income, (-) = expense
- Transferências: analise direção ("para" = expense, "de" = income)

VALIDAÇÃO OBRIGATÓRIA:
- NÃO extraia se só houver valores < R$ 1,00
- Extratos típicos têm MÚLTIPLAS transações variadas
- Se poucos dados válidos, retorne transactions: []
- SEMPRE use números positivos no campo amount

FORMATO JSON OBRIGATÓRIO:
{
  "documentType": "extrato_${fileType}",
  "confidence": 0.95,
  "summary": {
    "totalAmount": [SOMA TOTAL],
    "totalIncome": [SOMA receitas],
    "totalExpense": [SOMA despesas],
    "establishment": "Banco identificado",
    "period": "Período detectado",
    "fileFormat": "${fileType}"
  },
  "transactions": [    {
      "description": "Descrição clara da transação",
      "amount": 150.50,
      "type": "expense",
      "category": "Alimentação",
      "date": "2024-12-25",
      "confidence": 0.9
    }
  ]
}

CATEGORIAS VÁLIDAS (use exatamente esses nomes):
- "Alimentação": supermercados, restaurantes, delivery, padarias, açougues
- "Transporte": combustível, uber, táxi, ônibus, pedágios, estacionamento
- "Saúde": farmácias, consultas médicas, planos de saúde, clínicas
- "Entretenimento": cinema, streaming, jogos, viagens, bares, baladas
- "Habitação": aluguel, condomínio, água, luz, gás, internet, telefone
- "Educação": cursos, livros, mensalidades escolares, material escolar
- "Cuidados Pessoais": salão, barbeiro, cosméticos, produtos de higiene
- "Impostos": taxas governamentais, IPTU, multas
- "Poupança e Investimentos": aplicações, transferências para poupança
- "Pagamentos de Dívidas": empréstimos, financiamentos, cartão de crédito
- "Outros": categoria genérica para itens não categorizados

REGRAS DE CATEGORIZAÇÃO AUTOMÁTICA:
- MERCADO/SUPERMERCADO/EXTRA/CARREFOUR/PÃO DE AÇÚCAR → "Alimentação"
- POSTO/SHELL/PETROBRAS/IPIRANGA/BR → "Transporte"  
- FARMÁCIA/DROGARIA/RAIA/PACHECO → "Saúde"
- CINEMA/NETFLIX/SPOTIFY/AMAZON PRIME → "Entretenimento"
- ENEL/SABESP/COMGÁS/NET/VIVO/TIM → "Habitação"
- ESCOLA/FACULDADE/CURSO/LIVRARIA → "Educação"
- SALÃO/BARBEARIA/O BOTICÁRIO/NATURA → "Cuidados Pessoais"
- RECEITA FEDERAL/DETRAN/PREFEITURA → "Impostos"
- BANCO/INVEST/POUPANÇA/APLICAÇÃO → "Poupança e Investimentos"
- EMPRÉSTIMO/FINANCIAMENTO/CARTÃO → "Pagamentos de Dívidas"
- Outros casos → "Outros"

CATEGORIZAÇÃO INTELIGENTE:
- Analise a DESCRIÇÃO da transação
- Use palavras-chave para identificar a categoria
- Sempre atribua uma categoria válida da lista acima
- NÃO deixe "category" vazio ou com valores inexistentes
- "tecnologia": eletrônicos, software, internet, telefone
- "servicos": bancos, seguros, manutenções, taxas
- "compras": roupas, casa, presentes, diversos
- "transferencia": PIX, TED, transferências entre contas
- "investimento": aplicações, resgates, corretora
- "receita": salário, freelance, vendas, aluguéis
- "outros": quando não se encaixa em nenhuma categoria

EXEMPLO DE SAÍDA VÁLIDA:
{
  "documentType": "extrato_csv",
  "confidence": 0.95,
  "summary": {
    "totalAmount": 2565.25,
    "totalIncome": 1500.00,
    "totalExpense": 1065.25,
    "establishment": "Banco do Brasil",
    "period": "Dezembro 2024",
    "fileFormat": "text/csv"
  },
  "transactions": [
    {
      "description": "Supermercado Extra",
      "amount": 285.90,
      "type": "expense",
      "category": "Alimentação",
      "date": "2024-12-15",
      "confidence": 0.95
    }
  ]
}

IMPORTANTE: 
- Retorne APENAS o JSON válido, sem texto adicional
- Se não encontrar dados válidos, retorne transactions: [] (array vazio)
- Sempre use valores numéricos (não strings) para amounts
- Datas sempre no formato YYYY-MM-DD
- Types apenas "income" ou "expense"
`;

  try {
    console.log('[TEXT] Chamando Gemini para análise de texto...');
    console.log('[TEXT] Tamanho do prompt:', prompt.length);
    console.log('[TEXT] Primeiros 200 chars do conteúdo:', finalTextContent.substring(0, 200));
    
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 16,
        topP: 0.8,
        maxOutputTokens: 8192,
      }
    };    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );if (!response.ok) {
      const errorText = await response.text();
      console.error('[TEXT] Erro Gemini:', response.status, errorText);
      return res.status(500).json({ 
        success: false,
        error: 'Erro na análise do arquivo',
        details: `Erro ${response.status}: ${errorText.substring(0, 200)}`,
        suggestions: [
          '📸 TIRE UMA FOTO da tela do extrato e envie',
          '📋 COPIE o texto do extrato e cole no chat',
          '💾 SALVE como PDF e tente novamente'
        ]
      });
    }    const data = await response.json() as any;
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('[TEXT] Resposta inválida do Gemini:', JSON.stringify(data));
      return res.status(500).json({
        success: false,
        error: 'Resposta inválida da IA',
        details: 'A IA não conseguiu processar o arquivo.',
        suggestions: [
          '📸 TIRE UMA FOTO da tela do extrato e envie',
          '📋 COPIE o texto do extrato e cole no chat',
          '💾 SALVE como PDF e tente novamente'
        ]
      });
    }
    
    const responseText = data.candidates[0].content.parts[0].text || '';
    
    console.log('[TEXT] Resposta Gemini recebida, tamanho:', responseText.length);
    console.log('[TEXT] Primeiros 200 chars:', responseText.substring(0, 200));

    // Processar resposta JSON similar ao OCR
    let textResult: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        textResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }      // Calcular totais corretamente
      const totalIncome = textResult.transactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
        
      const totalExpense = textResult.transactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
      
      textResult.summary.totalIncome = totalIncome;
      textResult.summary.totalExpense = totalExpense;
      textResult.summary.totalAmount = totalIncome + totalExpense; // Soma total movimentada
      textResult.summary.itemCount = textResult.transactions.length;
      
      console.log('[TEXT] Arquivo processado com sucesso!');
      console.log('[TEXT] Transações encontradas:', textResult.transactions.length);
      console.log('[TEXT] Total receitas: R$', totalIncome.toFixed(2));
      console.log('[TEXT] Total despesas: R$', totalExpense.toFixed(2));

      // Validação melhorada - evitar falsos positivos
      const hasOnlySmallValues = textResult.transactions.every((t: any) => Math.abs(t.amount || 0) < 1.0);
      const hasVeryFewTransactions = textResult.transactions.length <= 1;
      const totalValue = totalIncome + totalExpense;
      
      if (hasOnlySmallValues && hasVeryFewTransactions && totalValue < 5.0) {
        console.log('[TEXT] ⚠️ Resultado suspeito detectado');        return res.status(400).json({
          success: false,
          error: 'Arquivo não foi lido corretamente',
          details: 'O sistema não conseguiu extrair transações válidas.',
          suggestions: [
            '📸 TIRE UMA FOTO da tela do extrato e envie',
            '📋 COPIE o texto do extrato e cole no chat',
            '💾 SALVE como PDF e tente novamente'
          ],
          needsManualReview: true
        });
      }

      return res.status(200).json({
        success: true,
        data: textResult
      });

    } catch (parseError: any) {
      console.error('[TEXT] Erro ao parsear JSON:', parseError.message);
      console.error('[TEXT] Resposta que causou erro:', responseText.substring(0, 500));        return res.status(500).json({
        success: false,
        error: 'Arquivo não foi lido corretamente',
        details: 'Não foi possível processar este formato de arquivo.',
        suggestions: [
          '📸 TIRE UMA FOTO da tela do extrato e envie',
          '📋 COPIE o texto do extrato e cole no chat',
          '💾 SALVE como PDF e tente novamente'
        ],
        needsManualReview: true
      });
    }

  } catch (error: any) {
    console.error('[TEXT] Erro inesperado:', error);    return res.status(500).json({
      success: false,
      error: 'Erro ao processar arquivo',
      details: 'Formato de arquivo não suportado.',
      suggestions: [
        '📸 TIRE UMA FOTO da tela do extrato e envie',
        '📋 COPIE o texto do extrato e cole no chat'
      ],
      needsManualReview: true
    });
  }
}

export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  console.log('[OCR] 🚀 Iniciando processamento...', new Date().toISOString());
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }  try {
    const { imageBase64, fileName, fileType, csvData, textData, excelData } = req.body;
    
    console.log('[OCR] 📊 Dados recebidos:');
    console.log('[OCR] - Arquivo presente:', !!imageBase64);
    console.log('[OCR] - Nome:', fileName);
    console.log('[OCR] - Tipo:', fileType);
    console.log('[OCR] - Tamanho base64:', imageBase64?.length || 0);
    console.log('[OCR] - API Key válida:', !!GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIza'));
    console.log('[OCR] - Dados CSV:', !!csvData);    console.log('[OCR] - Dados Excel:', !!excelData);
    
    // Se for CSV, XLS, XLSM ou TXT, processar como texto
    if (fileType && (fileType.includes('csv') || fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('text'))) {
      console.log('[OCR] Processando arquivo de texto/planilha...');
      return await processTextFile(req, res, csvData || textData, fileType, excelData);
    }
    
    if (!imageBase64) {
      console.log('[OCR] Erro: Arquivo não fornecido');
      return res.status(400).json({ error: 'Arquivo não fornecido' });
    }

    let processedImageBase64 = imageBase64;// Detectar tipo de arquivo pelo cabeçalho base64
    let mimeType = "image/jpeg"; // padrão
    let modelToUse = "gemini-2.5-flash-preview-05-20"; // OTIMIZADO: Modelo mais rápido por padrão
    
    console.log('[OCR] Primeiros 20 chars do base64:', imageBase64.substring(0, 20));
    
    if (imageBase64.startsWith('/9j/') || imageBase64.startsWith('iVBOR') || imageBase64.startsWith('R0lGOD')) {
      // É uma imagem (JPEG, PNG, GIF)
      mimeType = imageBase64.startsWith('/9j/') ? "image/jpeg" : 
                 imageBase64.startsWith('iVBOR') ? "image/png" : "image/gif";
      console.log('[OCR] Detectado: Imagem', mimeType);    } else if (imageBase64.startsWith('JVBERi0') || imageBase64.startsWith('data:application/pdf')) {
      // É um PDF
      mimeType = "application/pdf";
      console.log('[OCR] Detectado: PDF');
      
      // OTIMIZAÇÃO ESPECÍFICA PARA PDF
      modelToUse = "gemini-2.5-flash"; // Modelo mais estável para PDFs
      console.log('[OCR] PDF detectado - usando modelo mais estável');
      
      // Não fazer detecção preventiva de PDF protegido
      // Deixar o Gemini tentar processar e tratar erro se necessário
      console.log('[OCR] PDF será processado normalmente pelo Gemini');
    }else {
      console.log('[OCR] Tipo de arquivo não reconhecido, assumindo imagem JPEG');
      console.log('[OCR] Base64 começa com:', imageBase64.substring(0, 10));
    }

    console.log('[OCR] Usando modelo:', modelToUse);
    console.log('[OCR] MIME type:', mimeType);

    console.log('[OCR] API Key presente:', !!GEMINI_API_KEY);
    if (!GEMINI_API_KEY) {
      console.log('[OCR] Erro: API Key não encontrada');
      return res.status(500).json({ error: 'API não configurada' });

    }    // Prompt generalizado para qualquer banco ou fatura
    const prompt = `
VOCÊ É UM ESPECIALISTA EM ANÁLISE DE DOCUMENTOS FINANCEIROS, ESPECIALIZADO EM EXTRATOS E FATURAS BRASILEIROS.

🏦 INSTRUÇÕES GERAIS PARA TODOS OS DOCUMENTOS BANCÁRIOS:

PROCURE ESPECIFICAMENTE POR:
1. 📍 LISTA DE TRANSAÇÕES com datas e valores
2. 📍 COMPRAS ou PAGAMENTOS com nome de estabelecimentos
3. 📍 TRANSFERÊNCIAS recebidas ou enviadas
4. 📍 DEPÓSITOS e SAQUES
5. 📍 OUTRAS MOVIMENTAÇÕES relevantes

ANALISE TODO O DOCUMENTO CUIDADOSAMENTE, PROCURANDO:
- Data da transação (DD/MM ou DD MMM)
- Nome do estabelecimento/descrição
- Valor em R$
- Sinal positivo/negativo ou indicadores C/D

EXEMPLOS DE TRANSAÇÕES VÁLIDAS EM DIVERSOS BANCOS:
✅ "15/12 MERCADO EXTRA R$ 127,89"
✅ "20/06 POSTO SHELL R$ 85,50"
✅ "NETFLIX.COM R$ 39,90"
✅ "UBER *TRIP R$ 23,45"
✅ "PIX ENVIADO PARA JOÃO R$ 50,00"
✅ "PIX RECEBIDO DE MARIA R$ 100,00"
✅ "TED RECEBIDA DE XYZ LTDA R$ 1500,00"
✅ "PAGAMENTO DE BOLETO R$ 299,50"

❌ NÃO INCLUIR:
- Totais de fatura ou extrato
- Valores mínimos para pagamento
- Pagamentos já efetuados (de faturas)
- Limite disponível/usado
- Cashback ou rendimentos já aplicados
- Itens puramente informativos

🔍 ESTRATÉGIA DE ANÁLISE:
1. EXAMINE TODA A PÁGINA, do topo à base, esquerda à direita
2. IDENTIFIQUE todas as seções de transações ou movimentações
3. IGNORE cabeçalhos, totais e informações da conta
4. FOQUE em transações comerciais reais

⚠️ ATENÇÃO ESPECIAL PARA DIFERENTES FORMATOS:
- LISTA TRADICIONAL: linha por linha com data + descrição + valor
- TABELAS: organizadas em colunas com valores alinhados
- BOLETOS: dados do pagador, beneficiário e valores principais
- FATURAS: seções separadas por tipos de compras
- LAYOUTS MODERNOS: blocos visuais de transações (apps digitais)

🏛️ RECONHECIMENTO DE BANCOS BRASILEIROS:

💜 NUBANK:
- Faturas com cores roxas características
- Seções de "COMPRAS PRESENCIAIS", "COMPRAS ONLINE", "ASSINATURAS"
- Listagem clara de estabelecimentos com data (DD/MM) e valor

🟢 BRADESCO:
- Formato típico: "Data | Histórico | Valor | Saldo"
- SAÍDAS: "SAQUE", "DÉBITO", "TRANSFERÊNCIA ENVIADA", "D" ou valores negativos
- ENTRADAS: "DEPÓSITO", "CRÉDITO", "TRANSFERÊNCIA RECEBIDA", "C" ou valores positivos

🔶 ITAÚ:
- Formato tabular com colunas bem definidas
- Lado direito mostra valores das transações
- Seções como "Lançamentos", "Compras", "Pagamentos"
- FATURA: procurar seções como "Lançamentos: compras e saques"

🔵 CAIXA:
- Formato em tabela com colunas para data, histórico, documento, valor
- SAÍDAS: valores negativos, código "D"
- ENTRADAS: valores positivos, código "C"

🟡 BANCO DO BRASIL:
- Layout em tabela com data, histórico, documento, valor
- Indicadores "D" para débito e "C" para crédito
- Frequentes códigos internos antes das descrições

PADRÕES ESPECÍFICOS POR TIPO DE DOCUMENTO:

📊 EXTRATOS BANCÁRIOS:
- Identifique claramente ENTRADAS vs SAÍDAS
- Para ENTRADAS (income): PIX recebido, transferência recebida, depósito, estorno
- Para SAÍDAS (expense): PIX enviado, compra, pagamento, transferência enviada

📄 FATURAS DE CARTÃO:
- Por padrão, todas transações são DESPESAS (expense)
- Exceção: "pagamento recebido", "crédito", "estorno" são ENTRADAS (income)
- Procurar data, estabelecimento e valor para cada compra
- Verificar possíveis parcelamentos (ex: "2/12")

REGRAS PARA CATEGORIZAÇÃO AUTOMÁTICA:
- MERCADO/SUPERMERCADO/EXTRA/CARREFOUR/PÃO DE AÇÚCAR → "Alimentação"
- POSTO/SHELL/PETROBRAS/IPIRANGA/BR → "Transporte"  
- FARMÁCIA/DROGARIA/RAIA/PACHECO → "Saúde"
- NETFLIX/SPOTIFY/AMAZON/CINEMA → "Entretenimento"
- UBER/99/CABIFY/METRÔ/PASSAGEM → "Transporte"
- IFOOD/RAPPI/ZOMATO/DELIVERY → "Alimentação"
- ZARA/RENNER/LOJAS/SHOPPING → "Cuidados Pessoais"
- HOSPITAL/LABORATÓRIO/CONSULTA → "Saúde"
- ESCOLA/FACULDADE/CURSO → "Educação"
- LUZ/ÁGUA/INTERNET/ALUGUEL → "Habitação"

VALIDAÇÃO CRÍTICA:
- Documentos bancários normalmente têm 3+ transações variadas
- Se encontrar menos de 3 transações, REEXAMINE o documento
- Valores típicos: R$ 15-500 por transação
- SEMPRE examine todo o documento completo, lado a lado

RETORNE APENAS JSON VÁLIDO no formato:

{
  "documentType": "fatura_cartao" ou "extrato_bancario" ou "extrato_pix",
  "confidence": 0.95,
  "summary": {
    "totalAmount": [soma de todas as transações],
    "totalIncome": [soma apenas das entradas],
    "totalExpense": [soma apenas das saídas],
    "establishment": "Nome do banco/instituição identificado",
    "period": "Período do documento se identificável"
  },
  "transactions": [
    {
      "description": "Nome do estabelecimento/descrição da transação",
      "amount": 150.50,
      "type": "expense" ou "income",
      "category": "categoria_apropriada",
      "date": "2024-06-15",
      "confidence": 0.9
    }
  ]
}`;

    console.log('[OCR] Preparando payload para Gemini...');

    const payload = {
      contents: [{
        parts: [          { text: prompt },          {
            inline_data: {
              mime_type: mimeType,
              data: processedImageBase64
            }
          }
        ]
      }],      generationConfig: {
        temperature: 0.1, // Muito baixo para precisão
        topK: mimeType === "application/pdf" ? 4 : 8,     // OTIMIZADO: Mais conservador para PDFs
        topP: mimeType === "application/pdf" ? 0.5 : 0.7,  // OTIMIZADO: Mais conservador para PDFs
        maxOutputTokens: mimeType === "application/pdf" ? 4096 : 6144, // OTIMIZADO: Menor para PDFs
      }
    };    console.log('[OCR] Chamando Gemini:', modelToUse);

    // Implementar retry para erros 503 (UNAVAILABLE)
    let retryCount = 0;
    const maxRetries = 2; // OTIMIZADO: Reduzido de 3 para 2 para acelerar
    let lastError = null;
    let ocrResult: any = null;
    let responseData: any = null;
    let processingComplete = false;

    while (retryCount <= maxRetries) {
      try {
        console.log(`[OCR] Tentativa ${retryCount + 1}/${maxRetries + 1}`);
        
        // TIMEOUT OTIMIZADO: 50 segundos por tentativa (aumentado para PDFs grandes)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('[OCR] ⏱️ Timeout de 50s atingido, cancelando requisição...');
          controller.abort();
        }, 50000);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);

        console.log('[OCR] Resposta Gemini - Status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[OCR] Erro Gemini:', errorText);
          
          // Parse do erro para obter detalhes
          let errorDetails = null;
          try {
            errorDetails = JSON.parse(errorText);
          } catch (e) {
            console.warn('[OCR] Não foi possível parsear erro como JSON');
          }
          
          // Verificar se é erro 503 (UNAVAILABLE) - tentar novamente
          if (response.status === 503 || 
              (errorDetails?.error?.status === 'UNAVAILABLE') ||
              (errorDetails?.error?.code === 503)) {
            
            lastError = new Error(`Gemini API temporariamente indisponível (503). Tentativa ${retryCount + 1}/${maxRetries + 1}`);
            console.log(`[OCR] Erro 503 detectado, aguardando antes da próxima tentativa...`);
            
            if (retryCount < maxRetries) {
              // Aguardar antes de tentar novamente (backoff exponencial)
              const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
              await new Promise(resolve => setTimeout(resolve, delay));
              retryCount++;
              continue;
            } else {
              // Último retry falhado
              throw new Error('API Gemini indisponível após múltiplas tentativas. Tente novamente em alguns minutos.');
            }
          }
          
          // Verificar se é erro "The document has no pages" - PDF protegido
      if (errorText.includes('The document has no pages')) {
        console.log('[OCR] PDF protegido detectado via erro "no pages"');
        return res.status(400).json({ 
          error: 'PDF protegido por senha detectado',
          needsPassword: false, // Não suportamos senha
          message: '🔒 Este PDF está protegido por senha e não pode ser processado.\n\n💡 **Solução:** Faça uma captura de tela (screenshot) do PDF aberto e envie a imagem.',
          isPdfProtected: true
        });
      }
      
      // Verificar outros tipos de erros relacionados a PDF
      const errorLower = errorText.toLowerCase();
      if (errorLower.includes('password') || errorLower.includes('encrypted') || 
          errorLower.includes('protected') || errorLower.includes('decrypt') ||
          errorLower.includes('permission') || errorLower.includes('secure')) {
        console.log('[OCR] PDF protegido por senha detectado via outras mensagens');
        return res.status(400).json({ 
          error: 'PDF protegido por senha',
          needsPassword: false, // Não suportamos mais
          message: '🔒 Este PDF está protegido por senha.\n\n💡 **Solução:** Faça um screenshot do PDF e envie a imagem.',
          isPdfProtected: true
        });
      }
      
      // Verificar se é erro de PDF corrompido ou inválido
      if (errorLower.includes('pdf') && (errorLower.includes('invalid') || errorLower.includes('corrupt'))) {
        return res.status(400).json({ 
          error: 'PDF inválido ou corrompido',
          message: 'O arquivo PDF fornecido está corrompido ou não é um PDF válido.'
        });
      }
          
          return res.status(500).json({ 
            error: 'Erro na API Gemini',
            details: errorText.substring(0, 500) // Limitar tamanho do erro
          });
        }

        // Se chegou até aqui, a requisição foi bem-sucedida
        responseData = await response.json() as any;
        console.log('[OCR] Resposta Gemini recebida com sucesso na tentativa', retryCount + 1);

        if (!responseData.candidates || responseData.candidates.length === 0) {
          console.error('[OCR] Nenhum candidato na resposta - usando fallback');
          // Ao invés de retornar erro 500, criar estrutura válida
          ocrResult = {
            documentType: "documento_não_identificado",
            confidence: 0.3,
            summary: {
              totalAmount: 0,
              totalIncome: 0,
              totalExpense: 0,
              establishment: "Documento não processado",
              period: "Não identificado",
              itemCount: 0
            },
            transactions: []
          };
          processingComplete = true;
          break;
        }

        const candidate = responseData.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
          console.error('[OCR] Estrutura de resposta inválida - usando fallback');
          // Ao invés de retornar erro 500, criar estrutura válida
          ocrResult = {
            documentType: "documento_não_identificado",
            confidence: 0.3,
            summary: {
              totalAmount: 0,
              totalIncome: 0,
              totalExpense: 0,
              establishment: "Documento não processado",
              period: "Não identificado",
              itemCount: 0
            },
            transactions: []
          };
          processingComplete = true;
          break;
        }

        const responseText = candidate.content.parts[0].text;
        console.log('[OCR] Texto da resposta (primeiros 200 chars):', responseText.substring(0, 200));


        // Parse do JSON com fallback robusto e logs
        try {
          // Log completo do texto recebido
          console.log('[OCR] Texto completo recebido:', responseText);
          // Regex para capturar o maior JSON possível
          const jsonRegex = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g;
          const jsonMatches = responseText.match(jsonRegex);
          if (jsonMatches && jsonMatches.length > 0) {
            // Tentar o match mais longo primeiro (provavelmente o JSON completo)
            const sortedMatches = jsonMatches.sort((a: string, b: string) => b.length - a.length);
            ocrResult = JSON.parse(sortedMatches[0]);
            console.log('[OCR] JSON extraído com regex avançado');
          } else {
            // Limpar possíveis marcadores de código (fallback)
            const cleanText = responseText
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .replace(/^[^{]*/, '')
              .replace(/[^}]*$/, '')
              .trim();
            ocrResult = JSON.parse(cleanText);
            console.log('[OCR] JSON extraído com fallback cleanText');
          }

          // Validar estrutura básica
          if (!ocrResult.transactions || !Array.isArray(ocrResult.transactions)) {
            console.warn('[OCR] Estrutura inválida: transactions não é array - criando estrutura padrão');
            ocrResult = {
              documentType: "extrato_bancario",
              confidence: 0.7,
              summary: {
                totalAmount: 0,
                totalIncome: 0,
                totalExpense: 0,
                establishment: "Não identificado",
                period: "Não identificado",
                itemCount: 0
              },
              transactions: []
            };
          }

          // Validar e corrigir campos obrigatórios
          ocrResult.transactions = ocrResult.transactions.map((transaction: any) => {
            if (!transaction.type || (transaction.type !== 'income' && transaction.type !== 'expense')) {
              transaction.type = 'expense';
            }
            if (typeof transaction.amount === 'string') {
              transaction.amount = parseFloat(transaction.amount.replace(/[R$\s,]/g, '').replace(',', '.')) || 0;
            }
            if (!transaction.confidence) {
              transaction.confidence = 0.8;
            }
            return transaction;
          });

          // Atualizar summary
          if (!ocrResult.summary) {
            ocrResult.summary = {};
          }
          const totalIncome = ocrResult.transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          const totalExpense = ocrResult.transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          ocrResult.summary.totalIncome = totalIncome;
          ocrResult.summary.totalExpense = totalExpense;
          ocrResult.summary.totalAmount = totalIncome + totalExpense;
          ocrResult.summary.itemCount = ocrResult.transactions.length;

          console.log('[OCR] JSON parseado com sucesso!');
          console.log('[OCR] Transações encontradas:', ocrResult.transactions.length);
          console.log('[OCR] Total receitas:', totalIncome);
          console.log('[OCR] Total despesas:', totalExpense);

          // VALIDAÇÃO DE QUALIDADE MAIS TOLERANTE
          const hasNoTransactions = ocrResult.transactions.length === 0;
          const hasOnlyMicroValues = ocrResult.transactions.every((t: any) => (t.amount || 0) < 0.1);
          const totalValue = totalIncome + totalExpense;
          if (hasNoTransactions || (hasOnlyMicroValues && totalValue < 1.0)) {
            console.log('[OCR] ⚠️ Documento sem transações válidas detectado');
            return res.status(400).json({
              success: false,
              error: 'Documento não foi lido corretamente',
              details: 'O sistema não conseguiu extrair transações válidas.',
              suggestions: [
                '📸 TIRE UMA FOTO clara do extrato ou fatura',
                '📋 COPIE o texto do documento e cole no chat',
                '💾 SALVE como PDF e tente novamente'
              ],
              needsManualReview: true
            });
          }

          // Se chegou até aqui, o processamento foi bem-sucedido
          processingComplete = true;
          break;

        } catch (parseError: any) {
          console.error('[OCR] Erro ao parsear JSON:', parseError.message);
          console.error('[OCR] Texto problemático:', responseText.substring(0, 300));

          // Fallback alternativo: tentar extrair valores monetários do texto
          const amountRegex = /R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+,\d{2}|\d+\.\d{2})/g;
          let amounts = [];
          let match;
          while ((match = amountRegex.exec(responseText)) !== null) {
            const amountStr = match[1].replace('.', '').replace(',', '.');
            amounts.push(parseFloat(amountStr));
          }
          if (amounts.length > 0) {
            ocrResult = {
              documentType: "extrato_recuperado",
              confidence: 0.6,
              summary: {
                totalAmount: amounts.reduce((sum, val) => sum + val, 0),
                totalIncome: 0,
                totalExpense: amounts.reduce((sum, val) => sum + val, 0),
                establishment: fileName?.includes('nubank') ? "Nubank" : "Documento financeiro",
                period: new Date().toISOString().substring(0, 7),
                itemCount: amounts.length
              },
              transactions: amounts.map((amount, idx) => ({
                description: `Transação ${idx + 1}`,
                amount: amount,
                type: "expense",
                category: "Outros",
                date: new Date().toISOString().substring(0, 10),
                confidence: 0.5
              }))
            };
            console.log('[OCR] ✅ Recuperadas', amounts.length, 'transações via método alternativo');
            processingComplete = true;
            break;
          }

          // Ao invés de falhar completamente, criar resultado vazio mas válido
          console.log('[OCR] Criando estrutura de fallback devido a erro de parsing');
          ocrResult = {
            documentType: "documento_não_processado",
            confidence: 0.5,
            summary: {
              totalAmount: 0,
              totalIncome: 0,
              totalExpense: 0,
              establishment: "Erro de processamento",
              period: "Não identificado",
              itemCount: 0
            },
            transactions: []
          };
          processingComplete = true;
          break;
        }

      } catch (requestError: any) {
        lastError = requestError;
        console.error(`[OCR] Erro na tentativa ${retryCount + 1}:`, requestError.message);
        
        // Verificar se é erro de timeout (AbortController)
        if (requestError.name === 'AbortError') {
          console.log(`[OCR] ⏱️ Timeout de 50s atingido na tentativa ${retryCount + 1}`);
          lastError = new Error(`Timeout: Requisição demorou mais que 50 segundos`);
        }
        
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          console.log(`[OCR] Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
          continue;
        } else {
          // Último retry falhado
          throw new Error(`Falha após ${maxRetries + 1} tentativas: ${requestError.message}`);
        }
      }
    }

    // VALIDAÇÃO CRÍTICA: Verificar se o processamento foi realmente bem-sucedido
    if (!processingComplete) {
      console.error('[OCR] ❌ Processamento falhou - não foi concluído');
      // Garantir que ocrResult exista mesmo em caso de falha
      ocrResult = {
        documentType: "documento_não_identificado",
        confidence: 0.3,
        summary: {
          totalAmount: 0,
          totalIncome: 0,
          totalExpense: 0,
          establishment: "Erro de processamento",
          period: "Não identificado",
          itemCount: 0
        },
        transactions: []
      };
      processingComplete = true; // Marcar como processado para continuar
    }

    // Garantir que ocrResult sempre exista
    if (!ocrResult) {
      console.error('[OCR] ❌ ocrResult ainda é null - criando estrutura de emergência');
      ocrResult = {
        documentType: "documento_não_processado",
        confidence: 0.1,
        summary: {
          totalAmount: 0,
          totalIncome: 0,
          totalExpense: 0,
          establishment: "Sistema não conseguiu processar",
          period: "Não identificado",
          itemCount: 0
        },
        transactions: []
      };
    }

    // Se saiu do loop, o processamento foi concluído (com ou sem dados)
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    console.log('[OCR] ✅ Processamento concluído!');
    console.log('[OCR] ⏱️ Tempo total:', processingTime, 'ms');
    console.log('[OCR] 📊 Transações encontradas:', ocrResult?.transactions?.length || 0);

    // Sempre retornar sucesso, mesmo que com dados vazios
    return res.status(200).json({
      success: true,
      data: ocrResult,
      metadata: {
        processedAt: new Date().toISOString(),
        tokensUsed: responseData?.usageMetadata?.totalTokenCount || 0,
        processingMode: 'gemini',
        retryCount: retryCount,
        processingTimeMs: processingTime,
        hadErrors: (ocrResult?.transactions?.length || 0) === 0,
        fallbackUsed: ocrResult?.confidence < 0.8
      }
    });

  } catch (error: any) {
    console.error('[OCR] Erro geral:', error.message);
    console.error('[OCR] Stack:', error.stack);
    
    // Ao invés de retornar erro 500, sempre retornar dados válidos
    const fallbackResult = {
      documentType: "documento_com_erro",
      confidence: 0.1,
      summary: {
        totalAmount: 0,
        totalIncome: 0,
        totalExpense: 0,
        establishment: "Erro no processamento",
        period: "Não identificado",
        itemCount: 0
      },
      transactions: []
    };
    
    return res.status(200).json({
      success: true,
      data: fallbackResult,
      metadata: {
        processedAt: new Date().toISOString(),
        tokensUsed: 0,
        processingMode: 'fallback',
        retryCount: 0,
        processingTimeMs: Date.now() - startTime,
        hadErrors: true,
        errorDetails: error.message,
        fallbackUsed: true
      }
    });
  }
}
