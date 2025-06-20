// Script para verificar se as tabelas do Telegram existem no Supabase
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hlemutzuubhrkuhevsxo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY não configurada');
  console.log('Configure no Vercel: SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTables() {
  console.log('🔍 VERIFICANDO TABELAS DO TELEGRAM NO SUPABASE...\n');

  try {
    // 1. Verificar tabela telegram_users
    console.log('1️⃣ Verificando tabela telegram_users...');
    const { data: usersData, error: usersError } = await supabase
      .from('telegram_users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.log('❌ Erro telegram_users:', usersError.message);
      console.log('   Talvez a tabela não exista ainda');
    } else {
      console.log('✅ Tabela telegram_users existe!');
      console.log('   Registros encontrados:', usersData?.length || 0);
    }

    // 2. Verificar tabela telegram_link_codes
    console.log('\n2️⃣ Verificando tabela telegram_link_codes...');
    const { data: codesData, error: codesError } = await supabase
      .from('telegram_link_codes')
      .select('*')
      .limit(1);

    if (codesError) {
      console.log('❌ Erro telegram_link_codes:', codesError.message);
      console.log('   Talvez a tabela não exista ainda');
    } else {
      console.log('✅ Tabela telegram_link_codes existe!');
      console.log('   Registros encontrados:', codesData?.length || 0);
    }

    // 3. Listar todas as tabelas
    console.log('\n3️⃣ Listando todas as tabelas...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('❌ Erro ao listar tabelas:', tablesError.message);
    } else {
      console.log('📋 Tabelas existentes:');
      tables?.forEach(table => console.log('  -', table.table_name));
    }

  } catch (error) {
    console.error('❌ Erro crítico:', error);
  }
}

checkTables();
