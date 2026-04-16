// Vercel Serverless Function: /api/gemini

// TypeScript Interfaces for Gemini API Response
interface GeminiUsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
}

interface GeminiSafetyRating {
  category: string;
  probability: string; // e.g., NEGLIGIBLE, LOW, MEDIUM, HIGH
  blocked?: boolean;
}

interface GeminiPromptFeedback {
  blockReason?: string;
  safetyRatings?: GeminiSafetyRating[];
  blockReasonMessage?: string; 
}

interface GeminiContentPart {
  text: string;
}

interface GeminiContent {
  parts: GeminiContentPart[];
  role: string; // e.g., 'model'
}

interface GeminiCandidate {
  content: GeminiContent;
  finishReason: string; // e.g., STOP, MAX_TOKENS, SAFETY, RECITATION, OTHER
  index: number;
  safetyRatings: GeminiSafetyRating[];
  tokenCount?: number; // Optional, as usageMetadata is preferred for aggregate
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: GeminiPromptFeedback;
  usageMetadata: GeminiUsageMetadata; // Made non-optional as we rely on it
}
// Protege a chave da Gemini, faz controle de limite E AGORA ACESSA DADOS DO USUÃRIO
// Tipagens podem ser necessÃ¡rias para o objeto 'req' e 'res' em um ambiente TS completo.

import { supabaseAdmin } from './supabase-admin.js'; // ES Module padrÃ£o para TypeScript no Vercel

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
// Updated to gemini-2.5-flash-lite - Latest 2.5 Flash Lite model (July 2025)
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

// Limites (manter os existentes, mas podem ser ajustados se necessÃ¡rio)
const MONTHLY_TOKEN_LIMIT = 2_000_000;
const HOURLY_REQUEST_LIMIT = 3600;
const MINUTE_REQUEST_LIMIT = 60;
const SOFT_MONTHLY_TOKEN_LIMIT = Math.floor(MONTHLY_TOKEN_LIMIT * 0.9);
const SOFT_HOURLY_REQUEST_LIMIT = Math.floor(HOURLY_REQUEST_LIMIT * 0.9);
const SOFT_MINUTE_REQUEST_LIMIT = Math.floor(MINUTE_REQUEST_LIMIT * 0.9);

// Helper para controle de uso (mantido como estÃ¡)
async function getAndUpdateUsage({ promptTokens, outputTokens }: { promptTokens: number, outputTokens: number }) {
  console.log('[GEMINI_API] Initializing getAndUpdateUsage...');
  const now = new Date();
  const month = now.toISOString().slice(0, 7);
  const hour = now.toISOString().slice(0, 13);
  const minute = now.toISOString().slice(0, 16);

  async function upsertUsage(period_type: string, period_value: string, addTokens: number, addRequests: number) {
    console.log('[GEMINI_API] Updating token usage in Supabase...');
    const { data, error } = await supabaseAdmin
      .from('gemini_usage')
      .select('*')
      .eq('period_type', period_type.toString())
      .eq('period_value', period_value.toString())
      .single();
    let tokens = addTokens, requests = addRequests;
    if (data) {
      console.log('[GEMINI_API] Token usage fetched. UsageData:', data);
      tokens += data.tokens;
      requests += data.requests;
    }
    await supabaseAdmin.from('gemini_usage').upsert({
      period_type: period_type.toString(), period_value: period_value.toString(), tokens, requests, updated_at: new Date().toISOString()
    }, { onConflict: 'period_type,period_value' });
    return { tokens, requests };
  }

  const [monthUsage, hourUsage, minuteUsage] = await Promise.all([
    upsertUsage('month', month, promptTokens + outputTokens, 0),
    upsertUsage('hour', hour, 0, 1),
    upsertUsage('minute', minute, 0, 1)
  ]);

  console.log('[GEMINI_API] Token usage updated. MonthUsage:', monthUsage, 'HourUsage:', hourUsage, 'MinuteUsage:', minuteUsage);
  return {
    monthTokens: monthUsage.tokens,
    hourRequests: hourUsage.requests,
    minuteRequests: minuteUsage.requests,
  };
}

// Helper para formatar data (DD/MM/YYYY)
function formatDate(dateString: string | Date): string {
  console.log('[GEMINI_API] Formatting date...');
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const handler = async (req: any, res: any) => {
  console.log('[GEMINI_API_HANDLER_START]');
  console.log('[GEMINI_API] Received method:', req.method);
  if (req.method !== 'POST') {
    console.error('[GEMINI_API] Method not allowed:', req.method);
    return res.status(405).json({ error: 'MÃ©todo nÃ£o permitido' });
  }

    console.log('[GEMINI_API] Method is POST. Checking GEMINI_API_KEY...');
  if (!GEMINI_API_KEY) {
        console.error('[GEMINI_API] GEMINI_API_KEY is not configured.');
    return res.status(500).json({ error: 'GEMINI_API_KEY nÃ£o configurada' });
  }

  // 1. AutenticaÃ§Ã£o do UsuÃ¡rio
  console.log('[GEMINI_API] GEMINI_API_KEY is present. Processing auth header...');
  const authHeader = req.headers.authorization;
  console.log('[GEMINI_API] Validating auth header format...');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[GEMINI_API] Invalid authorization header:', authHeader);
    console.error('[GEMINI_API] Invalid or missing Bearer token in auth header.');
    return res.status(401).json({ error: 'Token de autorizaÃ§Ã£o ausente ou mal formatado.' });
  }
  console.log('[GEMINI_API] Auth header format OK. Extracting token...');
  const token = authHeader.substring(7);

  let userId = '';
  let userName = 'UsuÃ¡rio'; // Default name
  let userEmail = '';

  try {
    console.log('[GEMINI_API] Attempting to get user from Supabase via token...');
    console.log('[GEMINI_API] Calling supabaseAdmin.auth.getUser with token...');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    console.log('[GEMINI_API] supabaseAdmin.auth.getUser response. AuthError:', authError, 'User present:', !!user);
    if (authError || !user) {
      console.error('Erro de autenticaÃ§Ã£o Supabase:', authError);
      console.error('[GEMINI_API] Supabase auth.getUser failed or user not found. Details:', authError?.message);
      return res.status(401).json({ error: 'Token invÃ¡lido ou usuÃ¡rio nÃ£o encontrado.' });
    }
    console.log('[GEMINI_API] Supabase user authenticated. User ID:', user.id);
    userId = user.id;
    userEmail = user.email || 'Email nÃ£o disponÃ­vel';
    userName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0] || 'UsuÃ¡rio';

  } catch (e: any) {
    console.error('ExceÃ§Ã£o na autenticaÃ§Ã£o:', e);
    return res.status(500).json({ error: 'Erro interno ao autenticar usuÃ¡rio: ' + e.message });
  }

  console.log('[GEMINI_API] Extracting originalPrompt from body...');
  const { originalPrompt } = req.body; // Espera 'originalPrompt' do frontend
  console.log('[GEMINI_API] Validating originalPrompt...');
  if (!originalPrompt || typeof originalPrompt !== 'string') {
    console.error('[GEMINI_API] Invalid prompt:', originalPrompt);
    console.error('[GEMINI_API] originalPrompt is invalid or missing.');
    return res.status(400).json({ error: 'Prompt original invÃ¡lido (esperado em originalPrompt)' });
  }

  // 2. Busca de Dados Financeiros
  console.log('[GEMINI_API] originalPrompt is valid. Initializing financialContextText...');
  let financialContextText = `Nome do UsuÃ¡rio: ${userName}\n\n`;

  try {
    // TransaÃ§Ãµes Recentes (Ãºltimas 10)
    console.log('[GEMINI_API] Fetching recent transactions for user:', userId);
    const { data: recentTransactions, error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .select('title, amount, type, category, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    console.log('[GEMINI_API] Recent transactions query response. TransactionsError:', transactionsError, 'RecentTransactions count:', recentTransactions?.length);
    if (transactionsError) {
      console.error('Erro ao buscar transaÃ§Ãµes:', transactionsError);
      console.error('[GEMINI_API] Error fetching recent transactions:', transactionsError.message);
      throw new Error(`Erro ao buscar transaÃ§Ãµes: ${transactionsError.message}`);
    }

    if (recentTransactions && recentTransactions.length > 0) {
      financialContextText += "Ãšltimas TransaÃ§Ãµes:\n";
      recentTransactions.forEach(t => {
        financialContextText += `- ${formatDate(t.date)}: ${t.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${Number(t.amount).toFixed(2)} em \"${t.title}\" (Categoria: ${t.category})\n`;
      });
      financialContextText += "\n";
    } else {
      financialContextText += "Nenhuma transaÃ§Ã£o recente encontrada.\n\n";
    }

    // Principais Categorias de Gastos (Ãºltimos 30 dias)
    console.log('[GEMINI_API] Processing recent transactions. Calculating thirtyDaysAgo...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log('[GEMINI_API] Fetching expenses from last 30 days for user:', userId);
    const { data: expensesLast30Days, error: expensesError } = await supabaseAdmin
      .from('transactions')
      .select('category, amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', thirtyDaysAgo.toISOString());

    console.log('[GEMINI_API] ExpensesLast30Days query response. ExpensesError:', expensesError, 'ExpensesLast30Days count:', expensesLast30Days?.length);
    if (expensesError) {
      console.error('Erro ao buscar despesas:', expensesError);
      console.error('[GEMINI_API] Error fetching expenses from last 30 days:', expensesError.message);
      throw new Error(`Erro ao buscar despesas: ${expensesError.message}`);
    }

    if (expensesLast30Days && expensesLast30Days.length > 0) {
      const spendingByCategory: { [key: string]: number } = {};
      expensesLast30Days.forEach(e => {
        spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + Number(e.amount);
      });
      const topCategories = Object.entries(spendingByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      if (topCategories.length > 0) {
        financialContextText += "Principais Categorias de Gastos (Ãºltimos 30 dias):\n";
        topCategories.forEach(([category, total]) => {
          financialContextText += `- ${category}: R$ ${total.toFixed(2)}\n`;
        });
        financialContextText += "\n";
      } else {
        financialContextText += "Nenhuma despesa encontrada nos Ãºltimos 30 dias para anÃ¡lise de categorias.\n\n";
      }
    } else {
      financialContextText += "Nenhuma despesa encontrada nos Ãºltimos 30 dias.\n\n";
    }

    // Contas a Pagar PrÃ³ximas (nÃ£o parceladas, prÃ³ximas 3)
    console.log('[GEMINI_API] Processing expenses. Fetching upcoming bills for user:', userId);
    const { data: upcomingBills, error: billsError } = await supabaseAdmin
      .from('bills')
      .select('title, amount, due_date, category')
      .eq('user_id', userId)
      .eq('is_paid', false)
      .gte('due_date', new Date().toISOString())
      .filter('total_installments', 'lte', 1) // Assumes 1 or null means not a multi-installment
      .order('due_date', { ascending: true })
      .limit(3);

    console.log('[GEMINI_API] UpcomingBills query response. BillsError:', billsError, 'UpcomingBills count:', upcomingBills?.length);
    if (billsError) {
      console.error('Erro ao buscar contas a pagar:', billsError);
      console.error('[GEMINI_API] Error fetching upcoming bills:', billsError.message);
      throw new Error(`Erro ao buscar contas a pagar: ${billsError.message}`);
    }

    if (upcomingBills && upcomingBills.length > 0) {
      financialContextText += "Contas a Pagar PrÃ³ximas (nÃ£o parceladas):\n";
      upcomingBills.forEach(b => {
        financialContextText += `- \"${b.title}\": R$ ${Number(b.amount).toFixed(2)}, vence em ${formatDate(b.due_date)} (Categoria: ${b.category})\n`;
      });
      financialContextText += "\n";
    } else {
      financialContextText += "Nenhuma conta a pagar prÃ³xima (nÃ£o parcelada) encontrada.\n\n";
    }

    // Parcelamentos Ativos (prÃ³ximos 3 vencimentos)
    console.log('[GEMINI_API] Processing upcoming bills. Fetching active installments for user:', userId);
    const { data: activeInstallments, error: installmentsError } = await supabaseAdmin
      .from('bills')
      .select('title, amount, due_date, category, current_installment, total_installments')
      .eq('user_id', userId)
      .eq('is_paid', false)
      .gte('due_date', new Date().toISOString())
      .gt('total_installments', 1)
      .order('due_date', { ascending: true })
      .limit(3);

    console.log('[GEMINI_API] ActiveInstallments query response. InstallmentsError:', installmentsError, 'ActiveInstallments count:', activeInstallments?.length);
    if (installmentsError) {
      console.error('Erro ao buscar parcelamentos:', installmentsError);
      console.error('[GEMINI_API] Error fetching active installments:', installmentsError.message);
      throw new Error(`Erro ao buscar parcelamentos: ${installmentsError.message}`);
    }

    if (activeInstallments && activeInstallments.length > 0) {
      financialContextText += "Parcelamentos Ativos (prÃ³ximos vencimentos):\n";
      activeInstallments.forEach(i => {
        financialContextText += `- \"${i.title}\": Parcela ${i.current_installment}/${i.total_installments} de R$ ${Number(i.amount).toFixed(2)}, vence em ${formatDate(i.due_date)} (Categoria: ${i.category})\n`;
      });
      financialContextText += "\n";
    } else {
      financialContextText += "Nenhum parcelamento ativo com vencimento prÃ³ximo encontrado.\n\n";
    }

  } catch (e: any) {
    console.error('Erro ao buscar dados financeiros:', e);
    financialContextText += "Houve um problema ao buscar alguns dos seus dados financeiros. Os conselhos podem ser mais genÃ©ricos.\n\n";
  }
  // 3. ConstruÃ§Ã£o do Contexto para a API Gemini
  console.log('[GEMINI_API] Financial data context built. Constructing fullPrompt...');
  const today = new Date();  const todayFormatted = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');  // Detectar se a pergunta requer anÃ¡lise financeira
  const needsFinancialContext = originalPrompt.toLowerCase().includes('anÃ¡lise') || 
                               originalPrompt.toLowerCase().includes('situaÃ§Ã£o') ||
                               originalPrompt.toLowerCase().includes('gastos') ||
                               originalPrompt.toLowerCase().includes('receitas') ||
                               originalPrompt.toLowerCase().includes('contas') ||
                               originalPrompt.toLowerCase().includes('orÃ§amento') ||
                               originalPrompt.toLowerCase().includes('dinheiro') ||
                               originalPrompt.toLowerCase().includes('financeira');

  const contextToUse = needsFinancialContext ? financialContextText : "Dados financeiros disponÃ­veis mediante solicitaÃ§Ã£o.";
  const fullPrompt = `VocÃª Ã© o Stater IA, consultor financeiro direto e conciso.

DATA: ${todayFormatted}
USUÃRIO: ${userName}

${needsFinancialContext ? `DADOS FINANCEIROS:\n${contextToUse}\n` : ''}
PERGUNTA: ${originalPrompt}

INSTRUÃ‡Ã•ES DE RESPOSTA:
- Seja DIRETO e CONCISO
- Responda apenas o que foi perguntado  
- NUNCA use asteriscos (*), duplos asteriscos (**) ou markdown nas respostas
- Use apenas texto limpo e emojis quando apropriado
- NÃƒO faÃ§a anÃ¡lise financeira automÃ¡tica
- SÃ“ analise finanÃ§as se explicitamente solicitado
- Complete suas respostas - nÃ£o corte no meio
- Sempre calcule e mostre o SALDO ATUAL do usuÃ¡rio quando relevante

CÃLCULO DO SALDO:
- Total de receitas MENOS total de despesas das transaÃ§Ãµes recentes
- Formato: "ðŸ’° Seu saldo atual Ã© R$ X,XX"

DETECÃ‡ÃƒO DE TRANSAÃ‡Ã•ES:
Se detectar transaÃ§Ã£o (ganhar/receber/gastar/pagar + valor), responda APENAS com JSON:
{
  "tipo": "receita" ou "despesa", 
  "descriÃ§Ã£o": "descriÃ§Ã£o_breve",
  "valor": valor_numerico,
  "data": "${todayFormatted}",
  "categoria": "categoria_automatica_obrigatoria"
}

ANÃLISE DE FATURAS/EXTRATOS:
Quando analisar documentos financeiros ou faturas:
1. SEMPRE mencione explicitamente os valores que conseguiu identificar
2. Se houver QUALQUER dificuldade na leitura (baixa qualidade, valores sobrepostos, mÃºltiplos totais), COMUNIQUE isso ao usuÃ¡rio
3. Explique sua interpretaÃ§Ã£o: "Identifiquei o valor de R$ X,XX baseado no campo [descriÃ§Ã£o do campo]"
4. Se houver divergÃªncias ou valores diferentes no mesmo documento, liste TODOS os valores encontrados
5. Recomende verificaÃ§Ã£o manual sempre que houver incerteza
6. Use frases como: "âš ï¸ VERIFICAÃ‡ÃƒO NECESSÃRIA", "â“ Valor incerto", "âœ… Valor confirmado"

TRANSPARÃŠNCIA OBRIGATÃ“RIA:
- "ðŸ“‹ Analisei seu documento e identifiquei..."
- "âš ï¸ Encontrei mÃºltiplos valores, verifique qual Ã© o correto"
- "â“ Qualidade da imagem pode afetar precisÃ£o - confirme o valor"
- "âœ… Valor claro e legÃ­vel: R$ X,XX"

CATEGORIAS OBRIGATÃ“RIAS PARA AUTO-CATEGORIZAÃ‡ÃƒO:
- "AlimentaÃ§Ã£o": supermercados, restaurantes, delivery, padarias
- "Transporte": combustÃ­vel, uber, taxi, Ã´nibus, pedÃ¡gios  
- "SaÃºde": farmÃ¡cias, consultas mÃ©dicas, planos de saÃºde
- "Entretenimento": cinema, streaming, jogos, viagens, bares
- "HabitaÃ§Ã£o": aluguel, condomÃ­nio, Ã¡gua, luz, gÃ¡s, internet
- "EducaÃ§Ã£o": cursos, livros, mensalidades escolares
- "Cuidados Pessoais": salÃ£o, barbeiro, cosmÃ©ticos, higiene
- "Outros": categoria genÃ©rica quando nÃ£o se encaixa

Resposta direta (SEM asteriscos ou markdown):`;
  console.log('[GEMINI_API] Full prompt constructed. Length:', fullPrompt.length);

  const geminiPayload = {
    contents: [{ 
      role: "user", 
      parts: [{text: fullPrompt}] 
    }],    generationConfig: {
      temperature: 0.7,
      topK: 32,
      topP: 1,
      maxOutputTokens: 16384, // Aumentado significativamente para evitar truncamento
      // responseMimeType: "text/plain", // Para Gemini 1.5, se necessÃ¡rio
    }
  };

  console.log('[GEMINI_API] Usage limits OK. Initializing outputText...');
  let outputText = '';

  try {
    console.log('[GEMINI_API] Sending prompt to Gemini API...');
    console.log('[GEMINI_API] Calling fetch to GEMINI_ENDPOINT...');
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    console.log('[GEMINI_API] Fetch to GEMINI_ENDPOINT response status:', response.status);
    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error response:', errText);
      return res.status(response.status).json({ error: 'Gemini API error: ' + errText });
    }

    console.log('[GEMINI_API] Gemini API call successful. Parsing JSON response...');
    let data: GeminiResponse | null = null;
let rawGeminiResponse = '';
try {
  rawGeminiResponse = await response.text();
  console.log('[GEMINI_API] Raw Gemini response:', rawGeminiResponse);
  
  // Verificar se a resposta Ã© HTML antes de tentar fazer parse JSON
  if (/<\s*!doctype|<\s*html|<\s*body|<\s*head/i.test(rawGeminiResponse)) {
    console.error('[GEMINI_API] Gemini retornou HTML ao invÃ©s de JSON:', rawGeminiResponse.substring(0, 300));
    return res.status(500).json({ 
      error: 'Gemini API retornou pÃ¡gina HTML ao invÃ©s de resposta JSON',
      details: 'ServiÃ§o temporariamente indisponÃ­vel - tente novamente'
    });
  }
  
  data = JSON.parse(rawGeminiResponse);
} catch (jsonError) {
  console.error('[GEMINI_API] Erro ao fazer parse do JSON da Gemini:', jsonError, 'Resposta bruta:', rawGeminiResponse);
  return res.status(500).json({ error: 'Erro ao interpretar resposta da IA Gemini', details: rawGeminiResponse });
}    // Ensure usageMetadata is present before proceeding
    if (!data || !data.usageMetadata) {
      console.error('Gemini response missing usageMetadata:', data);
      return res.status(500).json({ error: 'Resposta da API Gemini invÃ¡lida: metadados de uso ausentes.' });
    }

    const promptTokenCount = data.usageMetadata.promptTokenCount;
    const outputTokenCount = data.usageMetadata.candidatesTokenCount;    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
      outputText = data.candidates[0]?.content?.parts[0]?.text || "";
      console.log('[GEMINI_API] Extracted outputText from Gemini response. Length:', outputText.length);
      console.log('[GEMINI_API] finishReason:', data.candidates[0].finishReason);
      
      // Remover asteriscos das respostas
      outputText = outputText.replace(/\*\*/g, '').replace(/\*/g, '');
      
      // Log se a resposta foi truncada por limite de tokens
      if (data.candidates[0].finishReason === 'MAX_TOKENS') {
        console.warn('[GEMINI_API] Resposta truncada por limite de tokens!');
        outputText += '\n\n[Resposta foi cortada por limite de tokens - considere aumentar maxOutputTokens]';
      } else if (data.candidates[0].finishReason !== 'STOP') {
        console.warn('[GEMINI_API] Resposta nÃ£o finalizou normalmente. Reason:', data.candidates[0].finishReason);
      }
    }else if (data.promptFeedback && data.promptFeedback.blockReason) {
      console.error('Gemini prompt blocked:', data.promptFeedback.blockReason, data.promptFeedback.safetyRatings);
      outputText = `Desculpe, sua solicitaÃ§Ã£o nÃ£o pÃ´de ser processada devido a restriÃ§Ãµes de conteÃºdo (${data.promptFeedback.blockReason}). Por favor, reformule sua pergunta.`;
      // Log token usage even for blocked prompts as Gemini might still count them
      console.log(`[GEMINI_API] Tokens for blocked prompt: Prompt=${promptTokenCount}, Output (blocked)=${outputTokenCount}`);
      await getAndUpdateUsage({ promptTokens: promptTokenCount, outputTokens: outputTokenCount });
      return res.status(400).json({ error: 'Prompt bloqueado pela IA.', details: outputText, blockReason: data.promptFeedback.blockReason });
    } else {
      console.error('Gemini response format unexpected or no candidates:', data);
      outputText = 'Desculpe, nÃ£o consegui obter uma resposta da IA no momento.';
      // Log token usage even for unexpected format if metadata is available
      console.log(`[GEMINI_API] Tokens for unexpected response: Prompt=${promptTokenCount}, Output (error)=${outputTokenCount}`);
      await getAndUpdateUsage({ promptTokens: promptTokenCount, outputTokens: outputTokenCount });
      return res.status(500).json({ error: 'Resposta inesperada da IA.'});
    }

    console.log(`[GEMINI_API] Actual tokens from API: Prompt=${promptTokenCount}, Output=${outputTokenCount}, Total=${data.usageMetadata.totalTokenCount}`);

    console.log('[GEMINI_API] Calling getAndUpdateUsage with API token counts...');
    const usage = await getAndUpdateUsage({ promptTokens: promptTokenCount, outputTokens: outputTokenCount });
    console.log('[GEMINI_API] Usage limits check. MonthTokens:', usage.monthTokens, 'HourRequests:', usage.hourRequests, 'MinuteRequests:', usage.minuteRequests);
    if (usage.monthTokens >= MONTHLY_TOKEN_LIMIT || usage.hourRequests >= HOURLY_REQUEST_LIMIT || usage.minuteRequests >= MINUTE_REQUEST_LIMIT) {
      console.warn("Limite da API Gemini prÃ³ximo ou atingido:", usage);
    }
    console.log('[GEMINI_API] Successfully processed request. Sending 200 response to client.');
    // Garante que nunca retorna JSON vazio
if (!outputText || outputText.trim() === '{}' || outputText.trim() === '```json\n{}\n```') {
  outputText = 'Desculpe, nÃ£o consegui obter uma resposta Ãºtil da IA no momento. Tente reformular sua pergunta ou tente novamente mais tarde.';
}
return res.status(200).json({ resposta: outputText });
    console.log('[GEMINI_API_HANDLER_END]');

  } catch (e: any) {
    console.error('[GEMINI_API] Erro crÃ­tico no handler principal:', e);
    console.error('[GEMINI_API] Stack trace:', e.stack);
    console.error('[GEMINI_API] Detalhes do erro:', {
      message: e.message,
      name: e.name,
      code: e.code
    });
    return res.status(500).json({ 
      error: 'Erro ao buscar dados financeiros: ' + e.message,
      details: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
}

export default handler;



