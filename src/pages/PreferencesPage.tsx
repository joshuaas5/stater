
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

const PreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [preferences, setPreferences] = useState({
    notificationsEnabled: true,
    language: 'pt-BR',
    currency: 'BRL',
    weekStartsOn: 'monday',
    showCents: true,
    showRecurringBadges: true,
    showTransactionCategories: true,
    compactMode: false,
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
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title={t('preferences')} showSearch={false} showBack />
      
      <div className="p-4 pb-20">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-galileo-text mb-2 flex items-center">
              <Paintbrush size={18} className="mr-2" /> {t('theme')}
            </h2>
            <div className="bg-galileo-card p-4 rounded-lg border border-galileo-border">
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">{t('theme')}</Label>
                <RadioGroup 
                  defaultValue={theme} 
                  onValueChange={(value) => handleThemeChange(value as 'light' | 'dark')}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-2 bg-galileo-background p-2 rounded border border-galileo-border flex-1 justify-center">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light" className="flex items-center cursor-pointer">
                      <Sun size={16} className="mr-1" /> {t('light')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-galileo-background p-2 rounded border border-galileo-border flex-1 justify-center">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark" className="flex items-center cursor-pointer">
                      <Moon size={16} className="mr-1" /> {t('dark')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode" className="cursor-pointer">{t('compactMode')}</Label>
                <Switch 
                  id="compact-mode" 
                  checked={preferences.compactMode}
                  onCheckedChange={() => handleSwitchChange('compactMode')}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-galileo-text mb-2 flex items-center">
              <Bell size={18} className="mr-2" /> {t('notifications')}
            </h2>
            <div className="bg-galileo-card p-4 rounded-lg border border-galileo-border">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="notifications-enabled" className="cursor-pointer">{t('enableNotifications')}</Label>
                <Switch 
                  id="notifications-enabled" 
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={() => handleSwitchChange('notificationsEnabled')}
                />
              </div>
              
              {preferences.notificationsEnabled && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-recurring-badges" className="cursor-pointer">{t('showRecurringIndicator')}</Label>
                    <Switch 
                      id="show-recurring-badges" 
                      checked={preferences.showRecurringBadges}
                      onCheckedChange={() => handleSwitchChange('showRecurringBadges')}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-galileo-text mb-2 flex items-center">
              <DollarSign size={18} className="mr-2" /> {t('currency')}
            </h2>
            <div className="bg-galileo-card p-4 rounded-lg border border-galileo-border">
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">{t('currency')}</Label>
                <RadioGroup 
                  value={preferences.currency} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-2 bg-galileo-background p-2 rounded border border-galileo-border flex-1 justify-center">
                    <RadioGroupItem value="BRL" id="currency-brl" />
                    <Label htmlFor="currency-brl" className="cursor-pointer">R$ (Real)</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-galileo-background p-2 rounded border border-galileo-border flex-1 justify-center">
                    <RadioGroupItem value="USD" id="currency-usd" />
                    <Label htmlFor="currency-usd" className="cursor-pointer">$ (Dólar)</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-galileo-background p-2 rounded border border-galileo-border flex-1 justify-center">
                    <RadioGroupItem value="EUR" id="currency-eur" />
                    <Label htmlFor="currency-eur" className="cursor-pointer">€ (Euro)</Label>
                  </div>
                </RadioGroup>
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
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-galileo-text mb-2 flex items-center">
              <Calendar size={18} className="mr-2" /> {t('startOfWeek')}
            </h2>
            <div className="bg-galileo-card p-4 rounded-lg border border-galileo-border">
              <div>
                <RadioGroup 
                  value={preferences.weekStartsOn} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, weekStartsOn: value }))}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-2 bg-galileo-background p-2 rounded border border-galileo-border flex-1 justify-center">
                    <RadioGroupItem value="monday" id="week-monday" />
                    <Label htmlFor="week-monday" className="cursor-pointer">{t('monday')}</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-galileo-background p-2 rounded border border-galileo-border flex-1 justify-center">
                    <RadioGroupItem value="sunday" id="week-sunday" />
                    <Label htmlFor="week-sunday" className="cursor-pointer">{t('sunday')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-galileo-text mb-2 flex items-center">
              <Languages size={18} className="mr-2" /> {t('language')}
            </h2>
            <div className="bg-galileo-card p-4 rounded-lg border border-galileo-border">
              <div>
                <RadioGroup 
                  value={preferences.language} 
                  onValueChange={handleLanguageChange}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-2 bg-galileo-background p-2 rounded border border-galileo-border flex-1 justify-center">
                    <RadioGroupItem value="pt-BR" id="lang-ptbr" />
                    <Label htmlFor="lang-ptbr" className="cursor-pointer">Português</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-galileo-background p-2 rounded border border-galileo-border flex-1 justify-center">
                    <RadioGroupItem value="en-US" id="lang-enus" />
                    <Label htmlFor="lang-enus" className="cursor-pointer">English</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          
          <div className="pt-2 pb-8">
            <Button 
              onClick={handleSavePreferences}
              className="w-full bg-galileo-accent hover:bg-galileo-accent/80 text-white"
            >
              <Save size={16} className="mr-2" /> {t('savePreferences')}
            </Button>
          </div>
        </div>
      </div>
      
      <NavBar />
    </div>
  );
};

export default PreferencesPage;
