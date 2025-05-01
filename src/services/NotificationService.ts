
import { LocalNotifications } from '@capacitor/local-notifications';

export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      return display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleNotification(title: string, body: string, id = Math.floor(Math.random() * 10000), schedule?: { at: Date }): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: schedule,
            sound: 'beep.wav',
            smallIcon: 'ic_stat_icon_config_sample',
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  static async scheduleNearBillNotification(billName: string, dueDate: Date, amount: number, id: number): Promise<void> {
    // Calculate notification date (3 days before due date)
    const notifyDate = new Date(dueDate);
    notifyDate.setDate(notifyDate.getDate() - 3);
    
    if (notifyDate > new Date()) {
      const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(amount);
      
      await this.scheduleNotification(
        `Conta próxima do vencimento: ${billName}`,
        `Você tem uma conta de ${formattedAmount} com vencimento em ${dueDate.toLocaleDateString()}`,
        id,
        { at: notifyDate }
      );
    }
  }

  static async cancelNotification(id: number): Promise<void> {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id }]
      });
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  static async clearAllNotifications(): Promise<void> {
    try {
      await LocalNotifications.clearAll();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }
}
