import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import { isLoggedIn, getUserPreferences, saveUserPreferences, saveSupabaseUserPreferences } from '@/utils/localStorage';
import { clearAllNotifications } from '@/utils/clearAllNotifications';
import { 
  Sun, Moon, Bell, Languages, DollarSign, 
  Calendar, Paintbrush, Save, UserCircle2, Trash2, MessageCircle, Crown, XCircle, Mail, Loader2,
  BellRing, Smartphone
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
import { UserPlanManager } from '@/utils/userPlanManager';
import { PlanType } from '@/types';
import { 
  requestNotificationPermission, 
  getNotificationPermissionStatus,
  isPushSupported,
  rescheduleAllBillNotifications 
} from '@/utils/pushNotifications';
import PremiumModal from '@/components/PremiumModal';

const PreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { signOut, user } = useAuth();
  
  // Estados para gerenciar assinatura PRO
  const [isProUser, setIsProUser] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
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
    
    // Verificar plano do usuário
    const checkPlan = async () => {
      if (user?.id) {
        try {
          const plan = await UserPlanManager.getUserPlan(user.id);
          setIsProUser(plan.planType !== PlanType.FREE);
        } catch (err) {
          console.error('Erro ao verificar plano:', err);
        }
      }
    };
    checkPlan();
    
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
  
  // Funções para gerenciar assinatura PRO
  const handleCancelSubscription = async () => {
    if (!user?.email) {
      toast({
        title: 'Erro',
        description: 'Usuário não encontrado',
        variant: 'destructive'
      });
      return;
    }

    const confirmed = window.confirm(
      'Tem certeza que deseja cancelar sua assinatura PRO?\n\n' +
      'Você continuará tendo acesso até o fim do período pago.'
    );

    if (!confirmed) return;

    setCancellingSubscription(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId: user.id,
            userEmail: user.email,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Assinatura cancelada',
          description: 'Você ainda tem acesso PRO até o fim do período atual.',
        });
      } else {
        toast({
          title: 'Erro ao cancelar',
          description: data.message || 'Tente novamente mais tarde',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível processar. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Suporte Stater PRO');
    const body = encodeURIComponent(`Olá equipe Stater,

Sou assinante PRO e gostaria de:

[ ] Solicitar reembolso (estou dentro dos 7 dias)
[ ] Reportar problema técnico
[ ] Outra questão

Email da conta: ${user?.email || ''}

Descreva seu problema:


Obrigado!`);
    
    window.open(`mailto:support@stater.app?subject=${subject}&body=${body}`, '_blank');
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-20 lg:pb-8 bg-[#31518b] lg:bg-transparent" style={{ color: 'white' }}>
      {/* Desktop Title */}
      <div className="hidden lg:block w-full px-6 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="text-white/60 mt-1">Personalize sua experiência no Stater</p>
      </div>
      
      {/* Mobile: Layout tradicional | Desktop: Grid 2 colunas */}
      <div className="w-full p-4 lg:px-6">
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
          
          {/* Coluna 1 */}
          <div className="space-y-4">
            {/* Sobre sua conta */}
            <div className="rounded-xl shadow-md bg-white/10 backdrop-blur-xl border border-white/20 p-5">
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
                  <span className="text-white font-medium text-sm truncate max-w-[200px]">{getCurrentUser()?.email}</span>
                </div>
              </div>
            </div>

            {/* Moeda */}
            <div className="rounded-xl shadow-md bg-white/10 backdrop-blur-xl border border-white/20 p-5">
              <h2 className="text-base font-semibold text-white mb-3 flex items-center">
                <DollarSign size={18} className="mr-2" /> {t('currency')}
              </h2>
              <div className="mb-3">
                <label className="block text-white font-medium mb-1 text-sm">Selecione sua moeda</label>
                <select
                  className="w-full rounded-lg border border-white/20 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                  value={preferences.currency}
                  onChange={e => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                >
                  {CURRENCIES.map(cur => (
                    <option key={cur.code} value={cur.code} style={{ background: '#1e3a5f', color: 'white' }}>
                      {cur.symbol} - {cur.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-cents" className="cursor-pointer text-white">{t('showCents')}</Label>
                <Switch 
                  id="show-cents" 
                  checked={preferences.showCents}
                  onCheckedChange={() => handleSwitchChange('showCents')}
                />
              </div>
            </div>

            {/* Assinatura PRO */}
            <div className="rounded-xl shadow-md bg-white/10 backdrop-blur-xl border border-white/20 p-5">
              <h2 className="text-base font-semibold text-white mb-3 flex items-center">
                <Crown size={18} className="mr-2 text-yellow-400" /> Assinatura PRO
              </h2>
              
              {isProUser ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                    <span className="text-green-300 font-medium">Status</span>
                    <span className="text-green-400 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Ativo
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full border-white/20 bg-white/5 text-white/80 hover:bg-white/10 text-sm"
                    onClick={handleContactSupport}
                  >
                    <Mail size={14} className="mr-2" />
                    Suporte / Reembolso
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-red-400/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm"
                    onClick={handleCancelSubscription}
                    disabled={cancellingSubscription}
                  >
                    {cancellingSubscription ? (
                      <><Loader2 size={14} className="mr-2 animate-spin" /> Cancelando...</>
                    ) : (
                      <><XCircle size={14} className="mr-2" /> Cancelar assinatura</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-white/70 text-sm">
                    Você está no plano gratuito. Assine o PRO para desbloquear todas as funcionalidades!
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                    onClick={() => setShowPremiumModal(true)}
                  >
                    <Crown size={16} className="mr-2" />
                    Assinar PRO - R$ 14,90/mês
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-4">
            {/* Notificações */}
            <div className="rounded-xl shadow-md bg-white/10 backdrop-blur-xl border border-white/20 p-5">
              <h2 className="text-base font-semibold text-white mb-3 flex items-center">
                <Bell size={18} className="mr-2 text-white" /> {t('notifications')}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-white/70" />
                    <Label htmlFor="enable-push" className="cursor-pointer text-white text-sm">
                      Notificações Push
                    </Label>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/20 text-xs px-3"
                    onClick={async () => {
                      try {
                        const supported = isPushSupported();
                        if (!supported) {
                          toast({ title: 'Não suportado', description: 'Seu dispositivo não suporta notificações push', variant: 'destructive' });
                          return;
                        }
                        const status = await getNotificationPermissionStatus();
                        if (status === 'granted') {
                          toast({ title: '✅ Já ativado!', description: 'Notificações push já estão ativas' });
                          return;
                        }
                        const granted = await requestNotificationPermission();
                        if (granted) {
                          await rescheduleAllBillNotifications();
                          toast({ title: '🔔 Ativado!', description: 'Você receberá lembretes de suas contas' });
                        } else {
                          toast({ title: 'Permissão negada', description: 'Ative nas configurações do navegador/app', variant: 'destructive' });
                        }
                      } catch (error) {
                        toast({ title: 'Erro', description: 'Não foi possível ativar notificações', variant: 'destructive' });
                      }
                    }}
                  >
                    <BellRing size={12} className="mr-1" /> Ativar
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-notifications" className="cursor-pointer text-white text-sm">
                    Notificações no app
                  </Label>
                  <Switch 
                    id="enable-notifications" 
                    checked={preferences.enableNotifications}
                    onCheckedChange={() => setPreferences(prev => ({ ...prev, enableNotifications: !prev.enableNotifications }))}
                  />
                </div>
                
                <Button
                  variant="outline"
                  className="w-full border border-red-400/50 text-red-400 hover:bg-red-500/10 text-sm"
                  onClick={async () => {
                    try {
                      toast({ title: 'Limpando notificações...', description: 'Aguarde...' });
                      const success = await clearAllNotifications();
                      toast({
                        title: success ? 'Notificações excluídas!' : 'Erro ao excluir',
                        description: success ? 'Todas as notificações foram excluídas.' : 'Tente novamente.',
                        variant: success ? 'default' : 'destructive'
                      });
                    } catch (error) {
                      toast({ title: 'Erro', description: 'Tente novamente mais tarde.', variant: 'destructive' });
                    }
                  }}
                >
                  <Trash2 size={14} className="mr-2" /> Limpar notificações
                </Button>
              </div>
            </div>

            {/* Idioma */}
            <div className="rounded-xl shadow-md bg-white/10 backdrop-blur-xl border border-white/20 p-5">
              <h2 className="text-base font-semibold text-white mb-3 flex items-center">
                <Languages size={18} className="mr-2" /> {t('language')}
              </h2>
              <div className="flex space-x-3">
                <Button variant="default" className="flex-1 cursor-default bg-white/20 text-white border-white/30 hover:bg-white/30 text-sm">Português</Button>
                <Button variant="outline" disabled className="flex-1 opacity-50 bg-white/10 text-white/50 border-white/20 text-sm">English</Button>
              </div>
            </div>

            {/* Salvar Preferências */}
            <Button 
              onClick={handleSavePreferences}
              className="w-full text-white hover:opacity-90"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Save size={16} className="mr-2" /> {t('savePreferences')}
            </Button>
          </div>
        </div>
        
        {/* Botão Sair - fora do grid */}
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 mt-6">
          <Button
            variant="outline"
            className="w-full lg:w-auto border border-red-400 bg-white/5 backdrop-blur-[8px] text-red-400 hover:bg-red-400/10 font-semibold"
            onClick={async () => {
              try {
                localStorage.setItem('manual_logout', 'true');
                window.dispatchEvent(new CustomEvent('force-stop-terms-check'));
                window.dispatchEvent(new CustomEvent('force-stop-onboarding-check'));
                await new Promise(resolve => setTimeout(resolve, 500));
                try {
                  const { stopAutoSync } = await import('@/utils/localStorage');
                  stopAutoSync();
                } catch (error) {}
                localStorage.clear();
                sessionStorage.clear();
                localStorage.setItem('manual_logout', 'true');
                try { await signOut(); } catch (error) {}
                await new Promise(resolve => setTimeout(resolve, 200));
                window.location.replace('/login');
              } catch (error) {
                localStorage.clear();
                sessionStorage.clear();
                localStorage.setItem('manual_logout', 'true');
                setTimeout(() => window.location.replace('/login'), 500);
              }
            }}
          >
            Sair da conta
          </Button>
        </div>
      </div>

      {/* Modal Premium */}
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </div>
  );
};

export default PreferencesPage;
