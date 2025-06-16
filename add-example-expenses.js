// Script para adicionar despesas de exemplo
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hkukcqaxftlykrcyjzlg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdwtjcWF4ZnRseWtyY3lqemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5OTA0ODEsImV4cCI6MjA0ODU2NjQ4MX0.uWdGjOHtUYv8nNuAJONZCvJyNOwpNpLLfCl5_y5UrPQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const exampleExpenses = [
  {
    title: 'Aluguel de Apartamento Compacto',
    amount: 2500.00,
    type: 'expense',
    category: 'moradia',
    description: 'Apartamento de 40m² em bairro residencial de grande cidade'
  },
  {
    title: 'Plano de Saúde Premium',
    amount: 850.00,
    type: 'expense',
    category: 'saude',
    description: 'Cobertura completa com consultas, exames e internações'
  },
  {
    title: 'Internet 5G',
    amount: 150.00,
    type: 'expense',
    category: 'tecnologia',
    description: 'Conexão 1GB/s com acesso ilimitado para streaming e jogos'
  },
  {
    title: 'Curso de Idiomas Online',
    amount: 300.00, // R$ 600 por semestre = R$ 300 por mês
    type: 'expense',
    category: 'educacao',
    description: 'Aulas virtuais de inglês avançado com professores nativos'
  },
  {
    title: 'Manutenção Carro Elétrico',
    amount: 400.00,
    type: 'expense',
    category: 'transporte',
    description: 'Revisões, recarga de bateria e seguro de veículo compacto'
  },
  {
    title: 'Clube de Vinhos',
    amount: 200.00,
    type: 'expense',
    category: 'lazer',
    description: 'Três garrafas de vinhos nacionais e importados mensais'
  },
  {
    title: 'Serviço de Limpeza',
    amount: 350.00,
    type: 'expense',
    category: 'servicos',
    description: 'Faxinas semanais em casa de tamanho médio'
  },
  {
    title: 'App de Fitness',
    amount: 80.00,
    type: 'expense',
    category: 'saude',
    description: 'Treinos personalizados com personal trainer virtual'
  },
  {
    title: 'Taxa de Condomínio',
    amount: 700.00,
    type: 'expense',
    category: 'moradia',
    description: 'Prédio com piscina, academia e segurança 24 horas'
  },
  {
    title: 'Plano de Celular',
    amount: 120.00,
    type: 'expense',
    category: 'tecnologia',
    description: 'Pacote 50GB, ligações ilimitadas e roaming nacional'
  }
];

async function addExampleExpenses() {
  console.log('🏠 Adicionando despesas de exemplo...\n');
  
  try {
    // Verificar autenticação
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.log('❌ Erro: Usuário não autenticado');
      console.log('⚠️  Faça login no sistema primeiro');
      return;
    }
    
    const userId = sessionData.session.user.id;
    console.log('✅ Usuário autenticado:', userId.slice(0, 8) + '...');
    
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Adicionar cada despesa
    for (let i = 0; i < exampleExpenses.length; i++) {
      const expense = exampleExpenses[i];
      
      // Distribuir as datas ao longo do mês
      const dayOfMonth = Math.floor((i + 1) * (28 / exampleExpenses.length)) + 1;
      const transactionDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOfMonth);
      
      const transaction = {
        id: `example-${Date.now()}-${i}`,
        user_id: userId,
        title: expense.title,
        amount: expense.amount,
        type: expense.type,
        category: expense.category,
        date: transactionDate.toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log(`${i + 1}. Adicionando: ${expense.title} - R$ ${expense.amount}`);
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Erro ao adicionar ${expense.title}:`, error.message);
      } else {
        console.log(`✅ ${expense.title} adicionado com sucesso`);
      }
      
      // Pequeno delay para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n🎉 Todas as despesas de exemplo foram adicionadas!');
    console.log('\n📊 Resumo:');
    console.log(`• Total de despesas: ${exampleExpenses.length}`);
    const totalAmount = exampleExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    console.log(`• Valor total mensal: R$ ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log('\n🔄 Recarregue o Dashboard para ver as novas transações!');
    
  } catch (error) {
    console.error('❌ Erro no processo:', error);
  }
}

// Executar script
addExampleExpenses().catch(console.error);
