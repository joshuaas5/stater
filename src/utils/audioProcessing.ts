// utils/audioProcessing.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('⚠️ VITE_GEMINI_API_KEY não configurada');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

export interface AudioProcessingResult {
  success: boolean;
  transcription?: string;
  response?: string;
  error?: string;
  debug?: any;
}

/**
 * Processa áudio com Gemini 1.5 Flash usando inline_data
 */
export async function processAudioWithGemini(audioBlob: Blob): Promise<AudioProcessingResult> {
  try {
    console.log('🎤 Iniciando processamento de áudio com Gemini...');
    console.log('📊 Tamanho do áudio:', audioBlob.size, 'bytes');
    console.log('📋 Tipo MIME:', audioBlob.type);

    if (!GEMINI_API_KEY) {
      throw new Error('API key do Gemini não configurada');
    }

    if (audioBlob.size === 0) {
      throw new Error('Arquivo de áudio vazio');
    }

    // Converter Blob para base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64String = btoa(String.fromCharCode(...uint8Array));

    console.log('🔄 Audio convertido para base64. Tamanho:', base64String.length, 'caracteres');

    // Configurar modelo Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    // Preparar prompt para análise financeira
    const prompt = `
Você é um assistente financeiro especializado. 

Analise este áudio e:
1. Transcreva exatamente o que foi dito
2. Identifique se há alguma questão financeira (gastos, investimentos, dúvidas sobre dinheiro)
3. Forneça uma resposta útil e contextualizada

Responda em formato JSON:
{
  "transcription": "texto transcrito",
  "hasFinancialContent": true/false,
  "response": "sua resposta como assistente financeiro"
}
`;

    // Preparar conteúdo com inline_data para Gemini
    const requestContent = [
      {
        text: prompt
      },
      {
        inline_data: {
          mime_type: audioBlob.type || 'audio/webm',
          data: base64String
        }
      }
    ];

    console.log('📤 Enviando para Gemini API...');
    
    // Fazer requisição para Gemini
    const result = await model.generateContent(requestContent);
    const response = await result.response;
    const text = response.text();

    console.log('📥 Resposta bruta do Gemini:', text);

    // Tentar parsear JSON da resposta
    let parsedResponse: any;
    try {
      // Limpar possíveis caracteres markdown
      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.warn('⚠️ Não foi possível parsear JSON, usando resposta direta');
      parsedResponse = {
        transcription: text,
        hasFinancialContent: true,
        response: text
      };
    }

    console.log('✅ Processamento concluído:', parsedResponse);

    return {
      success: true,
      transcription: parsedResponse.transcription || text,
      response: parsedResponse.response || text,
      debug: {
        audioSize: audioBlob.size,
        audioType: audioBlob.type,
        base64Length: base64String.length,
        rawResponse: text,
        parsedResponse
      }
    };

  } catch (error) {
    console.error('❌ Erro no processamento de áudio:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no processamento de áudio',
      debug: {
        audioSize: audioBlob?.size || 0,
        audioType: audioBlob?.type || 'unknown',
        errorDetails: error
      }
    };
  }
}

export default processAudioWithGemini;
