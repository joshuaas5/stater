import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { getCurrentUser } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  Shield,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TelegramSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user] = useState(getCurrentUser());
  const [linkCode, setLinkCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [telegramInfo, setTelegramInfo] = useState<any>(null);

  useEffect(() => {
    checkTelegramConnection();
  }, []);

  const checkTelegramConnection = async () => {
    if (!user) return;
    
    try {
      // Verificar se usuário já está conectado
      const { data: telegramUser, error } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();
      
      if (telegramUser && !error) {
        setIsConnected(true);
        setTelegramInfo(telegramUser);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
    }
  };

  const generateLinkCode = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Invalidar códigos antigos primeiro
      await supabase
        .from('telegram_link_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('used_at', null);

      // Gerar código único (formato mais simples: 6 dígitos)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expira em 15 minutos
      
      // Salvar no Supabase
      const { error } = await supabase
        .from('telegram_link_codes')
        .insert({
          code: code,
          user_id: user.id,
          user_email: user.email,
          user_name: user.username,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      setLinkCode(code);
      
      // 🔥 CÓPIA AUTOMÁTICA DO CÓDIGO
      try {
        await navigator.clipboard.writeText(code);
        toast({
          title: '✅ Código copiado automaticamente!',
          description: `Código ${code} foi copiado. Cole no Telegram para conectar.`,
          variant: 'default',
        });
      } catch (clipboardError) {
        // Se falhar na cópia automática, avisar o usuário
        toast({
          title: 'Código gerado!',
          description: `Código: ${code}. Clique no botão "Copiar" para usar no Telegram.`,
          variant: 'default',
        });
      }
      
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      toast({
        title: 'Erro ao gerar código',
        description: 'Tente novamente em alguns segundos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyLinkCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(linkCode);
      toast({
        title: 'Código copiado!',
        description: 'Cole no Telegram para conectar.',
        variant: 'default',
      });
    }
  };

  const disconnectTelegram = async () => {
    if (!user || !telegramInfo) return;
    
    try {
      // Desativar conexão
      const { error } = await supabase
        .from('telegram_users')
        .update({ is_active: false })
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      setIsConnected(false);
      setTelegramInfo(null);
      
      toast({
        title: 'Desconectado do Telegram',
        description: 'Sua conta foi desconectada com sucesso.',
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast({
        title: 'Erro ao desconectar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
  };

  const openTelegram = () => {
    // Tentar abrir o Telegram
    const telegramUrl = 'https://t.me/assistentefinanceiroiabot';
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="bg-galileo-background min-h-screen flex flex-col items-center pb-20">
      <div className="w-full max-w-md p-4 space-y-6">
        
        {/* Header personalizado */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/preferences')}
            className="p-2 hover:bg-galileo-card rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-galileo-text" />
          </button>
          <h1 className="text-lg font-semibold text-galileo-text">Bot Telegram</h1>
          <div className="w-9 h-9" /> {/* Spacer */}
        </div>

        {/* Status da conexão */}
        <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle size={24} className="text-blue-500" />
            <div>
              <h2 className="text-base font-semibold text-galileo-text">
                Status da Conexão
              </h2>
              <p className="text-sm text-galileo-secondaryText">
                {isConnected ? 'Conectado ao Telegram' : 'Não conectado'}
              </p>
            </div>
            {isConnected ? (
              <CheckCircle size={20} className="text-green-500 ml-auto" />
            ) : (
              <AlertCircle size={20} className="text-orange-500 ml-auto" />
            )}
          </div>
          
          {isConnected && telegramInfo && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800 mb-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Conectado como:</strong> {telegramInfo.user_name}<br/>
                <strong>Data de conexão:</strong> {new Date(telegramInfo.linked_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Seção de conexão */}
        {!isConnected ? (
          <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5">
            <h2 className="text-base font-semibold text-galileo-text mb-4 flex items-center">
              <Smartphone size={18} className="mr-2" /> Como Conectar
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-medium text-galileo-text mb-2">📱 Passo a Passo:</h3>
                <ol className="text-sm text-galileo-secondaryText space-y-2">
                  <li>1. Gere um código de vinculação abaixo</li>
                  <li>2. Clique em "Abrir Bot Telegram"</li>
                  <li>3. Cole o código no bot do Telegram</li>
                  <li>4. Pronto! Sua conta estará conectada</li>
                </ol>
              </div>
              
              <Button 
                onClick={openTelegram}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <MessageCircle size={16} className="mr-2" /> Abrir Bot Telegram
              </Button>
              
              <div className="border-t border-galileo-border pt-4">
                <h4 className="font-medium text-galileo-text mb-2">🔐 Código de Vinculação</h4>
                
                {linkCode ? (
                  <div className="bg-galileo-background p-3 rounded-lg border border-galileo-border">
                    <div className="flex items-center justify-between">
                      <code className="text-lg font-mono font-bold text-galileo-accent">
                        {linkCode}
                      </code>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={copyLinkCode}
                      >
                        <Copy size={14} className="mr-1" /> Copiar
                      </Button>
                    </div>
                    <p className="text-xs text-galileo-secondaryText mt-2">
                      ⏰ Este código expira em 15 minutos
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={generateLinkCode}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading ? 'Gerando...' : 'Gerar Código de Vinculação'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5">
            <h2 className="text-base font-semibold text-galileo-text mb-4 flex items-center">
              <Zap size={18} className="mr-2" /> Recursos Disponíveis
            </h2>
            
            <div className="space-y-3">
              <div className="bg-galileo-background p-3 rounded-lg border border-galileo-border">
                <h4 className="font-medium text-galileo-text">📸 Análise de Extratos</h4>
                <p className="text-sm text-galileo-secondaryText">
                  Envie fotos dos seus extratos bancários para análise automática
                </p>
              </div>
              
              <div className="bg-galileo-background p-3 rounded-lg border border-galileo-border">
                <h4 className="font-medium text-galileo-text">💬 Chat Inteligente</h4>
                <p className="text-sm text-galileo-secondaryText">
                  Converse sobre suas finanças e receba insights personalizados
                </p>
              </div>
              
              <div className="bg-galileo-background p-3 rounded-lg border border-galileo-border">
                <h4 className="font-medium text-galileo-text">🔔 Notificações</h4>
                <p className="text-sm text-galileo-secondaryText">
                  Receba alertas sobre contas vencendo e transações importantes
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-galileo-border mt-4">
              <Button 
                onClick={disconnectTelegram}
                variant="outline"
                className="w-full border-red-500 text-red-500 hover:bg-red-50"
              >
                Desconectar do Telegram
              </Button>
            </div>
          </div>
        )}

        {/* Seção de segurança */}
        <div className="rounded-xl shadow-md bg-white dark:bg-galileo-card border border-galileo-border p-5">
          <h2 className="text-base font-semibold text-galileo-text mb-4 flex items-center">
            <Shield size={18} className="mr-2" /> Segurança & Privacidade
          </h2>
          
          <div className="space-y-3 text-sm text-galileo-secondaryText">
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Seus dados financeiros são criptografados</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Códigos de vinculação expiram automaticamente</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Você pode desconectar a qualquer momento</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span>Nenhum dado é compartilhado com terceiros</span>
            </div>
          </div>
        </div>

      </div>
      <NavBar />
    </div>
  );
};

export default TelegramSettingsPage;
