import { User, Transaction, Bill, Notification, CardItem, NotificationType } from "@/types";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

// Funções de autenticação e usuário

// Salvar usuário
export const saveUser = (user: User): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// Obter usuário atual
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return null;
  return JSON.parse(userStr);
};

// Verificar se o usuário está logado
export const isLoggedIn = (): boolean => {
  return !!getCurrentUser();
};

// Clear user data
export const clearUserData = (): void => {
  localStorage.removeItem('currentUser');
};

// Logout - Alias for clearUserData for backwards compatibility
export const logout = (): void => {
  clearUserData();
};

// Obter o usuário atual do Supabase
export const getSupabaseUser = async (): Promise<User | null> => {
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  
  if (supabaseUser) {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: supabaseUser.user_metadata?.username || supabaseUser.email || ''
    };
  }
  
  return null;
};

// Funções de mapeamento entre formatos locais e Supabase
const mapTransactionToSupabase = (transaction: Transaction, userId: string) => {
  return {
    id: transaction.id || uuidv4(),
    user_id: userId,
    title: transaction.title,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    is_recurring: transaction.isRecurring || false,
    recurring_day: transaction.recurringDay || null,
    recurrence_frequency: transaction.recurrenceFrequency || null,
    is_paid: transaction.isPaid || false,
    created_at: new Date().toISOString(),
  };
};

const mapSupabaseToTransaction = (data: any): Transaction => {
  return {
    id: data.id,
    title: data.title,
    amount: data.amount,
    type: data.type,
    category: data.category,
    date: new Date(data.date),
    userId: data.user_id,
    isRecurring: data.is_recurring || false,
    recurringDay: data.recurring_day || null,
    recurrenceFrequency: data.recurrence_frequency || null,
    isPaid: data.is_paid || false,
  };
};

// Estas funções foram movidas para serem exportadas na linha ~335

// Salvar uma transação no Supabase
export const saveSupabaseTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<{ data: any, error: any }> => {
  const user = getCurrentUser();
  if (!user) return { data: null, error: "Usuário não autenticado" };
  
  // Preparar dados para o Supabase
  const supabaseTransaction = mapTransactionToSupabase(transaction as Transaction, user.id);
  
  // Salvar no Supabase
  return await supabase
    .from('transactions')
    .insert(supabaseTransaction)
    .select()
    .single();
};

// Salvar uma transação (mantém a compatibilidade com o código existente)
export const saveTransaction = (transaction: Transaction): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Salvar localmente
  const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
  let transactions: Transaction[] = transactionsStr ? JSON.parse(transactionsStr) : [];
  transactions.push(transaction);
  localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
  
  // Também salvar no Supabase - com retry em caso de falha
  const saveToSupabase = async () => {
    try {
      // Tentar salvar no Supabase
      const result = await saveSupabaseTransaction(transaction);
      if (result.error) {
        throw result.error;
      }
      console.log("Transação salva com sucesso no Supabase:", transaction.title);
    } catch (error) {
      console.error("Erro ao salvar transação no Supabase:", error);
      
      // Tentar novamente após 3 segundos
      setTimeout(() => {
        console.log("Tentando salvar transação novamente no Supabase...");
        saveSupabaseTransaction(transaction).catch(retryError => {
          console.error("Falha na segunda tentativa de salvar no Supabase:", retryError);
        });
      }, 3000);
    }
  };
  
  // Iniciar o processo de salvamento no Supabase
  saveToSupabase();
  
  window.dispatchEvent(new CustomEvent('transactionsUpdated'));
};

// Obter transações do Supabase
export const getSupabaseTransactions = async (userId: string, month?: number, year?: number, startDate?: string, endDate?: string): Promise<{ data: any[], error: any }> => {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);
    
    // Filtrar por intervalo de datas, se fornecido
    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    } 
    // Ou filtrar por mês/ano, se fornecido
    else if (month !== undefined && year !== undefined) {
      const startOfMonth = new Date(year, month, 1).toISOString();
      const endOfMonth = new Date(year, month + 1, 0).toISOString();
      query = query.gte('date', startOfMonth).lte('date', endOfMonth);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    return { data: data || [], error };
  } catch (error) {
    console.error("Erro ao buscar transações do Supabase:", error);
    return { data: [], error };
  }
};

// Obter todas as transações do usuário atual (mantém compatibilidade com o código existente)
export const getTransactions = (): Transaction[] => {
  const user = getCurrentUser();
  if (!user) return [];
  
  // Buscar do localStorage
  const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
  if (!transactionsStr) return [];
  
  // Também buscar do Supabase em segundo plano para sincronizar
  getSupabaseTransactions(user.id).then(({ data, error }) => {
    if (error) {
      console.error("Erro ao sincronizar transações com Supabase:", error);
      return;
    }
    
    if (data && data.length > 0) {
      const transactions = data.map(mapSupabaseToTransaction);
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
      window.dispatchEvent(new CustomEvent('transactionsUpdated'));
    }
  });
  
  return JSON.parse(transactionsStr);
};

// Salvar várias transações de uma vez
export const saveTransactions = (transactions: Transaction[]): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
  let existingTransactions: Transaction[] = transactionsStr ? JSON.parse(transactionsStr) : [];
  
  existingTransactions = [...existingTransactions, ...transactions];
  localStorage.setItem(`transactions_${user.id}`, JSON.stringify(existingTransactions));
};

// Atualizar uma transação no Supabase
export const updateSupabaseTransaction = async (transaction: Transaction): Promise<{ data: any, error: any }> => {
  const user = getCurrentUser();
  if (!user || !transaction.id) return { data: null, error: "Usuário não autenticado ou ID da transação não fornecido" };
  
  // Preparar dados para o Supabase
  const supabaseTransaction = mapTransactionToSupabase(transaction, user.id);
  
  // Atualizar no Supabase
  return await supabase
    .from('transactions')
    .update(supabaseTransaction)
    .eq('id', transaction.id)
    .select()
    .single();
};

// Atualizar uma transação específica (mantém compatibilidade com o código existente)
export const updateTransaction = (transaction: Transaction): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Atualizar localmente
  const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
  if (!transactionsStr) return;
  
  let transactions: Transaction[] = JSON.parse(transactionsStr);
  const index = transactions.findIndex(t => t.id === transaction.id);
  
  if (index !== -1) {
    transactions[index] = transaction;
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
    
    // Também atualizar no Supabase - com retry em caso de falha
    const updateInSupabase = async () => {
      try {
        // Tentar atualizar no Supabase
        const result = await updateSupabaseTransaction(transaction);
        if (result.error) {
          throw result.error;
        }
        console.log("Transação atualizada com sucesso no Supabase:", transaction.title);
      } catch (error) {
        console.error("Erro ao atualizar transação no Supabase:", error);
        
        // Tentar novamente após 3 segundos
        setTimeout(() => {
          console.log("Tentando atualizar transação novamente no Supabase...");
          updateSupabaseTransaction(transaction).catch(retryError => {
            console.error("Falha na segunda tentativa de atualizar no Supabase:", retryError);
          });
        }, 3000);
      }
    };
    
    // Iniciar o processo de atualização no Supabase
    updateInSupabase();
    
    window.dispatchEvent(new CustomEvent('transactionsUpdated'));
  }
};

// Deletar uma transação do Supabase
export const deleteSupabaseTransaction = async (userId: string, transactionId: string): Promise<{ error: any }> => {
  return await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId);
};

// Deletar uma transação específica (mantém compatibilidade com o código existente)
export const deleteTransaction = (transactionId: string): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Deletar localmente
  const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
  if (!transactionsStr) return;
  
  let transactions: Transaction[] = JSON.parse(transactionsStr);
  // Guardar a transação antes de removê-la (para log)
  const transactionToDelete = transactions.find(t => t.id === transactionId);
  transactions = transactions.filter(t => t.id !== transactionId);
  localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
  
  // Também deletar do Supabase - com retry em caso de falha
  const deleteFromSupabase = async () => {
    try {
      // Tentar deletar do Supabase
      const result = await deleteSupabaseTransaction(user.id, transactionId);
      if (result.error) {
        throw result.error;
      }
      console.log("Transação deletada com sucesso do Supabase:", 
                  transactionToDelete ? transactionToDelete.title : transactionId);
    } catch (error) {
      console.error("Erro ao deletar transação do Supabase:", error);
      
      // Tentar novamente após 3 segundos
      setTimeout(() => {
        console.log("Tentando deletar transação novamente do Supabase...");
        deleteSupabaseTransaction(user.id, transactionId).catch(retryError => {
          console.error("Falha na segunda tentativa de deletar do Supabase:", retryError);
        });
      }, 3000);
    }
  };
  
  // Iniciar o processo de exclusão no Supabase
  deleteFromSupabase();
  
  window.dispatchEvent(new CustomEvent('transactionsUpdated'));
};

// Verificar se um usuário existe
export const userExists = (username: string): boolean => {
  const usersStr = localStorage.getItem('users');
  if (!usersStr) return false;
  
  const users: User[] = JSON.parse(usersStr);
  return users.some(user => user.username === username);
};

// Registrar um novo usuário
export const registerUser = (user: Omit<User, 'id'> & { password: string }): User => {
  const usersStr = localStorage.getItem('users');
  let users: (User & { password: string })[] = usersStr ? JSON.parse(usersStr) : [];
  
  const newUser = {
    ...user,
    id: `user_${Date.now()}`
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  // Omitir a senha ao retornar o usuário
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Login
export const loginUser = (username: string, password: string): User | null => {
  const usersStr = localStorage.getItem('users');
  if (!usersStr) return null;
  
  const users: (User & { password: string })[] = JSON.parse(usersStr);
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Omitir a senha ao retornar o usuário
    const { password: _, ...userWithoutPassword } = user;
    saveUser(userWithoutPassword);
    return userWithoutPassword;
  }
  
  return null;
};

// Funções de mapeamento entre formatos locais e Supabase para contas a pagar
export const mapBillToSupabase = (bill: Bill, userId: string) => {
  return {
    id: bill.id || uuidv4(),
    user_id: userId,
    title: bill.title,
    amount: bill.amount,
    due_date: bill.dueDate instanceof Date ? bill.dueDate.toISOString() : bill.dueDate,
    category: bill.category,
    is_paid: bill.isPaid || false,
    is_recurring: bill.isRecurring || false,
    recurring_day: bill.recurringDay || null,
    total_installments: bill.totalInstallments || null,
    current_installment: bill.currentInstallment || null,
    notifications_enabled: bill.notificationsEnabled || false,
    notification_days: bill.notificationDays || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const mapSupabaseToBill = (data: any): Bill => {
  return {
    id: data.id,
    userId: data.user_id,
    title: data.title,
    amount: data.amount,
    dueDate: new Date(data.due_date),
    category: data.category,
    isPaid: data.is_paid || false,
    isRecurring: data.is_recurring || false,
    recurringDay: data.recurring_day || null,
    totalInstallments: data.total_installments || null,
    currentInstallment: data.current_installment || null,
    notificationsEnabled: data.notifications_enabled || false,
    notificationDays: data.notification_days || []
  };
};

// Salvar uma conta a pagar no Supabase
export const saveSupabaseBill = async (bill: Bill): Promise<{ data: any, error: any }> => {
  const user = getCurrentUser();
  if (!user) return { data: null, error: "Usuário não autenticado" };
  
  // Preparar dados para o Supabase
  const supabaseBill = mapBillToSupabase(bill, user.id);
  
  // Salvar no Supabase
  return await supabase
    .from('bills')
    .insert(supabaseBill)
    .select()
    .single();
};

// Salvar uma conta a pagar (mantém a compatibilidade com o código existente)
export const saveBill = (bill: Bill): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Gerar ID se necessário
  if (!bill.id) {
    bill.id = uuidv4();
  }
  
  // Salvar localmente
  const billsStr = localStorage.getItem(`bills_${user.id}`);
  let bills: Bill[] = billsStr ? JSON.parse(billsStr) : [];
  bills.push(bill);
  
  // Se for uma conta recorrente sem fim definido, gerar instâncias futuras (10 anos)
  if (bill.isRecurring && bill.isInfiniteRecurrence) {
    const originalBillId = bill.id;
    const dueDate = new Date(bill.dueDate);
    const recurringDay = dueDate.getDate();
    
    // Gerar instâncias para 10 anos (120 meses)
    for (let i = 1; i <= 120; i++) {
      // Calcular próxima data de vencimento
      const nextDueDate = new Date(dueDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + i);
      
      // Ajustar para o dia correto (considerando meses com menos dias)
      nextDueDate.setDate(Math.min(recurringDay, new Date(nextDueDate.getFullYear(), nextDueDate.getMonth() + 1, 0).getDate()));
      
      // Criar nova instância da conta
      const futureBill: Bill = {
        ...bill,
        id: uuidv4(),
        dueDate: nextDueDate,
        isPaid: false,
        originalBillId: originalBillId,
        originalDueDate: dueDate
      };
      
      bills.push(futureBill);
      
      // Também salvar no Supabase em segundo plano
      saveSupabaseBill(futureBill).catch(error => {
        console.error(`Erro ao salvar instância futura (mês ${i}) no Supabase:`, error);
      });
    }
  }
  
  localStorage.setItem(`bills_${user.id}`, JSON.stringify(bills));
  
  // Também salvar no Supabase em segundo plano
  saveSupabaseBill(bill).catch(error => {
    console.error("Erro ao salvar conta a pagar no Supabase:", error);
  });
  
  window.dispatchEvent(new CustomEvent('billsUpdated'));
};

// Obter contas a pagar do Supabase
export const getSupabaseBills = async (userId: string, onlyActive: boolean = false): Promise<{ data: Bill[], error: any }> => {
  try {
    let query = supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    let bills = data ? data.map(mapSupabaseToBill) : [];
    
    // Filtrar apenas contas ativas, se solicitado
    if (onlyActive) {
      bills = bills.filter(bill => !bill.isPaid);
    }
    
    return { data: bills, error: null };
  } catch (error) {
    console.error("Erro ao buscar contas do Supabase:", error);
    return { data: [], error };
  }
};

// Obter todas as contas a pagar do usuário atual (mantém compatibilidade com o código existente)
export const getBills = (onlyActive: boolean = true): Bill[] => {
  const user = getCurrentUser();
  if (!user) return [];
  
  // Buscar do localStorage
  const billsStr = localStorage.getItem(`bills_${user.id}`);
  if (!billsStr) return [];
  
  let bills: Bill[] = JSON.parse(billsStr);
  
  // Filtrar apenas contas ativas, se solicitado
  if (onlyActive) {
    bills = bills.filter(bill => !bill.isPaid);
  }
  
  // Também buscar do Supabase em segundo plano para sincronizar
  getSupabaseBills(user.id, false).then(({ data, error }) => {
    if (error) {
      console.error("Erro ao sincronizar contas a pagar com Supabase:", error);
      return;
    }
    
    if (data && data.length > 0) {
      localStorage.setItem(`bills_${user.id}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('billsUpdated'));
    }
  });
  
  return bills;
};

// Atualizar uma conta a pagar no Supabase
export const updateSupabaseBill = async (bill: Bill): Promise<{ data: any, error: any }> => {
  const user = getCurrentUser();
  if (!user || !bill.id) return { data: null, error: "Usuário não autenticado ou ID da conta não fornecido" };
  
  // Preparar dados para o Supabase
  const supabaseBill = mapBillToSupabase(bill, user.id);
  
  // Atualizar no Supabase
  return await supabase
    .from('bills')
    .update(supabaseBill)
    .eq('id', bill.id)
    .eq('user_id', user.id)
    .select()
    .single();
};

// Atualizar uma conta a pagar específica (mantém compatibilidade com o código existente)
export const updateBill = (bill: Bill): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Atualizar localmente
  const billsStr = localStorage.getItem(`bills_${user.id}`);
  if (!billsStr) return;
  
  let bills: Bill[] = JSON.parse(billsStr);
  const index = bills.findIndex(b => b.id === bill.id);
  
  if (index !== -1) {
    bills[index] = bill;
    localStorage.setItem(`bills_${user.id}`, JSON.stringify(bills));
    
    // Também atualizar no Supabase em segundo plano
    updateSupabaseBill(bill).catch(error => {
      console.error("Erro ao atualizar conta a pagar no Supabase:", error);
    });
    
    window.dispatchEvent(new CustomEvent('billsUpdated'));
  }
};

// Deletar uma conta a pagar do Supabase
export const deleteSupabaseBill = async (userId: string, billId: string): Promise<{ error: any }> => {
  return await supabase
    .from('bills')
    .delete()
    .eq('id', billId)
    .eq('user_id', userId);
};

// Deletar uma conta a pagar específica (mantém compatibilidade com o código existente)
export const deleteBill = (billId: string): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Deletar localmente
  const billsStr = localStorage.getItem(`bills_${user.id}`);
  if (!billsStr) return;
  
  let bills: Bill[] = JSON.parse(billsStr);
  bills = bills.filter(b => b.id !== billId);
  localStorage.setItem(`bills_${user.id}`, JSON.stringify(bills));
  
  // Também deletar do Supabase em segundo plano
  deleteSupabaseBill(user.id, billId).catch(error => {
    console.error("Erro ao deletar conta a pagar do Supabase:", error);
  });
  
  window.dispatchEvent(new CustomEvent('billsUpdated'));
};

// Marcar uma conta como paga
export const markBillAsPaid = (billId: string, onPaid?: (bill: Bill) => void): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Atualizar localmente
  const billsStr = localStorage.getItem(`bills_${user.id}`);
  if (!billsStr) return;
  
  let bills: Bill[] = JSON.parse(billsStr);
  const index = bills.findIndex(b => b.id === billId);
  
  if (index !== -1) {
    bills[index].isPaid = true;
    localStorage.setItem(`bills_${user.id}`, JSON.stringify(bills));
    
    // Também atualizar no Supabase em segundo plano
    updateSupabaseBill(bills[index]).catch(error => {
      console.error("Erro ao marcar conta como paga no Supabase:", error);
    });
    
    // Criar notificação
    const notification: Notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      billId: billId,
      userId: user.id,
      type: 'paid' as NotificationType,
      message: `Conta "${bills[index].title}" marcada como paga!`,
      date: new Date(),
      read: false
    };
    
    saveNotification(notification);
    
    if (onPaid) onPaid(bills[index]);
    
    window.dispatchEvent(new CustomEvent('billsUpdated'));
  }
};

// Processar transações recorrentes para o mês atual
export const processRecurringTransactions = (selectedMonth: number, selectedYear: number): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
  if (!transactionsStr) return;
  
  let transactions: Transaction[] = JSON.parse(transactionsStr);
  const recurringTransactions = transactions.filter(t => t.isRecurring);
  const newTransactions: Transaction[] = [];
  
  // Para cada transação recorrente, verificar se já existe uma para o mês/ano selecionado
  recurringTransactions.forEach(recTrans => {
    const recDate = new Date(recTrans.date);
    const existsForSelectedMonth = transactions.some(t => {
      const tDate = new Date(t.date);
      return t.title === recTrans.title && 
             tDate.getMonth() === selectedMonth && 
             tDate.getFullYear() === selectedYear &&
             t.amount === recTrans.amount;
    });
    
    // Se não existe, criar uma nova instância para o mês/ano selecionado
    if (!existsForSelectedMonth) {
      const newTransDate = new Date(selectedYear, selectedMonth, recTrans.recurringDay || new Date().getDate());
      const newTransaction: Transaction = {
        ...recTrans,
        id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: newTransDate
      };
      newTransactions.push(newTransaction);
    }
  });
  
  // Salvar as novas transações
};

// Funções de mapeamento entre formatos locais e Supabase para notificações
const mapNotificationToSupabase = (notification: Notification, userId: string) => {
  return {
    id: notification.id || uuidv4(),
    user_id: userId,
    bill_id: notification.billId || null,
    type: notification.type,
    message: notification.message,
    date: notification.date instanceof Date ? notification.date.toISOString() : notification.date,
    read: notification.read || false,
    created_at: new Date().toISOString(),
  };
};

const mapSupabaseToNotification = (data: any): Notification => {
  return {
    id: data.id,
    userId: data.user_id,
    billId: data.bill_id || null,
    type: data.type as NotificationType,
    message: data.message,
    date: new Date(data.date),
    read: data.read || false,
  };
};

// Salvar uma notificação no Supabase
export const saveSupabaseNotification = async (notification: Notification): Promise<{ data: any, error: any }> => {
  const user = getCurrentUser();
  if (!user) return { data: null, error: "Usuário não autenticado" };
  
  // Preparar dados para o Supabase
  const supabaseNotification = mapNotificationToSupabase(notification, user.id);
  
  // Salvar no Supabase
  return await supabase
    .from('notifications')
    .insert(supabaseNotification)
    .select()
    .single();
};

// Salvar uma notificação (mantém a compatibilidade com o código existente)
export const saveNotification = (notification: Notification): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Gerar ID se necessário
  if (!notification.id) {
    notification.id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Salvar localmente
  const notificationsStr = localStorage.getItem(`notifications_${user.id}`);
  let notifications: Notification[] = notificationsStr ? JSON.parse(notificationsStr) : [];
  notifications.push(notification);
  localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
  
  // Também salvar no Supabase em segundo plano
  saveSupabaseNotification(notification).catch(error => {
    console.error("Erro ao salvar notificação no Supabase:", error);
  });
  
  window.dispatchEvent(new CustomEvent('notificationsUpdated'));
};

// Obter notificações do Supabase
export const getSupabaseNotifications = async (userId: string): Promise<{ data: Notification[], error: any }> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    const notifications = data ? data.map(mapSupabaseToNotification) : [];
    return { data: notifications, error: null };
  } catch (error) {
    console.error("Erro ao buscar notificações do Supabase:", error);
    return { data: [], error };
  }
};

// Obter todas as notificações do usuário atual (mantém compatibilidade com o código existente)
export const getNotifications = (): Notification[] => {
  const user = getCurrentUser();
  if (!user) return [];
  
  // Buscar do localStorage
  const notificationsStr = localStorage.getItem(`notifications_${user.id}`);
  if (!notificationsStr) return [];
  
  // Também buscar do Supabase em segundo plano para sincronizar
  getSupabaseNotifications(user.id).then(({ data, error }) => {
    if (error) {
      console.error("Erro ao sincronizar notificações com Supabase:", error);
      return;
    }
    
    if (data && data.length > 0) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
  });
  
  return JSON.parse(notificationsStr);
};

// Atualizar uma notificação no Supabase
export const updateSupabaseNotification = async (notification: Notification): Promise<{ data: any, error: any }> => {
  const user = getCurrentUser();
  if (!user || !notification.id) return { data: null, error: "Usuário não autenticado ou ID da notificação não fornecido" };
  
  // Preparar dados para o Supabase
  const supabaseNotification = mapNotificationToSupabase(notification, user.id);
  
  // Atualizar no Supabase
  return await supabase
    .from('notifications')
    .update(supabaseNotification)
    .eq('id', notification.id)
    .eq('user_id', user.id)
    .select()
    .single();
};

// Marcar notificação como lida
export const markNotificationAsRead = (notificationId: string): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Atualizar localmente
  const notificationsStr = localStorage.getItem(`notifications_${user.id}`);
  if (!notificationsStr) return;
  
  let notifications: Notification[] = JSON.parse(notificationsStr);
  const index = notifications.findIndex(n => n.id === notificationId);
  
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    
    // Também atualizar no Supabase em segundo plano
    updateSupabaseNotification(notifications[index]).catch(error => {
      console.error("Erro ao marcar notificação como lida no Supabase:", error);
    });
    
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
  }
};

// Deletar uma notificação do Supabase
export const deleteSupabaseNotification = async (userId: string, notificationId: string): Promise<{ error: any }> => {
  return await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);
};

// Deletar uma notificação (mantém compatibilidade com o código existente)
export const deleteNotification = (notificationId: string): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Deletar localmente
  const notificationsStr = localStorage.getItem(`notifications_${user.id}`);
  if (!notificationsStr) return;
  
  let notifications: Notification[] = JSON.parse(notificationsStr);
  notifications = notifications.filter(n => n.id !== notificationId);
  localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
  
  // Também deletar do Supabase em segundo plano
  deleteSupabaseNotification(user.id, notificationId).catch(error => {
    console.error("Erro ao deletar notificação do Supabase:", error);
  });
  
  window.dispatchEvent(new CustomEvent('notificationsUpdated'));
};

// Marcar todas as notificações como lidas
export const markAllNotificationsAsRead = (): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const notificationsStr = localStorage.getItem(`notifications_${user.id}`);
  if (!notificationsStr) return;
  
  let notifications: Notification[] = JSON.parse(notificationsStr);
  notifications = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
  
  // Também atualizar no Supabase em segundo plano
  Promise.all(
    notifications.map(notification => 
      updateSupabaseNotification(notification).catch(error => {
        console.error("Erro ao marcar notificação como lida no Supabase:", error);
      })
    )
  );
  
  window.dispatchEvent(new CustomEvent('notificationsUpdated'));
};

// Limpar todas as notificações
export const clearAllNotifications = (): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Limpar localmente
  localStorage.setItem(`notifications_${user.id}`, JSON.stringify([]));
  
  // Também limpar no Supabase em segundo plano
  supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id)
    .then(({ error }) => {
      if (error) {
        console.error("Erro ao limpar notificações no Supabase:", error);
      }
    });
  
  window.dispatchEvent(new CustomEvent('notificationsUpdated'));
};

// Verificar se há notificações não lidas
export const hasUnreadNotifications = (): boolean => {
  const notifications = getNotifications();
  return notifications.some(n => !n.read);
};

// Obter contagem de notificações não lidas
export const getUnreadNotificationsCount = (): number => {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
};

// Estas funções já estão definidas anteriormente no arquivo

// Gerar notificações para contas a vencer
export const generateBillNotifications = async (): Promise<void> => {
  const user = getCurrentUser();
  if (!user) return;
  
  try {
    // Buscar contas do Supabase
    const { data: bills, error: billsError } = await getSupabaseBills(user.id);
    if (billsError) {
      console.error("Erro ao buscar contas para gerar notificações:", billsError);
      return;
    }
    
    // Buscar notificações existentes
    const { data: existingNotifications, error: notificationsError } = await getSupabaseNotifications(user.id);
    if (notificationsError) {
      console.error("Erro ao buscar notificações existentes:", notificationsError);
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Verificar contas a vencer nos próximos 3 dias
    for (const bill of bills) {
      if (bill.isPaid) continue;
      
      const dueDate = new Date(bill.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Verificar se já existe notificação para esta conta
      const existingNotification = existingNotifications.find(
        n => n.billId === bill.id && n.type === (diffDays <= 0 ? 'overdue' : (diffDays === 1 ? 'oneDayBefore' : 'fiveDaysBefore'))
      );
      
      if (existingNotification) continue;
      
      let newNotification: Notification | null = null;
      
      if (diffDays === 5) {
        // Conta a vencer em 5 dias
        newNotification = {
          id: uuidv4(),
          billId: bill.id,
          userId: user.id,
          type: 'fiveDaysBefore',
          message: `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} vence em 5 dias.`,
          date: new Date(),
          read: false
        };
      } else if (diffDays === 1) {
        // Conta a vencer em 1 dia
        newNotification = {
          id: uuidv4(),
          billId: bill.id,
          userId: user.id,
          type: 'oneDayBefore',
          message: `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} vence amanhã.`,
          date: new Date(),
          read: false
        };
      } else if (diffDays === 0) {
        // Conta vence hoje
        newNotification = {
          id: uuidv4(),
          billId: bill.id,
          userId: user.id,
          type: 'dueDay',
          message: `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} vence hoje!`,
          date: new Date(),
          read: false
        };
      } else if (diffDays < 0) {
        // Conta vencida
        newNotification = {
          id: uuidv4(),
          billId: bill.id,
          userId: user.id,
          type: 'overdue',
          message: `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} está vencida há ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'dia' : 'dias'}.`,
          date: new Date(),
          read: false
        };
      }
      
      // Quase terminando de pagar (faltando 1 ou 2 parcelas)
      if (bill.totalInstallments && bill.currentInstallment) {
        const remaining = bill.totalInstallments - bill.currentInstallment;
        if (remaining <= 2 && remaining > 0 && !newNotification) {
          newNotification = {
            id: uuidv4(),
            billId: bill.id,
            userId: user.id,
            type: 'paid', // Usando 'paid' como o tipo mais próximo para quase finalizado
            message: `Você está quase terminando de pagar "${bill.title}"! Faltam apenas ${remaining} ${remaining === 1 ? 'parcela' : 'parcelas'}.`,
            date: new Date(),
            read: false
          };
        }
      }
      
      if (newNotification) {
        // Salvar no Supabase
        await saveSupabaseNotification(newNotification);
        
        // Atualizar cache local
        const localNotifications = getNotifications();
        localNotifications.push(newNotification);
        localStorage.setItem(`notifications_${user.id}`, JSON.stringify(localNotifications));
      }
    }
  } catch (error) {
    console.error("Erro ao gerar notificações para contas:", error);
  }
};

// Interface para preferências do usuário
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  dateFormat: string;
  notifications: {
    billsDueSoon: boolean;
    largeTransactions: boolean;
  };
}

// Valores padrão para preferências do usuário
const defaultPreferences: UserPreferences = {
  theme: 'system',
  currency: 'BRL',
  dateFormat: 'dd/MM/yyyy',
  notifications: {
    billsDueSoon: true,
    largeTransactions: false
  }
};

// Mapeamento entre formatos locais e Supabase para preferências
const mapPreferencesToSupabase = (preferences: UserPreferences, userId: string) => {
  return {
    id: uuidv4(),
    user_id: userId,
    theme: preferences.theme,
    currency: preferences.currency,
    date_format: preferences.dateFormat,
    notifications_bills_due_soon: preferences.notifications.billsDueSoon,
    notifications_large_transactions: preferences.notifications.largeTransactions,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

const mapSupabaseToPreferences = (data: any): UserPreferences => {
  return {
    theme: data.theme as 'light' | 'dark' | 'system',
    currency: data.currency,
    dateFormat: data.date_format,
    notifications: {
      billsDueSoon: data.notifications_bills_due_soon,
      largeTransactions: data.notifications_large_transactions
    }
  };
};

// Salvar preferências do usuário no Supabase
export const saveSupabaseUserPreferences = async (preferences: UserPreferences): Promise<{ data: any, error: any }> => {
  const user = getCurrentUser();
  if (!user) return { data: null, error: "Usuário não autenticado" };
  
  // Verificar se já existem preferências para este usuário
  const { data: existingPrefs, error: fetchError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found, que é esperado se não existir
    return { data: null, error: fetchError };
  }
  
  // Preparar dados para o Supabase
  const supabasePreferences = mapPreferencesToSupabase(preferences, user.id);
  
  if (existingPrefs) {
    // Atualizar preferências existentes
    return await supabase
      .from('user_preferences')
      .update({
        theme: preferences.theme,
        currency: preferences.currency,
        date_format: preferences.dateFormat,
        notifications_bills_due_soon: preferences.notifications.billsDueSoon,
        notifications_large_transactions: preferences.notifications.largeTransactions,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();
  } else {
    // Inserir novas preferências
    return await supabase
      .from('user_preferences')
      .insert(supabasePreferences)
      .select()
      .single();
  }
};

// Salvar preferências do usuário (mantém a compatibilidade com o código existente)
export const saveUserPreferences = (preferences: UserPreferences): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Salvar localmente
  localStorage.setItem(`preferences_${user.id}`, JSON.stringify(preferences));
  
  // Também salvar no Supabase em segundo plano
  saveSupabaseUserPreferences(preferences).catch(error => {
    console.error("Erro ao salvar preferências do usuário no Supabase:", error);
  });
};

// Obter preferências do usuário do Supabase
export const getSupabaseUserPreferences = async (userId: string): Promise<{ data: UserPreferences | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    if (data) {
      return { data: mapSupabaseToPreferences(data), error: null };
    }
    
    return { data: defaultPreferences, error: null };
  } catch (error) {
    console.error("Erro ao buscar preferências do usuário do Supabase:", error);
    return { data: null, error };
  }
};

// Obter preferências do usuário (mantém compatibilidade com o código existente)
export const getUserPreferences = (): UserPreferences => {
  const user = getCurrentUser();
  if (!user) return defaultPreferences;
  
  // Buscar do localStorage
  const preferencesStr = localStorage.getItem(`preferences_${user.id}`);
  const localPreferences = preferencesStr ? JSON.parse(preferencesStr) : defaultPreferences;
  
  // Também buscar do Supabase em segundo plano para sincronizar
  getSupabaseUserPreferences(user.id).then(({ data, error }) => {
    if (error) {
      console.error("Erro ao sincronizar preferências do usuário com Supabase:", error);
      return;
    }
    
    if (data) {
      localStorage.setItem(`preferences_${user.id}`, JSON.stringify(data));
    }
  });
  
  return localPreferences;
};
