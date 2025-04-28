
import { User, Transaction } from "@/types";

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

// Logout
export const logout = (): void => {
  localStorage.removeItem('currentUser');
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
