
import React, { useState } from 'react';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const PreferencesPage: React.FC = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(() => {
    const theme = localStorage.getItem("theme");
    return theme === "dark";
  });
  const [currency, setCurrency] = useState('BRL');
  const [language, setLanguage] = useState('pt-BR');
  
  const handleSave = () => {
    // Save preferences to localStorage
    localStorage.setItem('currency', currency);
    localStorage.setItem('language', language);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    
    toast({
      title: "Preferências salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Preferências" />
      
      <div className="p-4 space-y-6">
        <div className="bg-galileo-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-galileo-text mb-4">Aparência</h2>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-galileo-text">
              Modo Escuro
            </Label>
            <Switch 
              id="dark-mode" 
              checked={darkMode} 
              onCheckedChange={(checked) => setDarkMode(checked)}
            />
          </div>
        </div>
        
        <div className="bg-galileo-card p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-galileo-text mb-4">Regional</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-galileo-text">Moeda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Selecione uma moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">Libra Esterlina (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language" className="text-galileo-text">Idioma</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Selecione um idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleSave}
          className="w-full bg-galileo-accent hover:bg-galileo-accent/80"
        >
          Salvar Preferências
        </Button>
      </div>
      
      <NavBar />
    </div>
  );
};

export default PreferencesPage;
