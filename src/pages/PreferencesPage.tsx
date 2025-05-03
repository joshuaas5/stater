
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { isLoggedIn, getUserPreferences, saveUserPreferences } from '@/utils/localStorage';
import { 
  Sun, Moon, Bell, Languages, DollarSign, 
  Calendar, Paintbrush, Save
} from 'lucide-react';
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
    notificationsEnabled: true,
    language: 'pt-BR',
    currency: 'BRL',
    weekStartsOn: 'monday',
    showCents: true,
    showRecurringBadges: true,
    showTransactionCategories: true,

  });
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
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
  
  const handleSavePreferences = () => {
    saveUserPreferences(preferences);
    
    toast({
      title: t('preferencesUpdated'),
      description: ""
    });
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
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="notifications-enabled" className="cursor-pointer">{t('enableNotifications')}</Label>
            <Switch 
              id="notifications-enabled" 
              checked={preferences.notificationsEnabled}
              onCheckedChange={() => handleSwitchChange('notificationsEnabled')}
            />
          </div>
          {preferences.notificationsEnabled && (
            <div className="flex items-center justify-between">
              <Label htmlFor="show-recurring-badges" className="cursor-pointer">{t('showRecurringIndicator')}</Label>
              <Switch 
                id="show-recurring-badges" 
                checked={preferences.showRecurringBadges}
                onCheckedChange={() => handleSwitchChange('showRecurringBadges')}
              />
            </div>
          )}
        </div>
          
        <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5 mb-4">
          <h2 className="text-base font-semibold text-galileo-text mb-3 flex items-center">
            <DollarSign size={18} className="mr-2" /> {t('currency')}
          </h2>
          <div className="flex space-x-4 mb-2">
            <Button variant={preferences.currency === 'BRL' ? 'default' : 'outline'} onClick={() => setPreferences(prev => ({ ...prev, currency: 'BRL' }))} className="flex-1">R$ (Real)</Button>
            <Button variant={preferences.currency === 'USD' ? 'default' : 'outline'} onClick={() => setPreferences(prev => ({ ...prev, currency: 'USD' }))} className="flex-1">$ (Dólar)</Button>
            <Button variant={preferences.currency === 'EUR' ? 'default' : 'outline'} onClick={() => setPreferences(prev => ({ ...prev, currency: 'EUR' }))} className="flex-1">€ (Euro)</Button>
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
          
        <div className="pt-2 pb-2">
          <Button 
            onClick={handleSavePreferences}
            className="w-full bg-galileo-accent hover:bg-galileo-accent/80 text-white"
          >
            <Save size={16} className="mr-2" /> {t('savePreferences')}
          </Button>
        </div>
      </div>
      <div className="pt-2 pb-4">
        <Button
          variant="outline"
          className="w-full border border-red-500 text-red-500 hover:bg-red-50 font-semibold"
          onClick={async () => {
            await signOut();
            navigate('/login');
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
