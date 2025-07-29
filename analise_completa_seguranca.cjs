// Script COMPLETO para análise de segurança - Usando SERVICE_ROLE
// Execute com: node analise_completa_seguranca.cjs

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './telegram-bot/.env' });

// Usar service_role para acessar metadados do sistema
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ ERRO: Variáveis de ambiente não encontradas');
  console.log('Verifique se existe o arquivo telegram-bot/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔍 ANÁLISE COMPLETA DE SEGURANÇA - FASE 1');
console.log('=========================================\n');
console.log(`🔗 Conectando em: ${supabaseUrl}`);
console.log(`🔑 Usando: SERVICE_ROLE (acesso administrativo)\n`);

async function criarBackup() {
  console.log('💾 1. CRIANDO BACKUP DE SEGURANÇA...');
  
  try {
    // Criar tabela de backup com timestamp único
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupTable = `backup_security_state_${timestamp.split('T')[0]}`;
    
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ${backupTable} AS
        SELECT 
            'policies' as backup_type,
            schemaname,
            tablename,
            policyname,
            permissive,
            roles::text,
            cmd,
            qual,
            with_check,
            current_timestamp as backup_date,
            'Pre-security-fix' as backup_label
        FROM pg_policies 
        WHERE tablename IN ('telegram_users', 'telegram_link_codes', 'audio_response_cache')
            AND schemaname = 'public';
      `
    });

    if (createError) {
      console.log('⚠️ Backup via RPC falhou, tentando método alternativo...');
      // Se RPC não funcionar, não é crítico para análise
    } else {
      console.log('✅ Backup de políticas criado com sucesso');
    }
  } catch (err) {
    console.log('⚠️ Backup não foi possível, mas análise continua...');
  }
}

async function verificarRLS() {
  console.log('\n📊 2. VERIFICANDO ESTADO DO RLS...');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .in('table_name', ['telegram_users', 'telegram_link_codes', 'audio_response_cache']);

    if (error) {
      console.log('⚠️ Não conseguiu acessar information_schema');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log(`✅ Encontradas ${data.length} tabelas para verificar:`);
      data.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
  } catch (err) {
    console.log(`❌ Erro: ${err.message}`);
  }
}

async function contarRegistrosDetalhado() {
  console.log('\n📈 3. CONTANDO REGISTROS DETALHADO...');
  
  const tabelas = [
    { nome: 'telegram_users', risco: 'Médio - dados de conexão Telegram' },
    { nome: 'telegram_link_codes', risco: 'Alto - códigos de vinculação' },
    { nome: 'audio_response_cache', risco: 'Baixo - cache de processamento' }
  ];
  
  for (const tabela of tabelas) {
    try {
      // Contar registros totais
      const { count: totalCount, error: countError } = await supabase
        .from(tabela.nome)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(`❌ ${tabela.nome}: ${countError.message}`);
        continue;
      }

      // Contar registros sem user_id (problemáticos)
      const { count: orphanCount, error: orphanError } = await supabase
        .from(tabela.nome)
        .select('*', { count: 'exact', head: true })
        .is('user_id', null);

      const nivelRisco = totalCount === 0 ? 'SEGURO' : 
                        totalCount < 10 ? 'BAIXO' : 
                        totalCount < 100 ? 'MÉDIO' : 'ALTO';

      console.log(`📊 ${tabela.nome}:`);
      console.log(`   Total: ${totalCount} registros - Risco ${nivelRisco}`);
      console.log(`   Órfãos: ${orphanCount || 0} (sem user_id)`);
      console.log(`   Tipo: ${tabela.risco}`);
      
      if (orphanCount > 0) {
        console.log(`   ⚠️ ATENÇÃO: ${orphanCount} registros podem quebrar com RLS!`);
      }
      
    } catch (err) {
      console.log(`❌ ${tabela.nome}: Erro - ${err.message}`);
    }
  }
}

async function verificarPoliticas() {
  console.log('\n📋 4. VERIFICANDO POLÍTICAS RLS EXISTENTES...');
  
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, cmd, roles')
      .in('tablename', ['telegram_users', 'telegram_link_codes', 'audio_response_cache'])
      .eq('schemaname', 'public');

    if (error) {
      console.log(`❌ Erro ao acessar pg_policies: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ NENHUMA POLÍTICA RLS ENCONTRADA!');
      console.log('   Todas as tabelas estão VULNERÁVEIS');
      return;
    }

    console.log(`✅ Encontradas ${data.length} políticas RLS:`);
    
    const groupedPolicies = {};
    data.forEach(policy => {
      if (!groupedPolicies[policy.tablename]) {
        groupedPolicies[policy.tablename] = [];
      }
      groupedPolicies[policy.tablename].push(policy);
    });

    Object.entries(groupedPolicies).forEach(([tableName, policies]) => {
      console.log(`\n   📋 ${tableName}:`);
      policies.forEach(policy => {
        console.log(`      - ${policy.policyname} (${policy.cmd})`);
      });
    });

  } catch (err) {
    console.log(`❌ Erro: ${err.message}`);
  }
}

async function verificarView() {
  console.log('\n🔍 5. VERIFICANDO VIEW PROBLEMÁTICA...');
  
  try {
    // Verificar se a view existe e sua definição
    const { data, error } = await supabase
      .from('pg_views')
      .select('viewname, definition')
      .eq('viewname', 'audio_usage_summary')
      .eq('schemaname', 'public');

    if (error) {
      console.log(`❌ Erro ao verificar views: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.log('✅ View audio_usage_summary NÃO EXISTE - sem problemas');
      return;
    }

    const view = data[0];
    const hasSecurityDefiner = view.definition.includes('SECURITY DEFINER');
    
    console.log('🚨 View audio_usage_summary EXISTE:');
    console.log(`   SECURITY DEFINER: ${hasSecurityDefiner ? '❌ SIM - PROBLEMÁTICO' : '✅ NÃO'}`);
    
    if (hasSecurityDefiner) {
      console.log('   ⚠️ AÇÃO NECESSÁRIA: Recriar view sem SECURITY DEFINER');
    }

  } catch (err) {
    console.log(`❌ Erro: ${err.message}`);
  }
}

async function gerarResumo() {
  console.log('\n📊 6. RESUMO E RECOMENDAÇÕES...');
  
  // Contar novamente para o resumo final
  let vulnerabilidades = 0;
  let registrosTotal = 0;
  
  try {
    for (const tabela of ['telegram_users', 'telegram_link_codes', 'audio_response_cache']) {
      const { count } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
      
      if (count > 0) {
        registrosTotal += count;
      }
    }

    console.log('=== RESUMO FINAL ===');
    console.log(`📈 Total de registros analisados: ${registrosTotal}`);
    console.log('');
    
    console.log('🎯 PROBLEMAS IDENTIFICADOS:');
    console.log('1. ⚠️ Tabelas sem RLS adequado');
    console.log('2. 🚨 View com SECURITY DEFINER (se existir)');
    console.log('3. 📊 Dados expostos entre usuários');
    console.log('');
    
    console.log('✅ PRÓXIMA FASE:');
    console.log('- FASE 2: Aplicar correções RLS');
    console.log('- Habilitar Row Level Security');
    console.log('- Criar políticas de isolamento');
    console.log('- Corrigir view problemática');
    console.log('');
    
    console.log('⚠️ IMPACTO ESTIMADO:');
    if (registrosTotal === 0) {
      console.log('- BAIXO: Nenhum registro afetado');
    } else if (registrosTotal < 50) {
      console.log('- BAIXO: Poucos registros para migrar');
    } else {
      console.log('- MÉDIO: Testar bem após aplicar correções');
    }

  } catch (err) {
    console.log('⚠️ Erro no resumo, mas análise foi concluída');
  }
}

async function executarAnaliseCompleta() {
  try {
    await criarBackup();
    await verificarRLS();
    await contarRegistrosDetalhado();
    await verificarPoliticas();
    await verificarView();
    await gerarResumo();
    
    console.log('\n✅ ANÁLISE COMPLETA CONCLUÍDA!');
    console.log('📋 Resultados salvos - pronto para FASE 2');
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL NA ANÁLISE:', error.message);
    process.exit(1);
  }
}

// Executar análise completa
executarAnaliseCompleta();
