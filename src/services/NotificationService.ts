import { Bill, Notification as AppNotification } from '@/types';
import { getBills, saveNotification } from '@/utils/localStorage';

// Definições de tipo mínimas para emular partes do @capacitor/local-notifications
// Isso evita o erro 'Cannot find module' se o pacote não estiver instalado
// e permite o desenvolvimento/linting em um ambiente puramente web.

interface CapacitorPlugins {
  LocalNotifications?: LocalNotificationsPlugin;
}

interface LocalNotificationsPlugin {
  requestPermissions(): Promise<PermissionStatus>;
  checkPermissions(): Promise<PermissionStatus>;
  schedule(options: { notifications: Partial<NotificationSchema>[] }): Promise<ScheduleResult>;
  getPending(): Promise<PendingResult>;
  cancel(options: { notifications: { id: string | number }[] }): Promise<void>;
}

interface PermissionStatus {
  display: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
}

interface NotificationSchema {
  id: number; // Ou string, dependendo de como você os configura
  title: string;
  body: string;
  schedule?: { at?: Date; every?: string; count?: number };
  sound?: string | null;
  // Outras propriedades conforme necessário
}

interface ScheduleResult {
  notifications: { id: string | number }[];
}

interface PendingResult {
  notifications: { id: string | number }[];
}

// Acessar o plugin LocalNotifications de forma segura
const getLocalNotificationsPlugin = (): LocalNotificationsPlugin | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const capacitor = (window as any).Capacitor;
  if (capacitor?.Plugins?.LocalNotifications) {
    return capacitor.Plugins.LocalNotifications;
  }
  return undefined;
};

class NotificationServiceClass {
  private async isSupported(): Promise<boolean> {
    const plugin = getLocalNotificationsPlugin();
    if (!plugin) {
      console.warn('Capacitor LocalNotifications não está disponível neste ambiente.');
      return false;
    }
    // Tenta uma chamada leve para confirmar funcionalidade, se necessário
    try {
      await plugin.checkPermissions();
      return true;
    } catch (e) {
      console.warn('Falha ao verificar permissões de LocalNotifications.', e);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    const plugin = getLocalNotificationsPlugin();
    if (!plugin) return false;
    try {
      const result: PermissionStatus = await plugin.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }
  
  async checkPermissions(): Promise<boolean> {
    const plugin = getLocalNotificationsPlugin();
    if (!plugin) return false;
    try {
      const result: PermissionStatus = await plugin.checkPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }
  
  async scheduleBillReminders(bills: Bill[]): Promise<void> {
    const plugin = getLocalNotificationsPlugin();
    if (!plugin) return;

    try {
      // Verificar preferências do usuário
      const { getUserPreferences } = await import('@/utils/localStorage');
      const userPreferences = getUserPreferences();
      
      // Se notificações push estiverem desativadas, não agendar
      if (!userPreferences.notifications.pushNotifications) {
        return;
      }
      
      const hasPermission = await this.checkPermissions(); // Reutiliza a lógica que já usa o plugin
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) return;
      }
      
      const notificationsToSchedule: Partial<NotificationSchema>[] = [];
      
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
            
            // Se a hora agendada para hoje já passou, agenda para amanhã (ou não, dependendo da lógica desejada)
            // if (scheduleTime < new Date()) {
            //   scheduleTime.setDate(scheduleTime.getDate() + 1);
            // }
            
            notificationsToSchedule.push({
              id: parseInt(`${bill.id.replace(/\D/g, '').substring(0, 8)}${days}`), // Garante um ID numérico único
              title: 'Lembrete de Conta',
              body: `A conta "${bill.title}" vence em ${days === 0 ? 'hoje' : days === 1 ? 'amanhã' : `${days} dias`}!`,
              schedule: { at: scheduleTime },
              sound: null
            });
          }
        }
      }
      
      if (notificationsToSchedule.length > 0) {
        await plugin.schedule({
          notifications: notificationsToSchedule,
        });
      }
    } catch (error) {
      console.error('Error scheduling bill reminders:', error);
    }
  }
  
  async clearAllNotifications(): Promise<void> {
    const plugin = getLocalNotificationsPlugin();
    if (!plugin) return;

    try {
      const pendingNotifications: PendingResult = await plugin.getPending();
      const idsToCancel: { id: string | number }[] = pendingNotifications.notifications.map((notification: { id: string | number }) => ({ id: notification.id }));
      
      if (idsToCancel.length > 0) {
        await plugin.cancel({ notifications: idsToCancel });
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }
  
  async triggerDailyCheck(): Promise<void> {
    const bills = getBills();
    
    if (bills.length > 0) {
      // scheduleBillReminders internamente já verifica o suporte e as permissões
      await this.scheduleBillReminders(bills);
    }
  }
}

export const NotificationService = new NotificationServiceClass();
