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
    }    // Prompt especializado para documentos financeiros com foco em NUBANK
    const prompt = `
VOCÊ É UM ESPECIALISTA EM ANÁLISE DE DOCUMENTOS FINANCEIROS, ESPECIALIZADO EM FATURAS NUBANK.

🟣 INSTRUÇÕES ESPECÍFICAS PARA FATURAS NUBANK:

PROCURE ESPECIFICAMENTE POR:
1. 📍 SEÇÃO "COMPRAS PRESENCIAIS" ou "Compras em estabelecimentos"
2. 📍 SEÇÃO "COMPRAS ONLINE" ou "Compras na internet"  
3. 📍 SEÇÃO "ASSINATURAS" ou "Assinaturas e recorrentes"
4. 📍 SEÇÃO "SAQUES" ou "Saques no cartão"
5. 📍 SEÇÃO "OUTRAS TRANSAÇÕES" ou transações diversas
6. 📍 LISTA DE ESTABELECIMENTOS com datas e valores

FORMATO TÍPICO NUBANK:
- Data (DD/MM ou DD MMM)
- Nome do estabelecimento
- Valor em R$ (sempre positivo na fatura)
- Possível parcelamento (ex: "2/3", "1/6")

EXEMPLOS DE TRANSAÇÕES VÁLIDAS NUBANK:
✅ "15/12 MERCADO EXTRA R$ 127,89"
✅ "20 DEZ POSTO SHELL R$ 85,50"
✅ "NETFLIX.COM R$ 39,90"
✅ "UBER *TRIP R$ 23,45"
✅ "AMAZON PRIME R$ 14,90"
✅ "FARMACIA RAIA R$ 67,23"
✅ "IFOOD *HAMBURGUER R$ 45,80"
✅ "SPOTIFY R$ 21,90"

❌ NÃO INCLUIR:
- "Total da fatura"
- "Valor mínimo"
- "Pagamento recebido"
- "Limite disponível"
- Cashback já aplicado
- Rendimentos baixos (centavos)

🔍 ESTRATÉGIA DE ANÁLISE NUBANK:
1. EXAMINE TODA A PÁGINA - O Nubank pode ter múltiplas seções
2. PROCURE por listas com DATAS + ESTABELECIMENTOS + VALORES
3. IGNORE cabeçalhos, totais, limites e informações da conta
4. FOQUE em transações comerciais reais
5. Se não encontrar nada, EXAMINE NOVAMENTE toda a imagem

OUTROS TIPOS DE DOCUMENTOS:
- Extratos bancários (entradas E saídas)
- Extratos de conta corrente (entradas E saídas)  
- Extratos de poupança (entradas E saídas)
- Relatórios de investimentos (entradas E saídas)
- Extratos de carteira digital/PIX (entradas E saídas)
- LISTAS MANUSCRITAS: fotos de papel com gastos escritos à mão

REGRAS GERAIS:
🔴 SAÍDAS/DESPESAS (type: "expense"):
- Compras em estabelecimentos (FATURA DE CARTÃO)
- Saques em dinheiro
- PIX/TED/transferências ENVIADAS (EXTRATO)
- Pagamentos de contas/boletos
- Taxas bancárias

🟢 ENTRADAS/RECEITAS (type: "income"):
- PIX/TED/transferências RECEBIDAS
- Salários e depósitos
- Rendimentos
- Estornos

VALIDAÇÃO CRÍTICA:
- Faturas Nubank normalmente têm 5-20+ transações
- Se encontrar menos de 3 transações, REEXAMINE o documento
- Valores típicos: R$ 15-500 por transação
- SEMPRE examine toda a página/documento completo

PADRÕES ESPECÍFICOS POR BANCO BRASILEIRO:

🏛️ BANCO DO BRASIL:
- Formato típico: "DATA | DESCRIÇÃO | VALOR | SALDO"
- Códigos de operação: "TED", "PIX", "DÉBITO AUTOMÁTICO"
- SAÍDAS: valores com (-) ou "D" ao lado
- ENTRADAS: valores com (+) ou "C" ao lado
- Ignore: "SALDO ANTERIOR", "SALDO ATUAL"

🏦 BRADESCO:
- Formato típico: "Data | Histórico | Valor | Saldo"
- SAÍDAS: "SAQUE", "DÉBITO", "TRANSFERÊNCIA ENVIADA"
- ENTRADAS: "DEPÓSITO", "CRÉDITO", "TRANSFERÊNCIA RECEBIDA"
- Ignore: linhas de saldo, limites, anuidades já pagas

🏢 CAIXA ECONÔMICA:
- Formato típico: "DATA | HISTÓRICO | DOCUMENTO | VALOR | SALDO"
- Códigos específicos: "DÉBITO CONTA", "CRÉDITO CONTA"
- SAÍDAS: valores negativos ou com código "D"
- ENTRADAS: valores positivos ou com código "C"
- Ignore: "SALDO DO DIA", rendimentos baixos da poupança

💜 NUBANK:
- Visual moderno com cores
- Verde = ENTRADA (Pix recebido, transferência recebida)
- Vermelho = SAÍDA (Pix enviado, compras, transferências enviadas)
- Descrições claras: "Compra aprovada", "Pix para João"
- Ignore: rendimentos baixos (centavos), cashback já aplicado

🏦 ITAÚ:
- Formato: "Data | Lançamento | Valor | Saldo"
- SAÍDAS: "DÉBITO", "SAQUE", "TEV ELETRÔNICA ENVIADA", "PAC ELETRÔNICO"
- ENTRADAS: "CRÉDITO", "DEPÓSITO", "TEV ELETRÔNICA RECEBIDA"
- Ignore: "SALDO ANTERIOR", taxas já debitadas em outras linhas

🔴 FATURA ITAÚ - REGRAS ESPECIAIS:
EXAMINE TODA A PÁGINA, ESPECIALMENTE O LADO DIREITO que pode conter:
- "Lançamentos: compras e saques" (seção principal de transações)
- "Compras parceladas - próximas faturas" (compras futuras, IGNORE)
- "Lançamentos no cartão" com DATA, ESTABELECIMENTO e VALOR
- Valores na coluna da direita são os valores das transações
- Procure por seções como "Limite de crédito", "Compras presenciais", "Compras com Contactless"
- SEMPRE examine ambos os lados da página - esquerda E direita
- FOQUE na seção "LANÇAMENTOS" que contém as transações reais

PADRÕES ESPECÍFICOS FATURA ITAÚ:
- Data formato DD/MM 
- Estabelecimentos comerciais (MERCADO, FARMÁCIA, POSTO, etc.)
- Valores sempre como DESPESAS (type: "expense")
- Ignore: pagamentos da fatura, limites, saldos anteriores
- Categorize por tipo de estabelecimento

RETORNE APENAS JSON VÁLIDO no formato:

{
  "documentType": "fatura_nubank" ou "extrato_bancario" ou "fatura_cartao" ou "extrato_pix" ou "relatorio_investimento",
  "confidence": 0.95,
  "summary": {
    "totalAmount": [soma de todas as transações],
    "totalIncome": [soma apenas das entradas],
    "totalExpense": [soma apenas das saídas],
    "establishment": "Nubank" ou "Nome da instituição/banco",
    "period": "Período do documento se identificável"
  },
  "transactions": [
    {
      "description": "Nome do estabelecimento exato da fatura",
      "amount": 150.50,
      "type": "expense" ou "income",
      "category": "categoria_apropriada",
      "date": "2024-12-25",
      "confidence": 0.9
    }
  ]
}

CATEGORIZAÇÃO AUTOMÁTICA PARA NUBANK:
- MERCADO/SUPERMERCADO/EXTRA/CARREFOUR → "Alimentação"
- POSTO/SHELL/PETROBRAS/IPIRANGA → "Transporte"  
- FARMÁCIA/DROGARIA/RAIA/PACHECO → "Saúde"
- NETFLIX/SPOTIFY/AMAZON PRIME → "Entretenimento"
- UBER/99/CABIFY → "Transporte"
- IFOOD/RAPPI/DELIVERY → "Alimentação"
- ZARA/RENNER/LOJAS → "Cuidados Pessoais"
- SHOPPING/MAGAZINE → "Outros"

INSTRUÇÕES FINAIS:
- Seja MUITO criterioso para identificar corretamente entrada vs saída
- Para FATURAS: todas as transações são despesas (type: "expense")
- Para EXTRATOS: analise contexto para determinar entrada/saída
- NÃO invente transações que não existem claramente no documento
- Se não encontrar transações válidas, retorne transactions: []
- SEMPRE examine toda a imagem antes de concluir`;

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

        // Parse do JSON
        try {
          // Limpar possíveis marcadores de código
          const cleanText = responseText
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .replace(/^[^{]*/, '') // Removes leading text until first {
            .replace(/[^}]*$/, '') // Removes trailing text after last }
            .trim();
          
          console.log('[OCR] Texto limpo para parse:', cleanText.substring(0, 100));
          ocrResult = JSON.parse(cleanText);

          // Validar estrutura básica
          if (!ocrResult.transactions || !Array.isArray(ocrResult.transactions)) {
            console.warn('[OCR] Estrutura inválida: transactions não é array - criando estrutura padrão');
            // Ao invés de falhar, criar estrutura básica
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
            // Garantir que o tipo seja válido
            if (!transaction.type || (transaction.type !== 'income' && transaction.type !== 'expense')) {
              // Se não especificado, assumir despesa como padrão para compatibilidade
              transaction.type = 'expense';
            }
            
            // Garantir que o amount seja numérico
            if (typeof transaction.amount === 'string') {
              transaction.amount = parseFloat(transaction.amount.replace(/[R$\s,]/g, '').replace(',', '.')) || 0;
            }
            
            // Garantir confidence padrão
            if (!transaction.confidence) {
              transaction.confidence = 0.8;
            }
            
            return transaction;
          });
          
          // Atualizar summary com informações de entrada/saída
          if (!ocrResult.summary) {
            ocrResult.summary = {};
          }
          
          const totalIncome = ocrResult.transactions
            .filter((t: any) => t.type === 'income')
            .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
            
          const totalExpense = ocrResult.transactions
            .filter((t: any) => t.type === 'expense')
            .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          
          ocrResult.summary.totalIncome = totalIncome;
          ocrResult.summary.totalExpense = totalExpense;
          ocrResult.summary.totalAmount = totalIncome + totalExpense;
          ocrResult.summary.itemCount = ocrResult.transactions.length;

          console.log('[OCR] JSON parseado com sucesso!');
          console.log('[OCR] Transações encontradas:', ocrResult.transactions.length);
          console.log('[OCR] Total receitas:', totalIncome);
          console.log('[OCR] Total despesas:', totalExpense);
          
          // VALIDAÇÃO DE QUALIDADE DOS RESULTADOS - AJUSTADA PARA NUBANK
          const hasOnlySmallValues = ocrResult.transactions.every((t: any) => (t.amount || 0) < 1.0);
          const hasVeryFewTransactions = ocrResult.transactions.length <= 1; // Reduzido para ser mais tolerante
          const totalValue = totalIncome + totalExpense;

          // Para faturas Nubank, ser mais criterioso na validação
          const isNubankDocument = ocrResult.documentType?.includes('nubank') || 
                                   ocrResult.summary?.establishment?.toLowerCase().includes('nubank');

          if (hasOnlySmallValues && hasVeryFewTransactions && totalValue < 5.0) {
            console.log('[OCR] ⚠️ Resultado suspeito: valores muito baixos ou poucas transações');
            console.log('[OCR] É documento Nubank?', isNubankDocument);
            console.log('[OCR] Total de transações:', ocrResult.transactions.length);
            console.log('[OCR] Valor total:', totalValue);
            
            // Para Nubank, dar uma segunda chance com feedback específico
            if (isNubankDocument || ocrResult.transactions.length === 0) {
              return res.status(400).json({
                success: false,
                error: 'Fatura Nubank não foi lida corretamente',
                details: 'O sistema não conseguiu encontrar as transações na fatura do Nubank.',
                suggestions: [
                  '🟣 CERTIFIQUE-SE de que a fatura está completa e legível',
                  '📸 TIRE UMA FOTO clara da seção "COMPRAS" da fatura',
                  '✅ VERIFIQUE se há transações visíveis na tela antes de fotografar',
                  '📋 COPIE o texto da fatura e cole no chat como alternativa'
                ],
                needsManualReview: true,
                isNubankSpecific: true
              });
            }
            
            return res.status(400).json({
              success: false,
              error: 'Documento não foi lido corretamente',
              details: 'O sistema não conseguiu extrair as transações do documento.',
              suggestions: [
                '✅ OPÇÃO 1: Tire uma FOTO clara do extrato com seu celular',
                '✅ OPÇÃO 2: Copie o texto do extrato e cole no chat',
                '✅ OPÇÃO 3: Divida em páginas menores e envie uma por vez'
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
          
          // Para faturas grandes, tentar extrair JSON parcial como último recurso
          try {
            const jsonMatches = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatches) {
              const partialJson = jsonMatches[0];
              const partialResult = JSON.parse(partialJson);
              if (partialResult.transactions && Array.isArray(partialResult.transactions)) {
                ocrResult = partialResult;
                console.log('[OCR] JSON parcial extraído com sucesso');
              }
            }
          } catch (partialError) {
            console.log('[OCR] Fallback para JSON parcial também falhou, usando estrutura vazia');
          }
          
          processingComplete = true; // Marcar como completo mesmo com erro
          break; // Sair do loop
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
