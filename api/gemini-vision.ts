// API para processamento de documentos financeiros com Gemini 2.5 Flash Vision

import { supabaseAdmin } from './supabase-admin';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDTTPO0otruHVzh7bXsi7MCyG674P03758";

interface GeminiVisionResponse {
  documentType: 'extrato' | 'nota_fiscal' | 'recibo' | 'conta_servico' | 'outros';
  confidence: number;
  shouldGroup: boolean;
  transactions: Array<{
    description: string;
    amount: number;
    date?: string;
    category: string;
    type: 'income' | 'expense';
    confidence: number;
  }>;
  summary: {
    totalAmount: number;
    itemCount: number;
    establishment?: string;
  };
  rawText?: string;
}

interface GeminiApiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    totalTokenCount: number;
  };
}

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
  console.log('[GEMINI_VISION] Handler started, method:', req.method);
  
  if (req.method !== 'POST') {
    console.log('[GEMINI_VISION] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Verificar autenticação
  const authHeader = req.headers.authorization;
  console.log('[GEMINI_VISION] Auth header present:', !!authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[GEMINI_VISION] Token de autorização ausente ou mal formatado');
    return res.status(401).json({ error: 'Token de autorização ausente' });
  }

  const token = authHeader.substring(7);
  let userId = '';

  try {
    console.log('[GEMINI_VISION] Tentando autenticar usuário...');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error('[GEMINI_VISION] Erro de autenticação:', authError?.message || 'Usuário não encontrado');
      return res.status(401).json({ error: 'Token inválido' });
    }
    userId = user.id;
    console.log('[GEMINI_VISION] Usuário autenticado:', userId);
  } catch (e: any) {
    console.error('[GEMINI_VISION] Exceção na autenticação:', e.message);
    return res.status(500).json({ error: 'Erro na autenticação: ' + e.message });
  }

  // Verificar dados de entrada
  const { imageBase64 } = req.body;
  console.log('[GEMINI_VISION] Body keys:', Object.keys(req.body));
  console.log('[GEMINI_VISION] imageBase64 present:', !!imageBase64);
  console.log('[GEMINI_VISION] imageBase64 length:', imageBase64?.length || 0);

  if (!imageBase64) {
    console.error('[GEMINI_VISION] Imagem não fornecida no body');
    return res.status(400).json({ error: 'Imagem não fornecida' });
  }

  console.log('[GEMINI_VISION] GEMINI_API_KEY present:', !!GEMINI_API_KEY);
  if (!GEMINI_API_KEY) {
    console.error('[GEMINI_VISION] GEMINI_API_KEY não configurada');
    return res.status(500).json({ error: 'API não configurada' });
  }

  try {
    console.log('[GEMINI_VISION] Processando imagem com Gemini 2.5 Flash...');
    
    // Detectar tipo MIME da imagem
    let mimeType = "image/jpeg";
    if (imageBase64.startsWith('/9j/')) {
      mimeType = "image/jpeg";
    } else if (imageBase64.startsWith('iVBORw0KGgo')) {
      mimeType = "image/png";
    } else if (imageBase64.startsWith('R0lGODlh')) {
      mimeType = "image/gif";
    }
    
    console.log('[GEMINI_VISION] Tipo MIME detectado:', mimeType);
    
    // Preparar payload para Gemini Vision
    const payload = {
      contents: [{
        parts: [
          {
            text: DOCUMENT_ANALYSIS_PROMPT
          },
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

    console.log('[GEMINI_VISION] Enviando requisição para Gemini API...');
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    console.log('[GEMINI_VISION] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GEMINI_VISION] Erro da API Gemini:', errorText);
      return res.status(500).json({ 
        error: 'Falha na análise do documento',
        details: errorText 
      });
    }

    const data = await response.json() as GeminiApiResponse;
    console.log('[GEMINI_VISION] Resposta recebida da API');

    // Extrair texto da resposta
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('[GEMINI_VISION] Formato de resposta inesperado:', data);
      return res.status(500).json({ error: 'Resposta inválida da IA' });
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('[GEMINI_VISION] Texto extraído:', responseText.substring(0, 200) + '...');

    // Parse do JSON retornado pela IA
    let analysisResult: GeminiVisionResponse;
    try {
      // Limpar possíveis marcadores de código
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      analysisResult = JSON.parse(cleanedText);
      console.log('[GEMINI_VISION] JSON parseado com sucesso');
    } catch (parseError) {
      console.error('[GEMINI_VISION] Erro ao parsear JSON:', parseError);
      console.error('[GEMINI_VISION] Texto problemático:', responseText);
      return res.status(500).json({ 
        error: 'Falha ao interpretar resultado da análise',
        rawResponse: responseText
      });
    }

    // Validar estrutura do resultado
    if (!analysisResult.transactions || !Array.isArray(analysisResult.transactions)) {
      console.error('[GEMINI_VISION] Estrutura inválida:', analysisResult);
      return res.status(500).json({ error: 'Estrutura de dados inválida' });
    }

    // Log de sucesso
    console.log(`[GEMINI_VISION] Sucesso! ${analysisResult.transactions.length} transações extraídas`);
    console.log(`[GEMINI_VISION] Tipo: ${analysisResult.documentType}, Confiança: ${analysisResult.confidence}`);

    // Retornar resultado estruturado
    res.status(200).json({
      success: true,
      data: analysisResult,
      metadata: {
        userId,
        processedAt: new Date().toISOString(),
        tokensUsed: data.usageMetadata?.totalTokenCount || 0
      }
    });
  } catch (error: any) {
    console.error('[GEMINI_VISION] Erro não tratado:', error);
    console.error('[GEMINI_VISION] Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
