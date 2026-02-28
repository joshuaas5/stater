const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_JWT_TOKEN';

// Função para logs
const logDebug = (message: string, data?: any) => {
  console.log(message, data);
};

// Primeiro tentar com service role, depois com anon key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  }) : 
  createClient(supabaseUrl, supabaseKey);

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = async function handler(req: any, res: any) {
  logDebug('🔧 [TELEGRAM API] Iniciando handler...');
  
  // CORS - mais restritivo para produção
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    logDebug('🔧 [TELEGRAM API] Respondendo OPTIONS');
    return res.status(200).end();
  }

  logDebug('🔧 [TELEGRAM API] Método:', req.method);
  logDebug('🔧 [TELEGRAM API] Headers Authorization:', req.headers.authorization ? 'PRESENTE' : 'AUSENTE');

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
    
    // Verificar autenticação
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token de autenticação necessário' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Criar cliente autenticado com o token do usuário
    const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verificar se o usuário está autenticado
    const { data: userData, error: userError } = await authenticatedSupabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      logDebug('❌ [TELEGRAM API] Usuário não autenticado:', userError?.message);
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido ou expirado' 
      });
    }

    logDebug('✅ [TELEGRAM API] Usuário autenticado:', userData.user.id);
    
    const { user_id, userEmail, userName } = req.body || {};
    
    // Verificar se o user_id corresponde ao usuário autenticado
    if (user_id !== userData.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado a gerar código para outro usuário'
      });
    }
    
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
    
    const { data: recentCodes, error: rateLimitError } = await supabase
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

    // Gerar código único (verificar se já existe e não foi usado)
    let code;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;
    
    do {
      code = generateCode();
      attempts++;
      
      // Verificar se código já existe e se foi usado
      const { data: existingCode, error: checkError } = await supabase
        .from('telegram_link_codes')
        .select('id, used_at')
        .eq('code', code)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = não encontrado
        console.error('❌ [TELEGRAM API] Erro ao verificar código existente:', checkError);
        return res.status(500).json({ 
          error: 'Erro ao verificar código', 
          details: checkError.message
        });
      }
      
      // Se código não existe, podemos usar
      if (!existingCode) {
        break;
      }
      
      // Se código existe mas não foi usado, gerar novo
      if (existingCode && !existingCode.used_at) {
        logDebug(`🔧 [TELEGRAM API] Código ${code} já existe, gerando novo...`);
        continue;
      }
      
    } while (attempts < MAX_ATTEMPTS);
    
    if (attempts >= MAX_ATTEMPTS) {
      return res.status(500).json({ 
        error: 'Erro ao gerar código único', 
        details: 'Tente novamente em alguns momentos.'
      });
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    logDebug('🔧 [TELEGRAM API] Código gerado:', code);
    logDebug('🔧 [TELEGRAM API] Expira em:', expiresAt.toISOString());
    logDebug('🔧 [TELEGRAM API] User ID:', user_id);
    logDebug('🔧 [TELEGRAM API] Service role available:', !!supabaseServiceKey);

    // Tentar inserir na tabela
    logDebug('🔧 [TELEGRAM API] Inserindo na tabela...');
    
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
