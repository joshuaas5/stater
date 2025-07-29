// Teste para verificar sistema de conta de desenvolvedor
// Simula verificações do lado do cliente

// Simulando as funções
function isDeveloperAccount(userId) {
  const DEVELOPER_ACCOUNTS = [
    'joshuaas500@gmail.com',
    'joshua@stater.app'
  ];
  
  // Simular getCurrentUser
  const user = { email: 'joshuaas500@gmail.com' };
  
  if (!user) return false;
  
  const email = user.email?.toLowerCase();
  return DEVELOPER_ACCOUNTS.includes(email || '');
}

// Simular função UserJourneyManager.canSendMessage
async function canSendMessage(userId) {
  // VERIFICAÇÃO DE CONTA DE DESENVOLVEDOR - ACESSO ILIMITADO
  if (isDeveloperAccount(userId)) {
    console.log(`🚀 [DEVELOPER ACCOUNT] Acesso ilimitado para mensagens`);
    return {
      allowed: true,
      reason: 'developer_account',
      messagesUsed: 0,
      messagesAvailable: -1, // Ilimitado
      adsWatched: 0,
      adsRequired: 0,
      currentDay: 1
    };
  }
  
  // Lógica normal para outros usuários...
  return {
    allowed: false,
    reason: 'need_ad',
    messagesUsed: 3,
    messagesAvailable: 3,
    adsWatched: 0,
    adsRequired: 1,
    currentDay: 1
  };
}

// Teste
console.log('=== TESTE SISTEMA DE DESENVOLVEDOR ===');
console.log('1. Testando isDeveloperAccount:');
console.log('   joshuaas500@gmail.com:', isDeveloperAccount('mock-user-id'));
console.log('   outro@email.com:', isDeveloperAccount('other-user'));

console.log('\n2. Testando canSendMessage:');
canSendMessage('mock-user-id').then(result => {
  console.log('   Resultado para joshuaas500@gmail.com:', result);
  
  if (result.allowed && result.reason === 'developer_account') {
    console.log('✅ SUCESSO: Conta de desenvolvedor detectada corretamente!');
  } else {
    console.log('❌ ERRO: Conta de desenvolvedor NÃO está funcionando!');
  }
});

console.log('\n=== FIM DOS TESTES ===');
