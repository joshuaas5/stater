
// Global type definitions for '@/types' module
declare module '@/types' {
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
    recurringDay?: number; // Dia do mês para transações recorrentes
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
    recurringDay?: number; // Dia do mês para contas recorrentes
    category: string;
    userId: string;
    isPaid: boolean;
    totalInstallments?: number;
    currentInstallment?: number;
    notificationsEnabled: boolean;
    notificationDays?: number[]; // Dias antes para notificar
    isCardBill?: boolean;
    cardItems?: CardItem[];
  }

  export type NotificationType = 'fiveDaysBefore' | 'oneDayBefore' | 'dueDay' | 'overdue' | 'almostFinished' | 'paid';

  export interface Notification {
    id: string;
    billId: string;
    userId: string;
    type: NotificationType;
    message: string;
    date: Date;
    read: boolean;
  }
}
