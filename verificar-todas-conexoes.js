// Verificar todas as conexÃµes telegram
const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'COLE_SUA_SUPABASE_ANON_KEY_AQUI';

async function checkAllConnections() {
  try {
    console.log('ðŸ” Verificando todas as conexÃµes telegram...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/telegram_users?select=*&order=linked_at.desc&limit=10`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('ðŸ“Š Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('ðŸ“‹ Total de conexÃµes:', data.length);
      
      data.forEach((conn, index) => {
        console.log(`\n${index + 1}. Chat ID: ${conn.telegram_chat_id}`);
        console.log(`   User ID: ${conn.user_id}`);
        console.log(`   Ativo: ${conn.is_active}`);
        console.log(`   Conectado em: ${conn.linked_at}`);
        console.log(`   Username: ${conn.telegram_username || 'N/A'}`);
      });
      
      // Verificar cÃ³digos recentes
      console.log('\nðŸ”‘ Verificando cÃ³digos recentes...');
      const codesResponse = await fetch(`${SUPABASE_URL}/rest/v1/telegram_link_codes?select=*&order=created_at.desc&limit=5`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (codesResponse.ok) {
        const codesData = await codesResponse.json();
        console.log('ðŸ“‹ CÃ³digos recentes:', codesData.length);
        
        codesData.forEach((code, index) => {
          console.log(`\n${index + 1}. CÃ³digo: ${code.code}`);
          console.log(`   User ID: ${code.user_id}`);
          console.log(`   Usado: ${code.used_at ? 'Sim' : 'NÃ£o'}`);
          console.log(`   Criado: ${code.created_at}`);
          console.log(`   Expira: ${code.expires_at}`);
        });
      }
      
    }
    
  } catch (error) {
    console.error('âŒ Erro:', error);
  }
}

checkAllConnections();



