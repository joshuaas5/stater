// Script para criar tabelas do Telegram diretamente no Supabase
const https = require('https');

async function createTables() {
  console.log('🛠️ Criando tabelas do Telegram no Supabase...');
  
  const data = JSON.stringify({});
  
  const options = {
    hostname: 'sprout-spending-hub-vb4x.vercel.app',
    port: 443,
    path: '/api/create-telegram-tables',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        console.log(`📡 Status: ${res.statusCode}`);
        console.log(`📄 Response:`, body);
        
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Aguardar um pouco e tentar
setTimeout(async () => {
  try {
    console.log('⏳ Aguardando deploy...');
    await createTables();
    console.log('✅ Tabelas criadas com sucesso!');
    
    // Testar a API telegram-connect-simple
    console.log('\n🧪 Testando API telegram-connect-simple...');
    
    const testOptions = {
      hostname: 'sprout-spending-hub-vb4x.vercel.app',
      port: 443,
      path: '/api/telegram-connect-simple?chatId=123456789',
      method: 'GET'
    };
    
    const testReq = https.request(testOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`📡 Test Status: ${res.statusCode}`);
        console.log(`📄 Test Response:`, body);
      });
    });
    
    testReq.end();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    // Se falhar, mostrar SQL manual
    console.log('\n📋 Execute este SQL manualmente no Supabase:');
    console.log(`
-- Criar tabela telegram_users
CREATE TABLE IF NOT EXISTS public.telegram_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Criar tabela telegram_link_codes
CREATE TABLE IF NOT EXISTS public.telegram_link_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_telegram_users_chat_id ON public.telegram_users(telegram_chat_id);
    `);
  }
}, 5000); // Aguardar 5 segundos
