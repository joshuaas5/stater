const fs = require('fs');

console.log('🔧 Fix CRON Job - Executar via Supabase Dashboard\n');
console.log('⚠️  O Supabase CLI não permite execução direta de SQL com cron.schedule');
console.log('📋 INSTRUÇÕES:\n');

const sqlContent = fs.readFileSync('LIMPAR_E_RECRIAR_CRON.sql', 'utf8');

console.log('1. Abra o Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/sql/new\n');

console.log('2. Copie e cole o SQL abaixo:\n');
console.log('─'.repeat(80));
console.log(sqlContent);
console.log('─'.repeat(80));

console.log('\n3. Clique em RUN\n');
console.log('✅ Após executar, o CRON job estará configurado para enviar emails toda segunda-feira às 8:00 BRT');
console.log('📅 Próximo envio: Segunda-feira, 15/12/2025 às 8:00 BRT\n');
