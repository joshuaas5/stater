// Vercel Serverless Function: /api/gemini
// Protege a chave da Gemini e faz controle de limite
import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=' + GEMINI_API_KEY;

// Limites Gemini 2.0 Flash Lite (maio/2024)
const MONTHLY_TOKEN_LIMIT = 2_000_000; // tokens/mês
const HOURLY_REQUEST_LIMIT = 3600; // requests/hora
const MINUTE_REQUEST_LIMIT = 60; // requests/minuto
const SOFT_MONTHLY_TOKEN_LIMIT = Math.floor(MONTHLY_TOKEN_LIMIT * 0.9); // 90%
const SOFT_HOURLY_REQUEST_LIMIT = Math.floor(HOURLY_REQUEST_LIMIT * 0.9); // 90%
const SOFT_MINUTE_REQUEST_LIMIT = Math.floor(MINUTE_REQUEST_LIMIT * 0.9); // 90%

// Controle persistente de uso via Supabase
import { supabaseAdmin } from './supabase-admin';

async function getAndUpdateUsage({ promptTokens, outputTokens }: { promptTokens: number, outputTokens: number }) {
  const now = new Date();
  const month = now.toISOString().slice(0, 7); // '2025-05'
  const hour = now.toISOString().slice(0, 13); // '2025-05-09T17'
  const minute = now.toISOString().slice(0, 16); // '2025-05-09T17:55'

  // Helper para buscar e atualizar (upsert) contador
  async function upsertUsage(period_type: string, period_value: string, addTokens: number, addRequests: number) {
    // Busca atual
    const { data, error } = await supabaseAdmin
      .from('gemini_usage')
      .select('*')
      .eq('period_type', period_type)
      .eq('period_value', period_value)
      .single();
    let tokens = addTokens, requests = addRequests;
    if (data) {
      tokens += data.tokens;
      requests += data.requests;
    }
    // Atualiza (upsert)
    await supabaseAdmin.from('gemini_usage').upsert({
      period_type, period_value, tokens, requests, updated_at: new Date().toISOString()
    }, { onConflict: ['period_type', 'period_value'] });
    return { tokens, requests };
  }

  // Atualiza e lê os contadores
  const [monthUsage, hourUsage, minuteUsage] = await Promise.all([
    upsertUsage('month', month, promptTokens + outputTokens, 0),
    upsertUsage('hour', hour, 0, 1),
    upsertUsage('minute', minute, 0, 1)
  ]);

  return {
    monthTokens: monthUsage.tokens,
    hourRequests: hourUsage.requests,
    minuteRequests: minuteUsage.requests,
    month,
    hour,
    minute
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada' });
  }

  const { prompt, systemInstruction } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt inválido' });
  }

  // Montar payload Gemini
  const messages = [
    systemInstruction ? { role: 'system', content: systemInstruction } : null,
    { role: 'user', content: prompt }
  ].filter(Boolean);
  const body = {
    contents: messages,
    generationConfig: {
      temperature: 0.7,
      topK: 32,
      topP: 1,
      maxOutputTokens: 2048
    }
  };

  // Calcular tokens consumidos (estimativa simples)
  const promptTokens = prompt.split(/\s+/).length;

  // Consulta e atualiza os contadores no Supabase
  let outputText = '';
  try {
    // Chama Gemini primeiro para saber o output
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: 'Gemini API error: ' + err });
    }
    const data = await response.json();
    outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const outputTokens = outputText.split(/\s+/).length;

    // Atualiza e lê os limites
    const usage = await getAndUpdateUsage({ promptTokens, outputTokens });
    if (
      usage.monthTokens >= SOFT_MONTHLY_TOKEN_LIMIT ||
      usage.hourRequests >= SOFT_HOURLY_REQUEST_LIMIT ||
      usage.minuteRequests >= SOFT_MINUTE_REQUEST_LIMIT
    ) {
      return res.status(429).json({
        error: 'Limite gratuito da IA atingido. Tente novamente mais tarde.'
      });
    }
    return res.status(200).json({ resposta: outputText });
  } catch (e: any) {
    return res.status(500).json({ error: 'Erro ao acessar Gemini: ' + e.message });
  }
}
