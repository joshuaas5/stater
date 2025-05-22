import React, { useState, useEffect } from 'react';
import TestIntegrationButton from '@/components/TestIntegrationButton';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPreferences, saveUserPreferences, UserPreferences } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Sun, Moon, Monitor, DollarSign, Calendar } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const userPrefs = getUserPreferences();
      setPreferences(userPrefs);
      setIsLoading(false);
    }
  }, [user]);

  const handleSavePreferences = () => {
    if (preferences) {
      saveUserPreferences(preferences);
      toast({
        title: 'Preferências salvas',
        description: 'Suas preferências foram salvas com sucesso.',
      });
    }
  };

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setPreferences(prev => prev ? { ...prev, theme: value } : null);
  };

  const handleCurrencyChange = (value: string) => {
    setPreferences(prev => prev ? { ...prev, currency: value } : null);
  };

  const handleDateFormatChange = (value: string) => {
    setPreferences(prev => prev ? { ...prev, dateFormat: value } : null);
  };

  const handleNotificationChange = (key: 'billsDueSoon' | 'largeTransactions', value: boolean) => {
    setPreferences(prev => prev ? {
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    } : null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="my-8">
        <h1 className="text-3xl font-bold mb-4">
          Configurações
        </h1>
        <hr className="mb-8" />

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="sync">Sincronização</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
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
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium">ID</span>
                      <span className="text-sm text-muted-foreground font-mono">{user.id}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Você precisa estar logado para ver suas informações.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Usuário</CardTitle>
                <CardDescription>
                  Personalize sua experiência no aplicativo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Carregando preferências...</p>
                ) : preferences ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Aparência</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div 
                          className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${preferences.theme === 'light' ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={() => handleThemeChange('light')}
                        >
                          <Sun size={24} />
                          <span>Claro</span>
                        </div>
                        <div 
                          className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${preferences.theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={() => handleThemeChange('dark')}
                        >
                          <Moon size={24} />
                          <span>Escuro</span>
                        </div>
                        <div 
                          className={`p-4 rounded-lg border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${preferences.theme === 'system' ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={() => handleThemeChange('system')}
                        >
                          <Monitor size={24} />
                          <span>Sistema</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Moeda</h3>
                      <Select
                        value={preferences.currency}
                        onValueChange={handleCurrencyChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione uma moeda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                          <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Formato de Data</h3>
                      <Select
                        value={preferences.dateFormat}
                        onValueChange={handleDateFormatChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um formato de data" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                          <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                          <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Notificações</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="billsDueSoon">Contas a vencer em breve</Label>
                            <p className="text-sm text-muted-foreground">Receba notificações sobre contas que vencem nos próximos dias</p>
                          </div>
                          <Switch
                            id="billsDueSoon"
                            checked={preferences.notifications.billsDueSoon}
                            onCheckedChange={(value) => handleNotificationChange('billsDueSoon', value)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="largeTransactions">Transações de grande valor</Label>
                            <p className="text-sm text-muted-foreground">Receba notificações sobre transações com valores acima do normal</p>
                          </div>
                          <Switch
                            id="largeTransactions"
                            checked={preferences.notifications.largeTransactions}
                            onCheckedChange={(value) => handleNotificationChange('largeTransactions', value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Erro ao carregar preferências.</p>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePreferences} disabled={isLoading || !preferences}>Salvar Preferências</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="sync">
            <Card>
              <CardHeader>
                <CardTitle>Sincronização de Dados</CardTitle>
                <CardDescription>
                  Gerencie como seus dados são sincronizados entre dispositivos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Seus dados são sincronizados automaticamente com o Supabase sempre que você realiza uma operação.
                  Isso permite que você acesse seus dados de qualquer dispositivo em que esteja logado.
                </p>
                
                <TestIntegrationButton />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
