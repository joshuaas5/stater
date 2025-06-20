// API Webhook do Telegram - Integração Completa com Assistente IA (CORRIGIDO)
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
    }

    const data: any = await response.json();
    
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
    console.log('🔍 Verificando vinculação para chat:', chatId);
    
    // Verificar na tabela correta do SQL
    const { data, error } = await supabaseAdmin
      .from('telegram_users')
      .select('user_id, linked_at')
      .eq('telegram_chat_id', chatId)
      .single();
    
    if (error) {
      console.log('❌ Erro ao verificar vinculação:', error.message);
      return { linked: false };
    }
    
    if (data && data.user_id) {
      console.log('✅ Usuário vinculado encontrado:', data.user_id);
      return { userId: data.user_id, linked: true };
    }
  } catch (error) {
    console.log('❌ Exceção ao verificar vinculação:', error);
  }
  
  console.log('❌ Usuário não vinculado');
  return { linked: false };
}

// Função para salvar vinculação do usuário
async function saveTelegramLink(chatId: string, code: string, username: string): Promise<boolean> {
  try {
    console.log('💾 Tentando salvar vinculação:', { chatId, code, username });
    
    // Primeiro, verificar se o código existe e é válido
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('telegram_link_codes')
      .select('user_id, user_email, user_name, expires_at')
      .eq('code', code)
      .is('used_at', null) // Código não usado ainda
      .single();
    
    if (codeError || !codeData) {
      console.log('❌ Código não encontrado ou já usado:', codeError?.message);
      return false;
    }
    
    // Verificar se não expirou
    if (new Date(codeData.expires_at) < new Date()) {
      console.log('❌ Código expirado');
      return false;
    }
    
    console.log('✅ Código válido encontrado para usuário:', codeData.user_id);
    
    // Salvar vinculação na tabela de usuários do Telegram
    const { error: linkError } = await supabaseAdmin
      .from('telegram_users')
      .upsert({
        telegram_chat_id: chatId,
        user_id: codeData.user_id,
        user_email: codeData.user_email,
        user_name: codeData.user_name,
        linked_at: new Date().toISOString(),
        is_active: true
      });
    
    if (linkError) {
      console.error('❌ Erro ao salvar vinculação:', linkError.message);
      return false;
    }
    
    // Marcar código como usado
    const { error: updateError } = await supabaseAdmin
      .from('telegram_link_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('code', code);
    
    if (updateError) {
      console.error('❌ Erro ao marcar código como usado:', updateError.message);
    }
    
    console.log('✅ Vinculação salva com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Exceção ao salvar vinculação:', error);
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
    const update = req.body;

    // Verificar se há uma mensagem
    if (!update || !update.message || !update.message.text) {
      console.log('📭 Sem mensagem de texto no update');
      // Responder OK mesmo assim para evitar reenvios
      return res.status(200).json({ ok: true, message: 'Update recebido mas sem mensagem de texto' });
    }

    const chatId = update.message.chat.id.toString();
    const messageText = update.message.text.trim();
    const username = update.message.from.username || update.message.from.first_name || 'Usuário';

    console.log(`💬 Mensagem de ${username} (${chatId}): ${messageText}`);

    // Processar comandos de forma SÍNCRONA (corrigido para Vercel)
    try {
      console.log('🔄 Processando mensagem...');
      
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
              `🎉 Olá ${username}! Sua conta ICTUS foi conectada ao Telegram.\n\n` +
              `🤖 Agora posso ajudar você com:\n` +
              `💰 Consultas de saldo e transações\n` +
              `📊 Análises financeiras personalizadas\n` +
              `💡 Dicas e conselhos financeiros\n` +
              `📝 Registro de novas transações\n\n` +
              `💬 Digite qualquer pergunta sobre suas finanças e eu responderei com base nos seus dados reais!\n\n` +
              `Assistente IA ICTUS ativo! 🚀`
            );          } else {
            console.log('❌ Falha na vinculação');
            await sendTelegramMessage(chatId, 
              `❌ <b>Código inválido ou expirado</b>\n\n` +
              `🔑 Código tentado: <code>${code}</code>\n\n` +
              `💡 <b>Soluções:</b>\n` +
              `• Digite <b>/conectar</b> para instruções completas\n` +
              `• Gere um novo código no app ICTUS\n` +
              `• Códigos expiram em 15 minutos\n\n` +
              `🔗 App: <a href="https://sprout-spending-hub-vb4x.vercel.app">sprout-spending-hub-vb4x.vercel.app</a>`
            );
          }} else {
          console.log('🆕 Comando /start sem código');
          await sendTelegramMessage(chatId,
            '👋 <b>Bem-vindo ao Assistente IA do ICTUS!</b>\n\n' +
            '🤖 Sou seu assistente financeiro pessoal inteligente.\n\n' +
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
          '🤖 <b>Assistente IA - ICTUS</b>\n\n' +
          '💬 <b>Como usar:</b>\n' +
          '• Digite qualquer pergunta sobre finanças\n' +
          '• Exemplo: "Como economizar dinheiro?"\n' +
          '• Exemplo: "Dicas de investimento"\n\n' +
          '🔗 <b>Para conectar sua conta:</b>\n' +
          '• Use: <b>/conectar</b> (mais fácil!)\n' +
          '• Ou abra o app → Dashboard → "Conectar Telegram"\n\n' +
          '💡 <i>Após conectar, terei acesso aos seus dados para análises personalizadas!</i>'
        );
        return res.status(200).json({ ok: true, message: 'Comando /help processado' });
      }

      // Comando /conectar - NOVO SISTEMA INTUITIVO
      if (messageText === '/conectar') {
        console.log('🔗 Processando comando /conectar');
        await sendTelegramMessage(chatId,
          '🔗 <b>Conectar Conta ICTUS</b>\n\n' +
          '✨ <b>Método Rápido:</b>\n' +
          '1️⃣ Abra: <a href="https://sprout-spending-hub-vb4x.vercel.app">sprout-spending-hub-vb4x.vercel.app</a>\n' +
          '2️⃣ Faça login na sua conta\n' +
          '3️⃣ Vá para Dashboard\n' +
          '4️⃣ Clique em "Conectar Telegram"\n' +
          '5️⃣ Cole o código aqui no chat\n\n' +
          '💡 <b>Seu Chat ID:</b> <code>' + chatId + '</code>\n' +
          '📋 <i>Use este ID se precisar conectar manualmente</i>\n\n' +
          '⏱️ <b>Códigos expiram em 15 minutos</b>\n' +
          '🔄 Digite /conectar novamente se precisar de ajuda'
        );
        return res.status(200).json({ ok: true, message: 'Comando /conectar processado' });
      }// Comando /dashboard (novo)
      if (messageText === '/dashboard') {
        console.log('📊 Processando comando /dashboard');
        await sendTelegramMessage(chatId,
          '📊 <b>Dashboard ICTUS</b>\n\n' +
          '🔗 Acesse: <a href="https://sprout-spending-hub-vb4x.vercel.app">sprout-spending-hub-vb4x.vercel.app</a>\n\n' +
          '📱 <b>No dashboard você pode:</b>\n' +
          '• Ver suas transações\n' +
          '• Gerar códigos do Telegram\n' +
          '• Analisar seus gastos\n' +
          '• Usar o Assistente IA\n\n' +
          '💡 <i>Conecte sua conta aqui no Telegram para acesso direto!</i>'
        );
        return res.status(200).json({ ok: true, message: 'Comando /dashboard processado' });
      }

      // Verificar se é um código de conexão (sem /start)
      const codePattern = /^[0-9]{2}[A-Z]{2}$/;
      if (codePattern.test(messageText.toUpperCase())) {
        console.log('🔑 Código direto detectado');
        const code = messageText.toUpperCase();
        console.log(`🔑 Código direto recebido: ${code}`);
        
        const linkSuccess = await saveTelegramLink(chatId, code, username);
        
        if (linkSuccess) {
          await sendTelegramMessage(chatId, 
            `✅ Conta vinculada com sucesso!\n\n` +
            `🎉 Olá ${username}! Sua conta ICTUS foi conectada.\n\n` +
            `🤖 Agora posso analisar suas finanças reais e dar conselhos personalizados!\n\n` +
            `💬 Faça qualquer pergunta sobre suas finanças!\n\n` +
            `Assistente IA ICTUS ativo! 🚀`
          );        } else {
          await sendTelegramMessage(chatId, 
            `❌ <b>Código inválido: ${code}</b>\n\n` +
            `💡 <b>Tente:</b>\n` +
            `• Digite <b>/conectar</b> para instruções\n` +
            `• Gere um novo código no app\n` +
            `• Verifique se não expirou (15 min)\n\n` +
            `🔗 <a href="https://sprout-spending-hub-vb4x.vercel.app">Abrir App ICTUS</a>`
          );
        }
        return res.status(200).json({ ok: true, message: 'Código processado' });
      }

      // FUNCIONALIDADE PRINCIPAL: Qualquer outra mensagem vai para a IA
      console.log(`🧠 Processando mensagem com IA: ${messageText}`);
      
      // Verificar se usuário está vinculado
      const userData = await getTelegramUserData(chatId);
      console.log('👤 Status do usuário:', userData);
        if (!userData.linked) {
        console.log('🔓 Usuário não vinculado - resposta genérica');
        // Usuário não vinculado - resposta genérica da IA
        const aiResponse = await callGeminiAPI(messageText);
        const responseWithTip = aiResponse + 
          '\n\n💡 <b>Conecte sua conta para análises personalizadas!</b>\n' +
          'Digite <b>/conectar</b> para instruções fáceis.';
        await sendTelegramMessage(chatId, responseWithTip);
      } else {
        console.log('🔒 Usuário vinculado - resposta personalizada');
        // Usuário vinculado - resposta personalizada com dados reais
        const aiResponse = await callGeminiAPI(messageText, userData.userId);
        await sendTelegramMessage(chatId, aiResponse);
      }

      return res.status(200).json({ ok: true, message: 'Mensagem IA processada' });

    } catch (processingError) {
      console.error('❌ Erro ao processar mensagem:', processingError);
      await sendTelegramMessage(chatId,
        '❌ Desculpe, ocorreu um erro ao processar sua mensagem.\n\n' +
        'Tente novamente em alguns instantes.\n\n' +
        'Se o problema persistir, digite /help'
      );
      return res.status(200).json({ ok: true, message: 'Erro tratado' });
    }
  } catch (error) {
    console.error('❌ Erro crítico no webhook:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
