// Teste de inserção direta na tabela telegram_users
const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

async function testDirectInsert() {
  try {
    console.log('🧪 Testando inserção direta...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/telegram_users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        telegram_chat_id: '999999999',
        user_id: '56d8f459-8650-4cd9-bf16-f7d70ddbc0a9',
        user_email: 'teste@teste.com',
        user_name: 'Teste',
        linked_at: new Date().toISOString(),
        is_active: true
      })
    });
    
    console.log('📊 Status inserção:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Inserção bem-sucedida:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Erro na inserção:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testDirectInsert();
