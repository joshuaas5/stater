
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
