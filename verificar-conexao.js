// Verificar se conexÃ£o foi criada no banco
const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'COLE_SUA_SUPABASE_ANON_KEY_AQUI';

async function checkConnection() {
  try {
    console.log('ðŸ” Verificando conexÃµes no banco...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/telegram_users?select=*&user_id=eq.56d8f459-8650-4cd9-bf16-f7d70ddbc0a9&is_active=eq.true`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('ðŸ“Š Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('ðŸ“‹ ConexÃµes ativas encontradas:', data.length);
      if (data.length > 0) {
        console.log('âœ… Detalhes:', data[0]);
      } else {
        console.log('âŒ Nenhuma conexÃ£o ativa encontrada');
      }
    }
    
  } catch (error) {
    console.error('âŒ Erro:', error);
  }
}

checkConnection();



