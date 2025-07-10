// Teste completo do fluxo webhook + API
const WEBHOOK_URL = 'https://staterbills.vercel.app/api/telegram-webhook';
const CODES_API_URL = 'https://staterbills.vercel.app/api/telegram-codes-simple';

// 1. Primeiro vamos gerar um código através da API
async function testeCompleto() {
    console.log('🚀 INICIANDO TESTE COMPLETO DO FLUXO TELEGRAM\n');
    
    try {
        // Passo 1: Gerar código
        console.log('📝 Passo 1: Gerando código...');
        const generateResponse = await fetch(`${CODES_API_URL}?action=generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: '56d8f459-8650-4cd9-bf16-f7d70ddbc0a9', // UUID real do usuário
                userEmail: 'joshuaas500@gmail.com',
                userName: 'Joshua'
            })
        });
        
        const generateResult = await generateResponse.json();
        console.log('✅ Código gerado:', generateResult);
        
        if (!generateResult.success || !generateResult.code) {
            console.error('❌ Falha ao gerar código');
            return;
        }
        
        const testCode = generateResult.code;
        console.log(`🔑 Código para teste: ${testCode}\n`);
        
        // Passo 2: Verificar se o código é válido
        console.log('🔍 Passo 2: Verificando código...');
        const verifyResponse = await fetch(`${CODES_API_URL}?code=${testCode}`);
        const verifyResult = await verifyResponse.json();
        console.log('✅ Verificação do código:', verifyResult);
        
        if (!verifyResult.valid) {
            console.error('❌ Código não é válido');
            return;
        }
        
        // Passo 3: Simular mensagem do Telegram para o webhook
        console.log('\n📲 Passo 3: Simulando webhook do Telegram...');
        const telegramUpdate = {
            message: {
                message_id: 123,
                from: {
                    id: 123456789,
                    is_bot: false,
                    first_name: "Test",
                    username: "testuser"
                },
                chat: {
                    id: 123456789,
                    first_name: "Test",
                    username: "testuser",
                    type: "private"
                },
                date: Math.floor(Date.now() / 1000),
                text: `/start ${testCode}`
            }
        };
        
        const webhookResponse = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(telegramUpdate)
        });
        
        console.log('📊 Status do webhook:', webhookResponse.status);
        const webhookResult = await webhookResponse.text();
        console.log('📄 Resposta do webhook:', webhookResult);
        
        // Passo 4: Verificar se o código foi marcado como usado
        console.log('\n🔄 Passo 4: Verificando se código foi marcado como usado...');
        const checkUsedResponse = await fetch(`${CODES_API_URL}?code=${testCode}`);
        const checkUsedResult = await checkUsedResponse.json();
        console.log('📋 Status final do código:', checkUsedResult);
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testeCompleto();
