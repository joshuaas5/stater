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

export default async function handler(req: any, res: any) {
  console.log('[OCR] Iniciando processamento...');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  try {
    const { imageBase64, pdfPassword } = req.body;
    
    console.log('[OCR] Verificando imagem...');
    console.log('[OCR] Imagem recebida:', !!imageBase64);
    console.log('[OCR] Tamanho da imagem:', imageBase64?.length || 0);
    console.log('[OCR] Senha PDF fornecida:', !!pdfPassword);
    
    if (!imageBase64) {
      console.log('[OCR] Erro: Imagem não fornecida');
      return res.status(400).json({ error: 'Imagem não fornecida' });
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
- Faturas de cartão de crédito (apenas saídas/despesas)
- Extratos bancários (entradas E saídas)
- Extratos de conta corrente (entradas E saídas)
- Extratos de poupança (entradas E saídas)
- Relatórios de investimentos (entradas E saídas)
- Extratos de carteira digital/PIX (entradas E saídas)

REGRAS CRÍTICAS PARA IDENTIFICAR TIPO DE TRANSAÇÃO:

🔴 SAÍDAS/DESPESAS (type: "expense"):
- Compras em estabelecimentos
- Saques em dinheiro
- Transferências enviadas (PIX enviado, TED enviado, etc.)
- Pagamentos de contas/boletos
- Anuidades e taxas
- Débitos em geral
- Valores com sinais negativos (-)
- Valores em vermelho (se colorido)
- Descrições como: "Pagamento", "Débito", "Saque", "Transferência enviada"

🟢 ENTRADAS/RECEITAS (type: "income"):
- Depósitos recebidos
- Transferências recebidas (PIX recebido, TED recebido, etc.)
- Salários e pagamentos
- Rendimentos e juros
- Reembolsos e estornos
- Cashback e benefícios
- Valores com sinais positivos (+)
- Valores em verde (se colorido)
- Descrições como: "Depósito", "Crédito", "Transferência recebida", "Salário", "Rendimento"

REGRAS DE EXCLUSÃO:
- IGNORE saldos totais, saldos anteriores, saldos atuais
- IGNORE pagamentos mínimos, valores de fechamento
- IGNORE totalizadores e resumos
- IGNORE linhas de cabeçalho/rodapé
- IGNORE valores que claramente são resumos/somatórias

ANÁLISE CONTEXTUAL:
1. Primeiro identifique o TIPO de documento (fatura cartão, extrato banco, etc.)
2. Para extratos bancários: analise se há padrão de cores ou símbolos para diferenciar entrada/saída
3. Para faturas de cartão: praticamente tudo são despesas, exceto estornos/cashback
4. Analise descrições cuidadosamente para determinar direção da transação
5. Considere valor e contexto (ex: "PIX enviado" = saída, "PIX recebido" = entrada)

FORMATAÇÃO DE VALORES:
- Remova símbolos de moeda (R$, $, etc.)
- Use formato decimal com ponto (ex: 150.50, não 150,50)
- NÃO inclua separadores de milhares

CATEGORIZAÇÃO INTELIGENTE:
- "alimentacao": restaurantes, supermercados, delivery
- "transporte": uber, combustível, pedágios, transporte público
- "saude": farmácias, consultas, exames, planos de saúde
- "lazer": cinema, streaming, jogos, viagens
- "moradia": aluguel, condomínio, luz, água, gás
- "educacao": cursos, livros, material escolar
- "tecnologia": eletrônicos, software, internet
- "servicos": bancos, cartórios, seguros, manutenções
- "outros": quando não se encaixa nas categorias acima

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
        .replace(/^[^{]*/, '') // Remove texto antes do primeiro {
        .replace(/[^}]*$/, '') // Remove texto depois do último }
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
        }
      } catch (partialError) {
        console.log('[OCR] Fallback para estrutura simplificada');
        
        // Retornar dados de fallback mais informativos
        ocrResult = {
          documentType: "fatura_cartao",
          confidence: 0.6,
          shouldGroup: false,
          transactions: [
            {
              description: "⚠️ Documento processado parcialmente - Verifique manualmente",
              amount: 0.01,
              date: new Date().toISOString().split('T')[0],
              category: "outros",
              type: "expense",
              confidence: 0.6
            }
          ],
          summary: {
            totalAmount: 0.01,
            itemCount: 1,
            establishment: "Processamento Parcial"
          },
          warning: "O documento foi processado parcialmente devido à complexidade. Recomenda-se verificação manual."
        };
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
