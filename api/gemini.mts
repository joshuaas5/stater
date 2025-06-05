// Vercel Serverless Function: /api/gemini
// Protege a chave da Gemini, faz controle de limite E AGORA ACESSA DADOS DO USUÁRIO
// Tipagens podem ser necessárias para o objeto 'req' e 'res' em um ambiente TS completo.

import { supabaseAdmin } from './supabase-admin.mjs'; // Assuming this correctly initializes supabase admin client

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Updated to gemini-1.5-flash-latest
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

// Limites (manter os existentes, mas podem ser ajustados se necessário)
const MONTHLY_TOKEN_LIMIT = 2_000_000;
const HOURLY_REQUEST_LIMIT = 3600;
const MINUTE_REQUEST_LIMIT = 60;
const SOFT_MONTHLY_TOKEN_LIMIT = Math.floor(MONTHLY_TOKEN_LIMIT * 0.9);
const SOFT_HOURLY_REQUEST_LIMIT = Math.floor(HOURLY_REQUEST_LIMIT * 0.9);
const SOFT_MINUTE_REQUEST_LIMIT = Math.floor(MINUTE_REQUEST_LIMIT * 0.9);

// Helper para controle de uso (mantido como está)
async function getAndUpdateUsage({ promptTokens, outputTokens }: { promptTokens: number, outputTokens: number }) {
  const now = new Date();
  const month = now.toISOString().slice(0, 7);
  const hour = now.toISOString().slice(0, 13);
  const minute = now.toISOString().slice(0, 16);

  async function upsertUsage(period_type: string, period_value: string, addTokens: number, addRequests: number) {
    const { data, error } = await supabaseAdmin
      .from('gemini_usage')
      .select('*')
      .eq('period_type', period_type.toString())
      .eq('period_value', period_value.toString())
      .single();
    let tokens = addTokens, requests = addRequests;
    if (data) {
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

  return {
    monthTokens: monthUsage.tokens,
    hourRequests: hourUsage.requests,
    minuteRequests: minuteUsage.requests,
  };
}

// Helper para formatar data (DD/MM/YYYY)
function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const handler = async (req: any, res: any) => {
  console.log('API /api/gemini - Received method:', req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada' });
  }

  // 1. Autenticação do Usuário
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido ou mal formatado.' });
  }
  const token = authHeader.split(' ')[1];

  let userId = '';
  let userName = 'Usuário'; // Default name
  let userEmail = '';

  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error('Erro de autenticação Supabase:', authError);
      return res.status(401).json({ error: 'Token inválido ou usuário não encontrado.' });
    }
    userId = user.id;
    userEmail = user.email || 'Email não disponível';
    userName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split('@')[0] || 'Usuário';

  } catch (e: any) {
    console.error('Exceção na autenticação:', e);
    return res.status(500).json({ error: 'Erro interno ao autenticar usuário: ' + e.message });
  }

  const { originalPrompt } = req.body; // Espera 'originalPrompt' do frontend
  if (!originalPrompt || typeof originalPrompt !== 'string') {
    return res.status(400).json({ error: 'Prompt original inválido (esperado em originalPrompt)' });
  }

  // 2. Busca de Dados Financeiros
  let financialContextText = `Nome do Usuário: ${userName}\n\n`;

  try {
    // Transações Recentes (últimas 10)
    const { data: recentTransactions, error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .select('title, amount, type, category, date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10);

    if (transactionsError) throw new Error(`Erro ao buscar transações: ${transactionsError.message}`);

    if (recentTransactions && recentTransactions.length > 0) {
      financialContextText += "Últimas Transações:\n";
      recentTransactions.forEach(t => {
        financialContextText += `- ${formatDate(t.date)}: ${t.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${Number(t.amount).toFixed(2)} em \"${t.title}\" (Categoria: ${t.category})\n`;
      });
      financialContextText += "\n";
    } else {
      financialContextText += "Nenhuma transação recente encontrada.\n\n";
    }

    // Principais Categorias de Gastos (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: expensesLast30Days, error: expensesError } = await supabaseAdmin
      .from('transactions')
      .select('category, amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', thirtyDaysAgo.toISOString());

    if (expensesError) throw new Error(`Erro ao buscar despesas: ${expensesError.message}`);

    if (expensesLast30Days && expensesLast30Days.length > 0) {
      const spendingByCategory: { [key: string]: number } = {};
      expensesLast30Days.forEach(e => {
        spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + Number(e.amount);
      });
      const topCategories = Object.entries(spendingByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      if (topCategories.length > 0) {
        financialContextText += "Principais Categorias de Gastos (últimos 30 dias):\n";
        topCategories.forEach(([category, total]) => {
          financialContextText += `- ${category}: R$ ${total.toFixed(2)}\n`;
        });
        financialContextText += "\n";
      } else {
        financialContextText += "Nenhuma despesa encontrada nos últimos 30 dias para análise de categorias.\n\n";
      }
    } else {
        financialContextText += "Nenhuma despesa encontrada nos últimos 30 dias.\n\n";
    }

    // Contas a Pagar Próximas (não parceladas, próximas 3)
    const { data: upcomingBills, error: billsError } = await supabaseAdmin
      .from('bills')
      .select('title, amount, due_date, category')
      .eq('user_id', userId)
      .eq('is_paid', false)
      .gte('due_date', new Date().toISOString())
      .filter('total_installments', 'lte', 1) // Assumes 1 or null means not a multi-installment
      .order('due_date', { ascending: true })
      .limit(3);

    if (billsError) throw new Error(`Erro ao buscar contas a pagar: ${billsError.message}`);

    if (upcomingBills && upcomingBills.length > 0) {
      financialContextText += "Contas a Pagar Próximas (não parceladas):\n";
      upcomingBills.forEach(b => {
        financialContextText += `- \"${b.title}\": R$ ${Number(b.amount).toFixed(2)}, vence em ${formatDate(b.due_date)} (Categoria: ${b.category})\n`;
      });
      financialContextText += "\n";
    } else {
      financialContextText += "Nenhuma conta a pagar próxima (não parcelada) encontrada.\n\n";
    }

    // Parcelamentos Ativos (próximos 3 vencimentos)
    const { data: activeInstallments, error: installmentsError } = await supabaseAdmin
      .from('bills')
      .select('title, amount, due_date, category, current_installment, total_installments')
      .eq('user_id', userId)
      .eq('is_paid', false)
      .gte('due_date', new Date().toISOString())
      .gt('total_installments', 1)
      .order('due_date', { ascending: true })
      .limit(3);

    if (installmentsError) throw new Error(`Erro ao buscar parcelamentos: ${installmentsError.message}`);

    if (activeInstallments && activeInstallments.length > 0) {
      financialContextText += "Parcelamentos Ativos (próximos vencimentos):\n";
      activeInstallments.forEach(i => {
        financialContextText += `- \"${i.title}\": Parcela ${i.current_installment}/${i.total_installments} de R$ ${Number(i.amount).toFixed(2)}, vence em ${formatDate(i.due_date)} (Categoria: ${i.category})\n`;
      });
      financialContextText += "\n";
    } else {
      financialContextText += "Nenhum parcelamento ativo com vencimento próximo encontrado.\n\n";
    }

  } catch (e: any) {
    console.error('Erro ao buscar dados financeiros:', e);
    financialContextText += "Houve um problema ao buscar alguns dos seus dados financeiros. Os conselhos podem ser mais genéricos.\n\n";
  }

  // 3. Construção do Contexto para a API Gemini
  const systemInstructionForGemini = `Você é o Consultor IA do aplicativo de finanças pessoais ICTUS. Você está aqui para ajudar o usuário a entender melhor suas finanças e oferecer conselhos práticos, personalizados e acionáveis. Use os dados financeiros fornecidos sobre as transações, contas a pagar e o perfil do usuário para gerar suas recomendações. Seja amigável, objetivo, encorajador e evite linguagem excessivamente técnica. O nome do usuário é ${userName}.`;

  const finalUserPromptForGemini = `
Aqui estão alguns dos meus dados recentes para análise:
${financialContextText}
Considerando estes dados e minha pergunta original abaixo, como posso organizar melhor meus gastos, onde posso economizar e quais estratégias posso adotar para atingir meus objetivos financeiros?

Minha pergunta: "${originalPrompt}"
  `.trim();

  const geminiPayload = {
    contents: [{ 
      role: "user", 
      parts: [{text: systemInstructionForGemini + "\n\n" + finalUserPromptForGemini}] 
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 32,
      topP: 1,
      maxOutputTokens: 2048,
      // responseMimeType: "text/plain", // Para Gemini 1.5, se necessário
    }
  };

  const promptTokensForUsage = (systemInstructionForGemini + finalUserPromptForGemini).split(/\s+/).length;
  let outputText = '';

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error response:', errText);
      return res.status(response.status).json({ error: 'Gemini API error: ' + errText });
    }

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        outputText = data.candidates[0].content.parts[0].text;
    } else if (data.promptFeedback && data.promptFeedback.blockReason) {
        console.error('Gemini prompt blocked:', data.promptFeedback.blockReason, data.promptFeedback.safetyRatings);
        outputText = `Desculpe, sua solicitação não pôde ser processada devido a restrições de conteúdo (${data.promptFeedback.blockReason}). Por favor, reformule sua pergunta.`;
        return res.status(400).json({ error: 'Prompt bloqueado pela IA.', details: outputText, blockReason: data.promptFeedback.blockReason });
    } else {
        console.error('Gemini response format unexpected:', data);
        outputText = 'Desculpe, não consegui obter uma resposta da IA no momento.';
    }

    const outputTokensForUsage = outputText.split(/\s+/).length;

    const usage = await getAndUpdateUsage({ promptTokens: promptTokensForUsage, outputTokens: outputTokensForUsage });
    if (
      usage.monthTokens >= SOFT_MONTHLY_TOKEN_LIMIT ||
      usage.hourRequests >= SOFT_HOURLY_REQUEST_LIMIT ||
      usage.minuteRequests >= SOFT_MINUTE_REQUEST_LIMIT
    ) {
      console.warn("Limite da API Gemini próximo ou atingido:", usage);
    }
    return res.status(200).json({ resposta: outputText });

  } catch (e: any) {
    console.error('Erro ao acessar Gemini ou processar dados:', e);
    return res.status(500).json({ error: 'Erro interno no servidor: ' + e.message });
  }
}

export default handler;
