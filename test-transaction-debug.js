/**
 * Script para testar e debugar o problema das transações de arquivo
 * não aparecerem em "Últimas Transações"
 */

// Simular uma transação de texto (funciona)
console.log('=== TESTE: Transação de Texto (funciona) ===');
const textTransaction = {
  id: 'text-test-123',
  title: 'Despesa de Teste - Texto',
  amount: 50.00,
  type: 'expense',
  category: 'Alimentação',
  date: new Date(),
  userId: 'test-user-123'
};

// Salvar no localStorage
const saveTextTransaction = () => {
  const userId = 'test-user-123';
  const key = `transactions_${userId}`;
  
  // Simular usuário logado
  localStorage.setItem('currentUser', JSON.stringify({
    id: userId,
    email: 'test@example.com',
    username: 'Test User'
  }));
  
  // Obter transações existentes
  const existing = localStorage.getItem(key);
  let transactions = existing ? JSON.parse(existing) : [];
  
  // Adicionar transação
  transactions.push(textTransaction);
  
  // Salvar
  localStorage.setItem(key, JSON.stringify(transactions));
  
  console.log('✅ Transação de texto salva:', textTransaction);
  console.log('📋 Total transações:', transactions.length);
  
  // Disparar eventos
  window.dispatchEvent(new Event('transactionsUpdated'));
  window.dispatchEvent(new Event('storage'));
};

// Simular múltiplas transações de arquivo (não funciona)
console.log('=== TESTE: Transações de Arquivo (não funciona) ===');
const fileTransactions = [
  {
    id: 'file-test-1',
    title: 'PIX Recebido - Maria',
    amount: 100.00,
    type: 'income',
    category: 'Vendas',
    date: new Date(),
    userId: 'test-user-123'
  },
  {
    id: 'file-test-2',
    title: 'Débito Automático - Internet',
    amount: 89.90,
    type: 'expense',
    category: 'Conta',
    date: new Date(),
    userId: 'test-user-123'
  },
  {
    id: 'file-test-3',
    title: 'Transferência - João',
    amount: 200.00,
    type: 'expense',
    category: 'Transferência',
    date: new Date(),
    userId: 'test-user-123'
  }
];

const saveFileTransactions = () => {
  const userId = 'test-user-123';
  const key = `transactions_${userId}`;
  
  // Obter transações existentes
  const existing = localStorage.getItem(key);
  let transactions = existing ? JSON.parse(existing) : [];
  
  console.log('📂 Transações existentes antes:', transactions.length);
  
  // Simular o processo do FinancialAdvisorPage
  let successCount = 0;
  let errorCount = 0;
  
  fileTransactions.forEach((transaction, index) => {
    try {
      console.log(`🔄 Processando transação ${index + 1}:`, transaction.title);
      
      // Adicionar transação
      transactions.push(transaction);
      
      // Salvar após cada transação (como faz o código atual)
      localStorage.setItem(key, JSON.stringify(transactions));
      
      console.log(`✅ Transação ${index + 1} salva`);
      
      // Disparar eventos (como faz o código atual)
      setTimeout(() => {
        window.dispatchEvent(new Event('transactionsUpdated'));
        window.dispatchEvent(new CustomEvent('transactionsUpdated', { 
          detail: { source: 'ocr', transaction } 
        }));
        window.dispatchEvent(new Event('storage'));
      }, 100 * (index + 1));
      
      successCount++;
    } catch (error) {
      console.error(`❌ Erro na transação ${index + 1}:`, error);
      errorCount++;
    }
  });
  
  console.log('📊 Resultado final:');
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log('📋 Total transações final:', transactions.length);
  
  // Evento final
  setTimeout(() => {
    console.log('🔄 Disparando eventos finais...');
    window.dispatchEvent(new Event('transactionsUpdated'));
  }, 1000);
};

// Função para verificar transações salvas
const checkSavedTransactions = () => {
  const userId = 'test-user-123';
  const key = `transactions_${userId}`;
  const saved = localStorage.getItem(key);
  
  if (saved) {
    const transactions = JSON.parse(saved);
    console.log('=== TRANSAÇÕES SALVAS ===');
    console.log(`Total: ${transactions.length}`);
    transactions.forEach((t, i) => {
      console.log(`${i + 1}. ${t.title} - R$ ${t.amount} (${t.type})`);
    });
  } else {
    console.log('❌ Nenhuma transação encontrada no localStorage');
  }
};

// Função para limpar dados de teste
const clearTestData = () => {
  localStorage.removeItem('transactions_test-user-123');
  localStorage.removeItem('currentUser');
  console.log('🧹 Dados de teste limpos');
};

// Executar testes
console.log('🧪 Iniciando testes de debug de transações...');
console.log('Execute no console:');
console.log('1. clearTestData() - limpar dados');
console.log('2. saveTextTransaction() - testar transação texto');
console.log('3. saveFileTransactions() - testar transações arquivo');
console.log('4. checkSavedTransactions() - verificar resultados');

// Expor funções globalmente para teste no console
window.clearTestData = clearTestData;
window.saveTextTransaction = saveTextTransaction;
window.saveFileTransactions = saveFileTransactions;
window.checkSavedTransactions = checkSavedTransactions;
