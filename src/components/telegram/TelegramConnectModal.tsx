import React, { useState } from 'react';
import { X } from 'lucide-react';

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
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Por favor, insira o código de 6 dígitos');
      return;
    }

    if (code.length !== 6) {
      setError('O código deve ter exatamente 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await onConnect(code);
      onClose();
      setCode('');
    } catch (err) {
      setError('Erro ao conectar. Verifique se o código está correto.');
    } finally {
      setIsLoading(false);
    }
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
            Para conectar sua conta ao Telegram:
          </p>
          <ol className="text-sm text-gray-700 space-y-2 mb-4">
            <li>1. Abra o Telegram e procure por: <strong>@assistentefinanceiroiabot</strong></li>
            <li>2. Inicie uma conversa com o bot</li>
            <li>3. Digite o comando: <strong>/conectar</strong></li>
            <li>4. O bot enviará um código de 6 dígitos</li>
            <li>5. Digite o código abaixo:</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Código de 6 dígitos
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? 'Conectando...' : 'Conectar'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500">
          <p>
            <strong>Dica:</strong> Se não encontrar o bot, verifique se digitou corretamente: 
            @assistentefinanceiroiabot
          </p>
        </div>
      </div>
    </div>
  );
};
