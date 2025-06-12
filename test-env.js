// Teste simples das variáveis de ambiente
console.log('=== TESTE DE VARIÁVEIS DE AMBIENTE ===');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'PRESENTE' : 'AUSENTE');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'PRESENTE' : 'AUSENTE');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENTE' : 'AUSENTE');

console.log('\n=== TESTE COM REQUIRE ===');
require('dotenv').config({ path: '.env.local' });
console.log('GEMINI_API_KEY após .env.local:', process.env.GEMINI_API_KEY ? 'PRESENTE' : 'AUSENTE');
console.log('SUPABASE_URL após .env.local:', process.env.SUPABASE_URL ? 'PRESENTE' : 'AUSENTE');
console.log('SUPABASE_SERVICE_ROLE_KEY após .env.local:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENTE' : 'AUSENTE');
