
import { supabase } from '@/lib/supabase';
import { Transaction, Bill, Notification, User } from '@/types';
import { getCurrentUser } from '@/utils/localStorage';

class DatabaseServiceClass {
  // User Profile Operations
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  // Transaction Operations
  async getTransactions() {
    try {
      const user = getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('userId', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async saveTransaction(transaction: Omit<Transaction, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving transaction:', error);
      return null;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return false;
    }
  }

  async deleteTransaction(id: string) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }

  // Bill Operations
  async getBills() {
    try {
      const user = getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('userId', user.id)
        .order('dueDate', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bills:', error);
      return [];
    }
  }

  async saveBill(bill: Omit<Bill, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('bills')
        .insert([bill])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving bill:', error);
      return null;
    }
  }

  async updateBill(id: string, updates: Partial<Bill>) {
    try {
      const { error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating bill:', error);
      return false;
    }
  }

  async deleteBill(id: string) {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting bill:', error);
      return false;
    }
  }

  // Notification Operations
  async getNotifications() {
    try {
      const user = getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async saveNotification(notification: Omit<Notification, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving notification:', error);
      return null;
    }
  }

  async markNotificationAsRead(id: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // User Preferences
  async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('userId', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" error
      return data || {};
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {};
    }
  }

  async saveUserPreferences(userId: string, preferences: Record<string, any>) {
    try {
      // Usar upsert para evitar problemas de concorrência
      const { error } = await supabase
        .from('preferences')
        .upsert([{ userId, preferences }], {
          onConflict: 'userId',
          ignoreDuplicates: false
        });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }
}

export const DatabaseService = new DatabaseServiceClass();
