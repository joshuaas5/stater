// Verificar se conexão foi criada no banco
const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

async function checkConnection() {
  try {
    console.log('🔍 Verificando conexões no banco...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/telegram_users?select=*&user_id=eq.56d8f459-8650-4cd9-bf16-f7d70ddbc0a9&is_active=eq.true`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 Conexões ativas encontradas:', data.length);
      if (data.length > 0) {
        console.log('✅ Detalhes:', data[0]);
      } else {
        console.log('❌ Nenhuma conexão ativa encontrada');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkConnection();
