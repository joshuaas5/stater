import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { isLoggedIn, getUserPreferences, saveUserPreferences, saveSupabaseUserPreferences } from '@/utils/localStorage';
import { clearAllNotifications } from '@/utils/clearAllNotifications';
import { 
  Sun, Moon, Bell, Languages, DollarSign, 
  Calendar, Paintbrush, Save, UserCircle2, Star, Trash2, FileText, MessageCircle
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
    weekStartsOn: 'sunday',
    showCents: true,
    showRecurringBadges: true,
    showTransactionCategories: true,
    enableNotifications: true,
    notifications: {
      pushNotifications: true,
      inAppNotifications: true,
      emailNotifications: true,
      billsDueSoon: true,
      billsOverdue: true,
      largeTransactions: true,
      weeklyEmailSummary: true
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
      // Garantir que o objeto notifications exista
      const updatedPreferences = {
        ...savedPreferences,
        notifications: savedPreferences.notifications || {
          pushNotifications: true,
          inAppNotifications: true,
          emailNotifications: true,
          billsDueSoon: true,
          billsOverdue: true,
          largeTransactions: true,
          weeklyEmailSummary: true
        }
      };
      
      setPreferences(prev => ({
        ...prev,
        ...updatedPreferences
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
    
    // Show success toast instead of forcing reload
    toast({
      title: 'Idioma alterado!',
      description: 'Suas preferências de idioma foram salvas.',
      variant: 'default',
    });
  };
  
  const handleSavePreferences = async () => {
    // Salvar localmente
    saveUserPreferences(preferences);
    
    // Salvar no Supabase
    try {
      await saveSupabaseUserPreferences(preferences);
      toast({
        title: 'Preferências salvas!',
        description: 'Suas preferências foram salvas com sucesso.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast({
        title: 'Erro ao salvar preferências',
        description: 'Ocorreu um erro ao salvar suas preferências. Tente novamente mais tarde.',
        variant: 'destructive',
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
    <div className="min-h-screen flex flex-col items-center pb-20" style={{ background: '#31518b', color: 'white' }}>
      <div className="w-full max-w-md p-4 space-y-6">
      <div className="rounded-xl shadow-md bg-white/10 backdrop-blur-xl border border-white/20 p-5 mb-4">
        <h2 className="text-base font-semibold text-white mb-3 flex items-center">
          <UserCircle2 size={18} className="mr-2 text-white" /> {t('aboutYourAccount')}
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/80">Nome de usuário</span>
            <span className="text-white font-medium">{getCurrentUser()?.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/80">Email</span>
            <span className="text-white font-medium">{getCurrentUser()?.email}</span>
          </div>
        </div>
      </div>
        <div className="rounded-xl shadow-md bg-white/10 backdrop-blur-xl border border-white/20 p-5 mb-4">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center">
            <Paintbrush size={18} className="mr-2 text-white" /> {t('theme')}
          </h2>
          <div className="flex space-x-4">
            <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => handleThemeChange('light')} className="flex-1 flex items-center justify-center bg-white/10 border-white/20 text-white hover:bg-white/20"><Sun size={16} className="mr-1" />{t('light')}</Button>
            <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => handleThemeChange('dark')} className="flex-1 flex items-center justify-center bg-white/10 border-white/20 text-white hover:bg-white/20"><Moon size={16} className="mr-1" />{t('dark')}</Button>
          </div>
        </div>

        <div className="rounded-xl shadow-md bg-white/10 backdrop-blur-xl border border-white/20 p-5 mb-4">
          <h2 className="text-base font-semibold text-white mb-3 flex items-center">
            <Bell size={18} className="mr-2 text-white" /> {t('notifications')}
          </h2>
          
          <div className="space-y-4">
            {/* Switch simples para permitir notificações */}
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-notifications" className="cursor-pointer">Permitir notificações</Label>
              <Switch 
                id="enable-notifications" 
                checked={preferences.enableNotifications}
                onCheckedChange={() => {
                  setPreferences(prev => ({
                    ...prev,
                    enableNotifications: !prev.enableNotifications
                  }));
                }}
              />
            </div>
            
            {/* Botão para limpar todas as notificações */}
            <div className="pt-2">
              <Button
                variant="outline"
                className="w-full border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center"
                onClick={async () => {
                  try {
                    toast({
                      title: 'Limpando notificações...',
                      description: 'Aguarde enquanto excluímos todas as suas notificações.'
                    });
                    
                    const success = await clearAllNotifications();
                    
                    toast({
                      title: success ? 'Notificações excluídas!' : 'Erro ao excluir notificações',
                      description: success ? 'Todas as suas notificações foram excluídas com sucesso.' : 'Ocorreu um erro ao tentar excluir suas notificações.',
                      variant: success ? 'default' : 'destructive'
                    });
                  } catch (error) {
                    console.error('Erro ao limpar notificações:', error);
                    toast({
                      title: 'Erro ao excluir notificações',
                      description: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
                      variant: 'destructive'
                    });
                  }
                }}
              >
                <Trash2 size={16} className="mr-2" /> Limpar todas as notificações
              </Button>
            </div>
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
            <Languages size={18} className="mr-2" /> {t('language')}
          </h2>
          <div className="flex space-x-4">
            <Button variant="default" className="flex-1 cursor-default">Português</Button>
            <Button variant="outline" disabled className="flex-1 opacity-50">English (em breve)</Button>
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
        <div className="space-y-3">          <Button 
            variant="outline"
            className="w-full border border-galileo-accent text-galileo-accent hover:bg-galileo-accent/10"
            onClick={() => navigate('/analise-financeira')}
          >
            <Star size={16} className="mr-2" /> Acessar Análise Financeira
          </Button>
          
          <Button 
            variant="outline"
            className="w-full border border-galileo-accent text-galileo-accent hover:bg-galileo-accent/10"
            onClick={() => navigate('/export-report')}
          >
            <FileText size={16} className="mr-2" /> Exportar relatório financeiro
          </Button>
        </div>
      </div>
      
      {/* SEÇÃO TELEGRAM - MOVIDA PARA DEPOIS DOS RECURSOS ADICIONAIS */}
      <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5 mb-4">
        <h2 className="text-base font-semibold text-galileo-text mb-3 flex items-center">
          <MessageCircle size={18} className="mr-2" /> Bot Telegram
        </h2>
        <div className="space-y-3">
          <p className="text-sm text-galileo-secondaryText">
            Conecte sua conta ao nosso bot do Telegram para receber análises de extratos e conversar sobre suas finanças.
          </p>
          
          <div className="bg-galileo-background p-3 rounded-lg border border-galileo-border">
            <p className="text-xs text-galileo-secondaryText mb-2">🤖 <strong>@assistentefinanceiroiabot</strong> (STATER IA)</p>
            <p className="text-xs text-galileo-secondaryText mb-3">
              • Análise automática de extratos bancários<br/>
              • Chat inteligente sobre suas finanças<br/>
              • Notificações de contas vencendo
            </p>
            
            <Button 
              variant="outline"
              className="w-full border border-blue-500 text-blue-500 hover:bg-blue-50"
              onClick={() => navigate('/settings/telegram')}
            >
              <MessageCircle size={16} className="mr-2" /> Configurar Telegram
            </Button>
          </div>
        </div>
      </div>
      
      <div className="pt-2 pb-4">
        <Button
          variant="outline"
          className="w-full border border-red-500 text-red-500 hover:bg-red-50 font-semibold"
          onClick={async () => {
            try {
              console.log('🚪 [LOGOUT] Iniciando processo de logout...');
              
              // PASSO 1: Marcar logout manual ANTES de qualquer operação
              localStorage.setItem('manual_logout', 'true');
              console.log('🚪 [LOGOUT] Marcado como logout manual');
              
              // PASSO 2: Parar TODAS as verificações em execução
              window.dispatchEvent(new CustomEvent('force-stop-terms-check'));
              window.dispatchEvent(new CustomEvent('force-stop-onboarding-check'));
              console.log('🚪 [LOGOUT] Eventos de parada enviados');
              
              // PASSO 3: Aguardar mais tempo para garantir que os hooks processem
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // PASSO 4: Parar sincronização automática se estiver rodando
              try {
                const { stopAutoSync } = await import('@/utils/localStorage');
                stopAutoSync();
                console.log('🚪 [LOGOUT] Sincronização automática parada');
              } catch (error) {
                console.log('🚪 [LOGOUT] Erro ao parar sync (ignorado):', error);
              }
              
              // PASSO 5: Limpar TUDO imediatamente
              localStorage.clear();
              sessionStorage.clear();
              
              // PASSO 6: Remarcar logout após limpeza (para AuthContext)
              localStorage.setItem('manual_logout', 'true');
              console.log('🚪 [LOGOUT] Cache local limpo e logout remarcado');
              
              // PASSO 7: Fazer logout do Supabase (pode falhar, mas não importa)
              try {
                await signOut();
                console.log('🚪 [LOGOUT] Logout do Supabase executado');
              } catch (error) {
                console.log('🚪 [LOGOUT] Erro no logout do Supabase (ignorado):', error);
              }
              
              // PASSO 8: Aguardar um pouco antes de redirecionar
              await new Promise(resolve => setTimeout(resolve, 200));
              
              // PASSO 9: Redirecionar IMEDIATAMENTE usando replace
              console.log('🚪 [LOGOUT] Redirecionando para login...');
              window.location.replace('/login');
              
            } catch (error) {
              console.error('🚪 [LOGOUT] Erro geral:', error);
              
              // FALLBACK: Mesmo com erro, limpar e redirecionar
              localStorage.clear();
              sessionStorage.clear();
              localStorage.setItem('manual_logout', 'true');
              
              // Aguardar e redirecionar
              setTimeout(() => {
                window.location.replace('/login');
              }, 500);
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
