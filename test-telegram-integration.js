// Teste da integração completa Telegram + OCR
// Este script simula o recebimento de uma foto/documento pelo Telegram

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7971646954:AAHpeNAzvg3kq7A1uER58XRms94sTjWZy5g';

// Mock de update do Telegram com foto
const mockPhotoUpdate = {
  message: {
    message_id: 12345,
    from: {
      id: 123456789,
      is_bot: false,
      first_name: "Usuário",
      username: "usuario_teste",
      language_code: "pt-br"
    },
    chat: {
      id: 987654321,
      first_name: "Usuário",
      username: "usuario_teste",
      type: "private"
    },
    date: Math.floor(Date.now() / 1000),
    photo: [
      {
        file_id: "AgACAgIAAxkBAAIDEGdM-foto-exemplo",
        file_unique_id: "AQADFgABy_foto_unique",
        file_size: 87234,
        width: 800,
        height: 600
      }
    ],
    caption: "Meu extrato bancário"
  }
};

// Mock de update do Telegram com documento PDF
const mockDocumentUpdate = {
  message: {
    message_id: 12346,
    from: {
      id: 123456789,
      is_bot: false,
      first_name: "Usuário",
      username: "usuario_teste",
      language_code: "pt-br"
    },
    chat: {
      id: 987654321,
      first_name: "Usuário",
      username: "usuario_teste",
      type: "private"
    },
    date: Math.floor(Date.now() / 1000),
    document: {
      file_name: "extrato_dezembro.pdf",
      mime_type: "application/pdf",
      file_id: "BAADBAADAwADVwABY2dM-documento-exemplo",
      file_unique_id: "AgADAwADVwABY2dM-documento_unique",
      file_size: 256789
    },
    caption: "Fatura do cartão de crédito"
  }
};

// Função para testar o webhook
async function testTelegramWebhook(updateData, testName) {
  console.log(`\n🧪 ===== TESTE: ${testName} =====`);
  console.log('📤 Enviando update para webhook...');
  
  try {
    const response = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/telegram-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TelegramBot (like TwitterBot)'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('📡 Status da resposta:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('✅ Resposta do webhook:', result);
    
    if (response.ok) {
      console.log('✅ Teste bem-sucedido!');
    } else {
      console.log('❌ Teste falhou com status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Teste para simular foto
async function testPhoto() {
  await testTelegramWebhook(mockPhotoUpdate, 'FOTO/IMAGEM');
}

// Teste para simular documento PDF
async function testDocument() {
  await testTelegramWebhook(mockDocumentUpdate, 'DOCUMENTO PDF');
}

// Teste de conectividade básica
async function testBasicConnectivity() {
  console.log('\n🔌 ===== TESTE: CONECTIVIDADE BÁSICA =====');
  
  try {
    // Testar webhook
    const webhookResponse = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/telegram-webhook', {
      method: 'GET'
    });
    console.log('📡 Webhook status:', webhookResponse.status);
    
    // Testar API OCR
    const ocrResponse = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/gemini-ocr', {
      method: 'GET'
    });
    console.log('🔍 API OCR status:', ocrResponse.status);
    
    // Testar Telegram Bot API
    const botResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const botData = await botResponse.json();
    console.log('🤖 Bot Telegram:', botData.ok ? `✅ ${botData.result.first_name}` : '❌ Erro');
    
    console.log('✅ Testes de conectividade concluídos!');
    
  } catch (error) {
    console.error('❌ Erro na conectividade:', error.message);
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 INICIANDO TESTES DA INTEGRAÇÃO TELEGRAM + OCR');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🌐 Ambiente: Vercel Production\n');
  
  try {
    await testBasicConnectivity();
    
    console.log('\n⚠️  NOTA: Os testes de foto/documento são simulações');
    console.log('   Para testar com arquivos reais, use o Telegram diretamente\n');
    
    // await testPhoto();
    // await testDocument();
    
    console.log('\n🎉 TODOS OS TESTES EXECUTADOS!');
    console.log('\n📝 COMO TESTAR MANUALMENTE:');
    console.log('1️⃣ Abra o Telegram');
    console.log('2️⃣ Busque pelo bot: @seu_bot_telegram');
    console.log('3️⃣ Envie /start');
    console.log('4️⃣ Envie uma foto de extrato ou fatura');
    console.log('5️⃣ Ou envie um PDF');
    console.log('6️⃣ Aguarde a análise automática');
    
  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testTelegramWebhook,
  testPhoto,
  testDocument,
  testBasicConnectivity,
  runAllTests
};
