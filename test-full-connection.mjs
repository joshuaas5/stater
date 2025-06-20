// Script para testar sistema completo de conexão Telegram-ICTUS
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hlemutzuubhrkuhevsxo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZW11dHp1dWJocmt1aGV2c3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMzQ3MTcsImV4cCI6MjA0NjkxMDcxN30.pUaQVR-YwLo6r7_N8n4rZGDCqYeGfgFEhYpyB5YkbzI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFullConnectionFlow() {
  console.log('🚀 TESTE COMPLETO DO SISTEMA DE CONEXÃO TELEGRAM\n');
  
  try {
    // 1. Simular geração de código (como no frontend)
    console.log('1️⃣ Gerando código de conexão...');
    const numbers = Math.floor(10 + Math.random() * 90).toString();
    const letters = Math.random().toString(36).substring(2, 4).toUpperCase();
    const testCode = numbers + letters;
    
    const codeData = {
      code: testCode,
      user_id: 'test-user-id-123',
      user_email: 'teste@exemplo.com',
      user_name: 'Usuário Teste',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      used_at: null
    };
    
    console.log('📋 Código:', testCode);
    console.log('⏰ Expira em:', codeData.expires_at);
    
    // 2. Inserir código no Supabase
    console.log('\n2️⃣ Salvando código no Supabase...');
    const { error: insertError } = await supabase
      .from('telegram_link_codes')
      .insert(codeData);
    
    if (insertError) {
      console.error('❌ Erro ao inserir código:', insertError.message);
      return;
    }
    console.log('✅ Código salvo no banco');
    
    // 3. Verificar se código foi salvo
    console.log('\n3️⃣ Verificando código salvo...');
    const { data: savedCode, error: selectError } = await supabase
      .from('telegram_link_codes')
      .select('*')
      .eq('code', testCode)
      .single();
    
    if (selectError || !savedCode) {
      console.error('❌ Erro ao buscar código:', selectError?.message);
      return;
    }
    console.log('✅ Código encontrado:', savedCode);
    
    // 4. Simular webhook do Telegram
    console.log('\n4️⃣ Simulando webhook do Telegram...');
    const webhookPayload = {
      message: {
        message_id: 1001,
        from: {
          id: 987654321,
          first_name: 'Teste',
          username: 'teste_user'
        },
        chat: {
          id: 987654321,
          type: 'private'
        },
        date: Math.floor(Date.now() / 1000),
        text: `/start ${testCode}`
      }
    };
    
    const webhookResponse = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/telegram-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });
    
    console.log('📡 Status webhook:', webhookResponse.status);
    const webhookResult = await webhookResponse.text();
    console.log('📄 Resposta webhook:', webhookResult);
    
    // 5. Verificar se vinculação foi criada
    console.log('\n5️⃣ Verificando vinculação criada...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar processamento
    
    const { data: linkedUser, error: linkError } = await supabase
      .from('telegram_users')
      .select('*')
      .eq('telegram_chat_id', '987654321')
      .single();
    
    if (linkError || !linkedUser) {
      console.log('❌ Vinculação não encontrada:', linkError?.message);
    } else {
      console.log('✅ Vinculação criada:', linkedUser);
    }
    
    // 6. Verificar se código foi marcado como usado
    console.log('\n6️⃣ Verificando se código foi usado...');
    const { data: usedCode, error: usedError } = await supabase
      .from('telegram_link_codes')
      .select('used_at')
      .eq('code', testCode)
      .single();
    
    if (usedError || !usedCode) {
      console.log('❌ Erro ao verificar código usado:', usedError?.message);
    } else if (usedCode.used_at) {
      console.log('✅ Código marcado como usado em:', usedCode.used_at);
    } else {
      console.log('⚠️ Código ainda não foi marcado como usado');
    }
    
    console.log('\n🏁 TESTE CONCLUÍDO!');
    
    // Limpeza
    console.log('\n🧹 Limpando dados de teste...');
    await supabase.from('telegram_link_codes').delete().eq('code', testCode);
    await supabase.from('telegram_users').delete().eq('telegram_chat_id', '987654321');
    console.log('✅ Dados de teste removidos');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testFullConnectionFlow();
