
import { LocalNotifications } from '@capacitor/local-notifications';
import { Bill, Notification as AppNotification, NotificationType } from '@/types';
import { getBills, saveNotification } from '@/utils/localStorage';

class NotificationServiceClass {
  async requestPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
  
  async checkPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }
  
  async createNotification(userId: string, billId: string, type: NotificationType, message: string): Promise<void> {
    try {
      const notification: AppNotification = {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        billId,
        userId,
        type,
        message,
        date: new Date(),
        read: false
      };
      
      await saveNotification(notification);
      
      // Mostrar uma notificação do sistema se for permitido
      await this.showSystemNotification(billId, message);
      
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
  
  async showSystemNotification(id: string, message: string): Promise<void> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return;
      }
      
      await LocalNotifications.schedule({
        notifications: [
          {
            id: parseInt(id.replace(/\D/g, '').substring(0, 8)),
            title: 'Lembrete Financeiro',
            body: message,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: null
          }
        ]
      });
    } catch (error) {
      console.error('Error showing system notification:', error);
    }
  }
  
  async scheduleBillReminders(bills: Bill[]): Promise<void> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return;
      }
      
      const notifications = [];
      
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
            const scheduleTime = new Date();
            scheduleTime.setHours(9, 0, 0, 0); // 9:00 AM
            
            if (scheduleTime < new Date()) {
              scheduleTime.setDate(scheduleTime.getDate() + 1);
            }
            
            const notificationId = parseInt(bill.id.replace(/\D/g, '').substring(0, 8) + days);
            
            notifications.push({
              id: notificationId,
              title: 'Lembrete de Conta',
              body: `A conta "${bill.title}" vence em ${days === 0 ? 'hoje' : days === 1 ? 'amanhã' : `${days} dias`}!`,
              schedule: { at: scheduleTime },
              sound: null
            });
            
            // Criar notificação no app
            this.createNotification(
              bill.userId,
              bill.id,
              days === 0 ? 'dueDay' : days === 1 ? 'oneDayBefore' : 'fiveDaysBefore',
              `A conta "${bill.title}" vence em ${days === 0 ? 'hoje' : days === 1 ? 'amanhã' : `${days} dias`}!`
            );
          }
        }
      }
      
      if (notifications.length > 0) {
        await LocalNotifications.schedule({
          notifications,
        });
      }
    } catch (error) {
      console.error('Error scheduling bill reminders:', error);
    }
  }
  
  async clearAllNotifications(): Promise<void> {
    try {
      const pendingNotifications = await LocalNotifications.getPending();
      const ids = pendingNotifications.notifications.map(notification => notification.id);
      
      if (ids.length > 0) {
        await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }
  
  async triggerDailyCheck(): Promise<void> {
    const bills = getBills();
    
    if (bills.length > 0) {
      await this.scheduleBillReminders(bills);
    }
  }
}

export const NotificationService = new NotificationServiceClass();
