// Script para adicionar despesas de exemplo ao sistema
// Executar no console do navegador após fazer login

const addExampleExpenses = () => {
  console.log('🏠 Adicionando despesas de exemplo...');
  
  const exampleExpenses = [
    {
      description: "Aluguel de Apartamento Compacto", 
      amount: 2500, 
      type: "expense", 
      category: "moradia",
      date: "2025-06-16"
    },
    {
      description: "Plano de Saúde Premium", 
      amount: 850, 
      type: "expense", 
      category: "saude",
      date: "2025-06-16"
    },
    {
      description: "Assinatura de Internet 5G", 
      amount: 150, 
      type: "expense", 
      category: "tecnologia",
      date: "2025-06-16"
    },
    {
      description: "Curso de Idiomas Online", 
      amount: 600, 
      type: "expense", 
      category: "educacao",
      date: "2025-06-16"
    },
    {
      description: "Manutenção de Carro Elétrico", 
      amount: 400, 
      type: "expense", 
      category: "transporte",
      date: "2025-06-16"
    },
    {
      description: "Clube de Assinatura de Vinhos", 
      amount: 200, 
      type: "expense", 
      category: "lazer",
      date: "2025-06-16"
    },
    {
      description: "Serviço de Limpeza Residencial", 
      amount: 350, 
      type: "expense", 
      category: "servicos",
      date: "2025-06-16"
    },
    {
      description: "Assinatura de Aplicativo de Fitness", 
      amount: 80, 
      type: "expense", 
      category: "saude",
      date: "2025-06-16"
    },
    {
      description: "Taxa de Condomínio", 
      amount: 700, 
      type: "expense", 
      category: "moradia",
      date: "2025-06-16"
    },
    {
      description: "Plano de Telefonia Móvel", 
      amount: 120, 
      type: "expense", 
      category: "tecnologia",
      date: "2025-06-16"
    }
  ];

  // Simular a função saveTransaction que existe no sistema
  try {
    // Buscar a função do localStorage
    const { saveTransaction: saveTransactionUtil, getCurrentUser, uuidv4 } = window;
    
    if (!saveTransactionUtil) {
      console.error('❌ Função saveTransaction não encontrada. Certifique-se de estar na página correta.');
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      console.error('❌ Usuário não encontrado. Faça login primeiro.');
      return;
    }

    console.log('✅ Usuário encontrado:', user.email);
    
    // Adicionar cada despesa
    exampleExpenses.forEach((expense, index) => {
      const transaction = {
        id: uuidv4(),
        userId: user.id,
        title: expense.description,
        amount: expense.amount,
        type: expense.type,
        category: expense.category,
        date: new Date(expense.date),
        created_at: new Date(),
        updated_at: new Date()
      };
      
      saveTransactionUtil(transaction);
      console.log(`✅ ${index + 1}/10 - ${expense.description}: R$ ${expense.amount}`);
    });

    console.log('🎉 Todas as despesas foram adicionadas com sucesso!');
    console.log('💰 Total adicionado: R$ ' + exampleExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2));
    console.log('📊 Verifique o Dashboard para ver as transações.');
    
    // Forçar atualização do Dashboard
    setTimeout(() => {
      window.dispatchEvent(new Event('transactionsUpdated'));
      console.log('🔄 Dashboard atualizado!');
    }, 1000);

  } catch (error) {
    console.error('❌ Erro ao adicionar despesas:', error);
    console.log('💡 Dica: Execute este script na página do Dashboard ou Financial Advisor.');
  }
};

// Executar automaticamente se estiver no contexto correto
if (typeof window !== 'undefined' && window.location) {
  console.log('🚀 Script carregado. Execute addExampleExpenses() para adicionar as despesas.');
} else {
  addExampleExpenses();
}
