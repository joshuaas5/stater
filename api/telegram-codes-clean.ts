import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

console.log('🔧 [ENV] Supabase URL:', supabaseUrl);
console.log('🔧 [ENV] Supabase Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(req: any, res: any) {
  console.log('🔧 [TELEGRAM API] Iniciando handler...');
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('🔧 [TELEGRAM API] Respondendo OPTIONS');
    return res.status(200).end();
  }

  console.log('🔧 [TELEGRAM API] Método:', req.method);
  console.log('🔧 [TELEGRAM API] Body:', req.body);

  try {
    // Teste básico de funcionamento da API
    if (req.method === 'GET') {
      console.log('🔧 [TELEGRAM API] Respondendo GET de teste');
      return res.status(200).json({ 
        success: true, 
        message: 'API está funcionando',
        timestamp: new Date().toISOString(),
        supabaseUrl: supabaseUrl
      });
    }

    if (req.method !== 'POST') {
      console.log('🔧 [TELEGRAM API] Método não permitido:', req.method);
      return res.status(405).json({ error: 'Método não permitido' });
    }

    // POST - Gerar código
    console.log('🔧 [TELEGRAM API] Processando POST...');
    const { user_id, userEmail, userName } = req.body || {};
    
    console.log('🔧 [TELEGRAM API] Dados recebidos:', { user_id, userEmail, userName });
    
    if (!user_id) {
      console.log('❌ [TELEGRAM API] user_id é obrigatório');
      return res.status(400).json({ error: 'user_id é obrigatório' });
    }

    // Teste de conexão Supabase
    console.log('🔧 [TELEGRAM API] Testando conexão Supabase...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('transactions')
        .select('count(*)')
        .limit(1);
      
      if (testError) {
        console.error('❌ [TELEGRAM API] Falha na conexão Supabase:', testError);
        return res.status(500).json({ 
          error: 'Falha na conexão com banco de dados', 
          details: testError.message
        });
      }
      console.log('✅ [TELEGRAM API] Conexão Supabase OK');
    } catch (connError: any) {
      console.error('❌ [TELEGRAM API] Erro na conexão:', connError);
      return res.status(500).json({ 
        error: 'Erro ao conectar com banco', 
        details: connError.message 
      });
    }

    // Gerar código
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    console.log('🔧 [TELEGRAM API] Código gerado:', code);
    console.log('🔧 [TELEGRAM API] Expira em:', expiresAt.toISOString());

    // Tentar inserir na tabela
    console.log('🔧 [TELEGRAM API] Inserindo na tabela...');
    const { error: insertError } = await supabase
      .from('telegram_link_codes')
      .insert([{
        code,
        user_id,
        user_email: userEmail,
        user_name: userName,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.error('❌ [TELEGRAM API] Erro ao inserir:', insertError);
      return res.status(500).json({ 
        error: 'Erro ao gerar código', 
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint
      });
    }

    console.log('✅ [TELEGRAM API] Código inserido com sucesso');
    return res.status(200).json({ 
      success: true, 
      code, 
      expiresAt: expiresAt.toISOString(),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [TELEGRAM API] Erro crítico:', error);
    return res.status(500).json({ 
      error: 'Erro interno da API',
      details: error.message,
      stack: error.stack?.substring(0, 500),
      timestamp: new Date().toISOString()
    });
  }
}
