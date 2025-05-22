import { 
  saveTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getTransactions,
  saveBill,
  updateBill,
  deleteBill,
  getBills,
  markBillAsPaid,
  saveNotification,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  markAllNotificationsAsRead,
  clearAllNotifications,
  saveUser,
  getCurrentUser
} from './localStorage';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, Bill, Notification } from '@/types';
import { supabase } from '@/lib/supabase';

// Função para testar a integração com o Supabase
export const testSupabaseIntegration = async () => {
  console.log('Iniciando testes de integração com Supabase...');
  
  // Verificar se o usuário está autenticado
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('Usuário não autenticado. Faça login para testar a integração.');
    return;
  }
  
  const user = getCurrentUser();
  if (!user) {
    console.error('Usuário não encontrado no localStorage. Faça login para testar a integração.');
    return;
  }
  
  console.log('Usuário autenticado:', user);
  
  // Array para armazenar os IDs dos itens criados para limpeza posterior
  const createdTransactionIds: string[] = [];
  const createdBillIds: string[] = [];
  const createdNotificationIds: string[] = [];
  
  try {
    // 1. Testar transações
    console.log('\n--- Testando Transações ---');
    
    // 1.1 Criar uma transação de receita
    const incomeTransaction: Transaction = {
      id: uuidv4(),
      title: 'Teste de Receita',
      amount: 1000,
      type: 'income',
      category: 'Salário',
      date: new Date(),
      userId: user.id
    };
    
    console.log('Criando transação de receita...');
    saveTransaction(incomeTransaction);
    createdTransactionIds.push(incomeTransaction.id);
    
    // 1.2 Criar uma transação de despesa
    const expenseTransaction: Transaction = {
      id: uuidv4(),
      title: 'Teste de Despesa',
      amount: 500,
      type: 'expense',
      category: 'Alimentação',
      date: new Date(),
      userId: user.id
    };
    
    console.log('Criando transação de despesa...');
    saveTransaction(expenseTransaction);
    createdTransactionIds.push(expenseTransaction.id);
    
    // 1.3 Criar uma transação recorrente
    const recurringTransaction: Transaction = {
      id: uuidv4(),
      title: 'Teste de Recorrência',
      amount: 300,
      type: 'expense',
      category: 'Assinaturas',
      date: new Date(),
      userId: user.id,
      isRecurring: true,
      recurringDay: 15,
      recurrenceFrequency: 'monthly'
    };
    
    console.log('Criando transação recorrente...');
    saveTransaction(recurringTransaction);
    createdTransactionIds.push(recurringTransaction.id);
    
    // 1.4 Buscar transações
    console.log('Buscando transações...');
    const transactions = getTransactions();
    console.log(`Encontradas ${transactions.length} transações`);
    
    // 1.5 Atualizar uma transação
    if (transactions.length > 0) {
      const transactionToUpdate = transactions.find(t => t.id === incomeTransaction.id);
      if (transactionToUpdate) {
        console.log('Atualizando transação...');
        transactionToUpdate.amount = 1200;
        updateTransaction(transactionToUpdate);
      }
    }
    
    // 2. Testar contas a pagar
    console.log('\n--- Testando Contas a Pagar ---');
    
    // 2.1 Criar uma conta a pagar simples
    const simpleBill: Bill = {
      id: uuidv4(),
      userId: user.id,
      title: 'Teste de Conta',
      amount: 150,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      category: 'Serviços',
      isPaid: false
    };
    
    console.log('Criando conta a pagar simples...');
    saveBill(simpleBill);
    createdBillIds.push(simpleBill.id);
    
    // 2.2 Criar uma conta a pagar recorrente
    const recurringBill: Bill = {
      id: uuidv4(),
      userId: user.id,
      title: 'Teste de Conta Recorrente',
      amount: 99.90,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
      category: 'Assinaturas',
      isPaid: false,
      isRecurring: true,
      recurringDay: 10,
      notificationsEnabled: true,
      notificationDays: [5, 1, 0]
    };
    
    console.log('Criando conta a pagar recorrente...');
    saveBill(recurringBill);
    createdBillIds.push(recurringBill.id);
    
    // 2.3 Criar uma conta a pagar parcelada
    const installmentBill: Bill = {
      id: uuidv4(),
      userId: user.id,
      title: 'Teste de Conta Parcelada',
      amount: 1200,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      category: 'Compras',
      isPaid: false,
      totalInstallments: 12,
      currentInstallment: 1
    };
    
    console.log('Criando conta a pagar parcelada...');
    saveBill(installmentBill);
    createdBillIds.push(installmentBill.id);
    
    // 2.4 Buscar contas a pagar
    console.log('Buscando contas a pagar...');
    const bills = getBills();
    console.log(`Encontradas ${bills.length} contas a pagar`);
    
    // 2.5 Atualizar uma conta a pagar
    if (bills.length > 0) {
      const billToUpdate = bills.find(b => b.id === simpleBill.id);
      if (billToUpdate) {
        console.log('Atualizando conta a pagar...');
        billToUpdate.amount = 180;
        updateBill(billToUpdate);
      }
    }
    
    // 2.6 Marcar uma conta como paga
    if (bills.length > 0) {
      console.log('Marcando conta como paga...');
      markBillAsPaid(simpleBill.id);
    }
    
    // 3. Testar notificações
    console.log('\n--- Testando Notificações ---');
    
    // 3.1 Criar uma notificação
    const notification: Notification = {
      id: uuidv4(),
      userId: user.id,
      billId: recurringBill.id, // Adicionando uma referência a uma conta
      type: 'dueDay', // Usando um tipo válido de NotificationType
      message: 'Teste de notificação',
      date: new Date(),
      read: false
    };
    
    console.log('Criando notificação...');
    saveNotification(notification);
    createdNotificationIds.push(notification.id);
    
    // 3.2 Criar uma notificação de conta a pagar
    const billNotification: Notification = {
      id: uuidv4(),
      userId: user.id,
      billId: simpleBill.id,
      type: 'dueDay',
      message: `A conta "${simpleBill.title}" vence hoje!`,
      date: new Date(),
      read: false
    };
    
    console.log('Criando notificação de conta a pagar...');
    saveNotification(billNotification);
    createdNotificationIds.push(billNotification.id);
    
    // 3.3 Buscar notificações
    console.log('Buscando notificações...');
    const notifications = getNotifications();
    console.log(`Encontradas ${notifications.length} notificações`);
    
    // 3.4 Marcar uma notificação como lida
    if (notifications.length > 0) {
      console.log('Marcando notificação como lida...');
      markNotificationAsRead(notification.id);
    }
    
    console.log('\nTodos os testes foram concluídos com sucesso!');
    
    // Perguntar se deseja limpar os dados de teste
    const shouldCleanup = window.confirm('Deseja limpar os dados de teste criados?');
    if (shouldCleanup) {
      // Limpar transações
      for (const id of createdTransactionIds) {
        deleteTransaction(id);
      }
      
      // Limpar contas a pagar
      for (const id of createdBillIds) {
        deleteBill(id);
      }
      
      // Limpar notificações
      for (const id of createdNotificationIds) {
        deleteNotification(id);
      }
      
      console.log('Dados de teste limpos com sucesso!');
    }
    
  } catch (error) {
    console.error('Erro durante os testes:', error);
  }
};

// Exportar uma função que pode ser chamada do console para facilitar o teste
(window as any).testSupabaseIntegration = testSupabaseIntegration;
