// Script para executar no console do navegador (F12)
// Execute este código depois de fazer login no sistema

const addExampleExpenses = async () => {
  console.log('🏠 Adicionando despesas de exemplo...');
  
  // Verificar se está no contexto correto
  if (typeof window === 'undefined' || !window.localStorage) {
    console.error('❌ Execute este script no console do navegador');
    return;
  }
  
  // Importar funções necessárias
  const { saveTransaction, getCurrentUser, uuidv4 } = await import('./src/utils/localStorage.ts');
  
  if (!getCurrentUser()) {
    console.error('❌ Faça login no sistema primeiro');
    return;
  }
  
  const exampleExpenses = [
    {
      title: 'Aluguel de Apartamento Compacto',
      amount: 2500.00,
      type: 'expense',
      category: 'moradia'
    },
    {
      title: 'Plano de Saúde Premium',
      amount: 850.00,
      type: 'expense',
      category: 'saude'
    },
    {
      title: 'Internet 5G',
      amount: 150.00,
      type: 'expense',
      category: 'tecnologia'
    },
    {
      title: 'Curso de Idiomas Online',
      amount: 300.00,
      type: 'expense',
      category: 'educacao'
    },
    {
      title: 'Manutenção Carro Elétrico',
      amount: 400.00,
      type: 'expense',
      category: 'transporte'
    },
    {
      title: 'Clube de Vinhos',
      amount: 200.00,
      type: 'expense',
      category: 'lazer'
    },
    {
      title: 'Serviço de Limpeza',
      amount: 350.00,
      type: 'expense',
      category: 'servicos'
    },
    {
      title: 'App de Fitness',
      amount: 80.00,
      type: 'expense',
      category: 'saude'
    },
    {
      title: 'Taxa de Condomínio',
      amount: 700.00,
      type: 'expense',
      category: 'moradia'
    },
    {
      title: 'Plano de Celular',
      amount: 120.00,
      type: 'expense',
      category: 'tecnologia'
    }
  ];
  
  const currentDate = new Date();
  
  for (let i = 0; i < exampleExpenses.length; i++) {
    const expense = exampleExpenses[i];
    
    // Distribuir as datas ao longo do mês
    const dayOfMonth = Math.floor((i + 1) * (28 / exampleExpenses.length)) + 1;
    const transactionDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOfMonth);
    
    const transaction = {
      id: uuidv4(),
      title: expense.title,
      amount: expense.amount,
      type: expense.type,
      category: expense.category,
      date: transactionDate,
      userId: getCurrentUser().id
    };
    
    console.log(`${i + 1}. Adicionando: ${expense.title} - R$ ${expense.amount}`);
    
    try {
      saveTransaction(transaction);
      console.log(`✅ ${expense.title} adicionado com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao adicionar ${expense.title}:`, error);
    }
    
    // Pequeno delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🎉 Todas as despesas de exemplo foram adicionadas!');
  console.log('🔄 Recarregue a página para ver as transações no Dashboard!');
  
  // Disparar evento para atualizar a UI
  window.dispatchEvent(new Event('transactionsUpdated'));
};

// Executar
addExampleExpenses().catch(console.error);

console.log(`
🎯 INSTRUÇÕES:
1. Abra o sistema no navegador e faça login
2. Pressione F12 para abrir o DevTools
3. Vá para a aba Console
4. Cole e execute este código
5. As despesas serão adicionadas automaticamente
`);
