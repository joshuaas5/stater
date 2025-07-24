import { Bill } from '@/types';
import { getBills } from '@/utils/localStorage';
import { toast } from 'sonner';

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
 * Exibe notificações de contas próximas do vencimento
 */
export const showBillNotifications = (): void => {
  const notifications = checkBillDueDates();
  
  notifications.forEach(notification => {
    switch (notification.type) {
      case 'week_warning':
        toast.warning(notification.title, {
          description: notification.message,
          duration: 5000,
          action: {
            label: 'Ver conta',
            onClick: () => {
              // Navegar para a página de contas
              window.location.hash = '#/bills';
            }
          }
        });
        break;
        
      case 'day_warning':
        toast.error(notification.title, {
          description: notification.message,
          duration: 8000,
          action: {
            label: 'Marcar como paga',
            onClick: () => {
              // Implementar marcar como paga
              markBillAsPaid(notification.billId);
            }
          }
        });
        break;
        
      case 'overdue':
        toast.error(notification.title, {
          description: notification.message,
          duration: 10000,
          action: {
            label: 'Resolver agora',
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
      description: `${bills[billIndex].title} foi marcada como paga.`
    });
  }
};

/**
 * Inicializar sistema de notificações automáticas
 */
export const initializeBillNotifications = (): void => {
  // Verificar notificações ao carregar a aplicação
  showBillNotifications();
  
  // Verificar notificações a cada 30 minutos
  setInterval(() => {
    showBillNotifications();
  }, 30 * 60 * 1000); // 30 minutos
  
  // Verificar notificações quando a aba ganhar foco
  window.addEventListener('focus', () => {
    showBillNotifications();
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
