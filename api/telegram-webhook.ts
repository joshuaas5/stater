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
      const fullPrompt = `Você é o Assistente IA do ICTUS, consultor financeiro direto e conciso via Telegram.

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
- NÃO mencione limitações sobre fotos ou documentos
- Complete suas respostas - não corte no meio
- Sempre calcule e mostre o SALDO ATUAL do usuário quando relevante

CÁLCULO DO SALDO:
- Total de receitas MENOS total de despesas das transações recentes
- Formato: "💰 Seu saldo atual é R$ X,XX"

DETECÇÃO DE TRANSAÇÕES:
Se detectar uma transação clara (ganhar/receber/gastar/pagar + valor específico), responda APENAS com JSON limpo:
{
  "tipo": "receita" ou "despesa", 
  "descrição": "descrição_clara",
  "valor": valor_numerico_sem_simbolos,
  "data": "${today}",
  "categoria": "categoria_automatica"
}

CATEGORIAS PARA AUTO-CATEGORIZAÇÃO:
- "Alimentação": supermercados, restaurantes, delivery, padarias
- "Transporte": combustível, uber, taxi, ônibus, pedágios  
- "Saúde": farmácias, consultas médicas, planos de saúde
- "Entretenimento": cinema, streaming, jogos, viagens, bares
- "Habitação": aluguel, condomínio, água, luz, gás, internet
- "Educação": cursos, livros, mensalidades escolares
- "Cuidados Pessoais": salão, barbeiro, cosméticos, higiene
- "Outros": categoria genérica quando não se encaixa

IMPORTANTE: Só gere JSON se for uma transação ESPECÍFICA com valor claro. Para perguntas gerais, responda normalmente.

Resposta:`;

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
    console.log('🔍 [DEBUG] Verificando vinculação para chat:', chatId);
      // Verificar via API temporária primeiro
    try {
      const response = await fetch(`https://sprout-spending-hub-vb4x.vercel.app/api/telegram-connect-simple?chatId=${chatId}`);
      const result = await response.json() as any;
      
      if (response.ok && result.success && result.connected) {
        console.log('✅ [DEBUG] Usuário encontrado na API temporária:', result.data);
        return { userId: result.data.user_id, linked: true };
      }
    } catch (apiError) {
      console.log('⚠️ [DEBUG] API temporária falhou, tentando Supabase:', apiError);
    }
    
    // Fallback para Supabase (se SERVICE_ROLE_KEY estiver configurada)
    const { data, error } = await supabaseAdmin
      .from('telegram_users')
      .select('user_id, linked_at')
      .eq('telegram_chat_id', chatId)
      .single();
    
    if (error) {
      console.log('❌ [DEBUG] Erro Supabase:', error.message);
      return { linked: false };
    }
    
    if (data && data.user_id) {
      console.log('✅ [DEBUG] Usuário encontrado no Supabase:', data.user_id);
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
    const verifyUrl = `https://sprout-spending-hub-vb4x.vercel.app/api/telegram-codes-simple?code=${code}`;
    
    console.log('🔍 [DEBUG] Verificando código via API:', verifyUrl);
    
    const response = await fetch(verifyUrl);
    const result = await response.json();
    
    console.log('� [DEBUG] Resposta da verificação:', { status: response.status, result });
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
      const markUsedResponse = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/telegram-codes-simple', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
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
    
    // Configurar o prompt para análise financeira
    const analysisPrompt = `Analise esta imagem/documento e extraia TODAS as informações financeiras relevantes.

INSTRUÇÕES ESPECÍFICAS:
- Identifique comprovantes, notas fiscais, extratos bancários, recibos
- Extraia valores, datas, estabelecimentos, descrições
- Para cada transação encontrada, forneça: valor, data, descrição, tipo (receita/despesa)
- Se for extrato bancário, liste todas as transações
- Se for nota fiscal, extraia: estabelecimento, data, valor total, itens (se relevante)
- Organize as informações de forma clara e estruturada
- Se não encontrar informações financeiras, diga que não identificou dados financeiros

FORMATO DA RESPOSTA:
Se encontrar transações, liste cada uma assim:
🧾 TRANSAÇÃO IDENTIFICADA:
- Valor: R$ X,XX
- Data: DD/MM/AAAA
- Descrição: [descrição]
- Tipo: Receita/Despesa
- Estabelecimento: [nome]

Se for um extrato, liste todas as transações encontradas.

IMPORTANTE: Seja preciso e detalhado. Se houver dúvidas sobre algum valor ou data, mencione.`;

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
        
        // Verificar se é PDF - usar a API do app ICTUS
        if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
          console.log('📄 PDF detectado - usando API do app ICTUS...');
          
          try {
            // Converter para base64 para enviar para a API
            const base64Data = fileBuffer.toString('base64');
            
            // Chamar a API de OCR do app ICTUS
            const ocrResponse = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/gemini-ocr', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileType: 'pdf',
                fileData: base64Data,
                fileName: fileName,
                prompt: 'Analise este documento e extraia todas as informações financeiras (valores, datas, transações, estabelecimentos). Organize de forma clara e estruturada.'
              })
            });
              if (ocrResponse.ok) {
              const ocrResult = await ocrResponse.json() as any;
              const analysisText = ocrResult.extractedText || ocrResult.analysis || 'Análise concluída com sucesso.';
              
              await sendTelegramMessage(chatId, 
                `📄 <b>Análise do PDF concluída!</b>\n\n${analysisText}\n\n💡 <i>Posso ajudar com mais alguma coisa sobre este documento?</i>`
              );
            } else {
              throw new Error('Erro na API de OCR');
            }
            
          } catch (pdfError) {
            console.error('❌ Erro ao processar PDF:', pdfError);
            await sendTelegramMessage(chatId, 
              '📄 PDF recebido!\n\n❌ Infelizmente, tive um problema ao processar este PDF.\n\n💡 Soluções:\n• Tire uma foto das páginas importantes\n• Verifique se o PDF não está protegido por senha\n• Tente novamente em alguns instantes\n\nDesculpe pelo inconveniente!'
            );
          }
          
        } else {
          // Para imagens e outros documentos - usar Gemini Vision diretamente
          console.log('🖼️ Processando imagem com Gemini Vision...');
          
          const analysis = await processDocumentWithAI(fileBuffer, fileName, mimeType);
          
          await sendTelegramMessage(chatId, 
            `📸 <b>Análise concluída!</b>\n\n${analysis}\n\n💡 <i>Posso ajudar com mais alguma coisa sobre este documento?</i>`
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
      }      // Comando /conectar - NOVO SISTEMA INTUITIVO
      if (messageText === '/conectar') {
        console.log('🔗 Processando comando /conectar');
        
        // Gerar código automaticamente para este chat ID
        try {
          const response = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/telegram-codes-simple?action=generate', {
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
              '2️⃣ Abra: <a href="https://sprout-spending-hub-vb4x.vercel.app">sprout-spending-hub-vb4x.vercel.app</a>\n' +
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
            '🔗 <b>Conectar sua conta ICTUS - SIMPLES!</b>\n\n' +
            '📱 <b>PASSO 1:</b> Copie este número:\n' +
            '👉 <code>' + chatId + '</code>\n\n' +
            '📱 <b>PASSO 2:</b> Abra este link:\n' +
            '👉 <a href="https://sprout-spending-hub-vb4x.vercel.app">sprout-spending-hub-vb4x.vercel.app</a>\n\n' +
            '📱 <b>PASSO 3:</b> Faça login\n\n' +
            '📱 <b>PASSO 4:</b> Clique "Conectar Agora"\n\n' +
            '📱 <b>PASSO 5:</b> Cole o número do PASSO 1\n\n' +
            '📱 <b>PASSO 6:</b> Volte aqui e teste: "Qual meu saldo?"\n\n' +
            '✅ <b>Pronto!</b> Super fácil!'
          );
        }
        
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
            `🎉 Olá ${username}! Sua conta ICTUS foi conectada.\n\n` +
            `🤖 Agora posso analisar suas finanças reais e dar conselhos personalizados!\n\n` +
            `💬 <b>Experimente:</b>\n` +
            `• "Qual meu saldo atual?"\n` +
            `• "Análise dos meus gastos"\n` +
            `• "Como economizar dinheiro?"\n\n` +
            `Assistente IA ICTUS ativo! 🚀`
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
        await sendTelegramMessage(chatId, responseWithTip);      } else {
        console.log('🔒 Usuário vinculado - resposta personalizada');
        // Usuário vinculado - resposta personalizada com dados reais
        const aiResponse = await callGeminiAPI(messageText, userData.userId);
        
        // Verificar se a resposta é uma transação JSON
        if (aiResponse.trim().startsWith('{') && aiResponse.includes('"tipo"')) {
          console.log('💰 Detectada transação JSON, processando...');
          
          try {
            const transactionData = JSON.parse(aiResponse.trim());
            
            // Validar dados da transação
            if (transactionData.tipo && transactionData.valor && transactionData.descrição) {
              console.log('📊 Dados da transação:', transactionData);
              
              // Enviar confirmação ao usuário
              await sendTelegramMessage(chatId, 
                `✅ <b>Transação detectada!</b>\n\n` +
                `📝 <b>Descrição:</b> ${transactionData.descrição}\n` +
                `💰 <b>Valor:</b> R$ ${transactionData.valor}\n` +
                `📂 <b>Categoria:</b> ${transactionData.categoria}\n` +
                `📅 <b>Data:</b> ${transactionData.data}\n` +
                `🏷️ <b>Tipo:</b> ${transactionData.tipo === 'receita' ? 'Receita' : 'Despesa'}\n\n` +
                `🎯 <b>Para salvar esta transação:</b>\n` +
                `Vá para o app ICTUS e adicione manualmente.\n\n` +
                `💡 <i>Em breve, poderei salvar automaticamente!</i>`
              );
            } else {
              // Dados incompletos, enviar resposta normal
              await sendTelegramMessage(chatId, aiResponse);
            }
          } catch (jsonError) {
            console.log('❌ Erro ao processar JSON:', jsonError);
            // Se não for JSON válido, enviar resposta normal
            await sendTelegramMessage(chatId, aiResponse);
          }
        } else {
          // Resposta normal da IA
          await sendTelegramMessage(chatId, aiResponse);
        }
      }      return res.status(200).json({ ok: true, message: 'Mensagem IA processada' });

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
