import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface TelegramConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (code: string) => void;
}

export const TelegramConnectModal: React.FC<TelegramConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [error, setError] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const { user } = useAuth();

  // Função para logs apenas em desenvolvimento
  const logDebug = (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log(message, data);
    }
  };

  // Validar HTTPS obrigatório (exceto localhost)
  useEffect(() => {
    if (typeof window !== 'undefined' && 
        window.location.protocol !== 'https:' && 
        window.location.hostname !== 'localhost') {
      setError('Esta aplicação deve ser acessada via HTTPS por motivos de segurança.');
    }
  }, []);

  // Sistema de polling para detectar conexão automática
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;
    
    if (isOpen && generatedCode && user?.id && !isPolling) {
      setIsPolling(true);
      logDebug('🔄 [TELEGRAM] Iniciando polling para detectar conexão...');
      
      const checkConnection = async () => {
        try {
          const { supabase } = await import('@/lib/supabase');
          const { data, error } = await supabase
            .from('telegram_users')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true);
          
          if (data && data.length > 0) {
            logDebug('✅ [TELEGRAM] Conexão detectada automaticamente!', data[0]);
            clearInterval(pollingInterval);
            setIsPolling(false);
            onConnect(generatedCode);
            return;
          }
        } catch (error) {
          logDebug('❌ [TELEGRAM] Erro no polling:', error);
        }
      };
      
      // Verificar a cada 3 segundos por até 10 minutos
      pollingInterval = setInterval(checkConnection, 3000);
      
      // Cleanup após 10 minutos
      setTimeout(() => {
        clearInterval(pollingInterval);
        setIsPolling(false);
        logDebug('⏰ [TELEGRAM] Polling finalizado por timeout');
      }, 600000); // 10 minutos
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setIsPolling(false);
      }
    };
  }, [isOpen, generatedCode, user?.id, onConnect]);

  // Limpar polling quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setIsPolling(false);
      setGeneratedCode('');
      setIsCodeCopied(false);
      setError('');
    }
  }, [isOpen]);

  const generateCode = async () => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    // 🔥 TIMEOUT - Configurar abort controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
    
    try {
      logDebug('🔧 [TELEGRAM] Gerando código para usuário:', user.id);
      logDebug('🔧 [TELEGRAM] Dados completos do usuário:', user);
      
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Token de autenticação não encontrado');
        return;
      }
      
      const requestBody = {
        user_id: user.id,
        userEmail: user.email,
        userName: user.user_metadata?.username || user.email?.split('@')[0] || 'Usuário'
      };
      
      logDebug('🔧 [TELEGRAM] Body da requisição:', requestBody);
      
      const response = await fetch('/api/telegram-codes-clean', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      logDebug('🔧 [TELEGRAM] Resposta da API:', { status: response.status, statusText: response.statusText });

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: 'Erro no servidor. Tente novamente.' };
          }
        } else {
          errorData = { error: 'Erro no servidor. Tente novamente.' };
        }
        
        logDebug('❌ [TELEGRAM] Erro da API:', errorData);
        throw new Error(errorData.details || errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logDebug('✅ [TELEGRAM] Código gerado com sucesso');
      setGeneratedCode(data.code);
      
      // Copiar automaticamente para clipboard
      if (document.hasFocus()) {
        await navigator.clipboard.writeText(data.code);
        setIsCodeCopied(true);
      } else {
        // Se o documento não estiver focado, não tente copiar,
        // apenas mostre o código para o usuário copiar manualmente.
        console.warn('[TELEGRAM] Document not focused, skipping automatic copy to clipboard.');
      }
      
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        setError('Tempo limite esgotado. Tente novamente.');
      } else {
        logDebug('❌ [TELEGRAM] Erro completo:', err);
        setError(`Erro ao gerar código: ${err.message || 'Tente novamente.'}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 2000);
    }
  };

  const openTelegramBot = () => {
    window.open('https://t.me/assistentefinanceiroiabot', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Conectar ao Telegram</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-4 py-3 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              🚀 <strong>Conecte-se ao Stater IA!</strong>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-xs text-blue-800 mb-2 font-medium">✨ O que você pode fazer:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>� Ver saldo e transações</li>
                <li>� Enviar foto do extrato</li>
                <li>� Fazer perguntas sobre dinheiro</li>
                <li>💰 Registrar transações por voz</li>
              </ul>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-700 mb-2 font-medium">📱 Como conectar:</p>
            <ol className="text-xs text-gray-600 space-y-1 mb-3">
              <li>1. Clique em "Gerar Código"</li>
              <li>2. Vá ao bot do Telegram</li>
              <li>3. Cole o código no chat</li>
              <li>4. Pronto! ✅</li>
            </ol>
          </div>

        {!generatedCode ? (
          <div className="space-y-3">
            <button
              onClick={generateCode}
              disabled={isGenerating}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Gerando...
                </div>
              ) : (
                '🔑 Gerar Código'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-center">
                <p className="text-xs text-blue-600 font-medium mb-2">Seu código:</p>
                <div className="text-xl font-mono font-bold text-blue-800 tracking-widest mb-2">
                  {generatedCode}
                </div>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  {isCodeCopied ? (
                    <>
                      <Check size={14} />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copiar
                    </>
                  )}
                </button>
                
                {isPolling && (
                  <div className="mt-2 flex items-center justify-center gap-2 text-xs text-green-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-green-600 border-t-transparent"></div>
                    Aguardando conexão...
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={openTelegramBot}
              className="w-full px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm"
            >
              📱 Abrir Bot do Telegram
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              Fechar
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-600">
          <p className="font-semibold mb-2">
            <strong>Bot:</strong> @assistentefinanceiroiabot
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
            <p className="font-semibold text-gray-700 mb-2">💬 Exemplos de como usar:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• "Registrei uma compra de R$ 45 no mercado"</li>
              <li>• "Qual meu saldo atual?"</li>
              <li>• "Tenho contas para pagar hoje?"</li>
              <li>• "Como posso economizar mais?"</li>
              <li>• Envie fotos de extratos ou notas fiscais 📷</li>
            </ul>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            ⏰ O código expira em 15 minutos
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};
