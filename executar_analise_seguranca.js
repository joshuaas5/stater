// Script para executar anÃ¡lise de seguranÃ§a diretamente no Supabase
// Execute com: node executar_analise_seguranca.js

const { createClient } = require('@supabase/supabase-js');

// ConfiguraÃ§Ã£o do Supabase (usando as mesmas do projeto)
const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseAnonKey = 'YOUR_JWT_TOKEN';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('ðŸ” INICIANDO ANÃLISE DE SEGURANÃ‡A...');
console.log('=====================================\n');

async function verificarEstadoRLS() {
  console.log('ðŸ“Š 1. VERIFICANDO ESTADO DO RLS...');
  
  try {
    // Query para verificar RLS das tabelas crÃ­ticas
    const { data, error } = await supabase
      .rpc('check_table_rls_status', {})
      .select();

    if (error) {
      console.log('âš ï¸ FunÃ§Ã£o RPC nÃ£o existe, usando query alternativa...');
      
      // Query SQL direta (pode nÃ£o funcionar com anon key)
      const { data: manualData, error: manualError } = await supabase
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .in('tablename', ['telegram_users', 'telegram_link_codes', 'audio_response_cache'])
        .eq('schemaname', 'public');

      if (manualError) {
        console.log('âŒ NÃ£o conseguimos acessar metadados das tabelas com chave anon');
        console.log('   Isso Ã© normal - precisamos usar service_role ou SQL Editor');
        console.log('   Error:', manualError.message);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.log('âŒ Erro na verificaÃ§Ã£o RLS:', err.message);
    return false;
  }
}

async function contarRegistros() {
  console.log('\nðŸ“ˆ 2. CONTANDO REGISTROS (IMPACTO)...');
  
  const tabelas = ['telegram_users', 'telegram_link_codes'];
  
  for (const tabela of tabelas) {
    try {
      const { count, error } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`âŒ ${tabela}: Erro ao contar - ${error.message}`);
        
        // Se der erro, pode ser porque RLS estÃ¡ ativo e nÃ£o temos dados
        if (error.code === 'PGRST116' || error.message.includes('permission denied')) {
          console.log(`âœ… ${tabela}: 0 registros (ou RLS bloqueando - isso Ã© bom!)`);
        }
      } else {
        const nivel = count === 0 ? 'Seguro' : 
                     count < 10 ? 'Baixo risco' : 
                     count < 100 ? 'Risco mÃ©dio' : 'Alto risco';
        console.log(`ðŸ“Š ${tabela}: ${count} registros - ${nivel}`);
      }
    } catch (err) {
      console.log(`âš ï¸ ${tabela}: Erro - ${err.message}`);
    }
  }
}

async function verificarView() {
  console.log('\nðŸ” 3. VERIFICANDO VIEW PROBLEMÃTICA...');
  
  try {
    // Tentar acessar a view audio_usage_summary
    const { data, error } = await supabase
      .from('audio_usage_summary')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('âœ… View audio_usage_summary nÃ£o existe - sem problemas');
      } else {
        console.log(`âš ï¸ View audio_usage_summary: ${error.message}`);
      }
    } else {
      console.log('ðŸš¨ View audio_usage_summary existe e Ã© acessÃ­vel');
      console.log('   Precisa ser verificada para SECURITY DEFINER');
    }
  } catch (err) {
    console.log(`âš ï¸ Erro ao verificar view: ${err.message}`);
  }
}

async function verificarAudioResponseCache() {
  console.log('\nðŸ”Š 4. VERIFICANDO AUDIO_RESPONSE_CACHE...');
  
  try {
    const { count, error } = await supabase
      .from('audio_response_cache')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        console.log('âœ… Tabela audio_response_cache nÃ£o existe - sem problemas');
      } else {
        console.log(`âŒ audio_response_cache: ${error.message}`);
      }
    } else {
      console.log(`ðŸ“Š audio_response_cache: ${count} registros encontrados`);
    }
  } catch (err) {
    console.log(`âš ï¸ Erro ao verificar audio_response_cache: ${err.message}`);
  }
}

async function testarConexao() {
  console.log('\nðŸ”Œ 5. TESTANDO CONEXÃƒO BÃSICA...');
  
  try {
    // Testar com uma query simples
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`âš ï¸ Profiles: ${error.message}`);
    } else {
      console.log('âœ… ConexÃ£o com Supabase funcionando');
    }
  } catch (err) {
    console.log(`âŒ Erro de conexÃ£o: ${err.message}`);
  }
}

async function executarAnalise() {
  await verificarEstadoRLS();
  await contarRegistros();
  await verificarView();
  await verificarAudioResponseCache();
  await testarConexao();
  
  console.log('\n=== RESUMO DA ANÃLISE ===');
  console.log('');
  console.log('ðŸŽ¯ PRÃ“XIMOS PASSOS:');
  console.log('1. Se encontrou erros de permissÃ£o = RLS pode estar ativo (bom!)');
  console.log('2. Se tabelas tÃªm registros = aplicar correÃ§Ãµes RLS');
  console.log('3. Se view existe = recriar sem SECURITY DEFINER');
  console.log('');
  console.log('âš ï¸ LIMITAÃ‡Ã•ES:');
  console.log('- Usando chave anon - nÃ£o consegue acessar metadados do sistema');
  console.log('- Para anÃ¡lise completa, use service_role ou SQL Editor');
  console.log('');
  console.log('âœ… ANÃLISE CONCLUÃDA!');
}

// Executar anÃ¡lise
executarAnalise().catch(error => {
  console.error('âŒ Erro fatal na anÃ¡lise:', error);
  process.exit(1);
});
