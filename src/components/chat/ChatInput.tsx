
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSubmit: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit }) => {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  
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
    
    onSubmit(message);
    setMessage('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-galileo-background border-t border-galileo-border">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite seus gastos ou receitas..."
        className="input-chat flex-1"
      />
      <Button 
        type="submit" 
        size="icon"
        className="bg-galileo-accent hover:bg-galileo-secondaryText text-galileo-text"
      >
        <Send size={20} />
      </Button>
    </form>
  );
};

export default ChatInput;
