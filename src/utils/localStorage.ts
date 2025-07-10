import { User, Transaction, Bill, Notification, CardItem, NotificationType, ConsultantMessage } from "@/types";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

// Exportar uuidv4 para uso em outros arquivos
export { uuidv4 };

// Variáveis para controlar a sincronização de mensagens do consultor
let lastConsultantMessagesSyncTime: { [userId: string]: number } = {};
let isSyncingConsultantMessages: { [userId: string]: boolean } = {};

// Variáveis para controlar a sincronização de transações
let lastTransactionsSyncTime: { [userId: string]: number } = {};
let isSyncingTransactions: { [userId: string]: boolean } = {};

// Variáveis para controlar a sincronização de contas
let lastBillsSyncTime: { [userId: string]: number } = {};
let isSyncingBills: { [userId: string]: boolean } = {};

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
  // Garantir que a data seja válida
  let dateValue: string;
  if (transaction.date instanceof Date) {
    dateValue = transaction.date.toISOString();
  } else if (typeof transaction.date === 'string') {
    try {
      dateValue = new Date(transaction.date).toISOString();
    } catch (err) {
      console.error('Data inválida, usando data atual:', transaction.date);
      dateValue = new Date().toISOString();
    }
  } else {
    dateValue = new Date().toISOString();
  }
  
  // Validar tipo de transação
  const transactionType = transaction.type === 'income' || transaction.type === 'expense' 
    ? transaction.type 
    : 'expense';
    
  // Validar recorrência
  let recurrenceFreq = null;
  if (transaction.isRecurring && transaction.recurrenceFrequency) {
    // Validar se o valor está dentro das opções permitidas pelo schema
    if (['weekly', 'monthly', 'yearly'].includes(transaction.recurrenceFrequency)) {
      recurrenceFreq = transaction.recurrenceFrequency;
    }
  }
  
  // Criar objeto compativel com o schema do Supabase
  return {
    id: transaction.id || uuidv4(),
    user_id: userId,
    title: transaction.title || 'Sem título',
    amount: typeof transaction.amount === 'number' ? transaction.amount : parseFloat(String(transaction.amount)) || 0,
    type: transactionType,
    category: transaction.category || (transactionType === 'income' ? 'Receita' : 'Outros'),
    date: dateValue,
    is_recurring: Boolean(transaction.isRecurring),
    recurring_day: transaction.recurringDay || null,
    recurrence_frequency: recurrenceFreq,
    is_paid: transaction.isPaid !== undefined ? Boolean(transaction.isPaid) : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    userId: data.user_id, // Converter do Supabase (user_id) para interface local (userId)
    isRecurring: data.is_recurring || false,
    recurringDay: data.recurring_day || null,
    recurrenceFrequency: data.recurrence_frequency || null,
    isPaid: data.is_paid || false,
  };
};

// Estas funções foram movidas para serem exportadas na linha ~335

// Salvar uma transação no Supabase
export const saveSupabaseTransaction = async (transaction: Transaction): Promise<{ data: any, error: any }> => {
  const user = getCurrentUser();
  if (!user) return { data: null, error: "Usuário não autenticado" };
  
  try {
    // Verificar se o usuário está autenticado no Supabase
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.warn("Usuário não está autenticado no Supabase. Salvando apenas localmente.");
      return { data: null, error: "Usuário não autenticado no Supabase" };
    }
    
    // Preparar dados para o Supabase
    const supabaseTransaction = mapTransactionToSupabase(transaction, user.id);
    
    // Log detalhado para debugging
    console.log("Tentando salvar transação no Supabase:", JSON.stringify(supabaseTransaction));
    
    // Usar RPC para garantir timestamp correto do servidor
    console.log("🔄 Tentando salvar com RPC timestamp do servidor...");
    
    // Primeiro, tentar usar RPC para timestamp correto
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('insert_transaction_with_timestamp', {
        p_user_id: user.id,
        p_description: transaction.title,
        p_amount: transaction.type === 'expense' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount),
        p_type: transaction.type,
        p_category: transaction.category || 'outros'
      })
      .single();

    if (rpcError) {
      console.warn("⚠️ RPC falhou, usando insert tradicional:", rpcError);
      
      // Fallback: inserção tradicional
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...supabaseTransaction,
          date: new Date().toISOString(), // Manter timestamp completo
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao salvar transação no Supabase (fallback):", error);
        // Tentar determinar a causa do erro
        if (error.code === '23505') {
          console.log("Transação já existe, tentando atualizar...");
          // Se for um erro de chave duplicada, tente atualizar em vez de inserir
          const { data: updateData, error: updateError } = await supabase
            .from('transactions')
            .update({
              ...supabaseTransaction,
              updated_at: new Date().toISOString()
            })
            .eq('id', supabaseTransaction.id)
            .select()
            .single();
            
          if (updateError) {
            console.error("Erro ao atualizar transação existente:", updateError);
            return { data: null, error: updateError };
          }
          
          console.log("Transação atualizada com sucesso:", updateData);
          return { data: updateData, error: null };
        }
        return { data: null, error };
      }
      
      console.log("✅ Transação salva com fallback:", data);
      return { data, error: null };
    }
    
    console.log("✅ Transação salva com RPC timestamp:", rpcData);
    return { data: rpcData, error: null };
    
    console.log("✅ Transação salva com RPC timestamp:", rpcData);
    return { data: rpcData, error: null };
  } catch (error: any) {
    console.error("Erro inesperado ao salvar transação no Supabase:", error);
    return { data: null, error };
  }
};

// PRIORIDADE TOTAL: SEMPRE SALVAR NO SUPABASE PRIMEIRO
export const saveTransaction = (transaction: Transaction): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Gerar ID se não existir
  if (!transaction.id) {
    transaction.id = uuidv4();
  }
  
  // Garantir que o usuário ID esteja definido
  transaction.userId = user.id;
  
  // Garantir que a data esteja em formato correto
  if (!(transaction.date instanceof Date)) {
    transaction.date = new Date(transaction.date || new Date());
  }

  // VERIFICAR SE É TRANSAÇÃO RECORRENTE QUE NÃO DEVE AFETAR SALDO
  const shouldAdjustBalance = !transaction.dontAdjustBalanceOnSave && 
                             !(transaction.isRecurring && !transaction.isRecurringInstance);
  
  console.log('💾 [SUPABASE FIRST] Iniciando salvamento - SUPABASE É PRIORIDADE!');
  console.log('💾 [SUPABASE FIRST] Dados da transação:', JSON.stringify(transaction));
  console.log('💰 [BALANCE CHECK] Deve afetar saldo:', shouldAdjustBalance, 
              '(dontAdjust:', transaction.dontAdjustBalanceOnSave, 
              'isRecurring:', transaction.isRecurring, 
              'isInstance:', transaction.isRecurringInstance, ')');
  
  // 1. PRIMEIRO: SALVAR NO SUPABASE (CRÍTICO!)
  const saveToSupabase = async () => {
    try {
      console.log('📤 [SUPABASE FIRST] ETAPA 1: Enviando para Supabase...');
      const result = await saveSupabaseTransaction(transaction);
      
      if (result.error) {
        console.error('❌ [SUPABASE FIRST] FALHA CRÍTICA no Supabase:', result.error);
        throw result.error;
      }
      
      console.log('✅ [SUPABASE FIRST] SUCESSO no Supabase:', result.data);
      
      // 2. DEPOIS: Salvar no localStorage como backup
      console.log('💾 [BACKUP LOCAL] ETAPA 2: Salvando backup local...');
      const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
      let transactions: Transaction[] = [];
      if (transactionsStr) {
        try {
          transactions = JSON.parse(transactionsStr);
        } catch (err) {
          console.error('❌ [BACKUP LOCAL] Erro ao ler localStorage:', err);
          transactions = [];
        }
      }
      
      // Verificar se a transação já existe
      const existingIndex = transactions.findIndex(t => t.id === transaction.id);
      if (existingIndex >= 0) {
        transactions[existingIndex] = transaction;
        console.log('🔄 [BACKUP LOCAL] Atualizando transação existente');
      } else {
        transactions.push(transaction);
        console.log('➕ [BACKUP LOCAL] Adicionando nova transação');
      }
      
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
      console.log('✅ [BACKUP LOCAL] Backup salvo. Total:', transactions.length);
      
      // 3. ATUALIZAR UI - MAS SÓ DISPARAR EVENTOS SE DEVE AFETAR SALDO
      if (shouldAdjustBalance) {
        console.log('🔄 [UI UPDATE] Disparando eventos de atualização...');
        window.dispatchEvent(new Event('transactionsUpdated'));
        window.dispatchEvent(new CustomEvent('transactionsUpdated', { detail: { newTransaction: transaction } }));
        
        // Evento adicional para garantir
        setTimeout(() => {
          window.dispatchEvent(new Event('transactionsUpdated'));
          window.dispatchEvent(new CustomEvent('forceRefresh'));
        }, 100);
      } else {
        console.log('🚫 [UI UPDATE] Transação recorrente - NÃO disparando eventos de saldo');
        // Apenas disparar evento específico para atualizar lista de recorrentes
        window.dispatchEvent(new CustomEvent('recurringTransactionsUpdated', { detail: { newTransaction: transaction } }));
      }
      
    } catch (error: any) {
      console.error('❌ [SUPABASE FIRST] ERRO CRÍTICO:', error);
      
      // FALLBACK: Se Supabase falhar, salvar pelo menos local
      console.log('🆘 [FALLBACK] Salvando apenas local como emergência...');
      const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
      let transactions: Transaction[] = transactionsStr ? JSON.parse(transactionsStr) : [];
      transactions.push(transaction);
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
      
      // Tentar novamente no Supabase após 3 segundos
      console.log('⏰ [RETRY] Agendando nova tentativa em 3s...');
      setTimeout(() => {
        console.log('🔄 [RETRY] Executando retry...');
        saveSupabaseTransaction(transaction)
          .then(retryResult => {
            if (retryResult.error) {
              console.error('❌ [RETRY] Falha no retry:', retryResult.error);
            } else {
              console.log('✅ [RETRY] Retry bem-sucedido:', retryResult.data);
              window.dispatchEvent(new Event('transactionsUpdated'));
            }
          })
          .catch(retryError => {
            console.error("❌ [RETRY] Erro no retry:", retryError);
          });
      }, 3000);
    }
  };
  
  // EXECUTAR IMEDIATAMENTE
  saveToSupabase();
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
  } catch (error: any) {
    console.error("Erro ao buscar transações do Supabase:", error);
    return { data: [], error };
  }
};

// PRIORIDADE TOTAL: SEMPRE BUSCAR DO SUPABASE PRIMEIRO
export const getTransactions = (): Transaction[] => {
  const user = getCurrentUser();
  if (!user) return [];
  
  console.log('🔍 [SUPABASE FIRST] INICIANDO BUSCA - SUPABASE É PRIORIDADE!');
  
  // 1. SEMPRE buscar do Supabase em tempo real (síncrono quando possível)
  const now = Date.now();
  const lastSync = lastTransactionsSyncTime[user.id] || 0;
  const isSyncing = isSyncingTransactions[user.id] || false;
  const syncInterval = 30000; // 30 SEGUNDOS para evitar loops infinitos!
  
  // Carregar localStorage como fallback inicial
  const transactionsStr = localStorage.getItem(`transactions_${user.id}`);
  let localTransactions: Transaction[] = transactionsStr ? JSON.parse(transactionsStr) : [];
  
  console.log(`📊 [SUPABASE FIRST] Local backup: ${localTransactions.length} transações`);
  
  // SEMPRE tentar sincronizar, quase sem intervalo
  if (!isSyncing && (now - lastSync > syncInterval)) {
    console.log('🔍 [SUPABASE FIRST] EXECUTANDO BUSCA NO SUPABASE...');
    
    // Marcar sincronização
    isSyncingTransactions[user.id] = true;
    lastTransactionsSyncTime[user.id] = now;
    
    // Buscar do Supabase imediatamente
    getSupabaseTransactions(user.id).then(({ data, error }) => {
      isSyncingTransactions[user.id] = false;
      
      if (error) {
        console.error('❌ [SUPABASE FIRST] ERRO no Supabase:', error);
        return;
      }
      
      if (data && data.length > 0) {
        console.log(`✅ [SUPABASE FIRST] SUCESSO! ${data.length} transações do Supabase`);
        
        const supabaseTransactions = data.map(mapSupabaseToTransaction);
        
        // SUPABASE É A FONTE DA VERDADE!
        console.log('✅ [SUPABASE FIRST] Supabase é a fonte da verdade - substituindo localStorage');
        
        // Salvar no localStorage como backup
        localStorage.setItem(`transactions_${user.id}`, JSON.stringify(supabaseTransactions));
        
        // FORÇAR múltiplas atualizações da UI
        console.log('📢 [SUPABASE FIRST] FORÇANDO ATUALIZAÇÃO DA UI...');
        window.dispatchEvent(new Event('transactionsUpdated'));
        window.dispatchEvent(new CustomEvent('transactionsUpdated', { 
          detail: { 
            source: 'supabase', 
            total: supabaseTransactions.length,
            timestamp: new Date().toISOString()
          } 
        }));
        
        // Evento adicional com delay para garantir que todos os componentes recebam
        setTimeout(() => {
          window.dispatchEvent(new Event('transactionsUpdated'));
          window.dispatchEvent(new CustomEvent('forceRefresh'));
        }, 50);
        
        // Segundo evento com delay maior
        setTimeout(() => {
          window.dispatchEvent(new Event('transactionsUpdated'));
        }, 200);
        
      } else {
        console.log('📭 [SUPABASE FIRST] Nenhuma transação no Supabase');
        
        // Verificar se temos dados locais para sincronizar
        if (localTransactions.length > 0) {
          console.log(`📤 [SUPABASE FIRST] Enviando ${localTransactions.length} transações locais para Supabase...`);
          
          // Enviar todas as transações locais para o Supabase
          localTransactions.forEach((transaction, index) => {
            setTimeout(() => {
              saveSupabaseTransaction(transaction).then(result => {
                if (result.error) {
                  console.error(`❌ [SYNC LOCAL->SUPABASE] Erro na transação ${index + 1}:`, result.error);
                } else {
                  console.log(`✅ [SYNC LOCAL->SUPABASE] Transação ${index + 1} sincronizada`);
                  
                  // Atualizar UI após cada sincronização
                  window.dispatchEvent(new Event('transactionsUpdated'));
                }
              });
            }, index * 200); // 200ms entre cada transação
          });
        }
      }
    }).catch(err => {
      isSyncingTransactions[user.id] = false;
      console.error('❌ [SUPABASE FIRST] ERRO CRÍTICO na sincronização:', err);
    });
  } else if (isSyncing) {
    console.log('⏳ [SUPABASE FIRST] Sincronização já em andamento...');
  } else {
    console.log(`⏱️ [SUPABASE FIRST] Aguardando (${Math.round((syncInterval - (now - lastSync)) / 1000)}s)`);
  }
  
  // Converter IDs antigos para UUID válido
  let needsUpdate = false;
  localTransactions.forEach((transaction: Transaction) => {
    if (transaction.id && transaction.id.startsWith('transaction_')) {
      const oldId = transaction.id;
      transaction.id = uuidv4();
      console.log(`🔄 [ID CONVERT] ${oldId} -> ${transaction.id}`);
      needsUpdate = true;
    }
  });
  
  if (needsUpdate) {
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(localTransactions));
    console.log('💾 [ID CONVERT] IDs atualizados no localStorage');
  }
  
  console.log(`📊 [SUPABASE FIRST] Retornando ${localTransactions.length} transações (backup local)`);
  return localTransactions;
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
      } catch (error: any) {
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
    } catch (error: any) {
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
  // Garantir que a data esteja em formato correto
  let dueDateValue: string;
  if (bill.dueDate instanceof Date) {
    dueDateValue = bill.dueDate.toISOString();
  } else if (typeof bill.dueDate === 'string') {
    try {
      dueDateValue = new Date(bill.dueDate).toISOString();
    } catch (err) {
      console.error('Data inválida, usando data atual:', bill.dueDate);
      dueDateValue = new Date().toISOString();
    }
  } else {
    dueDateValue = new Date().toISOString();
  }

  // Criar objeto com todas as propriedades necessárias
  return {
    id: bill.id || uuidv4(),
    user_id: userId,
    title: bill.title || 'Conta sem título',
    amount: typeof bill.amount === 'number' ? bill.amount : parseFloat(String(bill.amount)) || 0,
    due_date: dueDateValue,
    category: bill.category || 'Outros',
    is_paid: bill.isPaid !== undefined ? Boolean(bill.isPaid) : false,
    is_recurring: bill.isRecurring !== undefined ? Boolean(bill.isRecurring) : false,
    is_infinite_recurrence: bill.isInfiniteRecurrence !== undefined ? Boolean(bill.isInfiniteRecurrence) : false,
    recurring_day: bill.recurringDay || null,
    total_installments: bill.totalInstallments || null,
    current_installment: bill.currentInstallment || null,
    notifications_enabled: bill.notificationsEnabled !== undefined ? Boolean(bill.notificationsEnabled) : false,
    notification_days: Array.isArray(bill.notificationDays) ? bill.notificationDays : [],
    original_bill_id: bill.originalBillId || null,
    original_due_date: bill.originalDueDate instanceof Date ? bill.originalDueDate.toISOString() : bill.originalDueDate || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const mapSupabaseToBill = (data: any): Bill => {
  // Tratar datas
  let dueDate: Date;
  try {
    dueDate = new Date(data.due_date);
  } catch (err) {
    console.error('Erro ao converter data de vencimento:', err);
    dueDate = new Date();
  }
  
  // Tratar data original (pode ser undefined, não null)
  let originalDueDate: Date | undefined = undefined;
  if (data.original_due_date) {
    try {
      originalDueDate = new Date(data.original_due_date);
    } catch (err) {
      console.error('Erro ao converter data original de vencimento:', err);
    }
  }
  
  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title || 'Conta sem título',
    amount: typeof data.amount === 'number' ? data.amount : parseFloat(String(data.amount)) || 0,
    dueDate: dueDate,
    category: data.category || 'Outros',
    isPaid: Boolean(data.is_paid),
    isRecurring: Boolean(data.is_recurring),
    isInfiniteRecurrence: Boolean(data.is_infinite_recurrence),
    recurringDay: data.recurring_day || null,
    totalInstallments: data.total_installments || null,
    currentInstallment: data.current_installment || null,
    notificationsEnabled: Boolean(data.notifications_enabled),
    notificationDays: Array.isArray(data.notification_days) ? data.notification_days : [],
    originalBillId: data.original_bill_id || undefined,
    originalDueDate: originalDueDate
  };
};

// Salvar uma conta a pagar no Supabase
export const saveSupabaseBill = async (bill: Bill): Promise<{ data: any, error: any }> => {
  const user = getCurrentUser();
  if (!user) return { data: null, error: "Usuário não autenticado" };
  
  try {
    // Verificar se o usuário está autenticado no Supabase
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.warn('Usuário não está autenticado no Supabase. Tentando atualizar sessão...');
      
      // Tentar atualizar a sessão
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Erro ao atualizar sessão:', refreshError);
        return { data: null, error: refreshError };
      }
    }
    
    // Preparar dados para o Supabase
    const supabaseBill = mapBillToSupabase(bill, user.id);
    
    // Registrar a tentativa de salvamento
    console.log(`Tentando salvar conta no Supabase: ${bill.title} (ID: ${bill.id})`);
    console.log('Dados enviados:', JSON.stringify(supabaseBill));
    
    // Salvar no Supabase
    const { data, error } = await supabase
      .from('bills')
      .insert(supabaseBill)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao salvar conta no Supabase:", error);
      
      // Verificar se é um erro de conflito (conta já existe)
      if (error.code === '23505') { // Código para conflito de chave única
        console.log('Conta já existe, tentando atualizar...');
        // Tentar atualizar em vez de inserir
        const { data: updateData, error: updateError } = await supabase
          .from('bills')
          .update(supabaseBill)
          .eq('id', bill.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (updateError) {
          console.error("Erro ao atualizar conta existente:", updateError);
          return { data: null, error: updateError };
        }
        
        return { data: updateData, error: null };
      }
      
      return { data: null, error };
    }
    
    console.log('Conta salva com sucesso no Supabase:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao salvar conta no Supabase:", error);
    return { data: null, error };
  }
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
  
  // Se for uma conta recorrente sem fim definido, gerar instâncias futuras (6 meses)
  if (bill.isRecurring && bill.isInfiniteRecurrence) {
    const originalBillId = bill.id;
    const dueDate = new Date(bill.dueDate);
    const recurringDay = dueDate.getDate();
    
    // Gerar instâncias para 6 meses iniciais
    for (let i = 1; i <= 6; i++) {
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
    
    // Mostrar notificação para o usuário sobre a geração sob demanda
    const notification: Notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      billId: bill.id, // Adicionar o ID da conta
      type: 'info' as NotificationType,
      message: `A conta recorrente "${bill.title}" foi configurada. Inicialmente, foram geradas parcelas para os próximos 6 meses. Novas parcelas serão adicionadas automaticamente conforme necessário.`,
      date: new Date(),
      read: false
    };
    
    saveNotification(notification);
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
    // Verificar se o usuário está autenticado no Supabase
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.warn('Usuário não está autenticado no Supabase. Tentando atualizar sessão...');
      
      // Tentar atualizar a sessão
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error('Erro ao atualizar sessão:', refreshError);
        return { data: [], error: refreshError };
      }
    }
    
    console.log(`Buscando contas do usuário ${userId} no Supabase...`);
    
    // Buscar todas as contas do usuário
    let query = supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Erro ao buscar contas do Supabase:", error);
      return { data: [], error };
    }
    
    if (!data || data.length === 0) {
      console.log('Nenhuma conta encontrada no Supabase');
      return { data: [], error: null };
    }
    
    console.log(`${data.length} contas encontradas no Supabase`);
    
    // Mapear para o formato local
    let bills = data.map((item: Record<string, any>) => {
      try {
        return mapSupabaseToBill(item);
      } catch (err) {
        console.error('Erro ao mapear conta do Supabase:', err, item);
        return null;
      }
    }).filter((bill: Bill | null) => bill !== null) as Bill[];
    
    // Filtrar apenas contas ativas, se solicitado
    if (onlyActive) {
      bills = bills.filter(bill => !bill.isPaid);
      console.log(`${bills.length} contas ativas após filtragem`);
    }
    
    return { data: bills, error: null };
  } catch (error: any) {
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
  if (!billsStr) {
    // Se não existir no localStorage, criar array vazio
    localStorage.setItem(`bills_${user.id}`, JSON.stringify([]));
    return [];
  }
  
  let bills: Bill[] = JSON.parse(billsStr);
  
  // Converter IDs antigos para UUID válido
  let needsUpdate = false;
  bills.forEach((bill: Bill) => {
    // Verificar se o ID está no formato antigo (não é um UUID válido)
    if (bill.id && (bill.id.startsWith('bill_') || bill.id.includes('-') === false)) {
      // Gerar um novo UUID para substituir o ID antigo
      const oldId = bill.id;
      bill.id = uuidv4();
      console.log(`Convertendo ID antigo de conta ${oldId} para UUID válido ${bill.id}`);
      needsUpdate = true;
    }
  });
  
  // Verificar se devemos gerar mais parcelas futuras para contas recorrentes infinitas
  const checkAndGenerateFutureBillInstances = (): boolean => {
    const currentDate = new Date();
    const sixMonthsFromNow = new Date(currentDate);
    sixMonthsFromNow.setMonth(currentDate.getMonth() + 6); // Data limite (6 meses a partir de hoje)
    
    let newBillsAdded = false;
    
    // Gerar instâncias para 6 meses iniciais
    for (const bill of bills) {
      if (bill.isRecurring && bill.isInfiniteRecurrence) {
        // Calcular próxima data de vencimento
        const dueDate = new Date(bill.dueDate);
        const recurringDay = dueDate.getDate();
        
        // Calcular próxima data de vencimento a partir da última conhecida
        const nextDueDate = new Date(dueDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + 6);
        
        // Ajustar para o dia correto (considerando meses com menos dias)
        nextDueDate.setDate(Math.min(recurringDay, new Date(nextDueDate.getFullYear(), nextDueDate.getMonth() + 1, 0).getDate()));
        
        // Verificar se já existe uma instância com esta data de vencimento
        const existingBill = bills.find(b => {
          if (!b.originalBillId || b.originalBillId !== bill.id) return false;
          
          try {
            const bDueDate = new Date(b.dueDate);
            return bDueDate.getMonth() === nextDueDate.getMonth() && 
                   bDueDate.getFullYear() === nextDueDate.getFullYear();
          } catch (err) {
            return false;
          }
        });
        
        if (!existingBill) {
          // Criar nova instância da conta
          const futureBill: Bill = {
            ...bill,
            id: uuidv4(),
            dueDate: nextDueDate,
            isPaid: false,
            originalBillId: bill.id,
            originalDueDate: dueDate
          };
          
          bills.push(futureBill);
          newBillsAdded = true;
          
          // Também salvar no Supabase em segundo plano
          saveSupabaseBill(futureBill).catch(error => {
            console.error(`Erro ao salvar instância futura no Supabase:`, error);
          });
        }
      }
    }
    
    return newBillsAdded;
  };
  
  // Executar a verificação e geração de parcelas futuras
  const newBillsAdded = checkAndGenerateFutureBillInstances();
  
  // Se foram adicionadas novas contas, atualizar o localStorage
  if (newBillsAdded) {
    localStorage.setItem(`bills_${user.id}`, JSON.stringify(bills));
    console.log('Novas parcelas futuras foram adicionadas');
    
    // Notificar o usuário que novas parcelas foram adicionadas
    const notification: Notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      billId: "", // String vazia em vez de null
      type: 'info' as NotificationType,
      message: `Novas parcelas futuras foram adicionadas para suas contas recorrentes.`,
      date: new Date(),
      read: false
    };
    
    saveNotification(notification);
  }
  
  // Se algum ID foi convertido, atualizar o localStorage
  if (needsUpdate) {
    localStorage.setItem(`bills_${user.id}`, JSON.stringify(bills));
  }
  
  // Verificar se devemos sincronizar com o Supabase
  const now = Date.now();
  const lastSync = lastBillsSyncTime[user.id] || 0;
  const isSyncing = isSyncingBills[user.id] || false;
  const syncInterval = 30000; // 30 segundos entre sincronizações
  
  // Só sincronizar se passou o intervalo E não estiver sincronizando no momento
  if (!isSyncing && (now - lastSync > syncInterval)) {
    // Marcar que estamos sincronizando para este usuário
    isSyncingBills[user.id] = true;
    lastBillsSyncTime[user.id] = now;
    
    // Também buscar do Supabase em segundo plano para sincronizar
    getSupabaseBills(user.id, false).then(({ data, error }) => {
      // Marcar que terminamos a sincronização
      isSyncingBills[user.id] = false;
      
      if (error) {
        console.error("Erro ao sincronizar contas a pagar com Supabase:", error);
        return;
      }
      
      // Se temos dados no Supabase
      if (data && data.length > 0) {
        const supabaseBills = data;
        
        // IMPORTANTE: Mesclar contas locais com as do Supabase, não sobrescrever
        // Verificar se temos contas locais que não estão no Supabase
        const localIds = new Set(bills.map((b: Bill) => b.id));
        const supabaseIds = new Set(supabaseBills.map((b: Bill) => b.id));
        
        // Contas que estão no localStorage mas não no Supabase
        const localOnlyBills = bills.filter((b: Bill) => !supabaseIds.has(b.id));
        
        // Mesclar as contas
        const mergedBills = [...supabaseBills, ...localOnlyBills];
        
        // Salvar as contas mescladas no localStorage
        localStorage.setItem(`bills_${user.id}`, JSON.stringify(mergedBills));
        
        // Enviar as contas locais para o Supabase, com limite de frequência
        if (localOnlyBills.length > 0) {
          console.log(`Sincronizando ${localOnlyBills.length} contas locais com o Supabase...`);
          
          // Processar uma conta por vez com intervalo para evitar sobrecarga
          let index = 0;
          const processNextBill = () => {
            if (index < localOnlyBills.length) {
              const bill = localOnlyBills[index];
              console.log(`Tentando salvar conta no Supabase:`, JSON.stringify(bill));
              
              saveSupabaseBill(bill)
                .then(result => {
                  if (result.error) {
                    console.error("Erro ao salvar conta no Supabase:", result.error);
                  } else {
                    console.log("Conta sincronizada com sucesso:", result.data);
                  }
                  
                  // Processar a próxima conta após um pequeno intervalo
                  index++;
                  setTimeout(processNextBill, 1000); // 1 segundo entre cada conta
                })
                .catch(error => {
                  console.error("Erro ao sincronizar conta local com Supabase:", error);
                  // Continuar mesmo com erro
                  index++;
                  setTimeout(processNextBill, 1000);
                });
            } else {
              // Todas as contas foram processadas
              console.log("Sincronização de contas concluída");
              // Notificar a UI para atualizar
              window.dispatchEvent(new CustomEvent('billsUpdated'));
            }
          };
          
          // Iniciar o processamento sequencial
          processNextBill();
        } else {
          // Notificar a UI para atualizar
          window.dispatchEvent(new CustomEvent('billsUpdated'));
        }
      }
    }).catch(err => {
      // Garantir que o flag de sincronização seja resetado mesmo em caso de erro
      isSyncingBills[user.id] = false;
      console.error("Erro inesperado ao sincronizar contas:", err);
    });
  }
  
  // Filtrar apenas contas ativas, se solicitado
  if (onlyActive) {
    bills = bills.filter(bill => !bill.isPaid);
  }
  
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
  try {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('user_id', userId)
      .eq('id', billId);
    
    return { error };
  } catch (error: any) {
    console.error("Erro ao deletar conta a pagar do Supabase:", error);
    return { error };
  }
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
    
    // Atualizar no localStorage
    localStorage.setItem(`bills_${user.id}`, JSON.stringify(bills));
    
    // Também atualizar no Supabase em segundo plano
    updateSupabaseBill(bills[index]).catch(error => {
      console.error("Erro ao marcar conta como paga no Supabase:", error);
    });
    
    // Criar notificação
    const notification: Notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      billId: billId,
      user_id: user.id,
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
    entity_id: notification.billId || null,
    entity_type: notification.billId ? 'bill' : null,
    title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
    type: notification.type,
    message: notification.message,
    is_read: notification.read || false,
    created_at: notification.date instanceof Date ? notification.date.toISOString() : new Date().toISOString(),
  };
};

const mapSupabaseToNotification = (data: Record<string, any>): Notification => {
  return {
    id: data.id,
    user_id: data.user_id,
    billId: data.entity_id || null,
    type: data.type as NotificationType,
    message: data.message,
    date: new Date(data.created_at),
    read: data.is_read || false,
  };
};

// Salvar uma notificação no Supabase
export const saveSupabaseNotification = async (notification: Notification): Promise<{ data: any, error: any }> => {
  try {
    const user = getCurrentUser();
    if (!user) return { data: null, error: "Usuário não autenticado" };
    
    // Verificar se a notificação já existe para evitar duplicatas
    const { data: existingNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('entity_id', notification.billId || null)
      .eq('type', notification.type);
      
    if (fetchError) {
      console.warn("Erro ao verificar notificações existentes:", fetchError);
    } else if (existingNotifications && existingNotifications.length > 0) {
      // Notificação similar já existe, não criar duplicata
      return { data: existingNotifications[0], error: null };
    }
    
    // Preparar dados para o Supabase
    const supabaseNotification = mapNotificationToSupabase(notification, user.id);
    
    // Salvar no Supabase
    const { data, error } = await supabase
      .from('notifications')
      .insert(supabaseNotification)
      .select();
      
    if (error) {
      // Se o erro for relacionado a RLS, registrar informações para depuração
      if (error.code === '42501' || error.message.includes('permission denied')) {
        console.error("Erro de permissão ao salvar notificação. Dados:", {
          user_id: user.id,
          notificationType: notification.type
        });
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao salvar notificação no Supabase:", error);
    return { data: null, error };
  }
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
  
  // Limitar o número de notificações para evitar excesso
  // Verificar se já existe uma notificação similar (mesmo tipo e billId)
  const similarNotification = notifications.find(
    n => n.type === notification.type && n.billId === notification.billId
  );
  
  if (similarNotification) {
    // Atualizar a notificação existente em vez de criar uma nova
    similarNotification.message = notification.message;
    similarNotification.date = notification.date;
    similarNotification.read = false; // Marcar como não lida novamente
  } else {
    // Adicionar nova notificação
    notifications.push(notification);
    
    // Limitar a 50 notificações, removendo as mais antigas primeiro
    if (notifications.length > 50) {
      // Ordenar por data (mais antigas primeiro)
      notifications.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      // Remover as mais antigas
      notifications = notifications.slice(notifications.length - 50);
    }
  }
  
  localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
  
  // Reativando o salvamento no Supabase
  saveSupabaseNotification(notification).catch(error => {
    console.error("Erro ao salvar notificação no Supabase:", error);
  });
  
  window.dispatchEvent(new CustomEvent('notificationsUpdated'));
};

// Função auxiliar para criar uma promessa com timeout
const promiseWithTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  // Criar uma promessa de timeout que será rejeitada após o tempo especificado
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMsg));
    }, timeoutMs);
  });
  
  // Retorna a primeira promessa a ser resolvida/rejeitada entre a original e o timeout
  return Promise.race([
    promise,
    timeoutPromise
  ]).then((result) => {
    clearTimeout(timeoutId);
    return result;
  }).catch((error) => {
    clearTimeout(timeoutId);
    throw error;
  });
};

// Obter notificações do Supabase com timeout e melhor tratamento de erros
export const getSupabaseNotifications = async (userId: string): Promise<{ data: Notification[], error: Error | null }> => {
  try {
    // Usar a função de timeout para limitar o tempo de espera da requisição
    const result = await promiseWithTimeout(
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      8000, // 8 segundos de timeout
      'Timeout ao buscar notificações do Supabase'
    );
    
    if (result.error) {
      console.error("Erro na resposta do Supabase:", result.error);
      throw result.error;
    }
    
    // Limitar o número de notificações para evitar sobrecarga de memória
    const limitedData = result.data?.slice(0, 100) || [];
    const notifications = limitedData.map(mapSupabaseToNotification);
    
    // Registrar sucesso no localStorage para fins de diagnóstico
    localStorage.setItem('last_successful_notification_sync', new Date().toISOString());
    
    return { data: notifications, error: null };
  } catch (error: any) {
    console.error("Erro ao buscar notificações do Supabase:", error);
    
    // Registrar falha no localStorage para fins de diagnóstico
    const failCountKey = `notification_fetch_fail_count`;
    const currentFailCount = parseInt(localStorage.getItem(failCountKey) || '0');
    localStorage.setItem(failCountKey, (currentFailCount + 1).toString());
    
    return { data: [], error };
  }
};

// Obter todas as notificações do usuário atual (mantém compatibilidade com o código existente)
export const getNotifications = (localOnly: boolean = false): Notification[] => {
  const user = getCurrentUser();
  if (!user) return [];
  
  // Buscar do localStorage
  const notificationsStr = localStorage.getItem(`notifications_${user.id}`);
  if (!notificationsStr) return [];
  
  // Se não estamos em modo local apenas, buscar do Supabase em segundo plano para sincronizar
  if (!localOnly) {
    // Limitar taxa de requisições com cache de última solicitação
    const now = Date.now();
    const lastSyncKey = `last_notification_sync_${user.id}`;
    const lastSync = parseInt(localStorage.getItem(lastSyncKey) || '0');
    const SYNC_INTERVAL = 30000; // 30 segundos entre sincronizações
    
    if (now - lastSync > SYNC_INTERVAL) {
      // Atualizar timestamp da última sincronização antes de iniciar a requisição
      localStorage.setItem(lastSyncKey, now.toString());
      
      getSupabaseNotifications(user.id).then(({ data, error }) => {
        if (error) {
          console.error("Erro ao sincronizar notificações com Supabase:", error);
          return;
        }
        
        if (data && data.length > 0) {
          // Mesclar com notificações locais em vez de substituir completamente
          const localNotifications = JSON.parse(notificationsStr);
          const supabaseIds = new Set(data.map((n: Notification) => n.id));
          
          // Manter notificações locais que não estão no Supabase
          const localOnlyNotifications = localNotifications.filter((n: Notification) => !supabaseIds.has(n.id));
          
          // Combinar notificações do Supabase com as locais únicas
          const mergedNotifications = [...data, ...localOnlyNotifications];
          
          localStorage.setItem(`notifications_${user.id}`, JSON.stringify(mergedNotifications));
          window.dispatchEvent(new CustomEvent('notificationsUpdated'));
        }
      }).catch(error => {
        console.error("Erro ao buscar notificações do Supabase:", error);
      });
    }
  }
  
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

// Flag para evitar chamadas recursivas
let isGeneratingNotifications = false;

// Gerar notificações para contas a vencer
export const generateBillNotifications = async (): Promise<void> => {
  // Verificar se já está gerando notificações para evitar loops
  if (isGeneratingNotifications) {
    console.log('Já está gerando notificações, ignorando chamada');
    return;
  }
  
  const user = getCurrentUser();
  if (!user) return;
  
  try {
    // Definir flag para evitar chamadas recursivas
    isGeneratingNotifications = true;
    
    // Buscar preferências do usuário
    const userPreferences = getUserPreferences();
    
    // Verificar se as notificações estão habilitadas
    if (!userPreferences.notifications.inAppNotifications) {
      isGeneratingNotifications = false; // Resetar flag
      return; // Notificações no app estão desativadas
    }
    
    // Buscar contas do Supabase
    const { data: bills, error: billsError } = await getSupabaseBills(user.id);
    if (billsError) {
      console.error("Erro ao buscar contas para gerar notificações:", billsError);
      isGeneratingNotifications = false; // Resetar flag
      return;
    }
    
    // Buscar notificações existentes
    const { data: existingNotifications, error: notificationsError } = await getSupabaseNotifications(user.id);
    if (notificationsError) {
      console.error("Erro ao buscar notificações existentes:", notificationsError);
      isGeneratingNotifications = false; // Resetar flag
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
      
      if (diffDays === 5 && userPreferences.notifications.billsDueSoon) {
        // Conta a vencer em 5 dias
        newNotification = {
          id: uuidv4(),
          billId: bill.id,
          user_id: user.id,
          type: 'fiveDaysBefore',
          message: `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} vence em 5 dias.`,
          date: new Date(),
          read: false
        };
      } else if (diffDays === 1 && userPreferences.notifications.billsDueSoon) {
        // Conta a vencer em 1 dia
        newNotification = {
          id: uuidv4(),
          billId: bill.id,
          user_id: user.id,
          type: 'oneDayBefore',
          message: `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} vence amanhã.`,
          date: new Date(),
          read: false
        };
      } else if (diffDays === 0 && userPreferences.notifications.billsDueSoon) {
        // Conta vence hoje
        newNotification = {
          id: uuidv4(),
          billId: bill.id,
          user_id: user.id,
          type: 'dueDay',
          message: `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} vence hoje!`,
          date: new Date(),
          read: false
        };
      } else if (diffDays < 0 && userPreferences.notifications.billsOverdue) {
        // Conta vencida
        newNotification = {
          id: uuidv4(),
          billId: bill.id,
          user_id: user.id,
          type: 'overdue',
          message: `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} está vencida há ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'dia' : 'dias'}.`,
          date: new Date(),
          read: false
        };
      }
      
      // Quase terminando de pagar (faltando 1 ou 2 parcelas)
      if (bill.totalInstallments && bill.currentInstallment && userPreferences.notifications.billsDueSoon) {
        const remaining = bill.totalInstallments - bill.currentInstallment;
        if (remaining <= 2 && remaining > 0 && !newNotification) {
          newNotification = {
            id: uuidv4(),
            billId: bill.id,
            user_id: user.id,
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
  } catch (error: any) {
    console.error("Erro ao gerar notificações para contas:", error);
  } finally {
    // Garantir que a flag seja resetada mesmo em caso de erro
    isGeneratingNotifications = false;
  }
};

// Interface para preferências do usuário
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  dateFormat: string;
  language: string;
  weekStartsOn: string;
  showCents: boolean;
  showRecurringBadges: boolean;
  showTransactionCategories: boolean;
  enableNotifications: boolean;
  notifications: {
    pushNotifications: boolean;
    inAppNotifications: boolean;
    emailNotifications: boolean;
    billsDueSoon: boolean;
    billsOverdue: boolean;
    largeTransactions: boolean;
    weeklyEmailSummary: boolean;
  };
}

// Valores padrão para preferências do usuário
const defaultPreferences: UserPreferences = {
  theme: 'system',
  currency: 'BRL',
  dateFormat: 'dd/MM/yyyy',
  language: 'pt-BR',
  weekStartsOn: 'monday',
  showCents: true,
  showRecurringBadges: true,
  showTransactionCategories: true,
  enableNotifications: true,
  notifications: {
    pushNotifications: true,
    inAppNotifications: true,
    emailNotifications: true,
    billsDueSoon: true,
    billsOverdue: true,
    largeTransactions: true,
    weeklyEmailSummary: true
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
       notifications_bills_overdue: preferences.notifications.billsOverdue,
    notifications_large_transactions: preferences.notifications.largeTransactions,
    notifications_weekly_email: preferences.notifications.weeklyEmailSummary,
    notifications_push: preferences.notifications.pushNotifications,
    notifications_in_app: preferences.notifications.inAppNotifications,
    notifications_email: preferences.notifications.emailNotifications,
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
      billsDueSoon: data.notifications_bills_due_soon ?? true,
      billsOverdue: data.notifications_bills_overdue ?? true,
      largeTransactions: data.notifications_large_transactions ?? false,
      weeklyEmailSummary: data.notifications_weekly_email ?? true,
      pushNotifications: data.notifications_push ?? true,
      inAppNotifications: data.notifications_in_app ?? true,
      emailNotifications: data.notifications_email ?? true
    }
  };
};

// Salvar preferências do usuário no Supabase
export const saveSupabaseUserPreferences = async (preferences: UserPreferences): Promise<{ data: any, error: any }> => {
  const user = getCurrentUser();
  if (!user) return { data: null, error: "Usuário não autenticado" };
  
  try {
    // Preparar dados para o Supabase
    const supabasePreferences = mapPreferencesToSupabase(preferences, user.id);
    
    // Usar upsert para evitar conflitos de chave duplicada
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(supabasePreferences, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select('id, user_id, theme, currency, date_format, notifications_bills_due_soon, notifications_large_transactions, created_at, updated_at')
      .single();
      
    if (error) {
      console.error("Erro ao salvar preferências:", error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao salvar preferências:", error);
    return { data: null, error };
  }
};

// Salvar preferências do usuário (mantém a compatibilidade com o código existente)
export const saveUserPreferences = (preferences: UserPreferences): void => {
  const user = getCurrentUser();
  if (!user) return;
  
  // Salvar localmente
  localStorage.setItem(`preferences_${user.id}`, JSON.stringify(preferences));
  
  // Disparar evento para atualizar a UI
  window.dispatchEvent(new Event('preferencesUpdated'));
  
  // Também salvar no Supabase
  saveSupabaseUserPreferences(preferences).catch(error => {
    console.error("Erro ao salvar preferências do usuário no Supabase:", error);
  });
};

// Cache de preferências para evitar requisições repetidas
const userPreferencesCache: { [userId: string]: { data: UserPreferences, timestamp: number } } = {};

// Obter preferências do usuário do Supabase
export const getSupabaseUserPreferences = async (userId: string): Promise<{ data: UserPreferences | null, error: any }> => {
  // Verificar cache primeiro
  const cachedPrefs = userPreferencesCache[userId];
  const cacheValidity = 5 * 60 * 1000; // 5 minutos
  
  if (cachedPrefs && (Date.now() - cachedPrefs.timestamp < cacheValidity)) {
    return { data: cachedPrefs.data, error: null };
  }
  
  // Função auxiliar para fazer a requisição com retry
  const fetchWithRetry = async (retryCount = 0, maxRetries = 3): Promise<{ data: UserPreferences | null, error: any }> => {
    try {
      // Exponential backoff
      if (retryCount > 0) {
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Buscar preferências do usuário
      let { data, error } = await supabase
        .from('user_preferences')
        .select('id, user_id, theme, currency, date_format, notifications_bills_due_soon, notifications_large_transactions, created_at, updated_at')
        .eq('user_id', userId)
        .maybeSingle();
      
      // Se houve erro, verificar se podemos tentar novamente
      if (error) {
        // Se for um erro de rede ou de recursos e ainda temos tentativas
        if (retryCount < maxRetries) {
          console.log(`Tentativa ${retryCount + 1}/${maxRetries} falhou, tentando novamente...`);
          return fetchWithRetry(retryCount + 1, maxRetries);
        }
        
        // Se esgotamos as tentativas, tentar método alternativo
        console.log("Tentando buscar preferências com método alternativo...");
        try {
          const response = await supabase
            .from('user_preferences')
            .select('id, user_id, theme, currency, date_format, notifications_bills_due_soon, notifications_large_transactions, created_at, updated_at')
            .eq('user_id', userId)
            .limit(1);
          
          if (response.error) {
            console.error("Erro ao buscar preferências do Supabase (método alternativo):", response.error);
            return { data: defaultPreferences, error: null };
          }
          
          // Se encontrou dados, usar o primeiro resultado
          if (response.data && response.data.length > 0) {
            data = response.data[0];
            error = null;
          }
        } catch (altError) {
          console.error("Erro no método alternativo:", altError);
          return { data: defaultPreferences, error };
        }
      }
      
      // Se encontrou dados, atualizar cache e retornar
      if (data) {
        const mappedData = mapSupabaseToPreferences(data);
        userPreferencesCache[userId] = { data: mappedData, timestamp: Date.now() };
        return { data: mappedData, error: null };
      }
      
      // Se não encontrou dados, tentar criar um registro para este usuário
      try {
        console.log(`Tentando criar preferências padrão para o usuário ${userId}`);
        const newPrefs = mapPreferencesToSupabase(defaultPreferences, userId);
        
        // Usar upsert para evitar conflitos se outro processo criou o registro
        const { data: insertData, error: insertError } = await supabase
          .from('user_preferences')
          .upsert(newPrefs, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })
          .select();
          
        if (insertError) {
          console.error("Erro ao criar preferências no Supabase:", insertError);
          return { data: defaultPreferences, error: null };
        }
        
        const mappedData = mapSupabaseToPreferences(insertData[0]);
        userPreferencesCache[userId] = { data: mappedData, timestamp: Date.now() };
        return { data: mappedData, error: null };
      } catch (insertCatchError) {
        console.error("Erro ao inserir preferências:", insertCatchError);
        return { data: defaultPreferences, error };
      }
    } catch (error: any) {
      if (retryCount < maxRetries) {
        console.log(`Erro na tentativa ${retryCount + 1}/${maxRetries}, tentando novamente...`);
        return fetchWithRetry(retryCount + 1, maxRetries);
      }
      console.error("Erro ao buscar preferências do usuário do Supabase após todas as tentativas:", error);
      return { data: defaultPreferences, error };
    }
  };
  
  // Iniciar o processo de busca com retry
  return fetchWithRetry();
};

// Variável para controlar a última vez que as preferências foram sincronizadas
let lastPreferencesSyncTime: { [userId: string]: number } = {};
let isSyncingPreferences: { [userId: string]: boolean } = {};

// Obter preferências do usuário (mantém compatibilidade com o código existente)
export const getUserPreferences = (): UserPreferences => {
  const user = getCurrentUser();
  if (!user) return defaultPreferences;
  
  // Buscar do localStorage
  const preferencesStr = localStorage.getItem(`preferences_${user.id}`);
  const localPreferences = preferencesStr ? JSON.parse(preferencesStr) : defaultPreferences;
  
  // Salvar as preferências padrão no localStorage se não existirem
  if (!preferencesStr) {
    localStorage.setItem(`preferences_${user.id}`, JSON.stringify(defaultPreferences));
  }
  
  // Verificar se devemos sincronizar com o Supabase
  const now = Date.now();
  const lastSync = lastPreferencesSyncTime[user.id] || 0;
  const isSyncing = isSyncingPreferences[user.id] || false;
  const syncInterval = 60000; // 1 minuto entre sincronizações
  
  // Só sincronizar se passou o intervalo E não estiver sincronizando no momento
  if (!isSyncing && (now - lastSync > syncInterval)) {
    // Marcar que estamos sincronizando para este usuário
    isSyncingPreferences[user.id] = true;
    lastPreferencesSyncTime[user.id] = now;
    
    // Buscar do Supabase em segundo plano para sincronizar
    getSupabaseUserPreferences(user.id)
      .then(({ data, error }) => {
        // Marcar que terminamos a sincronização
        isSyncingPreferences[user.id] = false;
        
        if (error) {
          console.error("Erro ao sincronizar preferências do usuário com Supabase:", error);
          return;
        }
        
        if (data) {
          localStorage.setItem(`preferences_${user.id}`, JSON.stringify(data));
          // Disparar evento para atualizar a UI se necessário
          window.dispatchEvent(new Event('preferencesUpdated'));
        }
      })
      .catch(err => {
        // Garantir que o flag de sincronização seja resetado mesmo em caso de erro
        isSyncingPreferences[user.id] = false;
        console.error("Erro inesperado ao sincronizar preferências:", err);
      });
  }
  
  return localPreferences;
};

// FUNÇÃO DE SINCRONIZAÇÃO AGRESSIVA PARA TELEGRAM/IA (CORRIGIDA ANTI-LOOP)
let isForceSync = false; // Flag para evitar execuções simultâneas
export const forceSupabaseSync = async (): Promise<void> => {
  const user = getCurrentUser();
  if (!user || isForceSync) {
    console.log('🚀 [FORCE SYNC] Ignorando - já executando ou sem usuário');
    return;
  }
  
  isForceSync = true;
  console.log('🚀 [FORCE SYNC] SINCRONIZAÇÃO INTELIGENTE INICIADA');
  
  try {
    // Buscar do Supabase
    const result = await getSupabaseTransactions(user.id);
    
    if (result.error) {
      console.error('❌ [FORCE SYNC] Erro na sincronização forçada:', result.error);
      return;
    }
    
    console.log(`📥 [FORCE SYNC] ${result.data?.length || 0} transações encontradas no Supabase`);
    
    const supabaseTransactions = result.data ? result.data.map(mapSupabaseToTransaction) : [];
    
    // SINCRONIZAÇÃO INTELIGENTE: Mesclar dados locais com Supabase
    const localTransactionsStr = localStorage.getItem(`transactions_${user.id}`);
    let localTransactions: Transaction[] = [];
    
    if (localTransactionsStr) {
      try {
        localTransactions = JSON.parse(localTransactionsStr);
        console.log(`📱 [FORCE SYNC] ${localTransactions.length} transações encontradas localmente`);
      } catch (err) {
        console.error('❌ [FORCE SYNC] Erro ao ler localStorage:', err);
        localTransactions = [];
      }
    }
    
    // Criar mapa de transações do Supabase por ID
    const supabaseMap = new Map<string, Transaction>();
    supabaseTransactions.forEach(t => supabaseMap.set(t.id, t));
    
    // Criar mapa de transações locais por ID 
    const localMap = new Map<string, Transaction>();
    localTransactions.forEach(t => localMap.set(t.id, t));
    
    // MERGE INTELIGENTE: Preservar transações locais não sincronizadas
    const mergedTransactions: Transaction[] = [];
    
    console.log(`🔀 [SMART MERGE] Iniciando merge inteligente:`);
    console.log(`  📱 Local: ${localTransactions.length} transações`);
    console.log(`  ☁️  Supabase: ${supabaseTransactions.length} transações`);
    
    // ETAPA 1: Adicionar TODAS as transações locais primeiro (prioridade absoluta)
    localTransactions.forEach(localTx => {
      if (supabaseMap.has(localTx.id)) {
        // Transação existe no Supabase - usar versão do Supabase (sincronizada)
        mergedTransactions.push(supabaseMap.get(localTx.id)!);
        console.log(`🔄 [SMART MERGE] Usando versão Supabase para: ${localTx.title}`);
      } else {
        // Transação NÃO existe no Supabase - PRESERVAR versão local
        mergedTransactions.push(localTx);
        console.log(`⭐ [SMART MERGE] PRESERVANDO transação local não sincronizada: ${localTx.title}`);
      }
    });
    
    // ETAPA 2: Adicionar transações do Supabase que não existem localmente
    supabaseTransactions.forEach(supabaseTx => {
      if (!localMap.has(supabaseTx.id)) {
        mergedTransactions.push(supabaseTx);
        console.log(`📥 [SMART MERGE] Adicionando nova do Supabase: ${supabaseTx.title}`);
      }
    });
    
    // Remover duplicatas por ID (priorizar a primeira ocorrência)
    const uniqueTransactions = Array.from(
      new Map(mergedTransactions.map(t => [t.id, t])).values()
    );
    
    // Salvar resultado mesclado
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(uniqueTransactions));
    console.log(`✅ [SMART MERGE] Merge inteligente concluído: ${uniqueTransactions.length} transações`);
    console.log(`   📱 Preservadas locais: ${localTransactions.filter(lt => !supabaseMap.has(lt.id)).length}`);
    console.log(`   ☁️  Adicionadas Supabase: ${supabaseTransactions.filter(st => !localMap.has(st.id)).length}`);
    console.log(`   🔄 Atualizadas com Supabase: ${localTransactions.filter(lt => supabaseMap.has(lt.id)).length}`);
    
    // Evento único para atualizar UI
    setTimeout(() => {
      window.dispatchEvent(new Event('transactionsUpdated'));
      window.dispatchEvent(new CustomEvent('transactionsUpdated', { 
        detail: { 
          source: 'smart-merge', 
          total: uniqueTransactions.length,
          forced: true,
          merged: true,
          preserved: localTransactions.filter(lt => !supabaseMap.has(lt.id)).length,
          added: supabaseTransactions.filter(st => !localMap.has(st.id)).length
        } 
      }));
      console.log('📢 [SMART MERGE] Evento de merge inteligente disparado');
    }, 500);
    
  } catch (error) {
    console.error('❌ [FORCE SYNC] Erro crítico:', error);
  } finally {
    // Limpar flag após 2 segundos
    setTimeout(() => {
      isForceSync = false;
    }, 2000);
  }
};

// INICIALIZAR sincronização automática quando necessário
let autoSyncInterval: NodeJS.Timeout | null = null;

export const startAutoSync = () => {
  if (autoSyncInterval) return; // Já está rodando
  
  console.log('🔄 [AUTO SYNC] Iniciando sincronização automática a cada 60 segundos...');
  autoSyncInterval = setInterval(() => {
    const user = getCurrentUser();
    if (user) {
      // Apenas sincronizar se realmente necessário
      forceSupabaseSync();
    }
  }, 60000); // A cada 60 segundos (1 minuto) em vez de 3 segundos
};

export const stopAutoSync = () => {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
    console.log('⏹️ [AUTO SYNC] Sincronização automática parada');
  }
};
