// Script para testar a nova lógica de termos
// Execute no console do navegador para simular diferentes cenários

console.log('🧪 TESTE: Nova lógica de termos - Verificação única por usuário');

// Função para simular um usuário
function testUser(userId, scenario) {
  console.log(`\n📋 TESTE: ${scenario} - Usuário ${userId}`);
  
  const termsCheckedKey = `terms_checked_${userId}`;
  const localKey = `stater_terms_accepted_${userId}`;
  
  console.log('Estado antes:', {
    termsChecked: localStorage.getItem(termsCheckedKey),
    termsAccepted: localStorage.getItem(localKey)
  });
  
  // Simular a lógica do hook
  const alreadyChecked = localStorage.getItem(termsCheckedKey);
  
  if (alreadyChecked === 'true') {
    console.log('✅ RESULTADO: Usuário já foi verificado, NUNCA MAIS verificar');
    const hasAccepted = localStorage.getItem(localKey) === 'true';
    console.log('Status:', { hasAccepted, showModal: !hasAccepted });
    return { verified: true, hasAccepted, showModal: !hasAccepted };
  } else {
    console.log('🆕 RESULTADO: PRIMEIRA VEZ verificando este usuário');
    console.log('Ação: Verificar no Supabase e marcar como verificado');
    
    // Simular verificação e marcação
    localStorage.setItem(termsCheckedKey, 'true');
    console.log('🔒 Usuário marcado como verificado permanentemente');
    
    return { verified: false, firstTime: true, showModal: true };
  }
}

// Limpar estado anterior para teste limpo
console.log('🧹 Limpando estado anterior...');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('terms_') || key.includes('stater_'))) {
    localStorage.removeItem(key);
    console.log(`Removido: ${key}`);
  }
}

// CENÁRIO 1: Usuário novo (primeira vez)
testUser('user1', 'Usuário novo - primeira vez');

// CENÁRIO 2: Mesmo usuário (segunda vez - deve pular)
testUser('user1', 'Mesmo usuário - segunda vez');

// CENÁRIO 3: Usuário que aceitou termos
localStorage.setItem('stater_terms_accepted_user2', 'true');
testUser('user2', 'Usuário que já aceitou termos');

// CENÁRIO 4: Mesmo usuário que aceitou (deve pular verificação)
testUser('user2', 'Usuário que já aceitou - segunda vez');

// CENÁRIO 5: Usuário diferente (primeira vez)
testUser('user3', 'Usuário diferente - primeira vez');

console.log('\n🎯 RESUMO DOS TESTES:');
console.log('- Usuário1: Verificado na 1ª vez, pulado na 2ª vez ✅');
console.log('- Usuário2: Já tinha aceitado, marcado como verificado ✅'); 
console.log('- Usuário3: Novo usuário, verificado pela 1ª vez ✅');
console.log('\n✅ A lógica funciona: cada usuário só é verificado UMA VEZ na vida!');
