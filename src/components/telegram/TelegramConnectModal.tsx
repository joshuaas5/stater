import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const generateCode = async () => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      console.log('🔧 [TELEGRAM] Gerando código para usuário:', user.id);
      
      const response = await fetch('/api/telegram-codes-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.username || user.email?.split('@')[0] || 'Usuário'
        })
      });

      console.log('🔧 [TELEGRAM] Resposta da API:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [TELEGRAM] Erro da API:', errorData);
        throw new Error(errorData.details || errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [TELEGRAM] Código gerado com sucesso');
      setGeneratedCode(data.code);
      
      // Copiar automaticamente para clipboard
      await navigator.clipboard.writeText(data.code);
      setIsCodeCopied(true);
      
    } catch (err: any) {
      console.error('❌ [TELEGRAM] Erro completo:', err);
      setError(`Erro ao gerar código: ${err.message || 'Tente novamente.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const testDebugAPI = async () => {
    console.log('🔧 [DEBUG] Testando API de debug...');
    
    try {
      const response = await fetch('/api/telegram-debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          userEmail: user?.email,
          userName: 'Test User'
        })
      });

      const data = await response.json();
      console.log('🔧 [DEBUG] Resposta da API Debug:', data);
      
      if (data.success) {
        console.log('✅ [DEBUG] Todos os testes passaram!');
        if (data.code) {
          setGeneratedCode(data.code);
          await navigator.clipboard.writeText(data.code);
          setIsCodeCopied(true);
        }
      } else {
        console.error('❌ [DEBUG] Falha nos testes:', data);
        setError(`Debug Error: ${data.error} - ${JSON.stringify(data.details)}`);
      }
    } catch (err: any) {
      console.error('❌ [DEBUG] Erro na API debug:', err);
      setError(`Debug API Error: ${err.message}`);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Conectar ao Telegram</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            🚀 <strong>Conecte-se ao Stater IA via Telegram!</strong>
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">✨ O que você pode fazer:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>📷 <strong>Enviar fotos</strong> de extratos, notas fiscais e PDFs</li>
              <li>💰 <strong>Registrar transações</strong> por voz ou texto</li>
              <li>📊 <strong>Consultar saldo</strong> e situação financeira</li>
              <li>🧾 <strong>Verificar contas</strong> a pagar e vencimentos</li>
              <li>💡 <strong>Pedir dicas</strong> e conselhos financeiros</li>
              <li>🔍 <strong>Fazer qualquer pergunta</strong> sobre suas finanças</li>
            </ul>
            <p className="text-xs text-blue-700 mt-2 font-medium">
              Stater - Inteligência para prosperar 🎯
            </p>
          </div>
          
          <p className="text-sm text-gray-700 mb-3 font-medium">
            📱 Como conectar:
          </p>
          <ol className="text-sm text-gray-700 space-y-2 mb-4">
            <li>1. Clique em <strong>"Gerar Código"</strong> abaixo</li>
            <li>2. O código será copiado automaticamente</li>
            <li>3. Clique em <strong>"Abrir Bot"</strong> para ir ao Telegram</li>
            <li>4. <strong>Cole o código</strong> no chat com o bot</li>
            <li>5. Pronto! Sua conta estará conectada ✅</li>
          </ol>
        </div>

        {!generatedCode ? (
          <div className="space-y-3">
            <button
              onClick={generateCode}
              disabled={isGenerating}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Gerando código...
                </div>
              ) : (
                '🔑 Gerar Código de 6 Dígitos'
              )}
            </button>
            
            {/* Botão temporário para debug */}
            <button
              onClick={testDebugAPI}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              🔧 TESTAR API DEBUG (TEMPORÁRIO)
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm text-blue-600 font-medium mb-2">Seu código:</p>
                <div className="text-2xl font-mono font-bold text-blue-800 tracking-widest mb-3">
                  {generatedCode}
                </div>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  {isCodeCopied ? (
                    <>
                      <Check size={16} />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copiar código
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <button
              onClick={openTelegramBot}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              📱 Abrir Bot do Telegram
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
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
          
          <p className="text-gray-500">
            ⏰ O código expira em 15 minutos
          </p>
        </div>
      </div>
    </div>
  );
};
