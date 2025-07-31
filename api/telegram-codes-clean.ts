const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Função para logs apenas em desenvolvimento
const logDebug = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = async function handler(req: any, res: any) {
  logDebug('🔧 [TELEGRAM API] Iniciando handler...');
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    logDebug('🔧 [TELEGRAM API] Respondendo OPTIONS');
    return res.status(200).end();
  }

  logDebug('🔧 [TELEGRAM API] Método:', req.method);
  logDebug('🔧 [TELEGRAM API] Body:', req.body);

  try {
    // Teste básico de funcionamento da API
    if (req.method === 'GET') {
      logDebug('🔧 [TELEGRAM API] Respondendo GET de teste');
      return res.status(200).json({ 
        success: true, 
        message: 'API está funcionando',
        timestamp: new Date().toISOString(),
        supabaseUrl: supabaseUrl
      });
    }

    if (req.method !== 'POST') {
      logDebug('🔧 [TELEGRAM API] Método não permitido:', req.method);
      return res.status(405).json({ error: 'Método não permitido' });
    }

    // POST - Gerar código
    logDebug('🔧 [TELEGRAM API] Processando POST...');
    const { user_id, userEmail, userName } = req.body || {};
    
    logDebug('🔧 [TELEGRAM API] Dados recebidos:', { user_id, userEmail, userName });
    
    if (!user_id) {
      logDebug('❌ [TELEGRAM API] user_id é obrigatório');
      return res.status(400).json({ error: 'user_id é obrigatório' });
    }

    // Teste de conexão Supabase
    logDebug('🔧 [TELEGRAM API] Testando conexão Supabase...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('transactions')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('❌ [TELEGRAM API] Falha na conexão Supabase:', testError);
        return res.status(500).json({ 
          error: 'Falha na conexão com banco de dados', 
          details: testError.message
        });
      }
      logDebug('✅ [TELEGRAM API] Conexão Supabase OK');
    } catch (connError: any) {
      console.error('❌ [TELEGRAM API] Erro na conexão:', connError);
      return res.status(500).json({ 
        error: 'Erro ao conectar com banco', 
        details: connError.message 
      });
    }

    // 🔥 RATE LIMITING - Verificar códigos gerados na última hora
    logDebug('🔧 [TELEGRAM API] Verificando rate limiting...');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentCodes, error: rateLimitError } = await (supabaseAdmin || supabase)
      .from('telegram_link_codes')
      .select('id, created_at')
      .eq('user_id', user_id)
      .gte('created_at', oneHourAgo);
    
    if (rateLimitError) {
      console.error('❌ [TELEGRAM API] Erro ao verificar rate limit:', rateLimitError);
      return res.status(500).json({ 
        error: 'Erro ao verificar limite de códigos', 
        details: rateLimitError.message
      });
    }
    
    const RATE_LIMIT = 3; // máximo 3 códigos por hora
    if (recentCodes && recentCodes.length >= RATE_LIMIT) {
      logDebug(`❌ [TELEGRAM API] Rate limit excedido: ${recentCodes.length}/${RATE_LIMIT} códigos na última hora`);
      return res.status(429).json({ 
        error: 'Limite de códigos por hora excedido', 
        details: `Você pode gerar no máximo ${RATE_LIMIT} códigos por hora. Tente novamente em alguns minutos.`,
        nextAttemptIn: '1 hora',
        codesUsed: recentCodes.length,
        maxCodes: RATE_LIMIT
      });
    }
    
    logDebug(`✅ [TELEGRAM API] Rate limit OK: ${recentCodes?.length || 0}/${RATE_LIMIT} códigos usados`);

    // Gerar código
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    logDebug('🔧 [TELEGRAM API] Código gerado:', code);
    logDebug('🔧 [TELEGRAM API] Expira em:', expiresAt.toISOString());

    // Tentar inserir na tabela
    logDebug('🔧 [TELEGRAM API] Inserindo na tabela...');
    
    // Usar supabaseAdmin se disponível (contorna RLS), senão usar supabase normal
    const clientToUse = supabaseAdmin || supabase;
    logDebug('🔧 [TELEGRAM API] Usando cliente:', supabaseAdmin ? 'ADMIN (service_role)' : 'NORMAL (anon)');
    
    const { error: insertError } = await clientToUse
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

    logDebug('✅ [TELEGRAM API] Código inserido com sucesso');
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
