// Script para popular dados de demonstração para o usuário staterbills@gmail.com
// Execute com: node scripts/populate-demo-data.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
// Service Role Key - tem acesso admin
const supabaseServiceKey = 'YOUR_JWT_TOKEN';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const USER_EMAIL = 'staterbills@gmail.com';

// Função para gerar UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Datas para os últimos 3 meses
function getDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

function getFutureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString();
}

async function main() {
  console.log('🚀 Iniciando população de dados de demonstração...');
  
  // 1. Buscar o user_id do email
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.log('⚠️ Não foi possível usar admin API, tentando buscar de outra forma...');
    
    // Tentar buscar da tabela users se existir
    const { data: userFromTable, error: tableError } = await supabase
      .from('users')
      .select('id')
      .eq('email', USER_EMAIL)
      .single();
    
    if (tableError || !userFromTable) {
      console.error('❌ Usuário não encontrado:', USER_EMAIL);
      console.log('Por favor, insira o user_id manualmente abaixo e execute novamente.');
      return;
    }
    
    await populateData(userFromTable.id);
    return;
  }
  
  const user = users?.users?.find(u => u.email === USER_EMAIL);
  
  if (!user) {
    console.error('❌ Usuário não encontrado:', USER_EMAIL);
    return;
  }
  
  console.log('✅ Usuário encontrado:', user.id);
  await populateData(user.id);
}

async function populateData(userId) {
  console.log(`\n📊 Populando dados para user_id: ${userId}`);
  
  // 1. Limpar dados existentes
  console.log('\n🗑️ Limpando dados existentes...');
  
  const { error: delTransactions } = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId);
  
  if (delTransactions) console.log('Erro ao deletar transactions:', delTransactions.message);
  else console.log('  ✓ Transações removidas');
  
  const { error: delBills } = await supabase
    .from('bills')
    .delete()
    .eq('user_id', userId);
  
  if (delBills) console.log('Erro ao deletar bills:', delBills.message);
  else console.log('  ✓ Contas removidas');
  
  const { error: delNotifications } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);
  
  if (delNotifications) console.log('Erro ao deletar notifications:', delNotifications.message);
  else console.log('  ✓ Notificações removidas');

  // 2. Inserir transações de demonstração
  console.log('\n💰 Inserindo transações...');
  
  const transactions = [
    // === ENTRADAS (Salário e outros) ===
    // Novembro
    { title: 'Salário', amount: 5000, type: 'income', category: 'Salário', date: getDate(32) },
    { title: 'Freelance - Site', amount: 800, type: 'income', category: 'Freelance', date: getDate(25) },
    
    // Dezembro (mês atual)
    { title: 'Salário', amount: 5000, type: 'income', category: 'Salário', date: getDate(2) },
    { title: 'Cashback Nubank', amount: 45.80, type: 'income', category: 'Cashback/Recompensas', date: getDate(5) },
    { title: 'Venda Mercado Livre', amount: 150, type: 'income', category: 'Venda de Produtos', date: getDate(10) },
    
    // Outubro
    { title: 'Salário', amount: 5000, type: 'income', category: 'Salário', date: getDate(62) },
    { title: 'Dividendos ITSA4', amount: 120.50, type: 'income', category: 'Dividendos', date: getDate(55) },
    
    // === DESPESAS FIXAS ===
    // Novembro
    { title: 'Aluguel', amount: 1200, type: 'expense', category: 'Moradia/Aluguel', date: getDate(35) },
    { title: 'Condomínio', amount: 350, type: 'expense', category: 'Moradia/Aluguel', date: getDate(35) },
    { title: 'Energia Elétrica', amount: 185.40, type: 'expense', category: 'Energia Elétrica', date: getDate(28) },
    { title: 'Água e Esgoto', amount: 95.20, type: 'expense', category: 'Água', date: getDate(30) },
    { title: 'Internet Vivo Fibra', amount: 129.90, type: 'expense', category: 'Internet', date: getDate(27) },
    { title: 'Celular Claro', amount: 79.90, type: 'expense', category: 'Telefone/Celular', date: getDate(29) },
    { title: 'Spotify Premium', amount: 21.90, type: 'expense', category: 'Streaming/Assinaturas', date: getDate(20) },
    { title: 'Netflix', amount: 39.90, type: 'expense', category: 'Streaming/Assinaturas', date: getDate(22) },
    { title: 'Plano de Saúde', amount: 450, type: 'expense', category: 'Saúde', date: getDate(33) },
    
    // Dezembro
    { title: 'Aluguel', amount: 1200, type: 'expense', category: 'Moradia/Aluguel', date: getDate(3) },
    { title: 'Condomínio', amount: 350, type: 'expense', category: 'Moradia/Aluguel', date: getDate(3) },
    { title: 'Energia Elétrica', amount: 210.75, type: 'expense', category: 'Energia Elétrica', date: getDate(1) },
    { title: 'Internet Vivo Fibra', amount: 129.90, type: 'expense', category: 'Internet', date: getDate(4) },
    { title: 'Spotify Premium', amount: 21.90, type: 'expense', category: 'Streaming/Assinaturas', date: getDate(6) },
    { title: 'Netflix', amount: 39.90, type: 'expense', category: 'Streaming/Assinaturas', date: getDate(8) },
    
    // Outubro
    { title: 'Aluguel', amount: 1200, type: 'expense', category: 'Moradia/Aluguel', date: getDate(65) },
    { title: 'Condomínio', amount: 350, type: 'expense', category: 'Moradia/Aluguel', date: getDate(65) },
    { title: 'Energia Elétrica', amount: 165.30, type: 'expense', category: 'Energia Elétrica', date: getDate(58) },
    
    // === ALIMENTAÇÃO ===
    // Dezembro
    { title: 'Supermercado Extra', amount: 485.60, type: 'expense', category: 'Supermercado', date: getDate(1) },
    { title: 'iFood - Almoço', amount: 35.90, type: 'expense', category: 'Delivery/iFood', date: getDate(2) },
    { title: 'Padaria Pão Quente', amount: 28.50, type: 'expense', category: 'Alimentação', date: getDate(3) },
    { title: 'Restaurante La Pasta', amount: 89.00, type: 'expense', category: 'Alimentação', date: getDate(5) },
    { title: 'Café Starbucks', amount: 32.00, type: 'expense', category: 'Alimentação', date: getDate(7) },
    
    // Novembro
    { title: 'Supermercado Carrefour', amount: 520.40, type: 'expense', category: 'Supermercado', date: getDate(24) },
    { title: 'Supermercado Extra', amount: 312.80, type: 'expense', category: 'Supermercado', date: getDate(38) },
    { title: 'iFood - Jantar', amount: 52.90, type: 'expense', category: 'Delivery/iFood', date: getDate(26) },
    { title: 'iFood - Pizza', amount: 65.00, type: 'expense', category: 'Delivery/iFood', date: getDate(31) },
    { title: 'Restaurante Outback', amount: 156.00, type: 'expense', category: 'Alimentação', date: getDate(36) },
    
    // === TRANSPORTE ===
    { title: 'Uber - Trabalho', amount: 18.50, type: 'expense', category: 'Uber/99/Táxi', date: getDate(2) },
    { title: 'Uber - Shopping', amount: 24.00, type: 'expense', category: 'Uber/99/Táxi', date: getDate(6) },
    { title: 'Gasolina Shell', amount: 250, type: 'expense', category: 'Combustível', date: getDate(8) },
    { title: 'Estacionamento Shopping', amount: 15, type: 'expense', category: 'Transporte', date: getDate(6) },
    { title: 'Gasolina Ipiranga', amount: 200, type: 'expense', category: 'Combustível', date: getDate(25) },
    { title: '99 - Centro', amount: 22.30, type: 'expense', category: 'Uber/99/Táxi', date: getDate(30) },
    
    // === LAZER E ENTRETENIMENTO ===
    { title: 'Cinema Cinemark', amount: 45.00, type: 'expense', category: 'Lazer/Entretenimento', date: getDate(7) },
    { title: 'Bar com amigos', amount: 120.00, type: 'expense', category: 'Lazer/Entretenimento', date: getDate(14) },
    { title: 'Ingresso Show', amount: 180.00, type: 'expense', category: 'Lazer/Entretenimento', date: getDate(21) },
    { title: 'PlayStation Store', amount: 249.90, type: 'expense', category: 'Lazer/Entretenimento', date: getDate(40) },
    
    // === COMPRAS ===
    { title: 'Amazon - Fone Bluetooth', amount: 189.00, type: 'expense', category: 'Compras Online', date: getDate(15) },
    { title: 'Renner - Roupas', amount: 235.80, type: 'expense', category: 'Vestuário', date: getDate(20) },
    { title: 'Farmácia Drogasil', amount: 87.50, type: 'expense', category: 'Saúde', date: getDate(12) },
    { title: 'Mercado Livre - Cabo USB', amount: 35.00, type: 'expense', category: 'Compras Online', date: getDate(45) },
    
    // === EDUCAÇÃO ===
    { title: 'Curso Udemy', amount: 27.90, type: 'expense', category: 'Educação/Cursos', date: getDate(18) },
    { title: 'Livro Amazon', amount: 45.00, type: 'expense', category: 'Educação/Cursos', date: getDate(42) },
    
    // === INVESTIMENTOS (como despesa para demonstrar diversificação) ===
    { title: 'Aporte Nubank RDB', amount: 500, type: 'expense', category: 'Investimentos', date: getDate(5) },
    { title: 'Aporte Tesouro Selic', amount: 300, type: 'expense', category: 'Investimentos', date: getDate(35) },
  ];
  
  // Formatar para o Supabase
  const formattedTransactions = transactions.map(t => ({
    id: generateUUID(),
    user_id: userId,
    title: t.title,
    amount: t.amount,
    type: t.type,
    category: t.category,
    date: t.date,
    is_recurring: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { error: insertTransError } = await supabase
    .from('transactions')
    .insert(formattedTransactions);
  
  if (insertTransError) {
    console.error('❌ Erro ao inserir transações:', insertTransError.message);
  } else {
    console.log(`  ✓ ${formattedTransactions.length} transações inseridas`);
  }
  
  // 3. Inserir contas a pagar (bills)
  console.log('\n📅 Inserindo contas a pagar...');
  
  const bills = [
    // Contas futuras (próximos dias)
    { 
      title: 'Cartão Nubank', 
      amount: 1250.40, 
      due_date: getFutureDate(8), 
      category: 'Cartão de Crédito',
      is_paid: false,
      is_recurring: true,
      recurring_day: 10
    },
    { 
      title: 'Cartão Inter', 
      amount: 485.90, 
      due_date: getFutureDate(13), 
      category: 'Cartão de Crédito',
      is_paid: false,
      is_recurring: true,
      recurring_day: 15
    },
    { 
      title: 'Academia SmartFit', 
      amount: 99.90, 
      due_date: getFutureDate(3), 
      category: 'Academia/Esporte',
      is_paid: false,
      is_recurring: true,
      recurring_day: 5
    },
    { 
      title: 'Seguro do Carro', 
      amount: 185.00, 
      due_date: getFutureDate(18), 
      category: 'Seguro',
      is_paid: false,
      is_recurring: true,
      recurring_day: 20
    },
    { 
      title: 'Parcela Notebook (3/12)', 
      amount: 350.00, 
      due_date: getFutureDate(23), 
      category: 'Parcelamentos',
      is_paid: false,
      is_recurring: false,
      total_installments: 12,
      current_installment: 3
    },
    { 
      title: 'IPTU 2024 (11/12)', 
      amount: 125.00, 
      due_date: getFutureDate(28), 
      category: 'Impostos',
      is_paid: false,
      is_recurring: false,
      total_installments: 12,
      current_installment: 11
    },
    { 
      title: 'Água e Esgoto', 
      amount: 95.00, 
      due_date: getFutureDate(15), 
      category: 'Água',
      is_paid: false,
      is_recurring: true,
      recurring_day: 17
    },
    
    // Conta paga recentemente
    { 
      title: 'Celular Claro', 
      amount: 79.90, 
      due_date: getDate(1), 
      category: 'Telefone/Celular',
      is_paid: true,
      is_recurring: true,
      recurring_day: 1
    },
    { 
      title: 'Internet Vivo', 
      amount: 129.90, 
      due_date: getDate(3), 
      category: 'Internet',
      is_paid: true,
      is_recurring: true,
      recurring_day: 28
    },
  ];
  
  const formattedBills = bills.map(b => ({
    id: generateUUID(),
    user_id: userId,
    title: b.title,
    amount: b.amount,
    due_date: b.due_date,
    category: b.category,
    is_paid: b.is_paid,
    is_recurring: b.is_recurring || false,
    recurring_day: b.recurring_day || null,
    total_installments: b.total_installments || null,
    current_installment: b.current_installment || null,
    notifications_enabled: true,
    notification_days: [5, 1, 0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  
  const { error: insertBillsError } = await supabase
    .from('bills')
    .insert(formattedBills);
  
  if (insertBillsError) {
    console.error('❌ Erro ao inserir contas:', insertBillsError.message);
  } else {
    console.log(`  ✓ ${formattedBills.length} contas inseridas`);
  }
  
  // 4. Resumo
  console.log('\n' + '='.repeat(50));
  console.log('✅ DADOS DE DEMONSTRAÇÃO POPULADOS COM SUCESSO!');
  console.log('='.repeat(50));
  
  // Calcular totais
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalPendingBills = bills.filter(b => !b.is_paid).reduce((sum, b) => sum + b.amount, 0);
  
  console.log(`\n📊 RESUMO:`);
  console.log(`   💵 Total de Entradas: R$ ${totalIncome.toFixed(2)}`);
  console.log(`   💸 Total de Saídas: R$ ${totalExpense.toFixed(2)}`);
  console.log(`   📉 Saldo: R$ ${(totalIncome - totalExpense).toFixed(2)}`);
  console.log(`   📅 Contas Pendentes: R$ ${totalPendingBills.toFixed(2)}`);
  console.log(`\n   ${formattedTransactions.length} transações criadas`);
  console.log(`   ${formattedBills.length} contas criadas`);
}

main().catch(console.error);
