// TESTE ALTERNATIVO - RequisiÃ§Ã£o mais segura
// Execute no console do navegador

console.log('ðŸ”§ Testando requisiÃ§Ã£o mais segura...');

// Simular a requisiÃ§Ã£o do frontend, mas sem .single()
const testSafeRequest = async () => {
  try {
    // Usar a mesma URL base do app
    const { createClient } = window.supabase || {};
    
    if (!createClient) {
      console.log('âŒ Supabase nÃ£o disponÃ­vel, testando com fetch direto...');
      
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
      
      console.log('ðŸ“Š Status da requisiÃ§Ã£o direta:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('âœ… Dados retornados:', data);
        console.log('ðŸ“Š Quantidade de registros:', data.length);
      } else {
        const errorText = await response.text();
        console.log('âŒ Erro na resposta:', errorText);
      }
      
      return;
    }
    
    // Se Supabase estiver disponÃ­vel, testar com cliente
    console.log('ðŸ”§ Testando com cliente Supabase...');
    // Adicione aqui se necessÃ¡rio
    
  } catch (error) {
    console.error('ðŸ’¥ Erro no teste:', error);
  }
};

testSafeRequest();
