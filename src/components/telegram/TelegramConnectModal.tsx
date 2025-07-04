import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';

interface TelegramConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (chatId: string) => void;
}

export const TelegramConnectModal: React.FC<TelegramConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect
}) => {
  const [chatId, setChatId] = useState('');

  const handleConnect = () => {
    if (chatId.trim()) {
      onConnect(chatId.trim());
      setChatId('');
    }
  };

  const handleClose = () => {
    setChatId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-gray-900">
            🤖 Conectar Telegram
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Instruções:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Abra o Telegram</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <div className="flex items-center gap-2">
                  <span>Procure:</span>
                  <code className="bg-blue-100 px-2 py-1 rounded font-mono text-xs">@stater</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => navigator.clipboard.writeText('@stater')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>Digite: <code className="bg-blue-100 px-1 rounded">/conectar</code></span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>Copie o número que aparece como "Chat ID"</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">5.</span>
                <span>Cole abaixo:</span>
              </li>
            </ol>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatId" className="text-sm font-medium">
              Chat ID do Telegram:
            </Label>
            <Input
              id="chatId"
              type="text"
              placeholder="Ex: 123456789"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!chatId.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Conectar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
