
import { NotificationType } from '@/types';

// Try to import the Capacitor plugin, with a fallback for web environments
let LocalNotifications: any;
try {
  LocalNotifications = require('@capacitor/local-notifications');
} catch (error) {
  console.log('Capacitor Local Notifications not available, using web fallback');
}

// Check if running in a Capacitor environment
const isCapacitorAvailable = () => {
  return typeof window !== 'undefined' && window.Capacitor !== undefined;
};

class NotificationServiceClass {
  async requestPermissions(): Promise<boolean> {
    try {
      // Try to use Capacitor first
      if (isCapacitorAvailable() && LocalNotifications) {
        const { display } = await LocalNotifications.checkPermissions();
        if (display === 'prompt' || display === 'prompt-with-rationale') {
          const requestResult = await LocalNotifications.requestPermissions();
          return requestResult.display === 'granted';
        }
        return display === 'granted';
      }
      
      // Fallback to web notifications
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
  
  async checkPermissions(): Promise<boolean> {
    try {
      // Try to use Capacitor first
      if (isCapacitorAvailable() && LocalNotifications) {
        const { display } = await LocalNotifications.checkPermissions();
        return display === 'granted';
      }
      
      // Fallback to web notifications
      if ('Notification' in window) {
        return Notification.permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }
  
  async createNotification(userId: string, billId: string, type: NotificationType, message: string): Promise<void> {
    try {
      const notification = {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        billId,
        userId,
        type,
        message,
        date: new Date(),
        read: false
      };
      
      await this.saveNotification(notification);
      await this.showSystemNotification(billId, message);
      
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
  
  async saveNotification(notification: any): Promise<void> {
    try {
      // Get existing notifications
      const existingNotificationsJSON = localStorage.getItem(`notifications_${notification.userId}`);
      const existingNotifications = existingNotificationsJSON ? JSON.parse(existingNotificationsJSON) : [];
      
      // Add new notification
      existingNotifications.push(notification);
      
      // Save back to localStorage
      localStorage.setItem(`notifications_${notification.userId}`, JSON.stringify(existingNotifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }
  
  async showSystemNotification(id: string, message: string): Promise<void> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return;
      }
      
      // First try to use Capacitor for native notifications
      if (isCapacitorAvailable() && LocalNotifications) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: parseInt(id.replace(/\D/g, '').substr(0, 8)),
              title: 'Lembrete Financeiro',
              body: message,
              schedule: { at: new Date(Date.now()) },
              sound: 'beep.wav',
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#488AFF'
            }
          ]
        });
        return;
      }
      
      // Use native browser notifications for web
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Lembrete Financeiro', {
          body: message,
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Error showing system notification:', error);
    }
  }
  
  async scheduleBillReminders(bills: any[]): Promise<void> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return;
      }
      
      for (const bill of bills) {
        if (!bill.notificationsEnabled || bill.isPaid) continue;
        
        const dueDate = new Date(bill.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const notificationDays = bill.notificationDays || [5, 1, 0];
        
        for (const days of notificationDays) {
          if (diffDays === days) {
            // Create notification in app
            this.createNotification(
              bill.userId,
              bill.id,
              days === 0 ? 'dueDay' : days === 1 ? 'oneDayBefore' : 'fiveDaysBefore',
              `A conta "${bill.title}" vence em ${days === 0 ? 'hoje' : days === 1 ? 'amanhã' : `${days} dias`}!`
            );
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling bill reminders:', error);
    }
  }
  
  async clearAllNotifications(): Promise<void> {
    try {
      if (isCapacitorAvailable() && LocalNotifications) {
        const pendingNotifications = await LocalNotifications.getPending();
        if (pendingNotifications && pendingNotifications.notifications.length > 0) {
          const ids = pendingNotifications.notifications.map(n => n.id);
          await LocalNotifications.cancel({ notifications: ids });
        }
      }
      console.log('Notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }
  
  async triggerDailyCheck(): Promise<void> {
    try {
      const bills = this.getBills();
      
      if (bills.length > 0) {
        await this.scheduleBillReminders(bills);
      }
    } catch (error) {
      console.error('Error triggering daily check:', error);
    }
  }
  
  // Helper method to get bills from localStorage
  getBills(): any[] {
    try {
      const user = this.getCurrentUser();
      if (!user) return [];
      
      const billsJSON = localStorage.getItem(`bills_${user.id}`);
      return billsJSON ? JSON.parse(billsJSON) : [];
    } catch (error) {
      console.error('Error getting bills:', error);
      return [];
    }
  }
  
  // Helper method to get current user from localStorage
  getCurrentUser(): { id: string } | null {
    try {
      const userJSON = localStorage.getItem('currentUser');
      return userJSON ? JSON.parse(userJSON) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

export const NotificationService = new NotificationServiceClass();
