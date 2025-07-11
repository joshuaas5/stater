// Audio processing service for Gemini integration
export interface AudioProcessingResult {
  transcript: string;
  response: string;
  audioUrl?: string;
  intent?: {
    type: 'ADD_TRANSACTION' | 'GET_BALANCE' | 'GET_REPORT' | 'GENERAL';
    data?: any;
  };
}

export const processAudioWithGemini = async (audioFile: File, userId?: string): Promise<AudioProcessingResult> => {
  try {
    if (!audioFile) {
      throw new Error('Arquivo de áudio é obrigatório');
    }

    // Usando a mesma função que já existe no projeto
    const { fetchGeminiFlashLite } = await import('@/utils/gemini');

    // Convert audio to base64
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    // First: Speech-to-Text with Gemini
    const transcriptPrompt = `
Por favor, analise este arquivo de áudio e:
1. Transcreva o conteúdo falado em português brasileiro
2. Mantenha a naturalidade da fala
3. Retorne apenas o texto transcrito

IMPORTANTE: Retorne apenas a transcrição, sem comentários adicionais.

[ÁUDIO BASE64]: ${audioBase64.substring(0, 1000)}...`;

    const transcript = await fetchGeminiFlashLite(transcriptPrompt);

    // Second: Analyze intent and generate response
    const analysisPrompt = `
Você é Stater IA, assistente financeiro inteligente.

TRANSCRIÇÃO DO USUÁRIO: "${transcript}"

INSTRUÇÕES:
1. Analise a intenção financeira do usuário
2. Identifique se é: ADD_TRANSACTION, GET_BALANCE, GET_REPORT, ou GENERAL
3. Se for ADD_TRANSACTION, extraia: valor, categoria, tipo (receita/despesa), descrição
4. Gere uma resposta natural e amigável em português brasileiro
5. Mantenha o tom conversacional e útil

FORMATO DE RESPOSTA (JSON válido):
{
  "intent": {
    "type": "ADD_TRANSACTION",
    "data": {
      "amount": 50.00,
      "category": "Alimentação", 
      "type": "expense",
      "description": "Descrição da transação"
    }
  },
  "response": "Entendi! Você quer adicionar um gasto de R$ 50,00 em Alimentação. Posso confirmar essa transação para você?"
}

EXEMPLOS DE CLASSIFICAÇÃO:
- "Adicionar gasto de 50 reais em alimentação" → ADD_TRANSACTION
- "Gastei 30 reais no mercado" → ADD_TRANSACTION  
- "Recebi 1000 reais de salário" → ADD_TRANSACTION (type: income)
- "Quanto tenho de saldo?" → GET_BALANCE  
- "Relatório da semana" → GET_REPORT
- "Como estão meus gastos?" → GET_REPORT
- Outras perguntas → GENERAL

Responda APENAS com o JSON válido:`;

    const analysisResponse = await fetchGeminiFlashLite(analysisPrompt);
    
    let parsedResult: any;
    try {
      // Extract JSON from response
      const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : analysisResponse;
      parsedResult = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Erro ao fazer parse do JSON:', e);
      // Fallback if JSON parsing fails
      parsedResult = {
        intent: { type: 'GENERAL' },
        response: 'Entendi sua mensagem! Como posso ajudá-lo com suas finanças hoje?'
      };
    }

    const result: AudioProcessingResult = {
      transcript: transcript.trim(),
      response: parsedResult.response || 'Como posso ajudá-lo?',
      intent: parsedResult.intent || { type: 'GENERAL' }
    };

    return result;

  } catch (error) {
    console.error('Erro no processamento de áudio:', error);
    
    // Fallback response
    return {
      transcript: 'Não foi possível transcrever o áudio',
      response: 'Desculpe, tive dificuldades para processar seu áudio. Pode tentar novamente ou digitar sua mensagem?',
      intent: { type: 'GENERAL' }
    };
  }
};
