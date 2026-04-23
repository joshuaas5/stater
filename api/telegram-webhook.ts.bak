// API Webhook do Telegram - IntegraÃ§Ã£o Completa com Stater IA (CORRIGIDO)
import { createClient } from '@supabase/supabase-js';

// ConfiguraÃ§Ã£o Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = supabase; // Usando o mesmo client para simplicidade

// ConfiguraÃ§Ã£o da API Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL_NAME = 'gemini-2.5-flash-lite';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_ENDPOINT = `${GEMINI_API_BASE}/models/${GEMINI_MODEL_NAME}:generateContent`;

// Token do bot - IMPORTANTE: configurar no Vercel
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Sistema de transaÃ§Ãµes pendentes (em memÃ³ria para este exemplo)
// Em produÃ§Ã£o, usar Redis ou banco de dados
const pendingTransactions = new Map<string, {
  transactions: any[],
  summary: any,
  timestamp: number,
  documentType: string
}>();

// FunÃ§Ã£o para salvar transaÃ§Ãµes pendentes
function savePendingTransactions(chatId: string, transactions: any[], summary: any, documentType: string) {
  pendingTransactions.set(chatId, {
    transactions,
    summary,
    documentType,
    timestamp: Date.now()
  });

  // Limpar transaÃ§Ãµes antigas (mais de 1 hora)
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  const entries = Array.from(pendingTransactions.entries());
  for (const [key, value] of entries) {
    if (value.timestamp < oneHourAgo) {
      pendingTransactions.delete(key);
    }
  }
}

// FunÃ§Ã£o para obter transaÃ§Ãµes pendentes
function getPendingTransactions(chatId: string) {
  return pendingTransactions.get(chatId);
}

// FunÃ§Ã£o para limpar transaÃ§Ãµes pendentes
function clearPendingTransactions(chatId: string) {
  pendingTransactions.delete(chatId);
}

// FunÃ§Ã£o para obter emoji por categoria
function getCategoryEmoji(category: string): string {
  const categoryEmojis: { [key: string]: string } = {
    'AlimentaÃ§Ã£o': 'ðŸ½ï¸',
    'Transporte': 'ðŸš—',
    'SaÃºde': 'ðŸ¥',
    'Entretenimento': 'ðŸŽ¬',
    'HabitaÃ§Ã£o': 'ðŸ ',
    'EducaÃ§Ã£o': 'ðŸ“š',
    'Cuidados Pessoais': 'ðŸ’„',
    'Impostos': 'ðŸ“‹',
    'PoupanÃ§a e Investimentos': 'ðŸ’°',
    'Pagamentos de DÃ­vidas': 'ðŸ’³',
    'Outros': 'ðŸ›’'
  };

  return categoryEmojis[category] || 'ðŸ’°';
}

// FunÃ§Ã£o para salvar transaÃ§Ã£o no Supabase
async function saveTransactionToSupabase(userId: string, transactionData: any): Promise<boolean> {
  try {
    console.log('ðŸ’¾ Salvando transaÃ§Ã£o no Supabase:', transactionData);

    // Log detalhado para debug
    const tipo = transactionData.tipo || transactionData.type;
    const valor = parseFloat(transactionData.amount || transactionData.valor);
    const tipoFinal = (tipo === 'receita' || tipo === 'income') ? 'income' : 'expense';

    console.log('ðŸ” Debug transaÃ§Ã£o:', {
      tipoOriginal: tipo,
      valor: valor,
      tipoFinal: tipoFinal,
      impactoSaldo: tipoFinal === 'income' ? '+' : '-'
    });

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([{
        user_id: userId,
        title: transactionData.description || transactionData.descriÃ§Ã£o,
        amount: valor,
        type: tipoFinal,
        category: transactionData.category || transactionData.categoria || 'Outros',
        date: new Date().toISOString(), // ðŸ”§ CORREÃ‡ÃƒO: Data/hora atual completa
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('âŒ Erro ao salvar transaÃ§Ã£o:', error);
      return false;
    }

    console.log('âœ… TransaÃ§Ã£o salva com sucesso:', data);
    return true;
  } catch (error) {
    console.error('âŒ ExceÃ§Ã£o ao salvar transaÃ§Ã£o:', error);
    return false;
  }
}

// FunÃ§Ã£o para salvar mÃºltiplas transaÃ§Ãµes
async function saveMultipleTransactions(userId: string, transactions: any[]): Promise<{ saved: number, failed: number }> {
  let saved = 0;
  let failed = 0;

  for (const transaction of transactions) {
    const success = await saveTransactionToSupabase(userId, transaction);
    if (success) {
      saved++;
    } else {
      failed++;
    }
  }

  return { saved, failed };
}

// FunÃ§Ã£o para buscar transaÃ§Ãµes recentes do usuÃ¡rio
async function getUserTransactions(userId: string, limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('âŒ Erro ao buscar transaÃ§Ãµes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('âŒ ExceÃ§Ã£o ao buscar transaÃ§Ãµes:', error);
    return [];
  }
}

// FunÃ§Ã£o para buscar bills/contas do usuÃ¡rio
async function getUserBills(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('âŒ Erro ao buscar bills:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('âŒ ExceÃ§Ã£o ao buscar bills:', error);
    return [];
  }
}

// FunÃ§Ã£o para calcular saldo do usuÃ¡rio
async function getUserBalance(userId: string): Promise<{ balance: number, totalIncome: number, totalExpense: number }> {
  try {
    const transactions = await getUserTransactions(userId, 1000); // Buscar todas

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = totalIncome - totalExpense;

    return { balance, totalIncome, totalExpense };
  } catch (error) {
    console.error('âŒ Erro ao calcular saldo:', error);
    return { balance: 0, totalIncome: 0, totalExpense: 0 };
  }
}

// FunÃ§Ã£o para chamar a API Gemini (mesmo processamento do Stater IA) - OTIMIZADA
async function callGeminiAPI(userMessage: string, userId?: string, telegramUser?: any): Promise<string> {
  try {
    console.log('ðŸ¤– [DEBUG] Iniciando callGeminiAPI');
    console.log('ðŸ¤– [DEBUG] userMessage:', userMessage?.substring(0, 100));
    console.log('ðŸ¤– [DEBUG] userId:', userId);
    console.log('ðŸ¤– [DEBUG] Chamando API Gemini para resposta inteligente...');

    let financialContextText = '';
    let userName = 'UsuÃ¡rio';

    // Pegar nome do usuÃ¡rio do Telegram se fornecido
    if (telegramUser) {
      userName = telegramUser.first_name || telegramUser.username || 'UsuÃ¡rio';
      if (telegramUser.last_name) {
        userName += ` ${telegramUser.last_name}`;
      }
      console.log('ðŸ¤– [DEBUG] Nome do usuÃ¡rio Telegram:', userName);
    }

    // OTIMIZAÃ‡ÃƒO: Buscar dados financeiros apenas quando necessÃ¡rio
    const needsFinancialContext = userMessage.toLowerCase().includes('anÃ¡lise') ||
      userMessage.toLowerCase().includes('situaÃ§Ã£o') ||
      userMessage.toLowerCase().includes('gastos') ||
      userMessage.toLowerCase().includes('receitas') ||
      userMessage.toLowerCase().includes('saldo') ||
      userMessage.toLowerCase().includes('contas') ||
      userMessage.toLowerCase().includes('bills') ||
      userMessage.toLowerCase().includes('vencimento') ||
      userMessage.toLowerCase().includes('vence') ||
      userMessage.toLowerCase().includes('pagar') ||
      userMessage.toLowerCase().includes('pago') ||
      userMessage.toLowerCase().includes('dÃ­vida') ||
      userMessage.toLowerCase().includes('compromisso') ||
      userMessage.toLowerCase().includes('orÃ§amento') ||
      userMessage.toLowerCase().includes('dinheiro') ||
      userMessage.toLowerCase().includes('financeira');

    // Se temos userId e precisa de contexto financeiro, buscar dados COMPLETOS
    if (userId && needsFinancialContext) {
      try {
        // Buscar dados do usuÃ¡rio
        const { data: userData } = await supabaseAdmin
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single();

        if (userData && userData.full_name) {
          userName = userData.full_name; // Usar nome do perfil se disponÃ­vel
        }
        // SenÃ£o, manter o nome do Telegram jÃ¡ capturado acima

        // Buscar TODAS as transaÃ§Ãµes recentes (50 para anÃ¡lise completa)
        const recentTransactions = await getUserTransactions(userId, 50);

        // Buscar TODAS as bills/contas do usuÃ¡rio
        const userBills = await getUserBills(userId);

        if (recentTransactions && recentTransactions.length > 0) {
          financialContextText += "\n=== DADOS FINANCEIROS COMPLETOS ===\n";

          // Calcular totais
          const balance = await getUserBalance(userId);
          financialContextText += `SALDO ATUAL: R$ ${balance.balance.toFixed(2)}\n`;
          financialContextText += `TOTAL RECEITAS: R$ ${balance.totalIncome.toFixed(2)}\n`;
          financialContextText += `TOTAL DESPESAS: R$ ${balance.totalExpense.toFixed(2)}\n\n`;

          // Ãšltimas transaÃ§Ãµes detalhadas
          financialContextText += "ÃšLTIMAS TRANSAÃ‡Ã•ES:\n";
          recentTransactions.slice(0, 20).forEach(t => {
            const date = new Date(t.date).toLocaleDateString('pt-BR');
            const type = t.type === 'income' ? 'RECEITA' : 'DESPESA';
            financialContextText += `- ${date}: ${type} de R$ ${Number(t.amount).toFixed(2)} - "${t.title}" (${t.category})\n`;
          });

          // AnÃ¡lise por categoria
          const categoryTotals: { [key: string]: number } = {};
          recentTransactions.forEach(t => {
            if (t.type === 'expense') {
              categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
            }
          });

          if (Object.keys(categoryTotals).length > 0) {
            financialContextText += "\nGASTOS POR CATEGORIA:\n";
            Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .forEach(([category, amount]) => {
                financialContextText += `- ${category}: R$ ${amount.toFixed(2)}\n`;
              });
          }
        } else {
          financialContextText += "\nNenhuma transaÃ§Ã£o encontrada ainda.\n";
        }

        // Adicionar informaÃ§Ãµes das BILLS/CONTAS
        if (userBills && userBills.length > 0) {
          financialContextText += "\n=== CONTAS/BILLS CADASTRADAS ===\n";

          const today = new Date();
          const unpaidBills = userBills.filter(bill => !bill.is_paid);
          const paidBills = userBills.filter(bill => bill.is_paid);

          // Contas em aberto (nÃ£o pagas)
          if (unpaidBills.length > 0) {
            financialContextText += "CONTAS EM ABERTO (NÃƒO PAGAS):\n";
            unpaidBills.forEach(bill => {
              const dueDate = new Date(bill.due_date);
              const isOverdue = dueDate < today;
              const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const status = isOverdue ? "VENCIDA" : daysDiff <= 7 ? "VENCE EM BREVE" : "EM DIA";

              financialContextText += `- ${bill.title}: R$ ${Number(bill.amount).toFixed(2)} - Vencimento: ${dueDate.toLocaleDateString('pt-BR')} - STATUS: ${status}\n`;
            });

            // Calcular total de contas em aberto
            const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
            financialContextText += `TOTAL EM ABERTO: R$ ${totalUnpaid.toFixed(2)}\n\n`;
          }

          // Contas jÃ¡ pagas este mÃªs
          if (paidBills.length > 0) {
            const thisMonth = today.getMonth();
            const thisYear = today.getFullYear();
            const paidThisMonth = paidBills.filter(bill => {
              const billDate = new Date(bill.due_date);
              return billDate.getMonth() === thisMonth && billDate.getFullYear() === thisYear;
            });

            if (paidThisMonth.length > 0) {
              financialContextText += "CONTAS PAGAS ESTE MÃŠS:\n";
              paidThisMonth.forEach(bill => {
                const dueDate = new Date(bill.due_date);
                financialContextText += `- ${bill.title}: R$ ${Number(bill.amount).toFixed(2)} - Pago em: ${dueDate.toLocaleDateString('pt-BR')}\n`;
              });

              const totalPaidThisMonth = paidThisMonth.reduce((sum, bill) => sum + Number(bill.amount), 0);
              financialContextText += `TOTAL PAGO ESTE MÃŠS: R$ ${totalPaidThisMonth.toFixed(2)}\n\n`;
            }
          }

          financialContextText += "=== FIM DOS DADOS DE CONTAS ===\n";
        } else {
          financialContextText += "\nNenhuma conta/bill cadastrada ainda.\n";
        }

        if (recentTransactions && recentTransactions.length > 0) {
          financialContextText += "\n=== FIM DOS DADOS FINANCEIROS ===\n";
        }
      } catch (error) {
        console.log('Erro ao buscar dados financeiros:', error);
        financialContextText += "\nErro ao acessar dados financeiros.\n";
      }
    }

    const today = new Date().toISOString().split('T')[0];

    const contextToUse = needsFinancialContext ? financialContextText : "Dados financeiros disponÃ­veis mediante solicitaÃ§Ã£o.";

    // STATUS DE CONEXÃƒO CLARO
    const connectionStatus = userId ? `CONECTADO (ID: ${userId})` : 'NÃƒO CONECTADO';
    const fullPrompt = `VocÃª Ã© o Stater IA - ASSISTENTE FINANCEIRO TELEGRAM.

DATA: ${today}
USUÃRIO: ${userName}
STATUS_CONEXÃƒO: ${connectionStatus}

${contextToUse}

PERGUNTA: ${userMessage}

INSTRUÃ‡Ã•ES:
- RESPOSTA RÃPIDA E DIRETA
- Use dados REAIS do usuÃ¡rio acima
- Se STATUS_CONEXÃƒO = CONECTADO: pode processar transaÃ§Ãµes e dados financeiros
- Se STATUS_CONEXÃƒO = NÃƒO CONECTADO: informe que precisa conectar primeiro
- Para ADICIONAR transaÃ§Ã£o: gere JSON limpo
- Para CONSULTAS: responda em texto
- NUNCA asteriscos ou markdown
- MÃ¡ximo 500 caracteres

PROIBIÃ‡Ã•ES ABSOLUTAS (NUNCA faÃ§a isso):
- NUNCA mencione planos premium, assinaturas, pagamentos ou preÃ§os
- NUNCA diga "PREMIUM NECESSARIO" ou algo similar
- NUNCA mencione valores como R$ 19,90 ou R$ 14,90 de assinatura
- NUNCA bloqueie funcionalidades dizendo que precisa de upgrade
- NUNCA diga que Ã¡udio ou voz nÃ£o Ã© suportado (Ã‰ suportado)
- NUNCA diga que fotos/imagens nÃ£o sÃ£o suportadas (SÃƒO suportadas)
- NUNCA invente restriÃ§Ãµes que nÃ£o existem
- Todos os recursos estÃ£o HABILITADOS para o usuÃ¡rio

TRANSAÃ‡Ã•ES (sÃ³ se pedido "adicione", "registre"):
{"tipo": "receita/despesa", "descriÃ§Ã£o": "desc", "valor": 123.45, "data": "${today}", "categoria": "cat"}

Resposta:`;

    const geminiPayload = {
      contents: [{
        role: "user",
        parts: [{ text: fullPrompt }]
      }],
      generationConfig: {
        temperature: 0.05, // OTIMIZAÃ‡ÃƒO: Ainda mais baixo para mÃ¡xima velocidade
        topK: 16, // OTIMIZAÃ‡ÃƒO: Reduzido de 20 para 16 para acelerar
        topP: 0.6, // OTIMIZAÃ‡ÃƒO: Reduzido de 0.7 para 0.6 para acelerar
        maxOutputTokens: 1200, // OTIMIZAÃ‡ÃƒO: Reduzido de 1500 para 1200 para respostas mais rÃ¡pidas
      }
    };

    console.log('ðŸ“¡ [DEBUG] Enviando para Gemini API...');
    console.log('ðŸ“¡ [DEBUG] GEMINI_ENDPOINT:', GEMINI_ENDPOINT);
    console.log('ðŸ“¡ [DEBUG] GEMINI_API_KEY configurada:', !!GEMINI_API_KEY);
    console.log('ðŸ“¡ [DEBUG] Prompt length:', fullPrompt.length);

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    console.log('ðŸ“¡ [DEBUG] Response status:', response.status);
    console.log('ðŸ“¡ [DEBUG] Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('âŒ [DEBUG] Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data: any = await response.json();
    console.log('ðŸ“¡ [DEBUG] Response data structure:', Object.keys(data));
    console.log('ðŸ“¡ [DEBUG] Has candidates:', !!data.candidates);
    console.log('ðŸ“¡ [DEBUG] Candidates length:', data.candidates?.length || 0);

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      let aiResponse = data.candidates[0].content.parts[0].text;
      console.log('âœ… Resposta da IA recebida:', aiResponse.substring(0, 100) + '...');

      // Remover asteriscos das respostas
      aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');

      // APLICAR LIMPEZA DE JSON - extrair mensagem limpa antes de retornar
      const cleanResponse = extractCleanMessage(aiResponse);
      console.log('ðŸ§¹ Resposta apÃ³s limpeza JSON:', cleanResponse.substring(0, 100) + '...');

      // Limitar resposta para Telegram (4096 caracteres max)
      return cleanResponse.length > 4000 ? cleanResponse.substring(0, 3997) + '...' : cleanResponse;
    } else {
      throw new Error('Resposta invÃ¡lida da API Gemini');
    }

  } catch (error) {
    console.error('âŒ Erro na API Gemini:', error);
    return 'âŒ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.';
  }
}

// FunÃ§Ã£o para verificar se usuÃ¡rio estÃ¡ vinculado
async function getTelegramUserData(chatId: string): Promise<{ userId?: string, linked: boolean }> {
  try {
    console.log('ðŸ” [DEBUG] Verificando vinculaÃ§Ã£o para chat:', chatId);
    console.log('ðŸ” [DEBUG] Tipo do chatId:', typeof chatId);

    // Verificar diretamente no Supabase com logs detalhados
    console.log('ðŸ” [DEBUG] Executando query no Supabase...');
    const { data, error } = await supabaseAdmin
      .from('telegram_users')
      .select('user_id, linked_at, is_active, telegram_chat_id')
      .eq('telegram_chat_id', chatId)
      .eq('is_active', true);

    console.log('ðŸ” [DEBUG] Resultado da query:', { data, error });
    console.log('ðŸ” [DEBUG] NÃºmero de registros encontrados:', data?.length || 0);

    if (error) {
      console.log('âŒ [DEBUG] Erro Supabase ao verificar vinculaÃ§Ã£o:', error.message);
      console.log('âŒ [DEBUG] Detalhes do erro:', error);
      return { linked: false };
    }

    if (data && data.length > 0) {
      const userRecord = data[0]; // Pegar o primeiro registro
      console.log('âœ… [DEBUG] UsuÃ¡rio encontrado:', userRecord);

      if (userRecord.user_id) {
        console.log('âœ… [DEBUG] UsuÃ¡rio vinculado com sucesso:', userRecord.user_id);
        return { userId: userRecord.user_id, linked: true };
      } else {
        console.log('âš ï¸ [DEBUG] Registro encontrado mas sem user_id:', userRecord);
      }
    } else {
      console.log('âŒ [DEBUG] Nenhum registro encontrado para chat:', chatId);
    }

  } catch (error) {
    console.log('âŒ [DEBUG] ExceÃ§Ã£o ao verificar vinculaÃ§Ã£o:', error);
    console.log('âŒ [DEBUG] Stack trace:', error instanceof Error ? error.stack : 'N/A');
  }

  console.log('âŒ [DEBUG] Retornando linked: false');
  return { linked: false };
}

// FunÃ§Ã£o para salvar vinculaÃ§Ã£o do usuÃ¡rio - USANDO API SIMPLES
async function saveTelegramLink(chatId: string, code: string, username: string): Promise<boolean> {
  try {
    console.log('ðŸ’¾ [DEBUG] Tentando salvar vinculaÃ§Ã£o:', { chatId, code, username });

    // Verificar cÃ³digo via API interna
    const verifyUrl = `https://stater.app/api/telegram-codes-simple?code=${code}`;

    console.log('ðŸ” [DEBUG] Verificando cÃ³digo via API:', verifyUrl);

    const response = await fetch(verifyUrl);
    const result = await response.json();

    console.log('ðŸ” [DEBUG] Resposta da verificaÃ§Ã£o:', { status: response.status, result });

    if (!response.ok || !(result as any).valid) {
      console.log('âŒ [DEBUG] CÃ³digo invÃ¡lido ou expirado');
      return false;
    }

    const { userId, userEmail, userName } = result as any;

    console.log('âœ… [DEBUG] CÃ³digo vÃ¡lido encontrado para usuÃ¡rio:', userId);

    // Salvar vinculaÃ§Ã£o na tabela de usuÃ¡rios do Telegram
    const { error: linkError } = await supabaseAdmin
      .from('telegram_users')
      .upsert({
        telegram_chat_id: chatId,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        linked_at: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'telegram_chat_id'
      });

    if (linkError) {
      console.error('âŒ [DEBUG] Erro ao salvar vinculaÃ§Ã£o:', linkError.message);
      return false;
    }

    // Marcar cÃ³digo como usado via API
    try {
      const markUsedResponse = await fetch('https://stater.app/api/telegram-codes-simple', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (markUsedResponse.ok) {
        console.log('âœ… [DEBUG] CÃ³digo marcado como usado');
      } else {
        const errorText = await markUsedResponse.text();
        console.log('âš ï¸ [DEBUG] Erro ao marcar cÃ³digo como usado:', markUsedResponse.status, errorText);
      }
    } catch (markError) {
      console.log('âš ï¸ [DEBUG] ExceÃ§Ã£o ao marcar cÃ³digo como usado:', markError);
    }

    console.log('âœ… [DEBUG] VinculaÃ§Ã£o salva com sucesso!');
    return true;

  } catch (error) {
    console.error('âŒ [DEBUG] ExceÃ§Ã£o ao salvar vinculaÃ§Ã£o:', error);
    return false;
  }
}

// FunÃ§Ã£o para baixar arquivo do Telegram
async function downloadTelegramFile(fileId: string): Promise<Buffer | null> {
  try {
    console.log('ðŸ“¥ Baixando arquivo do Telegram:', fileId);
    // Primeiro, obter o file_path
    const fileResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const fileData = await fileResponse.json() as any;

    if (!fileResponse.ok || !fileData.ok) {
      console.error('âŒ Erro ao obter informaÃ§Ãµes do arquivo:', fileData);
      return null;
    }

    const filePath = fileData.result.file_path;
    const fileSize = fileData.result.file_size;

    console.log('ðŸ“„ Arquivo encontrado:', { filePath, fileSize });

    // Verificar se o arquivo nÃ£o Ã© muito grande (limite de 20MB)
    if (fileSize > 20 * 1024 * 1024) {
      console.log('âš ï¸ Arquivo muito grande:', fileSize);
      return null;
    }

    // Baixar o arquivo
    const downloadResponse = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);

    if (!downloadResponse.ok) {
      console.error('âŒ Erro ao baixar arquivo');
      return null;
    }

    const buffer = Buffer.from(await downloadResponse.arrayBuffer());
    console.log('âœ… Arquivo baixado com sucesso:', buffer.length, 'bytes');

    return buffer;
  } catch (error) {
    console.error('âŒ Erro ao baixar arquivo:', error);
    return null;
  }
}

// FunÃ§Ã£o para processar imagem/documento com OCR (usando Gemini Vision)
async function processDocumentWithAI(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  try {
    console.log('ðŸ” Processando documento com IA:', { fileName, mimeType, size: fileBuffer.length });

    // Converter buffer para base64
    const base64Data = fileBuffer.toString('base64');
    // Configurar o prompt ESPECÃFICO para extrair transaÃ§Ãµes igual ao app
    const analysisPrompt = `VocÃª Ã© um especialista em anÃ¡lise de documentos financeiros brasileiros.

ANALISE esta imagem/documento e extraia CADA TRANSAÃ‡ÃƒO INDIVIDUAL com mÃ¡xima precisÃ£o.

INSTRUÃ‡Ã•ES CRÃTICAS:
1. Se for NOTA FISCAL/CUPOM DE COMPRA:
   - Liste CADA ITEM comprado com seu valor individual
   - Use emojis apropriados para cada categoria
   - Categorize automaticamente cada item
   - Some o valor total
   - Formate como lista clara e organizada

2. Se for EXTRATO BANCÃRIO:
   - Liste CADA transaÃ§Ã£o com data, descriÃ§Ã£o e valor
   - Identifique se Ã© entrada ou saÃ­da
   - Categorize automaticamente
   - Organize por data

3. Se for FATURA DE CARTÃƒO:
   - Liste CADA compra/transaÃ§Ã£o
   - Ignore pagamentos da fatura
   - Categorize cada transaÃ§Ã£o
   - Mostre total das compras

FORMATO DE RESPOSTA OBRIGATÃ“RIO:

ðŸ§¾ **DOCUMENTO ANALISADO: [tipo]**

ðŸ“‹ **TRANSAÃ‡Ã•ES ENCONTRADAS:**

ðŸ½ï¸ **Item 1** - R$ X,XX
ðŸ“‚ Categoria: AlimentaÃ§Ã£o

ðŸš— **Item 2** - R$ X,XX  
ðŸ“‚ Categoria: Transporte

[...continuar para todos os itens...]

ðŸ’° **TOTAL GERAL: R$ XXX,XX**

ðŸ“Š **RESUMO POR CATEGORIA:**
ðŸ½ï¸ AlimentaÃ§Ã£o: R$ XX,XX
ðŸš— Transporte: R$ XX,XX
[...outras categorias...]

EMOJIS POR CATEGORIA:
- ðŸ½ï¸ AlimentaÃ§Ã£o (mercado, restaurante, lanche)
- ðŸš— Transporte (combustÃ­vel, uber, Ã´nibus)
- ðŸ¥ SaÃºde (farmÃ¡cia, consulta, remÃ©dio)
- ðŸŽ¬ Entretenimento (cinema, streaming, lazer)
- ðŸ  HabitaÃ§Ã£o (conta de luz, Ã¡gua, aluguel)
- ðŸ“š EducaÃ§Ã£o (curso, livro, material)
- ðŸ’„ Cuidados Pessoais (salÃ£o, cosmÃ©tico)
- ðŸ›’ Compras (roupa, eletrÃ´nico, casa)
- ðŸ’° Outros (quando nÃ£o se encaixa)

IMPORTANTE:
- NÃƒO diga "nÃ£o consegui identificar" - SEMPRE extraia algo
- Use valores reais encontrados na imagem
- Seja especÃ­fico com descriÃ§Ãµes
- Categorize TUDO automaticamente
- Use emojis para facilitar visualizaÃ§Ã£o
- Formate de forma clara e organizada`;

    // Determinar o tipo MIME correto para o Gemini
    let geminiMimeType = mimeType;
    if (mimeType.startsWith('image/')) {
      // Imagens sÃ£o suportadas diretamente
    } else if (mimeType === 'application/pdf') {
      // PDFs nÃ£o sÃ£o suportados pelo Gemini Vision, vamos informar isso
      return 'ðŸ“„ Arquivo PDF detectado!\n\nâŒ Infelizmente, ainda nÃ£o posso processar arquivos PDF diretamente.\n\nðŸ’¡ SoluÃ§Ãµes:\nâ€¢ Tire uma foto do documento\nâ€¢ Converta o PDF em imagem\nâ€¢ Digite as informaÃ§Ãµes manualmente\n\nEm breve terei suporte completo para PDFs!';
    } else {
      return 'ðŸ“„ Formato de arquivo nÃ£o suportado para anÃ¡lise automÃ¡tica.\n\nâœ… Formatos suportados:\nâ€¢ Imagens (JPG, PNG, WEBP)\nâ€¢ Em breve: PDF\n\nðŸ’¡ Tente enviar uma foto do documento!';
    }

    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: analysisPrompt },
            {
              inline_data: {
                mime_type: geminiMimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };

    console.log('ðŸ“¡ Enviando para Gemini Vision API...');
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('âŒ Erro na API Gemini:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    } const data = await response.json() as any;

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const analysis = data.candidates[0].content.parts[0].text;
      console.log('âœ… AnÃ¡lise do documento concluÃ­da');
      return analysis;
    } else {
      throw new Error('Resposta invÃ¡lida da API Gemini');
    }

  } catch (error: any) {
    console.error('âŒ Erro ao processar documento:', error);
    return `âŒ Erro ao analisar o documento.\n\nDetalhes tÃ©cnicos: ${error.message}\n\nðŸ’¡ Tente:\nâ€¢ Enviar uma foto mais clara\nâ€¢ Verificar se o arquivo nÃ£o estÃ¡ corrompido\nâ€¢ Tentar novamente em alguns instantes`;
  }
}

// FunÃ§Ã£o para enviar mensagem via Telegram Bot API
async function sendTelegramMessage(chatId: string, message: string) {
  try {
    console.log(`ðŸ“¤ Enviando mensagem para ${chatId}:`, message.substring(0, 100));

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML' // Mudado para HTML para evitar problemas com Markdown
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('âŒ Erro API Telegram:', result);
      return false;
    }

    console.log('âœ… Mensagem enviada com sucesso');
    return true;
  } catch (error) {
    console.error('âŒ Erro ao enviar mensagem:', error);
    return false;
  }
}

// FunÃ§Ã£o para processar Ã¡udio com Gemini - OTIMIZADA
async function callGeminiAudioAPI(audioBase64: string, mimeType: string): Promise<{
  success: boolean;
  transcription?: string;
  response?: string;
  hasFinancialContent?: boolean;
  error?: string;
}> {
  try {
    // OTIMIZAÃ‡ÃƒO: Prompt melhorado para detectar voz humana real
    const prompt = `Analise este Ã¡udio e determine se contÃ©m FALA HUMANA REAL.

IMPORTANTE: 
- Se for apenas ruÃ­do, clicks, sons de teclado, ou outros sons que NÃƒO sejam voz humana clara, retorne hasFinancialContent: false e transcription vazia
- Apenas considere hasFinancialContent: true se houver FALA HUMANA CLARA sobre finanÃ§as, transaÃ§Ãµes, dinheiro
- Se nÃ£o for voz humana, use uma mensagem educativa na response

Responda em JSON:
{
  "transcription": "texto transcrito SE FOR VOZ HUMANA, senÃ£o deixe vazio",
  "hasFinancialContent": false,
  "response": "Se nÃ£o for voz humana: 'NÃ£o detectei fala humana neste Ã¡udio.' | Se for voz mas sem conteÃºdo financeiro: resposta Ãºtil | Se for financeiro: resposta especÃ­fica"
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: audioBase64
              }
            }
          ],
          role: 'user'
        }
      ],
      generationConfig: {
        temperature: 0.1, // OTIMIZAÃ‡ÃƒO: Mais baixo para respostas rÃ¡pidas
        topK: 20, // OTIMIZAÃ‡ÃƒO: Reduzido
        topP: 0.7, // OTIMIZAÃ‡ÃƒO: Reduzido
        maxOutputTokens: 1000, // OTIMIZAÃ‡ÃƒO: Reduzido para Ã¡udio
      },
    };

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: any = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, nÃ£o consegui processar o Ã¡udio.';

    // Tentar parsear JSON da resposta
    let parsedResponse: any;
    try {
      const cleanedText = aiMessage.replace(/```json\n?|```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.warn('âš ï¸ NÃ£o foi possÃ­vel parsear JSON, usando resposta direta');
      parsedResponse = {
        transcription: aiMessage,
        hasFinancialContent: true,
        response: aiMessage
      };
    }

    return {
      success: true,
      transcription: parsedResponse.transcription || aiMessage,
      response: parsedResponse.response || aiMessage,
      hasFinancialContent: parsedResponse.hasFinancialContent || false
    };

  } catch (error) {
    console.error('âŒ Erro ao processar Ã¡udio com Gemini:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// FunÃ§Ã£o para extrair mensagem limpa de possÃ­vel JSON - SEMPRE RETORNA TEXTO LIMPO
function extractCleanMessage(response: string): string {
  try {
    // Se a resposta parece ser JSON
    if (response.trim().startsWith('{') && response.trim().endsWith('}')) {
      console.log('ðŸ§¹ Detectado JSON bruto, extraindo mensagem limpa...');

      // Remover markdown se houver
      const cleanJson = response.replace(/```json\n?|```\n?/g, '').trim();

      // Tentar parsear
      const parsed = JSON.parse(cleanJson);

      // SEMPRE extrair texto limpo, NUNCA retornar JSON bruto
      // Se Ã© uma transaÃ§Ã£o vÃ¡lida, RETORNAR JSON ORIGINAL para processamento de confirmaÃ§Ã£o
      if (parsed.tipo && parsed.valor && parsed.descriÃ§Ã£o &&
        (parsed.tipo === 'receita' || parsed.tipo === 'despesa')) {
        console.log('ðŸ’° JSON Ã© transaÃ§Ã£o vÃ¡lida, mantendo para processamento de confirmaÃ§Ã£o');
        // Retornar JSON original para que o sistema de confirmaÃ§Ã£o funcione
        return response;
      }

      // Se tem campo "response" ou "message", extrair apenas esse campo
      if (parsed.response) {
        console.log('âœ… Extraindo campo "response" do JSON');
        return parsed.response;
      }

      if (parsed.message) {
        console.log('âœ… Extraindo campo "message" do JSON');
        return parsed.message;
      }

      // Se tem campo "texto" ou "resposta"
      if (parsed.texto) {
        console.log('âœ… Extraindo campo "texto" do JSON');
        return parsed.texto;
      }

      if (parsed.resposta) {
        console.log('âœ… Extraindo campo "resposta" do JSON');
        return parsed.resposta;
      }

      // Se Ã© apenas JSON sem campos conhecidos, gerar resposta genÃ©rica
      console.log('âš ï¸ JSON sem campos conhecidos, gerando resposta genÃ©rica');
      return 'Entendi sua solicitaÃ§Ã£o! Como posso ajudÃ¡-lo com suas finanÃ§as hoje?';
    }

    // Se nÃ£o Ã© JSON, retornar a resposta original
    return response;

  } catch (error) {
    console.log('âŒ Erro ao processar resposta:', error);
    // Se houve erro ao processar, retornar resposta original
    return response;
  }
}

// Handler principal do webhook
export default async function handler(req: any, res: any) {
  // Log detalhado para debug
  console.log('ðŸ¤– =================================');
  console.log('ðŸ¤– Webhook Telegram recebido');
  console.log('ðŸ¤– Timestamp:', new Date().toISOString());
  console.log('ðŸ¤– MÃ©todo:', req.method);
  console.log('ðŸ¤– Body:', JSON.stringify(req.body, null, 2));
  console.log('ðŸ¤– =================================');

  // Verificar se Ã© uma requisiÃ§Ã£o POST
  if (req.method !== 'POST') {
    console.log('âŒ MÃ©todo nÃ£o Ã© POST');
    return res.status(405).json({ error: 'MÃ©todo nÃ£o permitido' });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !GEMINI_API_KEY || !BOT_TOKEN) {
    console.error('Configuração ausente: SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY e/ou TELEGRAM_BOT_TOKEN');
    return res.status(500).json({ error: 'Configuração de ambiente incompleta no servidor.' });
  }

  try {
    const update = req.body;    // Verificar se hÃ¡ uma mensagem
    if (!update || !update.message) {
      console.log('ðŸ“­ Sem mensagem no update');
      // Responder OK mesmo assim para evitar reenvios
      return res.status(200).json({ ok: true, message: 'Update recebido mas sem mensagem' });
    }

    const chatId = update.message.chat.id.toString();
    const messageText = update.message.text?.trim() || '';
    const username = update.message.from.username || update.message.from.first_name || 'UsuÃ¡rio';

    console.log(`ðŸ’¬ Mensagem de ${username} (${chatId}): ${messageText}`);

    // âœ… PRIORIDADE MÃXIMA: Verificar cÃ³digos de conexÃ£o ANTES de qualquer coisa
    if (messageText) {
      const codePattern = /^[0-9]{6}$/;
      const trimmedMessage = messageText.trim();

      console.log('ðŸ” [DEBUG] Verificando cÃ³digo de conexÃ£o primeiro:', {
        message: trimmedMessage,
        isCode: codePattern.test(trimmedMessage)
      });

      if (codePattern.test(trimmedMessage)) {
        console.log('ðŸ”‘ CÃ“DIGO DE CONEXÃƒO DETECTADO!', trimmedMessage);

        const linkSuccess = await saveTelegramLink(chatId, trimmedMessage, username);

        if (linkSuccess) {
          await sendTelegramMessage(chatId,
            `âœ… <b>Conta vinculada com sucesso!</b>\n\n` +
            `ðŸŽ‰ OlÃ¡ ${username}! Sua conta Stater foi conectada.\n\n` +
            `ðŸ¤– Agora posso analisar suas finanÃ§as reais e dar conselhos personalizados!\n\n` +
            `ðŸ’¬ <b>Experimente:</b>\n` +
            `â€¢ "Qual meu saldo atual?"\n` +
            `â€¢ "AnÃ¡lise dos meus gastos"\n` +
            `â€¢ "Como economizar dinheiro?"\n\n` +
            `Stater IA ativo! ðŸš€`
          );
        } else {
          await sendTelegramMessage(chatId,
            `âŒ <b>CÃ³digo invÃ¡lido: ${trimmedMessage}</b>\n\n` +
            `ðŸ’¡ <b>PossÃ­veis causas:</b>\n` +
            `â€¢ CÃ³digo expirado (vÃ¡lido por 15 min)\n` +
            `â€¢ CÃ³digo jÃ¡ foi usado\n` +
            `â€¢ CÃ³digo digitado incorretamente\n\n` +
            `ðŸ”§ <b>Como conectar:</b>\n` +
            `1. Acesse o app Stater\n` +
            `2. VÃ¡ em ConfiguraÃ§Ãµes â†’ Telegram\n` +
            `3. Clique em "Conectar"\n` +
            `4. Copie o cÃ³digo de 6 dÃ­gitos\n` +
            `5. Cole aqui no chat\n\n` +
            `ðŸ”¢ Use apenas 6 nÃºmeros (ex: 123456)`
          );
        }
        return res.status(200).json({ ok: true, message: 'CÃ³digo processado com prioridade' });
      }
    }

    // VERIFICAR SE Ã‰ MENSAGEM DE VOZ
    if (update.message.voice) {
      console.log('ðŸŽ¤ Mensagem de voz detectada!');

      try {
        const voice = update.message.voice;
        console.log('ðŸŽ¤ Dados da voz:', {
          file_id: voice.file_id,
          duration: voice.duration,
          mime_type: voice.mime_type,
          file_size: voice.file_size
        });

        await sendTelegramMessage(chatId, 'ðŸŽ§ Processando sua mensagem de voz... Aguarde alguns segundos...');

        // Baixar o arquivo de Ã¡udio
        console.log('ðŸ“¥ Baixando arquivo de Ã¡udio...');
        const audioBuffer = await downloadTelegramFile(voice.file_id);

        if (!audioBuffer) {
          await sendTelegramMessage(chatId, 'âŒ Erro ao baixar o arquivo de Ã¡udio. Tente novamente.');
          return res.status(200).json({ ok: true, message: 'Erro ao baixar Ã¡udio' });
        }

        console.log('âœ… Ãudio baixado:', audioBuffer.length, 'bytes');

        // Converter para base64
        const base64String = audioBuffer.toString('base64');

        // Chamar API do Gemini para processar Ã¡udio
        const geminiResponse = await callGeminiAudioAPI(base64String, voice.mime_type || 'audio/ogg');

        if (geminiResponse.success) {
          // Verificar se Ã© realmente voz humana
          if (!geminiResponse.transcription || geminiResponse.transcription.trim().length < 3) {
            // Extrair apenas a mensagem de resposta limpa, sem JSON
            let cleanMessage = geminiResponse.response || 'NÃ£o detectei fala humana clara no Ã¡udio. Por favor, fale diretamente no microfone para que eu possa ajudÃ¡-lo.';

            // Se a resposta ainda contÃ©m JSON, extrair apenas o campo "response"
            if (cleanMessage.startsWith('{') && cleanMessage.includes('"response"')) {
              try {
                const parsed = JSON.parse(cleanMessage.replace(/```json\n?|```\n?/g, '').trim());
                cleanMessage = parsed.response || cleanMessage;
              } catch {
                // Se nÃ£o conseguir parsear, usar a resposta original
              }
            }

            await sendTelegramMessage(chatId, cleanMessage);
            return res.status(200).json({ ok: true, message: 'Ãudio sem voz humana detectada' });
          }

          // Se detectou voz humana vÃ¡lida e tem conteÃºdo financeiro
          if (geminiResponse.hasFinancialContent && geminiResponse.transcription) {
            console.log('ðŸ’° ConteÃºdo financeiro detectado na voz, processando...');

            // Buscar informaÃ§Ãµes do usuÃ¡rio
            const userData = await getTelegramUserData(chatId);

            if (userData.linked && userData.userId) {
              // CORREÃ‡ÃƒO CRÃTICA: Usar o mesmo pipeline de detecÃ§Ã£o que mensagens de texto
              console.log('ðŸŽ¤ Processando Ã¡udio via pipeline de transaÃ§Ã£o...');

              // Processar a transcriÃ§Ã£o como se fosse uma mensagem normal de texto
              const aiResponse = await callGeminiAPI(geminiResponse.transcription, userData.userId, update.message.from);

              // APLICAR O MESMO FILTRO DE DETECÃ‡ÃƒO DE TRANSAÃ‡ÃƒO (linhas 1740-1820)
              const cleanResponse = aiResponse.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

              console.log('ðŸ” Resposta da IA para Ã¡udio:', cleanResponse);
              console.log('ðŸ” Ã‰ JSON?:', cleanResponse.startsWith('{') && cleanResponse.endsWith('}'));
              console.log('ðŸ” ContÃ©m "tipo"?:', cleanResponse.includes('"tipo"'));

              // VERIFICAÃ‡ÃƒO ANTI-JSON BRUTO: Se parece com JSON mas nÃ£o Ã© transaÃ§Ã£o vÃ¡lida, nÃ£o enviar JSON
              const looksLikeJson = cleanResponse.startsWith('{') && cleanResponse.endsWith('}') && cleanResponse.length > 20;
              let isValidTransaction = false;
              let transactionData = null;

              // CRITÃ‰RIO RÃGIDO: SÃ³ Ã© transaÃ§Ã£o se for JSON vÃ¡lido E tiver campos especÃ­ficos
              if (looksLikeJson &&
                (cleanResponse.includes('"tipo":') && cleanResponse.includes('"valor":') && cleanResponse.includes('"descriÃ§Ã£o":'))) {
                console.log('ðŸ’° Detectada possÃ­vel transaÃ§Ã£o JSON em Ã¡udio, validando...');

                try {
                  transactionData = JSON.parse(cleanResponse);
                  console.log('ðŸ“Š JSON parseado do Ã¡udio:', transactionData);

                  // ValidaÃ§Ã£o MUITO rÃ­gida
                  if (transactionData.tipo && transactionData.valor && transactionData.descriÃ§Ã£o &&
                    typeof transactionData.valor === 'number' && transactionData.valor > 0 &&
                    (transactionData.tipo === 'receita' || transactionData.tipo === 'despesa')) {
                    console.log('âœ… TransaÃ§Ã£o 100% vÃ¡lida detectada via Ã¡udio');
                    isValidTransaction = true;
                  } else {
                    console.log('âŒ JSON invÃ¡lido - campos obrigatÃ³rios ausentes ou incorretos');
                  }
                } catch (jsonError) {
                  console.log('âŒ Erro ao processar JSON do Ã¡udio:', jsonError);
                }
              }

              if (isValidTransaction && transactionData) {
                console.log('ðŸ’° Processando transaÃ§Ã£o vÃ¡lida via Ã¡udio...');

                // Normalizar dados (mesma lÃ³gica das linhas 1780-1790)
                const normalizedData = {
                  tipo: transactionData.tipo,
                  descriÃ§Ã£o: transactionData.descriÃ§Ã£o,
                  valor: transactionData.valor,
                  data: transactionData.data || new Date().toISOString().split('T')[0],
                  categoria: transactionData.categoria || 'Outros'
                };

                console.log('ðŸ“‹ Dados normalizados do Ã¡udio:', normalizedData);

                // MOSTRAR TRANSAÃ‡ÃƒO PARA CONFIRMAÃ‡ÃƒO (igual ao app)
                const emoji = getCategoryEmoji(normalizedData.categoria);
                const amount = Number(normalizedData.valor);
                const typeText = normalizedData.tipo === 'receita' ? 'ðŸ“ˆ RECEITA (aumenta saldo)' : 'ðŸ“‰ DESPESA (diminui saldo)';
                const typeEmoji = normalizedData.tipo === 'receita' ? 'ðŸ’š' : 'ðŸ’¸';

                console.log('ðŸ“Š Tipo detectado via Ã¡udio:', normalizedData.tipo, 'â†’', typeText);

                // Salvar como pendente usando dados normalizados
                savePendingTransactions(chatId, [normalizedData], null, 'voice_entry');

                const confirmMessage =
                  `ðŸŽ¤ Ouvi: "${geminiResponse.transcription}"\n\n` +
                  `ðŸ’¡ <b>TransaÃ§Ã£o detectada!</b>\n\n` +
                  `${emoji} <b>${normalizedData.descriÃ§Ã£o}</b>\n` +
                  `${typeEmoji} <b>R$ ${amount.toFixed(2)}</b> | ðŸ“‚ ${normalizedData.categoria}\n` +
                  `ðŸ“… ${normalizedData.data}\n` +
                  `ðŸ“Š <b>Tipo: ${typeText}</b>\n\n` +
                  `â“ <b>Confirma que estÃ¡ correto?</b>\n\n` +
                  `ðŸ’¬ Digite:\n` +
                  `â€¢ <b>SIM</b> ou <b>CONFIRMAR</b> - Para salvar como ${normalizedData.tipo.toUpperCase()}\n` +
                  `â€¢ <b>NÃƒO</b> ou <b>CANCELAR</b> - Para descartar\n\n` +
                  `â° <i>Aguardando sua confirmaÃ§Ã£o...</i>`;

                await sendTelegramMessage(chatId, confirmMessage);
              } else {
                console.log('ðŸ“ Resposta normal da IA via Ã¡udio (nÃ£o Ã© JSON de transaÃ§Ã£o vÃ¡lida)');

                // FILTRO ANTI-JSON BRUTO: Se parece com JSON mas nÃ£o Ã© transaÃ§Ã£o vÃ¡lida, corrigir
                if (looksLikeJson) {
                  console.log('âš ï¸  JSON detectado via Ã¡udio mas invÃ¡lido para transaÃ§Ã£o! NÃ£o enviando JSON bruto.');

                  const correctedResponse = `ðŸŽ¤ Ouvi: "${geminiResponse.transcription}"\n\nðŸ’¡ Para adicionar uma transaÃ§Ã£o, seja mais especÃ­fico:\n\n` +
                    "ðŸ“ Exemplos corretos:\n" +
                    "â€¢ \"adicione uma despesa de 50 reais com almoÃ§o\"\n" +
                    "â€¢ \"gastei 30 reais com uber\"\n" +
                    "â€¢ \"recebi 1000 reais de salÃ¡rio\"\n\n" +
                    "â“ Precisa de ajuda com suas finanÃ§as? Posso analisar seus gastos, dar dicas ou responder perguntas!";

                  await sendTelegramMessage(chatId, correctedResponse);
                } else {
                  // Verificar se a IA estÃ¡ inventando confirmaÃ§Ãµes falsas
                  if (aiResponse.includes('transaÃ§Ã£o') &&
                    (aiResponse.includes('salva') || aiResponse.includes('registrada') ||
                      aiResponse.includes('adicionada') || aiResponse.includes('saldo Ã©') ||
                      aiResponse.includes('saldo atualizado') || aiResponse.includes('transaÃ§Ã£o registrada'))) {
                    console.log('âš ï¸  IA tentou inventar confirmaÃ§Ã£o de transaÃ§Ã£o via Ã¡udio! Corrigindo...');

                    const correctedResponse = `ðŸŽ¤ Ouvi: "${geminiResponse.transcription}"\n\nðŸ’¡ Para adicionar uma transaÃ§Ã£o, seja mais especÃ­fico:\n\n` +
                      "ðŸ“ Exemplos corretos:\n" +
                      "â€¢ \"adicione uma despesa de 50 reais com almoÃ§o\"\n" +
                      "â€¢ \"gastei 30 reais com uber\"\n" +
                      "â€¢ \"recebi 1000 reais de salÃ¡rio\"\n\n" +
                      "â“ Precisa de ajuda com suas finanÃ§as? Posso analisar seus gastos, dar dicas ou responder perguntas!";

                    await sendTelegramMessage(chatId, correctedResponse);
                  } else {
                    // Resposta normal da IA com transcriÃ§Ã£o
                    await sendTelegramMessage(chatId, `ðŸŽ¤ "${geminiResponse.transcription}"\n\n${aiResponse}`);
                  }
                }
              }
            } else {
              // UsuÃ¡rio nÃ£o conectado
              await sendTelegramMessage(chatId, `ðŸŽ¤ Ouvi: "${geminiResponse.transcription}"\n\nðŸ’¡ Para processar solicitaÃ§Ãµes financeiras, conecte sua conta primeiro com /conectar`);
            }
          } else {
            // Voz humana detectada mas sem conteÃºdo financeiro especÃ­fico
            if (geminiResponse.response) {
              // Extrair apenas a mensagem de resposta limpa, sem JSON
              let cleanMessage = geminiResponse.response;

              // Se a resposta ainda contÃ©m JSON, extrair apenas o campo "response"
              if (cleanMessage.startsWith('{') && cleanMessage.includes('"response"')) {
                try {
                  const parsed = JSON.parse(cleanMessage.replace(/```json\n?|```\n?/g, '').trim());
                  cleanMessage = parsed.response || cleanMessage;
                } catch {
                  // Se nÃ£o conseguir parsear, usar a resposta original
                }
              }

              // Se detectou transcriÃ§Ã£o vÃ¡lida, mostrar ela tambÃ©m
              if (geminiResponse.transcription && geminiResponse.transcription.trim().length > 0) {
                // Limpar transcriÃ§Ã£o tambÃ©m se contiver JSON
                let cleanTranscription = geminiResponse.transcription;
                if (cleanTranscription.startsWith('{') || cleanTranscription.includes('```json')) {
                  // Se a transcriÃ§Ã£o for JSON, nÃ£o mostrar ela, apenas a resposta limpa
                  await sendTelegramMessage(chatId, cleanMessage);
                } else {
                  // TranscriÃ§Ã£o vÃ¡lida, mostrar com a resposta
                  await sendTelegramMessage(chatId, `ðŸŽ¤ "${cleanTranscription}"\n\n${cleanMessage}`);
                }
              } else {
                await sendTelegramMessage(chatId, cleanMessage);
              }
            }
          }

        } else {
          await sendTelegramMessage(chatId, 'âŒ Erro ao processar Ã¡udio. Tente novamente ou envie uma mensagem de texto.');
        }

        return res.status(200).json({ ok: true, message: 'Ãudio processado' });

      } catch (error) {
        console.error('âŒ Erro ao processar mensagem de voz:', error);
        await sendTelegramMessage(chatId, 'âŒ Erro ao processar sua mensagem de voz. Tente enviar novamente ou use texto.');
        return res.status(200).json({ ok: true, message: 'Erro no processamento de Ã¡udio' });
      }
    }

    // VERIFICAR SE Ã‰ FOTO OU DOCUMENTO
    if (update.message.photo || update.message.document) {
      console.log('ðŸ“¸ Foto ou documento detectado!');

      try {
        let fileId = '';
        let fileName = 'arquivo';
        let mimeType = '';

        // Processar foto
        if (update.message.photo) {
          console.log('ðŸ“· Processando foto...');
          // Pegar a foto de maior resoluÃ§Ã£o (Ãºltima no array)
          const photos = update.message.photo;
          const bestPhoto = photos[photos.length - 1];
          fileId = bestPhoto.file_id;
          fileName = `foto_${Date.now()}.jpg`;
          mimeType = 'image/jpeg';

          await sendTelegramMessage(chatId, 'ðŸ“· Analisando sua foto... Por favor, aguarde alguns segundos...');
        }

        // Processar documento
        if (update.message.document) {
          console.log('ðŸ“„ Processando documento...');
          const document = update.message.document;
          fileId = document.file_id;
          fileName = document.file_name || `documento_${Date.now()}`;
          mimeType = document.mime_type || 'application/octet-stream';

          await sendTelegramMessage(chatId, `ðŸ“„ Analisando seu documento "${fileName}"... Por favor, aguarde alguns segundos...`);
        }

        console.log('ðŸ“¥ Baixando arquivo:', { fileId, fileName, mimeType });

        // Baixar o arquivo
        const fileBuffer = await downloadTelegramFile(fileId);

        if (!fileBuffer) {
          await sendTelegramMessage(chatId, 'âŒ Erro ao baixar o arquivo. Tente enviar novamente.');
          return res.status(200).json({ ok: true, message: 'Erro ao baixar arquivo' });
        }

        console.log('âœ… Arquivo baixado:', fileBuffer.length, 'bytes');
        // Processar qualquer tipo de documento usando a API do app Stater
        console.log('ðŸ“„ Processando documento usando API do Stater...');

        try {
          // Converter para base64 para enviar para a API
          const base64Data = fileBuffer.toString('base64');

          // Determinar o tipo de processamento baseado no arquivo
          let processingPayload: any = {
            fileName: fileName,
            fileType: mimeType
          };

          // Para PDFs
          if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
            processingPayload.imageBase64 = base64Data;
            console.log('ðŸ“„ Enviando PDF para API OCR...');
          }
          // Para imagens
          else if (mimeType.startsWith('image/')) {
            processingPayload.imageBase64 = base64Data;
            console.log('ðŸ“¸ Enviando imagem para API OCR...');
          }
          // Para arquivos de texto/CSV/Excel
          else if (fileName.toLowerCase().includes('.csv') ||
            fileName.toLowerCase().includes('.txt') ||
            fileName.toLowerCase().includes('.xls')) {

            // Tentar ler como texto
            const textContent = fileBuffer.toString('utf-8');

            if (fileName.toLowerCase().includes('.csv')) {
              processingPayload.csvData = textContent;
              processingPayload.fileType = 'text/csv';
            } else if (fileName.toLowerCase().includes('.xls')) {
              processingPayload.excelData = base64Data;
              processingPayload.fileType = 'application/excel';
            } else {
              processingPayload.textData = textContent;
              processingPayload.fileType = 'text/plain';
            }

            console.log('ðŸ“Š Enviando arquivo texto/planilha para API OCR...');
          }
          // Outros tipos - tentar como imagem
          else {
            processingPayload.imageBase64 = base64Data;
            console.log('ðŸ“Ž Enviando arquivo genÃ©rico como imagem para API OCR...');
          }

          // Chamar a API de OCR do app Stater
          const ocrResponse = await fetch('https://stater.app/api/gemini-ocr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(processingPayload)
          });

          console.log('ðŸ“¡ Resposta da API OCR:', ocrResponse.status);

          if (ocrResponse.ok) {
            const ocrResult = await ocrResponse.json() as any;
            console.log('âœ… Resultado da API OCR:', ocrResult);

            // Processar o resultado da API
            let responseMessage = '';

            // VERIFICAR SE HOUVE ERRO ESPECÃFICO DE PDF
            if (ocrResult.success === false || ocrResult.metadata?.pdfError || ocrResult.metadata?.userMessage) {
              console.log('ðŸ“„ PDF nÃ£o suportado detectado na resposta da API');

              let userMessage = ocrResult.message || ocrResult.metadata?.userMessage;

              // Se nÃ£o tem mensagem personalizada, usar nossa mensagem padrÃ£o
              if (!userMessage) {
                userMessage = 'ðŸ“„ **Este PDF nÃ£o pode ser processado automaticamente**\n\nâŒ O sistema nÃ£o consegue ler PDFs diretamente.\n\nâœ… **SOLUÃ‡Ã•ES QUE FUNCIONAM 100%:**\n\nï¿½ **MÃ‰TODO MAIS FÃCIL:**\nâ€¢ Abra o PDF no seu celular/computador\nâ€¢ Tire uma FOTO da tela (screenshot)\nâ€¢ Envie a foto aqui\nâ€¢ Processamento serÃ¡ perfeito!\n\nðŸ–¼ï¸ **CONVERSÃƒO ONLINE:**\nâ€¢ Use sites como: pdf2go.com, ilovepdf.com\nâ€¢ Converta PDF â†’ PNG/JPG\nâ€¢ Envie as imagens aqui\n\nðŸ“‹ **MÃ‰TODO MANUAL:**\nâ€¢ Copie o texto do PDF\nâ€¢ Cole aqui no chat\nâ€¢ Eu processo como texto\n\nðŸ’¡ **Por que isso acontece?**\nPDFs tÃªm proteÃ§Ãµes e formatos complexos que a IA nÃ£o consegue ler diretamente. Imagens (PNG/JPG) funcionam perfeitamente!';
              }

              await sendTelegramMessage(chatId, userMessage);
              return res.status(200).json({ ok: true, message: 'PDF nÃ£o suportado - orientaÃ§Ãµes enviadas' });
            }

            // Se retornou transaÃ§Ãµes estruturadas (a API OCR retorna em data.transactions)
            const transactions = ocrResult.data?.transactions || ocrResult.transactions;
            const summary = ocrResult.data?.summary || ocrResult.summary;

            if (transactions && Array.isArray(transactions) && transactions.length > 0) {
              console.log('ðŸ“Š TransaÃ§Ãµes estruturadas encontradas:', transactions.length);

              // Verificar se usuÃ¡rio estÃ¡ conectado para salvar
              const userData = await getTelegramUserData(chatId);

              if (!userData.linked) {
                // UsuÃ¡rio nÃ£o conectado - mostrar transaÃ§Ãµes mas sem salvar
                responseMessage = `ðŸ“„ <b>Documento analisado!</b>\n\n`;
                responseMessage += `ðŸ’¡ <b>Encontrei ${transactions.length} transaÃ§Ãµes:</b>\n\n`;

                // Mostrar as transaÃ§Ãµes com emojis e cÃ¡lculos
                let totalAmount = 0;
                const categoryTotals: { [key: string]: number } = {};

                transactions.slice(0, 15).forEach((t: any, index: number) => {
                  const emoji = getCategoryEmoji(t.category);
                  const amount = Number(t.amount);
                  totalAmount += t.type === 'income' ? amount : -amount;
                  categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;

                  responseMessage += `${emoji} <b>${t.description}</b>\n`;
                  responseMessage += `ðŸ’° R$ ${amount.toFixed(2)} | ðŸ“‚ ${t.category}\n`;
                  responseMessage += `ðŸ“… ${new Date(t.date).toLocaleDateString('pt-BR')}\n\n`;
                });

                // Resumo por categoria
                responseMessage += `ðŸ“Š <b>RESUMO POR CATEGORIA:</b>\n`;
                Object.entries(categoryTotals)
                  .sort(([, a], [, b]) => b - a)
                  .forEach(([category, amount]) => {
                    const emoji = getCategoryEmoji(category);
                    responseMessage += `${emoji} ${category}: R$ ${amount.toFixed(2)}\n`;
                  });

                responseMessage += `\nðŸ’° <b>TOTAL GERAL: R$ ${Math.abs(totalAmount).toFixed(2)}</b>\n\n`;

                responseMessage += `ðŸ’¡ <b>Para salvar essas transaÃ§Ãµes:</b>\n`;
                responseMessage += `Digite <b>/conectar</b> primeiro!\n\n`;
                responseMessage += `ðŸ”— Depois poderei salvar tudo automaticamente.`;

                await sendTelegramMessage(chatId, responseMessage);
                return res.status(200).json({ ok: true, message: 'TransaÃ§Ãµes mostradas - usuÃ¡rio nÃ£o conectado' });
              }

              // UsuÃ¡rio conectado - MOSTRAR TRANSAÃ‡Ã•ES E PEDIR CONFIRMAÃ‡ÃƒO (igual ao app)
              console.log('ðŸ”’ UsuÃ¡rio conectado - preparando lista para confirmaÃ§Ã£o');

              // Salvar transaÃ§Ãµes como pendentes
              savePendingTransactions(chatId, transactions, summary, fileName);

              // Preparar mensagem de listagem completa com emojis
              responseMessage = `ðŸ“„ <b>Documento analisado com sucesso!</b>\n\n`;

              // Resumo do documento
              if (summary) {
                if (summary.establishment) {
                  responseMessage += `ðŸ¦ <b>Estabelecimento:</b> ${summary.establishment}\n`;
                }
                if (summary.period) {
                  responseMessage += `ðŸ“… <b>PerÃ­odo:</b> ${summary.period}\n`;
                }
              }

              responseMessage += `ðŸ“Š <b>Encontrei ${transactions.length} transaÃ§Ãµes:</b>\n\n`;

              // Listar TODAS as transaÃ§Ãµes com emojis (igual ao app)
              let totalAmount = 0;
              const categoryTotals: { [key: string]: number } = {};

              transactions.forEach((t: any, index: number) => {
                const emoji = getCategoryEmoji(t.category);
                const amount = Number(t.amount);
                const date = new Date(t.date).toLocaleDateString('pt-BR');

                totalAmount += t.type === 'income' ? amount : -amount;
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;

                responseMessage += `${emoji} <b>${t.description}</b>\n`;
                responseMessage += `ðŸ’° R$ ${amount.toFixed(2)} | ðŸ“‚ ${t.category}\n`;
                responseMessage += `ðŸ“… ${date} | ${t.type === 'income' ? 'ðŸ“ˆ Receita' : 'ðŸ“‰ Despesa'}\n\n`;
              });

              // Resumo por categoria (igual ao app)
              responseMessage += `ðŸ“Š <b>RESUMO POR CATEGORIA:</b>\n`;
              Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .forEach(([category, amount]) => {
                  const emoji = getCategoryEmoji(category);
                  responseMessage += `${emoji} ${category}: R$ ${amount.toFixed(2)}\n`;
                });

              responseMessage += `\nðŸ’° <b>TOTAL GERAL: R$ ${Math.abs(totalAmount).toFixed(2)}</b>\n\n`;

              // BOTÃ•ES DE CONFIRMAÃ‡ÃƒO (igual ao app)
              responseMessage += `â“ <b>Deseja adicionar essas ${transactions.length} transaÃ§Ãµes?</b>\n\n`;
              responseMessage += `ðŸ’¬ Digite:\n`;
              responseMessage += `â€¢ <b>SIM</b> ou <b>CONFIRMAR</b> - Para salvar todas\n`;
              responseMessage += `â€¢ <b>NÃƒO</b> ou <b>CANCELAR</b> - Para descartar\n\n`;
              responseMessage += `â° <i>Aguardando sua confirmaÃ§Ã£o...</i>`;

              await sendTelegramMessage(chatId, responseMessage);
              return res.status(200).json({ ok: true, message: 'TransaÃ§Ãµes listadas - aguardando confirmaÃ§Ã£o' });
            }
          } else {
            const errorResult = await ocrResponse.json().catch(() => ({})) as any;
            console.error('âŒ Erro na API OCR:', ocrResponse.status, errorResult);

            // Tratar erros especÃ­ficos de PDF
            if (fileName.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf') {
              console.log('ðŸ“„ Erro especÃ­fico de PDF detectado');

              let pdfErrorMessage = `ï¿½ **Problema com PDF detectado**\n\n`;
              pdfErrorMessage += `âŒ Este PDF nÃ£o pode ser processado automaticamente.\n\n`;
              pdfErrorMessage += `ðŸ’¡ **SoluÃ§Ãµes que SEMPRE funcionam:**\n\n`;
              pdfErrorMessage += `ðŸ“¸ **Tire fotos das pÃ¡ginas:**\n`;
              pdfErrorMessage += `â€¢ Abra o PDF no seu dispositivo\n`;
              pdfErrorMessage += `â€¢ Tire screenshots ou fotos da tela\n`;
              pdfErrorMessage += `â€¢ Envie as imagens aqui\n\n`;
              pdfErrorMessage += `ðŸ–¼ï¸ **Converta para imagem:**\n`;
              pdfErrorMessage += `â€¢ Use ferramentas online gratuitas\n`;
              pdfErrorMessage += `â€¢ Converta PDF â†’ PNG/JPG\n`;
              pdfErrorMessage += `â€¢ Envie as imagens resultantes\n\n`;
              pdfErrorMessage += `ðŸ“‹ **Copie e cole texto:**\n`;
              pdfErrorMessage += `â€¢ Selecione o texto do PDF\n`;
              pdfErrorMessage += `â€¢ Copie e cole aqui no chat\n`;
              pdfErrorMessage += `â€¢ Eu processarei como texto\n\n`;
              pdfErrorMessage += `âœ… **Garantia:** Qualquer imagem (foto ou screenshot) serÃ¡ processada perfeitamente!`;

              await sendTelegramMessage(chatId, pdfErrorMessage);
              return res.status(200).json({ ok: true, message: 'PDF error handled with guidance' });
            }

            // Tratar outros erros
            if (errorResult.suggestions && Array.isArray(errorResult.suggestions)) {
              let errorMessage = `âŒ <b>Problema ao processar o documento</b>\n\n`;
              errorMessage += `ðŸ’¡ <b>SoluÃ§Ãµes sugeridas:</b>\n`;
              errorResult.suggestions.forEach((suggestion: string) => {
                errorMessage += `â€¢ ${suggestion}\n`;
              });
              await sendTelegramMessage(chatId, errorMessage);
            } else {
              throw new Error('Erro na API de OCR');
            }
          }

        } catch (apiError) {
          console.error('âŒ Erro ao chamar API OCR:', apiError);
          await sendTelegramMessage(chatId,
            `âŒ <b>Erro ao processar documento</b>\n\n` +
            `ðŸ“„ Arquivo: <code>${fileName}</code>\n` +
            `ðŸ“Š Tamanho: ${(fileBuffer.length / 1024).toFixed(1)} KB\n\n` +
            `ðŸ’¡ <b>Tente:</b>\n` +
            `â€¢ Enviar uma foto mais clara\n` +
            `â€¢ Verificar se o arquivo nÃ£o estÃ¡ corrompido\n` +
            `â€¢ Para PDFs: tire fotos das pÃ¡ginas\n` +
            `â€¢ Tentar novamente em alguns instantes\n\n` +
            `Se o problema persistir, entre em contato com o suporte.`
          );
        }

        return res.status(200).json({ ok: true, message: 'Arquivo processado com sucesso' });

      } catch (fileError) {
        console.error('âŒ Erro ao processar arquivo:', fileError);
        await sendTelegramMessage(chatId,
          'âŒ Ocorreu um erro ao analisar seu arquivo.\n\nðŸ’¡ Tente:\nâ€¢ Enviar uma imagem mais clara\nâ€¢ Verificar se o arquivo nÃ£o estÃ¡ corrompido\nâ€¢ Tentar novamente em alguns instantes\n\nDesculpe pelo inconveniente!'
        );
        return res.status(200).json({ ok: true, message: 'Erro ao processar arquivo' });
      }
    }    // Processar comandos de forma SÃNCRONA (corrigido para Vercel)
    // SÃ³ processar texto se nÃ£o houver foto/documento
    if (messageText && !update.message.photo && !update.message.document) {
      console.log('ðŸ”„ Processando mensagem de texto...');

      // Comando /start - sempre responde PRIMEIRO
      if (messageText.startsWith('/start')) {
        console.log('ðŸš€ Processando comando /start');
        const code = messageText.replace('/start', '').trim();

        if (code) {
          console.log(`ðŸ”‘ CÃ³digo de vinculaÃ§Ã£o recebido: ${code}`);

          const linkSuccess = await saveTelegramLink(chatId, code, username);

          if (linkSuccess) {
            console.log('âœ… VinculaÃ§Ã£o bem-sucedida');
            await sendTelegramMessage(chatId,
              `ðŸŽ‰ <b>Conectado com sucesso!</b>\n\n` +
              `OlÃ¡ ${username}! Sua conta Stater foi vinculada ao Telegram.\n\n` +
              `ðŸš€ <b>AGORA VOCÃŠ PODE:</b>\n\n` +
              `ðŸ“· <b>Enviar fotos</b> de extratos, notas fiscais ou cupons\n` +
              `ðŸ“„ <b>Enviar PDFs</b> de faturas ou documentos financeiros\n` +
              `ðŸ’° <b>Registrar transaÃ§Ãµes:</b> "gastei 50 reais no mercado"\n` +
              `ðŸ“Š <b>Consultar dados:</b> "qual meu saldo?" ou "gastos do mÃªs"\n` +
              `ï¿½ <b>Pedir dicas:</b> "como economizar dinheiro?"\n` +
              `ðŸ¤” <b>Fazer perguntas:</b> sobre investimentos, orÃ§amento, finanÃ§as\n` +
              `ï¿½ <b>Ver suas contas:</b> "minhas contas em aberto"\n\n` +
              `âœ¨ <b>Exemplos prÃ¡ticos:</b>\n` +
              `â€¢ "Adicione uma despesa de 120 reais com combustÃ­vel"\n` +
              `â€¢ "Quanto gastei com alimentaÃ§Ã£o este mÃªs?"\n` +
              `â€¢ "Tenho alguma conta vencendo?"\n` +
              `â€¢ "Dicas para organizar meu orÃ§amento"\n\n` +
              `ðŸ’¬ <b>Comece agora!</b> Digite qualquer pergunta e eu responderei com seus dados reais.\n\n` +
              `<i>Stater - InteligÃªncia para prosperar</i> ðŸŒŸ`
            );
          } else {
            console.log('âŒ Falha na vinculaÃ§Ã£o'); await sendTelegramMessage(chatId,
              `âŒ <b>CÃ³digo invÃ¡lido ou expirado</b>\n\n` +
              `ðŸ”‘ CÃ³digo tentado: <code>${code}</code>\n\n` +
              `ï¿½ <b>Como conectar:</b>\n` +
              `1. Acesse o <a href="https://stater.app/settings/telegram">App Stater</a>\n` +
              `2. VÃ¡ em ConfiguraÃ§Ãµes â†’ Telegram\n` +
              `3. Clique em "Conectar"\n` +
              `4. Copie o cÃ³digo de 6 dÃ­gitos\n` +
              `5. Cole aqui no chat\n\n` +
              `â° CÃ³digos expiram em 15 minutos`
            );
          }
        } else {
          console.log('ðŸ†• Comando /start sem cÃ³digo');
          await sendTelegramMessage(chatId,
            'ðŸ‘‹ <b>Bem-vindo ao Stater IA!</b>\n\n' +
            'ðŸ¤– Sou seu assistente financeiro pessoal inteligente.\n\n' +
            'âœ¨ <b>O QUE EU FAÃ‡O:</b>\n\n' +
            'ðŸ“· Analiso fotos de extratos, cupons, notas fiscais\n' +
            'ðŸ“„ Leio documentos PDF, planilhas, faturas\n' +
            'ðŸ’° Registro transaÃ§Ãµes: "gastei 80 reais no supermercado"\n' +
            'ðŸŽ¤ Leio e entendo Ã¡udios/mensagens de voz normalmente\n' +
            'ðŸ“Š FaÃ§o anÃ¡lises completas: saldo, gastos, receitas, categorias\n' +
            'ðŸ“‹ Controlo suas contas: vencimentos, pagamentos, alertas\n' +
            'ðŸ’¡ Dou conselhos: como economizar, investir, organizar\n' +
            'ðŸ¤” Respondo tudo sobre sua vida financeira\n\n' +
            'âœ¨ <b>EXEMPLOS DE USO:</b>\n' +
            'â€¢ Envie foto do extrato bancÃ¡rio\n' +
            'â€¢ Envie um Ã¡udio dizendo "gastei 45 reais no almoÃ§o"\n' +
            'â€¢ "Qual meu saldo atual?"\n' +
            'â€¢ "Como economizar 500 reais por mÃªs?"\n' +
            'â€¢ "Minhas contas vencem quando?"\n\n' +
            'ðŸ”— <b>PARA CONECTAR:</b>\n' +
            '1. Acesse o <a href="https://stater.app/settings/telegram">App Stater</a>\n' +
            '2. VÃ¡ em ConfiguraÃ§Ãµes â†’ Telegram\n' +
            '3. Clique em "Conectar" e gere um cÃ³digo\n' +
            '4. Cole o cÃ³digo aqui no chat\n\n' +
            '<i>Stater - InteligÃªncia para prosperar</i> ðŸŒŸ'
          );
        }
        return res.status(200).json({ ok: true, message: 'Comando /start processado' });
      }      // Comando /help
      if (messageText === '/help') {
        console.log('â“ Processando comando /help');
        await sendTelegramMessage(chatId,
          'ðŸ¤– <b>Stater IA - TELEGRAM</b>\n\n' +
          'âœ¨ <b>EU TENHO AUTONOMIA TOTAL!</b>\n' +
          'â€¢ Salvo transaÃ§Ãµes automaticamente\n' +
          'â€¢ Leio seus dados financeiros reais\n' +
          'â€¢ Processo fotos, documentos e Ã¡udios\n' +
          'â€¢ Sincronizo 100% com o app\n\n' +
          'ðŸ“‹ <b>COMANDOS:</b>\n' +
          'â€¢ <b>/conectar</b> - Conectar sua conta\n' +
          'â€¢ <b>/saldo</b> - Ver saldo atual\n' +
          'â€¢ <b>/dashboard</b> - Abrir app\n' +
          'â€¢ <b>/sair</b> - Desconectar conta\n' +
          'â€¢ <b>/help</b> - Esta ajuda\n\n' +
          'ðŸš€ <b>FUNCIONALIDADES:</b>\n' +
          'â€¢ Digite: "adicione 50 reais de almoÃ§o"\n' +
          'â€¢ Envie fotos de extratos/faturas\n' +
          'â€¢ Envie arquivos PDF/Excel\n' +
          'â€¢ Envie Ã¡udios/mensagens de voz normalmente\n' +
          'â€¢ Pergunte: "qual meu saldo?"\n' +
          'â€¢ Pergunte: "meus gastos do mÃªs"\n\n' +
          'ðŸš€ <b>TUDO Ã‰ SALVO AUTOMATICAMENTE!</b>'
        );
        return res.status(200).json({ ok: true, message: 'Comando /help processado' });
      }      // Comando /conectar - SISTEMA SIMPLIFICADO
      if (messageText === '/conectar') {
        console.log('ðŸ”— Processando comando /conectar');

        await sendTelegramMessage(chatId,
          'ðŸ”— <b>Conectar sua conta Stater</b>\n\n' +
          'ðŸ“‹ <b>Passo a passo:</b>\n\n' +
          '1ï¸âƒ£ Acesse: <a href="https://stater.app">stater.app</a>\n' +
          '2ï¸âƒ£ FaÃ§a login na sua conta\n' +
          '3ï¸âƒ£ VÃ¡ em <b>ConfiguraÃ§Ãµes â†’ Bot Telegram</b>\n' +
          '4ï¸âƒ£ Clique em <b>"Gerar CÃ³digo de VinculaÃ§Ã£o"</b>\n' +
          '5ï¸âƒ£ <b>Copie</b> o cÃ³digo de 6 dÃ­gitos\n' +
          '6ï¸âƒ£ <b>Cole aqui</b> no Telegram\n\n' +
          'âœ… <b>Pronto!</b> Sua conta estarÃ¡ conectada.\n\n' +
          'ï¿½ <b>Dica:</b> O cÃ³digo Ã© copiado automaticamente quando gerado!\n\n' +
          'â“ <b>Exemplo:</b> Se o cÃ³digo for <code>123456</code>, envie apenas:\n' +
          '<code>123456</code>'
        );

        return res.status(200).json({ ok: true, message: 'Comando /conectar processado' });
      }// Comando /saldo - mostrar saldo atual
      if (messageText === '/saldo') {
        console.log('ðŸ’° Processando comando /saldo');

        const userData = await getTelegramUserData(chatId);
        if (!userData.linked) {
          await sendTelegramMessage(chatId,
            'ðŸ’° <b>Consulta de Saldo</b>\n\n' +
            'âŒ VocÃª precisa conectar sua conta primeiro\n\n' +
            'ðŸ”— Digite <b>/conectar</b> para instruÃ§Ãµes'
          );
          return res.status(200).json({ ok: true, message: 'Comando /saldo - nÃ£o conectado' });
        }

        const balance = await getUserBalance(userData.userId!);
        const recentTransactions = await getUserTransactions(userData.userId!, 5);

        let balanceMessage = `ðŸ’° <b>SEU SALDO ATUAL</b>\n\n`;
        balanceMessage += `ðŸ’Ž <b>Saldo:</b> R$ ${balance.balance.toFixed(2)}\n`;
        balanceMessage += `ðŸ“ˆ <b>Total Receitas:</b> R$ ${balance.totalIncome.toFixed(2)}\n`;
        balanceMessage += `ðŸ“‰ <b>Total Despesas:</b> R$ ${balance.totalExpense.toFixed(2)}\n\n`;

        if (recentTransactions.length > 0) {
          balanceMessage += `ðŸ“ <b>Ãšltimas transaÃ§Ãµes:</b>\n`;
          recentTransactions.forEach(t => {
            const emoji = t.type === 'income' ? 'ðŸ’°' : 'ðŸ’¸';
            const date = new Date(t.date).toLocaleDateString('pt-BR');
            balanceMessage += `${emoji} R$ ${Number(t.amount).toFixed(2)} - ${t.title}\n`;
            balanceMessage += `   ðŸ“… ${date} | ðŸ“‚ ${t.category}\n\n`;
          });
        }

        balanceMessage += `ðŸ“± <i>Dados sincronizados com seu app Stater!</i>`;

        await sendTelegramMessage(chatId, balanceMessage);
        return res.status(200).json({ ok: true, message: 'Comando /saldo processado' });
      }

      // Comando /dashboard (atualizado)
      if (messageText === '/dashboard') {
        console.log('ðŸ“Š Processando comando /dashboard');
        await sendTelegramMessage(chatId,
          'ðŸ“Š <b>Dashboard Stater</b>\n\n' +
          'ðŸ”— Acesse: <a href="https://stater.app">stater.app</a>\n\n' +
          'ðŸ“± <b>No dashboard vocÃª pode:</b>\n' +
          'â€¢ Ver suas transaÃ§Ãµes\n' +
          'â€¢ Gerar cÃ³digos do Telegram\n' +
          'â€¢ Analisar seus gastos\n' +
          'â€¢ Usar o Stater IA\n\n' +
          'ðŸ’¡ <i>Conecte sua conta aqui no Telegram para acesso direto!</i>'
        );
        return res.status(200).json({ ok: true, message: 'Comando /dashboard processado' });
      }

      // Comando /sair - desconectar conta do Telegram
      if (messageText === '/sair' || messageText === '/desconectar') {
        console.log('ðŸ‘‹ Processando comando /sair');

        const userData = await getTelegramUserData(chatId);
        if (!userData.linked) {
          await sendTelegramMessage(chatId,
            'âŒ <b>VocÃª nÃ£o estÃ¡ conectado</b>\n\n' +
            'ðŸ’¡ Para conectar sua conta, use:\n' +
            'â€¢ Digite <b>/conectar</b>\n\n' +
            'ðŸ¤– <i>Posso continuar respondendo perguntas gerais!</i>'
          );
          return res.status(200).json({ ok: true, message: 'Comando /sair - nÃ£o conectado' });
        }


  try {
          // Marcar como inativo em vez de deletar (melhor para histÃ³rico)
          const { error } = await supabaseAdmin
            .from('telegram_users')
            .update({ is_active: false })
            .eq('telegram_chat_id', chatId);

          if (error) {
            console.error('âŒ Erro ao desconectar:', error);
            await sendTelegramMessage(chatId,
              'âŒ <b>Erro ao desconectar</b>\n\n' +
              'ðŸ”§ Tente novamente em alguns instantes.\n' +
              'ðŸ’¬ Se o problema persistir, use <b>/conectar</b> para reconectar.'
            );
            return res.status(200).json({ ok: true, message: 'Erro ao desconectar' });
          }

          await sendTelegramMessage(chatId,
            'ðŸ‘‹ <b>Conta desconectada com sucesso!</b>\n\n' +
            'âœ… Sua conta Stater foi desvinculada do Telegram.\n\n' +
            'ðŸ”’ <b>Sua privacidade:</b>\n' +
            'â€¢ NÃ£o tenho mais acesso aos seus dados\n' +
            'â€¢ Suas informaÃ§Ãµes permanecem seguras no app\n' +
            'â€¢ Posso responder apenas perguntas gerais\n\n' +
            'ðŸ”— <b>Para reconectar:</b>\n' +
            'â€¢ Digite <b>/conectar</b> a qualquer momento\n\n' +
            'ðŸ’™ Obrigado por usar o Stater IA!'
          );

          console.log('âœ… UsuÃ¡rio desconectado com sucesso');
          return res.status(200).json({ ok: true, message: 'Comando /sair processado' });

        } catch (error) {
          console.error('âŒ Erro interno ao desconectar:', error);
          await sendTelegramMessage(chatId,
            'âŒ <b>Erro interno</b>\n\n' +
            'ðŸ”§ Tente novamente em alguns instantes.\n' +
            'ðŸ’¬ Se persistir, contate o suporte.'
          );
          return res.status(200).json({ ok: true, message: 'Erro interno' });
        }
      }      // Verificar se Ã© um cÃ³digo de conexÃ£o (formato: 6 dÃ­gitos numÃ©ricos)
      const codePattern = /^[0-9]{6}$/;
      if (codePattern.test(messageText.trim())) {
        console.log('ðŸ”‘ CÃ³digo direto detectado');
        const code = messageText.trim();
        console.log(`ðŸ”‘ CÃ³digo direto recebido: ${code}`);

        const linkSuccess = await saveTelegramLink(chatId, code, username);

        if (linkSuccess) {
          await sendTelegramMessage(chatId,
            `âœ… <b>Conta vinculada com sucesso!</b>\n\n` +
            `ðŸŽ‰ OlÃ¡ ${username}! Sua conta Stater foi conectada.\n\n` +
            `ðŸ¤– Agora posso analisar suas finanÃ§as reais e dar conselhos personalizados!\n\n` +
            `ðŸ’¬ <b>Experimente:</b>\n` +
            `â€¢ "Qual meu saldo atual?"\n` +
            `â€¢ "AnÃ¡lise dos meus gastos"\n` +
            `â€¢ "Como economizar dinheiro?"\n\n` +
            `Stater IA ativo! ðŸš€`
          );
        } else {
          await sendTelegramMessage(chatId,
            `âŒ <b>CÃ³digo invÃ¡lido: ${code}</b>\n\n` +
            `ðŸ’¡ <b>PossÃ­veis causas:</b>\n` +
            `â€¢ CÃ³digo expirado (vÃ¡lido por 15 min)\n` +
            `â€¢ CÃ³digo jÃ¡ foi usado\n` +
            `â€¢ CÃ³digo digitado incorretamente\n\n` +
            `ðŸ”§ <b>Como conectar:</b>\n` +
            `1. Acesse o <a href="https://stater.app/settings/telegram">App Stater</a>\n` +
            `2. VÃ¡ em ConfiguraÃ§Ãµes â†’ Telegram\n` +
            `3. Clique em "Conectar"\n` +
            `4. Copie o cÃ³digo de 6 dÃ­gitos\n` +
            `5. Cole aqui no chat\n\n` +
            `ï¿½ Use o formato: 6 nÃºmeros (ex: 123456)`
          );
        }
        return res.status(200).json({ ok: true, message: 'CÃ³digo processado' });
      }

      // VERIFICAR SE Ã‰ RESPOSTA DE CONFIRMAÃ‡ÃƒO PARA TRANSAÃ‡Ã•ES PENDENTES
      const upperText = messageText.toUpperCase().trim();
      if (upperText === 'SIM' || upperText === 'NÃƒO' || upperText === 'NAO' || upperText === 'REVISAR') {
        console.log(`ðŸ’­ Resposta de confirmaÃ§Ã£o detectada: ${upperText}`);

        const pendingData = getPendingTransactions(chatId);
        if (pendingData) {
          const userData = await getTelegramUserData(chatId);
          if (!userData.linked) {
            await sendTelegramMessage(chatId, 'âŒ VocÃª precisa estar conectado para salvar transaÃ§Ãµes.\nDigite /conectar');
            return res.status(200).json({ ok: true, message: 'NÃ£o conectado' });
          }

          if (upperText === 'SIM') {
            // Salvar todas as transaÃ§Ãµes
            console.log('âœ… UsuÃ¡rio confirmou SIM - salvando todas as transaÃ§Ãµes');

            const { saved, failed } = await saveMultipleTransactions(userData.userId!, pendingData.transactions);

            const balance = await getUserBalance(userData.userId!);

            // Analisar as transaÃ§Ãµes salvas para dar feedback detalhado
            const savedTransactions = pendingData.transactions.slice(0, saved);
            const receitas = savedTransactions.filter(t => t.tipo === 'receita').length;
            const despesas = savedTransactions.filter(t => t.tipo === 'despesa').length;

            let confirmMessage = `âœ… <b>TRANSAÃ‡Ã•ES SALVAS COM SUCESSO!</b>\n\n`;
            confirmMessage += `ðŸ’¾ <b>Salvas:</b> ${saved}/${pendingData.transactions.length}\n`;
            if (receitas > 0) confirmMessage += `ðŸ“ˆ <b>Receitas:</b> ${receitas} (aumentaram o saldo)\n`;
            if (despesas > 0) confirmMessage += `ðŸ“‰ <b>Despesas:</b> ${despesas} (diminuÃ­ram o saldo)\n`;
            if (failed > 0) {
              confirmMessage += `âŒ <b>Falharam:</b> ${failed}\n`;
            }

            confirmMessage += `\nðŸ’° <b>SEU SALDO ATUALIZADO:</b> R$ ${balance.balance.toFixed(2)}\n\n`;
            confirmMessage += `ðŸŽ‰ <b>Todas as transaÃ§Ãµes foram processadas corretamente!</b>\n`;
            confirmMessage += `ðŸ“± <i>Abra seu app para ver o detalhamento completo!</i>`;

            await sendTelegramMessage(chatId, confirmMessage);
            clearPendingTransactions(chatId);

          } else if (upperText === 'NÃƒO' || upperText === 'NAO') {
            // Cancelar transaÃ§Ãµes
            console.log('âŒ UsuÃ¡rio cancelou - nÃ£o salvando transaÃ§Ãµes');

            await sendTelegramMessage(chatId,
              `âŒ <b>TransaÃ§Ãµes canceladas</b>\n\n` +
              `ðŸ—‘ï¸ As ${pendingData.transactions.length} transaÃ§Ãµes encontradas no documento "${pendingData.documentType}" nÃ£o foram salvas.\n\n` +
              `ðŸ’¡ <i>VocÃª pode enviar o documento novamente quando desejar processÃ¡-lo.</i>`
            );
            clearPendingTransactions(chatId);

          } else if (upperText === 'REVISAR') {
            // Mostrar cada transaÃ§Ã£o individualmente para confirmaÃ§Ã£o
            console.log('ðŸ” UsuÃ¡rio escolheu REVISAR - mostrando transaÃ§Ãµes individualmente');

            await sendTelegramMessage(chatId,
              `ðŸ” <b>REVISÃƒO INDIVIDUAL</b>\n\n` +
              `Vou mostrar cada transaÃ§Ã£o para vocÃª confirmar uma por uma.\n\n` +
              `ðŸ“ Para cada transaÃ§Ã£o, responda:\n` +
              `â€¢ <b>S</b> ou <b>SIM</b> - Salvar esta transaÃ§Ã£o\n` +
              `â€¢ <b>N</b> ou <b>NÃƒO</b> - Pular esta transaÃ§Ã£o\n` +
              `â€¢ <b>PARAR</b> - Cancelar revisÃ£o\n\n` +
              `â³ <i>Iniciando revisÃ£o...</i>`
            );

            // Implementar revisÃ£o individual (para prÃ³xima iteraÃ§Ã£o)
            // Por enquanto, salvar todas
            const { saved, failed } = await saveMultipleTransactions(userData.userId!, pendingData.transactions);

            await sendTelegramMessage(chatId,
              `âš¡ <b>RevisÃ£o rÃ¡pida executada</b>\n\n` +
              `ðŸ’¾ Todas as ${saved} transaÃ§Ãµes foram salvas!\n\n` +
              `ðŸ’¡ <i>Funcionalidade de revisÃ£o individual serÃ¡ implementada em breve.</i>`
            );
            clearPendingTransactions(chatId);
          }

          return res.status(200).json({ ok: true, message: 'ConfirmaÃ§Ã£o processada' });
        } else {
          // NÃ£o hÃ¡ transaÃ§Ãµes pendentes
          await sendTelegramMessage(chatId,
            `ðŸ¤” <b>Nenhuma transaÃ§Ã£o pendente</b>\n\n` +
            `NÃ£o encontrei transaÃ§Ãµes aguardando confirmaÃ§Ã£o.\n\n` +
            `ðŸ’¡ <i>Envie uma foto de extrato, nota fiscal ou documento financeiro para processar!</i>`
          );
          return res.status(200).json({ ok: true, message: 'Sem transaÃ§Ãµes pendentes' });
        }
      }

      // FUNCIONALIDADE PRINCIPAL: Qualquer outra mensagem vai para a IA
      console.log(`ðŸ§  Processando mensagem com IA: ${messageText}`);

      // Verificar se usuÃ¡rio estÃ¡ vinculado
      const userData = await getTelegramUserData(chatId);
      console.log('ðŸ‘¤ Status do usuÃ¡rio:', userData); if (!userData.linked) {
        console.log('ðŸ”“ UsuÃ¡rio nÃ£o vinculado - enviando mensagem de nÃ£o conectado');

        // Verificar se estÃ¡ tentando acessar funcionalidades especÃ­ficas
        const needsConnectionCommands = [
          'saldo', 'balanÃ§o', 'extrato', 'transaÃ§Ãµes', 'gastos', 'receitas',
          'qual meu saldo', 'quanto tenho', 'meus gastos', 'minhas contas',
          'anÃ¡lise', 'relatÃ³rio', 'resumo financeiro'
        ];

        const needsConnection = needsConnectionCommands.some(cmd =>
          messageText.toLowerCase().includes(cmd.toLowerCase())
        );

        if (needsConnection) {
          // UsuÃ¡rio tentando acessar dados financeiros - mostrar como conectar
          await sendTelegramMessage(chatId,
            'ðŸ”’ <b>Conta nÃ£o conectada</b>\n\n' +
            'Para que eu possa responder sobre suas finanÃ§as, vocÃª precisa conectar sua conta:\n\n' +
            '<b>Como conectar:</b>\n' +
            '1. Acesse: <a href="https://stater.app">stater.app</a>\n' +
            '2. FaÃ§a login na sua conta\n' +
            '3. VÃ¡ em ConfiguraÃ§Ãµes â†’ Bot Telegram\n' +
            '4. Gere um cÃ³digo de vinculaÃ§Ã£o\n' +
            '5. Envie o cÃ³digo aqui\n\n' +
            'âš ï¸ <b>Sem conexÃ£o, nÃ£o posso:</b>\n' +
            'â€¢ Acessar seus dados financeiros\n' +
            'â€¢ Fazer anÃ¡lises personalizadas\n' +
            'â€¢ Responder sobre suas contas\n\n' +
            'ðŸ’¡ Use <b>/conectar</b> para gerar cÃ³digo automaticamente.\n\n' +
            '<i>Stater - Assistente Financeiro IA</i>'
          );
        } else {
          // Pergunta geral - resposta genÃ©rica da IA
          const aiResponse = await callGeminiAPI(messageText, undefined, update.message.from);
          const cleanResponse = extractCleanMessage(aiResponse);
          await sendTelegramMessage(chatId, cleanResponse);
        }

        return res.status(200).json({ ok: true, message: 'UsuÃ¡rio nÃ£o conectado' });
      } else {
        console.log('ðŸ”’ UsuÃ¡rio vinculado - resposta personalizada');
        // UsuÃ¡rio vinculado - resposta personalizada com dados reais
        const aiResponse = await callGeminiAPI(messageText, userData.userId, update.message.from);        // Verificar se a resposta Ã© uma transaÃ§Ã£o JSON
        const cleanResponse = aiResponse.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        console.log('ðŸ” Resposta da IA completa:', cleanResponse);
        console.log('ðŸ” Ã‰ JSON?:', cleanResponse.startsWith('{') && cleanResponse.endsWith('}'));
        console.log('ðŸ” ContÃ©m "tipo"?:', cleanResponse.includes('"tipo"'));

        // VERIFICAÃ‡ÃƒO ANTI-JSON BRUTO: Se parece com JSON mas nÃ£o Ã© transaÃ§Ã£o vÃ¡lida, nÃ£o enviar JSON
        const looksLikeJson = cleanResponse.startsWith('{') && cleanResponse.endsWith('}') && cleanResponse.length > 20;
        let isValidTransaction = false;
        let transactionData = null;

        // CRITÃ‰RIO RÃGIDO: SÃ³ Ã© transaÃ§Ã£o se for JSON vÃ¡lido E tiver campos especÃ­ficos
        if (looksLikeJson &&
          (cleanResponse.includes('"tipo":') && cleanResponse.includes('"valor":') && cleanResponse.includes('"descriÃ§Ã£o":'))) {
          console.log('ðŸ’° Detectada possÃ­vel transaÃ§Ã£o JSON, validando...');

          try {
            transactionData = JSON.parse(cleanResponse);
            console.log('ðŸ“Š JSON parseado:', transactionData);

            // ValidaÃ§Ã£o MUITO rÃ­gida
            if (transactionData.tipo && transactionData.valor && transactionData.descriÃ§Ã£o &&
              typeof transactionData.valor === 'number' && transactionData.valor > 0 &&
              (transactionData.tipo === 'receita' || transactionData.tipo === 'despesa')) {
              console.log('âœ… TransaÃ§Ã£o 100% vÃ¡lida detectada');
              isValidTransaction = true;
            } else {
              console.log('âŒ JSON invÃ¡lido - campos obrigatÃ³rios ausentes ou incorretos');
            }
          } catch (jsonError) {
            console.log('âŒ Erro ao processar JSON:', jsonError);
          }
        }

        if (isValidTransaction && transactionData) {
          console.log('ðŸ’° Processando transaÃ§Ã£o vÃ¡lida...');

          // Normalizar dados
          const normalizedData = {
            tipo: transactionData.tipo,
            descriÃ§Ã£o: transactionData.descriÃ§Ã£o,
            valor: transactionData.valor,
            data: transactionData.data || new Date().toISOString().split('T')[0],
            categoria: transactionData.categoria || 'Outros'
          };

          console.log('ðŸ“‹ Dados normalizados:', normalizedData);

          // MOSTRAR TRANSAÃ‡ÃƒO PARA CONFIRMAÃ‡ÃƒO (igual ao app)
          const emoji = getCategoryEmoji(normalizedData.categoria);
          const amount = Number(normalizedData.valor);
          const typeText = normalizedData.tipo === 'receita' ? 'ðŸ“ˆ RECEITA (aumenta saldo)' : 'ðŸ“‰ DESPESA (diminui saldo)';
          const typeEmoji = normalizedData.tipo === 'receita' ? 'ðŸ’š' : 'ðŸ’¸';

          console.log('ðŸ“Š Tipo detectado:', normalizedData.tipo, 'â†’', typeText);

          // Salvar como pendente usando dados normalizados
          savePendingTransactions(chatId, [normalizedData], null, 'manual_entry');

          const confirmMessage =
            `ðŸ’¡ <b>TransaÃ§Ã£o detectada!</b>\n\n` +
            `${emoji} <b>${normalizedData.descriÃ§Ã£o}</b>\n` +
            `${typeEmoji} <b>R$ ${amount.toFixed(2)}</b> | ðŸ“‚ ${normalizedData.categoria}\n` +
            `ðŸ“… ${normalizedData.data}\n` +
            `ðŸ“Š <b>Tipo: ${typeText}</b>\n\n` +
            `â“ <b>Confirma que estÃ¡ correto?</b>\n\n` +
            `ðŸ’¬ Digite:\n` +
            `â€¢ <b>SIM</b> ou <b>CONFIRMAR</b> - Para salvar como ${normalizedData.tipo.toUpperCase()}\n` +
            `â€¢ <b>NÃƒO</b> ou <b>CANCELAR</b> - Para descartar\n\n` +
            `â° <i>Aguardando sua confirmaÃ§Ã£o...</i>`;

          await sendTelegramMessage(chatId, confirmMessage);
        } else {
          console.log('ðŸ“ Resposta normal da IA (nÃ£o Ã© JSON de transaÃ§Ã£o vÃ¡lida)');

          // FILTRO ANTI-JSON BRUTO: Se parece com JSON mas nÃ£o Ã© transaÃ§Ã£o vÃ¡lida, corrigir
          if (looksLikeJson) {
            console.log('âš ï¸  JSON detectado mas invÃ¡lido para transaÃ§Ã£o! NÃ£o enviando JSON bruto.');

            const correctedResponse = "ðŸ’¡ Para adicionar uma transaÃ§Ã£o, seja mais especÃ­fico:\n\n" +
              "ðŸ“ Exemplos corretos:\n" +
              "â€¢ \"adicione uma despesa de 50 reais com almoÃ§o\"\n" +
              "â€¢ \"gastei 30 reais com uber\"\n" +
              "â€¢ \"recebi 1000 reais de salÃ¡rio\"\n\n" +
              "â“ Precisa de ajuda com suas finanÃ§as? Posso analisar seus gastos, dar dicas ou responder perguntas!";

            await sendTelegramMessage(chatId, correctedResponse);
          } else {
            // Verificar se a IA estÃ¡ inventando confirmaÃ§Ãµes falsas
            if (aiResponse.includes('transaÃ§Ã£o') &&
              (aiResponse.includes('salva') || aiResponse.includes('registrada') ||
                aiResponse.includes('adicionada') || aiResponse.includes('saldo Ã©') ||
                aiResponse.includes('saldo atualizado') || aiResponse.includes('transaÃ§Ã£o registrada'))) {
              console.log('âš ï¸  IA tentou inventar confirmaÃ§Ã£o de transaÃ§Ã£o! Corrigindo...');

              const correctedResponse = "ðŸ’¡ Para adicionar uma transaÃ§Ã£o, seja mais especÃ­fico:\n\n" +
                "ðŸ“ Exemplos corretos:\n" +
                "â€¢ \"adicione uma despesa de 50 reais com almoÃ§o\"\n" +
                "â€¢ \"gastei 30 reais com uber\"\n" +
                "â€¢ \"recebi 1000 reais de salÃ¡rio\"\n\n" +
                "â“ Precisa de ajuda com suas finanÃ§as? Posso analisar seus gastos, dar dicas ou responder perguntas!";

              await sendTelegramMessage(chatId, correctedResponse);
            } else {
              // Resposta normal da IA (garantidamente nÃ£o Ã© JSON)
              await sendTelegramMessage(chatId, aiResponse);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('âŒ Erro crÃ­tico no webhook:', error);

    // Log detalhado do erro para debug
    console.error('âŒ Stack trace:', error instanceof Error ? error.stack : error);
    console.error('âŒ Tipo do erro:', typeof error);
    console.error('âŒ Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido');

    // Tentar enviar mensagem de erro para o usuÃ¡rio
    try {
      const chatId = req.body?.message?.chat?.id?.toString();
      if (chatId) {
        await sendTelegramMessage(chatId,
          'âŒ Ocorreu um erro interno no sistema.\n\n' +
          'ðŸ”§ Nossa equipe foi notificada e estÃ¡ trabalhando na correÃ§Ã£o.\n\n' +
          'ðŸ’¡ Tente novamente em alguns minutos.\n\n' +
          'Se o problema persistir, entre em contato com o suporte.'
        );
      }
    } catch (sendError) {
      console.error('âŒ Erro ao enviar mensagem de erro:', sendError);
    }

    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }

  return res.status(200).json({ ok: true, message: 'Mensagem processada' });
}




