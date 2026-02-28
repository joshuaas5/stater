import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bell, BellRing, Mail, Smartphone, Calendar, AlertTriangle, 
  Clock, Check, X, Loader2, Settings2
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  loadNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  isPushSupported,
  rescheduleAllBillNotifications
} from '@/utils/pushNotifications';

interface NotificationSettingsCardProps {
  userId?: string;
}

export const NotificationSettingsCard: React.FC<NotificationSettingsCardProps> = ({ userId }) => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [isSupported, setIsSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    setLoading(true);
    try {
      // Verificar suporte
      const supported = isPushSupported();
      setIsSupported(supported);

      // Carregar configurações salvas
      const savedSettings = loadNotificationSettings();
      setSettings(savedSettings);

      // Verificar permissão atual
      if (supported) {
        const status = await getNotificationPermissionStatus();
        setPermissionStatus(status);
      }
    } catch (error) {
      console.error('Erro ao carregar estado inicial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      if (granted) {
        toast.success('Notificações ativadas!', {
          description: 'Você receberá alertas sobre suas contas'
        });
        // Reagendar notificações
        await rescheduleAllBillNotifications();
      } else {
        toast.error('Permissão negada', {
          description: 'Você pode ativar nas configurações do navegador/app'
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao ativar notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      saveNotificationSettings(settings);
      
      // Reagendar notificações com novas configurações
      if (settings.pushEnabled && permissionStatus === 'granted') {
        await rescheduleAllBillNotifications();
      }
      
      toast.success('Configurações salvas!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    setSettings(prev => {
      const currentDays = prev.notifyDaysBefore || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day].sort((a, b) => b - a);
      return { ...prev, notifyDaysBefore: newDays };
    });
  };

  const availableDays = [
    { value: 7, label: '7 dias antes' },
    { value: 5, label: '5 dias antes' },
    { value: 3, label: '3 dias antes' },
    { value: 1, label: '1 dia antes' },
    { value: 0, label: 'No dia do vencimento' }
  ];

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              Lembretes de Contas
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Nunca esqueça de pagar suas contas
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status da Permissão */}
        {!isSupported ? (
          <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Seu dispositivo não suporta notificações push
            </p>
          </div>
        ) : permissionStatus === 'denied' ? (
          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <X className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                Notificações bloqueadas
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Ative nas configurações do navegador/app
              </p>
            </div>
          </div>
        ) : permissionStatus === 'default' ? (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Ative notificações para receber lembretes
              </p>
            </div>
            <Button 
              size="sm" 
              onClick={handleRequestPermission}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ativar'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Check className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Notificações ativas
            </p>
          </div>
        )}

        {/* Configurações */}
        <div className="space-y-4">
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-gray-500" />
              <div>
                <Label className="text-gray-900 dark:text-white">
                  Notificações Push
                </Label>
                <p className="text-xs text-gray-500">
                  Receba alertas no celular/computador
                </p>
              </div>
            </div>
            <Switch
              checked={settings.pushEnabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, pushEnabled: checked }))
              }
              disabled={permissionStatus !== 'granted'}
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <Label className="text-gray-900 dark:text-white">
                  Notificações por E-mail
                </Label>
                <p className="text-xs text-gray-500">
                  Receba lembretes no seu e-mail
                </p>
              </div>
            </div>
            <Switch
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, emailEnabled: checked }))
              }
            />
          </div>

          {/* Notificar contas em atraso */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-gray-500" />
              <div>
                <Label className="text-gray-900 dark:text-white">
                  Alertar contas em atraso
                </Label>
                <p className="text-xs text-gray-500">
                  Lembrete diário de contas vencidas
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notifyOverdue}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, notifyOverdue: checked }))
              }
            />
          </div>
        </div>

        {/* Dias de Antecedência */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <Label className="text-gray-900 dark:text-white">
              Quando me notificar
            </Label>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {availableDays.map(({ value, label }) => (
              <div
                key={value}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                  settings.notifyDaysBefore.includes(value)
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                }`}
                onClick={() => toggleDay(value)}
              >
                <Checkbox
                  checked={settings.notifyDaysBefore.includes(value)}
                  onCheckedChange={() => toggleDay(value)}
                />
                <span className={`text-sm ${
                  settings.notifyDaysBefore.includes(value)
                    ? 'text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Botão Salvar */}
        <Button
          className="w-full"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Settings2 className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsCard;
