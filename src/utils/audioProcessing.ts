// utils/audioProcessing.ts
import { fetchGeminiAudio } from './gemini';

export interface AudioProcessingResult {
  success: boolean;
  transcription?: string;
  response?: string;
  error?: string;
  debug?: any;
}

/**
 * Processa áudio com Gemini 2.5 Flash usando a configuração existente do projeto
 */
export async function processAudioWithGemini(audioBlob: Blob): Promise<AudioProcessingResult> {
  try {
    console.log('🎤 Iniciando processamento de áudio com Gemini...');
    console.log('📊 Tamanho do áudio:', audioBlob.size, 'bytes');
    console.log('📋 Tipo MIME:', audioBlob.type);

    if (audioBlob.size === 0) {
      throw new Error('Arquivo de áudio vazio');
    }

    // Converter Blob para base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64String = btoa(String.fromCharCode(...uint8Array));

    console.log('🔄 Audio convertido para base64. Tamanho:', base64String.length, 'caracteres');

    // Preparar dados para o Gemini 2.5 Flash com multipart - OTIMIZADO
    const prompt = `Analise este áudio e determine se contém FALA HUMANA REAL.

IMPORTANTE: 
- Se for apenas ruído, clicks, sons de teclado, ou outros sons que NÃO sejam voz humana clara, retorne hasFinancialContent: false
- Apenas considere hasFinancialContent: true se houver FALA HUMANA CLARA sobre finanças, transações, dinheiro
- Se não for voz humana, use uma mensagem educativa na response

Responda em JSON:
{
  "transcription": "texto transcrito SE FOR VOZ HUMANA, senão deixe vazio",
  "hasFinancialContent": false,
  "response": "Se não for voz humana: 'Não detectei fala humana neste áudio. Por favor, fale claramente para que eu possa ajudá-lo com suas finanças.' | Se for voz mas sem conteúdo financeiro: resposta útil | Se for financeiro: resposta específica"
}`;

    // Preparar dados multipart para o Gemini
    const geminiRequest = {
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: audioBlob.type || 'audio/webm',
              data: base64String
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1, // OTIMIZAÇÃO: Mais baixo para respostas rápidas
        topK: 20, // OTIMIZAÇÃO: Reduzido
        topP: 0.7, // OTIMIZAÇÃO: Reduzido
        maxOutputTokens: 1000, // OTIMIZAÇÃO: Reduzido para áudio
      }
    };

    console.log('📤 Enviando para Gemini API (usando configuração existente)...');
    
    // Usar a nova função fetchGeminiAudio para processar áudio com multipart
    const geminiResponse = await fetchGeminiAudio(prompt, base64String, audioBlob.type || 'audio/webm');

    console.log('📥 Resposta bruta do Gemini:', geminiResponse);

    // Tentar parsear JSON da resposta
    let parsedResponse: any;
    try {
      // Limpar possíveis caracteres markdown
      const cleanedText = geminiResponse.replace(/```json\n?|```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.warn('⚠️ Não foi possível parsear JSON, usando resposta direta');
      parsedResponse = {
        transcription: geminiResponse,
        hasFinancialContent: true,
        response: geminiResponse
      };
    }

    console.log('✅ Processamento concluído:', parsedResponse);

    return {
      success: true,
      transcription: parsedResponse.transcription || geminiResponse,
      response: parsedResponse.response || geminiResponse,
      debug: {
        audioSize: audioBlob.size,
        audioType: audioBlob.type,
        base64Length: base64String.length,
        rawResponse: geminiResponse,
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
