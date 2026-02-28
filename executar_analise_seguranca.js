// Script para executar análise de segurança diretamente no Supabase
// Execute com: node executar_analise_seguranca.js

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (usando as mesmas do projeto)
const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseAnonKey = 'YOUR_JWT_TOKEN';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 INICIANDO ANÁLISE DE SEGURANÇA...');
console.log('=====================================\n');

async function verificarEstadoRLS() {
  console.log('📊 1. VERIFICANDO ESTADO DO RLS...');
  
  try {
    // Query para verificar RLS das tabelas críticas
    const { data, error } = await supabase
      .rpc('check_table_rls_status', {})
      .select();

    if (error) {
      console.log('⚠️ Função RPC não existe, usando query alternativa...');
      
      // Query SQL direta (pode não funcionar com anon key)
      const { data: manualData, error: manualError } = await supabase
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .in('tablename', ['telegram_users', 'telegram_link_codes', 'audio_response_cache'])
        .eq('schemaname', 'public');

      if (manualError) {
        console.log('❌ Não conseguimos acessar metadados das tabelas com chave anon');
        console.log('   Isso é normal - precisamos usar service_role ou SQL Editor');
        console.log('   Error:', manualError.message);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.log('❌ Erro na verificação RLS:', err.message);
    return false;
  }
}

async function contarRegistros() {
  console.log('\n📈 2. CONTANDO REGISTROS (IMPACTO)...');
  
  const tabelas = ['telegram_users', 'telegram_link_codes'];
  
  for (const tabela of tabelas) {
    try {
      const { count, error } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${tabela}: Erro ao contar - ${error.message}`);
        
        // Se der erro, pode ser porque RLS está ativo e não temos dados
        if (error.code === 'PGRST116' || error.message.includes('permission denied')) {
          console.log(`✅ ${tabela}: 0 registros (ou RLS bloqueando - isso é bom!)`);
        }
      } else {
        const nivel = count === 0 ? 'Seguro' : 
                     count < 10 ? 'Baixo risco' : 
                     count < 100 ? 'Risco médio' : 'Alto risco';
        console.log(`📊 ${tabela}: ${count} registros - ${nivel}`);
      }
    } catch (err) {
      console.log(`⚠️ ${tabela}: Erro - ${err.message}`);
    }
  }
}

async function verificarView() {
  console.log('\n🔍 3. VERIFICANDO VIEW PROBLEMÁTICA...');
  
  try {
    // Tentar acessar a view audio_usage_summary
    const { data, error } = await supabase
      .from('audio_usage_summary')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('✅ View audio_usage_summary não existe - sem problemas');
      } else {
        console.log(`⚠️ View audio_usage_summary: ${error.message}`);
      }
    } else {
      console.log('🚨 View audio_usage_summary existe e é acessível');
      console.log('   Precisa ser verificada para SECURITY DEFINER');
    }
  } catch (err) {
    console.log(`⚠️ Erro ao verificar view: ${err.message}`);
  }
}

async function verificarAudioResponseCache() {
  console.log('\n🔊 4. VERIFICANDO AUDIO_RESPONSE_CACHE...');
  
  try {
    const { count, error } = await supabase
      .from('audio_response_cache')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        console.log('✅ Tabela audio_response_cache não existe - sem problemas');
      } else {
        console.log(`❌ audio_response_cache: ${error.message}`);
      }
    } else {
      console.log(`📊 audio_response_cache: ${count} registros encontrados`);
    }
  } catch (err) {
    console.log(`⚠️ Erro ao verificar audio_response_cache: ${err.message}`);
  }
}

async function testarConexao() {
  console.log('\n🔌 5. TESTANDO CONEXÃO BÁSICA...');
  
  try {
    // Testar com uma query simples
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`⚠️ Profiles: ${error.message}`);
    } else {
      console.log('✅ Conexão com Supabase funcionando');
    }
  } catch (err) {
    console.log(`❌ Erro de conexão: ${err.message}`);
  }
}

async function executarAnalise() {
  await verificarEstadoRLS();
  await contarRegistros();
  await verificarView();
  await verificarAudioResponseCache();
  await testarConexao();
  
  console.log('\n=== RESUMO DA ANÁLISE ===');
  console.log('');
  console.log('🎯 PRÓXIMOS PASSOS:');
  console.log('1. Se encontrou erros de permissão = RLS pode estar ativo (bom!)');
  console.log('2. Se tabelas têm registros = aplicar correções RLS');
  console.log('3. Se view existe = recriar sem SECURITY DEFINER');
  console.log('');
  console.log('⚠️ LIMITAÇÕES:');
  console.log('- Usando chave anon - não consegue acessar metadados do sistema');
  console.log('- Para análise completa, use service_role ou SQL Editor');
  console.log('');
  console.log('✅ ANÁLISE CONCLUÍDA!');
}

// Executar análise
executarAnalise().catch(error => {
  console.error('❌ Erro fatal na análise:', error);
  process.exit(1);
});
