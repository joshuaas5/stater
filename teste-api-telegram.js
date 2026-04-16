// ðŸ§ª TESTE COMPLETO DA API TELEGRAM - PT-BR
// Execute este cÃ³digo no console do navegador

console.log('ðŸš€ INICIANDO TESTE COMPLETO DA API TELEGRAM...');
console.log('ðŸ“… Data:', new Date().toLocaleString('pt-BR'));

const USER_ID = '56d8f459-8650-4cd9-bf16-f7d70ddbc0a9';
const USER_EMAIL = 'joshua@editora.com';
const USER_NAME = 'Joshua';

// FunÃ§Ã£o para aguardar um tempo
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testeCompletoTelegram() {
  try {
    console.log('\nðŸ” PASSO 1: Verificando conexÃµes existentes...');
    
    // Verificar conexÃµes existentes
    const responseConexoes = await fetch('https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_users?select=*&user_id=eq.' + USER_ID + '&is_active=eq.true', {
      headers: {'apikey': 'YOUR_JWT_TOKEN'}
    });
    
    const conexoes = await responseConexoes.json();
    console.log('ðŸ“Š ConexÃµes encontradas:', conexoes.length);
    
    if (conexoes.length > 0) {
      console.log('âœ… JÃ CONECTADO!', conexoes[0]);
      console.log('ðŸŽ‰ Teste finalizado - usuÃ¡rio jÃ¡ estÃ¡ conectado ao Telegram');
      return;
    }
    
    console.log('\nðŸ”‘ PASSO 2: Gerando novo cÃ³digo...');
    
    // Testar geraÃ§Ã£o de cÃ³digo
    const responseCodigo = await fetch('https://stater.app/api/telegram-codes-simple', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        user_id: USER_ID,
        user_email: USER_EMAIL,
        user_name: USER_NAME
      })
    });
    
    console.log('ðŸ“¡ Status da resposta:', responseCodigo.status);
    const resultadoCodigo = await responseCodigo.json();
    console.log('ðŸ“‹ Resposta da API:', resultadoCodigo);
    
    if (resultadoCodigo.error) {
      console.log('âŒ ERRO na API:', resultadoCodigo.error);
      return;
    }
    
    if (resultadoCodigo.code) {
      console.log('ðŸŽ¯ CÃ“DIGO GERADO:', resultadoCodigo.code);
      console.log('ðŸ“± ENVIE ESTE CÃ“DIGO PARA: https://t.me/assistentefinanceiroiabot');
      console.log('â° Expira em:', new Date(resultadoCodigo.expiresAt).toLocaleString('pt-BR'));
      
      // Copiar cÃ³digo automaticamente
      try {
        await navigator.clipboard.writeText(resultadoCodigo.code);
        console.log('ðŸ“‹ CÃ“DIGO COPIADO AUTOMATICAMENTE!');
      } catch (e) {
        console.log('âš ï¸ NÃ£o foi possÃ­vel copiar automaticamente');
      }
      
      console.log('\nðŸ”„ PASSO 3: Monitorando conexÃ£o...');
      console.log('â³ Aguardando vocÃª enviar o cÃ³digo para o bot...');
      
      // Monitorar conexÃ£o por 3 minutos
      const maxTentativas = 60; // 3 minutos
      let tentativa = 0;
      
      const monitorar = setInterval(async () => {
        tentativa++;
        console.log(`ðŸ”„ VerificaÃ§Ã£o ${tentativa}/${maxTentativas}`);
        
        try {
          const checkResponse = await fetch('https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_users?select=*&user_id=eq.' + USER_ID + '&is_active=eq.true', {
            headers: {'apikey': 'YOUR_JWT_TOKEN'}
          });
          
          const conexoesAtual = await checkResponse.json();
          
          if (conexoesAtual.length > 0) {
            clearInterval(monitorar);
            console.log('\nðŸŽ‰ SUCESSO! CONEXÃƒO DETECTADA!');
            console.log('âœ… Dados da conexÃ£o:', conexoesAtual[0]);
            console.log('ðŸš€ Bot Telegram conectado com sucesso!');
            return;
          }
        } catch (error) {
          console.log('âš ï¸ Erro na verificaÃ§Ã£o:', error);
        }
        
        if (tentativa >= maxTentativas) {
          clearInterval(monitorar);
          console.log('\nâ° TIMEOUT: Monitoramento finalizado apÃ³s 3 minutos');
          console.log('ðŸ’¡ Se vocÃª ainda nÃ£o enviou o cÃ³digo, faÃ§a agora:');
          console.log('ðŸ“± CÃ³digo:', resultadoCodigo.code);
          console.log('ðŸ¤– Bot: https://t.me/assistentefinanceiroiabot');
        }
      }, 3000); // Verificar a cada 3 segundos
      
    } else {
      console.log('âŒ Resposta inesperada da API:', resultadoCodigo);
    }
    
  } catch (error) {
    console.error('ðŸ’¥ ERRO CRÃTICO:', error);
  }
}

// Executar teste
testeCompletoTelegram();
