// TESTE ALTERNATIVO - Requisição mais segura
// Execute no console do navegador

console.log('🔧 Testando requisição mais segura...');

// Simular a requisição do frontend, mas sem .single()
const testSafeRequest = async () => {
  try {
    // Usar a mesma URL base do app
    const { createClient } = window.supabase || {};
    
    if (!createClient) {
      console.log('❌ Supabase não disponível, testando com fetch direto...');
      
      // Teste direto sem .single()
      const response = await fetch('https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_users?select=*&user_id=eq.56d8f459-8650-4cd9-bf16-f7d70ddbc0a9&is_active=eq.true', {
        method: 'GET',
        headers: {
          'apikey': 'YOUR_JWT_TOKEN',
          'Authorization': 'Bearer YOUR_JWT_TOKEN',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('📊 Status da requisição direta:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dados retornados:', data);
        console.log('📊 Quantidade de registros:', data.length);
      } else {
        const errorText = await response.text();
        console.log('❌ Erro na resposta:', errorText);
      }
      
      return;
    }
    
    // Se Supabase estiver disponível, testar com cliente
    console.log('🔧 Testando com cliente Supabase...');
    // Adicione aqui se necessário
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
};

testSafeRequest();
