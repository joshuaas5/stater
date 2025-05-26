import { Bill, Notification as AppNotification } from '@/types';
import { getBills, saveNotification, getCurrentUser, getUserPreferences, getNotifications } from '@/utils/localStorage';

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
  constructor() {
    // Solicitar permissões de notificação automaticamente ao iniciar
    setTimeout(() => {
      this.requestPermissions().then(granted => {
        if (granted) {
          console.log('Permissões de notificação concedidas automaticamente');
          // Agendar notificações pendentes
          this.triggerDailyCheck();
        } else {
          console.warn('Permissões de notificação não foram concedidas');
        }
      });
    }, 2000); // Pequeno atraso para garantir que a UI esteja carregada
  }

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
      
      // Verificação mais segura das preferências de notificações
      // Tratar casos onde a estrutura de preferências pode estar incompleta
      if (userPreferences.notifications && userPreferences.notifications.pushNotifications === false) {
        console.log('Notificações push estão desativadas nas preferências do usuário');
        return;
      }
      
      // Para fins de segurança, sempre mostrar no console as preferências atuais
      console.log('Preferências de notificação do usuário:', JSON.stringify(userPreferences.notifications || 'padrão'));
      
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
          // Mostrar notificações para contas que vencem hoje, amanhã ou em 5 dias
          if (diffDays === days) {
            console.log(`Agendando notificação para conta ${bill.title} que vence em ${diffDays} dias`);
            
            // Agendar para o momento atual + 5 segundos para garantir que a notificação seja exibida imediatamente
            const scheduleTime = new Date(Date.now() + 5000);
            
            // Também agendar para 9:00 da manhã se ainda não passou das 9:00
            const morningTime = new Date();
            morningTime.setHours(9, 0, 0, 0);
            
            // Usar o tempo atual para garantir que a notificação seja exibida imediatamente
            notificationsToSchedule.push({
              id: parseInt(`${bill.id.replace(/\D/g, '').substring(0, 8)}${days}1`), // Garante um ID numérico único
              title: 'Lembrete de Conta',
              body: `A conta "${bill.title}" vence em ${days === 0 ? 'hoje' : days === 1 ? 'amanhã' : `${days} dias`}!`,
              schedule: { at: scheduleTime },
              sound: 'default'
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
  
  async initialize(): Promise<void> {
    console.log('Inicializando serviço de notificações...');
    
    // Atrasar a inicialização para garantir que a UI esteja carregada
    setTimeout(async () => {
      try {
        // Verificar se as permissões já foram concedidas
        const hasPermission = await this.checkPermissions();
        console.log('Permissões de notificação já concedidas?', hasPermission);
        
        // Se não tiver permissão, solicitar
        if (!hasPermission) {
          console.log('Solicitando permissões de notificação...');
          const granted = await this.requestPermissions();
          console.log('Permissões concedidas?', granted);
          if (!granted) {
            console.log('Permissões não concedidas, notificações não serão agendadas');
            return;
          }
        }
        
        // Agendar notificações após obter permissões
        console.log('Agendando notificações...');
        await this.scheduleNotifications();
        
        // Forçar uma verificação imediata de contas a vencer
        console.log('Verificando contas a vencer...');
        const { getBills } = await import('@/utils/localStorage');
        const bills = getBills();
        await this.scheduleBillReminders(bills);
      } catch (error) {
        console.error('Erro ao inicializar notificações:', error);
      }
    }, 2000); // Atraso de 2 segundos para garantir que a UI esteja carregada
  }
  
  async triggerDailyCheck(): Promise<void> {
    const bills = getBills();
    
    if (bills.length > 0) {
      // scheduleBillReminders internamente já verifica o suporte e as permissões
      await this.scheduleBillReminders(bills);
    }
    
    // Verificar se é segunda-feira para agendar lembrete de resumo semanal
    const today = new Date();
    if (today.getDay() === 1) { // 1 = Segunda-feira
      scheduleWeeklySummaryReminder();
    }
  }
  
  async scheduleNotifications(): Promise<void> {
    // Agendar notificações pendentes
    await this.triggerDailyCheck();
  }
}

export const NotificationService = new NotificationServiceClass();

/**
 * Agenda uma notificação semanal para lembrar o usuário de solicitar o resumo
 * Esta função deve ser chamada quando o usuário faz login
 */
export const scheduleWeeklySummaryReminder = () => {
  const user = getCurrentUser();
  if (!user) return;
  
  const userPreferences = getUserPreferences();
  if (!userPreferences.notifications.weeklyEmailSummary) return;
  
  // Verificar se já existe uma notificação agendada
  const existingNotifications = getNotifications();
  const hasReminder = existingNotifications.some(
    n => n.type === 'weekly_summary' && !n.read
  );
  
  if (hasReminder) return;
  
  // Calcular a próxima segunda-feira às 9:00
  const now = new Date();
  const daysUntilMonday = 1 - now.getDay();
  const nextMonday = new Date();
  
  if (daysUntilMonday <= 0) {
    nextMonday.setDate(now.getDate() + 7 + daysUntilMonday);
  } else {
    nextMonday.setDate(now.getDate() + daysUntilMonday);
  }
  
  nextMonday.setHours(9, 0, 0, 0);
  
  // Criar a notificação
  const notification: AppNotification = {
    id: `weekly-summary-${Date.now()}`,
    billId: '',
    userId: user.id,
    message: 'Solicite seu resumo semanal de finanças para acompanhar seus gastos e economias.',
    type: 'weekly_summary',
    date: nextMonday,
    read: false
  };
  
  // Adicionar à lista de notificações
  saveNotification(notification);
  
  // Registrar para notificação push se disponível
  const localNotifications = getLocalNotificationsPlugin();
  if (userPreferences.notifications.pushNotifications && localNotifications) {
    try {
      localNotifications.schedule({
        notifications: [{
          id: parseInt(notification.id.replace(/\D/g, '').substring(0, 8) || '12345'),
          title: 'Resumo Semanal Disponível',
          body: notification.message,
          schedule: { at: nextMonday }
        }]
      });
    } catch (error) {
      console.error('Erro ao agendar notificação push para resumo semanal:', error);
    }
  }
};
