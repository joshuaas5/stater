
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
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-galileo-background border-t border-galileo-border">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite seus gastos ou receitas..."
        className="flex-1 p-3 rounded-full bg-galileo-card border border-galileo-border text-galileo-text focus:outline-none focus:ring-2 focus:ring-galileo-accent"
      />
      <Button 
        type="submit" 
        size="icon"
        className="bg-galileo-accent hover:bg-galileo-accent/80 text-white rounded-full"
      >
        <Send size={20} />
      </Button>
    </form>
  );
};

export default ChatInput;
