// Limpar conexão de teste
const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_JWT_TOKEN';

async function cleanTestConnection() {
  try {
    console.log('🧹 Limpando conexão de teste...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/telegram_users?telegram_chat_id=eq.999999999`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Status limpeza:', response.status);
    
    if (response.ok) {
      console.log('✅ Conexão de teste removida');
    } else {
      const errorData = await response.text();
      console.log('❌ Erro na limpeza:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  }
}

cleanTestConnection();
