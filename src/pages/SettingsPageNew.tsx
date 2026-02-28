import React, { useState, useEffect } from 'react';
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
    <div 
      className="min-h-screen relative overflow-x-hidden overflow-y-auto"
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.7) 0%, rgba(30, 64, 175, 0.8) 100%)',
        backgroundColor: '#f8fafc'
      }}
    >
      {/* Partículas reduzidas para leveza */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <div className="my-8">
          <div className="flex items-center space-x-3 mb-6">
            <img 
              src="/stater-logo-192.png" 
              alt="Stater Logo" 
              className="h-10 w-10 object-contain drop-shadow-lg"
            />
            <h1 
              className="text-3xl font-semibold text-white"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textShadow: 'rgba(0, 0, 0, 0.3) 1px 1px 2px',
                letterSpacing: '0.025em'
              }}
            >
              Configurações
            </h1>
          </div>
          <div className="h-px bg-white/20 mb-8"></div>

          {/* Sistema de abas glassmorphism */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-2 mb-6">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === 'account'
                    ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Conta
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === 'preferences'
                    ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Preferências
              </button>
            </nav>
          </div>

          {/* Conteúdo das abas */}
          {activeTab === 'account' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
              <div className="mb-6">
                <h2 
                  className="text-xl font-semibold text-white mb-2"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    textShadow: 'rgba(0, 0, 0, 0.3) 1px 1px 2px',
                    letterSpacing: '0.025em'
                  }}
                >
                  Informações do Usuário
                </h2>
                <p className="text-white/70">Visualize as informações da sua conta.</p>
              </div>
              <div className="space-y-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 px-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <span className="font-medium text-white">Nome de usuário</span>
                      <span className="text-white/80">{user.user_metadata?.username || user.email?.split('@')[0] || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <span className="font-medium text-white">Email</span>
                      <span className="text-white/80">{user.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <span className="font-medium text-white">ID do Usuário</span>
                      <span className="text-xs text-white/60">{user.id}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <span className="font-medium text-white">Criado em</span>
                      <span className="text-white/80">{user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 px-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-center">
                    <p className="text-white/70">Nenhum usuário logado.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6">
              <div className="mb-6">
                <h2 
                  className="text-xl font-semibold text-white mb-2"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    textShadow: 'rgba(0, 0, 0, 0.3) 1px 1px 2px',
                    letterSpacing: '0.025em'
                  }}
                >
                  Preferências do Usuário
                </h2>
                <p className="text-white/70">Personalize sua experiência no aplicativo.</p>
              </div>
              <div className="space-y-6">
                {/* Tema */}
                <div className="space-y-3">
                  <Label htmlFor="theme" className="text-base font-medium text-white">Tema</Label>
                  <Select value={preferences?.theme || 'system'} onValueChange={(value) => updatePreference('theme', value)}>
                    <SelectTrigger className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white">
                      <SelectValue placeholder="Selecione um tema" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
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
                <div className="space-y-3">
                  <Label htmlFor="currency" className="text-base font-medium text-white">Moeda</Label>
                  <Select value={preferences?.currency || 'BRL'} onValueChange={(value) => updatePreference('currency', value)}>
                    <SelectTrigger className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white">
                      <SelectValue placeholder="Selecione uma moeda" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
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
                <div className="space-y-3">
                  <Label htmlFor="dateFormat" className="text-base font-medium text-white">Formato de Data</Label>
                  <Select value={preferences?.dateFormat || 'DD/MM/YYYY'} onValueChange={(value) => updatePreference('dateFormat', value)}>
                    <SelectTrigger className="w-full bg-white/10 backdrop-blur-sm border-white/20 text-white">
                      <SelectValue placeholder="Selecione um formato" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
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
                  <h3 
                    className="text-lg font-medium text-white"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      textShadow: 'rgba(0, 0, 0, 0.3) 1px 1px 2px',
                      letterSpacing: '0.025em'
                    }}
                  >
                    Notificações
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 px-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <Label htmlFor="notifications-email" className="text-sm font-normal text-white">
                        Notificações por email
                      </Label>
                      <Switch
                        id="notifications-email"
                        checked={preferences?.notifications?.emailNotifications || false}
                        onCheckedChange={(value) => updateNotificationPreference('emailNotifications', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <Label htmlFor="notifications-push" className="text-sm font-normal text-white">
                        Notificações push
                      </Label>
                      <Switch
                        id="notifications-push"
                        checked={preferences?.notifications?.pushNotifications || false}
                        onCheckedChange={(value) => updateNotificationPreference('pushNotifications', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <Label htmlFor="notifications-bills" className="text-sm font-normal text-white">
                        Lembrete de contas
                      </Label>
                      <Switch
                        id="notifications-bills"
                        checked={preferences?.notifications?.billsDueSoon || false}
                        onCheckedChange={(value) => updateNotificationPreference('billsDueSoon', value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
