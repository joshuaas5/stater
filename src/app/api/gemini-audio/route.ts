import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

interface AudioProcessingResult {
  transcript: string;
  response: string;
  audioUrl?: string;
  intent?: {
    type: 'ADD_TRANSACTION' | 'GET_BALANCE' | 'GET_REPORT' | 'GENERAL';
    data?: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const userId = formData.get('userId') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Arquivo de áudio é obrigatório' },
        { status: 400 }
      );
    }

    // Convert audio file to buffer
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // Process with Gemini Flash 2.5
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // First: Speech-to-Text
    const transcriptResult = await model.generateContent([
      {
        inlineData: {
          mimeType: audioFile.type,
          data: audioBase64
        }
      },
      {
        text: `Por favor, transcreva este áudio em português brasileiro. 
               Retorne apenas o texto transcrito, sem comentários adicionais.`
      }
    ]);

    const transcript = transcriptResult.response.text().trim();

    // Second: Analyze intent and generate response
    const analysisPrompt = `
Você é Stater IA, assistente financeiro inteligente.

TRANSCRIÇÃO DO USUÁRIO: "${transcript}"

INSTRUÇÕES:
1. Analise a intenção financeira do usuário
2. Identifique se é: ADD_TRANSACTION, GET_BALANCE, GET_REPORT, ou GENERAL
3. Se for ADD_TRANSACTION, extraia: valor, categoria, tipo (receita/despesa), descrição
4. Gere uma resposta natural e amigável
5. Mantenha o tom conversacional e útil

FORMATO DE RESPOSTA:
{
  "intent": {
    "type": "ADD_TRANSACTION|GET_BALANCE|GET_REPORT|GENERAL",
    "data": {
      "amount": 50.00,
      "category": "Alimentação", 
      "type": "expense",
      "description": "Descrição da transação"
    }
  },
  "response": "Sua resposta natural aqui"
}

EXEMPLOS:
- "Adicionar gasto de 50 reais em alimentação" → ADD_TRANSACTION
- "Quanto tenho de saldo?" → GET_BALANCE  
- "Relatório da semana" → GET_REPORT

Responda em JSON válido:`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = analysisResult.response.text().trim();

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(analysisText);
    } catch (e) {
      // Fallback if JSON parsing fails
      parsedResult = {
        intent: { type: 'GENERAL' },
        response: 'Desculpe, não consegui processar sua solicitação completamente. Pode reformular?'
      };
    }

    // Third: Generate audio response (Text-to-Speech)
    const ttsPrompt = `
Converta o seguinte texto para áudio em português brasileiro, 
com voz feminina natural e amigável:

"${parsedResult.response}"

Use uma entonação conversacional e simpática.`;

    const ttsResult = await model.generateContent([
      { text: ttsPrompt }
    ]);

    // Note: Gemini 2.0 Flash pode retornar áudio diretamente
    // Por enquanto, vamos usar Web Speech API no frontend como fallback
    
    const result: AudioProcessingResult = {
      transcript,
      response: parsedResult.response,
      intent: parsedResult.intent,
      // audioUrl will be generated on frontend using Web Speech API
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro no processamento de áudio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Método GET para testar a API
export async function GET() {
  return NextResponse.json({
    message: 'API de processamento de áudio Gemini',
    status: 'ativo',
    endpoints: {
      POST: 'Processa áudio e retorna transcrição + resposta'
    }
  });
}
