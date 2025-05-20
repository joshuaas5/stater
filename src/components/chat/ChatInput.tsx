import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  loading: boolean;
  waitingConfirmation: boolean;
  pendingActionDetails: { description?: string; category?: string; type?: string; amount?: number; date?: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSubmit, 
  loading, 
  waitingConfirmation, 
  pendingActionDetails,
  onConfirm,
  onCancel 
}) => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Desfocar o input na montagem inicial para evitar foco automático no mobile
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, []);

  const processMessage = (msg: string): string => {
    // Process numeric inputs with "mil" to convert to thousands
    return msg.replace(/(\d+)\s*mil/gi, (match, number) => {
      return `${number}000`;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Digite algo para enviar",
        variant: "destructive"
      });
      return;
    }

    // Process the message before submitting
    const processedMessage = processMessage(message);

    onSubmit(processedMessage);
    setMessage('');
  };

  if (waitingConfirmation && pendingActionDetails) {
    return (
      <div className="p-3 border-t border-border bg-amber-50">
        <p className="text-sm text-center text-amber-700 mb-2">
          Confirmar ação: Registrar {pendingActionDetails.type || 'transação'} "<strong>{pendingActionDetails.description || pendingActionDetails.category}</strong>" de <strong>{pendingActionDetails.amount ? Math.abs(pendingActionDetails.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}</strong> {pendingActionDetails.date ? `em ${new Date(pendingActionDetails.date).toLocaleDateString('pt-BR')}` : ''}?
        </p>
        <div className="flex justify-center gap-3">
          {/* TODO: Consider adding a custom 'success' variant or specific green styling for this button */}
          <Button onClick={onConfirm} variant="default" size="sm" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? 'Confirmando...' : 'Sim, confirmar'}
          </Button>
          <Button onClick={onCancel} variant="destructive" size="sm" disabled={loading}>
            {loading ? 'Cancelando...' : 'Não, cancelar'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border bg-card">
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={loading ? "Processando..." : "Digite uma mensagem..."}
          className="w-full py-2.5 px-4 pr-10 rounded-full bg-muted border border-border text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all"
          disabled={loading || waitingConfirmation}
        />
      </div>
      <Button 
        type="submit" 
        size="icon"
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-md hover:shadow-lg transition-all duration-200 p-2.5"
        disabled={loading || waitingConfirmation || !message.trim()}
      >
        <Send size={18} />
      </Button>
    </form>
  );
};

export default ChatInput;
