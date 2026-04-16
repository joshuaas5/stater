// Limpar conexÃ£o de teste
const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'COLE_SUA_SUPABASE_ANON_KEY_AQUI';

async function cleanTestConnection() {
  try {
    console.log('ðŸ§¹ Limpando conexÃ£o de teste...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/telegram_users?telegram_chat_id=eq.999999999`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('ðŸ“Š Status limpeza:', response.status);
    
    if (response.ok) {
      console.log('âœ… ConexÃ£o de teste removida');
    } else {
      const errorData = await response.text();
      console.log('âŒ Erro na limpeza:', errorData);
    }
    
  } catch (error) {
    console.error('âŒ Erro na limpeza:', error);
  }
}

cleanTestConnection();



