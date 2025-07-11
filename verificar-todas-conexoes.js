// Verificar todas as conexões telegram
const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

async function checkAllConnections() {
  try {
    console.log('🔍 Verificando todas as conexões telegram...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/telegram_users?select=*&order=linked_at.desc&limit=10`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 Total de conexões:', data.length);
      
      data.forEach((conn, index) => {
        console.log(`\n${index + 1}. Chat ID: ${conn.telegram_chat_id}`);
        console.log(`   User ID: ${conn.user_id}`);
        console.log(`   Ativo: ${conn.is_active}`);
        console.log(`   Conectado em: ${conn.linked_at}`);
        console.log(`   Username: ${conn.telegram_username || 'N/A'}`);
      });
      
      // Verificar códigos recentes
      console.log('\n🔑 Verificando códigos recentes...');
      const codesResponse = await fetch(`${SUPABASE_URL}/rest/v1/telegram_link_codes?select=*&order=created_at.desc&limit=5`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (codesResponse.ok) {
        const codesData = await codesResponse.json();
        console.log('📋 Códigos recentes:', codesData.length);
        
        codesData.forEach((code, index) => {
          console.log(`\n${index + 1}. Código: ${code.code}`);
          console.log(`   User ID: ${code.user_id}`);
          console.log(`   Usado: ${code.used_at ? 'Sim' : 'Não'}`);
          console.log(`   Criado: ${code.created_at}`);
          console.log(`   Expira: ${code.expires_at}`);
        });
      }
      
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkAllConnections();
