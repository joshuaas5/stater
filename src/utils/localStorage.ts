import { User, Transaction, Bill, Notification, CardItem, NotificationType } from "@/types";

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

// Salvar uma transação
export const saveTransaction = (transaction: Transaction): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
  let transactions: Transaction[] = transactionsStr ? JSON.parse(transactionsStr) : [];
  
  transactions.push(transaction);
  localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
};

// Obter todas as transações do usuário atual
export const getTransactions = (): Transaction[] => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
  return transactionsStr ? JSON.parse(transactionsStr) : [];
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

// Atualizar uma transação específica
export const updateTransaction = (transaction: Transaction): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
  if (!transactionsStr) return;
  
  let transactions: Transaction[] = JSON.parse(transactionsStr);
  const index = transactions.findIndex(t => t.id === transaction.id);
  
  if (index !== -1) {
    transactions[index] = transaction;
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
  }
};

// Deletar uma transação específica
export const deleteTransaction = (transactionId: string): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
  if (!transactionsStr) return;
  
  let transactions: Transaction[] = JSON.parse(transactionsStr);
  transactions = transactions.filter(t => t.id !== transactionId);
  localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
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
  
  if (!user) return null;
  
  // Omitir a senha ao retornar o usuário
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Funções para contas a pagar

// Salvar uma conta a pagar
export const saveBill = (bill: Bill): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const billsStr = localStorage.getItem(`bills_${user.id}`);
  let bills: Bill[] = billsStr ? JSON.parse(billsStr) : [];
  
  bills.push(bill);
  localStorage.setItem(`bills_${user.id}`, JSON.stringify(bills));
};

// Atualizar uma conta existente
export const updateBill = (bill: Bill): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const billsStr = localStorage.getItem(`bills_${user.id}`);
  if (!billsStr) return;
  
  let bills: Bill[] = JSON.parse(billsStr);
  const index = bills.findIndex(b => b.id === bill.id);
  
  if (index !== -1) {
    bills[index] = bill;
    localStorage.setItem(`bills_${user.id}`, JSON.stringify(bills));
  }
};

// Obter todas as contas a pagar do usuário atual
export const getBills = (): Bill[] => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const billsStr = localStorage.getItem(`bills_${user.id}`);
  return billsStr ? JSON.parse(billsStr) : [];
};

// Marcar uma conta como paga
export const markBillAsPaid = (billId: string): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const billsStr = localStorage.getItem(`bills_${user.id}`);
  if (!billsStr) return;
  
  let bills: Bill[] = JSON.parse(billsStr);
  const index = bills.findIndex(b => b.id === billId);
  
  if (index !== -1) {
    bills[index].isPaid = true;
    localStorage.setItem(`bills_${user.id}`, JSON.stringify(bills));
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
  if (newTransactions.length > 0) {
    saveTransactions(newTransactions);
  }
};

// Funções para notificações

// Salvar uma notificação
export const saveNotification = (notification: Notification): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const notificationsStr = localStorage.getItem(`notifications_${user.id}`);
  let notifications: Notification[] = notificationsStr ? JSON.parse(notificationsStr) : [];
  
  notifications.push(notification);
  localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
};

// Obter todas as notificações do usuário atual
export const getNotifications = (): Notification[] => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const notificationsStr = localStorage.getItem(`notifications_${user.id}`);
  return notificationsStr ? JSON.parse(notificationsStr) : [];
};

// Marcar notificação como lida
export const markNotificationAsRead = (notificationId: string): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  const notificationsStr = localStorage.getItem(`notifications_${user.id}`);
  if (!notificationsStr) return;
  
  let notifications: Notification[] = JSON.parse(notificationsStr);
  const index = notifications.findIndex(n => n.id === notificationId);
  
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
  }
};

// Gerar notificações para contas a vencer
export const generateBillNotifications = (): Notification[] => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const bills = getBills().filter(bill => !bill.isPaid && bill.notificationsEnabled);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const notifications: Notification[] = [];
  
  bills.forEach(bill => {
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    // Calcular a diferença em dias
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const notificationDays = bill.notificationDays || [5, 1, 0];
    
    // Verificar para cada dia de notificação configurado
    notificationDays.forEach(days => {
      if (diffDays === days) {
        let message = '';
        let type: NotificationType = 'fiveDaysBefore';
        
        if (days === 5) {
          type = 'fiveDaysBefore';
          message = `A conta "${bill.title}" vence em 5 dias (${new Date(bill.dueDate).toLocaleDateString('pt-BR')}).`;
        } else if (days === 1) {
          type = 'oneDayBefore';
          message = `A conta "${bill.title}" vence amanhã (${new Date(bill.dueDate).toLocaleDateString('pt-BR')}).`;
        } else if (days === 0) {
          type = 'dueDay';
          message = `A conta "${bill.title}" vence hoje!`;
        } else {
          type = 'fiveDaysBefore';
          message = `A conta "${bill.title}" vence em ${days} dias (${new Date(bill.dueDate).toLocaleDateString('pt-BR')}).`;
        }
        
        const notification: Notification = {
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          billId: bill.id,
          userId: user.id,
          type,
          message,
          date: new Date(),
          read: false
        };
        notifications.push(notification);
        saveNotification(notification);
      }
    });
    
    // Conta vencida
    if (diffDays < 0) {
      const notification: Notification = {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        billId: bill.id,
        userId: user.id,
        type: 'overdue',
        message: `A conta "${bill.title}" está vencida há ${Math.abs(diffDays)} dias.`,
        date: new Date(),
        read: false
      };
      notifications.push(notification);
      saveNotification(notification);
    }
    
    // Quase terminando de pagar (faltando 1 ou 2 parcelas)
    if (bill.totalInstallments && bill.currentInstallment) {
      const remaining = bill.totalInstallments - bill.currentInstallment;
      if (remaining <= 2 && remaining > 0) {
        const notification: Notification = {
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          billId: bill.id,
          userId: user.id,
          type: 'almostFinished',
          message: `Você está quase terminando de pagar "${bill.title}"! Faltam apenas ${remaining} ${remaining === 1 ? 'parcela' : 'parcelas'}.`,
          date: new Date(),
          read: false
        };
        notifications.push(notification);
        saveNotification(notification);
      }
    }
  });
  
  return notifications;
};

// Salvar preferências do usuário
export const saveUserPreferences = (preferences: Record<string, any>): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  localStorage.setItem(`preferences_${user.id}`, JSON.stringify(preferences));
};

// Obter preferências do usuário
export const getUserPreferences = (): Record<string, any> => {
  const user = getCurrentUser();
  if (!user) return {};
  
  const preferencesStr = localStorage.getItem(`preferences_${user.id}`);
  return preferencesStr ? JSON.parse(preferencesStr) : {};
};
