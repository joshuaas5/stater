// Configurar webhook com domínio correto do Vercel
const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';

async function configurarWebhookCorreto() {
  console.log('🔧 Configurando webhook com domínio correto...');
  
  try {
    // 1. Verificar webhook atual
    console.log('\n🔍 Verificando webhook atual...');
    const currentWebhook = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const currentData = await currentWebhook.json();
    console.log('📊 Webhook atual:', JSON.stringify(currentData, null, 2));
    
    // 2. Configurar com domínio correto da screenshot
    const webhookUrl = 'https://sprout-spending-hub-vb4x.vercel.app/api/telegram-webhook';
    console.log('\n🚀 Configurando novo webhook...');
    console.log('📡 URL:', webhookUrl);
    
    const setWebhook = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
        max_connections: 40
      })
    });
    
    const setData = await setWebhook.json();
    console.log('📝 Resultado:', JSON.stringify(setData, null, 2));
    
    if (setData.ok) {
      console.log('✅ Webhook configurado com sucesso!');
      
      // 3. Verificar configuração final
      console.log('\n🔍 Verificando configuração final...');
      const finalWebhook = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
      const finalData = await finalWebhook.json();
      console.log('📊 Webhook configurado:', JSON.stringify(finalData, null, 2));
      
      // 4. Testar o endpoint correto
      console.log('\n🧪 Testando endpoint...');
      try {
        const testResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            update_id: 123456789,
            message: {
              message_id: 123456,
              from: { id: 987654321, is_bot: false, first_name: "Teste", username: "teste" },
              chat: { id: 987654321, first_name: "Teste", type: "private" },
              date: Math.floor(Date.now() / 1000),
              text: "/help"
            }
          })
        });
        
        console.log('📊 Status do teste:', testResponse.status);
        console.log('📊 Status text:', testResponse.statusText);
        
        if (testResponse.status === 200) {
          console.log('✅ Endpoint funcionando!');
        } else {
          const errorText = await testResponse.text();
          console.log('❌ Erro no endpoint:', errorText.substring(0, 200));
        }
      } catch (testError) {
        console.log('❌ Erro ao testar endpoint:', testError.message);
      }
      
    } else {
      console.log('❌ Erro ao configurar webhook:', setData);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

configurarWebhookCorreto().catch(console.error);
