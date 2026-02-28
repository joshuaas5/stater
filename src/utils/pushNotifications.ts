/**
 * Sistema de Push Notifications para Stater
 * Suporta Web Push API e Capacitor Local Notifications para mobile
 */

import { Capacitor } from '@capacitor/core';
import { Bill } from '@/types';
import { getBills } from '@/utils/localStorage';

// Importação dinâmica para Capacitor Local Notifications (pode não estar instalado)
let LocalNotifications: any = null;
const loadLocalNotifications = async () => {
  if (Capacitor.isNativePlatform() && !LocalNotifications) {
    try {
      const module = await import('@capacitor/local-notifications');
      LocalNotifications = module.LocalNotifications;
    } catch (e) {
      console.warn('LocalNotifications não disponível:', e);
    }
  }
  return LocalNotifications;
};

// Chave VAPID para Web Push (você precisa gerar uma)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  notifyDaysBefore: number[];  // Ex: [7, 3, 1, 0] = 7, 3, 1 dias antes e no dia
  notifyOverdue: boolean;
  quietHoursStart?: number;    // Ex: 22 (10pm)
  quietHoursEnd?: number;      // Ex: 8 (8am)
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: true,
  notifyDaysBefore: [7, 3, 1, 0],
  notifyOverdue: true,
  quietHoursStart: 22,
  quietHoursEnd: 8
};

/**
 * Verificar se é um dispositivo móvel nativo
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Verificar se Push Notifications são suportadas
 */
export const isPushSupported = (): boolean => {
  if (isNativePlatform()) {
    return true; // Capacitor Local Notifications sempre disponível
  }
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Solicitar permissão para notificações
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (isNativePlatform()) {
      // Capacitor Local Notifications
      const LN = await loadLocalNotifications();
      if (!LN) return false;
      const result = await LN.requestPermissions();
      return result.display === 'granted';
    } else {
      // Web Push
      if (!('Notification' in window)) {
        console.warn('❌ Navegador não suporta notificações');
        return false;
      }
      
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error);
    return false;
  }
};

/**
 * Verificar status da permissão
 */
export const getNotificationPermissionStatus = async (): Promise<'granted' | 'denied' | 'default'> => {
  try {
    if (isNativePlatform()) {
      const LN = await loadLocalNotifications();
      if (!LN) return 'denied';
      const result = await LN.checkPermissions();
      return result.display as 'granted' | 'denied' | 'default';
    } else {
      if (!('Notification' in window)) return 'denied';
      return Notification.permission;
    }
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return 'denied';
  }
};

/**
 * Enviar notificação push imediata
 */
export const sendPushNotification = async (
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> => {
  try {
    const permission = await getNotificationPermissionStatus();
    if (permission !== 'granted') {
      console.warn('⚠️ Permissão de notificação não concedida');
      return false;
    }

    if (isNativePlatform()) {
      // Capacitor Local Notification
      const LN = await loadLocalNotifications();
      if (!LN) return false;
      await LN.schedule({
        notifications: [{
          id: Date.now(),
          title,
          body,
          schedule: { at: new Date(Date.now() + 100) }, // Imediato
          sound: 'default',
          smallIcon: 'ic_notification',
          largeIcon: 'ic_launcher',
          extra: data
        }]
      });
    } else {
      // Web Notification
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'stater-bill-reminder',
        data
      });
    }
    
    console.log('✅ Notificação enviada:', title);
    return true;
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return false;
  }
};

/**
 * Agendar notificação para uma data específica
 */
export const scheduleNotification = async (
  id: number,
  title: string,
  body: string,
  scheduledDate: Date,
  data?: Record<string, any>
): Promise<boolean> => {
  try {
    if (isNativePlatform()) {
      const LN = await loadLocalNotifications();
      if (!LN) return false;
      await LN.schedule({
        notifications: [{
          id,
          title,
          body,
          schedule: { at: scheduledDate },
          sound: 'default',
          smallIcon: 'ic_notification',
          largeIcon: 'ic_launcher',
          extra: data
        }]
      });
      console.log(`📅 Notificação agendada para ${scheduledDate.toLocaleString()}: ${title}`);
      return true;
    } else {
      // Para web, usamos um approach diferente - salvar no localStorage e verificar
      const scheduledNotifications = JSON.parse(
        localStorage.getItem('scheduledNotifications') || '[]'
      );
      scheduledNotifications.push({
        id,
        title,
        body,
        scheduledDate: scheduledDate.toISOString(),
        data
      });
      localStorage.setItem('scheduledNotifications', JSON.stringify(scheduledNotifications));
      console.log(`📅 Notificação web agendada para ${scheduledDate.toLocaleString()}: ${title}`);
      return true;
    }
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    return false;
  }
};

/**
 * Cancelar notificação agendada
 */
export const cancelScheduledNotification = async (id: number): Promise<void> => {
  try {
    if (isNativePlatform()) {
      const LN = await loadLocalNotifications();
      if (LN) await LN.cancel({ notifications: [{ id }] });
    } else {
      const scheduledNotifications = JSON.parse(
        localStorage.getItem('scheduledNotifications') || '[]'
      );
      const filtered = scheduledNotifications.filter((n: any) => n.id !== id);
      localStorage.setItem('scheduledNotifications', JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Erro ao cancelar notificação:', error);
  }
};

/**
 * Cancelar todas as notificações agendadas
 */
export const cancelAllScheduledNotifications = async (): Promise<void> => {
  try {
    if (isNativePlatform()) {
      const LN = await loadLocalNotifications();
      if (LN) {
        const pending = await LN.getPending();
        if (pending.notifications.length > 0) {
          await LN.cancel({ notifications: pending.notifications });
        }
      }
    }
    localStorage.removeItem('scheduledNotifications');
    console.log('🗑️ Todas as notificações canceladas');
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error);
  }
};

/**
 * Gerar ID único para notificação baseado no bill e dia de antecedência
 */
const generateNotificationId = (billId: string, daysBefore: number): number => {
  // Criar um ID numérico único baseado no hash do billId + daysBefore
  let hash = 0;
  const str = `${billId}_${daysBefore}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Agendar notificações para uma conta
 */
export const scheduleBillNotifications = async (
  bill: Bill,
  settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS
): Promise<void> => {
  if (!settings.pushEnabled || !bill.notificationsEnabled) {
    return;
  }

  const dueDate = new Date(bill.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Horário para enviar notificação (9h da manhã por padrão)
  const notificationHour = 9;

  for (const daysBefore of settings.notifyDaysBefore) {
    const notificationDate = new Date(dueDate);
    notificationDate.setDate(notificationDate.getDate() - daysBefore);
    notificationDate.setHours(notificationHour, 0, 0, 0);

    // Só agendar se a data for no futuro
    if (notificationDate > new Date()) {
      const id = generateNotificationId(bill.id, daysBefore);
      
      let title: string;
      let body: string;

      if (daysBefore === 0) {
        title = '🚨 Conta vence HOJE!';
        body = `${bill.title} - R$ ${bill.amount.toFixed(2).replace('.', ',')} vence hoje!`;
      } else if (daysBefore === 1) {
        title = '⏰ Conta vence AMANHÃ';
        body = `${bill.title} - R$ ${bill.amount.toFixed(2).replace('.', ',')} vence amanhã!`;
      } else {
        title = `📅 Conta vence em ${daysBefore} dias`;
        body = `${bill.title} - R$ ${bill.amount.toFixed(2).replace('.', ',')} vence em ${dueDate.toLocaleDateString('pt-BR')}`;
      }

      await scheduleNotification(id, title, body, notificationDate, {
        billId: bill.id,
        type: 'bill_reminder',
        daysBefore
      });
    }
  }
};

/**
 * Cancelar notificações de uma conta
 */
export const cancelBillNotifications = async (billId: string): Promise<void> => {
  const settings = DEFAULT_NOTIFICATION_SETTINGS;
  
  for (const daysBefore of settings.notifyDaysBefore) {
    const id = generateNotificationId(billId, daysBefore);
    await cancelScheduledNotification(id);
  }
};

/**
 * Reagendar todas as notificações de contas
 */
export const rescheduleAllBillNotifications = async (): Promise<void> => {
  try {
    // Cancelar todas as notificações existentes
    await cancelAllScheduledNotifications();
    
    // Obter configurações do localStorage
    const settingsStr = localStorage.getItem('notificationSettings');
    const settings: NotificationSettings = settingsStr 
      ? JSON.parse(settingsStr) 
      : DEFAULT_NOTIFICATION_SETTINGS;

    if (!settings.pushEnabled) {
      console.log('📴 Push notifications desabilitadas');
      return;
    }

    // Obter todas as contas não pagas
    const bills = getBills().filter(bill => !bill.isPaid && bill.notificationsEnabled !== false);

    // Agendar notificações para cada conta
    for (const bill of bills) {
      await scheduleBillNotifications(bill, settings);
    }

    console.log(`📅 ${bills.length} contas com notificações agendadas`);
  } catch (error) {
    console.error('Erro ao reagendar notificações:', error);
  }
};

/**
 * Verificar e enviar notificações web agendadas
 * (Chamado periodicamente pelo app ou service worker)
 */
export const checkWebScheduledNotifications = async (): Promise<void> => {
  if (isNativePlatform()) return; // Só para web

  try {
    const scheduledNotifications = JSON.parse(
      localStorage.getItem('scheduledNotifications') || '[]'
    );
    
    const now = new Date();
    const toSend: any[] = [];
    const toKeep: any[] = [];

    for (const notification of scheduledNotifications) {
      const scheduledDate = new Date(notification.scheduledDate);
      if (scheduledDate <= now) {
        toSend.push(notification);
      } else {
        toKeep.push(notification);
      }
    }

    // Enviar notificações pendentes
    for (const notification of toSend) {
      await sendPushNotification(notification.title, notification.body, notification.data);
    }

    // Atualizar lista de agendadas
    localStorage.setItem('scheduledNotifications', JSON.stringify(toKeep));
  } catch (error) {
    console.error('Erro ao verificar notificações agendadas:', error);
  }
};

/**
 * Salvar configurações de notificação
 */
export const saveNotificationSettings = (settings: NotificationSettings): void => {
  localStorage.setItem('notificationSettings', JSON.stringify(settings));
  console.log('💾 Configurações de notificação salvas:', settings);
};

/**
 * Carregar configurações de notificação
 */
export const loadNotificationSettings = (): NotificationSettings => {
  try {
    const settingsStr = localStorage.getItem('notificationSettings');
    return settingsStr ? JSON.parse(settingsStr) : DEFAULT_NOTIFICATION_SETTINGS;
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
};

/**
 * Inicializar sistema de notificações
 */
export const initializePushNotifications = async (): Promise<boolean> => {
  try {
    const supported = isPushSupported();
    if (!supported) {
      console.warn('⚠️ Push notifications não suportadas neste dispositivo');
      return false;
    }

    // Verificar permissão atual
    const permission = await getNotificationPermissionStatus();
    
    if (permission === 'denied') {
      console.warn('❌ Permissão de notificação negada pelo usuário');
      return false;
    }

    if (permission === 'default') {
      // Não solicitar automaticamente - deixar o usuário decidir
      console.log('ℹ️ Permissão de notificação ainda não solicitada');
      return false;
    }

    // Configurar listeners para notificações nativas
    if (isNativePlatform()) {
      const LN = await loadLocalNotifications();
      if (LN) {
        LN.addListener('localNotificationReceived', (notification: any) => {
          console.log('📬 Notificação recebida:', notification);
        });

        LN.addListener('localNotificationActionPerformed', (notification: any) => {
          console.log('👆 Ação de notificação:', notification);
          // Navegar para a página de contas se clicado
          if (notification.notification.extra?.billId) {
            window.location.href = '/bills';
          }
        });
      }
    }

    // Para web, verificar notificações agendadas periodicamente
    if (!isNativePlatform()) {
      setInterval(checkWebScheduledNotifications, 60000); // A cada 1 minuto
      checkWebScheduledNotifications(); // Verificar imediatamente
    }

    // Reagendar todas as notificações
    await rescheduleAllBillNotifications();

    console.log('✅ Sistema de push notifications inicializado');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar push notifications:', error);
    return false;
  }
};
