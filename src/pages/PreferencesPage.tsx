import React, { useEffect, useState } from 'react';
import { requestWeeklySummary } from '@/utils/emailNotifications';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { isLoggedIn, getUserPreferences, saveUserPreferences, saveSupabaseUserPreferences } from '@/utils/localStorage';
import { 
  Sun, Moon, Bell, Languages, DollarSign, 
  Calendar, Paintbrush, Save, UserCircle2, Star, Mail
} from 'lucide-react';
import { CURRENCIES, suggestCurrencyByCountry } from '@/utils/currencies';
import { getCurrentUser } from '@/utils/localStorage';
import { useTheme } from '@/contexts/ThemeContext';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/contexts/AuthContext';

const PreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  
  const [preferences, setPreferences] = useState({
    theme: 'dark' as 'light' | 'dark' | 'system',
    language: 'pt-BR',
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    weekStartsOn: 'monday',
    showCents: true,
    showRecurringBadges: true,
    showTransactionCategories: true,
    notifications: {
      billsDueSoon: true,
      billsOverdue: true,
      largeTransactions: true,
      weeklyEmailSummary: true,
      pushNotifications: true,
      inAppNotifications: true,
      emailNotifications: true
    }
  });
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    // Detectar país e sugerir moeda se não houver preferência
    if (!preferences.currency || preferences.currency === 'USD') {
      try {
        const locale = navigator.language || 'en-US';
        // Tenta obter o país pelo locale
        const country = locale.split('-')[1] || 'US';
        const suggested = suggestCurrencyByCountry(country);
        if (suggested !== preferences.currency) {
          setPreferences(prev => ({ ...prev, currency: suggested }));
        }
      } catch {}
    }
    // Carregar preferências salvas
    const savedPreferences = getUserPreferences();
    if (Object.keys(savedPreferences).length > 0) {
      setPreferences(prev => ({
        ...prev,
        ...savedPreferences
      }));
    }
  }, [navigate]);
  
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };
  
  const handleLanguageChange = (value: string) => {
    const newPreferences = {
      ...preferences,
      language: value,
    };
    
    // If language is changed to English, also update currency to USD
    if (value === 'en-US') {
      newPreferences.currency = 'USD';
    }
    
    setPreferences(newPreferences);
    saveUserPreferences(newPreferences);
    
    // Force reload to apply translations
    window.location.reload();
  };
  
  const handleSavePreferences = async () => {
    // Salvar localmente
    saveUserPreferences(preferences);
    
    // Salvar no Supabase
    try {
      await saveSupabaseUserPreferences(preferences);
      toast({
        title: t('preferencesUpdated'),
        description: "Suas preferências foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast({
        title: 'Erro ao salvar preferências',
        description: 'Ocorreu um erro ao salvar suas preferências. Tente novamente.',
        variant: 'destructive'
      });
    }
  };
  
  const handleSwitchChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  return (
    <div className="bg-galileo-background min-h-screen flex flex-col items-center pb-20">
      <div className="w-full max-w-md p-4 space-y-6">
      <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5 mb-4">
        <h2 className="text-base font-semibold text-galileo-text mb-3 flex items-center">
          <UserCircle2 size={18} className="mr-2" /> {t('aboutYourAccount')}
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-galileo-text">Nome de usuário</span>
            <span className="text-galileo-secondaryText font-medium">{getCurrentUser()?.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-galileo-text">Email</span>
            <span className="text-galileo-secondaryText font-medium">{getCurrentUser()?.email}</span>
          </div>
        </div>
      </div>
        <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5 mb-4">
          <h2 className="text-base font-semibold text-galileo-text mb-3 flex items-center">
            <Paintbrush size={18} className="mr-2" /> {t('theme')}
          </h2>
          <div className="flex space-x-4">
            <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => handleThemeChange('light')} className="flex-1 flex items-center justify-center"><Sun size={16} className="mr-1" />{t('light')}</Button>
            <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => handleThemeChange('dark')} className="flex-1 flex items-center justify-center"><Moon size={16} className="mr-1" />{t('dark')}</Button>
          </div>
        </div>

        <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5 mb-4">
          <h2 className="text-base font-semibold text-galileo-text mb-3 flex items-center">
            <Bell size={18} className="mr-2" /> {t('notifications')}
          </h2>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-galileo-text mb-2">Canais de notificação</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="cursor-pointer">Notificações push</Label>
                <Switch 
                  id="push-notifications" 
                  checked={preferences.notifications.pushNotifications}
                  onCheckedChange={() => {
                    setPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        pushNotifications: !prev.notifications.pushNotifications
                      }
                    }));
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="in-app-notifications" className="cursor-pointer">Notificações no aplicativo</Label>
                <Switch 
                  id="in-app-notifications" 
                  checked={preferences.notifications.inAppNotifications}
                  onCheckedChange={() => {
                    setPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        inAppNotifications: !prev.notifications.inAppNotifications
                      }
                    }));
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="cursor-pointer">Notificações por email</Label>
                <Switch 
                  id="email-notifications" 
                  checked={preferences.notifications.emailNotifications}
                  onCheckedChange={() => {
                    setPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        emailNotifications: !prev.notifications.emailNotifications
                      }
                    }));
                  }}
                />
                {preferences.notifications.emailNotifications && (
                  <div className="mt-2 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          toast({
                            title: "Enviando email de teste...",
                            description: "Aguarde enquanto enviamos um resumo semanal para seu email.",
                          });
                          
                          const result = await requestWeeklySummary();
                          
                          toast({
                            title: result.success ? "Email enviado!" : "Erro ao enviar email",
                            description: result.message,
                            variant: result.success ? "default" : "destructive",
                          });
                        } catch (error) {
                          toast({
                            title: "Erro ao enviar email",
                            description: "Ocorreu um erro ao tentar enviar o email de teste.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Testar email semanal
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-galileo-text mb-2">Tipos de notificação</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-bills" className="cursor-pointer">Contas a vencer em breve</Label>
                <Switch 
                  id="notifications-bills" 
                  checked={preferences.notifications.billsDueSoon}
                  onCheckedChange={() => {
                    setPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        billsDueSoon: !prev.notifications.billsDueSoon
                      }
                    }));
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-overdue" className="cursor-pointer">Contas vencidas</Label>
                <Switch 
                  id="notifications-overdue" 
                  checked={preferences.notifications.billsOverdue}
                  onCheckedChange={() => {
                    setPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        billsOverdue: !prev.notifications.billsOverdue
                      }
                    }));
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-transactions" className="cursor-pointer">Grandes transações</Label>
                <Switch 
                  id="notifications-transactions" 
                  checked={preferences.notifications.largeTransactions}
                  onCheckedChange={() => {
                    setPreferences(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        largeTransactions: !prev.notifications.largeTransactions
                      }
                    }));
                  }}
                />
              </div>
              
              <div className="flex items-start justify-between p-1 rounded-md hover:bg-galileo-hover transition-colors duration-150">
                <div className="flex-1">
                  <label htmlFor="weeklyEmailSummary" className="block text-sm font-medium text-galileo-text cursor-pointer">
                    Resumo semanal por email
                  </label>
                  <p className="text-xs text-galileo-secondaryText">
                    Receba um resumo das suas contas a vencer e transações recentes toda semana.
                  </p>
                </div>
                <div className="ml-2 pt-0.5">
                  <Switch
                    id="weeklyEmailSummary"
                    checked={preferences.notifications.weeklyEmailSummary}
                    onCheckedChange={(checked) => {
                      setPreferences((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, weeklyEmailSummary: checked },
                      }));
                    }}
                  />
                </div>
              </div>
              {preferences.notifications.weeklyEmailSummary && preferences.notifications.emailNotifications && (
                <div className="mt-1 ml-6 text-xs text-galileo-secondaryText">
                  <p>Você receberá um resumo semanal com suas transações e contas a vencer.</p>
                </div>
              )}
              {preferences.notifications.weeklyEmailSummary && !preferences.notifications.emailNotifications && (
                <div className="mt-1 ml-6 text-xs text-galileo-negative">
                  <p>Ative as notificações por email acima para receber o resumo semanal.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="show-recurring-badges" className="cursor-pointer">{t('showRecurringIndicator')}</Label>
            <Switch 
              id="show-recurring-badges" 
              checked={preferences.showRecurringBadges}
              onCheckedChange={() => handleSwitchChange('showRecurringBadges')}
            />
          </div>
        </div>
          
        <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5 mb-4">
          <h2 className="text-base font-semibold text-galileo-text mb-3 flex items-center">
            <DollarSign size={18} className="mr-2" /> {t('currency')}
          </h2>
          <div className="mb-2">
            <label className="block text-galileo-text font-medium mb-1">Selecione sua moeda</label>
            <select
              className="w-full rounded-lg border border-galileo-border py-2 px-3 bg-galileo-background text-galileo-text focus:outline-none focus:ring-2 focus:ring-galileo-accent"
              value={preferences.currency}
              onChange={e => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
            >
              {CURRENCIES.map(cur => (
                <option key={cur.code} value={cur.code}>
                  {cur.symbol} - {cur.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-cents" className="cursor-pointer">{t('showCents')}</Label>
            <Switch 
              id="show-cents" 
              checked={preferences.showCents}
              onCheckedChange={() => handleSwitchChange('showCents')}
            />
          </div>
        </div>
          
        <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5 mb-4">
          <h2 className="text-base font-semibold text-galileo-text mb-3 flex items-center">
            <Calendar size={18} className="mr-2" /> {t('startOfWeek')}
          </h2>
          <div className="flex space-x-4">
            <Button variant={preferences.weekStartsOn === 'monday' ? 'default' : 'outline'} onClick={() => setPreferences(prev => ({ ...prev, weekStartsOn: 'monday' }))} className="flex-1">{t('monday')}</Button>
            <Button variant={preferences.weekStartsOn === 'sunday' ? 'default' : 'outline'} onClick={() => setPreferences(prev => ({ ...prev, weekStartsOn: 'sunday' }))} className="flex-1">{t('sunday')}</Button>
          </div>
        </div>
          
        <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5 mb-4">
          <h2 className="text-base font-semibold text-galileo-text mb-3 flex items-center">
            <Languages size={18} className="mr-2" /> {t('language')}
          </h2>
          <div className="flex space-x-4">
            <Button variant={preferences.language === 'pt-BR' ? 'default' : 'outline'} onClick={() => handleLanguageChange('pt-BR')} className="flex-1">Português</Button>
            <Button variant={preferences.language === 'en-US' ? 'default' : 'outline'} onClick={() => handleLanguageChange('en-US')} className="flex-1">English</Button>
          </div>
        </div>
          
        <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5 mb-4">
          <h2 className="text-base font-semibold text-galileo-text mb-3 flex items-center">
            <Bell size={18} className="mr-2" /> Notificações por Email
          </h2>
          <div className="space-y-3">
            <p className="text-sm text-galileo-text mb-2">
              Teste o envio de emails ou solicite um resumo semanal das suas finanças.
            </p>
            <div className="flex flex-col space-y-2">
              <Button 
                variant="outline"
                className="w-full border border-galileo-accent text-galileo-accent hover:bg-galileo-accent/10"
                onClick={async () => {
                  try {
                    toast({
                      title: 'Enviando email de teste...',
                      description: 'Aguarde enquanto processamos sua solicitação.'
                    });
                    
                    const { success, message } = await requestWeeklySummary();
                    
                    toast({
                      title: success ? 'Email enviado!' : 'Erro ao enviar email',
                      description: message,
                      variant: success ? 'default' : 'destructive'
                    });
                  } catch (error) {
                    console.error('Erro ao solicitar email:', error);
                    toast({
                      title: 'Erro ao enviar email',
                      description: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
                      variant: 'destructive'
                    });
                  }
                }}
                disabled={!preferences.notifications.emailNotifications || !preferences.notifications.weeklyEmailSummary}
              >
                <Mail size={16} className="mr-2" /> Solicitar resumo semanal agora
              </Button>
              {(!preferences.notifications.emailNotifications || !preferences.notifications.weeklyEmailSummary) && (
                <p className="text-xs text-red-500 italic">
                  Para solicitar emails, ative as notificações por email e resumos semanais nas configurações acima.
                </p>
              )}
            </div>
          </div>
        </div>
          
        <div className="pt-2 pb-2">
          <Button 
            onClick={handleSavePreferences}
            className="w-full bg-galileo-accent hover:bg-galileo-accent/80 text-white"
          >
            <Save size={16} className="mr-2" /> {t('savePreferences')}
          </Button>
        </div>
      </div>
      
      <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5 mb-4">
        <h2 className="text-base font-semibold text-galileo-text mb-3 flex items-center">
          <Star size={18} className="mr-2" /> Recursos adicionais
        </h2>
        <div className="space-y-3">
          <Button 
            variant="outline"
            className="w-full border border-galileo-accent text-galileo-accent hover:bg-galileo-accent/10"
            onClick={() => navigate('/recomendacoes')}
          >
            <Star size={16} className="mr-2" /> Acessar recomendações financeiras
          </Button>
        </div>
      </div>
      
      <div className="pt-2 pb-4">
        <Button
          variant="outline"
          className="w-full border border-red-500 text-red-500 hover:bg-red-50 font-semibold"
          onClick={async () => {
            try {
              // Desabilitar navegação automática para o dashboard no AuthContext
              localStorage.setItem('manual_logout', 'true');
              // Fazer logout
              await signOut();
              // Pequeno atraso para garantir que o logout seja processado
              setTimeout(() => {
                // Remover o item após o redirecionamento
                localStorage.removeItem('manual_logout');
                // Redirecionar para a página de login
                window.location.href = '/login';
              }, 500);
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
            }
          }}
        >
          Sair da conta
        </Button>
      </div>
      <NavBar />
    </div>
  );
};

export default PreferencesPage;
