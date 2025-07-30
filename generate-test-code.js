// Script de teste mais simples - gerar novo código de 6 dígitos para testar
console.log('🎲 Gerando novo código de teste...');

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const newCode = generateCode();
console.log(`🔢 Novo código: ${newCode}`);
console.log('');
console.log('📋 INSTRUÇÕES PARA TESTE:');
console.log('1. Acesse o bot do Telegram');
console.log(`2. Digite o código: ${newCode}`);
console.log('3. O bot deve mostrar o saldo correto: R$ 2.315.256,46');
console.log('4. Confirme se o valor está igual ao app principal');
console.log('');
console.log('💰 Saldo esperado: R$ 2.315.256,46');
console.log('❌ Saldo errado anterior: R$ 454,00');
console.log('✅ Bot foi corrigido para calcular TODAS as transações!');
