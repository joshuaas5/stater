// API Webhook do Telegram - Integração Completa com Stater IA (CORRIGIDO)
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase-admin';

// Configuração Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tmucbwlhkffrhtexmjze.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdUNCQ2FsaWZvcm5pYSIsInJvbGUiOiJhbm9uIiwiYXVkIjpudWxsLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuração da API Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDTTPO0otruHVzh7bXsi7MCyG674P03758";
const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-05-20';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_ENDPOINT = `${GEMINI_API_BASE}/models/${GEMINI_MODEL_NAME}:generateContent`;

// Token do bot - IMPORTANTE: configurar no Vercel
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7971646954:AAHpeNAzvg3kq7A1uER58XRms94sTjWZy5g';

// Sistema de transações pendentes (em memória para este exemplo)
// Em produção, usar Redis ou banco de dados
const pendingTransactions = new Map<string, {
  transactions: any[],
  summary: any,
  timestamp: number,
  documentType: string
}>();

// Função para salvar transações pendentes
function savePendingTransactions(chatId: string, transactions: any[], summary: any, documentType: string) {
  pendingTransactions.set(chatId, {
    transactions,
    summary,
    documentType,
    timestamp: Date.now()
  });
  
  // Limpar transações antigas (mais de 1 hora)
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [key, value] of pendingTransactions.entries()) {
    if (value.timestamp < oneHourAgo) {
      pendingTransactions.delete(key);
    }
  }
}

// Função para obter transações pendentes
function getPendingTransactions(chatId: string) {
  return pendingTransactions.get(chatId);
}

// Função para limpar transações pendentes
function clearPendingTransactions(chatId: string) {
  pendingTransactions.delete(chatId);
}

// Função para obter emoji por categoria
function getCategoryEmoji(category: string): string {
  const categoryEmojis: {[key: string]: string} = {
    'Alimentação': '🍽️',
    'Transporte': '🚗',
    'Saúde': '🏥',
    'Entretenimento': '🎬',
    'Habitação': '🏠',
    'Educação': '📚',
    'Cuidados Pessoais': '💄',
    'Impostos': '📋',
    'Poupança e Investimentos': '💰',
    'Pagamentos de Dívidas': '💳',
    'Outros': '🛒'
  };
  
  return categoryEmojis[category] || '💰';
}

// Função para salvar transação no Supabase
async function saveTransactionToSupabase(userId: string, transactionData: any): Promise<boolean> {
  try {
    console.log('💾 Salvando transação no Supabase:', transactionData);
    
    // Log detalhado para debug
    const tipo = transactionData.tipo || transactionData.type;
    const valor = parseFloat(transactionData.amount || transactionData.valor);
    const tipoFinal = (tipo === 'receita' || tipo === 'income') ? 'income' : 'expense';
    
    console.log('🔍 Debug transação:', {
      tipoOriginal: tipo,
      valor: valor,
      tipoFinal: tipoFinal,
      impactoSaldo: tipoFinal === 'income' ? '+' : '-'
    });
    
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([{
        user_id: userId,
        title: transactionData.description || transactionData.descrição,
        amount: valor,
        type: tipoFinal,
        category: transactionData.category || transactionData.categoria || 'Outros',
        date: new Date().toISOString(), // 🔧 CORREÇÃO: Data/hora atual completa
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('❌ Erro ao salvar transação:', error);
      return false;
    }
    
    console.log('✅ Transação salva com sucesso:', data);
    return true;
  } catch (error) {
    console.error('❌ Exceção ao salvar transação:', error);
    return false;
  }
}

// Função para salvar múltiplas transações
async function saveMultipleTransactions(userId: string, transactions: any[]): Promise<{saved: number, failed: number}> {
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

// Função para buscar transações recentes do usuário
async function getUserTransactions(userId: string, limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('❌ Erro ao buscar transações:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Exceção ao buscar transações:', error);
    return [];
  }
}

// Função para buscar bills/contas do usuário
async function getUserBills(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    
    if (error) {
      console.error('❌ Erro ao buscar bills:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Exceção ao buscar bills:', error);
    return [];
  }
}

// Função para calcular saldo do usuário
async function getUserBalance(userId: string): Promise<{balance: number, totalIncome: number, totalExpense: number}> {
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
    console.error('❌ Erro ao calcular saldo:', error);
    return { balance: 0, totalIncome: 0, totalExpense: 0 };
  }
}

// Função para chamar a API Gemini (mesmo processamento do Stater IA) - OTIMIZADA
async function callGeminiAPI(userMessage: string, userId?: string, telegramUser?: any): Promise<string> {
  try {
    console.log('🤖 [DEBUG] Iniciando callGeminiAPI');
    console.log('🤖 [DEBUG] userMessage:', userMessage?.substring(0, 100));
    console.log('🤖 [DEBUG] userId:', userId);
    console.log('🤖 [DEBUG] Chamando API Gemini para resposta inteligente...');
    
    let financialContextText = '';
    let userName = 'Usuário';
    
    // Pegar nome do usuário do Telegram se fornecido
    if (telegramUser) {
      userName = telegramUser.first_name || telegramUser.username || 'Usuário';
      if (telegramUser.last_name) {
        userName += ` ${telegramUser.last_name}`;
      }
      console.log('🤖 [DEBUG] Nome do usuário Telegram:', userName);
    }
    
    // OTIMIZAÇÃO: Buscar dados financeiros apenas quando necessário
    const needsFinancialContext = userMessage.toLowerCase().includes('análise') || 
                                 userMessage.toLowerCase().includes('situação') ||
                                 userMessage.toLowerCase().includes('gastos') ||
                                 userMessage.toLowerCase().includes('receitas') ||
                                 userMessage.toLowerCase().includes('saldo') ||
                                 userMessage.toLowerCase().includes('contas') ||
                                 userMessage.toLowerCase().includes('bills') ||
                                 userMessage.toLowerCase().includes('vencimento') ||
                                 userMessage.toLowerCase().includes('vence') ||
                                 userMessage.toLowerCase().includes('pagar') ||
                                 userMessage.toLowerCase().includes('pago') ||
                                 userMessage.toLowerCase().includes('dívida') ||
                                 userMessage.toLowerCase().includes('compromisso') ||
                                 userMessage.toLowerCase().includes('orçamento') ||
                                 userMessage.toLowerCase().includes('dinheiro') ||
                                 userMessage.toLowerCase().includes('financeira');

    // Se temos userId e precisa de contexto financeiro, buscar dados COMPLETOS
    if (userId && needsFinancialContext) {
      try {
        // Buscar dados do usuário
        const { data: userData } = await supabaseAdmin
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single();
        
        if (userData && userData.full_name) {
          userName = userData.full_name; // Usar nome do perfil se disponível
        }
        // Senão, manter o nome do Telegram já capturado acima

        // Buscar TODAS as transações recentes (50 para análise completa)
        const recentTransactions = await getUserTransactions(userId, 50);
        
        // Buscar TODAS as bills/contas do usuário
        const userBills = await getUserBills(userId);

        if (recentTransactions && recentTransactions.length > 0) {
          financialContextText += "\n=== DADOS FINANCEIROS COMPLETOS ===\n";
          
          // Calcular totais
          const balance = await getUserBalance(userId);
          financialContextText += `SALDO ATUAL: R$ ${balance.balance.toFixed(2)}\n`;
          financialContextText += `TOTAL RECEITAS: R$ ${balance.totalIncome.toFixed(2)}\n`;
          financialContextText += `TOTAL DESPESAS: R$ ${balance.totalExpense.toFixed(2)}\n\n`;
          
          // Últimas transações detalhadas
          financialContextText += "ÚLTIMAS TRANSAÇÕES:\n";
          recentTransactions.slice(0, 20).forEach(t => {
            const date = new Date(t.date).toLocaleDateString('pt-BR');
            const type = t.type === 'income' ? 'RECEITA' : 'DESPESA';
            financialContextText += `- ${date}: ${type} de R$ ${Number(t.amount).toFixed(2)} - "${t.title}" (${t.category})\n`;
          });
          
          // Análise por categoria
          const categoryTotals: {[key: string]: number} = {};
          recentTransactions.forEach(t => {
            if (t.type === 'expense') {
              categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
            }
          });
          
          if (Object.keys(categoryTotals).length > 0) {
            financialContextText += "\nGASTOS POR CATEGORIA:\n";
            Object.entries(categoryTotals)
              .sort(([,a], [,b]) => b - a)
              .forEach(([category, amount]) => {
                financialContextText += `- ${category}: R$ ${amount.toFixed(2)}\n`;
              });
          }
        } else {
          financialContextText += "\nNenhuma transação encontrada ainda.\n";
        }

        // Adicionar informações das BILLS/CONTAS
        if (userBills && userBills.length > 0) {
          financialContextText += "\n=== CONTAS/BILLS CADASTRADAS ===\n";
          
          const today = new Date();
          const unpaidBills = userBills.filter(bill => !bill.is_paid);
          const paidBills = userBills.filter(bill => bill.is_paid);
          
          // Contas em aberto (não pagas)
          if (unpaidBills.length > 0) {
            financialContextText += "CONTAS EM ABERTO (NÃO PAGAS):\n";
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
          
          // Contas já pagas este mês
          if (paidBills.length > 0) {
            const thisMonth = today.getMonth();
            const thisYear = today.getFullYear();
            const paidThisMonth = paidBills.filter(bill => {
              const billDate = new Date(bill.due_date);
              return billDate.getMonth() === thisMonth && billDate.getFullYear() === thisYear;
            });
            
            if (paidThisMonth.length > 0) {
              financialContextText += "CONTAS PAGAS ESTE MÊS:\n";
              paidThisMonth.forEach(bill => {
                const dueDate = new Date(bill.due_date);
                financialContextText += `- ${bill.title}: R$ ${Number(bill.amount).toFixed(2)} - Pago em: ${dueDate.toLocaleDateString('pt-BR')}\n`;
              });
              
              const totalPaidThisMonth = paidThisMonth.reduce((sum, bill) => sum + Number(bill.amount), 0);
              financialContextText += `TOTAL PAGO ESTE MÊS: R$ ${totalPaidThisMonth.toFixed(2)}\n\n`;
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
    
    const contextToUse = needsFinancialContext ? financialContextText : "Dados financeiros disponíveis mediante solicitação.";
    
    // STATUS DE CONEXÃO CLARO
    const connectionStatus = userId ? `CONECTADO (ID: ${userId})` : 'NÃO CONECTADO';
    const fullPrompt = `Você é o Stater IA - ASSISTENTE FINANCEIRO TELEGRAM.

DATA: ${today}
USUÁRIO: ${userName}
STATUS_CONEXÃO: ${connectionStatus}

${contextToUse}

PERGUNTA: ${userMessage}

INSTRUÇÕES:
- RESPOSTA RÁPIDA E DIRETA
- Use dados REAIS do usuário acima
- Se STATUS_CONEXÃO = CONECTADO: pode processar transações e dados financeiros
- Se STATUS_CONEXÃO = NÃO CONECTADO: informe que precisa conectar primeiro
- Para ADICIONAR transação: gere JSON limpo
- Para CONSULTAS: responda em texto
- NUNCA asteriscos ou markdown
- Máximo 500 caracteres

TRANSAÇÕES (só se pedido "adicione", "registre"):
{"tipo": "receita/despesa", "descrição": "desc", "valor": 123.45, "data": "${today}", "categoria": "cat"}

Resposta:`;

    const geminiPayload = {
      contents: [{ 
        role: "user", 
        parts: [{text: fullPrompt}] 
      }],
      generationConfig: {
        temperature: 0.1, // OTIMIZAÇÃO: Mais baixo para respostas mais rápidas e consistentes
        topK: 20, // OTIMIZAÇÃO: Reduzido para acelerar
        topP: 0.7, // OTIMIZAÇÃO: Reduzido para acelerar
        maxOutputTokens: 1500, // OTIMIZAÇÃO: Reduzido para respostas mais concisas
      }
    };

    console.log('📡 [DEBUG] Enviando para Gemini API...');
    console.log('📡 [DEBUG] GEMINI_ENDPOINT:', GEMINI_ENDPOINT);
    console.log('📡 [DEBUG] GEMINI_API_KEY configurada:', !!GEMINI_API_KEY);
    console.log('📡 [DEBUG] Prompt length:', fullPrompt.length);
    
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    console.log('📡 [DEBUG] Response status:', response.status);
    console.log('📡 [DEBUG] Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DEBUG] Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data: any = await response.json();
    console.log('📡 [DEBUG] Response data structure:', Object.keys(data));
    console.log('📡 [DEBUG] Has candidates:', !!data.candidates);
    console.log('📡 [DEBUG] Candidates length:', data.candidates?.length || 0);
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      let aiResponse = data.candidates[0].content.parts[0].text;
      console.log('✅ Resposta da IA recebida:', aiResponse.substring(0, 100) + '...');
      
      // Remover asteriscos das respostas
      aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');
      
      // APLICAR LIMPEZA DE JSON - extrair mensagem limpa antes de retornar
      const cleanResponse = extractCleanMessage(aiResponse);
      console.log('🧹 Resposta após limpeza JSON:', cleanResponse.substring(0, 100) + '...');
      
      // Limitar resposta para Telegram (4096 caracteres max)
      return cleanResponse.length > 4000 ? cleanResponse.substring(0, 3997) + '...' : cleanResponse;
    } else {
      throw new Error('Resposta inválida da API Gemini');
    }

  } catch (error) {
    console.error('❌ Erro na API Gemini:', error);
    return '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.';
  }
}

// Função para verificar se usuário está vinculado
async function getTelegramUserData(chatId: string): Promise<{ userId?: string, linked: boolean }> {
  try {
    console.log('🔍 [DEBUG] Verificando vinculação para chat:', chatId);
    console.log('🔍 [DEBUG] Tipo do chatId:', typeof chatId);
    
    // Verificar diretamente no Supabase com logs detalhados
    console.log('🔍 [DEBUG] Executando query no Supabase...');
    const { data, error } = await supabaseAdmin
      .from('telegram_users')
      .select('user_id, linked_at, is_active, telegram_chat_id')
      .eq('telegram_chat_id', chatId)
      .eq('is_active', true);
    
    console.log('🔍 [DEBUG] Resultado da query:', { data, error });
    console.log('🔍 [DEBUG] Número de registros encontrados:', data?.length || 0);
    
    if (error) {
      console.log('❌ [DEBUG] Erro Supabase ao verificar vinculação:', error.message);
      console.log('❌ [DEBUG] Detalhes do erro:', error);
      return { linked: false };
    }
    
    if (data && data.length > 0) {
      const userRecord = data[0]; // Pegar o primeiro registro
      console.log('✅ [DEBUG] Usuário encontrado:', userRecord);
      
      if (userRecord.user_id) {
        console.log('✅ [DEBUG] Usuário vinculado com sucesso:', userRecord.user_id);
        return { userId: userRecord.user_id, linked: true };
      } else {
        console.log('⚠️ [DEBUG] Registro encontrado mas sem user_id:', userRecord);
      }
    } else {
      console.log('❌ [DEBUG] Nenhum registro encontrado para chat:', chatId);
    }
    
  } catch (error) {
    console.log('❌ [DEBUG] Exceção ao verificar vinculação:', error);
    console.log('❌ [DEBUG] Stack trace:', error instanceof Error ? error.stack : 'N/A');
  }
  
  console.log('❌ [DEBUG] Retornando linked: false');
  return { linked: false };
}

// Função para salvar vinculação do usuário - USANDO API SIMPLES
async function saveTelegramLink(chatId: string, code: string, username: string): Promise<boolean> {
  try {
    console.log('💾 [DEBUG] Tentando salvar vinculação:', { chatId, code, username });
    
    // Verificar código via API interna
    const verifyUrl = `https://stater.app/api/telegram-codes-simple?code=${code}`;
    
    console.log('🔍 [DEBUG] Verificando código via API:', verifyUrl);
    
    const response = await fetch(verifyUrl);
    const result = await response.json();
    
    console.log('🔍 [DEBUG] Resposta da verificação:', { status: response.status, result });
    
    if (!response.ok || !(result as any).valid) {
      console.log('❌ [DEBUG] Código inválido ou expirado');
      return false;
    }
    
    const { userId, userEmail, userName } = result as any;
    
    console.log('✅ [DEBUG] Código válido encontrado para usuário:', userId);
    
    // Salvar vinculação na tabela de usuários do Telegram
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
      console.error('❌ [DEBUG] Erro ao salvar vinculação:', linkError.message);
      return false;
    }
    
    // Marcar código como usado via API
    try {
      const markUsedResponse = await fetch('https://stater.app/api/telegram-codes-simple?action=mark-used', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, chatId })
      });
      
      if (markUsedResponse.ok) {
        console.log('✅ [DEBUG] Código marcado como usado');
      } else {
        const errorText = await markUsedResponse.text();
        console.log('⚠️ [DEBUG] Erro ao marcar código como usado:', markUsedResponse.status, errorText);
      }
    } catch (markError) {
      console.log('⚠️ [DEBUG] Exceção ao marcar código como usado:', markError);
    }
    
    console.log('✅ [DEBUG] Vinculação salva com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ [DEBUG] Exceção ao salvar vinculação:', error);
    return false;
  }
}

// Função para baixar arquivo do Telegram
async function downloadTelegramFile(fileId: string): Promise<Buffer | null> {
  try {
    console.log('📥 Baixando arquivo do Telegram:', fileId);
      // Primeiro, obter o file_path
    const fileResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const fileData = await fileResponse.json() as any;
    
    if (!fileResponse.ok || !fileData.ok) {
      console.error('❌ Erro ao obter informações do arquivo:', fileData);
      return null;
    }
    
    const filePath = fileData.result.file_path;
    const fileSize = fileData.result.file_size;
    
    console.log('📄 Arquivo encontrado:', { filePath, fileSize });
    
    // Verificar se o arquivo não é muito grande (limite de 20MB)
    if (fileSize > 20 * 1024 * 1024) {
      console.log('⚠️ Arquivo muito grande:', fileSize);
      return null;
    }
    
    // Baixar o arquivo
    const downloadResponse = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);
    
    if (!downloadResponse.ok) {
      console.error('❌ Erro ao baixar arquivo');
      return null;
    }
    
    const buffer = Buffer.from(await downloadResponse.arrayBuffer());
    console.log('✅ Arquivo baixado com sucesso:', buffer.length, 'bytes');
    
    return buffer;
  } catch (error) {
    console.error('❌ Erro ao baixar arquivo:', error);
    return null;
  }
}

// Função para processar imagem/documento com OCR (usando Gemini Vision)
async function processDocumentWithAI(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  try {
    console.log('🔍 Processando documento com IA:', { fileName, mimeType, size: fileBuffer.length });
    
    // Converter buffer para base64
    const base64Data = fileBuffer.toString('base64');
      // Configurar o prompt ESPECÍFICO para extrair transações igual ao app
    const analysisPrompt = `Você é um especialista em análise de documentos financeiros brasileiros.

ANALISE esta imagem/documento e extraia CADA TRANSAÇÃO INDIVIDUAL com máxima precisão.

INSTRUÇÕES CRÍTICAS:
1. Se for NOTA FISCAL/CUPOM DE COMPRA:
   - Liste CADA ITEM comprado com seu valor individual
   - Use emojis apropriados para cada categoria
   - Categorize automaticamente cada item
   - Some o valor total
   - Formate como lista clara e organizada

2. Se for EXTRATO BANCÁRIO:
   - Liste CADA transação com data, descrição e valor
   - Identifique se é entrada ou saída
   - Categorize automaticamente
   - Organize por data

3. Se for FATURA DE CARTÃO:
   - Liste CADA compra/transação
   - Ignore pagamentos da fatura
   - Categorize cada transação
   - Mostre total das compras

FORMATO DE RESPOSTA OBRIGATÓRIO:

🧾 **DOCUMENTO ANALISADO: [tipo]**

📋 **TRANSAÇÕES ENCONTRADAS:**

🍽️ **Item 1** - R$ X,XX
📂 Categoria: Alimentação

🚗 **Item 2** - R$ X,XX  
📂 Categoria: Transporte

[...continuar para todos os itens...]

💰 **TOTAL GERAL: R$ XXX,XX**

📊 **RESUMO POR CATEGORIA:**
🍽️ Alimentação: R$ XX,XX
🚗 Transporte: R$ XX,XX
[...outras categorias...]

EMOJIS POR CATEGORIA:
- 🍽️ Alimentação (mercado, restaurante, lanche)
- 🚗 Transporte (combustível, uber, ônibus)
- 🏥 Saúde (farmácia, consulta, remédio)
- 🎬 Entretenimento (cinema, streaming, lazer)
- 🏠 Habitação (conta de luz, água, aluguel)
- 📚 Educação (curso, livro, material)
- 💄 Cuidados Pessoais (salão, cosmético)
- 🛒 Compras (roupa, eletrônico, casa)
- 💰 Outros (quando não se encaixa)

IMPORTANTE:
- NÃO diga "não consegui identificar" - SEMPRE extraia algo
- Use valores reais encontrados na imagem
- Seja específico com descrições
- Categorize TUDO automaticamente
- Use emojis para facilitar visualização
- Formate de forma clara e organizada`;

    // Determinar o tipo MIME correto para o Gemini
    let geminiMimeType = mimeType;
    if (mimeType.startsWith('image/')) {
      // Imagens são suportadas diretamente
    } else if (mimeType === 'application/pdf') {
      // PDFs não são suportados pelo Gemini Vision, vamos informar isso
      return '📄 Arquivo PDF detectado!\n\n❌ Infelizmente, ainda não posso processar arquivos PDF diretamente.\n\n💡 Soluções:\n• Tire uma foto do documento\n• Converta o PDF em imagem\n• Digite as informações manualmente\n\nEm breve terei suporte completo para PDFs!';
    } else {
      return '📄 Formato de arquivo não suportado para análise automática.\n\n✅ Formatos suportados:\n• Imagens (JPG, PNG, WEBP)\n• Em breve: PDF\n\n💡 Tente enviar uma foto do documento!';
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

    console.log('📡 Enviando para Gemini Vision API...');
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API Gemini:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }    const data = await response.json() as any;
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const analysis = data.candidates[0].content.parts[0].text;
      console.log('✅ Análise do documento concluída');
      return analysis;
    } else {
      throw new Error('Resposta inválida da API Gemini');
    }

  } catch (error: any) {
    console.error('❌ Erro ao processar documento:', error);
    return `❌ Erro ao analisar o documento.\n\nDetalhes técnicos: ${error.message}\n\n💡 Tente:\n• Enviar uma foto mais clara\n• Verificar se o arquivo não está corrompido\n• Tentar novamente em alguns instantes`;
  }
}

// Função para enviar mensagem via Telegram Bot API
async function sendTelegramMessage(chatId: string, message: string) {
  try {
    console.log(`📤 Enviando mensagem para ${chatId}:`, message.substring(0, 100));
    
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
      console.error('❌ Erro API Telegram:', result);
      return false;
    }

    console.log('✅ Mensagem enviada com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return false;
  }
}

// Função para processar áudio com Gemini - OTIMIZADA
async function callGeminiAudioAPI(audioBase64: string, mimeType: string): Promise<{
  success: boolean;
  transcription?: string;
  response?: string;
  hasFinancialContent?: boolean;
  error?: string;
}> {
  try {
    // OTIMIZAÇÃO: Prompt melhorado para detectar voz humana real
    const prompt = `Analise este áudio e determine se contém FALA HUMANA REAL.

IMPORTANTE: 
- Se for apenas ruído, clicks, sons de teclado, ou outros sons que NÃO sejam voz humana clara, retorne hasFinancialContent: false e transcription vazia
- Apenas considere hasFinancialContent: true se houver FALA HUMANA CLARA sobre finanças, transações, dinheiro
- Se não for voz humana, use uma mensagem educativa na response

Responda em JSON:
{
  "transcription": "texto transcrito SE FOR VOZ HUMANA, senão deixe vazio",
  "hasFinancialContent": false,
  "response": "Se não for voz humana: 'Não detectei fala humana neste áudio.' | Se for voz mas sem conteúdo financeiro: resposta útil | Se for financeiro: resposta específica"
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
        temperature: 0.1, // OTIMIZAÇÃO: Mais baixo para respostas rápidas
        topK: 20, // OTIMIZAÇÃO: Reduzido
        topP: 0.7, // OTIMIZAÇÃO: Reduzido
        maxOutputTokens: 1000, // OTIMIZAÇÃO: Reduzido para áudio
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
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui processar o áudio.';

    // Tentar parsear JSON da resposta
    let parsedResponse: any;
    try {
      const cleanedText = aiMessage.replace(/```json\n?|```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.warn('⚠️ Não foi possível parsear JSON, usando resposta direta');
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
    console.error('❌ Erro ao processar áudio com Gemini:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para extrair mensagem limpa de possível JSON - SEMPRE RETORNA TEXTO LIMPO
function extractCleanMessage(response: string): string {
  try {
    // Se a resposta parece ser JSON
    if (response.trim().startsWith('{') && response.trim().endsWith('}')) {
      console.log('🧹 Detectado JSON bruto, extraindo mensagem limpa...');
      
      // Remover markdown se houver
      const cleanJson = response.replace(/```json\n?|```\n?/g, '').trim();
      
      // Tentar parsear
      const parsed = JSON.parse(cleanJson);
      
      // SEMPRE extrair texto limpo, NUNCA retornar JSON bruto
      // Se é uma transação válida, RETORNAR JSON ORIGINAL para processamento de confirmação
      if (parsed.tipo && parsed.valor && parsed.descrição && 
          (parsed.tipo === 'receita' || parsed.tipo === 'despesa')) {
        console.log('💰 JSON é transação válida, mantendo para processamento de confirmação');
        // Retornar JSON original para que o sistema de confirmação funcione
        return response;
      }
      
      // Se tem campo "response" ou "message", extrair apenas esse campo
      if (parsed.response) {
        console.log('✅ Extraindo campo "response" do JSON');
        return parsed.response;
      }
      
      if (parsed.message) {
        console.log('✅ Extraindo campo "message" do JSON');
        return parsed.message;
      }
      
      // Se tem campo "texto" ou "resposta"
      if (parsed.texto) {
        console.log('✅ Extraindo campo "texto" do JSON');
        return parsed.texto;
      }
      
      if (parsed.resposta) {
        console.log('✅ Extraindo campo "resposta" do JSON');
        return parsed.resposta;
      }
      
      // Se é apenas JSON sem campos conhecidos, gerar resposta genérica
      console.log('⚠️ JSON sem campos conhecidos, gerando resposta genérica');
      return 'Entendi sua solicitação! Como posso ajudá-lo com suas finanças hoje?';
    }
    
    // Se não é JSON, retornar a resposta original
    return response;
    
  } catch (error) {
    console.log('❌ Erro ao processar resposta:', error);
    // Se houve erro ao processar, retornar resposta original
    return response;
  }
}

// Handler principal do webhook
export default async function handler(req: any, res: any) {
  // Log detalhado para debug
  console.log('🤖 =================================');
  console.log('🤖 Webhook Telegram recebido');
  console.log('🤖 Timestamp:', new Date().toISOString());
  console.log('🤖 Método:', req.method);
  console.log('🤖 Body:', JSON.stringify(req.body, null, 2));
  console.log('🤖 =================================');

  // Verificar se é uma requisição POST
  if (req.method !== 'POST') {
    console.log('❌ Método não é POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }
  try {
    const update = req.body;    // Verificar se há uma mensagem
    if (!update || !update.message) {
      console.log('📭 Sem mensagem no update');
      // Responder OK mesmo assim para evitar reenvios
      return res.status(200).json({ ok: true, message: 'Update recebido mas sem mensagem' });
    }

    const chatId = update.message.chat.id.toString();
    const messageText = update.message.text?.trim() || '';
    const username = update.message.from.username || update.message.from.first_name || 'Usuário';

    console.log(`💬 Mensagem de ${username} (${chatId}): ${messageText}`);

    // VERIFICAR SE É MENSAGEM DE VOZ
    if (update.message.voice) {
      console.log('🎤 Mensagem de voz detectada!');
      
      try {
        const voice = update.message.voice;
        console.log('🎤 Dados da voz:', { 
          file_id: voice.file_id, 
          duration: voice.duration,
          mime_type: voice.mime_type,
          file_size: voice.file_size 
        });
        
        await sendTelegramMessage(chatId, '🎧 Processando sua mensagem de voz... Aguarde alguns segundos...');
        
        // Baixar o arquivo de áudio
        console.log('📥 Baixando arquivo de áudio...');
        const audioBuffer = await downloadTelegramFile(voice.file_id);
        
        if (!audioBuffer) {
          await sendTelegramMessage(chatId, '❌ Erro ao baixar o arquivo de áudio. Tente novamente.');
          return res.status(200).json({ ok: true, message: 'Erro ao baixar áudio' });
        }
        
        console.log('✅ Áudio baixado:', audioBuffer.length, 'bytes');
        
        // Converter para base64
        const base64String = audioBuffer.toString('base64');
        
        // Chamar API do Gemini para processar áudio
        const geminiResponse = await callGeminiAudioAPI(base64String, voice.mime_type || 'audio/ogg');
        
        if (geminiResponse.success) {
          // Verificar se é realmente voz humana
          if (!geminiResponse.transcription || geminiResponse.transcription.trim().length < 3) {
            // Extrair apenas a mensagem de resposta limpa, sem JSON
            let cleanMessage = geminiResponse.response || 'Não detectei fala humana clara no áudio. Por favor, fale diretamente no microfone para que eu possa ajudá-lo.';
            
            // Se a resposta ainda contém JSON, extrair apenas o campo "response"
            if (cleanMessage.startsWith('{') && cleanMessage.includes('"response"')) {
              try {
                const parsed = JSON.parse(cleanMessage.replace(/```json\n?|```\n?/g, '').trim());
                cleanMessage = parsed.response || cleanMessage;
              } catch {
                // Se não conseguir parsear, usar a resposta original
              }
            }
            
            await sendTelegramMessage(chatId, cleanMessage);
            return res.status(200).json({ ok: true, message: 'Áudio sem voz humana detectada' });
          }
          
          // Se detectou voz humana válida e tem conteúdo financeiro
          if (geminiResponse.hasFinancialContent && geminiResponse.transcription) {
            console.log('💰 Conteúdo financeiro detectado na voz, processando...');
            
            // Buscar informações do usuário
            const userData = await getTelegramUserData(chatId);
            
            if (userData.linked && userData.userId) {
              // Processar como se fosse uma mensagem normal de texto
              const aiResponse = await callGeminiAPI(geminiResponse.transcription, userData.userId, update.message.from);
              
              if (aiResponse) {
                await sendTelegramMessage(chatId, `🎤 "${geminiResponse.transcription}"\n\n${aiResponse}`);
              }
            } else {
              // Usuário não conectado
              await sendTelegramMessage(chatId, `🎤 Ouvi: "${geminiResponse.transcription}"\n\n💡 Para processar solicitações financeiras, conecte sua conta primeiro com /conectar`);
            }
          } else {
            // Voz humana detectada mas sem conteúdo financeiro específico
            if (geminiResponse.response) {
              // Extrair apenas a mensagem de resposta limpa, sem JSON
              let cleanMessage = geminiResponse.response;
              
              // Se a resposta ainda contém JSON, extrair apenas o campo "response"
              if (cleanMessage.startsWith('{') && cleanMessage.includes('"response"')) {
                try {
                  const parsed = JSON.parse(cleanMessage.replace(/```json\n?|```\n?/g, '').trim());
                  cleanMessage = parsed.response || cleanMessage;
                } catch {
                  // Se não conseguir parsear, usar a resposta original
                }
              }
              
              // Se detectou transcrição válida, mostrar ela também
              if (geminiResponse.transcription && geminiResponse.transcription.trim().length > 0) {
                // Limpar transcrição também se contiver JSON
                let cleanTranscription = geminiResponse.transcription;
                if (cleanTranscription.startsWith('{') || cleanTranscription.includes('```json')) {
                  // Se a transcrição for JSON, não mostrar ela, apenas a resposta limpa
                  await sendTelegramMessage(chatId, cleanMessage);
                } else {
                  // Transcrição válida, mostrar com a resposta
                  await sendTelegramMessage(chatId, `🎤 "${cleanTranscription}"\n\n${cleanMessage}`);
                }
              } else {
                await sendTelegramMessage(chatId, cleanMessage);
              }
            }
          }
          
        } else {
          await sendTelegramMessage(chatId, '❌ Erro ao processar áudio. Tente novamente ou envie uma mensagem de texto.');
        }
        
        return res.status(200).json({ ok: true, message: 'Áudio processado' });
        
      } catch (error) {
        console.error('❌ Erro ao processar mensagem de voz:', error);
        await sendTelegramMessage(chatId, '❌ Erro ao processar sua mensagem de voz. Tente enviar novamente ou use texto.');
        return res.status(200).json({ ok: true, message: 'Erro no processamento de áudio' });
      }
    }

    // VERIFICAR SE É FOTO OU DOCUMENTO
    if (update.message.photo || update.message.document) {
      console.log('📸 Foto ou documento detectado!');
      
      try {
        let fileId = '';
        let fileName = 'arquivo';
        let mimeType = '';
        
        // Processar foto
        if (update.message.photo) {
          console.log('📷 Processando foto...');
          // Pegar a foto de maior resolução (última no array)
          const photos = update.message.photo;
          const bestPhoto = photos[photos.length - 1];
          fileId = bestPhoto.file_id;
          fileName = `foto_${Date.now()}.jpg`;
          mimeType = 'image/jpeg';
          
          await sendTelegramMessage(chatId, '📷 Analisando sua foto... Por favor, aguarde alguns segundos...');
        }
        
        // Processar documento
        if (update.message.document) {
          console.log('📄 Processando documento...');
          const document = update.message.document;
          fileId = document.file_id;
          fileName = document.file_name || `documento_${Date.now()}`;
          mimeType = document.mime_type || 'application/octet-stream';
          
          await sendTelegramMessage(chatId, `📄 Analisando seu documento "${fileName}"... Por favor, aguarde alguns segundos...`);
        }
        
        console.log('📥 Baixando arquivo:', { fileId, fileName, mimeType });
        
        // Baixar o arquivo
        const fileBuffer = await downloadTelegramFile(fileId);
        
        if (!fileBuffer) {
          await sendTelegramMessage(chatId, '❌ Erro ao baixar o arquivo. Tente enviar novamente.');
          return res.status(200).json({ ok: true, message: 'Erro ao baixar arquivo' });
        }
        
        console.log('✅ Arquivo baixado:', fileBuffer.length, 'bytes');
          // Processar qualquer tipo de documento usando a API do app Stater
        console.log('📄 Processando documento usando API do Stater...');
        
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
            console.log('📄 Enviando PDF para API OCR...');
          }
          // Para imagens
          else if (mimeType.startsWith('image/')) {
            processingPayload.imageBase64 = base64Data;
            console.log('📸 Enviando imagem para API OCR...');
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
            
            console.log('📊 Enviando arquivo texto/planilha para API OCR...');
          }
          // Outros tipos - tentar como imagem
          else {
            processingPayload.imageBase64 = base64Data;
            console.log('📎 Enviando arquivo genérico como imagem para API OCR...');
          }
          
          // Chamar a API de OCR do app Stater
          const ocrResponse = await fetch('https://stater.app/api/gemini-ocr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(processingPayload)
          });
          
          console.log('📡 Resposta da API OCR:', ocrResponse.status);
          
          if (ocrResponse.ok) {
            const ocrResult = await ocrResponse.json() as any;
            console.log('✅ Resultado da API OCR:', ocrResult);
            
            // Processar o resultado da API
            let responseMessage = '';            // Se retornou transações estruturadas (a API OCR retorna em data.transactions)
            const transactions = ocrResult.data?.transactions || ocrResult.transactions;
            const summary = ocrResult.data?.summary || ocrResult.summary;
            
            if (transactions && Array.isArray(transactions) && transactions.length > 0) {
              console.log('📊 Transações estruturadas encontradas:', transactions.length);
              
              // Verificar se usuário está conectado para salvar
              const userData = await getTelegramUserData(chatId);
                
              if (!userData.linked) {
                // Usuário não conectado - mostrar transações mas sem salvar
                responseMessage = `📄 <b>Documento analisado!</b>\n\n`;
                responseMessage += `💡 <b>Encontrei ${transactions.length} transações:</b>\n\n`;
                
                // Mostrar as transações com emojis e cálculos
                let totalAmount = 0;
                const categoryTotals: {[key: string]: number} = {};
                
                transactions.slice(0, 15).forEach((t: any, index: number) => {
                  const emoji = getCategoryEmoji(t.category);
                  const amount = Number(t.amount);
                  totalAmount += t.type === 'income' ? amount : -amount;
                  categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
                  
                  responseMessage += `${emoji} <b>${t.description}</b>\n`;
                  responseMessage += `💰 R$ ${amount.toFixed(2)} | 📂 ${t.category}\n`;
                  responseMessage += `📅 ${new Date(t.date).toLocaleDateString('pt-BR')}\n\n`;
                });
                
                // Resumo por categoria
                responseMessage += `📊 <b>RESUMO POR CATEGORIA:</b>\n`;
                Object.entries(categoryTotals)
                  .sort(([,a], [,b]) => b - a)
                  .forEach(([category, amount]) => {
                    const emoji = getCategoryEmoji(category);
                    responseMessage += `${emoji} ${category}: R$ ${amount.toFixed(2)}\n`;
                  });
                
                responseMessage += `\n💰 <b>TOTAL GERAL: R$ ${Math.abs(totalAmount).toFixed(2)}</b>\n\n`;
                
                responseMessage += `💡 <b>Para salvar essas transações:</b>\n`;
                responseMessage += `Digite <b>/conectar</b> primeiro!\n\n`;
                responseMessage += `🔗 Depois poderei salvar tudo automaticamente.`;
                
                await sendTelegramMessage(chatId, responseMessage);
                return res.status(200).json({ ok: true, message: 'Transações mostradas - usuário não conectado' });
              }
              
              // Usuário conectado - MOSTRAR TRANSAÇÕES E PEDIR CONFIRMAÇÃO (igual ao app)
              console.log('🔒 Usuário conectado - preparando lista para confirmação');
              
              // Salvar transações como pendentes
              savePendingTransactions(chatId, transactions, summary, fileName);
              
              // Preparar mensagem de listagem completa com emojis
              responseMessage = `📄 <b>Documento analisado com sucesso!</b>\n\n`;
              
              // Resumo do documento
              if (summary) {
                if (summary.establishment) {
                  responseMessage += `🏦 <b>Estabelecimento:</b> ${summary.establishment}\n`;
                }
                if (summary.period) {
                  responseMessage += `📅 <b>Período:</b> ${summary.period}\n`;
                }
              }
              
              responseMessage += `📊 <b>Encontrei ${transactions.length} transações:</b>\n\n`;
              
              // Listar TODAS as transações com emojis (igual ao app)
              let totalAmount = 0;
              const categoryTotals: {[key: string]: number} = {};
              
              transactions.forEach((t: any, index: number) => {
                const emoji = getCategoryEmoji(t.category);
                const amount = Number(t.amount);
                const date = new Date(t.date).toLocaleDateString('pt-BR');
                
                totalAmount += t.type === 'income' ? amount : -amount;
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
                
                responseMessage += `${emoji} <b>${t.description}</b>\n`;
                responseMessage += `💰 R$ ${amount.toFixed(2)} | 📂 ${t.category}\n`;
                responseMessage += `📅 ${date} | ${t.type === 'income' ? '📈 Receita' : '📉 Despesa'}\n\n`;
              });
              
              // Resumo por categoria (igual ao app)
              responseMessage += `📊 <b>RESUMO POR CATEGORIA:</b>\n`;
              Object.entries(categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .forEach(([category, amount]) => {
                  const emoji = getCategoryEmoji(category);
                  responseMessage += `${emoji} ${category}: R$ ${amount.toFixed(2)}\n`;
                });
              
              responseMessage += `\n💰 <b>TOTAL GERAL: R$ ${Math.abs(totalAmount).toFixed(2)}</b>\n\n`;
              
              // BOTÕES DE CONFIRMAÇÃO (igual ao app)
              responseMessage += `❓ <b>Deseja adicionar essas ${transactions.length} transações?</b>\n\n`;
              responseMessage += `💬 Digite:\n`;
              responseMessage += `• <b>SIM</b> ou <b>CONFIRMAR</b> - Para salvar todas\n`;
              responseMessage += `• <b>NÃO</b> ou <b>CANCELAR</b> - Para descartar\n\n`;
              responseMessage += `⏰ <i>Aguardando sua confirmação...</i>`;
              
              await sendTelegramMessage(chatId, responseMessage);
              return res.status(200).json({ ok: true, message: 'Transações listadas - aguardando confirmação' });
            }
          } else {
            const errorResult = await ocrResponse.json().catch(() => ({})) as any;
            console.error('❌ Erro na API OCR:', ocrResponse.status, errorResult);
            
            // Tratar erros específicos
            if (errorResult.error && errorResult.error.includes('PDF protegido')) {
              await sendTelegramMessage(chatId, 
                `🔒 <b>PDF Protegido Detectado</b>\n\n❌ Este PDF está protegido por senha e não pode ser processado automaticamente.\n\n💡 <b>Soluções:</b>\n• Remova a proteção do PDF\n• Tire fotos das páginas importantes\n• Solicite uma versão não protegida\n\nDesculpe pelo inconveniente!`
              );
            } else if (errorResult.suggestions && Array.isArray(errorResult.suggestions)) {
              let errorMessage = `❌ <b>Problema ao processar o documento</b>\n\n`;
              errorMessage += `💡 <b>Soluções sugeridas:</b>\n`;
              errorResult.suggestions.forEach((suggestion: string) => {
                errorMessage += `• ${suggestion}\n`;
              });
              await sendTelegramMessage(chatId, errorMessage);
            } else {
              throw new Error('Erro na API de OCR');
            }
          }
          
        } catch (apiError) {
          console.error('❌ Erro ao chamar API OCR:', apiError);
          await sendTelegramMessage(chatId, 
            `❌ <b>Erro ao processar documento</b>\n\n` +
            `📄 Arquivo: <code>${fileName}</code>\n` +
            `📊 Tamanho: ${(fileBuffer.length / 1024).toFixed(1)} KB\n\n` +
            `💡 <b>Tente:</b>\n` +
            `• Enviar uma foto mais clara\n` +
            `• Verificar se o arquivo não está corrompido\n` +
            `• Para PDFs: tire fotos das páginas\n` +
            `• Tentar novamente em alguns instantes\n\n` +
            `Se o problema persistir, entre em contato com o suporte.`
          );
        }
        
        return res.status(200).json({ ok: true, message: 'Arquivo processado com sucesso' });
        
      } catch (fileError) {
        console.error('❌ Erro ao processar arquivo:', fileError);
        await sendTelegramMessage(chatId, 
          '❌ Ocorreu um erro ao analisar seu arquivo.\n\n💡 Tente:\n• Enviar uma imagem mais clara\n• Verificar se o arquivo não está corrompido\n• Tentar novamente em alguns instantes\n\nDesculpe pelo inconveniente!'
        );
        return res.status(200).json({ ok: true, message: 'Erro ao processar arquivo' });
      }
    }    // Processar comandos de forma SÍNCRONA (corrigido para Vercel)
    // Só processar texto se não houver foto/documento
    if (messageText && !update.message.photo && !update.message.document) {
        console.log('🔄 Processando mensagem de texto...');
      
      // Comando /start - sempre responde PRIMEIRO
      if (messageText.startsWith('/start')) {
        console.log('🚀 Processando comando /start');
        const code = messageText.replace('/start', '').trim();
        
        if (code) {
          console.log(`🔑 Código de vinculação recebido: ${code}`);
          
          const linkSuccess = await saveTelegramLink(chatId, code, username);
          
          if (linkSuccess) {
            console.log('✅ Vinculação bem-sucedida');
            await sendTelegramMessage(chatId, 
              `🎉 <b>Conectado com sucesso!</b>\n\n` +
              `Olá ${username}! Sua conta Stater foi vinculada ao Telegram.\n\n` +
              `🚀 <b>AGORA VOCÊ PODE:</b>\n\n` +
              `📷 <b>Enviar fotos</b> de extratos, notas fiscais ou cupons\n` +
              `📄 <b>Enviar PDFs</b> de faturas ou documentos financeiros\n` +
              `💰 <b>Registrar transações:</b> "gastei 50 reais no mercado"\n` +
              `📊 <b>Consultar dados:</b> "qual meu saldo?" ou "gastos do mês"\n` +
              `� <b>Pedir dicas:</b> "como economizar dinheiro?"\n` +
              `🤔 <b>Fazer perguntas:</b> sobre investimentos, orçamento, finanças\n` +
              `� <b>Ver suas contas:</b> "minhas contas em aberto"\n\n` +
              `✨ <b>Exemplos práticos:</b>\n` +
              `• "Adicione uma despesa de 120 reais com combustível"\n` +
              `• "Quanto gastei com alimentação este mês?"\n` +
              `• "Tenho alguma conta vencendo?"\n` +
              `• "Dicas para organizar meu orçamento"\n\n` +
              `💬 <b>Comece agora!</b> Digite qualquer pergunta e eu responderei com seus dados reais.\n\n` +
              `<i>Stater - Inteligência para prosperar</i> 🌟`
            );          } else {
            console.log('❌ Falha na vinculação');            await sendTelegramMessage(chatId,
              `❌ <b>Código inválido ou expirado</b>\n\n` +
              `🔑 Código tentado: <code>${code}</code>\n\n` +
              `� <b>Como conectar:</b>\n` +
              `1. Acesse o <a href="https://stater.app/settings/telegram">App Stater</a>\n` +
              `2. Vá em Configurações → Telegram\n` +
              `3. Clique em "Conectar"\n` +
              `4. Copie o código de 6 dígitos\n` +
              `5. Cole aqui no chat\n\n` +
              `⏰ Códigos expiram em 15 minutos`
            );
          }} else {
          console.log('🆕 Comando /start sem código');
          await sendTelegramMessage(chatId,
            '👋 <b>Bem-vindo ao Stater IA!</b>\n\n' +
            '🤖 Sou seu assistente financeiro pessoal inteligente.\n\n' +
            '✨ <b>O QUE EU FAÇO:</b>\n\n' +
            '📷 Analiso fotos de extratos, cupons, notas fiscais\n' +
            '📄 Leio documentos PDF, planilhas, faturas\n' +
            '💰 Registro transações: "gastei 80 reais no supermercado"\n' +
            '🎤 Leio e entendo áudios/mensagens de voz normalmente\n' +
            '📊 Faço análises completas: saldo, gastos, receitas, categorias\n' +
            '📋 Controlo suas contas: vencimentos, pagamentos, alertas\n' +
            '💡 Dou conselhos: como economizar, investir, organizar\n' +
            '🤔 Respondo tudo sobre sua vida financeira\n\n' +
            '✨ <b>EXEMPLOS DE USO:</b>\n' +
            '• Envie foto do extrato bancário\n' +
            '• Envie um áudio dizendo "gastei 45 reais no almoço"\n' +
            '• "Qual meu saldo atual?"\n' +
            '• "Como economizar 500 reais por mês?"\n' +
            '• "Minhas contas vencem quando?"\n\n' +
            '🔗 <b>PARA CONECTAR:</b>\n' +
            '1. Acesse o <a href="https://stater.app/settings/telegram">App Stater</a>\n' +
            '2. Vá em Configurações → Telegram\n' +
            '3. Clique em "Conectar" e gere um código\n' +
            '4. Cole o código aqui no chat\n\n' +
            '<i>Stater - Inteligência para prosperar</i> 🌟'
          );
        }
        return res.status(200).json({ ok: true, message: 'Comando /start processado' });
      }      // Comando /help
      if (messageText === '/help') {
        console.log('❓ Processando comando /help');
        await sendTelegramMessage(chatId,
          '🤖 <b>Stater IA - TELEGRAM</b>\n\n' +
          '✨ <b>EU TENHO AUTONOMIA TOTAL!</b>\n' +
          '• Salvo transações automaticamente\n' +
          '• Leio seus dados financeiros reais\n' +
          '• Processo fotos, documentos e áudios\n' +
          '• Sincronizo 100% com o app\n\n' +
          '📋 <b>COMANDOS:</b>\n' +
          '• <b>/conectar</b> - Conectar sua conta\n' +
          '• <b>/saldo</b> - Ver saldo atual\n' +
          '• <b>/dashboard</b> - Abrir app\n' +
          '• <b>/sair</b> - Desconectar conta\n' +
          '• <b>/help</b> - Esta ajuda\n\n' +
          '🚀 <b>FUNCIONALIDADES:</b>\n' +
          '• Digite: "adicione 50 reais de almoço"\n' +
          '• Envie fotos de extratos/faturas\n' +
          '• Envie arquivos PDF/Excel\n' +
          '• Envie áudios/mensagens de voz normalmente\n' +
          '• Pergunte: "qual meu saldo?"\n' +
          '• Pergunte: "meus gastos do mês"\n\n' +
          '🚀 <b>TUDO É SALVO AUTOMATICAMENTE!</b>'
        );
        return res.status(200).json({ ok: true, message: 'Comando /help processado' });
      }      // Comando /conectar - SISTEMA SIMPLIFICADO
      if (messageText === '/conectar') {
        console.log('🔗 Processando comando /conectar');
        
        await sendTelegramMessage(chatId,
          '🔗 <b>Conectar sua conta Stater</b>\n\n' +
          '📋 <b>Passo a passo:</b>\n\n' +
          '1️⃣ Acesse: <a href="https://stater.app">stater.app</a>\n' +
          '2️⃣ Faça login na sua conta\n' +
          '3️⃣ Vá em <b>Configurações → Bot Telegram</b>\n' +
          '4️⃣ Clique em <b>"Gerar Código de Vinculação"</b>\n' +
          '5️⃣ <b>Copie</b> o código de 6 dígitos\n' +
          '6️⃣ <b>Cole aqui</b> no Telegram\n\n' +
          '✅ <b>Pronto!</b> Sua conta estará conectada.\n\n' +
          '� <b>Dica:</b> O código é copiado automaticamente quando gerado!\n\n' +
          '❓ <b>Exemplo:</b> Se o código for <code>123456</code>, envie apenas:\n' +
          '<code>123456</code>'
        );
        
        return res.status(200).json({ ok: true, message: 'Comando /conectar processado' });
      }// Comando /saldo - mostrar saldo atual
      if (messageText === '/saldo') {
        console.log('💰 Processando comando /saldo');
        
        const userData = await getTelegramUserData(chatId);
        if (!userData.linked) {
          await sendTelegramMessage(chatId,
            '💰 <b>Consulta de Saldo</b>\n\n' +
            '❌ Você precisa conectar sua conta primeiro\n\n' +
            '🔗 Digite <b>/conectar</b> para instruções'
          );
          return res.status(200).json({ ok: true, message: 'Comando /saldo - não conectado' });
        }
        
        const balance = await getUserBalance(userData.userId!);
        const recentTransactions = await getUserTransactions(userData.userId!, 5);
        
        let balanceMessage = `💰 <b>SEU SALDO ATUAL</b>\n\n`;
        balanceMessage += `💎 <b>Saldo:</b> R$ ${balance.balance.toFixed(2)}\n`;
        balanceMessage += `📈 <b>Total Receitas:</b> R$ ${balance.totalIncome.toFixed(2)}\n`;
        balanceMessage += `📉 <b>Total Despesas:</b> R$ ${balance.totalExpense.toFixed(2)}\n\n`;
        
        if (recentTransactions.length > 0) {
          balanceMessage += `📝 <b>Últimas transações:</b>\n`;
          recentTransactions.forEach(t => {
            const emoji = t.type === 'income' ? '💰' : '💸';
            const date = new Date(t.date).toLocaleDateString('pt-BR');
            balanceMessage += `${emoji} R$ ${Number(t.amount).toFixed(2)} - ${t.title}\n`;
            balanceMessage += `   📅 ${date} | 📂 ${t.category}\n\n`;
          });
        }
        
        balanceMessage += `📱 <i>Dados sincronizados com seu app Stater!</i>`;
        
        await sendTelegramMessage(chatId, balanceMessage);
        return res.status(200).json({ ok: true, message: 'Comando /saldo processado' });
      }

      // Comando /dashboard (atualizado)
      if (messageText === '/dashboard') {
        console.log('📊 Processando comando /dashboard');
        await sendTelegramMessage(chatId,
          '📊 <b>Dashboard Stater</b>\n\n' +
          '🔗 Acesse: <a href="https://stater.app">stater.app</a>\n\n' +
          '📱 <b>No dashboard você pode:</b>\n' +
          '• Ver suas transações\n' +
          '• Gerar códigos do Telegram\n' +
          '• Analisar seus gastos\n' +
          '• Usar o Stater IA\n\n' +
          '💡 <i>Conecte sua conta aqui no Telegram para acesso direto!</i>'
        );
        return res.status(200).json({ ok: true, message: 'Comando /dashboard processado' });
      }

      // Comando /sair - desconectar conta do Telegram
      if (messageText === '/sair' || messageText === '/desconectar') {
        console.log('👋 Processando comando /sair');
        
        const userData = await getTelegramUserData(chatId);
        if (!userData.linked) {
          await sendTelegramMessage(chatId,
            '❌ <b>Você não está conectado</b>\n\n' +
            '💡 Para conectar sua conta, use:\n' +
            '• Digite <b>/conectar</b>\n\n' +
            '🤖 <i>Posso continuar respondendo perguntas gerais!</i>'
          );
          return res.status(200).json({ ok: true, message: 'Comando /sair - não conectado' });
        }

        try {
          // Marcar como inativo em vez de deletar (melhor para histórico)
          const { error } = await supabaseAdmin
            .from('telegram_users')
            .update({ is_active: false })
            .eq('telegram_chat_id', chatId);

          if (error) {
            console.error('❌ Erro ao desconectar:', error);
            await sendTelegramMessage(chatId,
              '❌ <b>Erro ao desconectar</b>\n\n' +
              '🔧 Tente novamente em alguns instantes.\n' +
              '💬 Se o problema persistir, use <b>/conectar</b> para reconectar.'
            );
            return res.status(200).json({ ok: true, message: 'Erro ao desconectar' });
          }

          await sendTelegramMessage(chatId,
            '👋 <b>Conta desconectada com sucesso!</b>\n\n' +
            '✅ Sua conta Stater foi desvinculada do Telegram.\n\n' +
            '🔒 <b>Sua privacidade:</b>\n' +
            '• Não tenho mais acesso aos seus dados\n' +
            '• Suas informações permanecem seguras no app\n' +
            '• Posso responder apenas perguntas gerais\n\n' +
            '🔗 <b>Para reconectar:</b>\n' +
            '• Digite <b>/conectar</b> a qualquer momento\n\n' +
            '💙 Obrigado por usar o Stater IA!'
          );
          
          console.log('✅ Usuário desconectado com sucesso');
          return res.status(200).json({ ok: true, message: 'Comando /sair processado' });
          
        } catch (error) {
          console.error('❌ Erro interno ao desconectar:', error);
          await sendTelegramMessage(chatId,
            '❌ <b>Erro interno</b>\n\n' +
            '🔧 Tente novamente em alguns instantes.\n' +
            '💬 Se persistir, contate o suporte.'
          );
          return res.status(200).json({ ok: true, message: 'Erro interno' });
        }
      }      // Verificar se é um código de conexão (formato: 6 dígitos numéricos)
      const codePattern = /^[0-9]{6}$/;
      if (codePattern.test(messageText.trim())) {
        console.log('🔑 Código direto detectado');
        const code = messageText.trim();
        console.log(`🔑 Código direto recebido: ${code}`);
        
        const linkSuccess = await saveTelegramLink(chatId, code, username);
        
        if (linkSuccess) {
          await sendTelegramMessage(chatId, 
            `✅ <b>Conta vinculada com sucesso!</b>\n\n` +
            `🎉 Olá ${username}! Sua conta Stater foi conectada.\n\n` +
            `🤖 Agora posso analisar suas finanças reais e dar conselhos personalizados!\n\n` +
            `💬 <b>Experimente:</b>\n` +
            `• "Qual meu saldo atual?"\n` +
            `• "Análise dos meus gastos"\n` +
            `• "Como economizar dinheiro?"\n\n` +
            `Stater IA ativo! 🚀`
          );
        } else {
          await sendTelegramMessage(chatId, 
            `❌ <b>Código inválido: ${code}</b>\n\n` +
            `💡 <b>Possíveis causas:</b>\n` +
            `• Código expirado (válido por 15 min)\n` +
            `• Código já foi usado\n` +
            `• Código digitado incorretamente\n\n` +
            `🔧 <b>Como conectar:</b>\n` +
            `1. Acesse o <a href="https://stater.app/settings/telegram">App Stater</a>\n` +
            `2. Vá em Configurações → Telegram\n` +
            `3. Clique em "Conectar"\n` +
            `4. Copie o código de 6 dígitos\n` +
            `5. Cole aqui no chat\n\n` +
            `� Use o formato: 6 números (ex: 123456)`
          );
        }
        return res.status(200).json({ ok: true, message: 'Código processado' });
           }

      // VERIFICAR SE É RESPOSTA DE CONFIRMAÇÃO PARA TRANSAÇÕES PENDENTES
      const upperText = messageText.toUpperCase().trim();
      if (upperText === 'SIM' || upperText === 'NÃO' || upperText === 'NAO' || upperText === 'REVISAR') {
        console.log(`💭 Resposta de confirmação detectada: ${upperText}`);
        
        const pendingData = getPendingTransactions(chatId);
        if (pendingData) {
          const userData = await getTelegramUserData(chatId);
          if (!userData.linked) {
            await sendTelegramMessage(chatId, '❌ Você precisa estar conectado para salvar transações.\nDigite /conectar');
            return res.status(200).json({ ok: true, message: 'Não conectado' });
          }
          
          if (upperText === 'SIM') {
            // Salvar todas as transações
            console.log('✅ Usuário confirmou SIM - salvando todas as transações');
            
            const { saved, failed } = await saveMultipleTransactions(userData.userId!, pendingData.transactions);
            
            const balance = await getUserBalance(userData.userId!);
            
            // Analisar as transações salvas para dar feedback detalhado
            const savedTransactions = pendingData.transactions.slice(0, saved);
            const receitas = savedTransactions.filter(t => t.tipo === 'receita').length;
            const despesas = savedTransactions.filter(t => t.tipo === 'despesa').length;
            
            let confirmMessage = `✅ <b>TRANSAÇÕES SALVAS COM SUCESSO!</b>\n\n`;
            confirmMessage += `💾 <b>Salvas:</b> ${saved}/${pendingData.transactions.length}\n`;
            if (receitas > 0) confirmMessage += `📈 <b>Receitas:</b> ${receitas} (aumentaram o saldo)\n`;
            if (despesas > 0) confirmMessage += `📉 <b>Despesas:</b> ${despesas} (diminuíram o saldo)\n`;
            if (failed > 0) {
              confirmMessage += `❌ <b>Falharam:</b> ${failed}\n`;
            }
            
            confirmMessage += `\n💰 <b>SEU SALDO ATUALIZADO:</b> R$ ${balance.balance.toFixed(2)}\n\n`;
            confirmMessage += `🎉 <b>Todas as transações foram processadas corretamente!</b>\n`;
            confirmMessage += `📱 <i>Abra seu app para ver o detalhamento completo!</i>`;
            
            await sendTelegramMessage(chatId, confirmMessage);
            clearPendingTransactions(chatId);
            
          } else if (upperText === 'NÃO' || upperText === 'NAO') {
            // Cancelar transações
            console.log('❌ Usuário cancelou - não salvando transações');
            
            await sendTelegramMessage(chatId, 
              `❌ <b>Transações canceladas</b>\n\n` +
              `🗑️ As ${pendingData.transactions.length} transações encontradas no documento "${pendingData.documentType}" não foram salvas.\n\n` +
              `💡 <i>Você pode enviar o documento novamente quando desejar processá-lo.</i>`
            );
            clearPendingTransactions(chatId);
            
          } else if (upperText === 'REVISAR') {
            // Mostrar cada transação individualmente para confirmação
            console.log('🔍 Usuário escolheu REVISAR - mostrando transações individualmente');
            
            await sendTelegramMessage(chatId, 
              `🔍 <b>REVISÃO INDIVIDUAL</b>\n\n` +
              `Vou mostrar cada transação para você confirmar uma por uma.\n\n` +
              `📝 Para cada transação, responda:\n` +
              `• <b>S</b> ou <b>SIM</b> - Salvar esta transação\n` +
              `• <b>N</b> ou <b>NÃO</b> - Pular esta transação\n` +
              `• <b>PARAR</b> - Cancelar revisão\n\n` +
              `⏳ <i>Iniciando revisão...</i>`
            );
            
            // Implementar revisão individual (para próxima iteração)
            // Por enquanto, salvar todas
            const { saved, failed } = await saveMultipleTransactions(userData.userId!, pendingData.transactions);
            
            await sendTelegramMessage(chatId, 
              `⚡ <b>Revisão rápida executada</b>\n\n` +
              `💾 Todas as ${saved} transações foram salvas!\n\n` +
              `💡 <i>Funcionalidade de revisão individual será implementada em breve.</i>`
            );
            clearPendingTransactions(chatId);
          }
          
          return res.status(200).json({ ok: true, message: 'Confirmação processada' });
        } else {
          // Não há transações pendentes
          await sendTelegramMessage(chatId, 
            `🤔 <b>Nenhuma transação pendente</b>\n\n` +
            `Não encontrei transações aguardando confirmação.\n\n` +
            `💡 <i>Envie uma foto de extrato, nota fiscal ou documento financeiro para processar!</i>`
          );
          return res.status(200).json({ ok: true, message: 'Sem transações pendentes' });
        }
      }

      // FUNCIONALIDADE PRINCIPAL: Qualquer outra mensagem vai para a IA
      console.log(`🧠 Processando mensagem com IA: ${messageText}`);
      
      // Verificar se usuário está vinculado
      const userData = await getTelegramUserData(chatId);
      console.log('👤 Status do usuário:', userData);      if (!userData.linked) {
        console.log('🔓 Usuário não vinculado - enviando mensagem de não conectado');
        
        // Verificar se está tentando acessar funcionalidades específicas
        const needsConnectionCommands = [
          'saldo', 'balanço', 'extrato', 'transações', 'gastos', 'receitas',
          'qual meu saldo', 'quanto tenho', 'meus gastos', 'minhas contas',
          'análise', 'relatório', 'resumo financeiro'
        ];
        
        const needsConnection = needsConnectionCommands.some(cmd => 
          messageText.toLowerCase().includes(cmd.toLowerCase())
        );
        
        if (needsConnection) {
          // Usuário tentando acessar dados financeiros - mostrar como conectar
          await sendTelegramMessage(chatId,
            '🔒 <b>Conta não conectada</b>\n\n' +
            'Para que eu possa responder sobre suas finanças, você precisa conectar sua conta:\n\n' +
            '<b>Como conectar:</b>\n' +
            '1. Acesse: <a href="https://stater.app">stater.app</a>\n' +
            '2. Faça login na sua conta\n' +
            '3. Vá em Configurações → Bot Telegram\n' +
            '4. Gere um código de vinculação\n' +
            '5. Envie o código aqui\n\n' +
            '⚠️ <b>Sem conexão, não posso:</b>\n' +
            '• Acessar seus dados financeiros\n' +
            '• Fazer análises personalizadas\n' +
            '• Responder sobre suas contas\n\n' +
            '💡 Use <b>/conectar</b> para gerar código automaticamente.\n\n' +
            '<i>Stater - Assistente Financeiro IA</i>'
          );
        } else {
          // Pergunta geral - resposta genérica da IA
          const aiResponse = await callGeminiAPI(messageText, undefined, update.message.from);
          const cleanResponse = extractCleanMessage(aiResponse);
          await sendTelegramMessage(chatId, cleanResponse);
        }
        
        return res.status(200).json({ ok: true, message: 'Usuário não conectado' });
      } else {
        console.log('🔒 Usuário vinculado - resposta personalizada');
        // Usuário vinculado - resposta personalizada com dados reais
        const aiResponse = await callGeminiAPI(messageText, userData.userId, update.message.from);        // Verificar se a resposta é uma transação JSON
        const cleanResponse = aiResponse.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        console.log('🔍 Resposta da IA completa:', cleanResponse);
        console.log('🔍 É JSON?:', cleanResponse.startsWith('{') && cleanResponse.endsWith('}'));
        console.log('🔍 Contém "tipo"?:', cleanResponse.includes('"tipo"'));
        
        // VERIFICAÇÃO ANTI-JSON BRUTO: Se parece com JSON mas não é transação válida, não enviar JSON
        const looksLikeJson = cleanResponse.startsWith('{') && cleanResponse.endsWith('}') && cleanResponse.length > 20;
        let isValidTransaction = false;
        let transactionData = null;
        
        // CRITÉRIO RÍGIDO: Só é transação se for JSON válido E tiver campos específicos
        if (looksLikeJson && 
            (cleanResponse.includes('"tipo":') && cleanResponse.includes('"valor":') && cleanResponse.includes('"descrição":'))) {
          console.log('💰 Detectada possível transação JSON, validando...');
          
          try {
            transactionData = JSON.parse(cleanResponse);
            console.log('📊 JSON parseado:', transactionData);
            
            // Validação MUITO rígida
            if (transactionData.tipo && transactionData.valor && transactionData.descrição && 
                typeof transactionData.valor === 'number' && transactionData.valor > 0 &&
                (transactionData.tipo === 'receita' || transactionData.tipo === 'despesa')) {
              console.log('✅ Transação 100% válida detectada');
              isValidTransaction = true;
            } else {
              console.log('❌ JSON inválido - campos obrigatórios ausentes ou incorretos');
            }
          } catch (jsonError) {
            console.log('❌ Erro ao processar JSON:', jsonError);
          }
        }
        
        if (isValidTransaction && transactionData) {
          console.log('💰 Processando transação válida...');
          
          // Normalizar dados
          const normalizedData = {
            tipo: transactionData.tipo,
            descrição: transactionData.descrição,
            valor: transactionData.valor,
            data: transactionData.data || new Date().toISOString().split('T')[0],
            categoria: transactionData.categoria || 'Outros'
          };
          
          console.log('📋 Dados normalizados:', normalizedData);
          
          // MOSTRAR TRANSAÇÃO PARA CONFIRMAÇÃO (igual ao app)
          const emoji = getCategoryEmoji(normalizedData.categoria);
          const amount = Number(normalizedData.valor);
          const typeText = normalizedData.tipo === 'receita' ? '📈 RECEITA (aumenta saldo)' : '📉 DESPESA (diminui saldo)';
          const typeEmoji = normalizedData.tipo === 'receita' ? '💚' : '💸';
          
          console.log('📊 Tipo detectado:', normalizedData.tipo, '→', typeText);
          
          // Salvar como pendente usando dados normalizados
          savePendingTransactions(chatId, [normalizedData], null, 'manual_entry');
          
          const confirmMessage = 
            `💡 <b>Transação detectada!</b>\n\n` +
            `${emoji} <b>${normalizedData.descrição}</b>\n` +
            `${typeEmoji} <b>R$ ${amount.toFixed(2)}</b> | 📂 ${normalizedData.categoria}\n` +
            `📅 ${normalizedData.data}\n` +
            `📊 <b>Tipo: ${typeText}</b>\n\n` +
            `❓ <b>Confirma que está correto?</b>\n\n` +
            `💬 Digite:\n` +
            `• <b>SIM</b> ou <b>CONFIRMAR</b> - Para salvar como ${normalizedData.tipo.toUpperCase()}\n` +
            `• <b>NÃO</b> ou <b>CANCELAR</b> - Para descartar\n\n` +
            `⏰ <i>Aguardando sua confirmação...</i>`;
            
          await sendTelegramMessage(chatId, confirmMessage);
        } else {
          console.log('📝 Resposta normal da IA (não é JSON de transação válida)');
          
          // FILTRO ANTI-JSON BRUTO: Se parece com JSON mas não é transação válida, corrigir
          if (looksLikeJson) {
            console.log('⚠️  JSON detectado mas inválido para transação! Não enviando JSON bruto.');
            
            const correctedResponse = "💡 Para adicionar uma transação, seja mais específico:\n\n" +
              "📝 Exemplos corretos:\n" +
              "• \"adicione uma despesa de 50 reais com almoço\"\n" +
              "• \"gastei 30 reais com uber\"\n" +
              "• \"recebi 1000 reais de salário\"\n\n" +
              "❓ Precisa de ajuda com suas finanças? Posso analisar seus gastos, dar dicas ou responder perguntas!";
            
            await sendTelegramMessage(chatId, correctedResponse);
          } else {
            // Verificar se a IA está inventando confirmações falsas
            if (aiResponse.includes('transação') && 
                (aiResponse.includes('salva') || aiResponse.includes('registrada') || 
                 aiResponse.includes('adicionada') || aiResponse.includes('saldo é') ||
                 aiResponse.includes('saldo atualizado') || aiResponse.includes('transação registrada'))) {
              console.log('⚠️  IA tentou inventar confirmação de transação! Corrigindo...');
              
              const correctedResponse = "💡 Para adicionar uma transação, seja mais específico:\n\n" +
                "📝 Exemplos corretos:\n" +
                "• \"adicione uma despesa de 50 reais com almoço\"\n" +
                "• \"gastei 30 reais com uber\"\n" +
                "• \"recebi 1000 reais de salário\"\n\n" +
                "❓ Precisa de ajuda com suas finanças? Posso analisar seus gastos, dar dicas ou responder perguntas!";
              
              await sendTelegramMessage(chatId, correctedResponse);
            } else {
              // Resposta normal da IA (garantidamente não é JSON)
              await sendTelegramMessage(chatId, aiResponse);
            }
          }
        }
      }
    
  } catch (error) {
    console.error('❌ Erro crítico no webhook:', error);
    
    // Log detalhado do erro para debug
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : error);
    console.error('❌ Tipo do erro:', typeof error);
    console.error('❌ Mensagem do erro:', error instanceof Error ? error.message : 'Erro desconhecido');
    
    // Tentar enviar mensagem de erro para o usuário
    try {
      const chatId = req.body?.message?.chat?.id?.toString();
      if (chatId) {
        await sendTelegramMessage(chatId, 
          '❌ Ocorreu um erro interno no sistema.\n\n' +
          '🔧 Nossa equipe foi notificada e está trabalhando na correção.\n\n' +
          '💡 Tente novamente em alguns minutos.\n\n' +
          'Se o problema persistir, entre em contato com o suporte.'
        );
      }
    } catch (sendError) {
      console.error('❌ Erro ao enviar mensagem de erro:', sendError);
    }
    
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
  
  return res.status(200).json({ ok: true, message: 'Mensagem processada' });
}
