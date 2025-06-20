// API Webhook do Telegram - Integração Completa com Assistente IA
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

// Função para chamar a API Gemini (mesmo processamento do Assistente IA)
async function callGeminiAPI(userMessage: string, userId?: string): Promise<string> {
  try {
    console.log('🤖 Chamando API Gemini para resposta inteligente...');
    
    let financialContextText = '';
    let userName = 'Usuário';
    
    // Se temos userId, buscar dados financeiros
    if (userId) {
      try {
        // Buscar dados do usuário
        const { data: userData } = await supabaseAdmin
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single();
        
        if (userData) {
          userName = userData.full_name || userData.email?.split('@')[0] || 'Usuário';
        }

        // Buscar transações recentes
        const { data: recentTransactions } = await supabaseAdmin
          .from('transactions')
          .select('title, amount, type, category, date')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(10);

        if (recentTransactions && recentTransactions.length > 0) {
          financialContextText += "\nÚltimas Transações:\n";
          recentTransactions.forEach(t => {
            const date = new Date(t.date).toLocaleDateString('pt-BR');
            financialContextText += `- ${date}: ${t.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${Number(t.amount).toFixed(2)} em "${t.title}" (${t.category})\n`;
          });
        }

        // Calcular saldo atual
        if (recentTransactions && recentTransactions.length > 0) {
          const totalReceitas = recentTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);
          
          const totalDespesas = recentTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);
          
          const saldoAtual = totalReceitas - totalDespesas;
          financialContextText += `\nSaldo Atual: R$ ${saldoAtual.toFixed(2)}\n`;
        }
      } catch (error) {
        console.log('Erro ao buscar dados financeiros:', error);
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

    const contextToUse = needsFinancialContext ? financialContextText : "Dados financeiros disponíveis mediante solicitação.";
    
    const fullPrompt = `Você é o Assistente IA do ICTUS, consultor financeiro direto e conciso.

DATA: ${today}
USUÁRIO: ${userName}
PLATAFORMA: Telegram

${needsFinancialContext ? `DADOS FINANCEIROS:${contextToUse}\n` : ''}
PERGUNTA: ${userMessage}

INSTRUÇÕES DE RESPOSTA:
- Seja DIRETO e CONCISO (máximo 4000 caracteres para Telegram)
- Responda apenas o que foi perguntado  
- NÃO use asteriscos (*) ou markdown nas respostas
- Use emojis moderadamente apenas no início da resposta
- NÃO faça análise financeira automática
- SÓ analise finanças se explicitamente solicitado
- Complete suas respostas - não corte no meio
- Sempre calcule e mostre o SALDO ATUAL do usuário quando relevante

CÁLCULO DO SALDO:
- Total de receitas MENOS total de despesas das transações recentes
- Formato: "💰 Seu saldo atual é R$ X,XX"

DETECÇÃO DE TRANSAÇÕES:
Se detectar transação (ganhar/receber/gastar/pagar + valor), responda APENAS com JSON:
{
  "tipo": "receita" ou "despesa", 
  "descrição": "descrição_breve",
  "valor": valor_numerico,
  "data": "${today}",
  "categoria": "categoria_automatica_obrigatoria"
}

CATEGORIAS OBRIGATÓRIAS PARA AUTO-CATEGORIZAÇÃO:
- "Alimentação": supermercados, restaurantes, delivery, padarias
- "Transporte": combustível, uber, taxi, ônibus, pedágios  
- "Saúde": farmácias, consultas médicas, planos de saúde
- "Entretenimento": cinema, streaming, jogos, viagens, bares
- "Habitação": aluguel, condomínio, água, luz, gás, internet
- "Educação": cursos, livros, mensalidades escolares
- "Cuidados Pessoais": salão, barbeiro, cosméticos, higiene
- "Outros": categoria genérica quando não se encaixa

Resposta direta (SEM asteriscos):`;

    const geminiPayload = {
      contents: [{ 
        role: "user", 
        parts: [{text: fullPrompt}] 
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024, // Limitado para Telegram
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
    }    const data: any = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log('✅ Resposta da IA recebida:', aiResponse.substring(0, 100) + '...');
      
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
    const { data } = await supabaseAdmin
      .from('telegram_users')
      .select('user_id, linked_at')
      .eq('chat_id', chatId)
      .single();
    
    if (data && data.user_id) {
      return { userId: data.user_id, linked: true };
    }
  } catch (error) {
    console.log('Usuário não vinculado ainda');
  }
  
  return { linked: false };
}

// Função para salvar vinculação do usuário
async function saveTelegramLink(chatId: string, code: string, username: string): Promise<boolean> {
  try {
    // Verificar se o código existe no localStorage (método temporário)
    const storedCode = localStorage.getItem('telegram_temp_code');
    if (storedCode) {
      const codeData = JSON.parse(storedCode);
      if (codeData.code === code && new Date(codeData.expires_at) > new Date()) {
        // Salvar vinculação no Supabase
        await supabaseAdmin
          .from('telegram_users')
          .upsert({
            chat_id: chatId,
            user_id: codeData.user_id,
            username: username,
            linked_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        // Remover código usado
        localStorage.removeItem('telegram_temp_code');
        return true;
      }
    }
    
    // Verificar no Supabase também (quando implementado)
    const { data } = await supabaseAdmin
      .from('telegram_codes')
      .select('user_id')
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (data) {
      await supabaseAdmin
        .from('telegram_users')
        .upsert({
          chat_id: chatId,
          user_id: data.user_id,
          username: username,
          linked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      // Marcar código como usado
      await supabaseAdmin
        .from('telegram_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('code', code);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao salvar vinculação:', error);
    return false;
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
        parse_mode: 'Markdown'
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
  console.log('🤖 Método:', req.method);
  console.log('🤖 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🤖 Body:', JSON.stringify(req.body, null, 2));
  console.log('🤖 =================================');

  // Verificar se é uma requisição POST
  if (req.method !== 'POST') {
    console.log('❌ Método não é POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }
  // Responder imediatamente para evitar timeout
  res.status(200).json({ ok: true, message: 'Webhook recebido' });

  try {
    const update = req.body;

    // Verificar se há uma mensagem
    if (!update || !update.message || !update.message.text) {
      console.log('📭 Sem mensagem de texto');
      return;
    }

    const chatId = update.message.chat.id.toString();
    const messageText = update.message.text.trim();
    const username = update.message.from.username || update.message.from.first_name || 'Usuário';

    console.log(`💬 Mensagem de ${username} (${chatId}): ${messageText}`);    // Processar comandos de forma assíncrona
    setImmediate(async () => {
      try {
        // Verificar se usuário está vinculado
        const userData = await getTelegramUserData(chatId);
        
        // Comando /start - sempre responde
        if (messageText.startsWith('/start')) {
          const code = messageText.replace('/start', '').trim();
          
          if (code) {
            console.log(`🔑 Código de vinculação recebido: ${code}`);
            
            const linkSuccess = await saveTelegramLink(chatId, code, username);
            
            if (linkSuccess) {
              await sendTelegramMessage(chatId, 
                `✅ Conta vinculada com sucesso!\n\n` +
                `🎉 Olá ${username}! Sua conta ICTUS foi conectada ao Telegram.\n\n` +
                `🤖 Agora posso ajudar você com:\n` +
                `💰 Consultas de saldo e transações\n` +
                `📊 Análises financeiras personalizadas\n` +
                `💡 Dicas e conselhos financeiros\n` +
                `📝 Registro de novas transações\n\n` +
                `💬 Digite qualquer pergunta sobre suas finanças e eu responderei com base nos seus dados reais!\n\n` +
                `_Assistente IA ICTUS ativo! 🚀_`
              );
              return;
            } else {
              await sendTelegramMessage(chatId, 
                `❌ Código inválido ou expirado\n\n` +
                `🔑 Código: \`${code}\`\n\n` +
                `💡 Para gerar um novo código:\n` +
                `1. Abra o app ICTUS\n` +
                `2. Vá para Dashboard\n` +
                `3. Clique em "Conectar Telegram"\n` +
                `4. Use o código gerado aqui\n\n` +
                `_Códigos expiram em 15 minutos_`
              );
              return;
            }
          } else {
            await sendTelegramMessage(chatId,
              '👋 Bem-vindo ao Assistente IA do ICTUS!\n\n' +
              '🤖 Sou seu assistente financeiro pessoal inteligente.\n\n' +
              '🔗 Para conectar sua conta:\n' +
              '1️⃣ Abra o app ICTUS\n' +
              '2️⃣ Vá para a Dashboard\n' +
              '3️⃣ Clique em "Conectar Telegram"\n' +
              '4️⃣ Use o código aqui: `/start SEU_CODIGO`\n\n' +
              '💡 Após conectar, poderei analisar suas finanças reais e dar conselhos personalizados!\n\n' +
              '_Digite /help para mais informações_'
            );
          }
          return;
        }

        // Comando /help
        if (messageText === '/help') {
          const helpMessage = userData.linked ? 
            '🤖 Assistente IA - ICTUS (Conectado)\n\n' +
            '✅ Sua conta está vinculada! Posso ajudar com:\n\n' +
            '� Perguntas livres sobre finanças\n' +
            '💰 "Qual meu saldo atual?"\n' +
            '📊 "Como estão meus gastos?"\n' +
            '� "Dicas para economizar"\n' +
            '📝 "Gastei R$ 50 no supermercado"\n' +
            '📈 "Análise da minha situação financeira"\n\n' +
            '🧠 Uso inteligência artificial com seus dados reais para dar respostas personalizadas!\n\n' +
            '_Faça qualquer pergunta sobre finanças!_'
            :
            '🤖 Assistente IA - ICTUS (Não conectado)\n\n' +
            '❌ Conta não vinculada\n\n' +
            '� Para vincular:\n' +
            '1. Abra o app ICTUS\n' +
            '2. Dashboard → "Conectar Telegram"\n' +
            '3. Use: `/start SEU_CODIGO`\n\n' +
            '💡 Após vincular, terei acesso aos seus dados financeiros para dar conselhos personalizados!\n\n' +
            '_Conecte-se para aproveitar todo o potencial da IA!_';
          
          await sendTelegramMessage(chatId, helpMessage);
          return;
        }

        // Verificar se é um código de conexão (sem /start)
        const codePattern = /^[0-9]{2}[A-Z]{2}$/;
        if (codePattern.test(messageText.toUpperCase())) {
          const code = messageText.toUpperCase();
          console.log(`🔑 Código direto recebido: ${code}`);
          
          const linkSuccess = await saveTelegramLink(chatId, code, username);
          
          if (linkSuccess) {
            await sendTelegramMessage(chatId, 
              `✅ Conta vinculada com sucesso!\n\n` +
              `🎉 Olá ${username}! Sua conta ICTUS foi conectada.\n\n` +
              `🤖 Agora posso analisar suas finanças reais e dar conselhos personalizados!\n\n` +
              `� Faça qualquer pergunta sobre suas finanças!\n\n` +
              `_Assistente IA ICTUS ativo! 🚀_`
            );
          } else {
            await sendTelegramMessage(chatId, 
              `❌ Código inválido: ${code}\n\n` +
              `💡 Gere um novo código no app ICTUS`
            );
          }
          return;
        }

        // NOVA FUNCIONALIDADE: Qualquer outra mensagem vai para a IA
        console.log(`🧠 Processando mensagem com IA: ${messageText}`);
        
        if (!userData.linked) {
          // Usuário não vinculado - resposta genérica da IA
          const aiResponse = await callGeminiAPI(messageText);
          const responseWithTip = aiResponse + 
            '\n\n💡 _Conecte sua conta ICTUS para análises personalizadas! Digite /help para saber como._';
          await sendTelegramMessage(chatId, responseWithTip);
        } else {
          // Usuário vinculado - resposta personalizada com dados reais
          const aiResponse = await callGeminiAPI(messageText, userData.userId);
          await sendTelegramMessage(chatId, aiResponse);
        }

      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        await sendTelegramMessage(chatId,
          '❌ Desculpe, ocorreu um erro ao processar sua mensagem.\n\n' +
          'Tente novamente em alguns instantes.\n\n' +
          '_Se o problema persistir, digite /help_'
        );
      }
    });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
  }
}
