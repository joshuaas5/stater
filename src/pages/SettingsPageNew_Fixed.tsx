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

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado da aba ativa
  const [activeTab, setActiveTab] = useState('telegram');
  
  // Estados para Telegram
  const [telegramLinkCode, setTelegramLinkCode] = useState<string>('');
  const [isTelegramLinked, setIsTelegramLinked] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [telegramInfo, setTelegramInfo] = useState<any>(null);

  // Conectar ao Telegram de forma ULTRA simples
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
    try {
      const { error } = await supabase
        .from('telegram_users')
        .delete()
        .eq('user_id', user?.id);
      
      setIsTelegramLinked(false);
      setTelegramInfo(null);
      
      toast({
        title: "Desconectado",
        description: "Sua conta Telegram foi desvinculada com sucesso."
      });
    } catch (error) {
      console.error('Erro ao desvincular:', error);
    }
  };

  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        const userPrefs = getUserPreferences(user.id);
        setPreferences(userPrefs);
      }
      setIsLoading(false);
    };

    // Verificar status do Telegram
    const fetchTelegramInfo = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('telegram_users')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Erro ao verificar Telegram:', error);
            setIsTelegramLinked(false);
            setTelegramInfo(null);
          } else {
            setTelegramInfo(data);
            setIsTelegramLinked(true);
          }
        } catch (error) {
          setIsTelegramLinked(false);
          setTelegramInfo(null);
        }
      }
    };

    loadPreferences();
    fetchTelegramInfo();
  }, [user]);

  const handleSavePreferences = (updatedPreferences: UserPreferences) => {
    if (user) {
      saveUserPreferences(user.id, updatedPreferences);
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
        </div>

        {/* Sistema de abas simplificado */}
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
              onClick={() => setActiveTab('telegram')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center bg-blue-50 px-4 rounded-t-lg ${
                activeTab === 'telegram'
                  ? 'border-blue-500 text-blue-600 bg-blue-100'
                  : 'border-transparent text-blue-600 hover:text-blue-700 hover:border-blue-300'
              }`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              🚀 TELEGRAM 🚀
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
                    </Label>
                    <Switch
                      id="notifications-email"
                      checked={preferences?.notifications?.email || false}
                      onCheckedChange={(value) => updateNotificationPreference('email', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications-push" className="text-sm font-normal">
                      Notificações push
                    </Label>
                    <Switch
                      id="notifications-push"
                      checked={preferences?.notifications?.push || false}
                      onCheckedChange={(value) => updateNotificationPreference('push', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications-bills" className="text-sm font-normal">
                      Lembrete de contas
                    </Label>
                    <Switch
                      id="notifications-bills"
                      checked={preferences?.notifications?.bills || false}
                      onCheckedChange={(value) => updateNotificationPreference('bills', value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'telegram' && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <MessageCircle className="w-8 h-8 text-blue-600" />
                Integração com Telegram
              </CardTitle>
              <CardDescription className="text-lg">
                Conecte sua conta ao Telegram para usar o bot assistente financeiro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {isTelegramLinked ? (
                  // Conta já vinculada
                  <div className="space-y-6">
                    <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg">
                      <Check size={24} />
                      <span className="font-bold text-lg">Telegram conectado!</span>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="font-bold text-green-800 mb-3 text-lg">Sua conta está vinculada ✅</h4>
                      <p className="text-green-700 mb-4">
                        Você pode agora usar o bot do Telegram para interagir com seu assistente financeiro.
                      </p>
                      <div className="space-y-2 text-sm text-green-600">
                        {telegramInfo?.first_name && (
                          <p><strong>👤 Nome:</strong> {telegramInfo.first_name} {telegramInfo.last_name || ''}</p>
                        )}
                        {telegramInfo?.username && (
                          <p><strong>👤 Username:</strong> @{telegramInfo.username}</p>
                        )}
                        <p><strong>💬 Chat ID:</strong> {telegramInfo?.telegram_chat_id}</p>
                        <p><strong>📅 Vinculado em:</strong> {telegramInfo?.linked_at ? new Date(telegramInfo.linked_at).toLocaleString('pt-BR') : 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-bold text-lg">Como usar o bot:</h4>
                      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">📷</div>
                          <p><strong>Análise de extratos:</strong> Envie fotos de extratos bancários</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">💬</div>
                          <p><strong>Chat com IA:</strong> Faça perguntas sobre suas finanças</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">📊</div>
                          <p><strong>Relatórios:</strong> Solicite análises personalizadas</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">🔗</div>
                          <p><strong>Sincronização:</strong> Dados aparecem automaticamente no app</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => window.open('https://t.me/assistentefinanceiroiabot', '_blank')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6"
                        size="lg"
                      >
                        <MessageCircle size={20} className="mr-2" />
                        Abrir Bot Telegram
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={unlinkTelegram}
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        size="lg"
                      >
                        Desconectar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Conta não vinculada - Interface ULTRA simples
                  <div className="space-y-8">
                    <div className="text-center space-y-4">
                      <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                        <MessageCircle size={48} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                          Use o ICTUS no Telegram
                        </h3>
                        <p className="text-xl text-gray-600">
                          Acesse seu assistente financeiro em qualquer lugar
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-8">
                      <div className="grid grid-cols-2 gap-6 text-center">
                        <div className="space-y-3">
                          <div className="text-4xl">📷</div>
                          <p className="font-bold">Análise de Extratos</p>
                          <p className="text-sm text-gray-600">Envie foto → IA analisa → pronto!</p>
                        </div>
                        <div className="space-y-3">
                          <div className="text-4xl">💬</div>
                          <p className="font-bold">Chat com IA</p>
                          <p className="text-sm text-gray-600">Pergunte sobre suas finanças</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Button 
                        onClick={connectToTelegram}
                        disabled={isGeneratingCode}
                        size="lg"
                        className="w-full max-w-md mx-auto text-2xl py-8 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-xl transform hover:scale-105 transition-all"
                      >
                        {isGeneratingCode ? (
                          <span className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            Conectando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-3">
                            <MessageCircle size={28} />
                            🚀 CONECTAR AGORA 🚀
                          </span>
                        )}
                      </Button>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 rounded-full p-2 mt-1">
                          <Check size={20} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-green-800 mb-2 text-lg">É super fácil! ✨</p>
                          <p className="text-green-700 text-lg">
                            Clique no botão 👆 → o Telegram abre automaticamente → aperte "Iniciar" → pronto! 🎉
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'sync' && (
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
