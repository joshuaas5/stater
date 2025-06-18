import React, { useState, useEffect } from 'react';
import TestIntegrationButton from '@/components/TestIntegrationButton';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPreferences, saveUserPreferences, UserPreferences } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Sun, Moon, Monitor, DollarSign, Calendar, MessageCircle, QrCode, Link, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SettingsPage: React.FC = () => {  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
    // Estado da aba ativa
  const [activeTab, setActiveTab] = useState('account');
  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        const userPrefs = getUserPreferences();
        setPreferences(userPrefs);
      }
      setIsLoading(false);
    };

    loadPreferences();
  }, [user]);
  const handleSavePreferences = (updatedPreferences: UserPreferences) => {
    if (user) {
      saveUserPreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      toast({
        title: "Preferências salvas",
        description: "Suas configurações foram atualizadas com sucesso."
      });
    }
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    if (preferences) {
      const updated = { ...preferences, [key]: value };
      handleSavePreferences(updated);
    }
  };

  const updateNotificationPreference = (key: string, value: boolean) => {
    if (preferences) {
      const updated = {
        ...preferences,
        notifications: {
          ...preferences.notifications,
          [key]: value
        }
      };
      handleSavePreferences(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="my-8">
        <h1 className="text-3xl font-bold mb-4">
          Configurações
        </h1>
        <hr className="mb-8" />

        {/* DEBUG: Verificar se está renderizando */}
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✅ COMPONENTE FUNCIONANDO! Aba do Telegram está aqui embaixo! 👇
        </div>        {/* Sistema de abas simplificado */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('account')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Conta
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Preferências
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sync'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sincronização
            </button>
          </nav>
        </div>

        {/* Conteúdo das abas */}
        {activeTab === 'account' && (
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
              <CardDescription>
                Visualize as informações da sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Nome de usuário</span>
                    <span>{user.user_metadata?.username || user.email?.split('@')[0] || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Email</span>
                    <span>{user.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">ID do Usuário</span>
                    <span className="text-xs text-muted-foreground">{user.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Criado em</span>
                    <span>{user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <p>Nenhum usuário logado.</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'preferences' && (
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Usuário</CardTitle>
              <CardDescription>
                Personalize sua experiência no aplicativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tema */}
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-base font-medium">Tema</Label>
                <Select value={preferences?.theme || 'system'} onValueChange={(value) => updatePreference('theme', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Sun className="mr-2 h-4 w-4" />
                        Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Moon className="mr-2 h-4 w-4" />
                        Escuro
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center">
                        <Monitor className="mr-2 h-4 w-4" />
                        Sistema
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Moeda */}
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-base font-medium">Moeda</Label>
                <Select value={preferences?.currency || 'BRL'} onValueChange={(value) => updatePreference('currency', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma moeda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Real (R$)
                      </div>
                    </SelectItem>
                    <SelectItem value="USD">
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Dólar ($)
                      </div>
                    </SelectItem>
                    <SelectItem value="EUR">
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Euro (€)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Formato de Data */}
              <div className="space-y-2">
                <Label htmlFor="dateFormat" className="text-base font-medium">Formato de Data</Label>
                <Select value={preferences?.dateFormat || 'DD/MM/YYYY'} onValueChange={(value) => updatePreference('dateFormat', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        DD/MM/YYYY
                      </div>
                    </SelectItem>
                    <SelectItem value="MM/DD/YYYY">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        MM/DD/YYYY
                      </div>
                    </SelectItem>
                    <SelectItem value="YYYY-MM-DD">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        YYYY-MM-DD
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notificações */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications-email" className="text-sm font-normal">
                      Notificações por email
                    </Label>                    <Switch
                      id="notifications-email"
                      checked={preferences?.notifications?.emailNotifications || false}
                      onCheckedChange={(value) => updateNotificationPreference('emailNotifications', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications-push" className="text-sm font-normal">
                      Notificações push
                    </Label>                    <Switch
                      id="notifications-push"
                      checked={preferences?.notifications?.pushNotifications || false}
                      onCheckedChange={(value) => updateNotificationPreference('pushNotifications', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications-bills" className="text-sm font-normal">
                      Lembrete de contas
                    </Label>                    <Switch
                      id="notifications-bills"
                      checked={preferences?.notifications?.billsDueSoon || false}
                      onCheckedChange={(value) => updateNotificationPreference('billsDueSoon', value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}        {activeTab === 'sync' && (
          <Card>
            <CardHeader>
              <CardTitle>Sincronização</CardTitle>
              <CardDescription>
                Gerencie a sincronização dos seus dados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Funcionalidades de sincronização em desenvolvimento.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
