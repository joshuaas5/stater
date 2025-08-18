import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import { getCurrentUser } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TelegramConnectModal } from '@/components/telegram/TelegramConnectModal';
import { UserPlanManager } from '@/utils/userPlanManager';
import { PaywallModal } from '@/components/ui/PaywallModal';
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
  const [isConnected, setIsConnected] = useState(false);
  const [telegramInfo, setTelegramInfo] = useState<any>(null);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [userPlan, setUserPlan] = useState<any>(null);
  // Estados removidos - agora usando TelegramConnectModal
  // const [linkCode, setLinkCode] = useState('');
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkTelegramConnection();
    checkUserPlan();
  }, []);

  const checkUserPlan = async () => {
    if (!user?.id) return;
    
    try {
      const plan = await UserPlanManager.getUserPlan(user.id);
      setUserPlan(plan);
      console.log('📋 [TELEGRAM_PAGE] Plano do usuário:', plan);
    } catch (error) {
      console.error('❌ [TELEGRAM_PAGE] Erro ao verificar plano:', error);
    }
  };

  const checkTelegramConnection = async () => {
    if (!user) return;
    
    try {
      console.log('🔍 Verificando conexão Telegram para usuário:', user.id);
      
      // Verificar se usuário já está conectado (sem .single() para evitar erro 406)
      const { data: telegramUsers, error } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      console.log('📊 Resultado da consulta:', { 
        error: error?.message, 
        count: telegramUsers?.length, 
        data: telegramUsers 
      });
      
      if (telegramUsers && telegramUsers.length > 0 && !error) {
        console.log('✅ Conexão encontrada:', telegramUsers[0]);
        setIsConnected(true);
        setTelegramInfo(telegramUsers[0]); // Pega o primeiro registro
      } else {
        console.log('❌ Nenhuma conexão ativa encontrada');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
    }
  };

  const generateLinkCode = async () => {
    // 🔒 VERIFICAR PLANO ANTES DE ABRIR MODAL
    if (!user?.id) return;
    
    try {
      const plan = await UserPlanManager.getUserPlan(user.id);
      console.log('🔍 [TELEGRAM_PAGE] Verificando acesso - plano:', plan.planType);
      
      if (plan.planType === 'free') {
        console.log('❌ [TELEGRAM_PAGE] Usuário FREE tentando acessar - BLOQUEADO');
        setShowPaywall(true);
        return;
      }
      
      console.log('✅ [TELEGRAM_PAGE] Usuário premium - abrindo modal');
      setShowTelegramModal(true);
    } catch (error) {
      console.error('❌ [TELEGRAM_PAGE] Erro ao verificar plano:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao verificar seu plano. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Função removida - agora usando TelegramConnectModal
  // const copyLinkCode = () => { ... }

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
    <div className="min-h-screen relative overflow-hidden pb-20" style={{ background: '#31518b' }}>
      <div className="relative z-10 p-4">
        
        {/* Header personalizado */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/preferences')}
            className="p-2 text-white hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-white">Bot Telegram</h1>
          <div className="w-9 h-9" /> {/* Spacer */}
        </div>

        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Status da conexão */}
          <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-5">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle size={24} className="text-blue-400" />
              <div>
                <h2 className="text-base font-semibold text-white">
                  Status da Conexão
                </h2>
                <p className="text-sm text-white/70">
                  {isConnected ? 'Conectado ao Telegram' : 'Não conectado'}
                </p>
              </div>
              {isConnected ? (
                <CheckCircle size={20} className="text-green-400 ml-auto" />
              ) : (
                <AlertCircle size={20} className="text-orange-400 ml-auto" />
              )}
            </div>
            
            {isConnected && telegramInfo && (
              <div className="bg-green-500/20 backdrop-blur-[8px] p-3 rounded-lg border border-green-400/30 mb-4">
                <p className="text-sm text-green-200">
                  <strong>Conectado como:</strong> {telegramInfo.user_name}<br/>
                  <strong>Data de conexão:</strong> {new Date(telegramInfo.linked_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Seção de conexão */}
          {!isConnected ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-5">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center">
                <Smartphone size={18} className="mr-2" /> Como Conectar
              </h2>
              
              <div className="space-y-4">
                <div className="bg-blue-500/20 backdrop-blur-[8px] p-4 rounded-lg border border-blue-400/30">
                  <h3 className="font-medium text-white mb-2">📱 Passo a Passo:</h3>
                  <ol className="text-sm text-white/80 space-y-2">
                    <li>1. Gere um código de vinculação abaixo</li>
                    <li>2. Clique em "Abrir Bot Telegram"</li>
                    <li>3. Cole o código no bot do Telegram</li>
                    <li>4. Pronto! Sua conta estará conectada</li>
                  </ol>
                </div>
                
                <Button 
                  onClick={openTelegram}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white backdrop-blur-[8px]"
                >
                  <MessageCircle size={16} className="mr-2" /> Abrir Bot Telegram
                </Button>
                
                <div className="border-t border-white/20 pt-4">
                  <h4 className="font-medium text-white mb-2">🔐 Conectar Conta</h4>
                  
                  <Button 
                    onClick={generateLinkCode}
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    🔑 Gerar Código de Conexão
                  </Button>
                  
                  <p className="text-xs text-white/60 mt-2">
                    Clique para abrir o modal de conexão unificado
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-5">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center">
                <Zap size={18} className="mr-2" /> Recursos Disponíveis
              </h2>
              
              <div className="space-y-3">
                <div className="bg-white/5 backdrop-blur-[8px] p-3 rounded-lg border border-white/20">
                  <h4 className="font-medium text-white">📸 Análise de Extratos</h4>
                  <p className="text-sm text-white/70">
                    Envie fotos dos seus extratos bancários para análise automática
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-[8px] p-3 rounded-lg border border-white/20">
                  <h4 className="font-medium text-white">💬 Chat Inteligente</h4>
                  <p className="text-sm text-white/70">
                    Converse sobre suas finanças e receba insights personalizados
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-[8px] p-3 rounded-lg border border-white/20">
                  <h4 className="font-medium text-white">🔔 Notificações</h4>
                  <p className="text-sm text-white/70">
                    Receba alertas sobre contas vencendo e transações importantes
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/20 mt-4">
                <Button 
                  onClick={disconnectTelegram}
                  variant="outline"
                  className="w-full border-red-400 bg-white/5 backdrop-blur-[8px] text-red-400 hover:bg-red-400/10"
                >
                  Desconectar do Telegram
                </Button>
              </div>
            </div>
          )}

          {/* Seção de segurança */}
          <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center">
              <Shield size={18} className="mr-2" /> Segurança & Privacidade
            </h2>
            
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Seus dados financeiros são criptografados</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Códigos de vinculação expiram automaticamente</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Você pode desconectar a qualquer momento</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Nenhum dado é compartilhado com terceiros</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Modal unificado de conexão Telegram */}
      <TelegramConnectModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        onConnect={(code) => {
          // Callback chamado quando código é gerado
          setShowTelegramModal(false);
          // Recarregar status da conexão
          setTimeout(() => checkTelegramConnection(), 2000);
        }}
      />
      
      {/* Paywall para usuários FREE */}
      {user?.id && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          onUpgrade={(planType) => {
            console.log('Upgrade para:', planType);
            setShowPaywall(false);
          }}
          trigger="manual"
          userId={user.id}
        />
      )}
    </div>
  );
};

export default TelegramSettingsPage;
