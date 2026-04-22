const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// FunÃƒÂ§ÃƒÂ£o para logs
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
  logDebug('Ã°Å¸â€Â§ [TELEGRAM API] Iniciando handler...');
  
  // CORS - mais restritivo para produÃƒÂ§ÃƒÂ£o
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    logDebug('Ã°Å¸â€Â§ [TELEGRAM API] Respondendo OPTIONS');
    return res.status(200).end();
  }

  logDebug('Ã°Å¸â€Â§ [TELEGRAM API] MÃƒÂ©todo:', req.method);
  logDebug('Ã°Å¸â€Â§ [TELEGRAM API] Headers Authorization:', req.headers.authorization ? 'PRESENTE' : 'AUSENTE');

  try {
    // Teste bÃƒÂ¡sico de funcionamento da API
    if (req.method === 'GET') {
      logDebug('Ã°Å¸â€Â§ [TELEGRAM API] Respondendo GET de teste');
      return res.status(200).json({ 
        success: true, 
        message: 'API estÃƒÂ¡ funcionando',
        timestamp: new Date().toISOString(),
        supabaseUrl: supabaseUrl
      });
    }

    if (req.method !== 'POST') {
      logDebug('Ã°Å¸â€Â§ [TELEGRAM API] MÃƒÂ©todo nÃƒÂ£o permitido:', req.method);
      return res.status(405).json({ error: 'MÃƒÂ©todo nÃƒÂ£o permitido' });
    }

    // POST - Gerar cÃƒÂ³digo
    logDebug('Ã°Å¸â€Â§ [TELEGRAM API] Processando POST...');
    
    // Verificar autenticaÃƒÂ§ÃƒÂ£o
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token de autenticaÃƒÂ§ÃƒÂ£o necessÃƒÂ¡rio' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Criar cliente autenticado com o token do usuÃƒÂ¡rio
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

    // Verificar se o usuÃƒÂ¡rio estÃƒÂ¡ autenticado
    const { data: userData, error: userError } = await authenticatedSupabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      logDebug('Ã¢ÂÅ’ [TELEGRAM API] UsuÃƒÂ¡rio nÃƒÂ£o autenticado:', userError?.message);
      return res.status(401).json({ 
        success: false, 
        error: 'Token invÃƒÂ¡lido ou expirado' 
      });
    }

    logDebug('Ã¢Å“â€¦ [TELEGRAM API] UsuÃƒÂ¡rio autenticado:', userData.user.id);
    
    const { user_id, userEmail, userName } = req.body || {};
    
    // Verificar se o user_id corresponde ao usuÃƒÂ¡rio autenticado
    if (user_id !== userData.user.id) {
      return res.status(403).json({
        success: false,
        error: 'NÃƒÂ£o autorizado a gerar cÃƒÂ³digo para outro usuÃƒÂ¡rio'
      });
    }
    
    logDebug('Ã°Å¸â€Â§ [TELEGRAM API] Dados recebidos:', { user_id, userEmail, userName });
    
    if (!user_id) {
      logDebug('Ã¢ÂÅ’ [TELEGRAM API] user_id ÃƒÂ© obrigatÃƒÂ³rio');
      return res.status(400).json({ error: 'user_id ÃƒÂ© obrigatÃƒÂ³rio' });
    }

    // Teste de conexÃƒÂ£o Supabase
    logDebug('Ã°Å¸â€Â§ [TELEGRAM API] Testando conexÃƒÂ£o Supabase...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('transactions')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('Ã¢ÂÅ’ [TELEGRAM API] Falha na conexÃƒÂ£o Supabase:', testError);
        return res.status(500).json({ 
          error: 'Falha na conexÃƒÂ£o com banco de dados', 
          details: testError.message
        });
      }
      logDebug('Ã¢Å“â€¦ [TELEGRAM API] ConexÃƒÂ£o Supabase OK');
    } catch (connError: any) {
      console.error('Ã¢ÂÅ’ [TELEGRAM API] Erro na conexÃƒÂ£o:', connError);
      return res.status(500).json({ 
        error: 'Erro ao conectar com banco', 
        details: connError.message 
      });
    }

    // Ã°Å¸â€Â¥ RATE LIMITING - Verificar cÃƒÂ³digos gerados na ÃƒÂºltima hora
    logDebug('Ã°Å¸â€Â§ [TELEGRAM API] Verificando rate limiting...');
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentCodes, error: rateLimitError } = await supabase
      .from('telegram_link_codes')
      .select('id, created_at')
      .eq('user_id', user_id)
      .gte('created_at', oneHourAgo);
    
    if (rateLimitError) {
      console.error('Ã¢ÂÅ’ [TELEGRAM API] Erro ao verificar rate limit:', rateLimitError);
      return res.status(500).json({ 
        error: 'Erro ao verificar limite de cÃƒÂ³digos', 
        details: rateLimitError.message
      });
    }
    
    const RATE_LIMIT = 3; // mÃƒÂ¡ximo 3 cÃƒÂ³digos por hora
    if (recentCodes && recentCodes.length >= RATE_LIMIT) {
      logDebug(`Ã¢ÂÅ’ [TELEGRAM API] Rate limit excedido: ${recentCodes.length}/${RATE_LIMIT} cÃƒÂ³digos na ÃƒÂºltima hora`);
      return res.status(429).json({ 
        error: 'Limite de cÃƒÂ³digos por hora excedido', 
        details: `VocÃƒÂª pode gerar no mÃƒÂ¡ximo ${RATE_LIMIT} cÃƒÂ³digos por hora. Tente novamente em alguns minutos.`,
        nextAttemptIn: '1 hora',
        codesUsed: recentCodes.length,
        maxCodes: RATE_LIMIT
      });
    }
    
    logDebug(`Ã¢Å“â€¦ [TELEGRAM API] Rate limit OK: ${recentCodes?.length || 0}/${RATE_LIMIT} cÃƒÂ³digos usados`);

    // Gerar cÃƒÂ³digo ÃƒÂºnico (verificar se jÃƒÂ¡ existe e nÃƒÂ£o foi usado)
    let code;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;
    
    do {
      code = generateCode();
      attempts++;
      
      // Verificar se cÃƒÂ³digo jÃƒÂ¡ existe e se foi usado
      const { data: existingCode, error: checkError } = await supabase
        .from('telegram_link_codes')
        .select('id, used_at')
        .eq('code', code)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = nÃƒÂ£o encontrado
        console.error('Ã¢ÂÅ’ [TELEGRAM API] Erro ao verificar cÃƒÂ³digo existente:', checkError);
        return res.status(500).json({ 
          error: 'Erro ao verificar cÃƒÂ³digo', 
          details: checkError.message
        });
      }
      
      // Se cÃƒÂ³digo nÃƒÂ£o existe, podemos usar
      if (!existingCode) {
        break;
      }
      
      // Se cÃƒÂ³digo existe mas nÃƒÂ£o foi usado, gerar novo
      if (existingCode && !existingCode.used_at) {
        logDebug(`Ã°Å¸â€Â§ [TELEGRAM API] CÃƒÂ³digo ${code} jÃƒÂ¡ existe, gerando novo...`);
        continue;
      }
      
    } while (attempts < MAX_ATTEMPTS);
    
    if (attempts >= MAX_ATTEMPTS) {
      return res.status(500).json({ 
        error: 'Erro ao gerar cÃƒÂ³digo ÃƒÂºnico', 
        details: 'Tente novamente em alguns momentos.'
      });
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    logDebug('Ã°Å¸â€Â§ [TELEGRAM API] CÃƒÂ³digo gerado:', code);
    logDebug('Ã°Å¸â€Â§ [TELEGRAM API] Expira em:', expiresAt.toISOString());
    logDebug('Ã°Å¸â€Â§ [TELEGRAM API] User ID:', user_id);
    logDebug('Ã°Å¸â€Â§ [TELEGRAM API] Service role available:', !!supabaseServiceKey);

    // Tentar inserir na tabela
    logDebug('Ã°Å¸â€Â§ [TELEGRAM API] Inserindo na tabela...');
    
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
      console.error('Ã¢ÂÅ’ [TELEGRAM API] Erro ao inserir:', insertError);
      return res.status(500).json({ 
        error: 'Erro ao gerar cÃƒÂ³digo', 
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint
      });
    }

    logDebug('Ã¢Å“â€¦ [TELEGRAM API] CÃƒÂ³digo inserido com sucesso');
    return res.status(200).json({ 
      success: true, 
      code, 
      expiresAt: expiresAt.toISOString(),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Ã¢ÂÅ’ [TELEGRAM API] Erro crÃƒÂ­tico:', error);
    return res.status(500).json({ 
      error: 'Erro interno da API',
      details: error.message,
      stack: error.stack?.substring(0, 500),
      timestamp: new Date().toISOString()
    });
  }
}
