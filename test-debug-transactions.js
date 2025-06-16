// Script de teste para verificar salvamento de transações
// Execute no console do navegador após fazer login

console.log('🧪 INICIANDO TESTE DE SALVAMENTO DE TRANSAÇÕES');

// Teste 1: Verificar se há usuário logado
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
console.log('👤 Usuário atual:', currentUser);

// Teste 2: Verificar transações existentes
if (currentUser) {
  const existingTransactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.id}`) || '[]');
  console.log('📊 Transações existentes:', existingTransactions.length);
  console.log('📋 Lista:', existingTransactions);
} else {
  console.error('❌ Nenhum usuário logado encontrado');
}

// Teste 3: Verificar se eventos estão sendo escutados
let eventCount = 0;
const testListener = () => {
  eventCount++;
  console.log(`🔔 Evento transactionsUpdated recebido! Count: ${eventCount}`);
};

window.addEventListener('transactionsUpdated', testListener);
console.log('👂 Listener de teste adicionado para transactionsUpdated');

// Instruções para o usuário
console.log(`
🧪 INSTRUÇÕES DE TESTE:

1. Vá para o Consultor Financeiro (IA)
2. Digite: "Gastos: Mercado R$ 100, Gasolina R$ 80"
3. Confirme as transações
4. Verifique os logs no console
5. Vá para Dashboard > Últimas Transações
6. Verifique se as transações aparecem

Para remover o listener de teste, execute:
window.removeEventListener('transactionsUpdated', testListener);
`);
