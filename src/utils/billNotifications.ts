import { Bill } from '@/types';
import { getBills } from '@/utils/localStorage';
import { toast } from '@/components/ui/sonner';

export interface BillNotification {
  id: string;
  billId: string;
  title: string;
  message: string;
  type: 'week_warning' | 'day_warning' | 'overdue';
  dueDate: Date;
}

/**
 * Verifica se uma conta está próxima do vencimento
 */
export const checkBillDueDates = (): BillNotification[] => {
  const bills = getBills();
  const today = new Date();
  const notifications: BillNotification[] = [];
  
  // Resetar horas para comparação correta de datas
  today.setHours(0, 0, 0, 0);
  
  bills.forEach(bill => {
    if (bill.isPaid || !bill.notificationsEnabled) return;
    
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Notificação na semana do vencimento (7 dias antes)
    if (daysDiff === 7) {
      notifications.push({
        id: `${bill.id}_week`,
        billId: bill.id,
        title: '⏰ Conta vence em 1 semana',
        message: `${bill.title} vence em ${dueDate.toLocaleDateString('pt-BR')}`,
        type: 'week_warning',
        dueDate
      });
    }
    
    // Notificação no dia do vencimento
    if (daysDiff === 0) {
      notifications.push({
        id: `${bill.id}_day`,
        billId: bill.id,
        title: '🚨 Conta vence hoje!',
        message: `${bill.title} vence hoje (${dueDate.toLocaleDateString('pt-BR')})`,
        type: 'day_warning',
        dueDate
      });
    }
    
    // Notificação de atraso
    if (daysDiff < 0) {
      const daysOverdue = Math.abs(daysDiff);
      notifications.push({
        id: `${bill.id}_overdue`,
        billId: bill.id,
        title: '💸 Conta em atraso!',
        message: `${bill.title} está ${daysOverdue} dia(s) em atraso`,
        type: 'overdue',
        dueDate
      });
    }
  });
  
  return notifications;
};

/**
 * Cache para evitar spam de notificações
 */
const notificationCache = new Set<string>();

/**
 * Limpar cache de notificações (chamar ao adicionar/editar contas)
 */
export const clearNotificationCache = (): void => {
  notificationCache.clear();
};

/**
 * Exibe notificações de contas próximas do vencimento (apenas as essenciais)
 */
export const showBillNotifications = (): void => {
  const notifications = checkBillDueDates();
  
  // Filtrar apenas notificações realmente importantes
  const importantNotifications = notifications.filter(notification => {
    const cacheKey = `${notification.billId}_${notification.type}_${new Date().toDateString()}`;
    
    // Evitar spam - só mostrar uma vez por dia por conta
    if (notificationCache.has(cacheKey)) {
      return false;
    }
    
    // Apenas notificações do dia e atraso até 3 dias
    if (notification.type === 'week_warning') {
      return false; // Remover notificações de 7 dias
    }
    
    if (notification.type === 'overdue') {
      const daysOverdue = Math.ceil((new Date().getTime() - notification.dueDate.getTime()) / (1000 * 3600 * 24));
      return daysOverdue <= 3; // Só mostrar até 3 dias de atraso
    }
    
    return true;
  });
  
  importantNotifications.forEach(notification => {
    const cacheKey = `${notification.billId}_${notification.type}_${new Date().toDateString()}`;
    notificationCache.add(cacheKey);
    
    switch (notification.type) {
      case 'day_warning':
        toast.warning(notification.title, {
          description: notification.message,
          duration: 6000,
          dismissible: true,
          closeButton: true,
          action: {
            label: 'Ver conta',
            onClick: () => {
              window.location.hash = '#/bills';
            }
          }
        });
        break;
        
      case 'overdue':
        toast.error(notification.title, {
          description: notification.message,
          duration: 8000,
          dismissible: true,
          closeButton: true,
          action: {
            label: 'Ver conta',
            onClick: () => {
              window.location.hash = '#/bills';
            }
          }
        });
        break;
    }
  });
};

/**
 * Marca uma conta como paga
 */
const markBillAsPaid = (billId: string): void => {
  const bills = getBills();
  const billIndex = bills.findIndex(bill => bill.id === billId);
  
  if (billIndex !== -1) {
    bills[billIndex].isPaid = true;
    localStorage.setItem('bills', JSON.stringify(bills));
    
    toast.success('✅ Conta marcada como paga!', {
      description: `${bills[billIndex].title} foi marcada como paga.`,
      dismissible: true,
      closeButton: true
    });
  }
};

/**
 * Inicializar sistema de notificações automáticas (menos invasivo)
 */
export const initializeBillNotifications = (): void => {
  // Verificar notificações apenas ao carregar a aplicação
  setTimeout(() => {
    showBillNotifications();
  }, 5000); // Aguardar 5 segundos após o carregamento
  
  // Verificar notificações apenas 2 vezes por dia (8h e 20h)
  const checkNotifications = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Apenas nos horários estratégicos
    if (hour === 8 || hour === 20) {
      showBillNotifications();
    }
  };
  
  // Verificar a cada hora, mas só notificar nos horários específicos
  setInterval(checkNotifications, 60 * 60 * 1000); // 1 hora
  
  // Verificar quando a aba ganhar foco (apenas uma vez por sessão)
  let hasCheckedOnFocus = false;
  window.addEventListener('focus', () => {
    if (!hasCheckedOnFocus) {
      setTimeout(() => {
        showBillNotifications();
      }, 2000);
      hasCheckedOnFocus = true;
    }
  });
};

/**
 * Obter resumo de contas próximas do vencimento
 */
export const getBillsDueSummary = (): {
  dueToday: Bill[];
  dueThisWeek: Bill[];
  overdue: Bill[];
} => {
  const bills = getBills();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueToday: Bill[] = [];
  const dueThisWeek: Bill[] = [];
  const overdue: Bill[] = [];
  
  bills.forEach(bill => {
    if (bill.isPaid) return;
    
    const dueDate = new Date(bill.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff === 0) {
      dueToday.push(bill);
    } else if (daysDiff > 0 && daysDiff <= 7) {
      dueThisWeek.push(bill);
    } else if (daysDiff < 0) {
      overdue.push(bill);
    }
  });
  
  return { dueToday, dueThisWeek, overdue };
};
