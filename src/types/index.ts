
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  userId: string;
  // Campos adicionais para contas a pagar
  isRecurring?: boolean;
  dueDate?: Date;
  isPaid?: boolean;
  totalInstallments?: number;
  currentInstallment?: number;
  // Para cartões de crédito
  isCardBill?: boolean;
  cardItems?: CardItem[];
}

export interface CardItem {
  id: string;
  description: string;
  amount: number;
  installments?: {
    current: number;
    total: number;
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'system';
  timestamp: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  isRecurring: boolean;
  category: string;
  userId: string;
  isPaid: boolean;
  totalInstallments?: number;
  currentInstallment?: number;
  notificationsEnabled: boolean;
  isCardBill?: boolean;
  cardItems?: CardItem[];
}

export type NotificationType = 'fiveDaysBefore' | 'oneDayBefore' | 'dueDay' | 'overdue' | 'almostFinished';

export interface Notification {
  id: string;
  billId: string;
  userId: string;
  type: NotificationType;
  message: string;
  date: Date;
  read: boolean;
}
