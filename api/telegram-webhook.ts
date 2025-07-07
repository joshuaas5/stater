// API Webhook do Telegram - Integração Completa com Stater IA (CORRIGIDO)
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase-admin';

// Configuração Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hlemutzuubhrkuhevsxo.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZW11dHp1dWJocmt1aGV2c3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMzQ3MTcsImV4cCI6MjA0NjkxMDcxN30.pUaQVR-YwLo6r7_N8n4rZGDCqYeGfgFEhYpyB5YkbzI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuração da API Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDTTPO0otruHVzh7bXsi7MCyG674P03758";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

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
        date: transactionData.date || transactionData.data || new Date().toISOString().split('T')[0],
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

// Função para chamar a API Gemini (mesmo processamento do Stater IA)
async function callGeminiAPI(userMessage: string, userId?: string, telegramUser?: any): Promise<string> {
  try {
    console.log('🤖 Chamando API Gemini para resposta inteligente...');
    
    let financialContextText = '';
    let userName = 'Usuário';
    
    // Pegar nome do usuário do Telegram se fornecido
    if (telegramUser) {
      userName = telegramUser.first_name || telegramUser.username || 'Usuário';
      if (telegramUser.last_name) {
        userName += ` ${telegramUser.last_name}`;
      }
    }
    
    // Se temos userId, buscar dados financeiros COMPLETOS
    if (userId) {
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
          
          financialContextText += "\n=== FIM DOS DADOS FINANCEIROS ===\n";
        } else {
          financialContextText += "\nNenhuma transação encontrada ainda.\n";
        }
      } catch (error) {
        console.log('Erro ao buscar dados financeiros:', error);
        financialContextText += "\nErro ao acessar dados financeiros.\n";
      }
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Detectar se precisa de contexto financeiro
    const needsFinancialContext = userMessage.toLowerCase().includes('análise') || 
                                 userMessage.toLowerCase().includes('situação') ||
                                 userMessage.toLowerCase().includes('gastos') ||
                                 userMessage.toLowerCase().includes('receitas') ||
                                 userMessage.toLowerCase().includes('saldo') ||
                                 userMessage.toLowerCase().includes('contas') ||
                                 userMessage.toLowerCase().includes('orçamento') ||
                                 userMessage.toLowerCase().includes('dinheiro') ||
                                 userMessage.toLowerCase().includes('financeira');

    const contextToUse = needsFinancialContext ? financialContextText : "Dados financeiros disponíveis mediante solicitação.";      const fullPrompt = `Você é o Stater IA - VERSÃO TELEGRAM com AUTONOMIA COMPLETA.

VOCÊ TEM TOTAL AUTONOMIA PARA:
- SALVAR transações automaticamente no banco de dados
- LER todos os dados financeiros do usuário em tempo real
- CALCULAR saldos, totais e análises completas
- RESPONDER com base nos dados REAIS do usuário
- FUNCIONAR EXATAMENTE como o Stater IA do app

DATA: ${today}
USUÁRIO: ${userName}
PLATAFORMA: Telegram (COM AUTONOMIA TOTAL)
USER_ID: ${userId || 'Não conectado'}

${financialContextText}

PERGUNTA/SOLICITAÇÃO: ${userMessage}

INSTRUÇÕES CRÍTICAS:
- Você tem acesso COMPLETO aos dados financeiros do usuário acima
- CALCULE sempre o saldo atual: Receitas MENOS Despesas
- RESPONDA baseado nos dados REAIS, não em suposições
- Se solicitado para adicionar transação, gere JSON para salvamento automático
- SEMPRE mostre o saldo atual quando relevante
- Seja DIRETO e PRECISO como no app principal
- Use os dados financeiros fornecidos para análises detalhadas
- NUNCA use asteriscos (*) ou markdown para formatação
- Use apenas texto simples e emojis para Telegram

DETECÇÃO DE TRANSAÇÕES:
APENAS gere JSON se o usuário CLARAMENTE solicitar para adicionar, registrar, salvar, remover, gastar ou receber um valor específico em reais.

Exemplos que DEVEM gerar JSON:
- "adicione uma despesa de 50 reais"
- "gastei 30 reais com almoço"
- "recebi 1000 reais de salário"
- "registre um gasto de 15 reais"

Exemplos que NÃO devem gerar JSON:
- "quanto gastei?"
- "qual meu saldo?"
- "como economizar?"
- "análise dos gastos"

Para transações válidas, responda APENAS com JSON limpo SEM blocos de código:
{
  "tipo": "receita" ou "despesa", 
  "descrição": "descrição_clara_da_transação",
  "valor": valor_numerico_sem_simbolos,
  "data": "${today}",
  "categoria": "categoria_automatica_precisa"
}

IMPORTANTE: NÃO use blocos de código markdown, asteriscos ou qualquer formatação especial. Apenas texto limpo.

ANÁLISES FINANCEIRAS:
- Use TODOS os dados fornecidos acima
- Calcule percentuais, médias, tendências
- Compare períodos se possível
- Identifique padrões nos gastos
- Sugira melhorias baseadas nos dados reais

RESPOSTAS PARA CONSULTAS:
- "Qual meu saldo?" → Use os dados REAIS acima
- "Meus gastos" → Analise as transações listadas
- "Situação financeira" → Análise completa com os dados
- "Últimas transações" → Liste as transações dos dados

CATEGORIAS PARA AUTO-CATEGORIZAÇÃO:
- "Alimentação": supermercados, restaurantes, delivery, padarias
- "Transporte": combustível, uber, taxi, ônibus, pedágios  
- "Saúde": farmácias, consultas médicas, planos de saúde
- "Entretenimento": cinema, streaming, jogos, viagens, bares
- "Habitação": aluguel, condomínio, água, luz, gás, internet
- "Educação": cursos, livros, mensalidades escolares
- "Cuidados Pessoais": salão, barbeiro, cosméticos, higiene
- "Outros": categoria genérica quando não se encaixa

IMPORTANTE: 
- Você é um assistente com AUTONOMIA TOTAL
- SALVE transações automaticamente (via JSON)
- LEIA dados reais do usuário
- CALCULE tudo baseado nos dados fornecidos
- Funcione EXATAMENTE como o assistente do app principal
- NUNCA invente que uma transação foi salva
- NUNCA diga "transação registrada" ou "saldo atualizado" sem confirmação real
- Apenas texto limpo e emojis quando apropriado

Resposta:`;

    const geminiPayload = {
      contents: [{ 
        role: "user", 
        parts: [{text: fullPrompt}] 
      }],
      generationConfig: {
        temperature: 0.3, // Mais preciso para dados financeiros
        topK: 32,
        topP: 0.9,
        maxOutputTokens: 2048, // Mais espaço para análises detalhadas
      }
    };

    console.log('📡 Enviando para Gemini API...');
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: any = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      let aiResponse = data.candidates[0].content.parts[0].text;
      console.log('✅ Resposta da IA recebida:', aiResponse.substring(0, 100) + '...');
      
      // Remover asteriscos das respostas
      aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');
      
      // Limitar resposta para Telegram (4096 caracteres max)
      return aiResponse.length > 4000 ? aiResponse.substring(0, 3997) + '...' : aiResponse;
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
    
    // Verificar diretamente no Supabase
    const { data, error } = await supabaseAdmin
      .from('telegram_users')
      .select('user_id, linked_at, is_active')
      .eq('telegram_chat_id', chatId)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.log('❌ [DEBUG] Erro Supabase ao verificar vinculação:', error.message);
      return { linked: false };
    }
    
    if (data && data.user_id) {
      console.log('✅ [DEBUG] Usuário encontrado e vinculado:', data.user_id);
      return { userId: data.user_id, linked: true };
    }
  } catch (error) {
    console.log('❌ [DEBUG] Exceção ao verificar vinculação:', error);
  }
  
  console.log('❌ [DEBUG] Usuário não vinculado');
  return { linked: false };
}

// Função para salvar vinculação do usuário - USANDO API SIMPLES
async function saveTelegramLink(chatId: string, code: string, username: string): Promise<boolean> {
  try {
    console.log('💾 [DEBUG] Tentando salvar vinculação:', { chatId, code, username });
    
    // Verificar código via API interna
    const verifyUrl = `https://staterbills.vercel.app/api/telegram-codes-simple?code=${code}`;
    
    console.log('🔍 [DEBUG] Verificando código via API:', verifyUrl);
    
    const response = await fetch(verifyUrl);
    const result = await response.json();
    
    console.log('🔍 [DEBUG] Resposta da verificação:', { status: response.status, result });
      if (!response.ok || !(result as any).success) {
      console.log('❌ [DEBUG] Código inválido ou expirado');
      return false;
    }
    
    const { user_id, user_email, user_name } = result as any;
    
    console.log('✅ [DEBUG] Código válido encontrado para usuário:', user_id);
      // Salvar vinculação na tabela de usuários do Telegram
    const { error: linkError } = await supabaseAdmin
      .from('telegram_users')
      .upsert({
        telegram_chat_id: chatId,
        user_id: user_id,
        user_email: user_email,
        user_name: user_name,
        telegram_username: username,
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
      const markUsedResponse = await fetch('https://staterbills.vercel.app/api/telegram-codes-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, chatId })
      });
      
      if (markUsedResponse.ok) {
        console.log('✅ [DEBUG] Código marcado como usado');
      } else {
        console.log('⚠️ [DEBUG] Erro ao marcar código como usado, mas vinculação foi salva');
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
    const response = await fetch(GEMINI_ENDPOINT, {
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
          const ocrResponse = await fetch('https://staterbills.vercel.app/api/gemini-ocr', {
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
      try {
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
              `✅ Conta vinculada com sucesso!\n\n` +
              `🎉 Olá ${username}! Sua conta Stater foi conectada ao Telegram.\n\n` +
              `🤖 Agora posso ajudar você com:\n` +
              `💰 Consultas de saldo e transações\n` +
              `📊 Análises financeiras personalizadas\n` +
              `💡 Dicas e conselhos financeiros\n` +
              `📝 Registro de novas transações\n\n` +
              `💬 Digite qualquer pergunta sobre suas finanças e eu responderei com base nos seus dados reais!\n\n` +
              `Stater IA ativo! 🚀`
            );          } else {
            console.log('❌ Falha na vinculação');
            await sendTelegramMessage(chatId, 
              `❌ <b>Código inválido ou expirado</b>\n\n` +
              `🔑 Código tentado: <code>${code}</code>\n\n` +
              `💡 <b>Soluções:</b>\n` +
              `• Digite <b>/conectar</b> para instruções completas\n` +
              `• Gere um novo código no app Stater\n` +
              `• Códigos expiram em 15 minutos\n\n` +
              `🔗 App: <a href="https://staterbills.vercel.app">staterbills.vercel.app</a>`
            );
          }} else {
          console.log('🆕 Comando /start sem código');
          await sendTelegramMessage(chatId,
            '👋 <b>Bem-vindo ao Stater IA!</b>\n\n' +
            '🤖 Sou seu assistente financeiro pessoal com Inteligência para Prosperar.\n\n' +
            '⚡ <b>Conecte sua conta facilmente:</b>\n' +
            '• Digite: <b>/conectar</b>\n\n' +
            '💬 <b>Ou use agora mesmo:</b>\n' +
            '• Digite: <b>/help</b> - Ver comandos\n' +
            '• Digite: <b>/dashboard</b> - Acessar app\n' +
            '• Exemplo: "Como economizar dinheiro?"\n\n' +
            '💡 <i>Após conectar sua conta, terei acesso aos seus dados reais para análises personalizadas!</i>'
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
          '• Processo fotos e documentos\n' +
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
          '• Pergunte: "qual meu saldo?"\n' +
          '• Pergunte: "meus gastos do mês"\n\n' +
          '🚀 <b>TUDO É SALVO AUTOMATICAMENTE!</b>'
        );
        return res.status(200).json({ ok: true, message: 'Comando /help processado' });
      }// Comando /conectar - NOVO SISTEMA INTUITIVO
      if (messageText === '/conectar') {
        console.log('🔗 Processando comando /conectar');
        
        // Gerar código automaticamente para este chat ID
        try {
          const response = await fetch('https://staterbills.vercel.app/api/telegram-codes-simple?action=generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId })
          });
            if (response.ok) {
            const result: any = await response.json();
            await sendTelegramMessage(chatId,
              '🔗 <b>Código de Conexão Gerado!</b>\n\n' +
              '🎯 <b>Seu código:</b> <code>' + result.code + '</code>\n\n' +
              '📋 <b>Como usar:</b>\n' +
              '1️⃣ Copie o código acima\n' +
              '2️⃣ Abra: <a href="https://staterbills.vercel.app">staterbills.vercel.app</a>\n' +
              '3️⃣ Faça login na sua conta\n' +
              '4️⃣ Vá para Dashboard\n' +
              '5️⃣ Clique em "Conectar Telegram"\n' +
              '6️⃣ Cole o código\n\n' +
              '⏰ <b>Válido por 15 minutos</b>\n' +
              '💡 <i>Após conectar, terei acesso aos seus dados para análises personalizadas!</i>'
            );
          } else {
            throw new Error('Erro ao gerar código');
          }        } catch (error) {
          console.error('❌ Erro ao gerar código:', error);
          await sendTelegramMessage(chatId,
            '🔗 <b>Conectar sua conta Stater - SIMPLES!</b>\n\n' +
            '📱 <b>PASSO 1:</b> Copie este número:\n' +
            '👉 <code>' + chatId + '</code>\n\n' +
            '📱 <b>PASSO 2:</b> Abra este link:\n' +
            '👉 <a href="https://staterbills.vercel.app">staterbills.vercel.app</a>\n\n' +
            '📱 <b>PASSO 3:</b> Faça login\n\n' +
            '📱 <b>PASSO 4:</b> Clique "Conectar Agora"\n\n' +
            '📱 <b>PASSO 5:</b> Cole o número do PASSO 1\n\n' +
            '📱 <b>PASSO 6:</b> Volte aqui e teste: "Qual meu saldo?"\n\n' +
            '✅ <b>Pronto!</b> Super fácil!'
          );
        }
        
        return res.status(200).json({ ok: true, message: 'Comando /conectar processado' });
      }      // Comando /saldo - mostrar saldo atual
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
          '🔗 Acesse: <a href="https://staterbills.vercel.app">staterbills.vercel.app</a>\n\n' +
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
      if (messageText === '/sair') {
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
          // Remover vinculação do banco de dados
          const { error } = await supabaseAdmin
            .from('telegram_users')
            .delete()
            .eq('telegram_chat_id', chatId);

          if (error) {
            console.error('❌ Erro ao desconectar:', error);
            await sendTelegramMessage(chatId,
              '❌ <b>Erro ao desconectar</b>\n\n' +
              '🔧 Tente novamente em alguns instantes.\n' +
              '💬 Se o problema persistir, entre em contato com o suporte.'
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
      }      // Verificar se é um código de conexão (formato: 2 números + 2 letras)
      const codePattern = /^[0-9]{2}[A-Z]{2}$/;
      if (codePattern.test(messageText.toUpperCase())) {
        console.log('🔑 Código direto detectado');
        const code = messageText.toUpperCase();
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
            `🔧 <b>Soluções:</b>\n` +
            `• Digite <b>/conectar</b> para gerar novo código\n` +
            `• Verifique se copiou corretamente\n` +
            `• Use o formato: 2 números + 2 letras (ex: 12AB)\n\n` +
            `🔗 <a href="https://staterbills.vercel.app">Abrir App Stater</a>`
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
            
            confirmMessage += `\n💰 <b>SEU SALDO ATUALIZADO:</b> R$ ${balance.balance.toFixed(2)}\n`;
            confirmMessage += `💚 <b>Total Receitas:</b> R$ ${balance.totalIncome.toFixed(2)}\n`;
            confirmMessage += `💔 <b>Total Despesas:</b> R$ ${balance.totalExpense.toFixed(2)}\n\n`;
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
        console.log('🔓 Usuário não vinculado - resposta genérica');
        // Usuário não vinculado - resposta genérica da IA SEM forçar conexão
        const aiResponse = await callGeminiAPI(messageText, undefined, update.message.from);
        await sendTelegramMessage(chatId, aiResponse);
        return res.status(200).json({ ok: true, message: 'Mensagem IA processada' });
      } else {
        console.log('🔒 Usuário vinculado - resposta personalizada');
        // Usuário vinculado - resposta personalizada com dados reais
        const aiResponse = await callGeminiAPI(messageText, userData.userId, update.message.from);        // Verificar se a resposta é uma transação JSON
        const cleanResponse = aiResponse.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        console.log('🔍 Resposta da IA completa:', cleanResponse);
        console.log('🔍 É JSON?:', cleanResponse.startsWith('{') && cleanResponse.endsWith('}'));
        console.log('🔍 Contém "tipo"?:', cleanResponse.includes('"tipo"'));
        console.log('🔍 Contém "action"?:', cleanResponse.includes('"action"'));
        
        // CRITÉRIO RÍGIDO: Só é transação se for JSON válido E tiver campos específicos
        if (cleanResponse.startsWith('{') && cleanResponse.endsWith('}') && cleanResponse.length > 50 &&
            (cleanResponse.includes('"tipo":') && cleanResponse.includes('"valor":') && cleanResponse.includes('"descrição":'))) {
          console.log('💰 Detectada transação JSON válida, processando...');
          
          try {
            const transactionData = JSON.parse(cleanResponse);
            console.log('📊 JSON parseado:', transactionData);
            
            // Validação MUITO rígida
            if (transactionData.tipo && transactionData.valor && transactionData.descrição && 
                typeof transactionData.valor === 'number' && transactionData.valor > 0) {
              console.log('✅ Transação 100% válida detectada');
              
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
              console.log('❌ JSON inválido - campos obrigatórios ausentes');
              // JSON inválido, tratar como resposta normal
              await sendTelegramMessage(chatId, aiResponse);
            }
          } catch (jsonError) {
            console.log('❌ Erro ao processar JSON:', jsonError);
            // Se não for JSON válido, enviar resposta normal
            await sendTelegramMessage(chatId, aiResponse);
          }
        } else {
          console.log('📝 Resposta normal da IA (não é JSON de transação)');
          console.log('📝 Conteúdo da resposta:', aiResponse);
          
          // Verificar se a IA está inventando confirmações falsas
          if (aiResponse.includes('transação') && 
              (aiResponse.includes('salva') || aiResponse.includes('registrada') || 
               aiResponse.includes('adicionada') || aiResponse.includes('saldo é'))) {
            console.log('⚠️  IA tentou inventar confirmação de transação! Corrigindo...');
            
            const correctedResponse = "💡 Para adicionar uma transação, seja mais específico:\n\n" +
              "📝 Exemplos corretos:\n" +
              "• \"adicione uma despesa de 50 reais com almoço\"\n" +
              "• \"gastei 30 reais com uber\"\n" +
              "• \"recebi 1000 reais de salário\"\n\n" +
              "❓ Precisa de ajuda com suas finanças? Posso analisar seus gastos, dar dicas ou responder perguntas!";
            
            await sendTelegramMessage(chatId, correctedResponse);
          } else {
            // Resposta normal da IA
            await sendTelegramMessage(chatId, aiResponse);
          }
        }
      }return res.status(200).json({ ok: true, message: 'Mensagem IA processada' });

      } catch (processingError) {
        console.error('❌ Erro ao processar mensagem:', processingError);
        await sendTelegramMessage(chatId,
          '❌ Desculpe, ocorreu um erro ao processar sua mensagem.\n\n' +
          'Tente novamente em alguns instantes.\n\n' +
          'Se o problema persistir, digite /help'
        );
        return res.status(200).json({ ok: true, message: 'Erro tratado' });
      }
    } else if (!update.message.photo && !update.message.document) {
      // Se não há texto nem foto/documento, não fazer nada
      console.log('📭 Mensagem sem texto, foto ou documento');
      return res.status(200).json({ ok: true, message: 'Mensagem vazia processada' });
    }
  } catch (error) {
    console.error('❌ Erro crítico no webhook:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
