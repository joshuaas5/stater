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
        error: 'Erro ao processar arquivo Excel',
        details: 'Não foi possível ler o arquivo Excel. Verifique se o arquivo não está corrompido.',
        suggestions: [
          'Tente salvar o arquivo como CSV no Excel',
          'Verifique se o arquivo não está protegido por senha',
          'Certifique-se de que o arquivo contém dados válidos'
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
  }
  const prompt = `
VOCÊ É UM ESPECIALISTA EM ANÁLISE DE DADOS FINANCEIROS BRASILEIROS.

ANALISE ESTE CONTEÚDO DE ARQUIVO FINANCEIRO e extraia TODAS as transações com MÁXIMA PRECISÃO:

FORMATO DO ARQUIVO: ${fileType}
CONTEÚDO:
${finalTextContent}

INSTRUÇÕES CRÍTICAS:

🗂️ ARQUIVOS CSV/EXCEL:
- Identifique automaticamente as colunas: Data, Descrição, Valor, Tipo
- IGNORE cabeçalhos, totais, saldos
- Para valores: use SEMPRE números positivos, determine tipo pela descrição
- Formatos aceitos: "1234.56" ou "1.234,56" ou "R$ 1.234,56"

📄 ARQUIVOS TXT:
- Procure padrões: DD/MM/AAAA seguido de DESCRIÇÃO e VALOR
- Valores podem estar com + (entrada) ou - (saída)
- Ignore linhas de "SALDO", "TOTAL", "ANTERIOR"
- PIX enviado = expense, PIX recebido = income

REGRAS ESPECÍFICAS PARA BANCOS BRASILEIROS:
- Banco do Brasil: + = income, - = expense
- Bradesco: DÉBITO = expense, CRÉDITO = income  
- Caixa: D = expense, C = income
- Nubank: "enviado" = expense, "recebido" = income
- Transferências: analise direção ("para" = expense, "de" = income)

VALIDAÇÃO RIGOROSA:
- NÃO extraia se encontrar apenas valores muito baixos (< R$ 1,00)
- Extratos típicos têm MÚLTIPLAS transações variadas
- Se encontrar poucos dados, retorne erro específico
- SEMPRE converta valores para número decimal positivo

FORMATO DE SAÍDA (JSON VÁLIDO):
{
  "documentType": "arquivo_texto",
  "confidence": 0.95,
  "summary": {
    "totalAmount": [SOMA TOTAL de income + expense],
    "totalIncome": [SOMA apenas income],
    "totalExpense": [SOMA apenas expense],
    "establishment": "Banco identificado",
    "period": "Período se detectado",
    "fileFormat": "${fileType}"
  },
  "transactions": [
    {
      "description": "Descrição da transação",
      "amount": 150.50,
      "type": "expense" ou "income",
      "category": "categoria_apropriada",
      "date": "2024-12-25",
      "confidence": 0.9
    }
  ]
}

CATEGORIAS DISPONÍVEIS:
- "alimentacao": supermercados, restaurantes, delivery
- "transporte": combustível, uber, pedágios
- "saude": farmácias, consultas, planos
- "lazer": entretenimento, viagens, streaming
- "moradia": aluguel, condomínio, utilidades
- "educacao": cursos, livros, material escolar
- "tecnologia": eletrônicos, software, internet
- "servicos": bancos, seguros, manutenções
- "outros": quando não se encaixa nas categorias

EXEMPLO DE RESPOSTA VÁLIDA:
{
  "documentType": "arquivo_texto",
  "confidence": 0.95,
  "summary": {
    "totalAmount": 4565.25,
    "totalIncome": 3500.00,
    "totalExpense": 1065.25,
    "establishment": "Banco do Brasil",
    "period": "Dezembro 2024",
    "fileFormat": "text/plain"
  },
  "transactions": [
    {
      "description": "Salário - Empresa ABC",
      "amount": 3500.00,
      "type": "income",
      "category": "outros",
      "date": "2024-12-07",
      "confidence": 0.95
    }
  ]
}

IMPORTANTE: 
- Retorne APENAS o JSON, sem texto adicional
- Use valores numéricos para amounts (não strings)
- Dates no formato YYYY-MM-DD
- Types apenas "income" ou "expense"
- Se não conseguir extrair nada válido, retorne array transactions vazio
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
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TEXT] Erro Gemini:', errorText);
      return res.status(500).json({ 
        error: 'Erro na análise do arquivo',
        details: errorText.substring(0, 500)
      });
    }    const data = await response.json() as any;
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('[TEXT] Resposta Gemini recebida, tamanho:', responseText.length);

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
        console.log('[TEXT] ⚠️ Resultado suspeito detectado');
        
        return res.status(400).json({
          success: false,
          error: 'Documento não foi processado corretamente',
          details: 'O sistema não conseguiu identificar transações válidas neste arquivo.',
          suggestions: [
            '📸 SOLUÇÃO RECOMENDADA: Tire screenshots (capturas de tela) das páginas',
            '🔗 Una as imagens em: https://products.aspose.app/words/pt/merger/jpg',
            '📋 ALTERNATIVA: Copie e cole o texto do extrato diretamente no chat',
            '💡 Para arquivos CSV/Excel: Verifique se as colunas estão bem definidas',
            '🔄 Tente converter para um formato mais padrão (PDF ou imagem)'          ],
          needsManualReview: true
        });
      }

      return res.status(200).json({
        success: true,
        data: textResult
      });

    } catch (parseError: any) {
      console.error('[TEXT] Erro ao parsear JSON:', parseError.message);
      console.error('[TEXT] Resposta que causou erro:', responseText.substring(0, 500));
      
      return res.status(500).json({
        success: false,
        error: 'Erro ao processar arquivo de texto',
        details: 'Não foi possível extrair as transações do arquivo fornecido.',
        suggestions: [
          '📸 SOLUÇÃO RECOMENDADA: Tire screenshots (capturas de tela) das páginas',
          '🔗 Una as imagens em: https://products.aspose.app/words/pt/merger/jpg',
          '📋 ALTERNATIVA: Copie e cole o texto do extrato diretamente no chat',
          '💡 Tente salvar o arquivo como PDF e enviar novamente'
        ],
        needsManualReview: true
      });
    }

  } catch (error: any) {
    console.error('[TEXT] Erro inesperado:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro inesperado ao processar arquivo',
      details: error.message,
      suggestions: [
        '📸 SOLUÇÃO RECOMENDADA: Tire screenshots (capturas de tela) das páginas',
        '🔗 Una as imagens em: https://products.aspose.app/words/pt/merger/jpg',
        '📋 ALTERNATIVA: Copie e cole o texto do extrato diretamente no chat'
      ],
      needsManualReview: true
    });
  }
}

export default async function handler(req: any, res: any) {
  console.log('[OCR] Iniciando processamento...');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }  try {
    const { imageBase64, fileName, fileType, csvData, textData, excelData } = req.body;
    
    console.log('[OCR] Verificando dados recebidos...');
    console.log('[OCR] Imagem/arquivo presente:', !!imageBase64);
    console.log('[OCR] Nome do arquivo:', fileName);
    console.log('[OCR] Tipo do arquivo:', fileType);
    console.log('[OCR] Dados CSV:', !!csvData);    console.log('[OCR] Dados Excel:', !!excelData);
    
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
    let modelToUse = "gemini-2.0-flash-exp"; // usar sempre o mesmo modelo que funciona
    
    console.log('[OCR] Primeiros 20 chars do base64:', imageBase64.substring(0, 20));
    
    if (imageBase64.startsWith('/9j/') || imageBase64.startsWith('iVBOR') || imageBase64.startsWith('R0lGOD')) {
      // É uma imagem (JPEG, PNG, GIF)
      mimeType = imageBase64.startsWith('/9j/') ? "image/jpeg" : 
                 imageBase64.startsWith('iVBOR') ? "image/png" : "image/gif";
      console.log('[OCR] Detectado: Imagem', mimeType);    } else if (imageBase64.startsWith('JVBERi0') || imageBase64.startsWith('data:application/pdf')) {
      // É um PDF
      mimeType = "application/pdf";
      console.log('[OCR] Detectado: PDF');
      
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
    }    // Prompt especializado para documentos financeiros avançados
    const prompt = `
VOCÊ É UM ESPECIALISTA EM ANÁLISE DE DOCUMENTOS FINANCEIROS COMPLEXOS.

ANALISE ESTE DOCUMENTO e extraia TODAS as transações com MÁXIMA PRECISÃO, identificando corretamente ENTRADAS e SAÍDAS.

TIPOS DE DOCUMENTOS SUPORTADOS:
- Faturas de cartão de crédito (APENAS saídas/despesas - NÃO incluir pagamentos da fatura)
- Extratos bancários (entradas E saídas)
- Extratos de conta corrente (entradas E saídas)
- Extratos de poupança (entradas E saídas)
- Relatórios de investimentos (entradas E saídas)
- Extratos de carteira digital/PIX (entradas E saídas)

REGRAS CRÍTICAS PARA FATURAS DE CARTÃO:
❌ NÃO INCLUIR como transações:
- Pagamentos da fatura (ex: "Pagamento recebido", "Débito em conta")
- Valores totais da fatura
- Saldo anterior, saldo atual
- Limite de crédito
- Valor mínimo

✅ INCLUIR APENAS:
- Compras em estabelecimentos
- Saques no cartão
- Anuidades e taxas do cartão
- IOF e juros
- Estornos (como receita/entrada)

REGRAS CRÍTICAS PARA EXTRATOS BANCÁRIOS:
🔴 SAÍDAS/DESPESAS (type: "expense"):
- Compras com débito/crédito
- Saques em dinheiro
- PIX/TED/transferências ENVIADAS
- Pagamentos de contas/boletos
- Taxas bancárias
- Débitos automáticos
- Valores com (-) ou em vermelho

🟢 ENTRADAS/RECEITAS (type: "income"):
- Depósitos
- PIX/TED/transferências RECEBIDAS
- Salários
- Rendimentos
- Estornos
- Valores com (+) ou em verde

ANÁLISE CONTEXTUAL AVANÇADA:
1. Para NUBANK e bancos digitais: 
   - Observe padrões de cores (verde=entrada, vermelho=saída)
   - Procure por ícones de direção (setas, símbolos)
   - Analise descrições como "Pix enviado", "Pix recebido", "Transferência"
   - IGNORE rendimentos do Nubank (geralmente centavos)
2. Para extratos tradicionais: analise códigos de operação
3. Valores pequenos podem ser taxas ou rendimentos - analise o contexto
4. Se encontrar apenas valores muito baixos (ex: R$ 0,01), PROCURE MAIS TRANSAÇÕES
5. Para FATURAS DE CARTÃO: NÃO inclua o pagamento da fatura como despesa

VALIDAÇÃO DE QUALIDADE:
- Extratos típicos têm MÚLTIPLAS transações com valores VARIADOS
- Se identificar apenas 1-2 transações pequenas, REANALISE o documento
- Para Nubank: procure por seções como "Gastos", "Transferências", "Pagamentos"
- Valores comuns: compras (R$ 20-500), transferências (R$ 50-2000), salários (R$ 1000+)

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
- SAÍDAS: "DÉBITO", "SAQUE", "TEV ELETRÔNICA ENVIADA"
- ENTRADAS: "CRÉDITO", "DEPÓSITO", "TEV ELETRÔNICA RECEBIDA"
- Ignore: "SALDO ANTERIOR", taxas já debitadas em outras linhas

PADRÕES ESPECÍFICOS NUBANK:
- "Pix enviado para": SAÍDA/expense
- "Pix recebido de": ENTRADA/income  
- "Transferência enviada": SAÍDA/expense
- "Transferência recebida": ENTRADA/income
- "Pagamento no débito": SAÍDA/expense
- "Compra no cartão": SAÍDA/expense
- Rendimentos da conta: geralmente MUITO BAIXOS (ignore se < R$ 1,00)

VALIDAÇÃO ESPECÍFICA PARA EXTRATOS BRASILEIROS:
- Extratos bancários BR têm MÚLTIPLAS transações diárias
- Valores típicos: compras R$ 10-500, transferências R$ 50-5000, salários R$ 1000+
- Se encontrar apenas 1 transação baixa (ex: R$ 0,01), PROCURE MAIS no documento
- Bancos digitais (Nubank, Inter, C6) têm layout diferente de bancos tradicionais
- PIX é muito comum: analise direção ("para" = saída, "de" = entrada)

RETORNE APENAS JSON VÁLIDO no formato:

{
  "documentType": "extrato_bancario" ou "fatura_cartao" ou "extrato_pix" ou "relatorio_investimento",
  "confidence": 0.95,
  "summary": {
    "totalAmount": [soma de todas as transações],
    "totalIncome": [soma apenas das entradas],
    "totalExpense": [soma apenas das saídas],
    "establishment": "Nome da instituição/banco",
    "period": "Período do documento se identificável"
  },
  "transactions": [
    {
      "description": "Descrição exata da transação",
      "amount": 150.50,
      "type": "expense" ou "income",
      "category": "categoria_apropriada",
      "date": "2024-12-25",
      "confidence": 0.9
    }
  ]
}

IMPORTANTE: 
- Seja MUITO criterioso para identificar corretamente entrada vs saída
- Em caso de dúvida sobre o tipo, analise o contexto e descrição
- Para documentos complexos, priorize precisão sobre quantidade
- NÃO invente transações que não existem claramente no documento
`;

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
        topK: 16,         // Reduzido para foco
        topP: 0.8,        // Mais determinístico
        maxOutputTokens: 8192, // Dobrado para faturas grandes
      }
    };    console.log('[OCR] Chamando Gemini:', modelToUse);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    console.log('[OCR] Resposta Gemini - Status:', response.status);    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OCR] Erro Gemini:', errorText);
      
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

    const data = await response.json() as any;
    console.log('[OCR] Resposta Gemini recebida');

    if (!data.candidates || data.candidates.length === 0) {
      console.error('[OCR] Nenhum candidato na resposta');
      return res.status(500).json({ error: 'Nenhuma resposta da IA' });
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('[OCR] Estrutura de resposta inválida');
      return res.status(500).json({ error: 'Resposta inválida da IA' });
    }

    const responseText = candidate.content.parts[0].text;
    console.log('[OCR] Texto da resposta (primeiros 200 chars):', responseText.substring(0, 200));

    // Parse do JSON
    let ocrResult;
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
        throw new Error('Estrutura inválida: transactions não é array');
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
      
      // VALIDAÇÃO DE QUALIDADE DOS RESULTADOS
      const hasOnlySmallValues = ocrResult.transactions.every((t: any) => (t.amount || 0) < 1.0);
      const hasVeryFewTransactions = ocrResult.transactions.length <= 2;
      const totalValue = totalIncome + totalExpense;
        if (hasOnlySmallValues && hasVeryFewTransactions && totalValue < 5.0) {
        console.log('[OCR] ⚠️ Resultado suspeito: valores muito baixos ou poucas transações');
        
        return res.status(400).json({
          success: false,
          error: 'Documento não foi processado corretamente',
          details: 'O sistema identificou apenas transações de valores muito baixos ou não conseguiu ler o documento corretamente.',
          suggestions: [
            '📸 SOLUÇÃO RECOMENDADA: Tire screenshots (capturas de tela) de cada página do extrato',
            '🔗 Una as imagens em: https://products.aspose.app/words/pt/merger/jpg',
            '📋 ALTERNATIVA 1: Copie e cole o texto do extrato diretamente no chat',
            '📄 ALTERNATIVA 2: Salve como PDF e envie novamente',
            '🔍 Para extratos grandes: Divida em seções menores',
            '💡 Dica: Imagens (JPG/PNG) são processadas mais rapidamente que PDFs'
          ],
          needsManualReview: true
        });
      }
        } catch (parseError: any) {
      console.error('[OCR] Erro ao parsear JSON:', parseError.message);
      console.error('[OCR] Texto problemático:', responseText);
      
      // Para faturas grandes, tentar extrair JSON parcial
      try {
        const jsonMatches = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatches) {
          const partialJson = jsonMatches[0];
          ocrResult = JSON.parse(partialJson);
          console.log('[OCR] JSON parcial extraído com sucesso');
        } else {
          throw new Error('Nenhum JSON encontrado');
        }      } catch (partialError) {
        console.log('[OCR] Falha ao extrair JSON da resposta');
        
        return res.status(400).json({
          success: false,
          error: 'Documento não foi processado corretamente',
          details: 'O sistema não conseguiu interpretar o conteúdo do documento. O arquivo pode estar corrompido, protegido ou em formato incompatível.',
          suggestions: [
            '📸 SOLUÇÃO RECOMENDADA: Tire screenshots (capturas de tela) de cada página',
            '🔗 Una as imagens em: https://products.aspose.app/words/pt/merger/jpg',
            '📋 ALTERNATIVA 1: Copie e cole o texto do extrato diretamente no chat',
            '📄 ALTERNATIVA 2: Converta para formato de imagem (JPG/PNG)',
            '🔄 ALTERNATIVA 3: Tente um arquivo menor ou dividido em partes',
            '💡 Para PDFs protegidos: Abra o arquivo e faça screenshot de cada página'
          ],
          needsManualReview: true
        });
      }
      
      console.log('[OCR] Usando dados de fallback ou parciais');
    }

    console.log('[OCR] Processamento concluído com sucesso!');

    return res.status(200).json({
      success: true,
      data: ocrResult,
      metadata: {
        processedAt: new Date().toISOString(),
        tokensUsed: data.usageMetadata?.totalTokenCount || 0,
        processingMode: ocrResult.description?.includes('extraída') ? 'fallback' : 'gemini'
      }
    });

  } catch (error: any) {
    console.error('[OCR] Erro geral:', error.message);
    console.error('[OCR] Stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
