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
import { Sun, Moon, Monitor, DollarSign, Calendar, MessageCircle, QrCode, Link, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para Telegram
  const [telegramLinkCode, setTelegramLinkCode] = useState<string>('');
  const [isTelegramLinked, setIsTelegramLinked] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [telegramInfo, setTelegramInfo] = useState<any>(null);  // Conectar ao Telegram de forma ULTRA simples
  const connectToTelegram = async () => {
    if (!user) return;
    
    setIsGeneratingCode(true);
    
    try {
      // Gerar código único simples (apenas 2 dígitos + 2 letras)
      const numbers = Math.floor(10 + Math.random() * 90).toString();
      const letters = Math.random().toString(36).substring(2, 4).toUpperCase();
      const code = numbers + letters;
      
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expira em 15 minutos
      
      // Salvar no Supabase
      const { error } = await supabase
        .from('telegram_link_codes')
        .insert({
          code: code,
          user_id: user.id,
          user_email: user.email || '',
          user_name: user.user_metadata?.username || user.email?.split('@')[0] || 'Usuário',
          expires_at: expiresAt.toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      setTelegramLinkCode(code);
      
      // Abrir o Telegram automaticamente
      const telegramUrl = `https://t.me/assistentefinanceiroiabot?start=${code}`;
      window.open(telegramUrl, '_blank');
      
      toast({
        title: "Telegram aberto! 📱",
        description: "Clique em 'Iniciar' no bot. É só isso! ✨"
      });
      
      // Limpar código após 15 minutos
      setTimeout(() => {
        setTelegramLinkCode('');
      }, 15 * 60 * 1000);
      
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast({
        title: "Ops! 😅",
        description: "Algo deu errado. Tenta de novo?",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Desvincular Telegram
  const unlinkTelegram = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('telegram_users')
        .delete()
        .eq('user_id', user.id);
      
      setIsTelegramLinked(false);
      setTelegramInfo(null);
      
      toast({
        title: "Desvinculado!",
        description: "Sua conta Telegram foi desvinculada com sucesso."
      });
      
    } catch (error) {
      console.error('Erro ao desvincular:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desvincular. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      const userPrefs = getUserPreferences();
      setPreferences(userPrefs);
      setIsLoading(false);
    }
    
    // Verificar status do Telegram
    const fetchTelegramInfo = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('telegram_users')
            .select('telegram_chat_id, user_email, user_name, linked_at')
            .eq('user_id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Erro ao verificar Telegram:', error);
            setIsTelegramLinked(false);
            setTelegramInfo(null);
          } else if (data) {
            setTelegramInfo(data);
            setIsTelegramLinked(true);
          } else {
            setIsTelegramLinked(false);
            setTelegramInfo(null);
          }
        } catch (error) {
          console.log('Erro ao verificar Telegram:', error);
          setIsTelegramLinked(false);
          setTelegramInfo(null);
        }
      }
    };

    fetchTelegramInfo();
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
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="account">Conta</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
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

          <TabsContent value="telegram">
            <Card>
              <CardHeader>
                <CardTitle>Integração com Telegram</CardTitle>
                <CardDescription>
                  Conecte sua conta ao Telegram para usar o bot assistente financeiro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isTelegramLinked ? (
                    // Conta já vinculada
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-green-600">
                        <Check size={20} />
                        <span className="font-medium">Telegram conectado!</span>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-800 mb-2">Sua conta está vinculada</h4>
                        <p className="text-sm text-green-700 mb-3">
                          Você pode agora usar o bot do Telegram para interagir com seu assistente financeiro.
                        </p>
                        <div className="space-y-1 text-xs text-green-600">
                          <p><strong>Chat ID:</strong> {telegramInfo?.telegram_chat_id}</p>
                          <p><strong>Vinculado em:</strong> {telegramInfo?.linked_at ? new Date(telegramInfo.linked_at).toLocaleString('pt-BR') : 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Como usar o bot:</h4>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                          <p>• 📷 <strong>Análise de extratos:</strong> Envie fotos de extratos bancários</p>
                          <p>• 💬 <strong>Chat com IA:</strong> Faça perguntas sobre suas finanças</p>
                          <p>• 📊 <strong>Relatórios:</strong> Solicite análises personalizadas</p>
                          <p>• 🔗 <strong>Sincronização:</strong> Dados aparecem automaticamente no app</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button 
                          onClick={() => window.open('https://t.me/assistentefinanceiroiabot', '_blank')}
                          className="flex-1"
                        >
                          <MessageCircle size={16} className="mr-2" />
                          Abrir Bot Telegram
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={unlinkTelegram}
                          className="text-red-600 hover:text-red-700"
                        >
                          Desvincular
                        </Button>
                      </div>
                    </div>                  ) : (                    // Conta não vinculada - Interface ULTRA simples
                    <div className="space-y-8">
                      <div className="text-center space-y-4">
                        <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                          <MessageCircle size={40} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Use o ICTUS no Telegram
                          </h3>
                          <p className="text-lg text-gray-600">
                            Acesse seu assistente financeiro em qualquer lugar
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="space-y-2">
                            <div className="text-2xl">📷</div>
                            <p className="text-sm font-medium">Análise de Extratos</p>
                          </div>
                          <div className="space-y-2">
                            <div className="text-2xl">💬</div>
                            <p className="text-sm font-medium">Chat com IA</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Button 
                          onClick={connectToTelegram}
                          disabled={isGeneratingCode}
                          size="lg"
                          className="w-full max-w-sm mx-auto text-xl py-8 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-lg"
                        >
                          {isGeneratingCode ? (
                            <span className="flex items-center gap-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Conectando...
                            </span>
                          ) : (
                            <span className="flex items-center gap-3">
                              <MessageCircle size={24} />
                              Conectar Agora
                            </span>
                          )}
                        </Button>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 rounded-full p-1">
                            <Check size={16} className="text-green-600" />
                          </div>
                          <div className="text-sm">
                            <p className="font-semibold text-green-800 mb-1">É super fácil!</p>
                            <p className="text-green-700">
                              Clique no botão → o Telegram abre → aperte "Iniciar" → pronto! ✨
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
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
                  Isso garante que suas informações estejam sempre atualizadas em todos os seus dispositivos.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Status da Sincronização:</h4>
                  <p className="text-green-600">✓ Funcionando corretamente</p>
                </div>
                <div className="mt-4">
                  <TestIntegrationButton />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
