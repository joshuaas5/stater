// API OCR funcional com Gemini 2.5 Flash Vision
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDTTPO0otruHVzh7bXsi7MCyG674P03758";

const DOCUMENT_ANALYSIS_PROMPT = `
Analise este documento financeiro brasileiro e extraia TODAS as transações/itens visíveis com máxima precisão.

INSTRUÇÕES ESPECÍFICAS:
1. Identifique o tipo de documento:
   - "extrato": Extrato bancário ou cartão
   - "nota_fiscal": Nota fiscal de compra (mercado, loja, etc.)
   - "recibo": Recibo simples
   - "conta_servico": Conta de luz, água, internet, etc.
   - "outros": Se não conseguir identificar

2. Para CADA transação/item encontrado, extraia:
   - Descrição completa e clara
   - Valor em R$ (apenas números, sem símbolos)
   - Data (formato YYYY-MM-DD, se disponível)
   - Categoria mais apropriada
   - Tipo: "income" (receita) ou "expense" (despesa)

3. REGRAS DE AGRUPAMENTO:
   - NOTA FISCAL DE MERCADO/SUPERMERCADO: AGRUPE todos os itens em UMA única transação
   - EXTRATO BANCÁRIO: Liste cada transação separadamente
   - CONTA DE SERVIÇO: Uma única transação
   - RECIBO: Uma única transação

4. CATEGORIAS DISPONÍVEIS:
   alimentacao, transporte, saude, educacao, lazer, casa, tecnologia, roupas, servicos, outros

5. CONFIANÇA:
   - 0.9-1.0: Dados muito claros
   - 0.7-0.9: Dados legíveis mas com alguma incerteza
   - 0.5-0.7: Dados parcialmente legíveis
   - <0.5: Dados difíceis de ler

FORMATO DE RESPOSTA - RETORNE APENAS O JSON:
{
  "documentType": "tipo_identificado",
  "confidence": 0.95,
  "shouldGroup": true/false,
  "transactions": [
    {
      "description": "Descrição detalhada do item/transação",
      "amount": 150.50,
      "date": "2024-12-06",
      "category": "alimentacao",
      "type": "expense",
      "confidence": 0.92
    }
  ],
  "summary": {
    "totalAmount": 150.50,
    "itemCount": 1,
    "establishment": "Nome do estabelecimento (se identificável)"
  }
}

IMPORTANTE: 
- Retorne APENAS o JSON, sem texto adicional
- Se não conseguir ler, retorne confidence baixo mas tente extrair o que conseguir
- Para notas fiscais, some TODOS os valores dos itens no totalAmount
- Seja preciso com os valores numéricos
`;

export default async function handler(req: any, res: any) {
  console.log('[GEMINI_VISION_WORKING] Iniciando processamento...');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { imageBase64 } = req.body;
    
    console.log('[GEMINI_VISION_WORKING] Imagem recebida:', !!imageBase64);
    console.log('[GEMINI_VISION_WORKING] Tamanho da imagem:', imageBase64?.length || 0);
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Imagem não fornecida' });
    }

    if (!GEMINI_API_KEY) {
      console.error('[GEMINI_VISION_WORKING] API Key não encontrada');
      return res.status(500).json({ error: 'Gemini API não configurada' });
    }

    console.log('[GEMINI_VISION_WORKING] Preparando chamada para Gemini 2.5 Flash...');

    // Detectar tipo MIME da imagem
    let mimeType = "image/jpeg";
    if (imageBase64.startsWith('/9j/')) {
      mimeType = "image/jpeg";
    } else if (imageBase64.startsWith('iVBORw0KGgo')) {
      mimeType = "image/png";
    } else if (imageBase64.startsWith('R0lGODlh')) {
      mimeType = "image/gif";
    }
    
    console.log('[GEMINI_VISION_WORKING] Tipo MIME detectado:', mimeType);

    const payload = {
      contents: [{
        parts: [
          { text: DOCUMENT_ANALYSIS_PROMPT },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1, // Mais determinístico para extração de dados
        topK: 32,
        topP: 1,
        maxOutputTokens: 8192,
      }
    };

    console.log('[GEMINI_VISION_WORKING] Enviando para Gemini API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    console.log('[GEMINI_VISION_WORKING] Status resposta Gemini:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GEMINI_VISION_WORKING] Erro Gemini:', errorText);
      return res.status(500).json({ 
        error: 'Falha na análise do documento',
        details: errorText 
      });
    }

    const data = await response.json() as any;
    console.log('[GEMINI_VISION_WORKING] Resposta recebida da Gemini API');

    // Verificar se há conteúdo na resposta
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('[GEMINI_VISION_WORKING] Resposta inválida:', data);
      return res.status(500).json({ error: 'Resposta inválida da IA' });
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('[GEMINI_VISION_WORKING] Texto extraído (primeiros 300 chars):', responseText.substring(0, 300));

    // Parse do JSON retornado pela IA
    let analysisResult;
    try {
      // Limpar possíveis marcadores de código
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      analysisResult = JSON.parse(cleanedText);
      console.log('[GEMINI_VISION_WORKING] JSON parseado com sucesso');
    } catch (parseError) {
      console.error('[GEMINI_VISION_WORKING] Erro ao parsear JSON:', parseError);
      console.error('[GEMINI_VISION_WORKING] Texto problemático:', responseText);
      return res.status(500).json({ 
        error: 'Falha ao interpretar resultado da análise',
        rawResponse: responseText
      });
    }

    // Validar estrutura do resultado
    if (!analysisResult.transactions || !Array.isArray(analysisResult.transactions)) {
      console.error('[GEMINI_VISION_WORKING] Estrutura inválida:', analysisResult);
      return res.status(500).json({ error: 'Estrutura de dados inválida' });
    }

    // Log de sucesso
    console.log(`[GEMINI_VISION_WORKING] Sucesso! ${analysisResult.transactions.length} transações extraídas`);
    console.log(`[GEMINI_VISION_WORKING] Tipo: ${analysisResult.documentType}, Confiança: ${analysisResult.confidence}`);

    // Retornar resultado estruturado
    return res.status(200).json({
      success: true,
      data: analysisResult,
      metadata: {
        processedAt: new Date().toISOString(),
        tokensUsed: data.usageMetadata?.totalTokenCount || 0
      }
    });

  } catch (error: any) {
    console.error('[GEMINI_VISION_WORKING] Erro não tratado:', error);
    console.error('[GEMINI_VISION_WORKING] Stack trace:', error.stack);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
