// 🧪 TESTE COMPLETO DA API TELEGRAM - PT-BR
// Execute este código no console do navegador

console.log('🚀 INICIANDO TESTE COMPLETO DA API TELEGRAM...');
console.log('📅 Data:', new Date().toLocaleString('pt-BR'));

const USER_ID = '56d8f459-8650-4cd9-bf16-f7d70ddbc0a9';
const USER_EMAIL = 'joshua@editora.com';
const USER_NAME = 'Joshua';

// Função para aguardar um tempo
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testeCompletoTelegram() {
  try {
    console.log('\n🔍 PASSO 1: Verificando conexões existentes...');
    
    // Verificar conexões existentes
    const responseConexoes = await fetch('https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_users?select=*&user_id=eq.' + USER_ID + '&is_active=eq.true', {
      headers: {'apikey': 'YOUR_JWT_TOKEN'}
    });
    
    const conexoes = await responseConexoes.json();
    console.log('📊 Conexões encontradas:', conexoes.length);
    
    if (conexoes.length > 0) {
      console.log('✅ JÁ CONECTADO!', conexoes[0]);
      console.log('🎉 Teste finalizado - usuário já está conectado ao Telegram');
      return;
    }
    
    console.log('\n🔑 PASSO 2: Gerando novo código...');
    
    // Testar geração de código
    const responseCodigo = await fetch('https://stater.app/api/telegram-codes-simple', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        user_id: USER_ID,
        user_email: USER_EMAIL,
        user_name: USER_NAME
      })
    });
    
    console.log('📡 Status da resposta:', responseCodigo.status);
    const resultadoCodigo = await responseCodigo.json();
    console.log('📋 Resposta da API:', resultadoCodigo);
    
    if (resultadoCodigo.error) {
      console.log('❌ ERRO na API:', resultadoCodigo.error);
      return;
    }
    
    if (resultadoCodigo.code) {
      console.log('🎯 CÓDIGO GERADO:', resultadoCodigo.code);
      console.log('📱 ENVIE ESTE CÓDIGO PARA: https://t.me/assistentefinanceiroiabot');
      console.log('⏰ Expira em:', new Date(resultadoCodigo.expiresAt).toLocaleString('pt-BR'));
      
      // Copiar código automaticamente
      try {
        await navigator.clipboard.writeText(resultadoCodigo.code);
        console.log('📋 CÓDIGO COPIADO AUTOMATICAMENTE!');
      } catch (e) {
        console.log('⚠️ Não foi possível copiar automaticamente');
      }
      
      console.log('\n🔄 PASSO 3: Monitorando conexão...');
      console.log('⏳ Aguardando você enviar o código para o bot...');
      
      // Monitorar conexão por 3 minutos
      const maxTentativas = 60; // 3 minutos
      let tentativa = 0;
      
      const monitorar = setInterval(async () => {
        tentativa++;
        console.log(`🔄 Verificação ${tentativa}/${maxTentativas}`);
        
        try {
          const checkResponse = await fetch('https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_users?select=*&user_id=eq.' + USER_ID + '&is_active=eq.true', {
            headers: {'apikey': 'YOUR_JWT_TOKEN'}
          });
          
          const conexoesAtual = await checkResponse.json();
          
          if (conexoesAtual.length > 0) {
            clearInterval(monitorar);
            console.log('\n🎉 SUCESSO! CONEXÃO DETECTADA!');
            console.log('✅ Dados da conexão:', conexoesAtual[0]);
            console.log('🚀 Bot Telegram conectado com sucesso!');
            return;
          }
        } catch (error) {
          console.log('⚠️ Erro na verificação:', error);
        }
        
        if (tentativa >= maxTentativas) {
          clearInterval(monitorar);
          console.log('\n⏰ TIMEOUT: Monitoramento finalizado após 3 minutos');
          console.log('💡 Se você ainda não enviou o código, faça agora:');
          console.log('📱 Código:', resultadoCodigo.code);
          console.log('🤖 Bot: https://t.me/assistentefinanceiroiabot');
        }
      }, 3000); // Verificar a cada 3 segundos
      
    } else {
      console.log('❌ Resposta inesperada da API:', resultadoCodigo);
    }
    
  } catch (error) {
    console.error('💥 ERRO CRÍTICO:', error);
  }
}

// Executar teste
testeCompletoTelegram();
