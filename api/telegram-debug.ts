import { createClient } from '@supabase/supabase-js';

// Hardcoded para teste - REMOVER DEPOIS
const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🔧 [TELEGRAM DEBUG] Iniciando teste...');

  try {
    // TESTE 1: Verificar se consegue conectar no Supabase
    console.log('🔧 [TEST 1] Testando conexão Supabase...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('transactions')
      .select('count(*)')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ [TEST 1] Falha na conexão:', connectionError);
      return res.status(500).json({ 
        error: 'Falha na conexão Supabase',
        test: 'connection',
        details: connectionError
      });
    }
    console.log('✅ [TEST 1] Conexão Supabase OK');

    // TESTE 2: Verificar se a tabela telegram_link_codes existe
    console.log('🔧 [TEST 2] Verificando tabela telegram_link_codes...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('telegram_link_codes')
      .select('count(*)')
      .limit(1);
    
    if (tableError) {
      console.error('❌ [TEST 2] Tabela não existe ou sem acesso:', tableError);
      return res.status(500).json({ 
        error: 'Tabela telegram_link_codes não acessível',
        test: 'table',
        details: tableError
      });
    }
    console.log('✅ [TEST 2] Tabela telegram_link_codes OK');

    // TESTE 3: Tentar inserir um registro de teste
    if (req.method === 'POST') {
      console.log('🔧 [TEST 3] Testando inserção...');
      const testCode = '999999';
      const testUserId = '00000000-0000-0000-0000-000000000000';
      
      const { error: insertError } = await supabase
        .from('telegram_link_codes')
        .insert([{
          code: testCode,
          user_id: testUserId,
          user_email: 'test@test.com',
          user_name: 'Test User',
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('❌ [TEST 3] Falha na inserção:', insertError);
        return res.status(500).json({ 
          error: 'Falha ao inserir na tabela',
          test: 'insert',
          details: insertError
        });
      }

      // Limpar o teste
      await supabase
        .from('telegram_link_codes')
        .delete()
        .eq('code', testCode);

      console.log('✅ [TEST 3] Inserção OK');
    }

    // TESTE 4: Processar requisição real se todos os testes passaram
    if (req.method === 'POST') {
      const { user_id, userEmail, userName } = req.body;
      
      if (!user_id) {
        return res.status(400).json({ error: 'user_id é obrigatório' });
      }

      // Gerar código real
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const { error } = await supabase
        .from('telegram_link_codes')
        .insert([{
          code,
          user_id,
          user_email: userEmail,
          user_name: userName,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('❌ [FINAL] Erro ao inserir código real:', error);
        return res.status(500).json({ 
          error: 'Erro ao gerar código',
          details: error
        });
      }

      console.log('✅ [SUCCESS] Código gerado:', code);
      return res.status(200).json({ 
        success: true, 
        code, 
        expiresAt: expiresAt.toISOString() 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Todos os testes passaram',
      tests: ['connection', 'table', 'insert']
    });

  } catch (error: any) {
    console.error('❌ [CRITICAL] Erro crítico:', error);
    return res.status(500).json({ 
      error: 'Erro crítico na API',
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
